# 📋 Checklist Maestro de Optimización y Blindaje del Sistema
**Proyecto:** Elena Atelier (Alta Costura & Sastrería Digital)  
**Fecha de Creación:** 28 de Octubre, 2026  
**Objetivo:** Guía de ejecución paso a paso para resolver deudas técnicas, blindar seguridad y pagos, y maximizar la confiabilidad operativa del sistema.

---

## 📌 Guía de Estados
- `[ ]` **Pendiente** (Por iniciar)
- `[-]` **En Proceso** (En desarrollo/pruebas)
- `[x]` **Completado** (Validado y verificado)

---

## FASE 1: Transacciones Financieras y Webpay 🔴 (Prioridad Crítica)

> **Objetivo:** Eliminar el riesgo de pagos cobrados al cliente que no queden confirmados o registrados en el ERP debido a desconexiones en el navegador.

- [x] **1.1. Crear Route Handler de Servidor para Callback de Webpay**
  - **Archivo creado:** [src/app/api/webpay/callback/route.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/api/webpay/callback/route.ts)
  - **Acción:** Recibir `token_ws` o `TBK_TOKEN` mediante petición `POST`/`GET` desde Transbank, ejecutar `commitWebpayTransaction(token_ws)` en el backend y actualizar el estado de la orden en Supabase dentro del servidor.
  - **Criterio de Aceptación:** Si el usuario cierra el navegador en Transbank, la base de datos se actualiza igualmente de forma atómica.

- [x] **1.2. Refactorizar la Vista del Callback en Frontend**
  - **Archivo afectado:** [src/app/pagar/webpay-callback/page.tsx](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/pagar/webpay-callback/page.tsx)
  - **Acción:** Eliminar la ejecución de `commitWebpayTransaction` dentro del `useEffect`. La página ahora lee los datos aprobados confirmados por el servidor o ejecuta un fallback seguro para enlaces legados.
  - **Criterio de Aceptación:** Recargar la página (`F5`) no produce errores de "Token ya utilizado" ni llamadas duplicadas a la API de Transbank.

