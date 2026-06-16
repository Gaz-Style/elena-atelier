import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

async function logSystemEvent(supabase: any, level: string, message: string, payload: any = null) {
    try {
        await supabase.from('system_logs').insert([{
            service: 'MercadoPago Webhook',
            level,
            message,
            payload
        }]);
    } catch (e) {
        console.error('Failed to write to system_logs', e);
    }
}

async function updateDatabaseAndNotify(
    supabase: any,
    externalRef: string,
    paymentId: string,
    paymentMethodLabel: string,
    amount: number | null
) {
    console.log(`Procesando pago aprobado para external_reference: ${externalRef}`);
    await logSystemEvent(supabase, 'INFO', `Procesando pago aprobado MP`, { paymentId, externalRef });

    // Check if the order is already paid to prevent duplicate notifications (idempotency check)
    const { data: existingOrders } = await supabase
        .from('production_orders')
        .select('payment_status')
        .eq('pos_order_id', externalRef)
        .limit(1);

    if (existingOrders && existingOrders.length > 0 && existingOrders[0].payment_status === 'PAGADO') {
        console.log(`La orden ${externalRef} ya estaba marcada como PAGADA. Evitando notificación duplicada.`);
        await logSystemEvent(supabase, 'INFO', `Orden ya estaba pagada, ignorando webhook duplicado`, { externalRef });
        return true;
    }

    // 1. Actualizar todas las filas de la orden en producción
    const { data, error } = await supabase
        .from('production_orders')
        .update({ 
            payment_status: 'PAGADO',
            payment_method: paymentMethodLabel
        })
        .eq('pos_order_id', externalRef);
        
    if (error) {
        console.error('Error actualizando estado en BD:', error);
        await logSystemEvent(supabase, 'ERROR', 'Error actualizando production_orders', { error, externalRef });
        return false;
    }

    console.log('Ordenes actualizadas correctamente a PAGADO');
    
    // 2. Actualizar el registro de ventas (sales_ledger)
    await supabase
        .from('sales_ledger')
        .update({ 
            status: 'completed',
            external_transaction_id: paymentId,
            payment_method: paymentMethodLabel
        })
        .eq('internal_id', externalRef);

    // 3. Notificaciones automáticas por WhatsApp
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;

    if (WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_API_TOKEN) {
        const sendWsp = async (to: string, templateName: string, params: string[], languageCode: string = 'es_CL') => {
            try {
                const r = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to,
                        type: 'template',
                        template: {
                            name: templateName,
                            language: { code: languageCode },
                            components: [{
                                type: 'body',
                                parameters: params.map(p => ({ type: 'text', text: p }))
                            }]
                        }
                    })
                });
                const d = await r.json();
                console.log(`WhatsApp ${templateName} → ${to}:`, d);
            } catch (e) {
                console.error(`Error WhatsApp ${templateName}:`, e);
            }
        };

        // Obtener detalles de la orden para personalizar el mensaje
        const { data: orders } = await supabase
            .from('production_orders')
            .select('customer_name, customer_phone, item_name, total_price')
            .eq('pos_order_id', externalRef)
            .limit(1);

        if (orders && orders.length > 0) {
            const order = orders[0];
            const finalAmount = amount || order.total_price || 0;
            const monto = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(finalAmount);
            const prenda = order.item_name || 'Servicio';
            const clienteName = order.customer_name || 'Clienta';
            const clientePhone = order.customer_phone?.replace(/[^0-9]/g, '');

            // Alerta a los dueños
            for (const ownerNum of ['56984021940', '56937667709']) {
                await sendWsp(ownerNum, 'alerta_pago_recibido', [
                    clienteName, prenda, monto, externalRef, paymentMethodLabel
                ], 'en');
            }

            // Confirmación al cliente
            if (clientePhone && clientePhone.length >= 9) {
                const fullPhone = clientePhone.startsWith('56') ? clientePhone : `56${clientePhone}`;
                await sendWsp(fullPhone, 'confirmacion_pago_cliente', [
                    clienteName
                ], 'es_CL');

                // Registrar en el Chat en Vivo
                try {
                    let { data: chatData } = await supabase
                        .from('crm_whatsapp_chats')
                        .select('id')
                        .eq('phone_number', fullPhone)
                        .single();

                    if (!chatData) {
                        const { data: newChat } = await supabase
                            .from('crm_whatsapp_chats')
                            .insert([{ phone_number: fullPhone, session_status: 'bot' }])
                            .select('id')
                            .single();
                        chatData = newChat;
                    }

                    if (chatData) {
                        const readableMsg = `✅ *Confirmación de Pago Enviada*\n\nEstimada ${clienteName}, confirmamos el pago de tu prenda *${prenda}* por un valor de *${monto}* (ID Orden: ${externalRef}) a través de *${paymentMethodLabel}*. ¡Tu proyecto ya está en proceso!`;
                        await supabase.from('crm_whatsapp_messages').insert([{
                            chat_id: chatData.id,
                            sender_type: 'system',
                            message_type: 'text',
                            content: readableMsg
                        }]);
                    }
                } catch (dbErr) {
                    console.error('Error logging confirmacion_pago to LiveChat:', dbErr);
                }
            }
        } else {
            // Sin detalles de orden — notificar sólo con la referencia externa
            const finalAmount = amount || 0;
            const monto = finalAmount > 0 ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(finalAmount) : 'Monto';
            for (const ownerNum of ['56984021940', '56937667709']) {
                await sendWsp(ownerNum, 'alerta_pago_recibido', [
                    'Clienta', 'Orden', `Ref: ${externalRef} (${monto})`, externalRef, paymentMethodLabel
                ], 'en');
            }
        }
    }
    return true;
}

