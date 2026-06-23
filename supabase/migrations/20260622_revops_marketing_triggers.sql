-- =======================================================================================
-- MIGRATION: REVOPS & MARKETING TRIGGERS
-- =======================================================================================

-- Función para actualizar el lead_score a 100 (Cliente Activo) si realiza una compra
CREATE OR REPLACE FUNCTION public.update_crm_lead_score_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el estado de la venta cambia a 'completed' o se inserta como 'completed'
    IF NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN
        IF NEW.customer_id IS NOT NULL THEN
            -- Aumentar probabilidad de venta o marcar como cliente fiel
            UPDATE public.crm_whatsapp_chats
            SET lead_score = 100
            WHERE customer_id = NEW.customer_id;
            
            -- Crear notificación interna (CDP)
            INSERT INTO public.system_notifications (title, body, type, action_url)
            VALUES (
                'Venta Completada / Cliente Fidelizado', 
                'El cliente asociado a la venta ' || NEW.internal_id || ' ha completado su compra. Scoring actualizado.', 
                'ai_insight', 
                '/admin/crm'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_crm_on_sale ON public.sales_ledger;
CREATE TRIGGER trigger_update_crm_on_sale
    AFTER INSERT OR UPDATE ON public.sales_ledger
    FOR EACH ROW
    EXECUTE FUNCTION public.update_crm_lead_score_on_sale();
