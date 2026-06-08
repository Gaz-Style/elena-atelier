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
            let manifest = `id:${payload.data?.id};request-id:${requestId};ts:${ts};`;
            
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

        // Si es un evento de pago (point o online)
        if (payload.action === 'payment.created' || payload.type === 'payment' || payload.topic === 'payment') {
            const paymentId = payload.data?.id;
            
            if (paymentId) {
                const mpAccessToken = process.env.MP_ACCESS_TOKEN || '';
                if (!mpAccessToken) {
                    console.error('MP_ACCESS_TOKEN no configurado');
                    return NextResponse.json({ error: 'Token no configurado' }, { status: 500 });
                }

                // Consultar el detalle del pago a Mercado Pago
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
                            console.log(`Pago aprobado para external_reference: ${externalRef}`);
                            await logSystemEvent(supabase, 'INFO', `Pago aprobado MP`, { paymentId, externalRef, status: payment.status });

                            // Determinar método de pago real desde la respuesta de MP
                            const mpPaymentType = payment.payment_type_id || '';
                            const mpPaymentMethodId = payment.payment_method_id || '';
                            let paymentMethodLabel = 'MercadoPago';
                            if (mpPaymentType === 'credit_card') paymentMethodLabel = 'Tarjeta de Crédito (MP)';
                            else if (mpPaymentType === 'debit_card') paymentMethodLabel = 'Tarjeta de Débito (MP)';
                            else if (mpPaymentType === 'bank_transfer' || mpPaymentMethodId === 'pse') paymentMethodLabel = 'Transferencia Bancaria';
                            else if (mpPaymentType === 'ticket') paymentMethodLabel = 'Efectivo (MP)';
                            else if (mpPaymentType === 'prepaid_card') paymentMethodLabel = 'Tarjeta Prepago (MP)';

                            // Actualizar todas las filas de la orden (puede tener multiples items)
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
                            } else {
                                console.log('Ordenes actualizadas correctamente a PAGADO');
                                
                                // Update sales ledger
                                await supabase
                                    .from('sales_ledger')
                                    .update({ 
                                        status: 'completed',
                                        external_transaction_id: paymentId,
                                        payment_method: paymentMethodLabel
                                    })
                                    .eq('internal_id', externalRef);

                                // --- WhatsApp Notifications ---
                                const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
                                const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;

                                if (WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_API_TOKEN) {
                                    const sendWsp = async (to: string, templateName: string, params: string[]) => {
                                        try {
                                            const r = await fetch(`https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
                                                method: 'POST',
                                                headers: { 'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`, 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    messaging_product: 'whatsapp',
                                                    to,
                                                    type: 'template',
                                                    template: {
                                                        name: templateName,
                                                        language: { code: 'es' },
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

                                    // Fetch order details to get customer info
                                    const { data: orders } = await supabase
                                        .from('production_orders')
                                        .select('customer_name, customer_phone, item_name, total_price')
                                        .eq('pos_order_id', externalRef)
                                        .limit(1);

                                    if (orders && orders.length > 0) {
                                        const order = orders[0];
                                        const monto = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(payment.transaction_amount || order.total_price || 0);
                                        const prenda = order.item_name || 'Servicio';
                                        const clienteName = order.customer_name || 'Clienta';
                                        const clientePhone = order.customer_phone?.replace(/[^0-9]/g, '');

                                        // Notify owner
                                        await sendWsp('56984021940', 'alerta_pago_recibido', [
                                            clienteName, prenda, monto, externalRef, paymentMethodLabel
                                        ]);

                                        // Notify customer if we have their phone
                                        if (clientePhone && clientePhone.length >= 9) {
                                            const fullPhone = clientePhone.startsWith('56') ? clientePhone : `56${clientePhone}`;
                                            await sendWsp(fullPhone, 'confirmacion_pago_cliente', [
                                                clienteName, prenda, monto, externalRef, paymentMethodLabel
                                            ]);
                                        }
                                    } else {
                                        // No order details — notify owner with just the reference
                                        await sendWsp('56984021940', 'alerta_pago_recibido', [
                                            'Clienta', 'Orden', `Ref: ${externalRef}`, externalRef
                                        ]);
                                    }
                                }
                            }
                        } else {
                            console.warn('El pago aprobado no tiene external_reference. Imposible asociar a la base de datos automáticamente.');
                            await logSystemEvent(supabase, 'WARN', 'Pago aprobado sin external_reference', { paymentId });
                            // Aquí se podría intentar hacer match por monto si guardáramos el precio en la BD.
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
