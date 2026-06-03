CREATE TABLE IF NOT EXISTS public.sales_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    seller_id TEXT,
    branch TEXT DEFAULT 'Presencial',
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    net_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    external_transaction_id TEXT,
    tax_document_type TEXT,
    tax_document_folio TEXT
);

-- Enable RLS
ALTER TABLE public.sales_ledger ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all authenticated users" 
ON public.sales_ledger FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" 
ON public.sales_ledger FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON public.sales_ledger FOR UPDATE USING (true);

-- Add foreign key to production_orders
ALTER TABLE public.production_orders
ADD COLUMN IF NOT EXISTS sale_id UUID REFERENCES public.sales_ledger(id) ON DELETE SET NULL;
