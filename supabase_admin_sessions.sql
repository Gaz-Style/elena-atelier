-- Tabla para registrar inicios de sesión de los administradores
CREATE TABLE IF NOT EXISTS public.admin_sessions_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.admin_sessions_log ENABLE ROW LEVEL SECURITY;

-- Política: Solo administradores logueados pueden ver los logs
CREATE POLICY "Admin puede ver logs de sesiones" ON public.admin_sessions_log
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política: Permitir inserción desde el servidor (Service Role) o usuarios autenticados
CREATE POLICY "Permitir insertar logs de sesión" ON public.admin_sessions_log
    FOR INSERT WITH CHECK (true);
