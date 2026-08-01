import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const ADMIN_PHONE = '56984021940';

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secretToken = searchParams.get('secret') || req.headers.get('x-elena-secret');
        const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'elena_atelier_secret';

        if (secretToken && secretToken !== expectedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { fromName, fromEmail, subject, bodyText, bodyHtml } = body;

        if (!fromEmail || !subject) {
            return NextResponse.json({ error: 'Missing required fields (fromEmail, subject)' }, { status: 400 });
        }

        const name = fromName || fromEmail.split('@')[0];
        const cleanSubject = subject.length > 80 ? subject.substring(0, 77) + '...' : subject;

        console.log(`[INCOMING EMAIL] From: ${name} <${fromEmail}> — Subject: "${cleanSubject}"`);

        const supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Try to match sender email to a known customer
        const { data: matchedCustomer } = await supabase
            .from('customers')
            .select('id, full_name, email')
            .eq('email', fromEmail.toLowerCase().trim())
            .single();

        // 2. Save inbound email in crm_email_threads
        await supabase.from('crm_email_threads').insert({
            customer_id: matchedCustomer?.id || null,
            subject: cleanSubject,
            direction: 'inbound',
            sender: fromEmail,
            recipient: 'contacto@elenalacosturera.cl',
            body_text: bodyText || null,
            body_html: bodyHtml || null,
            read_at: null  // unread by default
        });

        // 3. Send WhatsApp notification to admin
        const token = process.env.WHATSAPP_API_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const templateName = process.env.WHATSAPP_EMAIL_TEMPLATE_NAME || 'notificacion_correo_entrante';

        if (token && phoneId) {
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
                        language: { code: 'es_CL' },
                        components: [{
                            type: 'body',
                            parameters: [
                                { type: 'text', text: name },
                                { type: 'text', text: fromEmail },
                                { type: 'text', text: cleanSubject }
                            ]
                        }]
                    }
                })
            });

            const fbData = await fbResponse.json();
            if (!fbResponse.ok) {
                console.error('[INCOMING EMAIL] WhatsApp notification failed:', JSON.stringify(fbData));
            }
        }

        // 4. Log audit in notification_logs
        await supabase.from('notification_logs').insert({
            type: 'whatsapp_admin_alert',
            template: templateName ?? 'notificacion_correo_entrante',
            status: 'sent',
            metadata: {
                direction: 'inbound',
                customer_id: matchedCustomer?.id,
                sender: fromEmail,
                subject: cleanSubject,
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Inbound email registered and admin notified.',
            matched_customer: matchedCustomer?.full_name || null
        });

    } catch (error: any) {
        console.error('[INCOMING EMAIL] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
