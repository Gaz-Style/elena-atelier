import { NextResponse, type NextRequest } from 'next/server';
import { commitWebpayTransaction } from '@/lib/transbank';

/**
 * Route Handler para Callback Server-Side de Transbank Webpay Plus
 * Soporta tanto POST (predeterminado de Transbank) como GET (redirecciones directas).
 * 
 * Flujo de ejecución seguro:
 * 1. Transbank contacta directamente este endpoint tras autorizar/cancelar el pago.
 * 2. El servidor ejecuta commitWebpayTransaction() de inmediato contra los servidores de Transbank.
 * 3. Se actualizan automáticamente en Supabase los pedidos, órdenes de novias, contratos y logs.
 * 4. El servidor realiza una redirección 303 (See Other) a la vista de comprobante en frontend.
 */

async function handleWebpayCallback(request: NextRequest) {
    const baseUrl = request.nextUrl.origin;
    let token_ws: string | null = null;
    let tbk_token: string | null = null;
    let tbk_orden_compra: string | null = null;

    if (request.method === 'POST') {
        try {
            const formData = await request.formData();
            token_ws = (formData.get('token_ws') as string) || null;
            tbk_token = (formData.get('TBK_TOKEN') as string) || null;
            tbk_orden_compra = (formData.get('TBK_ORDEN_COMPRA') as string) || null;
        } catch {
            token_ws = request.nextUrl.searchParams.get('token_ws');
            tbk_token = request.nextUrl.searchParams.get('TBK_TOKEN');
            tbk_orden_compra = request.nextUrl.searchParams.get('TBK_ORDEN_COMPRA');
        }
    } else {
        token_ws = request.nextUrl.searchParams.get('token_ws');
        tbk_token = request.nextUrl.searchParams.get('TBK_TOKEN');
        tbk_orden_compra = request.nextUrl.searchParams.get('TBK_ORDEN_COMPRA');
    }

    console.log(`[Webpay API Callback] Method: ${request.method} | token_ws: ${token_ws ? 'present' : 'null'} | TBK_TOKEN: ${tbk_token ? 'present' : 'null'} | TBK_ORDEN_COMPRA: ${tbk_orden_compra || 'null'}`);

    // CASO 1: Transacción cancelada o anulada por el usuario en Transbank
    if (tbk_token && !token_ws) {
        console.warn(`[Webpay API Callback] Transacción anulada por el usuario (TBK_TOKEN: ${tbk_token})`);
        return NextResponse.redirect(
            `${baseUrl}/pagar/webpay-callback?status=aborted&TBK_TOKEN=${encodeURIComponent(tbk_token)}`,
            { status: 303 }
        );
    }

    // CASO 2: Timeout o error de sesión sin token
    if (!token_ws) {
        console.error(`[Webpay API Callback] No se recibió token_ws de Transbank`);
        return NextResponse.redirect(
            `${baseUrl}/pagar/webpay-callback?status=failed&error=${encodeURIComponent('No se recibió el token de confirmación de Webpay.')}`,
            { status: 303 }
        );
    }

    // CASO 3: Ejecutar confirmación (commit) estrictamente del lado del servidor
    try {
        const res = await commitWebpayTransaction(token_ws);

        if (res.success && res.data && res.data.response_code === 0) {
            const data = res.data;
            const buyOrder = data.buy_order || '';
            const amount = data.amount || 0;
            const authCode = data.authorization_code || '';
            const paymentType = data.payment_type_code || 'VD';
            const cardNumber = data.card_detail?.card_number || 'XXXX';
            const installments = data.installments_number || 0;

            console.log(`[Webpay API Callback] ✅ Pago autorizado con éxito en servidor. BuyOrder: ${buyOrder}, Monto: ${amount}`);

            // A. Si es orden de Novias / Fiesta (BRDL_)
            if (buyOrder.startsWith('BRDL_') || buyOrder.startsWith('bridal_') || buyOrder.includes('_C')) {
                const parts = buyOrder.split('_C');
                const rawId = parts[0].replace('BRDL_', '').replace('bridal_', '');

                // Buscar el proyecto real para obtener su UUID completo
                try {
                    const { createClient } = await import('@supabase/supabase-js');
                    const supabase = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.SUPABASE_SERVICE_ROLE_KEY!
                    );
                    const { data: project } = await supabase
                        .from('bridal_projects')
                        .select('id')
                        .or(`id.eq.${rawId},id.like.${rawId}%`)
                        .maybeSingle();

                    if (project?.id) {
                        return NextResponse.redirect(
                            `${baseUrl}/portal-novias/${project.id}/pago-exitoso`,
                            { status: 303 }
                        );
                    }
                } catch (projErr) {
                    console.error('[Webpay API Callback] Error buscando proyecto de novias:', projErr);
                }
            }

            // B. Si es orden de Presupuesto (/presupuesto)
            if (buyOrder.startsWith('session_web_') || request.nextUrl.searchParams.get('source') === 'presupuesto') {
                return NextResponse.redirect(
                    `${baseUrl}/presupuesto/pago-exitoso?status=approved&buy_order=${encodeURIComponent(buyOrder)}&amount=${amount}&auth_code=${encodeURIComponent(authCode)}&payment_type=${encodeURIComponent(paymentType)}&card=${encodeURIComponent(cardNumber)}&installments=${installments}`,
                    { status: 303 }
                );
            }

            // C. Orden estándar pública (/pagar/[id] o POS)
            return NextResponse.redirect(
                `${baseUrl}/pagar/webpay-callback?status=approved&buy_order=${encodeURIComponent(buyOrder)}&amount=${amount}&auth_code=${encodeURIComponent(authCode)}&payment_type=${encodeURIComponent(paymentType)}&card=${encodeURIComponent(cardNumber)}&installments=${installments}`,
                { status: 303 }
            );
        } else {
            const errorMsg = res.error || `Transacción no autorizada por el emisor bancario (Código: ${res.data?.response_code ?? 'N/A'})`;
            console.warn(`[Webpay API Callback] ❌ Pago no autorizado: ${errorMsg}`);
            return NextResponse.redirect(
                `${baseUrl}/pagar/webpay-callback?status=rejected&error=${encodeURIComponent(errorMsg)}&response_code=${res.data?.response_code ?? -1}`,
                { status: 303 }
            );
        }
    } catch (commitErr: any) {
        console.error('[Webpay API Callback] Excepción crítica al ejecutar commit server-side:', commitErr);
        return NextResponse.redirect(
            `${baseUrl}/pagar/webpay-callback?status=failed&error=${encodeURIComponent('Error crítico al procesar la confirmación del pago con el banco.')}`,
            { status: 303 }
        );
    }
}

export async function POST(request: NextRequest) {
    return handleWebpayCallback(request);
}

export async function GET(request: NextRequest) {
    return handleWebpayCallback(request);
}
