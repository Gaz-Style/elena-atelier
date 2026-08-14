# 📋 Checklist de Configuración de Marketing: Meta, TikTok & Email Marketing

Este documento es una guía paso a paso para configurar desde cero la infraestructura de marketing, el rastreo (tracking), la segmentación de audiencias y los flujos automatizados de email marketing y mensajería para **Elena Atelier**.

---

## 🛠️ Fase 1: Infraestructura y Tracking Técnico (Cimiento de Datos)
El objetivo de esta fase es que cada visita, clic y reserva en la web sea medible y atribuible a las campañas.

- [x] **1.1. Configuración de Meta Suite**
  - [x] Crear/Acceder al **Meta Business Suite** comercial de la marca.
  - [x] Crear la **Cuenta Publicitaria (Ad Account)** exclusiva para Elena Atelier.
  - [x] Vincular la página de Facebook y la cuenta profesional de Instagram.
  - [x] Verificar el dominio web (`elenalacosturera.cl` o equivalente) en la sección de seguridad de la marca.

- [x] **1.2. Implementación del Meta Pixel & Conversions API (CAPI)**
  - [x] Generar el Meta Pixel en el Administrador de Eventos.
  - [x] **Código Base:** Integrar el script del Pixel en la aplicación Next.js (`src/app/layout.tsx`).
  - [x] **Eventos Estándar:** Configurar eventos clave mediante el pixel o código personalizado:
    - [x] `PageView` (Todas las páginas).
    - [x] `Lead` (Cuando completan el formulario de datos para agendar).
    - [x] `Schedule` / `Book` (Cuando la cita queda confirmada en el calendario).
    - [x] `Contact` (Cuando hacen clic en el botón de WhatsApp).
  - [x] Configurar la **API de Conversiones (Conversions API)** desde el servidor para evitar pérdidas por bloqueadores de anuncios (ad-blockers).

- [x] **1.3. Configuración de TikTok Ads Manager & Pixel**
  - [x] Crear cuenta en **TikTok Business Center**.
  - [x] Generar el **TikTok Pixel** e instalarlo en la web.
  - [x] Configurar la medición de eventos en TikTok (clic a WhatsApp, inicio de reserva).

- [/] **1.4. Google Analytics 4 (GA4) y Google Tag Manager (GTM)**
  - [x] Crear contenedor de GTM e instalar los tags de cabecera y cuerpo en Next.js.
  - [ ] Migrar el Meta Pixel y TikTok Pixel a etiquetas de GTM para mantener el código del frontend limpio y optimizado.

---

## 🎯 Fase 2: Estrategia y Configuración de Audiencias (Segmentación)
Antes de lanzar anuncios, debemos preparar los públicos para impactar a las personas correctas en Vitacura, Las Condes y Lo Barnechea.

- [ ] **2.1. Públicos en Meta Ads**
  - [ ] **Públicos Personalizados (Retargeting):**
    - [ ] Visitantes de la web (últimos 30/90/180 días).
    - [ ] Personas que interactuaron con Instagram/Facebook (últimos 365 días).
    - [ ] Base de datos de clientas existentes (importada de forma segura/hasheada).
  - [ ] **Públicos Similares (Lookalike - LAL):**
    - [ ] LAL 1% al 3% basado en las clientas que ya han agendado citas reales.
  - [ ] **Público Guardado (Prospección / Tráfico Frío):**
    - [ ] Geográfico: Vitacura + Las Condes + Lo Barnechea (radio de 5-10 km).
    - [ ] Intereses refinados: *Quiet Luxury, Moda Sostenible, Vestidos de Novia, Alta Costura, Joyería Premium*.

- [ ] **2.2. Públicos en TikTok Ads**
  - [ ] Segmentar por geolocalización (Santiago, Chile) e intereses en alta costura, moda estética, diseño de autor y DIY/sostenibilidad.

---

## ✉️ Fase 3: Email Marketing & CRM (Fidelización y Recuperación)
Integrar la biblioteca **Nodemailer** y configurar las credenciales existentes de **Google Workspace** (`SMTP_USER` y `SMTP_PASSWORD` en `.env.local`) para automatizar la comunicación.

- [/] **3.1. Autenticación y Envío de Correo Corporativo**
  - [ ] Validar que las credenciales de SMTP del dominio corporativo funcionen correctamente en producción (uso de `contacto@elenalacosturera.cl` como remitente oficial).
  - [x] Diseñar plantilla base con la identidad visual de Elena Atelier (colores elegantes, tipografía legible, logo premium y enlaces directos a la web y WhatsApp).

