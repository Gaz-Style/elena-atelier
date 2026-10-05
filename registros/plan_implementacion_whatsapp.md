# Plan de Implementación: Asistente IA DeepSeek en WhatsApp (`+56972812907`)
**Elena Atelier — Vitacura Hub**

## 📌 Diagnóstico del Sistema y Contexto del Proyecto

Tras realizar la auditoría del sistema actual y revisar el panel de Meta WhatsApp Manager:

### 📱 Mapeo de Números Telefónicos del Taller
1. **Línea Oficial WhatsApp Cloud API (`+56 9 7281 2907`) — (ID: `1164843383373994`)**
   - **Estado:** Activo y funcionando en Meta WhatsApp Manager (175+ mensajes enviados).
   - **Rol:** Canal oficial comercial y embudo de conversión 24/7 atendido por **DeepSeek IA**.
   - **Webhook:** Conectado a la API en `/api/webhooks/whatsapp`.
2. **Línea Personal de Elena (`+56 9 3766 7709`)**
   - **Estado:** Activo en WhatsApp Business App móvil.
   - **Rol:** Línea directa personal y privada de Elena.
3. **Línea de Alertas de Administración (`+56 9 8402 1940`)**
   - **Rol:** Recepción de notificaciones del sistema (alertas de ventas, transacciones MercadoPago, POS y eventos CRM).

---

## 🏗️ Arquitectura Actual del Webhook & IA

Actualmente el sistema cuenta con la siguiente infraestructura ya construida:
- **Webhook Activo:** [route.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/api/webhooks/whatsapp/route.ts) recibe los eventos `POST` de Meta.
- **Base de Datos (Supabase):**
  - `crm_whatsapp_chats`: Registra conversaciones, enrola automáticamente al cliente buscando por número en `customers` y gestiona la columna `session_status` (`'bot'` | `'human'`).
  - `crm_whatsapp_messages`: Guarda la traza completa de mensajes entrantes (`customer`) y salientes (`bot` / `human`).
- **Respuesta Temporal Actual:** En la línea 144 del webhook existe un mensaje estático de redirección que cambia el estado a `'human'`.
- **Motor IA Existente:** Invocaciones a DeepSeek (`deepseek-chat`) operativas en `/api/orchestrator` y `/api/cursos/chat`.

---

## 📋 Checklist de Implementación por Fases

### 🔹 Fase 1: Confirmación de Infraestructura y Credenciales
- [ ] **1.1 Validar Variables de Entorno (`.env.local` y Vercel)**
  - [ ] `WHATSAPP_PHONE_NUMBER_ID`: `1164843383373994` (ID confirmado en Meta Manager).
  - [ ] `WHATSAPP_API_TOKEN`: Token de Acceso Permanente en Meta.
  - [ ] `WHATSAPP_VERIFY_TOKEN`: `elena_atelier_secret`.
  - [ ] `DEEPSEEK_API_KEY`: API Key de DeepSeek configurada para llamadas a `https://api.deepseek.com`.
- [ ] **1.2 Verificación de Tablas en Supabase**
  - [ ] Validar estados `crm_whatsapp_chats.session_status` (`'bot'`, `'human'`).
  - [ ] Verificar vinculación automática con la tabla `customers` mediante la función de enrolamiento de dígitos.

---

### 🔹 Fase 2: Diseñar Prompt de Sistema DeepSeek (Atelier Concierge)
- [ ] **2.1 Identidad y Tono "Quiet Luxury"**
  - [ ] Rol: *"Sofía, Concierge Virtual de Elena La Costurera (Atelier de Alta Costura y Novias en Alonso de Córdova, Vitacura)"*.
  - [ ] Tono: Cálido, sumamente elegante, sofisticado, atento y profesional.
- [ ] **2.2 Base de Conocimiento Integrada**
  - [ ] Confección de Novias a Medida, Alta Costura/Fiesta, Modificación y Upcycling de vestidos heredados.
  - [ ] **Política de Cotizaciones:** Explicar que cada diseño a medida requiere una evaluación de patrón, telas y volumen de confección, guiando amablemente a la clienta a agendar su cita de diagnóstico en el Atelier.
  - [ ] Ubicación: Vitacura, atención exclusiva bajo cita previa.
- [ ] **2.3 Reglas de Interacción**
  - [ ] Preguntar fecha estimada de la boda/evento (para detectar prioridad).
  - [ ] Suministrar enlace directo de agendamiento (`/agendar` o `/reservar`).
  - [ ] Detectar cuando el cliente solicita hablar con una persona y cambiar `session_status = 'human'`.

---

### 🔹 Fase 3: Sustitución de Respuesta Estática por DeepSeek en Webhook (`/api/webhooks/whatsapp`)
- [ ] **3.1 Modificación del Manejo de Mensajes**
  - [ ] Reemplazar la respuesta estática (línea 144 de `route.ts`) por la llamada dinámica a la API de DeepSeek (`deepseek-chat`).
  - [ ] Obtener los últimos 10 mensajes de `crm_whatsapp_messages` para construir el contexto conversacional.
- [ ] **3.2 Integración con API de DeepSeek**
  - [ ] Hacer `POST` a `https://api.deepseek.com/chat/completions` enviando prompt de sistema + contexto + nuevo mensaje.
  - [ ] Incluir fallback con timeout de 8 segundos (mensaje de espera si la API demora).
- [ ] **3.3 Lógica de Handoff Humano**
  - [ ] Si `session_status === 'human'`, silenciar el bot y permitir que Elena o su equipo respondan desde el panel CRM.
  - [ ] Si la IA detecta que la clienta requiere intervención humana, enviar mensaje de cortesía y actualizar `session_status = 'human'`.

---

### 🔹 Fase 4: Actualizaciones en Frontend y Panel CRM
- [ ] **4.1 Actualización de Enlaces en el Sitio Web**
  - [ ] Actualizar `WhatsAppButton.tsx` y botones del portafolio ([PortfolioClient.tsx](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/portafolio/PortfolioClient.tsx)) para apuntar al número oficial de atención API `+56972812907`.
  - [ ] Configurar mensajes con contexto precargado (ej. *"Hola Elena, estoy viendo el vestido [Nombre] en la web..."*).
- [ ] **4.2 Panel de Gestión CRM (`/admin/livechat`)**
  - [ ] Permitir a Elena y su equipo cambiar manualmente con un botón el estado de cada chat entre `🤖 Bot (DeepSeek)` y `👤 Humano`.
  - [ ] Permitir escribir respuestas manuales que se envíen directamente a WhatsApp a través de Meta Graph API.

---

### 🔹 Fase 5: QA, Pruebas y Monitoreo en Vivo
- [ ] **5.1 Simulación de Conversaciones**
  - [ ] Probar flujo de consulta de novia.
  - [ ] Probar intento de pedir precios exactos y verificar la derivación elegante al agendamiento.
  - [ ] Probar handoff a humano.
- [ ] **5.2 Monitoreo de Métricas y Transacciones**
  - [ ] Revisar consumo de API de Meta en el panel de desarrollador.
  - [ ] Verificar registro correcto de logs en Vercel y entradas en Supabase.
