-- Añadir columna hc_templates a atelier_config
ALTER TABLE public.atelier_config ADD COLUMN IF NOT EXISTS hc_templates JSONB DEFAULT '[]'::jsonb;
