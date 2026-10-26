-- ==============================================================================
-- Script SQL para cerrar y revocar todas las sesiones activas en Supabase
-- Ejecutar en el SQL Editor del panel de Supabase si se desea purgar sesiones a nivel de BD
-- ==============================================================================

-- 1. Eliminar tokens de refresco y sesiones activas en el esquema interno auth
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.sessions;

-- 2. Limpiar el registro de auditoría de sesiones del sistema
TRUNCATE TABLE public.admin_sessions_log;

-- 3. (Opcional) Función reutilizable para cerrar sesiones mediante RPC
CREATE OR REPLACE FUNCTION public.revoke_all_user_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM auth.refresh_tokens;
    DELETE FROM auth.sessions;
    DELETE FROM public.admin_sessions_log;
END;
$$;

GRANT EXECUTE ON FUNCTION public.revoke_all_user_sessions() TO service_role;
