-- =======================================================================================
-- MIGRATION: ENTERPRISE RLS, INDEXES & AUDIT LOGS
-- =======================================================================================

-- 1. HABILITAR RLS STRICTO EN CORE ERP TABLES
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytic_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_items ENABLE ROW LEVEL SECURITY;

-- Nota: Las Service Role Keys ignoran RLS automáticamente. 
-- Para los administradores autenticados vía UI, se deben crear políticas si acceden mediante el cliente de supabase anon.
-- Como arquitectura base "Zero Trust", bloquearemos el acceso público:
CREATE POLICY "Deny Public Access Customers" ON public.customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Deny Public Access Fixed Costs" ON public.fixed_costs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Deny Public Access Expenses" ON public.expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Deny Public Access Chart Accounts" ON public.chart_of_accounts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Deny Public Access Analytic Accounts" ON public.analytic_accounts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Deny Public Access Journal Entries" ON public.journal_entries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Deny Public Access Journal Items" ON public.journal_items FOR ALL USING (auth.role() = 'authenticated');

-- 2. ÍNDICES COMPUESTOS PARA OPERACIONES POS (ALTA CONCURRENCIA)
CREATE INDEX IF NOT EXISTS idx_pos_order_status ON public.production_orders (pos_order_id, status);
CREATE INDEX IF NOT EXISTS idx_sales_ledger_status ON public.sales_ledger (internal_id, status);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers (email);

-- 3. AUDITORÍA TRANSACCIONAL (TRIGGER PARA UPDATED_AT EN ERP)
-- Función Genérica para actualizar timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Añadir columna si no existe
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.sales_ledger ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Asignar triggers
DROP TRIGGER IF EXISTS update_journal_entries_modtime ON public.journal_entries;
CREATE TRIGGER update_journal_entries_modtime
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_sales_ledger_modtime ON public.sales_ledger;
CREATE TRIGGER update_sales_ledger_modtime
    BEFORE UPDATE ON public.sales_ledger
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
