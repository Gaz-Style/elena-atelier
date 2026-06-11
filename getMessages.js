require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function getMsgs() {
    const { data: chats } = await supabase.from('crm_whatsapp_chats').select('*').eq('phone_number', '56972812907');
    if (!chats || chats.length === 0) return console.log('No chat found');
    const chatId = chats[0].id;
    const { data: msgs } = await supabase.from('crm_whatsapp_messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true }).limit(20);
    
    console.log(msgs.map(m => `[${m.sender_type}] ${m.content}`).join('\n'));
}

getMsgs();
