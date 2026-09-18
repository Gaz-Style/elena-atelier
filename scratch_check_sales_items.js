const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectSalesData() {
    console.log('\n--- 1. WORK ORDERS / PRODUCTION ORDERS ---');
    const { data: orders } = await supabase.from('work_orders').select('*').limit(10);
    console.log('work_orders count/sample:', orders ? orders.length : 0);
    if (orders && orders[0]) console.log('Sample order:', orders[0]);

    console.log('\n--- 2. SALES LEDGER ---');
    const { data: sales } = await supabase.from('sales_ledger').select('*').limit(10);
    console.log('sales_ledger count/sample:', sales ? sales.length : 0);
    if (sales && sales[0]) console.log('Sample sale:', sales[0]);

    console.log('\n--- 3. CATALOG (SALES COUNT / POPULARITY) ---');
    const { data: cat } = await supabase.from('catalog').select('*').limit(10);
    console.log('catalog sample keys:', cat && cat[0] ? Object.keys(cat[0]) : []);
}

inspectSalesData();
