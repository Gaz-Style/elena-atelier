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
    const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (WHATSAPP_API_TOKEN && PHONE_NUMBER_ID) {
        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: chatData } = await adminClient
            .from('crm_whatsapp_chats')
            .select('phone_number')
            .eq('id', chatId)
            .single();

        if (chatData?.phone_number) {
            try {
                const wRes = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
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
                const wData = await wRes.json();
                console.log('LiveChat send response:', wData);
                if (wData.error) {
                    return { success: false, error: wData.error.message };
                }
            } catch (e: any) {
                console.error('Error sending WhatsApp from LiveChat:', e);
                return { success: false, error: e.message };
            }
        }
    }

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

export async function sendWhatsAppTemplateAction(chatId: string, templateName: string, params: string[]) {
    const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!WHATSAPP_API_TOKEN || !PHONE_NUMBER_ID) {
        return { success: false, error: 'Configuración de WhatsApp incompleta (Falta Token o ID de teléfono)' };
    }

    // 1. Fetch phone number using admin client (service role)
    let phoneNumber: string | null = null;
    try {
        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: chatData } = await adminClient
            .from('crm_whatsapp_chats')
            .select('phone_number')
            .eq('id', chatId)
            .single();
        phoneNumber = chatData?.phone_number ?? null;
    } catch (dbErr) {
        console.error('Error fetching phone number from DB:', dbErr);
    }

    if (!phoneNumber) {
        return { success: false, error: 'No se encontró el número de teléfono. Verifica la conexión con la base de datos.' };
    }

    // Determine correct language code
    let langCode = 'es';
    if (templateName === 'confirmacion_pago_client' || templateName === 'alerta_pos' || templateName === 'cita_confirmada_cliente' || templateName === 'alerta_nueva_cita') {
        langCode = 'es_CL';
    } else if (templateName === 'alerta_pago_recibido' || templateName === 'hello_world') {
        langCode = 'en';
    }

    // 2. Send template to CLIENT via Meta API
    try {
        const wRes = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: langCode },
                    components: [{
                        type: 'body',
                        parameters: params.map(p => ({ type: 'text', text: p }))
                    }]
                }
            })
        });

        const wData = await wRes.json();
        console.log('WhatsApp template send response (cliente):', wData);

        if (wData.error) {
            return { success: false, error: `Meta API: ${wData.error.message}` };
        }
    } catch (e: any) {
        console.error('Error sending WhatsApp template to client:', e);
        return { success: false, error: `Error de red al enviar a cliente: ${e.message}` };
    }

    // 3. Send payment alerts to owners/managers (non-blocking - doesn't affect success)
    if (templateName === 'confirmacion_pago_cliente') {
        const ownerNums = ['56984021940', '56937667709'];
        for (const ownerNum of ownerNums) {
            fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: ownerNum,
                    type: 'template',
                    template: {
                        name: 'alerta_pago_recibido',
                        language: { code: 'es' },
                        components: [{
                            type: 'body',
                            parameters: params.map(p => ({ type: 'text', text: p }))
                        }]
                    }
                })
            })
            .then(r => r.json())
            .then(d => console.log(`WhatsApp encargado (${ownerNum}):`, d))
            .catch(err => console.error(`Error WhatsApp encargado (${ownerNum}):`, err));
        }
    }

    // 4. Record message in DB (non-blocking)
    let readableContent = '';
    if (templateName === 'confirmacion_pago_cliente') {
        readableContent = `✅ *Confirmación de Pago Enviada*\n\nEstimada ${params[0]}, confirmamos el pago de tu prenda *${params[1]}* por un valor de *${params[2]}* (ID Orden: ${params[3]}) a través de *${params[4]}*. ¡Tu proyecto ya está en proceso!`;
    } else {
        readableContent = `[Plantilla enviada: ${templateName}]\n` + params.map((p, idx) => `P${idx + 1}: ${p}`).join('\n');
    }

    try {
        const supabase = await createClient();
        await Promise.all([
            supabase.from('crm_whatsapp_messages').insert([{
                chat_id: chatId,
                sender_type: 'human',
                message_type: 'text',
                content: readableContent
            }]),
            supabase.from('crm_whatsapp_chats').update({
                session_status: 'human_handoff',
                last_interaction: new Date().toISOString()
            }).eq('id', chatId)
        ]);
    } catch (dbErr) {
        // Non-fatal: WhatsApp was already sent successfully
        console.error('Error recording template to DB (non-fatal):', dbErr);
    }

    return { success: true };
}


