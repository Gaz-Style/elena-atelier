import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const to = searchParams.get('to') || '56984021940';
        const name = searchParams.get('name') || 'Julieta';
        const reviewUrl = 'https://www.elenalacosturera.cl/opiniones';

        const reviewMessageText = `Hola ${name}, qué gusto saludarte. Esperamos que tu experiencia y la atención en nuestro taller hayan sido de tu completo agrado. ✨\n\nTu opinión es muy importante para nuestro equipo, ya que nos ayuda muchísimo a seguir mejorando y a que más personas nos conozcan en Vitacura.\n\n¿Nos regalarías un minuto para dejarnos tu valoración en Google? Puedes hacerlo directamente en este enlace:\n\n${reviewUrl}\n\n¡Muchísimas gracias por tu tiempo y por confiar en nosotras!\n\nElena La Costurera`;

        const token = process.env.WHATSAPP_API_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!token || !phoneId) {
            return NextResponse.json({ success: false, error: 'Credenciales de WhatsApp no configuradas en Vercel' }, { status: 500 });
        }

        const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: to,
                type: 'text',
                text: {
                    preview_url: true,
                    body: reviewMessageText
                }
            })
        });

        const metaData = await res.json();
        console.log('Test review send response:', metaData);

        // Record in Supabase LiveChat history
        if (!metaData.error) {
            try {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );

                const { data: chat } = await supabase
                    .from('crm_whatsapp_chats')
                    .select('id')
                    .or(`phone_number.eq.${to},phone_number.eq.+${to}`)
                    .single();

                if (chat) {
                    await Promise.all([
                        supabase.from('crm_whatsapp_messages').insert([{
                            chat_id: chat.id,
                            sender_type: 'human',
                            message_type: 'text',
                            content: `⭐ *Solicitud de Reseña en Google Enviada*\n\n${reviewMessageText}`
                        }]),
                        supabase.from('crm_whatsapp_chats').update({
                            session_status: 'human_handoff',
                            last_interaction: new Date().toISOString()
                        }).eq('id', chat.id)
                    ]);
                }
            } catch (dbErr) {
                console.error('Error logging to Supabase DB:', dbErr);
            }
        }

        return NextResponse.json({
            success: !metaData.error,
            sentTo: to,
            metaResponse: metaData
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

