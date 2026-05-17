-- ########################################################
-- # MASTER ERP SCHEMA v2.0 - ELENA ATELIER (WORLD CLASS)
-- ########################################################

-- 1. EXTENSIONS & SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. MASTER DATA: PROVIDERS & CUSTOMERS
CREATE TABLE IF NOT EXISTS public.providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rut TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL, -- Razón Social
    commercial_activity TEXT, -- Giro
    address TEXT,
    phone TEXT,
    email TEXT,
    rating INTEGER DEFAULT 5, -- Calificación de cumplimiento
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    rut TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    birthday DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PRODUCT DESIGN & PLM (ESTILO-TALLA-COLOR)
CREATE TABLE IF NOT EXISTS public.styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- Código de Diseño
    name TEXT NOT NULL,
    season TEXT,
    description TEXT,
    tech_sheet_url TEXT, -- Link a ficha técnica (PDF/Img)
    base_price NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    style_id UUID REFERENCES public.styles(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    size TEXT NOT NULL, -- S, M, L, XL, etc.
    color TEXT NOT NULL, -- Nombre o Pantone
    fabric_type TEXT,
    stock_qty DECIMAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bill_of_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID REFERENCES public.variants(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL, -- Tela, Hilo, Botón
    required_qty DECIMAL NOT NULL,
    unit TEXT DEFAULT 'mts', -- mts, unidades, grs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PRODUCTION & SHOP FLOOR CONTROL (QR DRIVEN)
CREATE TABLE IF NOT EXISTS public.production_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID REFERENCES public.variants(id),
    order_number TEXT NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    qty_pieces INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, cutting, sewing, quality_control, finished
    current_station TEXT,
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.production_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID REFERENCES public.production_bundles(id) ON DELETE CASCADE,
    operator_id UUID, -- Referencia a tabla de personal (por crear)
    station_name TEXT NOT NULL,
    event_type TEXT NOT NULL, -- start, pause, finish
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    efficiency_score DECIMAL -- Calculado en base a SAM
);

-- 5. BESPOKE (ALTA COSTURA A MEDIDA)
CREATE TABLE IF NOT EXISTS public.client_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    version_name TEXT NOT NULL, -- Ej: 'Boda Mayo 2026'
    measurements JSONB NOT NULL, -- { busto: 90, cintura: 70, ... }
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. FINANCE & TAX LEDGER (CHILEAN COMPLIANT)
CREATE TABLE IF NOT EXISTS public.purchase_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    provider_id UUID REFERENCES public.providers(id),
    document_type TEXT NOT NULL, -- Factura, Boleta, Boleta Honorarios, Voucher
    document_number TEXT NOT NULL,
    description TEXT,
    net_amount NUMERIC NOT NULL DEFAULT 0,
    vat_amount NUMERIC NOT NULL DEFAULT 0, -- IVA 19%
    exempt_amount NUMERIC DEFAULT 0,
    withholding_amount NUMERIC DEFAULT 0, -- Retención 13.75%
    total_amount NUMERIC NOT NULL DEFAULT 0,
    category TEXT NOT NULL, -- variable, fixed
    payment_status TEXT DEFAULT 'pending', -- pending, paid, partial
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. SECURITY & ACCESS
ALTER TABLE public.providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.styles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_of_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_bundles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_measurements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_ledger DISABLE ROW LEVEL SECURITY;

-- 8. SEED DATA: CORE PROVIDERS (EXAMPLES)
INSERT INTO public.providers (rut, business_name, commercial_activity) VALUES
('76.123.456-7', 'Telas Santiago S.A.', 'Distribución de Textiles'),
('77.987.654-K', 'Insumos Costura Ltda.', 'Venta de Hilos y Agujas')
ON CONFLICT (rut) DO NOTHING;
