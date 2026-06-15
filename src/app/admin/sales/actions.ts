'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';

export async function requestSaleDeletionAuthorizationAction(payload: {
    internalId: string;
    totalAmount: number;
    paymentMethod: string;
}) {
    const { internalId, totalAmount, paymentMethod } = payload;
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPassword = process.env.SMTP_PASSWORD || '';

    if (!smtpUser || !smtpPassword) {
        console.error('Faltan variables SMTP_USER o SMTP_PASSWORD.');
        return { success: false, error: 'Credenciales de correo no configuradas.' };
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: smtpUser,
            pass: smtpPassword,
        },
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
    };

    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px;">
        <h2>⚠️ Autorización de Eliminación de Venta Requerida</h2>
        <p>Se está intentando eliminar una venta en el panel administrativo.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr><td style="padding: 5px; border-bottom: 1px solid #ccc;"><b>Transacción:</b></td><td style="padding: 5px; border-bottom: 1px solid #ccc;">${internalId}</td></tr>
            <tr><td style="padding: 5px; border-bottom: 1px solid #ccc;"><b>Monto Total:</b></td><td style="padding: 5px; border-bottom: 1px solid #ccc; color: #d9534f; font-weight: bold;">${formatCurrency(totalAmount)}</td></tr>
            <tr><td style="padding: 5px; border-bottom: 1px solid #ccc;"><b>Medio de Pago:</b></td><td style="padding: 5px; border-bottom: 1px solid #ccc; text-transform: capitalize;">${paymentMethod?.replace(/_/g, ' ') || 'No registrado'}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: #f8d7da; color: #721c24; border-radius: 5px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">Si apruebas esta eliminación, dicta el siguiente PIN al operador:</p>
            <h1 style="margin: 10px 0 0 0; font-size: 36px; letter-spacing: 5px;">${pin}</h1>
        </div>
    </div>
    `;

    // 1. Send Email (non-blocking)
    try {
        const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;
        const toAddress = smtpUser; // Send to admin

        await transporter.sendMail({
            from: `"ELENA Admin Alertas" <${fromAddress}>`,
            to: toAddress,
            subject: `[URGENTE] Autorización de Eliminación - Venta ${internalId}`,
            html: htmlContent,
        });
    } catch (emailErr) {
        console.error('Error enviando email de autorización de eliminación:', emailErr);
    }

    // 2. Send WhatsApp Notification
    try {
        const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
        if (WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_API_TOKEN) {
            const numerosEncargados = ['56984021940', '56937667709'];
            for (const numeroEncargado of numerosEncargados) {
                try {
                    // Send alert_pos template with custom details
                    await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            messaging_product: 'whatsapp',
                            to: numeroEncargado,
                            type: 'template',
                            template: {
                                name: 'alerta_pos',
                                language: {
                                    code: 'es_CL'
                                },
                                components: [
                                    {
                                        type: 'body',
                                        parameters: [
                                            { type: 'text', text: 'Panel Admin' },
                                            { type: 'text', text: `Eliminar Venta ${internalId}` },
                                            { type: 'text', text: '100% (Eliminación)' },
                                            { type: 'text', text: formatCurrency(totalAmount) },
                                            { type: 'text', text: `${pin} Confirmar` }
                                        ]
                                    }
                                ]
                            }
                        })
                    });
                } catch (wspErr) {
                    console.error(`Error enviando WhatsApp de eliminación a ${numeroEncargado}:`, wspErr);
                }
            }
        }
    } catch (wspOuterErr) {
        console.error('Error general en el envío de WhatsApp de autorización de eliminación:', wspOuterErr);
    }

    return { success: true, pin };
}

export async function deleteSaleAction(saleId: string) {
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await supabase
        .from('sales_ledger')
        .delete()
        .eq('id', saleId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/sales');
    return { success: true };
}
