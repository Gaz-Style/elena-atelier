import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60; // Máximo tiempo de ejecución en Vercel Serverless

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        const expectedSecret = process.env.CRON_SECRET || 'antigravity-secret';
        
        if (authHeader !== `Bearer ${expectedSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();

        // 1. Obtener tareas pendientes de la cola
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

        // 2. Marcar tareas como en proceso
        const taskIds = tasks.map(t => t.id);
        await supabase
            .from('ai_agent_tasks')
            .update({ status: 'processing' })
            .in('id', taskIds);

        const results = [];

        // System Prompt Profesional de Elena La Costurera (Memoria Maestra)
        const ELENA_SYSTEM_PROMPT = `
Eres la Asistente Virtual Oficial de "Elena La Costurera", taller de alta costura, sastrería y arreglos de autor en Santiago de Chile.

REGLAS DE IDENTIDAD Y TONO:
1. Trato: Respeta al cliente tratándole de "Usted", con extrema calidez, elegancia y empatía.
2. Formato: Respuestas breves, directas y ágiles (máximo 2 a 3 líneas por mensaje).
3. Mensajes desde la Web: Si el mensaje del cliente viene preescrito desde la web (ej: "Hola, quiero cotizar un arreglo de vestido"), responde DIRECTAMENTE a su necesidad con agilidad, sin saludos robóticos preconcebidos.

REGLAS DE NEGOCIO Y GUARDRAILS:
1. CITAS 100% GRATUITAS: Todas las citas de evaluación y calce en el taller son 100% GRATUITAS. Invite al cliente a agendar.
2. SERVICIO A DOMICILIO: La visita a domicilio de la costurera con toma de medidas tiene un valor de $12.000 CLP.
3. PROHIBICIÓN DE PRECIOS FINALES: NUNCA fije ni garantice un precio final cerrado por chat. Dé solo rangos orientativos de referencia e indique que el presupuesto definitivo lo da la costurera al evaluar la prenda físicamente.
4. ATENCIÓN HUMANA (HANDOFF): Si el cliente pide hablar con una persona, manifiesta un reclamo o requiere confección desde cero de alta costura, indique amablemente que lo transferirá con Elena y no siga respondiendo automáticamente.
`;

        for (const task of tasks) {
            try {
                let resultPayload = null;

                if (task.agent_role === 'whatsapp_closer') {
                    const deepseekKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
                    if (!deepseekKey) throw new Error("DeepSeek API Key no encontrada en variables de entorno.");

                    const userContent = task.payload.content || "Hola";
                    const chatId = task.payload.chat_id;
                    const phoneNumber = task.payload.phone_number;

                    // A) Obtener Chunks del RAG (Conocimiento oficial)
                    const { data: ragChunks } = await supabase
                        .from('ai_knowledge_base')
                        .select('chunk_code, content, permission_level');
                    
                    const contextRAG = ragChunks 
                        ? ragChunks.map(c => `[${c.chunk_code}] ${c.content}`).join("\n")
                        : "";

                    // B) Llamada a la API de DeepSeek
                    const deepseekResponse = await fetch("https://api.deepseek.com/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${deepseekKey}`
                        },
                        body: JSON.stringify({
                            model: "deepseek-chat",
                            messages: [
                                { role: "system", content: `${ELENA_SYSTEM_PROMPT}\n\nCONOCIMIENTO OFICIAL RAG:\n${contextRAG}` },
                                { role: "user", content: userContent }
                            ],
                            temperature: 0.3,
                            max_tokens: 250
                        })
                    });

                    const responseData = await deepseekResponse.json();
                    let rawAiReply = responseData.choices?.[0]?.message?.content || "Disculpe, en este momento estamos con alta demanda. Una costurera le atenderá a la brevedad.";

                    // C) Clean Up: Sanitización de etiquetas <think> (DeepSeek-R1)
                    const cleanAiReply = rawAiReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

                    // D) Guardar respuesta de la IA en la base de datos
                    if (chatId) {
                        await supabase
                            .from('crm_chat_messages')
                            .insert([{
                                chat_id: chatId,
                                sender_type: 'ai_agent',
                                content: cleanAiReply
                            }]);
                    }

                    // E) Enviar respuesta a WhatsApp Cloud API (Meta)
                    const token = process.env.WHATSAPP_CLOUD_API_TOKEN || process.env.WHATSAPP_API_TOKEN;
                    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

                    if (token && phoneId && phoneNumber) {
                        await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                messaging_product: 'whatsapp',
                                to: phoneNumber,
                                type: 'text',
                                text: { body: cleanAiReply }
                            })
                        });
                    }

                    resultPayload = { action: 'replied', message: cleanAiReply };
                }

                // Marcar tarea como completada
                await supabase
                    .from('ai_agent_tasks')
                    .update({
                        status: 'completed',
                        result: resultPayload,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', task.id);

                results.push({ id: task.id, status: 'completed' });

            } catch (err: any) {
                console.error(`Task ${task.id} falló:`, err);
                await supabase
                    .from('ai_agent_tasks')
                    .update({
                        status: 'failed',
                        error_log: err.message,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', task.id);
                results.push({ id: task.id, status: 'failed', error: err.message });
            }
        }

        return NextResponse.json({ message: 'Tareas procesadas con exito', results });
    } catch (error: any) {
        console.error('Error en Orchestrator:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
