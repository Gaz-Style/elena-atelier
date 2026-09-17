'use server';

import { WebpayPlus, Options, Environment, IntegrationApiKeys } from 'transbank-sdk';

const commerceCode = process.env.NEXT_PUBLIC_TBK_COMMERCE_CODE || '597055555532';
const apiKey = process.env.TBK_API_KEY || '';
const environment = process.env.TBK_ENV === 'production' ? Environment.Production : Environment.Integration;

const options = new Options(
    commerceCode,
    apiKey || IntegrationApiKeys.WEBPAY,
    environment
);

const webpayTx = new WebpayPlus.Transaction(options);

export async function createWebpayTransaction(buyOrder: string, sessionId: string, amount: number, returnUrl: string) {
    try {
        console.log(`Initializing Webpay transaction for Order: ${buyOrder}, Session: ${sessionId}, Amount: ${amount}, Return: ${returnUrl}`);
        const response = await webpayTx.create(buyOrder, sessionId, amount, returnUrl);
        return { success: true, token: response.token, url: response.url };
    } catch (err: any) {
        console.error('Error creating Webpay transaction:', err);
        return { success: false, error: err.message || String(err) };
    }
}

export async function commitWebpayTransaction(token: string) {
    try {
        console.log(`Committing Webpay transaction with token: ${token}`);
        const response = await webpayTx.commit(token);

        if (response.response_code === 0) {
            console.log(`Webpay transaction authorized successfully. Starting server-side database update for buy_order: ${response.buy_order}`);
            try {
                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );

                const buyOrder = response.buy_order || '';
                let processedBridal = false;

                // CASO A: Formato BRDL_..._C... o bridal_...
                if (buyOrder.startsWith('BRDL_') || buyOrder.startsWith('bridal_') || buyOrder.includes('_C')) {
                    let projectId = '';
                    let cuotaIndex = 0;

                    if (buyOrder.includes('_C')) {
                        const parts = buyOrder.split('_C');
                        const rawId = parts[0].replace('BRDL_', '').replace('bridal_', '');
                        cuotaIndex = parseInt(parts[1], 10) || 0;

                        // Buscar el proyecto por ID corto o UUID completo
                        const { data: project } = await supabase
                            .from('bridal_projects')
                            .select('id')
                            .or(`id.eq.${rawId},id.like.${rawId}%`)
                            .maybeSingle();

                        if (project) projectId = project.id;
                    }

                    if (projectId) {
                        const { registerBridalInstallment, acceptContract } = await import('@/app/admin/novias/actions');
                        await registerBridalInstallment(projectId, cuotaIndex, 'Webpay Plus', true);
                        if (cuotaIndex === 0) {
                            await acceptContract(projectId);
                        }
                        processedBridal = true;
                        console.log(`Successfully updated bridal project installment server-side for project: ${projectId}, cuota: ${cuotaIndex}`);
                    }
                }

                // CASO B: Si no se procesó como Novias/Fiesta por prefijo, intentar buscar en bridal_projects por ID
                if (!processedBridal) {
                    const cleanRef = buyOrder.split('_balance_')[0];
                    const { data: directBridal } = await supabase
                        .from('bridal_projects')
                        .select('id')
                        .eq('id', cleanRef)
                        .maybeSingle();

                    if (directBridal) {
                        const { registerBridalInstallment, acceptContract } = await import('@/app/admin/novias/actions');
                        await registerBridalInstallment(directBridal.id, 0, 'Webpay Plus', true);
                        await acceptContract(directBridal.id);
                        processedBridal = true;
                        console.log(`Successfully matched direct bridal project ID: ${directBridal.id}`);
                    }
                }

                // CASO C: Orden estándar de POS / Presupuesto / Arreglos
                if (!processedBridal) {
                    const { updateOrderStatusToPaidAction } = await import('@/app/admin/pos/actions');
                    await updateOrderStatusToPaidAction(buyOrder, response.amount);
                    console.log(`Successfully updated standard order/budget to paid server-side for buy_order: ${buyOrder}`);
                }

                // Registrar en system_logs
                try {
                    await supabase.from('system_logs').insert([{
                        service: 'Transbank Webpay',
                        level: 'INFO',
                        message: `Pago Webpay Autorizado (${response.buy_order})`,
                        payload: { buy_order: response.buy_order, amount: response.amount, authorization_code: response.authorization_code }
                    }]);
                } catch (logErr) {
                    console.error('Error logging system event for Transbank:', logErr);
                }

            } catch (dbErr) {
                console.error('Error in server-side Webpay auto-update:', dbErr);
            }
        }

        return { success: true, data: response };
    } catch (err: any) {
        console.error('Error committing Webpay transaction:', err);
        return { success: false, error: err.message || String(err) };
    }
}

