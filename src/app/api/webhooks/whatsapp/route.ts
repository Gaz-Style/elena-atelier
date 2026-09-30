import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: Request) {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            return new NextResponse(challenge, { status: 200 });
        } else {
            return new NextResponse('Forbidden', { status: 403 });
        }
    }
    return new NextResponse('Bad Request', { status: 400 });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (body.object === 'whatsapp_business_account') {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    const value = change.value;
                    const message = value.messages?.[0];

                    if (!message) continue;

                    const phoneNumber = value.contacts?.[0]?.wa_id;
                    const contactName = value.contacts?.[0]?.profile?.name || 'Cliente';
                    const messageId = message.id;

                    // 1. Get or create Chat Session
                    let { data: chatData } = await supabase
                        .from('crm_whatsapp_chats')
                        .select('*')
                        .eq('phone_number', phoneNumber)
                        .single();

                    if (!chatData) {
                        const { data: newChat, error: chatError } = await supabase
                            .from('crm_whatsapp_chats')
                            .insert([{
                                phone_number: phoneNumber,
                                session_status: 'bot',
                                last_interaction: new Date().toISOString()
                            }])
                            .select()
                            .single();

                        if (chatError || !newChat) {
                            console.error('Error creating chat session:', chatError);
                            continue;
                        }
                        chatData = newChat;

                        // Try to link to existing customer
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
                    let geminiAnalysis = null;

                    if (message.type === 'text') {
                        content = message.text.body;
                    } else if (message.type === 'image') {
                        messageType = 'image';
                        mediaUrl = message.image.id; 
                        content = message.image.caption || '';
                        
                        // El procesamiento de la imagen con Gemini Vision se ha movido al orquestador asíncrono
                        // para evitar que WhatsApp de timeout (límite de 3 segundos).
                        if (mediaUrl) {
                            console.log(`[Webhook] Imagen recibida: ${mediaUrl}. Se procesará en background.`);
                        }
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
                    if (chatData.session_status === 'bot' && (content || messageType === 'image')) {
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

                            let shouldEnqueue = true;

                            if (existingTasks && existingTasks.length > 0) {
                                if (messageType === 'image') {
                                    // IMAGEN: Esperar a que la tarea activa termine (máx 8 segundos) y luego encolar la foto
                                    console.log(`[Webhook] Imagen recibida con tarea activa. Esperando hasta 8s...`);
                                    let waited = 0;
                                    while (waited < 8000) {
                                        await new Promise(r => setTimeout(r, 1500));
                                        waited += 1500;
                                        const { data: checkTasks } = await supabase
                                            .from('ai_agent_tasks')
                                            .select('id')
                                            .eq('agent_role', 'whatsapp_closer')
                                            .in('status', ['pending', 'processing'])
                                            .filter('payload->>chat_id', 'eq', chatData.id);
                                        if (!checkTasks || checkTasks.length === 0) break;
                                    }
                                    // Siempre encolar la imagen después de esperar
                                    shouldEnqueue = true;
                                } else {
                                    // Texto duplicado: ignorar
                                    console.log(`[Webhook] Tarea activa para chat ${chatData.id}. Texto duplicado omitido.`);
                                    shouldEnqueue = false;
                                }
                            }

                            if (shouldEnqueue) {
                                // Encolar tarea asíncrona para que la procese el worker de IA
                                const { data: newTask, error: insertError } = await supabase
                                    .from('ai_agent_tasks')
                                    .insert([{
                                        agent_role: 'whatsapp_closer',
                                        status: 'pending',
                                        error_log: (process.env.QSTASH_TOKEN ? 'HAS_TOKEN' : 'NO_TOKEN') + ' | URL: ' + (process.env.QSTASH_URL || 'empty'),
                                        payload: {
                                            chat_id: chatData.id,
                                            phone_number: phoneNumber,
                                            content: content,
                                            message_type: messageType,
                                            media_url: mediaUrl,
                                            message_id: messageId,
                                            gemini_analysis: geminiAnalysis
                                        }
                                    }]).select().single();

                                if (insertError || !newTask) {
                                    console.error('Error inserting task:', insertError);
                                    return NextResponse.json({ status: 'success' }, { status: 200 }); // Retornamos OK a Meta para evitar reintentos
                                }

                                // Utilizar QStash para disparar el Orquestador usando fetch nativo
                                try {
                                    if (process.env.QSTASH_TOKEN) {
                                        const qstashUrl = process.env.QSTASH_URL || 'https://qstash.upstash.io';
                                        // Limpiar la URL base por si tiene un slash final
                                        const baseUrl = qstashUrl.endsWith('/') ? qstashUrl.slice(0, -1) : qstashUrl;
                                        
                                        const res = await fetch(`${baseUrl}/v2/publish/https://www.elenalacosturera.cl/api/orchestrator`, {
                                            method: 'POST',
                                            headers: {
                                                'Authorization': `Bearer ${process.env.QSTASH_TOKEN}`,
                                                'Content-Type': 'application/json',
                                                'Upstash-Forward-Authorization': `Bearer ${process.env.CRON_SECRET || 'antigravity-secret'}`
                                            },
                                            body: JSON.stringify({ ping: 'webhook' })
                                        });

                                        if (!res.ok) {
                                            const errorText = await res.text();
                                            console.error(`[QStash Error] Fallo al publicar: ${res.status} - ${errorText}`);
                                            await supabase.from('ai_agent_tasks').update({ error_log: `QStash Error: ${res.status} - ${errorText}` }).eq('id', newTask.id);
                                        } else {
                                            console.log(`[QStash] Ping exitoso al orquestador.`);
                                        }
                                    } else {
                                        console.warn("QSTASH_TOKEN no está configurado en .env.local.");
                                        await supabase.from('ai_agent_tasks').update({ error_log: `QSTASH_TOKEN missing in Vercel env vars` }).eq('id', newTask.id);
                                    }
                                } catch (e: any) {
                                    console.error('Error de red disparando QStash:', e);
                                    await supabase.from('ai_agent_tasks').update({ error_log: `Fetch Exception: ${e.message}` }).eq('id', newTask.id);
                                }
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
