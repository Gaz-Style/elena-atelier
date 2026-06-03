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
                        .select('id')
                        .eq('phone_number', phoneNumber)
                        .single();

                    if (!chatData) {
                        // Create a new chat session
                        const { data: newChat, error: newChatError } = await supabase
                            .from('crm_whatsapp_chats')
                            .insert([{ phone_number: phoneNumber }])
                            .select('id')
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

                    // 3. Save message to database (This triggers the AI agent queue via Phase 3 SQL trigger)
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
