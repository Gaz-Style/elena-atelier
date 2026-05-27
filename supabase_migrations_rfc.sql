-- 📋 MIGRACIÓN SQL PARA GOBERNANZA DE CARGA Y LIVE PRODUCTION BOARD
-- Ejecuta este código en el editor SQL de tu panel de control de Supabase (SQL Editor)

-- Asegurar extensiones de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Crear Nueva Tabla de Configuración Global del Atelier
CREATE TABLE IF NOT EXISTS public.atelier_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    labor_capacity_per_operator_daily INTEGER DEFAULT 7,
    total_active_operators INTEGER DEFAULT 3,
    logistic_buffer_days INTEGER DEFAULT 2,
    delivery_window_start TIME DEFAULT '15:00:00',
    delivery_window_end TIME DEFAULT '18:00:00',
    delivery_allowed_days INTEGER[] DEFAULT ARRAY[2, 4], -- 2 = Martes, 4 = Jueves
    workshop_working_days INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5, 6], -- 1-6 = Lunes a Sábado
    workshop_working_hour_start TIME DEFAULT '09:00:00',
    workshop_working_hour_end TIME DEFAULT '18:00:00',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Deshabilitar RLS para permitir lecturas y escrituras directas desde Server Actions internas
ALTER TABLE public.atelier_config DISABLE ROW LEVEL SECURITY;

-- Crear política de acceso total como respaldo si RLS sigue activo o forzado por la interfaz de Supabase
DROP POLICY IF EXISTS "Permitir todo a todos" ON public.atelier_config;
CREATE POLICY "Permitir todo a todos" ON public.atelier_config FOR ALL TO public USING (true) WITH CHECK (true);

-- Insertar configuración por defecto inicial si no existe
INSERT INTO public.atelier_config (id, labor_capacity_per_operator_daily, total_active_operators, logistic_buffer_days, delivery_window_start, delivery_window_end, delivery_allowed_days, workshop_working_days, workshop_working_hour_start, workshop_working_hour_end)
VALUES ('c0ffee88-8888-8888-8888-888888888888', 7, 3, 2, '15:00:00', '18:00:00', ARRAY[2, 4], ARRAY[1, 2, 3, 4, 5, 6], '09:00:00', '18:00:00')
ON CONFLICT (id) DO NOTHING;

-- 2. Extender la tabla existing production_orders
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS production_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS production_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS final_delivery_date TIMESTAMP WITH TIME ZONE;
