const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Checking work_orders for Felipe Ward...");
    const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('full_name', 'Felipe Ward')
        .single();
        
    if (customer) {
        const { data: wo } = await supabase
            .from('work_orders')
            .select('*')
            .eq('customer_id', customer.id);
        console.log("work_orders:", JSON.stringify(wo, null, 2));
    }
}
main();
