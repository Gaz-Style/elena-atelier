import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
import { createClient } from '@supabase/supabase-js';
import { sendBridalPaymentConfirmationEmailAction } from './src/app/admin/novias/actions.ts';

async function main() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const projectId = '194f071a-61b6-4ee2-a8cb-1b6a799b1403';
    
    // Obtener y cambiar correo a mcruz1232@gmail.com
    const { data: project } = await supabase.from('bridal_projects').select('customer_id').eq('id', projectId).single();
    if (!project || !project.customer_id) throw new Error('No customer');
    
    const customerId = project.customer_id;
    const { data: customer } = await supabase.from('customers').select('email').eq('id', customerId).single();
    const originalEmail = customer.email;
    
    await supabase.from('customers').update({ email: 'mcruz1232@gmail.com' }).eq('id', customerId);
    
    try {
        console.log('Ejecutando sendBridalPaymentConfirmationEmailAction...');
        const result = await sendBridalPaymentConfirmationEmailAction(projectId, 0, 60000, 'Webpay Plus');
        console.log('Resultado de la función:', result);
    } catch (e) {
        console.error('Excepción atrapada en el script:', e);
    }
    
    // Restaurar correo original
    await supabase.from('customers').update({ email: originalEmail }).eq('id', customerId);
    console.log('Correo original restaurado.');
}

main();
