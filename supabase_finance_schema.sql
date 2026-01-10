-- Extension for financial modules
CREATE TABLE IF NOT EXISTS public.sales_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.production_orders(id),
    customer_id UUID REFERENCES public.customers(id),
    amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) NOT NULL, -- 19% IVA in Chile
    payment_method TEXT, -- mercado_pago, transfer, credit_card
    invoice_status TEXT DEFAULT 'pending', -- pending, generated, sent
    invoice_url TEXT, -- SimpleAPI link
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL, -- fabrics, utilities, rent, salaries
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Financial Goals
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month DATE NOT NULL,
    target_sales DECIMAL(12,2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: Employees (Buk Sync)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buk_id TEXT UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT,
    salary DECIMAL(12,2),
    status TEXT DEFAULT 'active',
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
