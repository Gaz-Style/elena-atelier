const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking crm_whatsapp_messages...");
    const { data: logs, error } = await supabase
        .from('crm_whatsapp_messages')
        .select('*')
        .eq('direction', 'outbound')
        .order('created_at', { ascending: false })
        .limit(5);
        
    console.log(JSON.stringify(logs, null, 2));
    if (error) console.error(error);
}

check();
