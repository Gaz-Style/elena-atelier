require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearMsgs() {
    const { error } = await supabase.from('crm_whatsapp_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error('Error:', error);
    else console.log('Messages cleared');
}

clearMsgs();
