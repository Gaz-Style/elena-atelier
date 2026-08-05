const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tdzotbtoaserlrynhxum.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
    console.error("Error: SUPABASE_SERVICE_ROLE_KEY no está configurada en .env.local");
    process.exit(1);
}

const supabase = createClient(url, key);

async function repairMarisol() {
    console.log("=== INICIANDO REPARACIÓN DE DATOS DE MARISOL ROJAS ===");
    
    const projectId = "5c731b22-e3ca-4841-a615-a6affb7626d3"; // ID de bridal_projects de Marisol Rojas

    // 1. Obtener la orden de trabajo actual
    const { data: wo, error: fetchErr } = await supabase
        .from('work_orders')
        .select('*')
        .eq('legacy_bridal_project_id', projectId)
        .maybeSingle();

    if (fetchErr || !wo) {
        console.error("Error obteniendo la orden:", fetchErr || "No encontrada");
        return;
    }

    console.log(`\nOrden encontrada. Estado actual:`);
    console.log(`- Total: $${wo.total_amount}`);
    console.log(`- Pagado actual: $${wo.paid_amount}`);

    // Recalcular suma real de cuotas marcadas como 'paid'
    const plan = wo.payment_plan;
    if (!plan || !plan.cuotas) {
        console.error("La orden no tiene un plan de pagos estructurado.");
        return;
    }

    const sumPaidInstallments = plan.cuotas
        .filter(c => c.status === 'paid')
        .reduce((acc, curr) => acc + (Number(curr.amount || curr.monto || 0)), 0);

    console.log(`- Suma real cuotas 'paid': $${sumPaidInstallments}`);

    // 2. Actualizar work_orders con el paid_amount correcto ($400.000)
    const { error: updateErr } = await supabase
        .from('work_orders')
        .update({
            paid_amount: sumPaidInstallments,
            payment_status: 'partial',
            updated_at: new Date().toISOString()
        })
        .eq('id', wo.id);

    if (updateErr) {
        console.error("Error actualizando work_orders:", updateErr);
        return;
    }
    console.log("✓ work_orders actualizada exitosamente.");

    // 3. Revisar y limpiar la planilla de ventas (sales_ledger)
    // Buscamos transacciones vinculadas a este proyecto
    const { data: ledgerEntries, error: ledgerFetchErr } = await supabase
        .from('sales_ledger')
        .select('*')
        .like('internal_id', `bridal_${projectId}%`);

    if (ledgerFetchErr) {
        console.error("Error obteniendo planilla:", ledgerFetchErr);
        return;
    }

    console.log(`\nTransacciones en planilla encontradas (${ledgerEntries.length}):`);
    
    // Las transacciones válidas son:
    // bridal_5c731b22-e3ca-4841-a615-a6affb7626d3_custom_p1 ($100.000)
    // bridal_5c731b22-e3ca-4841-a615-a6affb7626d3_custom_p2 ($300.000)
    // Cualquier otra debe ser eliminada
    
    const validIds = [
        `bridal_${projectId}_custom_p1`,
        `bridal_${projectId}_custom_p2`
    ];

    for (const entry of ledgerEntries) {
        if (!validIds.includes(entry.internal_id)) {
            console.log(`⚠️ Transacción errónea detectada: ${entry.internal_id} por $${entry.total_amount}. Procediendo a eliminar...`);
            const { error: deleteErr } = await supabase
                .from('sales_ledger')
                .delete()
                .eq('id', entry.id);
            if (deleteErr) {
                console.error(`Error eliminando transacción ${entry.id}:`, deleteErr);
            } else {
                console.log(`✓ Transacción eliminada.`);
            }
        } else {
            console.log(`✅ Transacción válida conservada: ${entry.internal_id} por $${entry.total_amount}`);
        }
    }

    console.log("\n=== REPARACIÓN FINALIZADA CON ÉXITO ===");
}

repairMarisol();
