-- ========================================================
-- EMAIL CENTER v2: agregar columna read_at para rastrear mensajes leídos
-- ========================================================

ALTER TABLE public.crm_email_threads
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Los mensajes outbound se marcan como leídos inmediatamente
UPDATE public.crm_email_threads
    SET read_at = created_at
    WHERE direction = 'outbound' AND read_at IS NULL;
