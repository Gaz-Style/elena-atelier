const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: sales, error: salesErr } = await supabase.from('sales_ledger').select('*').like('internal_id', 'order_31081%');
    console.log('Sales:', sales);
    
    const { data: prod, error: prodErr } = await supabase.from('production_orders').select('id, payment_status, paid_amount, total_price').eq('pos_order_id', 'order_31081');
    console.log('Prod:', prod);

    // FIX it if necessary
    if (prod && prod.length > 0 && prod[0].payment_status !== 'PAGADO') {
        await supabase.from('production_orders').update({ payment_status: 'PAGADO' }).eq('pos_order_id', 'order_31081');
        await supabase.from('sales_ledger').update({ status: 'completed' }).eq('internal_id', 'order_31081');
        console.log('Fixed order_31081 to PAGADO/completed');
    }
}

main();
