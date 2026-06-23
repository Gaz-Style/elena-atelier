const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: prod, error: prodErr } = await supabase.from('production_orders').select('id, pos_order_id, payment_status, paid_amount, total_price').eq('pos_order_id', 'order_31081');
    console.log('Prod:', prod);
    console.log('Prod Error:', prodErr);
}

main();
