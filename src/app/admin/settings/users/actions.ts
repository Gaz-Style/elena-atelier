'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createAdminUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'El correo y la contraseña son obligatorios.' };
  }
  
  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Confirma automáticamente para que puedan entrar al instante
      app_metadata: { role: 'admin' } // Podemos guardar que es admin internamente
    });

    if (error) {
      console.error('Error creating user:', error);
      return { error: error.message };
    }

    revalidatePath('/admin/settings/users');
    return { success: true, message: 'Usuario creado exitosamente.' };
  } catch (err: any) {
    return { error: err.message || 'Error inesperado al crear el usuario.' };
  }
}

export async function deleteAdminUser(userId: string) {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      return { error: error.message };
    }
    revalidatePath('/admin/settings/users');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Error inesperado al eliminar el usuario.' };
  }
}
