const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: sales, error } = await supabase
        .from('sales_ledger')
        .select('*')
        .gte('created_at', '2026-09-01T00:00:00Z')
        .lte('created_at', '2026-09-30T23:59:59Z')
        .in('status', ['completed', 'paid', 'partial']);

    if (error) {
        console.error(error);
        return;
    }

    const grouped = {};
    sales.forEach(s => {
        const baseId = s.internal_id.split('_balance_')[0];
        if (!grouped[baseId]) grouped[baseId] = [];
        grouped[baseId].push(s);
    });

    let doubleCounted = false;
    for (const baseId in grouped) {
        if (grouped[baseId].length > 1) {
            const sumPaid = grouped[baseId].reduce((sum, s) => sum + (Number(s.paid_amount) || 0), 0);
            const totalAmount = grouped[baseId][0].total_amount;
            if (sumPaid > totalAmount) {
                console.log(`DOUBLE COUNTING DETECTED for ${baseId}: Total Amount = ${totalAmount}, Sum Paid in Sept = ${sumPaid}`);
                grouped[baseId].forEach(s => {
                    console.log(`  -> ${s.internal_id} | Paid: ${s.paid_amount} | Created: ${s.created_at}`);
                });
                doubleCounted = true;
            }
        }
    }
    
    if (!doubleCounted) console.log("No double counting detected for items within September.");
}

check();
