-- ########################################################
-- # MASTER ERP SCHEMA & SEED - ELENA ATELIER
-- ########################################################

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES: CORE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    birthday DATE,
    marketing_opt_in BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.fabric_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    stock_meters DECIMAL DEFAULT 0,
    price_per_meter DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.production_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLES: FINANCE & ERP
CREATE TABLE IF NOT EXISTS public.fixed_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    level INTEGER NOT NULL,
    account_type TEXT NOT NULL,
    is_selectable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.analytic_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    state TEXT DEFAULT 'posted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.journal_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.chart_of_accounts(id),
    analytic_account_id UUID REFERENCES public.analytic_accounts(id),
    debit NUMERIC DEFAULT 0,
    credit NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SECURITY (PERMISSIVE FOR TESTING)
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_costs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_items DISABLE ROW LEVEL SECURITY;

-- 5. SEED DATA: CHART OF ACCOUNTS
INSERT INTO public.chart_of_accounts (code, name, level, account_type, is_selectable) VALUES
('1', 'ACTIVOS', 1, 'Activo', false),
('2', 'PASIVOS', 1, 'Pasivo', false),
('3', 'PATRIMONIO', 1, 'Patrimonio', false),
('4', 'INGRESOS', 1, 'Ingreso', false),
('5', 'COSTOS Y GASTOS', 1, 'Gasto', false),
('1.1', 'Activos Corrientes', 2, 'Activo', false),
('1.1.1.02.01.000', 'Banco Local (CLP)', 5, 'Activo', true),
('4.1.1.01.01.000', 'Venta de Productos Atelier', 5, 'Ingreso', true),
('5.2.1.01.01.000', 'Arriendos Oficinas/Taller', 5, 'Gasto', true),
('5.2.1.01.03.000', 'Gastos Comunes', 5, 'Gasto', true),
('5.2.1.02.01.000', 'Suministro Agua Potable', 5, 'Gasto', true),
('5.2.1.02.02.000', 'Suministro Energía Eléctrica', 5, 'Gasto', true),
('5.2.1.02.03.000', 'Suministro Gas', 5, 'Gasto', true),
('5.2.1.02.04.000', 'Servicios Telecomunicaciones/Internet', 5, 'Gasto', true),
('5.2.1.04.01.000', 'Sueldos Base Personal', 5, 'Gasto', true),
('5.2.2.01.01.000', 'Publicidad y Marketing Digital', 5, 'Gasto', true),
('5.1.1.01.02.000', 'Insumos y Telas', 5, 'Gasto', true)
ON CONFLICT (code) DO NOTHING;

-- 6. SEED DATA: ANALYTIC ACCOUNTS
INSERT INTO public.analytic_accounts (name, description) VALUES
('Taller Principal', 'Centro de costo central para producción'),
('Administración', 'Gastos generales')
ON CONFLICT (name) DO NOTHING;
