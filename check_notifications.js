const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking recent notification_logs...");
    const { data: logs, error } = await supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
    console.log(logs);
    console.error(error);
}

check();
