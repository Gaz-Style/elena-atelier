# Plan de Implementación: WhatsApp Coexistencia y DeepSeek Bot
**Elena Atelier — Vitacura Hub**

Este documento detalla los pasos para migrar al nuevo número de atención oficial (`+56934373844`), habilitar la coexistencia (Meta Cloud API + WhatsApp Business App) y automatizar el embudo de consultas mediante el modelo DeepSeek.

---

## 1. Arquitectura del Sistema (Modo Coexistencia)

El objetivo es permitir que la IA atienda consultas automatizadas desde la web o anuncios, pero que el administrador pueda intervenir de manera manual desde el celular en cualquier momento utilizando la misma línea.

### Flujo del Webhook (Detección de Intervención Humana)
Para evitar conflictos de respuesta entre la IA y el humano, el backend debe implementar la siguiente lógica:

1. **Mensaje Entrante del Cliente:**
   - El Webhook de Meta recibe el mensaje.
   - El sistema comprueba si el chat está "Silenciado" (Modo Manual activo).
   - Si **no** está silenciado, el mensaje se envía a la API de **DeepSeek** para generar una respuesta automática.
   - Si **sí** está silenciado, la IA no hace nada (el chat queda a cargo del humano).

2. **Mensaje Saliente del Administrador (Echo Message):**
   - Cuando el administrador escribe un mensaje manualmente desde el celular usando la app WhatsApp Business, Meta envía un evento de webhook donde el remitente (`from`) es nuestro propio número oficial (`56934373844`).
   - Al detectar este evento, el backend activa un **Silencio Temporal** (bloqueo de IA) de **30 minutos** para ese usuario.
   - Cada mensaje nuevo enviado por el humano reinicia el temporizador de 30 minutos.

---

## 2. Configuración Técnica del Número (+56934373844)

Siga este orden estricto de registro para evitar la desactivación de la API por parte de Meta:

1. **Registro en la Nube (Meta Cloud API):**
   - Registrar el número dentro del Panel de Desarrolladores de Meta.
   - Realizar la verificación del código de seguridad (SMS o llamada).
2. **Vinculación Móvil (App WhatsApp Business):**
   - Instalar la aplicación en el smartphone del taller.
   - Iniciar sesión verificando nuevamente el número mediante SMS. Meta detectará que forma parte del Business Manager corporativo y habilitará el uso dual.

*Nota: Las plantillas de notificaciones ya creadas en el Administrador de Meta se comparten automáticamente porque están asociadas a la Cuenta Comercial (WABA), no al número telefónico.*

---

## 2.1. Fase de Validación Crítica (Pre-Despliegue)

Antes de realizar cualquier cambio en el código en producción o redirigir los enlaces de la web, se debe completar este protocolo de pruebas para evitar romper el canal de comunicación actual con los clientes:

1. **Estabilidad Móvil:** Confirmar que el inicio de sesión en la aplicación móvil de WhatsApp Business en el celular del taller funcione de manera estable (tras expirar la hora de bloqueo de Meta).
2. **Prueba de Envío API:** Utilizar la consola de desarrollador de Meta para enviar un mensaje de prueba al número personal de Elena desde el nuevo ID de teléfono (`1358488490670186`).
3. **Monitoreo de Logs:** Verificar que los eventos de mensajes del nuevo número se reciban en el Webhook de prueba antes de realizar modificaciones en el código de producción.

---


## 3. Mejoras en el Sitio Web (Conversión)

### Acciones en el Frontend:
1. **Remoción de Precios de Referencia:**
   - Eliminar tarifas y precios fijos de las secciones de Portafolio y Servicios para evitar la autodescalificación del cliente.
2. **Enlaces de WhatsApp con Contexto en el Portafolio:**
   - Cambiar los botones de registro antiguos y convertirlos en enlaces a WhatsApp parametrizados.
   - **Ejemplo:** Al ver un vestido de novia, el botón de "Cotizar" o "Conversar" debe abrir WhatsApp con el texto:
     `https://wa.me/56934373844?text=Hola%20Elena%2C%20estaba%20viendo%20tu%20portafolio%20y%20me%20encant%C3%B3%20el%20vestido%20de%20[Nombre_Vestido]`

