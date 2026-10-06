const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReal() {
    const { data: sales } = await supabase.from('sales_ledger').select('*').eq('internal_id', 'bridal_d07536f8-3455-436f-93e8-c6cf58323b59_p1');
    const { data: proj } = await supabase.from('bridal_projects').select('*').eq('id', 'd07536f8-3455-436f-93e8-c6cf58323b59');
    
    console.log("Sales Ledger:", sales);
    console.log("Bridal Project:", proj);
}

checkReal();
