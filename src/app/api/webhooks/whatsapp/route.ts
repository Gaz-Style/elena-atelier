import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { consultar_disponibilidad, agendar_visita } from '@/lib/agenda';

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

                    // 4. Trigger Auto-Reply if session is 'bot' and content is text
                    if (chatData.session_status === 'bot' && content) {
                        try {
                            const botReply = "¡Hola! Gracias por comunicarte con Elena Atelier ✨.\n\nEste es un número de notificaciones automáticas. Para recibir atención personalizada, cotizaciones o agendar tu visita al taller, por favor escríbele directamente a Elena a su WhatsApp personal haciendo clic aquí:\n👉 https://wa.me/56937667709\n\n¡Un abrazo, te esperamos!";
                            
                            // Save bot reply to DB
                            await supabase.from('crm_whatsapp_messages').insert([{
                                chat_id: chatData.id,
                                sender_type: 'bot',
                                message_type: 'text',
                                content: botReply
                            }]);

                            // Escalar a humano para no hacer loop si siguen respondiendo
                            await supabase.from('crm_whatsapp_chats')
                                .update({ session_status: 'human' })
                                .eq('id', chatData.id);
                                
                            // 5. Call WhatsApp Cloud API to send botReply back to the user
                            const token = process.env.WHATSAPP_API_TOKEN;
                            const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
                            
                            if (token && phoneId) {
                                const fbResponse = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        messaging_product: 'whatsapp',
                                        to: phoneNumber,
                                        type: 'text',
                                        text: { body: botReply }
                                    })
                                });
                                
                                if (!fbResponse.ok) {
                                    const errorData = await fbResponse.json();
                                    console.error('Error sending WhatsApp message:', JSON.stringify(errorData, null, 2));
                                }
                            } else {
                                console.error('Missing WhatsApp API credentials in .env.local');
                            }
                        } catch (err) {
                            console.error('Error sending auto-reply:', err);
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
