-- MIGRACIÓN: AGREGAR COLUMNA DE PRECIO A LAS PRENDAS/ORDENES DE PRODUCCIÓN
-- Ejecuta este código en el editor SQL de tu panel de control de Supabase (SQL Editor)

ALTER TABLE public.production_orders ADD COLUMN IF NOT EXISTS price DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE public.work_order_items ADD COLUMN IF NOT EXISTS price DECIMAL(12, 2) DEFAULT 0;
