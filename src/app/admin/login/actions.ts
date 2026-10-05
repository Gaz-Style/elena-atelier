'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Clave o usuario incorrecto. Por favor, inténtalo de nuevo.' };
  }

  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const ipAddress = headersList.get('x-forwarded-for') || 'Unknown IP';
    
    // Registrar el inicio de sesión en la tabla pública
    await supabase.from('admin_sessions_log').insert({
      user_id: data.user.id,
      email: data.user.email,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  } catch (logError) {
    console.error('Error logging admin session:', logError);
  }

  redirect('/admin/pos');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
