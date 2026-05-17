-- Table: Catalog (Products and Services)
CREATE TABLE IF NOT EXISTS public.catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    category TEXT NOT NULL, -- Servicio, Confección, Suministro, etc.
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert real data from notebook
INSERT INTO public.catalog (name, description, price, category)
VALUES 
    ('Basta Máquina', 'Dobladillo estándar realizado a máquina', 8000, 'Bastas'),
    ('Basta Postizo', 'Dobladillo con pieza de tela adicional', 12000, 'Bastas'),
    ('Basta a Mano', 'Dobladillo artesanal invisible hecho a mano', 12000, 'Bastas'),
    ('Basta Sesgo', 'Terminación de basta con cinta de sesgo', 15000, 'Bastas'),
    ('Basta Vestido con Cola', 'Ajuste de largo para vestido con cola', 35000, 'Bastas'),
    ('Basta Vestido s/Cola', 'Ajuste de largo para vestido sin cola', 20000, 'Bastas'),
    ('Basta Vestido Simple', 'Ajuste de largo para vestido recto o simple', 18000, 'Bastas'),
    ('Basta Chaqueta s/Forro', 'Ajuste de largo en chaqueta sin forro interno', 20000, 'Bastas'),
    ('Basta Chaqueta c/Forro', 'Ajuste de largo en chaqueta con forro técnico', 25000, 'Bastas'),
    ('Basta Abrigo / Chaquetón', 'Ajuste de largo para prendas de abrigo pesadas', 25000, 'Bastas'),
    ('Confección Base', 'Servicio base de confección por prenda', 35000, 'Confección'),
    ('Confección Falda', 'Confección completa de falda a medida', 45000, 'Confección'),
    ('Confección Pantalón', 'Confección completa de pantalón a medida', 50000, 'Confección'),
    ('Confección Vestido Simple', 'Confección de vestido recto o básico', 75000, 'Confección'),
    ('Vestido Fiesta s/Cola', 'Confección de vestido de fiesta sin cola', 180000, 'Gala/Novias'),
    ('Vestido Graduación c/Cola', 'Confección de vestido de graduación con cola', 240000, 'Gala/Novias'),
    ('Vestido Madrina s/Cola', 'Confección de vestido de madrina sin cola', 260000, 'Gala/Novias'),
    ('Vestido Madrina c/Cola', 'Confección de vestido de madrina con cola', 310000, 'Gala/Novias'),
    ('Vestido Novia (Base)', 'Confección base de vestido de novia artesanal', 400000, 'Gala/Novias')
ON CONFLICT DO NOTHING;

-- Actualizaci�n para Cat�logo Inteligente
ALTER TABLE public.catalog ADD COLUMN IF NOT EXISTS production_time_minutes INTEGER DEFAULT 0;
ALTER TABLE public.catalog ADD COLUMN IF NOT EXISTS material_cost NUMERIC DEFAULT 0;
ALTER TABLE public.catalog ADD COLUMN IF NOT EXISTS suggested_price NUMERIC DEFAULT 0;

