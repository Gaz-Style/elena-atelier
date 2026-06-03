-- ========================================================
-- FASE 5: SISTEMA DE MARKETING & POSICIONAMIENTO
-- ========================================================

-- 1. Crear tabla de tareas de marketing
CREATE TABLE public.marketing_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('SEO & GEO', 'Meta Ads', 'Influencer Loop', 'Automatización CRM', 'Viral Loop (Referidos)')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'in_progress', 'pending')),
    target_date TEXT NOT NULL,
    impact TEXT NOT NULL CHECK (impact IN ('Alto', 'Medio', 'Bajo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.marketing_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on marketing_tasks"
    ON public.marketing_tasks
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 3. Poblar datos iniciales reales (Checklist)
INSERT INTO public.marketing_tasks (title, description, category, status, target_date, impact) VALUES
('Optimización de Metadatos Web', 'Implementar el título premium y la meta descripción optimizada para Google, OpenGraph y Twitter en Next.js.', 'SEO & GEO', 'completed', '20-May-2026', 'Alto'),
('Marcado de Datos Estructurados Schema LocalBusiness', 'Inyección de JSON-LD estructurado en el layout web con coordenadas exactas de Tabancura, teléfono y servicios clave para alimentar motores de IA.', 'SEO & GEO', 'completed', '20-May-2026', 'Alto'),
('Corrección de Contraste en Layout del Panel ERP', 'Solucionar el problema de la capa oscura y el sangrado del fondo negro en el admin layout, garantizando legibilidad total.', 'Automatización CRM', 'completed', '20-May-2026', 'Bajo'),
('Ajuste de Ficha de Google Business Profile (Maps)', 'Modificar el nombre oficial a "ELENA La Costurera - Alta Costura & Sastrería a Medida" y alinear la dirección física en Vitacura.', 'SEO & GEO', 'completed', '20-May-2026', 'Alto'),
('Anuncios Google Ads (SEM) Hiperlocales', 'Configurar y activar campaña de búsqueda local con un radio de 5km en Vitacura para palabras clave como "arreglos de ropa vitacura" y "sastrería".', 'Meta Ads', 'pending', 'Jun-2026', 'Alto'),
('Campaña de Reseñas de 5 Estrellas en WhatsApp', 'Implementar el flujo de envío automatizado utilizando el enlace de reseña directa activo para clientas tras retirar exitosamente su prenda.', 'SEO & GEO', 'in_progress', 'En Curso', 'Alto'),
('Reels ASMR de Storytelling & Costura Invisible', 'Producir videos estéticos de 15 segundos con audio macro (sonido de tijeras sobre seda y agujas) para Reels de Instagram.', 'Meta Ads', 'in_progress', 'En Curso', 'Medio'),
('Kit de Rescate "Perfect Fit" para Influencers', 'Identificar y contactar a 5 micro-influencers (5k-20k seguidores) en sector oriente para regalarles un servicio a cambio de UGC.', 'Influencer Loop', 'pending', 'Jul-2026', 'Alto'),
('Flujo de Trazabilidad en Tiempo Real (WhatsApp API)', 'Conectar el ERP con alertas automáticas informando al cliente la fase de su prenda.', 'Automatización CRM', 'pending', 'Ago-2026', 'Medio'),
('Programa de Referidos "Cofre Atelier"', 'Implementar el bucle viral donde la clienta recomendada y la recomendadora reciben un servicio ecológico de cortesía.', 'Viral Loop (Referidos)', 'pending', 'Sep-2026', 'Medio');
