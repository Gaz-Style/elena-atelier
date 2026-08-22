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
                if (response.buy_order && response.buy_order.startsWith('BRDL_')) {
                    // Format: BRDL_${shortId}_C${cuotaIndex}
                    const parts = response.buy_order.split('_C');
                    const shortId = parts[0].replace('BRDL_', '');
                    const cuotaIndex = parseInt(parts[1], 10);

                    const { createClient } = await import('@supabase/supabase-js');
                    const supabase = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.SUPABASE_SERVICE_ROLE_KEY!
                    );

                    // Fetch the full UUID for the bridal project
                    const { data: project } = await supabase
                        .from('bridal_projects')
                        .select('id')
                        .like('id', `${shortId}%`)
                        .single();

                    if (project) {
                        const { registerBridalInstallment, acceptContract } = await import('@/app/admin/novias/actions');
                        await registerBridalInstallment(project.id, cuotaIndex, 'Webpay Plus', true);
                        if (cuotaIndex === 0) {
                            await acceptContract(project.id);
                        }
                        console.log(`Successfully updated bridal project installment server-side for project: ${project.id}`);
                    } else {
                        console.error(`Could not find bridal project starting with short ID: ${shortId}`);
                    }
                } else {
                    // Standard order or budget payment
                    const { updateOrderStatusToPaidAction } = await import('@/app/admin/pos/actions');
                    await updateOrderStatusToPaidAction(response.buy_order, response.amount);
                    console.log(`Successfully updated standard order/budget to paid server-side for buy_order: ${response.buy_order}`);
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

