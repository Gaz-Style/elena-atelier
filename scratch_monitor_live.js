const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function monitor() {
    console.log("Iniciando monitoreo en vivo (esperando 45 segundos)...");
    let lastTaskId = null;
    let lastMsgId = null;

    for (let i = 0; i < 15; i++) {
        // Fetch latest task
        const { data: tasks } = await supabase
            .from('ai_agent_tasks')
            .select('id, status, agent_role, error_log, payload, result, created_at')
            .order('created_at', { ascending: false })
            .limit(1);
            
        if (tasks && tasks.length > 0) {
            const t = tasks[0];
            if (t.id !== lastTaskId) {
                console.log(`\n[TAREA IA] Nueva o actualizada (${t.status}):`);
                console.log(`- Recibido: "${t.payload?.content || 'Imagen/Audio'}"`);
                if (t.status === 'completed') console.log(`- IA Respondió: "${t.result?.message}"`);
                if (t.status === 'failed') console.log(`- ERROR: ${t.error_log}`);
                lastTaskId = t.id;
            }
        }

        // Fetch latest message
        const { data: msgs } = await supabase
            .from('crm_whatsapp_messages')
            .select('id, sender_type, content, message_type, created_at')
            .order('created_at', { ascending: false })
            .limit(1);

        if (msgs && msgs.length > 0) {
            const m = msgs[0];
            if (m.id !== lastMsgId) {
                if (m.sender_type === 'customer') {
                    console.log(`\n[CLIENTE -> BOT]: ${m.content} (${m.message_type})`);
                } else if (m.sender_type === 'bot') {
                    console.log(`\n[BOT -> CLIENTE]: ${m.content}`);
                }
                lastMsgId = m.id;
            }
        }

        await new Promise(r => setTimeout(r, 3000));
    }
    console.log("\nFin del ciclo de monitoreo corto.");
}

monitor().catch(console.error);
