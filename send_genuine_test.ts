import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
import { createClient } from '@supabase/supabase-js';
import { sendBridalPaymentConfirmationEmailAction } from './src/app/admin/novias/actions.ts';

async function main() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const projectId = '194f071a-61b6-4ee2-a8cb-1b6a799b1403';
    
    // 1. Obtener cliente original
    const { data: project } = await supabase.from('bridal_projects').select('customer_id').eq('id', projectId).single();
    if (!project || !project.customer_id) throw new Error('No customer');
    
    const customerId = project.customer_id;
    const { data: customer } = await supabase.from('customers').select('email').eq('id', customerId).single();
    const originalEmail = customer.email;
    
    console.log(`Original email: ${originalEmail}`);
    
    // 2. Cambiar a correo de prueba
    await supabase.from('customers').update({ email: 'mcruz1232@gmail.com' }).eq('id', customerId);
    console.log('Cambiado temporalmente a mcruz1232@gmail.com');
    
    // 3. Enviar correo usando el sistema REAL
    try {
        console.log('Enviando correo original del sistema...');
        await sendBridalPaymentConfirmationEmailAction(projectId, 0, 60000, 'Webpay Plus');
        console.log('Enviado.');
    } catch (e) {
        console.error('Error enviando:', e);
    }
    
    // 4. Restaurar correo original
    await supabase.from('customers').update({ email: originalEmail }).eq('id', customerId);
    console.log(`Restaurado correo original: ${originalEmail}`);
}

main();