---

## 4. Análisis del Sistema Existente y Refactorización del Webhook

El sistema actualmente cuenta con un Webhook activo en [route.ts](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/api/webhooks/whatsapp/route.ts) que maneja las interacciones entrantes a través de Supabase en las tablas `crm_whatsapp_chats` y `crm_whatsapp_messages`.

### Diagnóstico del Código Actual:
*   **Estado inicial:** Cuando entra un mensaje, el sistema crea un chat con `session_status: 'bot'`.
*   **Respuesta actual:** Envía un mensaje estático indicando al usuario que escriba al WhatsApp personal de Elena (`+56937667709`) y cambia inmediatamente el estado del chat a `'human'` para evitar bucles.
*   **Credenciales:** Las solicitudes apuntan a `https://graph.facebook.com/v21.0/${phoneId}/messages` usando las variables globales `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_API_TOKEN`.

### Plan de Modificación en Código:
1.  **Migración de Configuración (`.env`):**
    *   Reemplazar las variables globales de entorno para apuntar al nuevo número `+56934373844`.
2.  **Integración de la API de DeepSeek:**
    *   Reemplazar el bloque de respuesta estática (línea 144) por una llamada asíncrona a la API de DeepSeek. Esta llamada pasará el historial de mensajes de la conversación (`crm_whatsapp_messages`) como contexto para generar la respuesta dinámica orientada al agendamiento.
3.  **Lógica de Intervención Humana (Silenciador):**
    *   Interceptar los mensajes enviados por el propio número de la empresa en la cabecera del bucle de mensajes (si `phoneNumber === '56934373844'`). Al detectarlos, el webhook debe actualizar de forma automática `crm_whatsapp_chats.session_status` a `'human'`, silenciando las respuestas del bot temporalmente.

---

## 5. Mejoras de Medición (Google Analytics)

Actualmente, las interacciones detalladas de cada vestido no se trackean porque la vista se maneja a través de un modal (Lightbox) en React y no por navegación de páginas.

### Plan de Modificación en Código:
1.  **Gatillar Eventos de Clic en el Catálogo:**
    *   Modificar la función `DressGridItem` en [PortfolioClient.tsx](file:///c:/Users/ADMIN/Downloads/IA%20trabajaos/Elena%20Atalier/src/app/portafolio/PortfolioClient.tsx).
    *   Interceptar el `onClick` que abre el modal para llamar a `window.gtag` con el evento `view_item` de GA4, enviando los parámetros `item_id`, `item_name` y `value` (precio del vestido).

---

## 6. Futura Implementación: Mini-Chatbot Web (Árbol de Decisiones)

Para mejorar el engagement y pre-cualificar a las clientas sin forzarlas a salir abruptamente de la web, se propone un widget interactivo antes de la redirección definitiva a WhatsApp.

### Diseño de la Experiencia:
1. **Acción de Clic:** Al pulsar "Hablar con Elena" en el modal del vestido, en lugar de abrir WhatsApp, se despliega una mini-ventana flotante en la esquina inferior de la pantalla.
2. **Mensaje de Bienvenida:** Un bot pre-programado (Sofía) saluda y presenta 2 o 3 opciones rápidas con botones para evitar que el cliente tenga que escribir:
   * *¿Qué tipo de asesoría buscas?*
     * [Diseño a Medida]
     * [Arreglo de Vestido Heredado (Upcycling)]
     * [Solo una Consulta de Valores]
3. **Redirección Parametrizada:** Al hacer clic en una opción, el widget procesa la respuesta y abre una pestaña de WhatsApp dirigida al nuevo número oficial de coexistencia con la respuesta y el nombre del vestido ya pre-cargados en el texto.
4. **Ventajas:** Cero costo de procesamiento (no usa la API de DeepSeek en esta fase web), mayor control sobre el embudo, y alta tasa de conversión al simplificar la interacción a base de botones.



