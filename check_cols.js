const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: sales, error } = await supabase
        .from('sales_ledger')
        .select('*')
        .limit(1);

    if (error) {
        console.error(error);
        return;
    }
    console.log(Object.keys(sales[0]));
}

check();