export async function POST(req: Request) {
    const supabase = await createClient();
    try {
        const signatureHeader = req.headers.get('x-signature') || '';
        const requestId = req.headers.get('x-request-id') || '';
        const webhookSecret = process.env.MP_WEBHOOK_SECRET || '';

        const bodyText = await req.text();
        const payload = JSON.parse(bodyText);

        console.log('Recibido Webhook MP:', payload);
        await logSystemEvent(supabase, 'INFO', 'Recibido Webhook MP', payload);

        // Extraer ID del pago/recurso de forma compatible con múltiples formatos (Point y Online)
        let paymentId = payload.data?.id;
        if (!paymentId && payload.resource) {
            if (typeof payload.resource === 'string') {
                if (payload.resource.includes('/')) {
                    const parts = payload.resource.split('/');
                    paymentId = parts[parts.length - 1];
                } else {
                    paymentId = payload.resource;
                }
            }
        }

        // Validación de firma (HMAC) si el secreto está configurado
        if (webhookSecret && signatureHeader) {
            const parts = signatureHeader.split(',');
            let ts = '';
            let v1 = '';
            for (const part of parts) {
                const [key, value] = part.split('=');
                if (key === 'ts') ts = value;
                if (key === 'v1') v1 = value;
            }

            const dataUrl = req.url.split('?')[1] || ''; // Data from query params if any
            let manifest = `id:${paymentId || ''};request-id:${requestId};ts:${ts};`;
            
            const hmac = crypto.createHmac('sha256', webhookSecret);
            hmac.update(manifest);
            const generatedSignature = hmac.digest('hex');

            if (generatedSignature !== v1) {
                console.error('Firma de Webhook de Mercado Pago inválida.');
                await logSystemEvent(supabase, 'WARN', 'Firma de Webhook de Mercado Pago inválida.', { generatedSignature, v1, ts });
                // En modo estricto devolveríamos 403, pero por ahora lo dejamos pasar o logeamos.
                // return NextResponse.json({ error: 'Firma inválida' }, { status: 403 });
            }
        }

        // CASO A: Es una notificación de orden procesada (Point v1/orders)
        if (payload.type === 'order' || payload.action === 'order.processed') {
            const orderData = payload.data;
            const externalRef = orderData?.external_reference;
            const statusDetail = orderData?.status_detail;
            const status = orderData?.status;
            
            if (externalRef && (statusDetail === 'accredited' || status === 'processed' || status === 'paid')) {
                const firstPayment = orderData?.transactions?.payments?.[0];
                const resolvedPaymentId = firstPayment?.reference?.id || firstPayment?.id || orderData?.id || 'point_payment';
                
                const mpPaymentType = firstPayment?.payment_method?.type || '';
                const mpPaymentMethodId = firstPayment?.payment_method?.id || '';
                let paymentMethodLabel = 'MercadoPago Point';
                if (mpPaymentType === 'credit_card') paymentMethodLabel = 'Tarjeta de Crédito (MP)';
                else if (mpPaymentType === 'debit_card') paymentMethodLabel = 'Tarjeta de Débito (MP)';
                else if (mpPaymentType === 'bank_transfer' || mpPaymentMethodId === 'pse') paymentMethodLabel = 'Transferencia Bancaria';
                else if (mpPaymentType === 'prepaid_card') paymentMethodLabel = 'Tarjeta Prepago (MP)';
                
                const amount = Number(orderData?.total_paid_amount || firstPayment?.paid_amount || null);
                
                await updateDatabaseAndNotify(supabase, externalRef, resolvedPaymentId, paymentMethodLabel, amount);
            } else {
                console.log(`Orden Point recibida pero no está aprobada aún (Estado: ${status}, Detalle: ${statusDetail})`);
            }
        }
        // CASO B: Es una notificación directa de pago (online o manual)
        else if (payload.action === 'payment.created' || payload.type === 'payment' || payload.topic === 'payment') {
            if (paymentId) {
                const mpAccessToken = process.env.MP_ACCESS_TOKEN || '';
                if (!mpAccessToken) {
                    console.error('MP_ACCESS_TOKEN no configurado');
                    return NextResponse.json({ error: 'Token no configurado' }, { status: 500 });
                }

                // Consultar el detalle del pago a la API de Mercado Pago
                const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                    headers: {
                        'Authorization': `Bearer ${mpAccessToken}`
                    }
                });

                if (mpResponse.ok) {
                    const payment = await mpResponse.json();
                    
                    if (payment.status === 'approved') {
                        const externalRef = payment.external_reference;
                        
                        if (externalRef) {
                            const mpPaymentType = payment.payment_type_id || '';
                            const mpPaymentMethodId = payment.payment_method_id || '';
                            let paymentMethodLabel = 'MercadoPago';
                            if (mpPaymentType === 'credit_card') paymentMethodLabel = 'Tarjeta de Crédito (MP)';
                            else if (mpPaymentType === 'debit_card') paymentMethodLabel = 'Tarjeta de Débito (MP)';
                            else if (mpPaymentType === 'bank_transfer' || mpPaymentMethodId === 'pse') paymentMethodLabel = 'Transferencia Bancaria';
                            else if (mpPaymentType === 'ticket') paymentMethodLabel = 'Efectivo (MP)';
                            else if (mpPaymentType === 'prepaid_card') paymentMethodLabel = 'Tarjeta Prepago (MP)';

                            const amount = Number(payment.transaction_amount || null);
                            await updateDatabaseAndNotify(supabase, externalRef, paymentId, paymentMethodLabel, amount);
                        } else {
                            console.warn('El pago aprobado no tiene external_reference. Imposible asociar automáticamente.');
                            await logSystemEvent(supabase, 'WARN', 'Pago aprobado sin external_reference', { paymentId });
                        }
                    } else {
                        await logSystemEvent(supabase, 'INFO', `Pago no está aprobado. Estado: ${payment.status}`, { paymentId, status: payment.status });
                    }
                } else {
                    const errorText = await mpResponse.text();
                    console.error('Error al consultar pago a Mercado Pago:', errorText);
                    await logSystemEvent(supabase, 'ERROR', 'Error consultando API MP', { error: errorText, paymentId });
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('Excepción en Webhook de Mercado Pago:', err);
        await logSystemEvent(supabase, 'ERROR', 'Excepción general en Webhook', { error: err.message || String(err) });
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}
