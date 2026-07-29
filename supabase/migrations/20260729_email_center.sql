-- ========================================================
-- SISTEMA DE MARKETING & CENTRAL DE CORREOS (HILOS Y CAMPAÑAS)
-- ========================================================

-- 1. Tabla de Hilos de Correo CRM
CREATE TABLE IF NOT EXISTS public.crm_email_threads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    sender TEXT NOT NULL,
    recipient TEXT NOT NULL,
    body_text TEXT,
    body_html TEXT,
    message_id TEXT,
    references_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para hilos
ALTER TABLE public.crm_email_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on crm_email_threads"
    ON public.crm_email_threads
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 2. Tabla de Campañas Masivas de Marketing
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content_html TEXT NOT NULL,
    recipient_count INTEGER DEFAULT 0,
    segment TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para campañas
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on marketing_campaigns"
    ON public.marketing_campaigns
    FOR ALL
    USING (true)
    WITH CHECK (true);