- [x] **1.3. Ocultar Credenciales de Comercio en Variables de Servidor**
  - **Archivo afectado:** [src/lib/transbank.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/lib/transbank.ts#L5)
  - **Acción:** Se prioriza `TBK_COMMERCE_CODE` en el servidor con fallback seguro y se asigna una URL de callback centralizada (`/api/webpay/callback`).
  - **Criterio de Aceptación:** El código de comercio se procesa en el entorno del servidor y la URL por defecto apunta a la API backend.

- [x] **1.4. Optimización de Rendimiento en Checkout POS y Webhooks (Latencia < 1.5s)**
  - **Archivos afectados:** [src/app/admin/accounting/actions.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/admin/accounting/actions.ts), [src/app/admin/pos/actions.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/admin/pos/actions.ts), [src/app/admin/caja/actions.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/admin/caja/actions.ts), [src/app/api/webhooks/mercadopago/route.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/api/webhooks/mercadopago/route.ts)
  - **Acción:** Se erradicó el bucle síncrono `syncSalesLedgerToAccounting()` que borraba y recalculaba todo el historial (525 queries secuenciales a Supabase que congelaban la pantalla 45-55s por venta). Se implementó `recordSaleInAccounting` de ejecución atómica, no bloqueante e instantánea.
  - **Criterio de Aceptación:** Las ventas POS y cobros de saldos se procesan en menos de 1.5 segundos.

- [x] **1.5. Visibilidad Integral de Notificaciones de Negocio en LiveChat y Corrección DB**
  - **Archivos afectados:** [src/lib/notifications.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/lib/notifications.ts), [src/lib/agenda.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/lib/agenda.ts), [src/app/api/orchestrator/route.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/api/orchestrator/route.ts), [src/app/api/webhooks/incoming-email/route.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/api/webhooks/incoming-email/route.ts), [src/app/admin/novias/actions.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/admin/novias/actions.ts), [src/app/admin/sales/actions.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/admin/sales/actions.ts)
  - **Acción:** Se corrigió la restricción de Postgres (`sender_type: 'bot'` en vez de `'system'`). Se creó la función centralizada `registrarNotificacionEnLiveChat()` que inserta cada alerta (citas agendadas, cobros POS/Webpay, correos entrantes, solicitudes de autorización, intervención humana) en `crm_whatsapp_messages` y actualiza `last_interaction` en `crm_whatsapp_chats`.
  - **Criterio de Aceptación:** Todas las alertas disparadas a los teléfonos de administración se reflejan de inmediato al tope de la bandeja de entrada del LiveChat administrativo (`/admin/livechat`).

---

## FASE 2: Resiliencia de WhatsApp Webhook y Agente IA 🟠 (Prioridad Alta)

> **Objetivo:** Garantizar que el webhook cumpla los tiempos exigidos por Meta (<3s) y eliminar duplicaciones de mensajes o bucles del chatbot.

- [ ] **2.1. Eliminar Espera Activa (`while`) en el Webhook de WhatsApp**
  - **Archivo afectado:** [src/app/api/webhooks/whatsapp/route.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/api/webhooks/whatsapp/route.ts#L210-L226)
  - **Acción:** Retirar el ciclo de espera síncrono `while (waited < 8000)`. Responder siempre con HTTP `200 OK` en menos de 500 ms y delegar la espera/secuencia de multimedia a la cola asíncrona de QStash.
  - **Criterio de Aceptación:** Ninguna petición entrante de Meta supera 1 segundo de respuesta; se eliminan los reintentos automáticos de Meta.

- [ ] **2.2. Parametrizar la URL del Orquestador (Eliminar URL Hardcodeada)**
  - **Archivo afectado:** [src/app/api/webhooks/whatsapp/route.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/api/webhooks/whatsapp/route.ts#L265)
  - **Acción:** Reemplazar `https://www.elenalacosturera.cl/api/orchestrator` por `process.env.NEXT_PUBLIC_SITE_URL + '/api/orchestrator'` o variable de entorno de entorno actual.
  - **Criterio de Aceptación:** En ambientes locales o de preview en Vercel, el webhook no invoca la base de producción.

- [ ] **2.3. Blindar el Secreto de Autorización del Orquestador**
  - **Archivo afectado:** [src/app/api/orchestrator/route.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/api/orchestrator/route.ts#L15)
  - **Acción:** Eliminar el fallback inseguro `'antigravity-secret'`. Si `process.env.CRON_SECRET` no está configurado, la ruta debe rechazar la llamada y emitir un warning en logs.
  - **Criterio de Aceptación:** Peticiones sin un token válido configurado en el entorno son denegadas con `401 Unauthorized`.

---

## FASE 3: Seguridad, Autenticación y Control de Acceso (RBAC) 🟠 (Prioridad Alta)

> **Objetivo:** Proteger los datos personales de clientes y blindar el acceso a la administración.

- [ ] **3.1. Validar Roles Administrativos en Middleware**
  - **Archivo afectado:** [src/lib/supabase/middleware.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/lib/supabase/middleware.ts#L39-L46)
  - **Acción:** Validar no solo que el usuario esté autenticado, sino que posea el rol `admin` (`user.app_metadata.role === 'admin'`).
  - **Criterio de Aceptación:** Usuarios autenticados sin rol `admin` son redirigidos fuera de `/admin` sin acceso a los paneles.

- [ ] **3.2. Proteger el Endpoint `getBridalProjectById` en Portales de Clientes**
  - **Archivos afectados:**
    - [src/app/admin/novias/actions.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/admin/novias/actions.ts#L82)
    - [src/app/portal-novias/[id]/page.tsx](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/portal-novias/%5Bid%5D/page.tsx#L103)
  - **Acción:** Crear una función específica para portales de clientes que verifique que el solicitante sea el titular del proyecto (validando RUT/Email en cookie de sesión o firma HMAC) antes de entregar datos sensibles con el service role.
  - **Criterio de Aceptación:** No es posible consultar datos de otro cliente cambiando únicamente el UUID en la URL.

---

## FASE 4: Refactorización y Modularización de Archivos Monolíticos 🟡 (Prioridad Media)

> **Objetivo:** Reducir la complejidad ciclomática de los archivos de más de 2.000 líneas para evitar errores colaterales al actualizar código.

- [ ] **4.1. Modularizar `src/app/admin/pos/actions.ts` (~2.800 líneas)**
  - **Acción:** Dividir en submódulos especializados dentro de `src/lib/services/pos/`:
    - `pos-orders.service.ts`: Creación y actualización de órdenes y presupuestos.
    - `pos-payments.service.ts`: Manejo de pagos mixtos, caja y vouchers.
    - `pos-terminal.service.ts`: Despertar de terminales Mercado Pago Point.
    - `pos-notifications.service.ts`: Envío de comprobantes y cotizaciones por correo/WhatsApp.
  - **Criterio de Aceptación:** `src/app/admin/pos/actions.ts` actúa únicamente como exportador liviano de Server Actions (`'use server'`).

- [ ] **4.2. Modularizar `src/app/admin/novias/actions.ts` (~2.300 líneas)**
  - **Acción:** Dividir en submódulos especializados dentro de `src/lib/services/bridal/`:
    - `bridal-projects.service.ts`: CRUD de proyectos de alta costura, hitos y fechas.
    - `bridal-measurements.service.ts`: Registro y cálculo de medidas anatómicas.
    - `bridal-contracts.service.ts`: Generación y aceptación de contratos y anexos.
    - `bridal-finance.service.ts`: Planes de pago en cuotas y abonos.
  - **Criterio de Aceptación:** Archivos individuales con menos de 400 líneas y responsabilidades únicas.

---

## FASE 5: Higiene del Repositorio y Normalización de Base de Datos 🟡 (Prioridad Media)

> **Objetivo:** Mantener el repositorio limpio, ligero y con sincronización clara entre el código y la base de datos en Supabase.

- [ ] **5.1. Limpieza de Scripts Temporales y Backups en la Raíz**
  - **Archivos a mover o limpiar:**
    - Scripts sueltos: `check_*.js` (35+ archivos), `test-*.js` (25+ archivos), `_tmp_*.js` (8 archivos), `repair_*.js`.
    - Backups en desuso: `old_route.ts` (84 KB), `route_1400.ts` (89 KB), `current_route.ts` (102 KB), `sitemap.ts.bak`.
  - **Acción:** Crear carpeta `scripts/legacy_tools/` para archivar los scripts útiles y eliminar duplicados o copias obsoletas.
  - **Criterio de Aceptación:** La raíz del proyecto solo contiene archivos estándar de configuración (`package.json`, `next.config.ts`, etc.).

- [ ] **5.2. Consolidación de Migraciones SQL**
  - **Acción:** Mover los 24 archivos `.sql` sueltos en la raíz hacia `supabase/migrations/` con nombres fechados coherentes, garantizando que el historial de base de datos sea reproducible.
  - **Criterio de Aceptación:** Toda alteración a la base de datos queda documentada en `supabase/migrations/`.

- [ ] **5.3. Limpieza de Consultas a Tablas/Columnas Obsoletas**
  - **Acción:** Actualizar referencias que busquen `appointments` (la tabla real es `crm_whatsapp_chats` o `work_orders`) o `customers.source`.
  - **Criterio de Aceptación:** Los logs de auditoría no arrojan errores de "tabla o columna no encontrada en el schema cache".

---

## FASE 6: Optimización de Conversión (CRO) y Experiencia de Usuario 🟢 (Prioridad de Crecimiento)

> **Objetivo:** Convertir las visitas de alta intención (identificadas en el análisis de marketing) en clientes y reservas efectivas.

- [ ] **6.1. Botón Sticky de Cotización en Catálogo Completo de Arreglos**
  - **Archivo afectado:** `src/app/costuras/catalogo-completo/page.tsx`
  - **Acción:** Incorporar un botón de WhatsApp flotante dinámico que permita cotizar prendas específicas directamente.
  - **Criterio de Aceptación:** La tasa de clics a WhatsApp desde el catálogo aumenta respecto al promedio semanal.

- [ ] **6.2. Banner de Urgencia y Exclusividad en Graduaciones 2026**
  - **Archivos afectados:** `src/app/graduacion/page.tsx` y comunas satélite (`las-condes`, `maipu`, `chicureo`).
  - **Acción:** Añadir un distintivo de "Cupos de Confección Limitados para Temporada Alta (Noviembre – Diciembre)" con llamado directo a agendar prueba.
  - **Criterio de Aceptación:** Aumento de leads en los formularios de exclusividad de graduación.

---

## 📌 Registro de Avance por Fase

| Fase | Título | Total Tareas | Completadas | Estado |
| :--- | :--- | :---: | :---: | :---: |
| **Fase 1** | Pagos, POS y Rendimiento (Crítico) | 5 | 5 | `Completado` ✅ |
| **Fase 2** | WhatsApp & Orquestador IA | 3 | 0 | `Pendiente` |
| **Fase 3** | Seguridad y RBAC | 2 | 0 | `Pendiente` |
| **Fase 4** | Refactorización de Monolitos | 2 | 0 | `Pendiente` |
| **Fase 5** | Limpieza de Repositorio & DB | 3 | 0 | `Pendiente` |
| **Fase 6** | Optimización de Conversión (CRO) | 2 | 0 | `Pendiente` |
| **TOTAL** | | **17** | **5** | **29%** |
