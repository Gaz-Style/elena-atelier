import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const signatureHeader = req.headers.get('x-signature') || '';
        const requestId = req.headers.get('x-request-id') || '';
        const webhookSecret = process.env.MP_WEBHOOK_SECRET || '';

        const bodyText = await req.text();
        const payload = JSON.parse(bodyText);

        console.log('Recibido Webhook MP:', payload);

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
                            const supabase = await createClient();
                            
                            // Actualizar todas las filas de la orden (puede tener multiples items)
                            const { data, error } = await supabase
                                .from('production_orders')
                                .update({ 
                                    payment_status: 'PAGADO',
                                    payment_method: 'Mercado_Pago_Presencial'
                                })
                                .eq('pos_order_id', externalRef);
                                
                            if (error) {
                                console.error('Error actualizando estado en BD:', error);
                            } else {
                                console.log('Ordenes actualizadas correctamente a PAGADO');
                            }
                        } else {
                            console.warn('El pago aprobado no tiene external_reference. Imposible asociar a la base de datos automáticamente.');
                            // Aquí se podría intentar hacer match por monto si guardáramos el precio en la BD.
                        }
                    }
                } else {
                    console.error('Error al consultar pago a Mercado Pago:', await mpResponse.text());
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('Excepción en Webhook de Mercado Pago:', err);
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}
