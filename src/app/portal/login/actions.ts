'use server';

import { createClient } from '@/lib/supabase/server';

export async function requestOTPAction(formData: FormData) {
    const email = formData.get('email') as string;
    
    if (!email) {
        return { error: 'El correo electrónico es requerido.' };
    }

    const supabase = await createClient();
    
    // Check if the customer exists in our DB first
    const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .single();
        
    if (!customerData || customerError) {
        return { error: 'No encontramos ninguna clienta con este correo en nuestra base de datos. Si crees que es un error, contacta a tu asesora.' };
    }

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: false,
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/portal/auth/callback`
        }
    });

    if (error) {
        console.error('OTP Error:', error.message);
        return { error: 'Hubo un problema al enviar el código de acceso. Por favor, intenta nuevamente.' };
    }

    return { success: true };
}
