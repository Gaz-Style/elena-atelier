export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    // Basic auth for cron jobs (Vercel Cron standard)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Timeout de 3 minutos
    const timeoutDate = new Date();
    timeoutDate.setMinutes(timeoutDate.getMinutes() - 3);

    // Fetch tareas colgadas
    const { data: stuckTasks, error: fetchError } = await supabase
        .from('ai_agent_tasks')
        .select('id, payload')
        .in('status', ['pending', 'processing'])
        .lt('created_at', timeoutDate.toISOString());

    if (fetchError) {
        return new Response(`Error fetching: ${fetchError.message}`, { status: 500 });
    }

    if (!stuckTasks || stuckTasks.length === 0) {
        return new Response('No stuck tasks found', { status: 200 });
    }

    const taskIds = stuckTasks.map(t => t.id);

    // Marcar como 'failed' y registrar log
    const { error: updateError } = await supabase
        .from('ai_agent_tasks')
        .update({ 
            status: 'failed', 
            error_log: 'Task timed out after 3 minutes. Forced circuit breaker / human handoff.',
            processed_at: new Date().toISOString()
        })
        .in('id', taskIds);

    if (updateError) {
        return new Response(`Error updating tasks: ${updateError.message}`, { status: 500 });
    }

    // Escalar al humano en el CRM (fallback)
    let handoffCount = 0;
    for (const task of stuckTasks) {
        if (task.payload && task.payload.chat_id) {
            await supabase
                .from('crm_whatsapp_chats')
                .update({ session_status: 'human_handoff' })
                .eq('id', task.payload.chat_id);
            handoffCount++;
        }
    }

    return new Response(JSON.stringify({ 
        message: `Swept ${taskIds.length} stuck tasks`,
        escalated_chats: handoffCount
    }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
