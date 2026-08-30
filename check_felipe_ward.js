const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Searching database for order_65504...");
    
    // Check sales_ledger
    const { data: sales, error: salesErr } = await supabase
        .from('sales_ledger')
        .select('*')
        .like('internal_id', '%order_65504%');
        
    console.log("Sales Ledger records for order_65504:", JSON.stringify(sales, null, 2));

    // Check production_orders
    const { data: prodOrders, error: prodErr } = await supabase
        .from('production_orders')
        .select('*')
        .eq('pos_order_id', 'order_65504');
        
    console.log("Production Orders for order_65504:", JSON.stringify(prodOrders, null, 2));
    
    // Check if there are other sales for Felipe Ward (customer_id)
    if (sales && sales.length > 0 && sales[0].customer_id) {
        const { data: customerSales } = await supabase
            .from('sales_ledger')
            .select('*')
            .eq('customer_id', sales[0].customer_id);
        console.log("All sales ledger records for this customer:", JSON.stringify(customerSales, null, 2));
    }
}
main();
