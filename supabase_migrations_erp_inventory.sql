-- ==========================================
-- ELENA ATELIER: ERP INVENTORY & BOM (Fase 1)
-- ==========================================

-- 1. Inventario del Atelier (Telas, Hilos, Avíos)
CREATE TABLE public.erp_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    category TEXT,
    color TEXT,
    composition TEXT,
    stock_qty NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    cost_per_unit NUMERIC NOT NULL DEFAULT 0,
    supplier_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para erp_inventory
ALTER TABLE public.erp_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.erp_inventory FOR ALL USING (true);

-- 2. Ficha Técnica / Bill of Materials (BOM)
-- Relaciona las órdenes de producción del CRM con los insumos del ERP
CREATE TABLE public.erp_order_bom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.production_orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.erp_inventory(id) ON DELETE RESTRICT,
    estimated_qty NUMERIC NOT NULL DEFAULT 0,
    used_qty NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para erp_order_bom
ALTER TABLE public.erp_order_bom ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.erp_order_bom FOR ALL USING (true);

-- ==========================================
-- TRIGGERS DE INVENTARIO
-- ==========================================

-- Trigger para descontar stock automáticamente cuando la orden pasa a 'En Corte'
-- Nota: La tabla actual se llama `production_orders` y su campo es `status`.
CREATE OR REPLACE FUNCTION deduct_inventory_on_cut()
RETURNS TRIGGER AS $$
DECLARE
    bom_record RECORD;
BEGIN
    -- Si la orden cambia al estado 'En Corte' (y antes no lo estaba)
    IF NEW.status = 'En Corte' AND OLD.status != 'En Corte' THEN
        -- Recorrer todos los materiales de la ficha técnica de esta orden
        FOR bom_record IN 
            SELECT item_id, COALESCE(used_qty, estimated_qty) as qty_to_deduct 
            FROM public.erp_order_bom 
            WHERE order_id = NEW.id
        LOOP
            -- Descontar del inventario
            UPDATE public.erp_inventory
            SET stock_qty = stock_qty - bom_record.qty_to_deduct
            WHERE id = bom_record.item_id;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_cutting
    AFTER UPDATE ON public.production_orders
    FOR EACH ROW
    EXECUTE FUNCTION deduct_inventory_on_cut();
