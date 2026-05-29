-- Agregar columnas necesarias para la gestión de pagos en el POS
ALTER TABLE public.production_orders 
ADD COLUMN IF NOT EXISTS pos_order_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Crear un índice opcional en pos_order_id para búsquedas más rápidas en el webhook
CREATE INDEX IF NOT EXISTS idx_production_orders_pos_order_id ON public.production_orders(pos_order_id);
