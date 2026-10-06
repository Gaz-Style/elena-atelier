const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkP2() {
    const { data: sales, error } = await supabase
        .from('sales_ledger')
        .select('*')
        .gte('created_at', '2026-07-01')
        .lt('created_at', '2026-08-01');
        
    const p2Sales = sales.filter(s => s.internal_id.match(/_p[2-9]/));
    console.log(p2Sales.map(s => ({ id: s.internal_id, total: s.total_amount })));
}

checkP2();
