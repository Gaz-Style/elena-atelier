-- ==========================================
-- ELENA ATELIER: ERP FINANCES (Fase 1)
-- ==========================================

-- Expandimos la tabla sales_ledger actual para registrar costos internos
ALTER TABLE public.sales_ledger
ADD COLUMN IF NOT EXISTS materials_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS labor_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS profit_margin NUMERIC DEFAULT 0;

-- Podemos crear una vista o función para calcular el profit_margin automáticamente
-- (Total Amount - Taxes) - (Materials Cost + Labor Cost) = Profit Margin

CREATE OR REPLACE FUNCTION update_profit_margin()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profit_margin := (NEW.net_amount) - (COALESCE(NEW.materials_cost, 0) + COALESCE(NEW.labor_cost, 0));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_sales_ledger_costs_update ON public.sales_ledger;

CREATE TRIGGER on_sales_ledger_costs_update
    BEFORE INSERT OR UPDATE OF net_amount, materials_cost, labor_cost
    ON public.sales_ledger
    FOR EACH ROW
    EXECUTE FUNCTION update_profit_margin();
