-- ============================================================================
-- MIGRACIÓN: ENROLAMIENTO AUTOMÁTICO DE CHATS DE WHATSAPP CON CLIENTES CRM
-- ============================================================================

CREATE OR REPLACE FUNCTION public.match_customer_on_whatsapp_chat()
RETURNS TRIGGER AS $$
DECLARE
    matched_id UUID;
    clean_chat_phone TEXT;
BEGIN
    -- Limpiar el número de teléfono del chat (dejar solo dígitos)
    clean_chat_phone := regexp_replace(NEW.phone_number, '\D', '', 'g');
    
    -- Si el número es válido, buscar coincidencia flexible usando los últimos 9 dígitos
    IF length(clean_chat_phone) >= 9 THEN
        SELECT id INTO matched_id 
        FROM public.customers 
        WHERE 
            -- Comparar los últimos 9 dígitos del teléfono del cliente con el del chat
            substring(regexp_replace(phone, '\D', '', 'g') from '\d{9}$') = substring(clean_chat_phone from '\d{9}$')
        LIMIT 1;

        -- Si se encuentra un cliente, asociarlo al chat
        IF matched_id IS NOT NULL THEN
            NEW.customer_id := matched_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger BEFORE INSERT OR UPDATE
DROP TRIGGER IF EXISTS trigger_match_customer_on_whatsapp_chat ON public.crm_whatsapp_chats;
CREATE TRIGGER trigger_match_customer_on_whatsapp_chat
BEFORE INSERT OR UPDATE OF phone_number ON public.crm_whatsapp_chats
FOR EACH ROW
EXECUTE FUNCTION public.match_customer_on_whatsapp_chat();
