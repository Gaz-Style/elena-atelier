const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Checking database details for order_18940...");
    
    // 1. sales_ledger
    const { data: sales } = await supabase
        .from('sales_ledger')
        .select('*')
        .eq('internal_id', 'order_18940');
    console.log("sales_ledger for order_18940:", JSON.stringify(sales, null, 2));

    // 2. production_orders
    const { data: prod } = await supabase
        .from('production_orders')
        .select('*')
        .eq('pos_order_id', 'order_18940');
    console.log("production_orders for order_18940:", JSON.stringify(prod, null, 2));

    // 3. work_orders / items
    if (sales && sales.length > 0) {
        const { data: wo } = await supabase
            .from('work_orders')
            .select('*')
            .eq('sale_id', sales[0].id);
        console.log("work_orders for order_18940:", JSON.stringify(wo, null, 2));
    }
}

main();
