const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDates() {
    const ids = [
        'bridal_d07536f8-3455-436f-93e8-c6cf58323b59_p1',
        'bridal_35aefdcb-a901-4142-a7be-444a49bb891a_custom_p1',
        'bridal_1f784690-f1c4-492a-a319-cdc24620afaa_custom_p1',
        'order_19305',
        'bridal_13d80212-c015-4a01-bd0a-72f318f667a9_custom_p1'
    ];
    
    const { data } = await supabase.from('sales_ledger').select('internal_id, created_at, paid_amount').in('internal_id', ids);
    console.log(data);
}

checkDates();
