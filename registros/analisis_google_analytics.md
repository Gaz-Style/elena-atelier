# 📊 Análisis Completo, Plan de Mejoras e Implementación de Google Analytics 4 (GA4) & GTM
**Elena Atelier — Vitacura Hub**

---

## 1. Resumen Ejecutivo

Este documento presenta la auditoría exhaustiva, la arquitectura de eventos y el **Plan de Mejoras Avanzadas** de **Google Analytics 4 (GA4)** y **Google Tag Manager (GTM)** para **Elena Atelier**.

El objetivo principal es garantizar la trazabilidad total del embudo de conversión: desde el primer clic publicitario en Meta/TikTok hasta la navegación en el catálogo, la consulta por WhatsApp, la reserva de cita en el taller de Vitacura y el pago final de la orden.

---

## 2. Identificadores y Configuración de Infraestructura

| Componente | ID Registrado | Ubicación en Código | Estado |
| :--- | :--- | :--- | :--- |
| **GA4 Measurement ID** | `G-MFET871LBV` | `.env.local` (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) | 🟢 Activo |
| **Google Tag Manager** | `GTM-KNW2FNK4` | `.env.local` (`NEXT_PUBLIC_GTM_ID`) | 🟢 Activo |
| **Meta Pixel** | `1058654093375662` | `.env.local` (`NEXT_PUBLIC_FACEBOOK_PIXEL_ID`) | 🟢 Activo |
| **TikTok Pixel** | `D9V5UUJC77U31VPN3PIG` | `.env.local` (`NEXT_PUBLIC_TIKTOK_PIXEL_ID`) | 🟢 Activo |

---

## 3. Diccionario de Eventos GA4 y Cobertura en Código

| Evento GA4 | Tipo | Disparador (Trigger) | Parámetros Enviados | Archivo de Origen |
| :--- | :--- | :--- | :--- | :--- |
| `pageview` | Estándar | Cambio de ruta en Next.js App Router | `page_path` | `src/components/GoogleAnalytics.tsx` |
| `view_item` | E-Commerce | Clic en vestuario en el catálogo | `currency`, `value`, `item_id`, `item_name`, `item_category` | `src/app/portafolio/PortfolioClient.tsx` |
| `view_item_list` | E-Commerce | Cambio de categoría o filtro en catálogo | `item_list_name`, `category` | `src/app/portafolio/PortfolioClient.tsx` |
| `generate_lead` | Conversión | Clic en CTA de contacto en Hero y Lightbox | `item_name`, `value`, `currency` | `src/components/Hero.tsx`, `PortfolioClient.tsx` |
| `Lead` | Conversión | Inicio de formulario de agendamiento o paso 1 graduación | `event_category`, `event_label`, `utm_*` | `src/components/BookingForm.tsx`, `GraduationQualifierForm.tsx` |
| `Schedule` | Conversión Crítica | Confirmación de cita agendada en el taller | `event_category`, `event_label`, `utm_*` | `src/components/BookingForm.tsx`, `GraduationQualifierForm.tsx` |
| `Contact` | Conversión | Clic en botón flotante de WhatsApp | `event_category`, `event_label`, `utm_*` | `src/components/WhatsAppButton.tsx` |
| `begin_checkout` | E-Commerce | Selección de pasarela (Webpay / Mercado Pago) | `order_id`, `currency`, `value`, `payment_method` | `src/app/pagar/[id]/PaymentClient.tsx` |
| `add_payment_info` | E-Commerce | Copiado de datos bancarios para transferencia | `order_id`, `currency`, `value`, `payment_type` | `src/app/pagar/[id]/PaymentClient.tsx` |

---

## 4. Plan de Mejoras Avanzadas Implementadas

### 🎯 Mejora 1: Captura Automática de Parámetros UTM (Atribución Directa)
* **Diagnóstico:** Muchas conversiones llegaban sin contexto de qué anuncio específico o campaña generó el clic.
* **Solución Implementada (`src/components/GoogleAnalytics.tsx`):**
  - Creada la función `getStoredUTMs()` que extrae automáticamente `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` y `utm_term` de la URL de entrada y los persiste en `sessionStorage`.
  - Todos los eventos posteriores (clic en WhatsApp, agendamiento de cita, cotización) adjuntan automáticamente estos parámetros a GA4.

### 👗 Mejora 2: Rastreo del Catálogo y Categorías (`view_item` y `view_item_list`)
* **Diagnóstico:** Solo se medían los vestidos abiertos en modal, pero no qué categorías (Fiesta, Novias, Upcycling) eran más exploradas.
* **Solución Implementada:**
  - Se gatilla el evento `view_item_list` al cambiar los filtros superiores en el portafolio.

### 💳 Mejora 3: Rastreo de Abandono y Pasarela de Pago
* **Diagnóstico:** No se medía la interacción de pagos de clientes recibiendo órdenes por WhatsApp o mail.
* **Solución Implementada (`src/app/pagar/[id]/PaymentClient.tsx`):**
  - Disparo de `begin_checkout` con desglose de método (Webpay Plus vs Mercado Pago).
  - Disparo de `add_payment_info` cuando el usuario opta por copiar los datos de transferencia bancaria directa.

### 📱 Mejora 4: Corrección de Activación de Meta Pixel
* **Diagnóstico:** Meta Pixel Helper mostraba la alerta *"El píxel está instalado pero no se ha activado recientemente"* por falta de un `PageView` síncrono inicial.
* **Solución Implementada (`src/components/FacebookPixel.tsx`):**
  - Adición de `fbq('track', 'PageView');` dentro de la carga base del Script.

---

## 5. Lista de Chequeo en el Panel de GA4 (Acciones del Administrador)

Para visualizar correctamente estos datos en los reportes de GA4:

1. **Activar Conversiones (Eventos Clave)**:
   - Ir a **Administrar > Mostrar datos > Eventos**.
   - Marcar con el interruptor azul los eventos: `Schedule`, `generate_lead`, `Contact`, `begin_checkout`.
2. **Crear Dimensiones Personalizadas**:
   - Ir a **Definiciones personalizadas > Crear dimensión personalizada**:
     - Nombre: `payment_method` | Ámbito: Evento | Parámetro: `payment_method`
     - Nombre: `item_name` | Ámbito: Evento | Parámetro: `item_name`
3. **Vincular con Google Ads**:
   - Ir a **Administrar > Vinculación de productos > Vinculación con Google Ads** e importar los eventos `Schedule` y `generate_lead` para optimización del costo por adquisición (CPA).
