import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

        const supabase = await createClient();

        for (const entry of body.entry) {
            for (const change of entry.changes) {
                const value = change.value;
                if (value && value.messages && value.messages.length > 0) {
                    const message = value.messages[0];
                    const contact = value.contacts?.[0];
                    const phoneNumber = message.from; // Sender's phone number
                    const messageId = message.id;

                    // 1. Find or create the chat session
                    let { data: chatData, error: chatError } = await supabase
                        .from('crm_whatsapp_chats')
                        .select('id, session_status')
                        .eq('phone_number', phoneNumber)
                        .single();

                    if (!chatData) {
                        // Create a new chat session
                        const { data: newChat, error: newChatError } = await supabase
                            .from('crm_whatsapp_chats')
                            .insert([{ phone_number: phoneNumber, session_status: 'bot' }])
                            .select('id, session_status')
                            .single();

                        if (newChatError) {
                            console.error('Error creating chat:', newChatError);
                            continue;
                        }
                        chatData = newChat;
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

                    // 4. Trigger AI if session is 'bot' and content is text
                    if (chatData.session_status === 'bot' && content) {
                        try {
                            const { OpenAI } = await import('openai');
                            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                            
                            // Get recent conversation context
                            const { data: recentMsgs } = await supabase
                                .from('crm_whatsapp_messages')
                                .select('*')
                                .eq('chat_id', chatData.id)
                                .order('created_at', { ascending: true })
                                .limit(10);
                                
                            const conversation = recentMsgs?.map(msg => ({
                                role: msg.sender_type === 'customer' ? 'user' : 'assistant',
                                content: msg.content || ''
                            })) || [];
                            
                            const systemPrompt = {
                                role: 'system',
                                content: `Eres The Luxury Closer, el asesor virtual de Elena Atelier, una exclusiva casa de alta costura y sastrería a medida en Vitacura. 
Tu tono es amable, sofisticado, exclusivo y resolutivo.
Precios base de referencia:
- Ajustes simples (bastillas): desde $15.000 CLP.
- Vestidos de fiesta a medida: desde $350.000 CLP.
- Vestidos de novia a medida: desde $850.000 CLP.
Tiempos de costura:
- Ajustes: 3 a 7 días.
- Vestidos a medida: 3 a 5 semanas.
Si el cliente muestra una intención clara de compra o agenda, o pide hablar con un humano, indícale amablemente que le transferirás con un asesor humano y despídete temporalmente.`
                            };

                            const completion = await openai.chat.completions.create({
                                model: 'gpt-4o-mini',
                                messages: [systemPrompt, ...conversation] as any,
                            });
                            
                            const botReply = completion.choices[0].message.content;
                            
                            if (botReply) {
                                // Save bot reply to DB
                                await supabase.from('crm_whatsapp_messages').insert([{
                                    chat_id: chatData.id,
                                    sender_type: 'bot',
                                    message_type: 'text',
                                    content: botReply
                                }]);
                                
                                // Check if we need to hand off to human
                                const isHandoff = botReply.toLowerCase().includes('asesor') || 
                                                  botReply.toLowerCase().includes('humano') || 
                                                  botReply.toLowerCase().includes('transferir');
                                
                                if (isHandoff) {
                                    await supabase.from('crm_whatsapp_chats')
                                        .update({ session_status: 'human_handoff' })
                                        .eq('id', chatData.id);
                                }
                                
                                // TODO: Call WhatsApp Cloud API to send botReply back to the user
                                // ...
                            }
                        } catch (err) {
                            console.error('Error generating AI reply:', err);
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
