import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { sendBridalPaymentConfirmationEmailAction } from './src/app/admin/novias/actions.ts';

async function main() {
    const projectId = '194f071a-61b6-4ee2-a8cb-1b6a799b1403';
    const cuotaIndex = 0; // _custom_p1 = index 0
    const amount = 185000;
    const paymentMethod = 'Webpay Plus';

    console.log(`Enviando comprobante para proyecto ${projectId}...`);
    try {
        const result = await sendBridalPaymentConfirmationEmailAction(projectId, cuotaIndex, amount, paymentMethod);
        console.log('Resultado:', result);
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
