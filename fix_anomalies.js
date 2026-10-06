const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAnomalies() {
    const { data: sales, error } = await supabase
        .from('sales_ledger')
        .select('*');
        
    let fixedCount = 0;
    
    for (const s of sales) {
        if (s.paid_amount > s.total_amount && ['completed', 'paid'].includes(s.status)) {
            console.log(`Fixing anomaly: ${s.internal_id} - Total: ${s.total_amount}, Paid: ${s.paid_amount} -> Setting Paid to ${s.total_amount}`);
            await supabase
                .from('sales_ledger')
                .update({ paid_amount: s.total_amount })
                .eq('id', s.id);
            fixedCount++;
        } else if (s.paid_amount > s.total_amount) {
            console.log(`Anomaly found but status not paid: ${s.internal_id} - Status: ${s.status}, Total: ${s.total_amount}, Paid: ${s.paid_amount}`);
        }
    }
    
    console.log(`Done. Fixed ${fixedCount} anomalies.`);
}

fixAnomalies();
