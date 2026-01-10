-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    hubspot_id TEXT,
    style_preference TEXT,
    typical_occasion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
    status TEXT NOT NULL DEFAULT 'draft', -- draft, cutting, sewing, finishing, ready, delivered
    order_type TEXT NOT NULL, -- bespoke, restoration, b2b_batch
    fabric_id UUID REFERENCES public.fabric_inventory(id),
    qr_code_id UUID DEFAULT uuid_generate_v4() UNIQUE, -- For Digital Passport
    deadline TIMESTAMP WITH TIME ZONE,
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
