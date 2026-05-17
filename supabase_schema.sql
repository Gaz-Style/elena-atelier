-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    birthday DATE,
    marketing_opt_in BOOLEAN DEFAULT true,
    hubspot_id TEXT,
    style_preference TEXT,
    typical_occasion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to register (Insert)
DROP POLICY IF EXISTS "Allow public insert" ON public.customers;
CREATE POLICY "Allow public insert" ON public.customers FOR INSERT WITH CHECK (true);

-- Policy: Allow authenticated admins to select/manage
DROP POLICY IF EXISTS "Allow admin all" ON public.customers;
CREATE POLICY "Allow admin all" ON public.customers FOR ALL TO authenticated USING (true);

-- Table: Body Measurements (Clienteling)
CREATE TABLE IF NOT EXISTS public.body_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    shoulder_width DECIMAL,
    chest_circumference DECIMAL,
    waist_circumference DECIMAL,
    hip_circumference DECIMAL,
    sleeve_length DECIMAL,
    notes TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Fabric Inventory
CREATE TABLE IF NOT EXISTS public.fabric_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    composition TEXT,
    origin TEXT, -- For Digital Passport
    stock_meters DECIMAL DEFAULT 0,
    price_per_meter DECIMAL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Production Orders
CREATE TABLE IF NOT EXISTS public.production_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id),
    description TEXT NOT NULL, -- Ej: Vestido de Novia Seda
    status TEXT NOT NULL DEFAULT 'draft', -- draft, cutting, sewing, finishing, ready, delivered
    order_type TEXT NOT NULL, -- bespoke, restoration, b2b_batch
    fabric_id UUID REFERENCES public.fabric_inventory(id),
    qr_code_id UUID DEFAULT uuid_generate_v4() UNIQUE, -- For Digital Passport
    deadline TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Order Status Logs (For WhatsApp updates)
CREATE TABLE IF NOT EXISTS public.order_status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.production_orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Notification Logs
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'email' or 'whatsapp'
    template TEXT NOT NULL,
    status TEXT NOT NULL, -- 'sent', 'failed', 'pending'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Fixed Costs (Monthly Recurring Bills)
CREATE TABLE IF NOT EXISTS public.fixed_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL, -- Ej: Arriendo, Sueldo Juan, Fibra Optica
    amount NUMERIC NOT NULL,
    month INTEGER NOT NULL, -- 1-12
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE: Chart of Accounts (ERP Backbone)
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- X.X.X.XX.XX.XXX
    name TEXT NOT NULL,
    level INTEGER NOT NULL,
    account_type TEXT NOT NULL, -- Activo, Pasivo, Patrimonio, Ingreso, Gasto, Costo
    parent_id UUID REFERENCES public.chart_of_accounts(id),
    is_selectable BOOLEAN DEFAULT true, -- Solo cuentas de nivel 5 o 6 son seleccionables
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE: Analytic Accounts (Cost Centers)
CREATE TABLE IF NOT EXISTS public.analytic_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE: Journal Entries (Accounting Header)
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    state TEXT DEFAULT 'draft', -- draft, posted, canceled
    created_by UUID, -- Reference to Auth user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE: Journal Items (Double-Entry Lines)
CREATE TABLE IF NOT EXISTS public.journal_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.chart_of_accounts(id),
    analytic_account_id UUID REFERENCES public.analytic_accounts(id),
    debit NUMERIC DEFAULT 0,
    credit NUMERIC DEFAULT 0,
    partner_id UUID REFERENCES public.customers(id), -- For AP/AR reconciliation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT double_entry_integrity CHECK (debit >= 0 AND credit >= 0)
);
