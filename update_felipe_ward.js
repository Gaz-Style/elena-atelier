const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Updating Felipe Ward's order_65504 in the database...");
    
    // 1. Update sales_ledger
    const { data: salesData, error: salesErr } = await supabase
        .from('sales_ledger')
        .update({
            status: 'completed',
            paid_amount: 129500
        })
        .eq('internal_id', 'order_65504')
        .select();

    if (salesErr) {
        console.error("Error updating sales_ledger:", salesErr);
    } else {
        console.log("Updated sales_ledger records successfully:", salesData);
    }

    // 2. Update production_orders
    const { data: prodData, error: prodErr } = await supabase
        .from('production_orders')
        .update({
            payment_status: 'paid',
            paid_amount: 129500
        })
        .eq('pos_order_id', 'order_65504')
        .select();

    if (prodErr) {
        console.error("Error updating production_orders:", prodErr);
    } else {
        console.log("Updated production_orders successfully:", prodData);
    }
}

main();
