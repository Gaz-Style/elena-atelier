'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const password = formData.get('password');
  
  // Contraseña estática para la demo (Opción B del plan)
  if (password === 'elena2026') {
    // Configurar cookie segura (dura 1 día)
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'ea_admin_session',
      value: 'authenticated',
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 día
    });
    
    // Redirigir al dashboard
    redirect('/admin');
  }
  
  // Si falla, retornar error
  return { error: 'Credenciales incorrectas' };
}
