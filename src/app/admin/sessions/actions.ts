'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function revokeAllSessionsAction() {
  try {
    // 1. Cerrar sesión global del usuario actual en Supabase Auth
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: 'global' });

    // 2. Usar cliente admin para invalidar sesiones y limpiar logs de sesión
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Limpiar tabla de logs de sesiones activas
    await supabaseAdmin
      .from('admin_sessions_log')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Invalidar sesiones para todos los administradores
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    if (users && users.length > 0) {
      for (const u of users) {
        // Enviar sign out global por usuario si está disponible o actualizar marca de tiempo
        try {
          await supabaseAdmin.auth.admin.updateUserById(u.id, {
            user_metadata: { ...u.user_metadata, last_forced_logout: new Date().toISOString() }
          });
        } catch (e) {
          console.error(`Error invalidando usuario ${u.email}:`, e);
        }
      }
    }

    revalidatePath('/admin/sessions');
    return { success: true };
  } catch (err: any) {
    console.error('Error al cerrar todas las sesiones:', err);
    return { success: false, error: err.message || 'Error al cerrar todas las sesiones.' };
  }
}
