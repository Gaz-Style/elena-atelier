# 📊 Análisis Completo e Implementación de Google Analytics 4 (GA4) & GTM
**Elena Atelier — Vitacura Hub**

---

## 1. Resumen Ejecutivo

Este documento presenta la auditoría exhaustiva, la arquitectura de eventos y el estado de implementación de **Google Analytics 4 (GA4)** y **Google Tag Manager (GTM)** para el ecosistema digital de **Elena Atelier**.

El objetivo principal de esta configuración es garantizar un rastreo preciso del embudo de conversión completo: desde la navegación inicial en el catálogo de alta costura hasta la reserva de citas en el taller de Vitacura y la confirmación de pagos en línea.

---

## 2. Identificadores y Configuración de Infraestructura

| Componente | ID Registrado | Ubicación en Código | Estado |
| :--- | :--- | :--- | :--- |
| **GA4 Measurement ID** | `G-MFET871LBV` | `.env.local` (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) | 🟢 Activo |
| **Google Tag Manager** | `GTM-KNW2FNK4` | `.env.local` (`NEXT_PUBLIC_GTM_ID`) | 🟢 Activo |
| **Meta Pixel** | `1058654093375662` | `.env.local` (`NEXT_PUBLIC_FACEBOOK_PIXEL_ID`) | 🟢 Activo |
| **TikTok Pixel** | `D9V5UUJC77U31VPN3PIG` | `.env.local` (`NEXT_PUBLIC_TIKTOK_PIXEL_ID`) | 🟢 Activo |

---

## 3. Diccionario de Eventos GA4 y Cobertura en el Código

| Evento GA4 | Tipo | Disparador (Trigger) | Parámetros Enviados | Archivo de Origen |
| :--- | :--- | :--- | :--- | :--- |
| `pageview` | Estándar | Cambio de ruta en Next.js App Router (`usePathname`, `useSearchParams`) | `page_path` | `src/components/GoogleAnalytics.tsx` |
| `view_item` | E-Commerce | Clic en vestuario en el catálogo (`DressGridItem`) | `currency`, `value`, `item_id`, `item_name`, `item_category` | `src/app/portafolio/PortfolioClient.tsx` |
| `generate_lead` | Conversión | Clic en CTA de contacto en Hero y Lightbox | `item_name`, `value`, `currency` | `src/components/Hero.tsx`, `PortfolioClient.tsx` |
| `Lead` | Conversión | Inicio de formulario de agendamiento o paso 1 de graduación | `event_category`, `event_label` | `src/components/BookingForm.tsx`, `GraduationQualifierForm.tsx` |
| `Schedule` | Conversión Crítica | Confirmación de cita agendada en el taller | `event_category`, `event_label` | `src/components/BookingForm.tsx`, `GraduationQualifierForm.tsx` |
| `Contact` | Conversión | Clic en el botón flotante de WhatsApp | `event_category`, `event_label` | `src/components/WhatsAppButton.tsx` |
| `begin_checkout` | E-Commerce | Selección de pasarela (Webpay Plus / Mercado Pago) en `/pagar/[id]` | `order_id`, `currency`, `value`, `payment_method` | `src/app/pagar/[id]/PaymentClient.tsx` |
| `add_payment_info` | E-Commerce | Copiado de datos bancarios para transferencia directa | `order_id`, `currency`, `value`, `payment_type` | `src/app/pagar/[id]/PaymentClient.tsx` |

---

## 4. Mejoras Técnicas Implementadas en el Código

1. **Soporte Dual `gtag` + `dataLayer` (`src/components/GoogleAnalytics.tsx`)**:
   - Se refactorizó el helper `trackGAEvent` para enviar eventos tanto por `window.gtag` como mediante `window.dataLayer.push()`. Esto evita pérdida de eventos si GTM o scripts asíncronos tardan en cargar.
   - Soporta transmisión de parámetros personalizados extendidos (`params`).

2. **Medición del Embudo de Pago (`src/app/pagar/[id]/PaymentClient.tsx`)**:
   - Integración de los eventos e-commerce `begin_checkout` y `add_payment_info` para medir el abandono y conversión en la pasarela de pago de órdenes.

3. **Catálogo Interactivo y Lightbox (`src/app/portafolio/PortfolioClient.tsx`)**:
   - Rastreo de interacción `view_item` por vestido con parámetros de valor (precio en CLP) y categoría.
   - Rastreo de `generate_lead` al presionar "Conversemos" dentro de la ficha de detalle.

4. **Navegación Dinámica SPA en Next.js 14**:
   - `AnalyticsTracker` monitorea activamente las transiciones de URL mediante React Suspense y hooks de Next.js (`usePathname`, `useSearchParams`).

---

## 5. Recomendaciones de Configuración en el Panel de GA4 (Google Analytics Admin)

Para habilitar informes de atribución completos en Google Ads y Meta Ads, ejecute las siguientes acciones en el panel web de GA4 (`G-MFET871LBV`):

1. **Marcar Eventos Clave (Conversiones)**:
   - Ir a **Administrar > Mostrar datos > Eventos**.
   - Marcar como **Evento clave (Key Event)** los siguientes eventos:
     - `Schedule` (Citas confirmadas en taller)
     - `generate_lead` (Interés en vestidos/diseño)
     - `Contact` (Inicios de chat por WhatsApp)
     - `begin_checkout` (Inicio de proceso de pago)

2. **Dimensiones Personalizadas (Custom Dimensions)**:
   - Registrar las siguientes dimensiones personalizadas en **Administrar > Definiciones personalizadas**:
     - `payment_method` (Alcance del evento)
     - `item_name` (Alcance del evento)

3. **Vinculación con Google Ads / Meta CAPI**:
   - Vincular la propiedad de GA4 con la cuenta publicitaria de Google Ads para importar los eventos `Schedule` y `generate_lead` como conversiones principales de la campaña.
