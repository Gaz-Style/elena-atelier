const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findDiff() {
    const { data: salesList } = await supabase.from('sales_ledger').select('*');
    
    // Look for anything that could cause an 880k difference
    let total = 0;
    salesList.forEach(s => {
        if (s.paid_amount == 880000) {
            console.log("Found 880k row!", s);
        }
    });
}

findDiff();
