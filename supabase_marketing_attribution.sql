-- Fase 1: Arquitectura de Base de Datos para Atribución de Marketing (Elena Atelier)
-- Ejecutar esto en el SQL Editor de Supabase de Elena Atelier

-- 1. Añadir columnas UTM a la tabla de clientes (customers)
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255);

-- 2. Añadir columnas UTM a la tabla de agendamientos
ALTER TABLE agendamientos 
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255);

-- 3. Añadir columna de origen a la tabla de chats de WhatsApp
ALTER TABLE crm_whatsapp_chats
ADD COLUMN IF NOT EXISTS origen_marketing VARCHAR(255);

-- 4. Añadir columnas UTM a la tabla leads (opcional/seguridad)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255);
