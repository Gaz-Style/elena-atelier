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

-- Insert example data to get started
INSERT INTO public.catalog (name, description, price, category)
VALUES 
    ('Restauración Técnica - Abrigo', 'Restauración completa de abrigos de lana o cachemira', 120000, 'Servicio'),
    ('Sastrería a Medida - Pantalón', 'Confección de pantalón formal a medida', 180000, 'Confección'),
    ('Ajuste de Calce - Vestido', 'Ajuste de hombros y pinzas para vestido de gala', 45000, 'Servicio'),
    ('Botones Vintage (Set)', 'Set de 6 botones de colección', 15000, 'Suministro')
ON CONFLICT DO NOTHING;
