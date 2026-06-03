'use server';

import { createClient } from '@/lib/supabase/server';

export async function getWhatsAppChatsAction() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('crm_whatsapp_chats')
        .select(`
            *,
            customers (full_name)
        `)
        .order('last_interaction', { ascending: false });

    if (error) {
        console.error('Error fetching chats:', error);
        return [];
    }
    return data || [];
}

export async function getWhatsAppMessagesAction(chatId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('crm_whatsapp_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
    return data || [];
}

export async function sendWhatsAppMessageAction(chatId: string, content: string) {
    const supabase = await createClient();
    
    // 1. Insert message into DB as human
    const { error: insertError } = await supabase
        .from('crm_whatsapp_messages')
        .insert([{
            chat_id: chatId,
            sender_type: 'human',
            message_type: 'text',
            content: content
        }]);

    if (insertError) {
        return { success: false, error: insertError.message };
    }

    // 2. Update chat session status to human_handoff and update last interaction
    await supabase
        .from('crm_whatsapp_chats')
        .update({
            session_status: 'human_handoff',
            last_interaction: new Date().toISOString()
        })
        .eq('id', chatId);

    // 3. Actually send the message via WhatsApp Cloud API
    // const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
    // const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    /*
    const { data: chatData } = await supabase.from('crm_whatsapp_chats').select('phone_number').eq('id', chatId).single();
    if (chatData) {
        await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: chatData.phone_number,
                type: 'text',
                text: { body: content }
            })
        });
    }
    */

    return { success: true };
}

export async function toggleBotSessionAction(chatId: string, enableBot: boolean) {
    const supabase = await createClient();
    const status = enableBot ? 'bot' : 'human_handoff';
    
    const { error } = await supabase
        .from('crm_whatsapp_chats')
        .update({ session_status: status })
        .eq('id', chatId);
        
    return { success: !error, error: error?.message };
}
