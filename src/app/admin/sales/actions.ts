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

export async function updateSaleStatusAction(saleId: string, status: string) {
    const supabase = await createClient();
    
    // 1. Obtener la venta original
    const { data: saleData } = await supabase
        .from('sales_ledger')
        .select('total_amount, internal_id')
        .eq('id', saleId)
        .single();
        
    if (!saleData) {
        return { success: false, error: 'Venta no encontrada' };
    }

    let updateData: any = { status };
    let newPaymentStatus = 'pending';
    
    if (status === 'completed') {
        updateData.paid_amount = saleData.total_amount;
        newPaymentStatus = 'paid';
    } else if (status === 'pending') {
        updateData.paid_amount = 0;
        newPaymentStatus = 'pending';
    }

    // 2. Actualizar sales_ledger
    const { error } = await supabase
        .from('sales_ledger')
        .update(updateData)
        .eq('id', saleId);

    if (error) {
        return { success: false, error: error.message };
    }
    
    // 3. Sincronizar en cascada production_orders (Producción)
    if (status === 'completed' || status === 'pending') {
         await supabase
            .from('production_orders')
            .update({
                payment_status: newPaymentStatus,
                paid_amount: updateData.paid_amount
            })
            .eq('pos_order_id', saleData.internal_id);
    }

    revalidatePath('/admin/sales');
    revalidatePath(`/admin/sales/${saleId}`);
    revalidatePath('/admin/production');
    revalidatePath('/admin/production-board');
    return { success: true };
}

export async function requestSaleStatusAuthorizationAction(payload: {
    internalId: string;
    totalAmount: number;
    currentStatus: string;
    newStatus: string;
}) {
    const { internalId, totalAmount, currentStatus, newStatus } = payload;
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
        <h2>⚠️ Autorización de Cambio de Estado Requerida</h2>
        <p>Se está intentando cambiar el estado de una venta en el panel administrativo.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr><td style="padding: 5px; border-bottom: 1px solid #ccc;"><b>Transacción:</b></td><td style="padding: 5px; border-bottom: 1px solid #ccc;">${internalId}</td></tr>
            <tr><td style="padding: 5px; border-bottom: 1px solid #ccc;"><b>Monto Total:</b></td><td style="padding: 5px; border-bottom: 1px solid #ccc;">${formatCurrency(totalAmount)}</td></tr>
            <tr><td style="padding: 5px; border-bottom: 1px solid #ccc;"><b>Estado Actual:</b></td><td style="padding: 5px; border-bottom: 1px solid #ccc; text-transform: uppercase;">${currentStatus}</td></tr>
            <tr><td style="padding: 5px; border-bottom: 1px solid #ccc;"><b>Nuevo Estado:</b></td><td style="padding: 5px; border-bottom: 1px solid #ccc; text-transform: uppercase; color: #d9534f; font-weight: bold;">${newStatus}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: #f8d7da; color: #721c24; border-radius: 5px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">Si apruebas este cambio, dicta el siguiente PIN al operador:</p>
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
            subject: `[URGENTE] Autorización de Cambio de Estado - Venta ${internalId}`,
            html: htmlContent,
        });
    } catch (emailErr) {
        console.error('Error enviando email de autorización de estado:', emailErr);
    }

    // 2. Send WhatsApp Notification
    try {
        const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
        if (WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_API_TOKEN) {
            const numerosEncargados = ['56984021940', '56937667709'];
            for (const numeroEncargado of numerosEncargados) {
                try {
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
                                            { type: 'text', text: `Estado ${internalId} a ${newStatus}` },
                                            { type: 'text', text: `${currentStatus} -> ${newStatus}` },
                                            { type: 'text', text: formatCurrency(totalAmount) },
                                            { type: 'text', text: `${pin} Autorizar` }
                                        ]
                                    }
                                ]
                            }
                        })
                    });
                } catch (wspErr) {
                    console.error(`Error enviando WhatsApp de estado a ${numeroEncargado}:`, wspErr);
                }
            }
        }
    } catch (wspOuterErr) {
        console.error('Error general en el envío de WhatsApp de autorización de estado:', wspOuterErr);
    }

    return { success: true, pin };
}
/**
 * cobrarEnCajaAction
 * ─────────────────────────────────────────────────────────────────────────
 * Convierte una venta pendiente (Transbank fallido u otro) en un cobro
 * presencial en caja. Hace tres cosas atómicamente:
 *   1. Actualiza sales_ledger: status = 'completed', payment_method = metodo elegido
 *   2. Si hay una caja abierta, registra un cash_movement de tipo 'in'
 *   3. Revalida las rutas relevantes
 */
export async function cobrarEnCajaAction(payload: {
    saleId: string;
    internalId: string;
    totalAmount: number;
    paymentMethod: 'mercadopago_point' | 'cash';
    splitCardAmount?: number;
    splitCashAmount?: number;
}) {
    const { saleId, internalId, totalAmount, paymentMethod, splitCardAmount = 0, splitCashAmount = 0 } = payload;
    
    // Import MP action
    const { wakeUpMercadoPagoTerminalAction } = await import('../pos/actions');

    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let finalPaymentMethodStr = paymentMethod as string;
    if (paymentMethod === 'cash') {
        if (splitCardAmount > 0) {
            finalPaymentMethodStr = `Mixto (Máquina: $${splitCardAmount}, Efectivo: $${splitCashAmount})`;
        } else {
            finalPaymentMethodStr = 'Efectivo / Transferencia';
        }
    }

    // Wake up MP if needed
    if (paymentMethod === 'mercadopago_point' || (paymentMethod === 'cash' && splitCardAmount > 0)) {
        const mpDesc = `Cobro Caja — Venta ${internalId}`;
        const amountToCharge = (paymentMethod === 'cash' && splitCardAmount > 0) ? splitCardAmount : totalAmount;
        const mpRes = await wakeUpMercadoPagoTerminalAction(amountToCharge, mpDesc, internalId);
        if (!mpRes.success) {
            return { success: false, error: 'Error enviando señal a maquinita: ' + mpRes.error };
        }
    }

    // 1. Marcar la venta como completada y actualizar método de pago
    const { error: saleError } = await supabase
        .from('sales_ledger')
        .update({
            status: 'completed',
            payment_method: finalPaymentMethodStr,
        })
        .eq('id', saleId);

    if (saleError) {
        return { success: false, error: 'Error al actualizar la venta: ' + saleError.message };
    }

    // 2. Buscar caja abierta y registrar ingreso en efectivo
    const { data: openRegister } = await supabase
        .from('cash_registers')
        .select('id')
        .eq('status', 'open')
        .order('opened_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (openRegister) {
        const cashNum = Math.round(Number(splitCashAmount));
        const cardNum = Math.round(Number(splitCardAmount));
        const cashAmount = paymentMethod === 'cash'
            ? (cardNum > 0 ? cashNum : totalAmount)
            : 0;

        if (cashAmount > 0) {
            await supabase.from('cash_movements').insert([{
                register_id: openRegister.id,
                type: 'in',
                amount: cashAmount,
                reason: cardNum > 0
                    ? `Cobro presencial en caja — Venta ${internalId} (Efectivo/Transf. de Pago Mixto)`
                    : `Cobro presencial en caja — Venta ${internalId} (Efectivo / Transferencia)`,
                created_by: 'Admin',
            }]);
        }
    }

    revalidatePath('/admin/sales');
    revalidatePath(`/admin/sales/${saleId}`);
    revalidatePath('/admin/caja');
    return { success: true };
}
