const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tdzotbtoaserlrynhxum.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
    console.error("Error: SUPABASE_SERVICE_ROLE_KEY no está configurada en .env.local");
    process.exit(1);
}

const supabase = createClient(url, key);

async function runDiagnostics() {
    console.log("=== INICIANDO DIAGNÓSTICO DE DISCREPANCIAS EN PAGOS ===\n");
    
    // 1. Obtener todas las órdenes de trabajo con su plan de pagos
    const { data: workOrders, error } = await supabase
        .from('work_orders')
        .select('id, paid_amount, total_amount, payment_plan, customer_id, legacy_bridal_project_id, customers(full_name)');
        
    if (error) {
        console.error("Error obteniendo work_orders:", error);
        return;
    }

    console.log(`Analizando ${workOrders.length} órdenes de trabajo...`);
    let discrepancyCount = 0;

    for (const wo of workOrders) {
        const clientName = wo.customers?.full_name || 'Desconocido';
        const plan = wo.payment_plan;
        
        if (!plan || !plan.cuotas || !Array.isArray(plan.cuotas)) {
            // No tiene plan de cuotas estructurado en JSON
            continue;
        }

        // Calcular la suma real de las cuotas marcadas como 'paid'
        const sumPaidInstallments = plan.cuotas
            .filter(c => c.status === 'paid')
            .reduce((acc, curr) => acc + (Number(curr.amount || curr.monto || 0)), 0);

        const currentPaidAmountInDb = Number(wo.paid_amount || 0);

        if (sumPaidInstallments !== currentPaidAmountInDb) {
            discrepancyCount++;
            console.log(`\n❌ DISCREPANCIA DETECTADA - Cliente: ${clientName} (WO ID: ${wo.id})`);
            console.log(`   - Total Vestido: $${wo.total_amount}`);
            console.log(`   - En DB (paid_amount): $${currentPaidAmountInDb}`);
            console.log(`   - Suma real de Cuotas Pagadas ('paid'): $${sumPaidInstallments}`);
            console.log(`   - Detalle del Plan de Cuotas:`);
            plan.cuotas.forEach((c, idx) => {
                console.log(`      * Cuota ${idx + 1}: $${c.amount || c.monto} - [${c.status}]`);
            });
        }
    }

    console.log(`\n=== DIAGNÓSTICO FINALIZADO ===`);
    console.log(`Total de discrepancias encontradas: ${discrepancyCount}`);
}

runDiagnostics();