- [/] **3.2. Correo de Bienvenida (Welcome Email - Simple y Honesto)**
  - [ ] Redactar un nuevo texto de bienvenida sencillo y transparente agradeciendo el registro y presentando brevemente el taller, sin historias exageradas.
  - [ ] Conectar este nuevo flujo cuando una clienta se registra en la web.

- [/] **3.3. Flujo de Reserva y Preparación de Citas**
  - [x] **Correo 1 (Al agendar):** Confirmación oficial con mapa dinámico de cómo llegar a la Oficina 319 de Av. Tabancura (Ver [appointment_scheduled.html](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/lib/templates/emails/appointment_scheduled.html)).
  - [ ] **Correo 2 (24 horas antes):** Recordatorio amigable e instrucciones de qué llevar a la cita (ej. tacos o ropa interior específica si es para entallar un vestido).

- [/] **3.4. Flujo de Recuperación (Abandonos de Presupuesto/Citas)**
  - [ ] **Trigger:** Presupuesto enviado en el POS del taller que no ha sido pagado/aceptado en 5 días.
  - [x] **Acción:** Correo con enlace directo para revisar el presupuesto en línea y un canal directo para resolver dudas técnicas sobre la costura (Ver [budget_reminder.html](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/lib/templates/emails/budget_reminder.html)).

- [ ] **3.5. Programa de Referidos "Cofre Atelier" (Bucle Viral)**
  - [ ] Verificar el endpoint de recomendación `/api/referrals` integrado con Supabase.
  - [ ] Configurar el envío automático del correo/alerta de recompensa (Limpieza/Ajuste de Cortesía) tanto para la clienta VIP que recomienda como para la amiga referida.

---

## 🎥 Fase 4: Estructura de Campañas en TikTok Ads
Aprovechar el formato vertical dinámico y el sonido para captar tráfico más joven y visual.

- [ ] **4.1. Configuración de Campaña de Tráfico/Conversión**
  - [ ] Objetivo: Redirigir a la landing de reservas o al chat de WhatsApp.
  - [ ] **Spark Ads:** Habilitar la opción de promocionar publicaciones orgánicas de la cuenta de TikTok de la marca (genera más confianza).
  - [ ] Formatos de Creativos:
    - [ ] Proceso de Upcycling ASMR (sonidos reales de corte, costura y planchado).
    - [ ] Explicación rápida de Elena: "3 cosas que debes saber antes de ajustar tu vestido de gala".

---

## 💬 Fase 5: WhatsApp Marketing & CRM Local
Optimización del flujo conversacional usando las APIs ya integradas en el backend de la aplicación.

- [ ] **5.1. Flujo de Reseñas de Google Maps**
  - [ ] Verificar que el webhook envíe automáticamente la solicitud de reseña al cliente cuando su pedido pasa a "Entregado".
- [ ] **5.2. Recordatorios Automáticos de Retiro**
  - [ ] Alerta por WhatsApp al cliente cuando el estado de su prenda cambia a "Listo para retiro" con los horarios del taller.
- [ ] **5.3. Webhook de Recepción de WhatsApp (Handoff Humano)**
  - [ ] Verificar la recepción de mensajes en el endpoint `/api/webhooks/whatsapp`.
  - [ ] Validar que los mensajes entrantes se guarden correctamente en `crm_whatsapp_chats` y `crm_whatsapp_messages` de Supabase, y deriven consultas manuales a Elena.

---

## ⚙️ Fase 6: Automatizaciones Avanzadas (Crons & Webhooks)
Validar los disparadores automatizados del servidor encargados del mantenimiento de clientes y alertas comerciales.

- [ ] **6.1. Cron de Recordatorio de Cita por WhatsApp (`/api/cron/reminders`)**
  - [ ] Validar que el cron busque citas confirmadas programadas en 1 hora.
  - [ ] Verificar el envío del mensaje de plantilla oficial `recordatorio_cita` de Meta Cloud API.
- [ ] **6.2. Cron de Campaña sobre Telas Inmovilizadas (`/api/cron/stock`)**
  - [ ] Verificar el disparador que detecta materiales (seda, encaje, lana) sin movimiento en 30 días.
  - [ ] Validar la generación automática de borradores de alertas personalizadas para clientas VIP en Supabase.

---

## 📈 OKRs de Control del Embudo
- [ ] **Tasa de Clics (CTR):** > 2% en anuncios de Meta y TikTok.
- [ ] **Costo por Cita Agendada (CPA):** Definir límite máximo aceptable de adquisición de leads calificados.
- [ ] **Tasa de Apertura de Email (Open Rate):** > 45% en correos transaccionales y de bienvenida.
- [ ] **Tasa de Clics en Emails (CTR):** > 3% hacia el portal de agendamiento.
