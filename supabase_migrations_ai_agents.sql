-- =======================================================================================
-- FASE 3: INFRAESTRUCTURA MULTI-AGENTE (IA) Y CRM WHATSAPP
-- =======================================================================================

-- 1. Tabla de Mensajería y Memoria de WhatsApp (CRM)
CREATE TABLE IF NOT EXISTS public.crm_whatsapp_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    
    -- Manejo de estado conversacional
    session_status TEXT NOT NULL CHECK (session_status IN ('bot', 'human_handoff', 'closed')) DEFAULT 'bot',
    lead_score NUMERIC DEFAULT 0, -- 0 a 100 (probabilidad de venta)
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contexto JSON para el Agente (memoria corta)
    context JSONB DEFAULT '{}'::jsonb,
    
    UNIQUE(phone_number)
);

-- 2. Historial de mensajes individuales (Memoria Larga)
CREATE TABLE IF NOT EXISTS public.crm_whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.crm_whatsapp_chats(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'bot', 'human')),
    message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'audio', 'document', 'interactive')),
    content TEXT,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Cola de Tareas Asíncronas (Orquestador Multi-Agente)
CREATE TABLE IF NOT EXISTS public.ai_agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_role TEXT NOT NULL CHECK (agent_role IN ('whatsapp_closer', 'hr_manager', 'erp_analyst', 'marketing_seo')),
    
    payload JSONB NOT NULL, -- Datos de entrada para el agente
    
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    result JSONB, -- Respuesta o acción generada por el agente
    error_log TEXT,
    
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Notificaciones push al dashboard
CREATE TABLE IF NOT EXISTS public.system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ai_insight', 'payment', 'hr_alert', 'whatsapp')),
    read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Trigger: Cuando entra un mensaje de WhatsApp nuevo (o cambia el chat), generar una tarea para el orquestador
CREATE OR REPLACE FUNCTION public.enqueue_whatsapp_agent_task()
RETURNS TRIGGER AS $$
BEGIN
    -- Si es un mensaje del cliente, encolamos tarea para el bot (solo si el chat está en modo bot)
    IF NEW.sender_type = 'customer' THEN
        IF (SELECT session_status FROM public.crm_whatsapp_chats WHERE id = NEW.chat_id) = 'bot' THEN
            INSERT INTO public.ai_agent_tasks (agent_role, payload)
            VALUES ('whatsapp_closer', jsonb_build_object('chat_id', NEW.chat_id, 'message_id', NEW.id, 'content', NEW.content));
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enqueue_whatsapp ON public.crm_whatsapp_messages;
CREATE TRIGGER trigger_enqueue_whatsapp
AFTER INSERT ON public.crm_whatsapp_messages
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_whatsapp_agent_task();
