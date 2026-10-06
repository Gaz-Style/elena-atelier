const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateReport() {
    // 1. Fetch all sales from September
    const { data: sepSales, error } = await supabase
        .from('sales_ledger')
        .select(`*, customers(full_name)`)
        .gte('created_at', '2026-09-01T00:00:00Z')
        .lt('created_at', '2026-10-01T00:00:00Z');

    if (error) {
        console.error(error);
        return;
    }

    // Maps for tracking
    const newSalesMap = new Map(); // Ventas creadas en Septiembre
    const pastMonthPayments = []; // Pagos en Septiembre para meses anteriores

    // First, process all main orders (no _balance_) in September
    sepSales.forEach(s => {
        if (s.status === 'cancelled') return;
        
        if (!s.internal_id.includes('_balance_')) {
            newSalesMap.set(s.internal_id, {
                id: s.internal_id,
                date: s.created_at,
                client: s.customers?.full_name || 'Desconocido',
                type: s.internal_id.startsWith('bridal_') ? 'Alta Costura / Novia' : 'Arreglos / Sastrería',
                total: Number(s.total_amount || 0),
                paid: Number(s.paid_amount || 0),
                status: s.status
            });
        }
    });

    // Now process all _balance_ payments in September
    const balancePayments = sepSales.filter(s => s.internal_id.includes('_balance_') && s.status !== 'cancelled');
    
    // We need to fetch base orders for balance payments that belong to past months
    const unknownBaseIds = new Set();
    
    balancePayments.forEach(s => {
        const baseId = s.internal_id.split('_balance_')[0];
        if (newSalesMap.has(baseId)) {
            // It's a payment for a September sale. Add to the paid amount.
            const sale = newSalesMap.get(baseId);
            sale.paid += Number(s.paid_amount || 0);
        } else {
            // It's a payment for a pre-September sale.
            unknownBaseIds.add(baseId);
        }
    });

    // Fetch past base orders
    let pastBaseOrders = [];
    if (unknownBaseIds.size > 0) {
        const { data: pastData } = await supabase
            .from('sales_ledger')
            .select(`*, customers(full_name)`)
            .in('internal_id', Array.from(unknownBaseIds));
        
        if (pastData) {
            pastBaseOrders = pastData;
        }
    }

    // Add past payments to array
    balancePayments.forEach(s => {
        const baseId = s.internal_id.split('_balance_')[0];
        if (!newSalesMap.has(baseId)) {
            const baseOrder = pastBaseOrders.find(b => b.internal_id === baseId);
            pastMonthPayments.push({
                id: s.internal_id,
                baseId: baseId,
                date: s.created_at,
                client: baseOrder?.customers?.full_name || s.customers?.full_name || 'Desconocido',
                type: baseId.startsWith('bridal_') ? 'Alta Costura / Novia' : 'Arreglos / Sastrería',
                baseTotal: baseOrder ? Number(baseOrder.total_amount) : 'Desconocido',
                amountPaidNow: Number(s.paid_amount || s.total_amount || 0)
            });
        }
    });

    // --- Generate Markdown ---
    let md = `# Informe de Ventas y Flujo de Caja - Septiembre 2026\n\n`;
    
    md += `## 1. Ventas Generadas en Septiembre\n`;
    md += `*Órdenes nuevas ingresadas este mes. Se muestra el valor total del proyecto y cuánto se ha abonado/pagado hasta ahora.*\n\n`;
    
    md += `| ID Proyecto | Cliente | Tipo de Servicio | Valor Total | Abonado/Pagado | Por Cobrar |\n`;
    md += `|-------------|---------|------------------|-------------|----------------|------------|\n`;
    
    let totalSalesVol = 0;
    let totalPaidVol = 0;
    let totalPendingVol = 0;

    const newSalesArray = Array.from(newSalesMap.values()).sort((a,b) => new Date(a.date) - new Date(b.date));
    
    newSalesArray.forEach(sale => {
        totalSalesVol += sale.total;
        totalPaidVol += sale.paid;
        const pending = Math.max(0, sale.total - sale.paid);
        totalPendingVol += pending;
        
        md += `| \`${sale.id.substring(0,15)}...\` | ${sale.client} | ${sale.type} | $${sale.total.toLocaleString('es-CL')} | $${sale.paid.toLocaleString('es-CL')} | $${pending.toLocaleString('es-CL')} |\n`;
    });
    
    md += `| **TOTALES** | | | **$${totalSalesVol.toLocaleString('es-CL')}** | **$${totalPaidVol.toLocaleString('es-CL')}** | **$${totalPendingVol.toLocaleString('es-CL')}** |\n\n`;

    md += `## 2. Pagos Recibidos en Septiembre (Deuda de meses pasados)\n`;
    md += `*Estos son abonos o pagos de saldo que entraron en septiembre, pero corresponden a vestidos/arreglos que se vendieron en agosto u otros meses.*\n\n`;
    
    md += `| ID de Pago | ID Proyecto Original | Cliente | Tipo | Valor Proyecto (Ref) | Pagado en Septiembre |\n`;
    md += `|------------|----------------------|---------|------|----------------------|----------------------|\n`;
    
    let totalPastPayments = 0;
    
    pastMonthPayments.forEach(p => {
        totalPastPayments += p.amountPaidNow;
        const baseTotalStr = typeof p.baseTotal === 'number' ? `$${p.baseTotal.toLocaleString('es-CL')}` : p.baseTotal;
        md += `| \`${p.id.substring(p.id.indexOf('_balance_'))}\` | \`${p.baseId.substring(0,15)}...\` | ${p.client} | ${p.type} | ${baseTotalStr} | $${p.amountPaidNow.toLocaleString('es-CL')} |\n`;
    });
    
    md += `| **TOTAL** | | | | | **$${totalPastPayments.toLocaleString('es-CL')}** |\n\n`;

    md += `## 3. Resumen Consolidado (Caja Real Septiembre)\n\n`;
    md += `- **Plata que entró por Ventas de Septiembre:** $${totalPaidVol.toLocaleString('es-CL')}\n`;
    md += `- **Plata que entró por Ventas Pasadas (Saldos):** $${totalPastPayments.toLocaleString('es-CL')}\n`;
    md += `- **TOTAL EFECTIVO REAL COBRADO EN SEPTIEMBRE:** $${(totalPaidVol + totalPastPayments).toLocaleString('es-CL')}\n\n`;
    md += `--- \n`;
    md += `*Nota: Ventas del mes comerciales = $${totalSalesVol.toLocaleString('es-CL')}*`;

    fs.writeFileSync('C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\ea456895-efd9-4fb8-b102-8b48286a8d82\\reporte_ventas_septiembre.md', md, 'utf8');
    console.log("Reporte generado exitosamente.");
}

generateReport();
