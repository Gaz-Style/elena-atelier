require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkTasks() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get all image tasks today
    const { data: tasks } = await supabase
        .from('ai_agent_tasks')
        .select('*')
        .eq('agent_role', 'whatsapp_closer')
        .eq('payload->>message_type', 'image')
        .order('created_at', { ascending: false })
        .limit(5);
        
    for (const task of tasks) {
        console.log(`\n--- TAREA ${task.created_at} ---`);
        console.log(`ID: ${task.id}`);
        console.log(`Payload gemini_analysis: ${task.payload.gemini_analysis}`);
        console.log(`Error Log: ${task.error_log}`);
        console.log(`Result Message: ${task.result?.message}`);
        
        // Let's also check the CRM messages for this chat to see what was injected
        const { data: msgs } = await supabase
            .from('crm_whatsapp_messages')
            .select('content, sender_type')
            .eq('chat_id', task.payload.chat_id)
            .order('created_at', { ascending: false })
            .limit(3);
            
        console.log("Últimos mensajes en CRM:");
        for (const msg of msgs) {
            console.log(`[${msg.sender_type}] ${msg.content}`);
        }
    }
}
checkTasks();
