import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ADMIN_PHONE = '56984021940'; // Elena's notification target number

export async function POST(req: Request) {
    try {
        // Optional: simple token authorization to prevent spam if needed
        const { searchParams } = new URL(req.url);
        const secretToken = searchParams.get('secret') || req.headers.get('x-elena-secret');
        const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'elena_atelier_secret';

        if (secretToken && secretToken !== expectedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { fromName, fromEmail, subject } = body;

        if (!fromEmail || !subject) {
            return NextResponse.json({ error: 'Missing required fields (fromEmail, subject)' }, { status: 400 });
        }

        const name = fromName || fromEmail.split('@')[0]; // Fallback to email username if name is empty
        const email = fromEmail;
        const cleanSubject = subject.length > 80 ? subject.substring(0, 77) + '...' : subject;

        console.log(`[INCOMING EMAIL ALERTS] Processing notification for email from ${name} (${email})`);

        // 1. Prepare Meta WhatsApp Cloud API credentials
        const token = process.env.WHATSAPP_API_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const templateName = process.env.WHATSAPP_EMAIL_TEMPLATE_NAME || 'notificacion_correo_entrante';

        if (!token || !phoneId) {
            console.error('[INCOMING EMAIL ALERTS] Missing WhatsApp API credentials in .env.local');
            return NextResponse.json({ error: 'API credentials missing on server' }, { status: 500 });
        }

        // 2. Call WhatsApp Cloud API sending the approved utility template
        const fbResponse = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: ADMIN_PHONE,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: 'es'
                    },
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type: 'text',
                                    text: name
                                },
                                {
                                    type: 'text',
                                    text: email
                                },
                                {
                                    type: 'text',
                                    text: cleanSubject
                                }
                            ]
                        }
                    ]
                }
            })
        });

        const fbData = await fbResponse.json();

        if (!fbResponse.ok) {
            console.error('[INCOMING EMAIL ALERTS] Meta API error details:', JSON.stringify(fbData, null, 2));
            return NextResponse.json({ success: false, error: 'Meta API call failed', details: fbData }, { status: 502 });
        }

        // 3. Log notification inside Supabase for audits
        const supabase = await createClient();
        await supabase.from('notification_logs').insert({
            type: 'whatsapp_admin_alert',
            template: templateName,
            status: 'sent',
            metadata: {
                to: ADMIN_PHONE,
                sender: email,
                subject: cleanSubject,
                meta_message_id: fbData.messages?.[0]?.id
            }
        });

        return NextResponse.json({
            success: true,
            message: 'WhatsApp notification sent successfully',
            messageId: fbData.messages?.[0]?.id
        });

    } catch (error: any) {
        console.error('[INCOMING EMAIL ALERTS] Error sending alert:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
