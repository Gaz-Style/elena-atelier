const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log('Querying latest orders in sales_ledger...');
    const { data, error } = await supabase
        .from('sales_ledger')
        .select('id, internal_id, created_at, net_amount, total_amount')
        .order('created_at', { ascending: false })
        .limit(10);
        
    console.log("Error:", error);
    console.log("Data:", data);
}

main();
