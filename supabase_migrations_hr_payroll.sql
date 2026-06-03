-- =======================================================================================
-- FASE 2: RRHH Y LIQUIDACIÓN POR DESTAJO (NATIVO EN SUPABASE)
-- =======================================================================================

-- 1. Ampliamos la tabla existente de operarios (atelier_operators) para soportar tipos de contrato
ALTER TABLE public.atelier_operators 
ADD COLUMN IF NOT EXISTS contract_type TEXT CHECK (contract_type IN ('fixed', 'piecework', 'percentage')) DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS base_salary NUMERIC DEFAULT 0, -- Sueldo base mensual si aplica
ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC DEFAULT 0; -- % de comisión si aplica

-- 2. Tabla para registrar las asignaciones y comisiones por prenda (Liquidación a destajo)
CREATE TABLE IF NOT EXISTS public.hrm_garment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.atelier_operators(id) ON DELETE CASCADE,
    production_order_id UUID NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
    
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    payment_type TEXT NOT NULL CHECK (payment_type IN ('fixed_piece', 'percentage')),
    calculated_amount NUMERIC NOT NULL DEFAULT 0, -- Monto a pagar por esta prenda específica
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'paid')) DEFAULT 'pending',
    
    UNIQUE(operator_id, production_order_id)
);

-- 3. Trigger para calcular automáticamente la comisión cuando una prenda se marca como "completed"
CREATE OR REPLACE FUNCTION public.calculate_piecework_payroll()
RETURNS TRIGGER AS $$
DECLARE
    op_contract TEXT;
    op_pct NUMERIC;
    order_sale_price NUMERIC;
    calculated_pay NUMERIC := 0;
BEGIN
    -- Solo actuar si el estado cambia a 'ready' o 'delivered' y hay un operador asignado
    IF (NEW.status = 'ready' OR NEW.status = 'delivered') AND OLD.status NOT IN ('ready', 'delivered') AND NEW.assigned_operator_id IS NOT NULL THEN
        
        -- Obtener datos del operador
        SELECT contract_type, commission_percentage 
        INTO op_contract, op_pct 
        FROM public.atelier_operators 
        WHERE id = NEW.assigned_operator_id;

        IF op_contract = 'percentage' THEN
            -- Calcular en base al precio de la orden (requiere join con sales_ledger o un estimado)
            -- Asumiremos que tenemos el valor en la orden o buscaremos en sales_ledger
            SELECT (total_amount / (SELECT count(*) FROM production_orders WHERE sale_id = NEW.sale_id))
            INTO order_sale_price
            FROM sales_ledger WHERE id = NEW.sale_id;

            IF order_sale_price IS NOT NULL THEN
                calculated_pay := (order_sale_price * op_pct) / 100;
            END IF;

            -- Registrar o actualizar la asignación
            INSERT INTO public.hrm_garment_assignments (
                operator_id, production_order_id, payment_type, calculated_amount, status, completed_at
            ) VALUES (
                NEW.assigned_operator_id, NEW.id, 'percentage', calculated_pay, 'completed', NOW()
            )
            ON CONFLICT (operator_id, production_order_id) DO UPDATE 
            SET calculated_amount = EXCLUDED.calculated_amount,
                status = 'completed',
                completed_at = NOW();

        ELSIF op_contract = 'piecework' THEN
            -- Destajo fijo por prenda (se asume tarifa fija por horas o complejidad)
            -- Ejemplo: Tarifa base por hora del taller * estimated_hours
            calculated_pay := NEW.estimated_hours * 5000; -- Valor ejemplo por hora

            INSERT INTO public.hrm_garment_assignments (
                operator_id, production_order_id, payment_type, calculated_amount, status, completed_at
            ) VALUES (
                NEW.assigned_operator_id, NEW.id, 'fixed_piece', calculated_pay, 'completed', NOW()
            )
            ON CONFLICT (operator_id, production_order_id) DO UPDATE 
            SET calculated_amount = EXCLUDED.calculated_amount,
                status = 'completed',
                completed_at = NOW();
        END IF;

    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_payroll ON public.production_orders;
CREATE TRIGGER trigger_calculate_payroll
AFTER UPDATE ON public.production_orders
FOR EACH ROW
EXECUTE FUNCTION public.calculate_piecework_payroll();
