-- 👥 MIGRACIÓN DE BASE DE DATOS: GESTIÓN DE COSTURERAS INDIVIDUALES Y CARGA DE TRABAJO
-- Ejecuta este código en el editor SQL de tu panel de control de Supabase (SQL Editor)

-- 1. Crear Tabla de Operarios/Costureras
CREATE TABLE IF NOT EXISTS public.atelier_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    daily_hours_capacity INTEGER DEFAULT 7,
    working_days INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5, 6], -- 1-6 = Lunes a Sábado
    status VARCHAR(50) DEFAULT 'active', -- active, vacation, inactive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Deshabilitar RLS para esta tabla de costureras
ALTER TABLE public.atelier_operators DISABLE ROW LEVEL SECURITY;

-- Respaldo de políticas por si RLS sigue activo o forzado
DROP POLICY IF EXISTS "Permitir todo a todos en operators" ON public.atelier_operators;
CREATE POLICY "Permitir todo a todos en operators" ON public.atelier_operators FOR ALL TO public USING (true) WITH CHECK (true);

-- Seeding inicial de Costureras del Atelier
INSERT INTO public.atelier_operators (id, name, daily_hours_capacity, working_days, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Elena Sastre', 8, ARRAY[1, 2, 3, 4, 5, 6], 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Marco Costura', 7, ARRAY[1, 2, 3, 4, 5], 'active'),
  ('33333333-3333-3333-3333-333333333333', 'Sofía Textil', 6, ARRAY[1, 2, 3], 'active')
ON CONFLICT (id) DO NOTHING;

-- 2. Añadir columna assigned_operator_id a la tabla production_orders si no existe
ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS assigned_operator_id UUID REFERENCES public.atelier_operators(id);
