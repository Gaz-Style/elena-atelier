-- Tabla de Registro de Exclusividad para Graduaciones y Novias
CREATE TABLE IF NOT EXISTS public.exclusividad_registro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('graduacion', 'novias')),
    identificador_evento TEXT NOT NULL, -- Nombre del colegio + curso (graduacion) o Fecha del matrimonio (novias)
    nombre_diseno TEXT NOT NULL, -- Nombre del modelo del vestido
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    pos_order_id TEXT REFERENCES public.production_orders(pos_order_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_event_design UNIQUE (tipo_evento, identificador_evento, nombre_diseno)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.exclusividad_registro ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Permitir lectura pública a exclusividad" 
ON public.exclusividad_registro FOR SELECT USING (true);

CREATE POLICY "Permitir escritura de administrador" 
ON public.exclusividad_registro FOR ALL USING (auth.role() = 'authenticated');
