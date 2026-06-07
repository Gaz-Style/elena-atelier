import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60; // Max execution time for Vercel

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        // Simple security: Check a custom cron secret (you should set this in env)
        if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'antigravity-secret'}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();

        // 1. Fetch pending tasks from the queue (FIFO)
        const { data: tasks, error: fetchError } = await supabase
            .from('ai_agent_tasks')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(5);

        if (fetchError) {
            console.error('Error fetching tasks:', fetchError);
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!tasks || tasks.length === 0) {
            return NextResponse.json({ message: 'No pending tasks' });
        }

        // 2. Mark tasks as processing
        const taskIds = tasks.map(t => t.id);
        await supabase
            .from('ai_agent_tasks')
            .update({ status: 'processing' })
            .in('id', taskIds);

        const results = [];

        // 3. Process each task based on agent_role
        for (const task of tasks) {
            try {
                let resultPayload = null;

                switch (task.agent_role) {
                    case 'whatsapp_closer':
                        const deepseekKey = process.env.DEEPSEEK_API_KEY;
                        if (!deepseekKey) throw new Error("DeepSeek API Key not found");
                        
                        const userMessage = task.payload.content || "Hola";
                        
                        const response = await fetch("https://api.deepseek.com/chat/completions", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${deepseekKey}`
                            },
                            body: JSON.stringify({
                                model: "deepseek-chat",
                                messages: [
                                    { role: "system", content: "Eres Elena, una Inteligencia Artificial que encarna la personalidad de Elena La Costurera, experta en alta costura y upcycling de autor. Hablas de forma corta, directa y 'buena onda'. Tu objetivo es clasificar el servicio e invitar al cliente a agendar una visita al taller." },
                                    { role: "user", content: userMessage }
                                ],
                                max_tokens: 150
                            })
                        });

                        const responseData = await response.json();
                        const aiReply = responseData.choices?.[0]?.message?.content || "Disculpe, en este momento el atelier está con alta demanda. Un asesor humano le atenderá a la brevedad.";

                        // Guardar respuesta del bot en el historial de mensajes
                        if (task.payload.chat_id) {
                            await supabase
                                .from('crm_whatsapp_messages')
                                .insert([{
                                    chat_id: task.payload.chat_id,
                                    sender_type: 'bot',
                                    message_type: 'text',
                                    content: aiReply
                                }]);
                        }

                        resultPayload = { 
                            action: 'reply', 
                            message: aiReply,
                            original_payload: task.payload 
                        };
                        break;
                    case 'hr_manager':
                        resultPayload = { action: 'review_payroll', status: 'ok' };
                        break;
                    case 'erp_analyst':
                        resultPayload = { action: 'alert', message: 'Falta stock de seda italiana' };
                        break;
                    default:
                        throw new Error(`Unknown agent_role: ${task.agent_role}`);
                }

                // Update task as completed
                await supabase
                    .from('ai_agent_tasks')
                    .update({
                        status: 'completed',
                        result: resultPayload,
                        processed_at: new Date().toISOString()
                    })
                    .eq('id', task.id);

                results.push({ id: task.id, status: 'completed' });

            } catch (err: any) {
                console.error(`Task ${task.id} failed:`, err);
                // Mark task as failed
                await supabase
                    .from('ai_agent_tasks')
                    .update({
                        status: 'failed',
                        error_log: err.message,
                        processed_at: new Date().toISOString()
                    })
                    .eq('id', task.id);
                results.push({ id: task.id, status: 'failed', error: err.message });
            }
        }

        return NextResponse.json({ message: 'Processed tasks', results });
    } catch (error: any) {
        console.error('Orchestrator error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
