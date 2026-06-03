# 🗺️ Hoja de Ruta Maestra (Roadmap) - Elena Atelier

Este documento consolida el estado actual de todo el ecosistema de software de **Elena Atelier**. Aquí puedes revisar, a vista de pájaro, qué se ha construido y qué tareas de ingeniería o infraestructura quedan pendientes por ejecutar en cada módulo.

---

## 🧵 1. Módulo de Gobernanza y Producción
**Estado General:** `Avanzado / Estable`

### ✅ Completado recientemente:
- Tablero privado de **KPIs Financieros** (Ranking de productos más vendidos, márgenes de ganancia, ticket promedio).
- Botón de pánico rojo de alerta ejecutiva.
- **Predictor de Cargas de Trabajo:** Algoritmo que analiza la cantidad de pedidos vs capacidad instalada y recomienda si necesitas contratar más costureras o disminuir turnos.

### ⏳ Tareas Pendientes:
- [ ] **Despliegue a Producción (Vercel):** Hay un error pendiente en los despliegues automáticos relacionado con la convención del archivo `middleware` de Next.js 16.1.1. Debe corregirse antes del próximo Deploy oficial.
- [ ] Conectar el predictor de carga a datos en tiempo real de la base de datos (actualmente es una simulación visual basada en el frontend).

---

## 👥 2. Módulo de RRHH (Recursos Humanos)
**Estado General:** `Estable`

### ✅ Completado recientemente:
- Tablero de **Rendimiento de Operarias**.
- Cálculo de medias de tareas realizadas y comparativas visuales para mejorar producción.

### ⏳ Tareas Pendientes:
- [ ] Integrar el reloj control o registro de horas trabajadas directamente a la base de datos de Supabase.
- [ ] Sistema de bonos automáticos: Lógica para calcular incentivos a operarias si superan la media de producción establecida.

---

## 🚀 3. Módulo de Marketing & Captación
**Estado General:** `Infraestructura Codificada / Pendiente de Integración API`

### ✅ Completado recientemente:
- **Generador Programmatic SEO:** Rutas dinámicas (`/servicios/[comuna]/[especialidad]`) listas para rankear en Google.
- **Ruteo QR VIP:** Landing pages para tarjetas físicas (`/vip/[codigo]`).
- **Asistente de Contenido IA y Newsletter:** UI del panel construida.
- **Webhooks y Cron Jobs:** Endpoints de backend listos para control de inventario y CRM.

### ⏳ Tareas Pendientes:
- [ ] **Acción del Administrador:** Ejecutar el código SQL actualizado (`supabase_marketing_module.sql`) en el panel online de Supabase.
- [ ] **Integración de APIs Externas:** Conectar el *Asistente IA* a la API de OpenAI/DeepSeek y el *Newsletter* a la API de envíos (Resend).
- [ ] Configurar el **Cron Job externo** (ej. GitHub Actions o Cron-job.org) para que apunte a `https://tuweb.com/api/cron/stock`.

---

## 💬 4. Módulo Livechat / CRM General
**Estado General:** `En Desarrollo Continuo`

### ✅ Completado recientemente:
- Disparador automático de solicitud de reseñas de Google Maps vía WhatsApp cuando un pedido pasa a estado "Entregado".

### ⏳ Tareas Pendientes:
- [ ] Autenticación completa de clientes en su portal de seguimiento (Client Portal).
- [ ] Chatbot de IA entrenado con los precios y tiempos de costura para responder automáticamente a los leads fríos.

---

> [!TIP]
> **Tu Decisión Estratégica**
> Al ver este panorama completo, ¿Qué casilla pendiente (marcada con `[ ]`) te gustaría que resolvamos a continuación? 
> *(Sugerencia técnica: El error de despliegue en Vercel es un bloqueador importante si deseas que el mundo vea estos cambios pronto).*
