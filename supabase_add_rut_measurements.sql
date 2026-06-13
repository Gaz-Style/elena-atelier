-- Ejecutar esta consulta en el Editor SQL de Supabase (Supabase SQL Editor)
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS rut TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS measurements TEXT;
