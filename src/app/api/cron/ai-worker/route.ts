import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateDeepSeekCompletion, DEEPSEEK_MODELS, DeepSeekMessage } from '@/lib/ai/deepseek';
import { SYSTEM_PROMPT_ELENA_ATELIER, ATELIER_TOOLS, executeAtelierTool } from '@/lib/ai/tools';

export async function GET(request: Request) {
    // Verificación opcional de autorización
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Obtener tareas pendientes de la cola
    const { data: tasks, error: fetchError } = await supabase
        .from('ai_agent_tasks')
        .select('*')
        .eq('status', 'pending')
        .eq('agent_role', 'whatsapp_closer')
        .order('created_at', { ascending: true })
        .limit(5);

    if (fetchError) {
        console.error('Error obteniendo tareas de ai_agent_tasks:', fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!tasks || tasks.length === 0) {
        return NextResponse.json({ message: 'No hay tareas pendientes en la cola' }, { status: 200 });
    }

    let processedCount = 0;

    for (const task of tasks) {
        try {
            // Marcar tarea como processing
            await supabase
                .from('ai_agent_tasks')
                .update({ status: 'processing' })
                .eq('id', task.id);

            const { chat_id, content: userContent } = task.payload || {};

            if (!chat_id) {
                await supabase
                    .from('ai_agent_tasks')
                    .update({ status: 'failed', error_log: 'Falta chat_id en el payload' })
                    .eq('id', task.id);
                continue;
            }

            // 2. Cargar historial del chat (Memoria corta/media)
            const { data: messagesData } = await supabase
                .from('crm_whatsapp_messages')
                .select('sender_type, content')
                .eq('chat_id', chat_id)
                .order('created_at', { ascending: true })
                .limit(10);

            // Reconstruir ventana deslizante de mensajes para DeepSeek
            const conversationMessages: DeepSeekMessage[] = [
                { role: 'system', content: SYSTEM_PROMPT_ELENA_ATELIER }
            ];

            if (messagesData) {
                for (const msg of messagesData) {
                    if (msg.sender_type === 'customer') {
                        conversationMessages.push({ role: 'user', content: msg.content || '' });
                    } else if (msg.sender_type === 'bot') {
                        conversationMessages.push({ role: 'assistant', content: msg.content || '' });
                    }
                }
            }

            // 3. Invocación asimétrica con DeepSeek-V4 Flash / V3
            let completion = await generateDeepSeekCompletion({
                messages: conversationMessages,
                model: DEEPSEEK_MODELS.FLASH,
                tools: ATELIER_TOOLS,
            });

            // 4. Manejo de llamado a herramientas (Function Calling)
            if (completion.toolCalls && completion.toolCalls.length > 0) {
                for (const toolCall of completion.toolCalls) {
                    const fnName = toolCall.function?.name;
                    let fnArgs = {};
                    try {
                        fnArgs = JSON.parse(toolCall.function?.arguments || '{}');
                    } catch (e) {
                        console.error('Error parseando JSON de tool call:', e);
                    }

                    // Ejecutar la herramienta en el ERP / Agenda
                    const toolResult = await executeAtelierTool(fnName, fnArgs);

                    // Re-inyectar resultado de la herramienta en el historial
                    conversationMessages.push({
                        role: 'assistant',
                        content: completion.content || '',
                        tool_calls: completion.toolCalls,
                    });
                    conversationMessages.push({
                        role: 'tool',
                        content: toolResult,
                        tool_call_id: toolCall.id,
                    });
                }

                // Generar respuesta final tras ejecutar la herramienta
                completion = await generateDeepSeekCompletion({
                    messages: conversationMessages,
                    model: DEEPSEEK_MODELS.FLASH,
                });
            }

            const finalReply = completion.content;

            // 5. Guardar la respuesta del bot en la base de datos
            if (finalReply) {
                await supabase.from('crm_whatsapp_messages').insert([{
                    chat_id: chat_id,
                    sender_type: 'bot',
                    message_type: 'text',
                    content: finalReply,
                }]);

                // 6. Enviar mensaje por la WhatsApp Cloud API si las credenciales están presentes
                const token = process.env.WHATSAPP_API_TOKEN;
                const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

                // Obtener número de teléfono del chat
                const { data: chatInfo } = await supabase
                    .from('crm_whatsapp_chats')
                    .select('phone_number')
                    .eq('id', chat_id)
                    .single();

                if (token && phoneId && chatInfo?.phone_number) {
                    await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            messaging_product: 'whatsapp',
                            to: chatInfo.phone_number,
                            type: 'text',
                            text: { body: finalReply },
                        }),
                    });
                }
            }

            // Marcar tarea como completada
            await supabase
                .from('ai_agent_tasks')
                .update({
                    status: 'completed',
                    result: { reply: finalReply },
                    processed_at: new Date().toISOString(),
                })
                .eq('id', task.id);

            processedCount++;

        } catch (taskErr: any) {
            console.error(`Error procesando tarea ${task.id}:`, taskErr);
            await supabase
                .from('ai_agent_tasks')
                .update({
                    status: 'failed',
                    error_log: taskErr.message || 'Error desconocido durante la inferencia',
                    processed_at: new Date().toISOString(),
                })
                .eq('id', task.id);
        }
    }

    return NextResponse.json({
        status: 'success',
        processed_tasks: processedCount,
    }, { status: 200 });
}
