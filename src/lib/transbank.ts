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
        return { success: true, data: response };
    } catch (err: any) {
        console.error('Error committing Webpay transaction:', err);
        return { success: false, error: err.message || String(err) };
    }
}
