import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { consultar_disponibilidad, agendar_visita } from '@/lib/agenda';
import { processAITasks } from '@/app/api/orchestrator/route';
import { waitUntil } from '@vercel/functions';

export const maxDuration = 60; // Max execution time for Vercel Hobby plan

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'elena_atelier_secret';

// Handle webhook verification (GET request from Meta)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
        console.log('WhatsApp Webhook verified!');
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse('Forbidden', { status: 403 });
}

// Handle incoming messages (POST request from Meta)
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Check if this is a WhatsApp API message event
        if (body.object !== 'whatsapp_business_account') {
            return new NextResponse('Not a WhatsApp event', { status: 404 });
        }

        const supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        for (const entry of body.entry) {
            for (const change of entry.changes) {
                const value = change.value;
                // Ignorar eventos de estado (read, delivered, sent) para evitar duplicados y respuestas no deseadas
                if (value && value.statuses) {
                    continue;
                }

                if (value && value.messages && value.messages.length > 0) {
                    const message = value.messages[0];
                    const contact = value.contacts?.[0];
                    const phoneNumber = message.from; // Sender's phone number
                    const messageId = message.id;

                    // 1. Find or create the chat session
                    let { data: chatData, error: chatError } = await supabase
                        .from('crm_whatsapp_chats')
                        .select('id, session_status, customer_id')
                        .eq('phone_number', phoneNumber)
                        .single();

                    if (!chatData) {
                        // Buscar coincidencia de cliente por teléfono
                        const { data: customers } = await supabase
                            .from('customers')
                            .select('id, phone')
                            .not('phone', 'is', null);
                        
                        const cleanDigits = (n: string) => n ? n.replace(/\D/g, '') : '';
                        const chatDigits = cleanDigits(phoneNumber);
                        let matchedCustomerId = null;
                        
                        if (customers) {
                            const match = customers.find(c => {
                                const custDigits = cleanDigits(c.phone);
                                return custDigits && (custDigits.slice(-9) === chatDigits.slice(-9));
                            });
                            if (match) matchedCustomerId = match.id;
                        }

                        // Create a new chat session
                        const { data: newChat, error: newChatError } = await supabase
                            .from('crm_whatsapp_chats')
                            .insert([{ 
                                phone_number: phoneNumber, 
                                session_status: 'bot',
                                customer_id: matchedCustomerId
                            }])
                            .select('id, session_status, customer_id')
                            .single();

                        if (newChatError) {
                            console.error('Error creating chat:', newChatError);
                            continue;
                        }
                        chatData = newChat;
                    } else if (!chatData.customer_id) {
                        // Si el chat ya existe pero no está enrolado, buscar y enrolar proactivamente
                        const { data: customers } = await supabase
                            .from('customers')
                            .select('id, phone')
                            .not('phone', 'is', null);
                        
                        const cleanDigits = (n: string) => n ? n.replace(/\D/g, '') : '';
                        const chatDigits = cleanDigits(phoneNumber);
                        
                        if (customers) {
                            const match = customers.find(c => {
                                const custDigits = cleanDigits(c.phone);
                                return custDigits && (custDigits.slice(-9) === chatDigits.slice(-9));
                            });
                            if (match) {
                                await supabase
                                    .from('crm_whatsapp_chats')
                                    .update({ customer_id: match.id })
                                    .eq('id', chatData.id);
                            }
                        }
                    }

                    // 2. Parse message content
                    let content = '';
                    let messageType = 'text';
                    let mediaUrl = null;

                    if (message.type === 'text') {
                        content = message.text.body;
                    } else if (message.type === 'image') {
                        messageType = 'image';
                        mediaUrl = message.image.id; // Just storing media ID for now
                        content = message.image.caption || '';
                    } else if (message.type === 'audio') {
                        messageType = 'audio';
                        mediaUrl = message.audio.id;
                    }

                    // 3. Save user message to database
                    const { error: msgError } = await supabase
                        .from('crm_whatsapp_messages')
                        .insert([{
                            chat_id: chatData.id,
                            sender_type: 'customer',
                            message_type: messageType,
                            content: content,
                            media_url: mediaUrl
                        }]);

                    if (msgError) {
                        console.error('Error saving message:', msgError);
                        continue;
                    }

                    // Update last_interaction timestamp on chat session
                    await supabase
                        .from('crm_whatsapp_chats')
                        .update({ last_interaction: new Date().toISOString() })
                        .eq('id', chatData.id);

                    // 4. Trigger AI Processing Task if session is 'bot'
                    if (chatData.session_status === 'bot' && content) {
                        try {
                            // Auto-limpiar tareas atascadas (>3 min) para este chat antes de verificar debounce
                            const threeMinAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
                            await supabase
                                .from('ai_agent_tasks')
                                .update({ status: 'failed', error_log: 'Auto-limpieza: tarea excedió 3min timeout', processed_at: new Date().toISOString() })
                                .eq('agent_role', 'whatsapp_closer')
                                .in('status', ['pending', 'processing'])
                                .filter('payload->>chat_id', 'eq', chatData.id)
                                .lt('created_at', threeMinAgo);

                            // Verificar si hay tareas recientes activas para evitar ráfagas duplicadas
                            const { data: existingTasks } = await supabase
                                .from('ai_agent_tasks')
                                .select('id')
                                .eq('agent_role', 'whatsapp_closer')
                                .in('status', ['pending', 'processing'])
                                .filter('payload->>chat_id', 'eq', chatData.id);

                            if (existingTasks && existingTasks.length > 0) {
                                console.log(`Ya existe una tarea activa para el chat ${chatData.id}. Omitiendo encolamiento duplicado.`);
                            } else {
                                // Encolar tarea asíncrona para que la procese el worker de IA
                                const { data: newTask, error: insertError } = await supabase
                                    .from('ai_agent_tasks')
                                    .insert([{
                                        agent_role: 'whatsapp_closer',
                                        status: 'pending',
                                        payload: {
                                            chat_id: chatData.id,
                                            phone_number: phoneNumber,
                                            content: content,
                                            message_type: messageType,
                                            media_url: mediaUrl,
                                            message_id: messageId
                                        }
                                    }]).select().single();

                                if (insertError || !newTask) {
                                    console.error('Error inserting task:', insertError);
                                    return NextResponse.json({ status: 'success' }, { status: 200 }); // Retornamos OK a Meta para evitar reintentos
                                }

                                // Vercel Native Background Task: usamos waitUntil para que Vercel NO congele la función
                                // hasta que termine el Orquestador, pero le devolvemos el 200 OK a WhatsApp inmediatamente.
                                waitUntil(
                                    (async () => {
                                        console.log(`[Webhook] Ejecutando Orquestador vía waitUntil para tarea: ${newTask.id}`);
                                        try {
                                            await processAITasks(supabase);
                                        } catch (err: any) {
                                            console.error('Error en processAITasks (waitUntil):', err);
                                            await supabase.from('ai_agent_tasks').update({ error_log: `waitUntil exception: ${err.message}` }).eq('id', newTask.id);
                                        }
                                    })()
                                );
                            }

                        } catch (botErr) {
                            console.error('Error encolando tarea de IA:', botErr);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ status: 'success' }, { status: 200 });

    } catch (error) {
        console.error('Error processing WhatsApp Webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
