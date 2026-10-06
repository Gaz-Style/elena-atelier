const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJuly() {
    const { data: sales, error } = await supabase
        .from('sales_ledger')
        .select('*')
        .gte('created_at', '2026-07-01')
        .lt('created_at', '2026-08-01');
        
    let mainSales = sales.filter(s => !s.internal_id.includes('_balance_'));
    let mainIds = new Set(mainSales.map(s => s.internal_id));
    
    let totalSales = mainSales.reduce((sum, s) => sum + s.total_amount, 0);
    
    let cash = sales.reduce((sum, s) => {
        const baseId = s.internal_id.split('_balance_')[0];
        if (mainIds.has(baseId) && ['completed', 'paid', 'partial'].includes(s.status)) {
            return sum + s.paid_amount;
        }
        return sum;
    }, 0);
    
    console.log(`July Total Sales: ${totalSales}`);
    console.log(`July Cash Collected: ${cash}`);
}

checkJuly();
