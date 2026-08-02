# Protocolo de Resguardo de Código y Directrices de Desarrollo (PRCAI)

Este documento establece las normas obligatorias de desarrollo para el proyecto **Elena Atelier**. Todos los desarrolladores y asistentes de IA deben seguir estrictamente este protocolo antes de proponer planes o realizar modificaciones de código.

---

## Regla 1: Protocolo de Análisis de Impacto (PRCAI)

Antes de realizar o proponer cualquier modificación, se debe realizar un análisis de dependencias mediante búsquedas globales (Grep) en todo el workspace para identificar impactos en las siguientes 5 áreas:

1. **Operaciones Internas (Admin)**: Mapear si afecta a `/admin/planificador` (Taller), `/admin/novias` (Alta Costura), `/admin/agenda` (Calendario) o `/admin/sales` (Ventas/POS).
2. **Operaciones del Cliente**: Comprobar compatibilidad con `/portal-novias`, `/portal-fiesta` y la pasarela de pagos `/pagar`.
3. **Capa Financiera**: Validar si se alteran planes de pago, cobros en caja o integraciones con Webpay/MercadoPago.
4. **Procesos Automáticos**: Identificar repercusiones en Webhooks (MercadoPago/WhatsApp) o Cron Jobs (`src/app/api/cron/`).
5. **Esquema de Base de Datos (BD)**: Revisar triggers, RLS, y claves foráneas en Supabase.

### Control de Detención y Aprobación
* **Riesgo Bajo** (estilos, textos locales): Se puede ejecutar directamente tras un análisis breve.
* **Riesgo Medio** (componentes locales, nuevas funciones aisladas): Se puede ejecutar explicando los cambios realizados.
* **Riesgo Alto** (base de datos, caja, pasarelas de pago, APIs/Webhooks compartidos): El desarrollador/IA **DEBE DETENERSE**. Debe presentar el análisis en `implementation_plan.md` y esperar la aprobación explícita del Administrador antes de tocar cualquier archivo.

---

## Regla 2: Consistencia Transaccional (Doble Escritura)

* **Directriz**: Toda acción de servidor que inserte, actualice o elimine registros en la tabla de hitos antigua (`bridal_milestones`) debe replicar la misma operación en la tabla unificada de producción (`work_order_milestones`) y viceversa.
* **Manejo**: Ambas operaciones deben validarse de manera secuencial o en una transacción. Si una falla, la operación completa debe arrojar error para evitar que la Agenda del Taller y el Portal del Cliente muestren fechas distintas.

---

## Regla 3: Validación Obligatoria de Base de Datos (Sin Fallos Silenciosos)

* **Directriz**: Queda prohibido ignorar el objeto `error` devuelto por las llamadas a Supabase.
* **Código obligatorio**: Cada llamada a la base de datos debe destructurar y validar el error. Si el error existe, debe ser propagado para que se muestre en la interfaz, evitando que el sistema indique un falso éxito cuando la base de datos ha rechazado el cambio.
  ```typescript
  const { data, error } = await supabase.from('...').select('*');
  if (error) {
      throw new Error("Mensaje descriptivo: " + error.message);
  }
  ```

---

## Regla 4: Experiencia Estética Premium (Sin Alertas del Navegador)

* **Directriz**: La interfaz del Atelier debe mantener una línea visual premium.
* **Prohibición**: Queda prohibido el uso de ventanas de alerta nativas del navegador (`alert()` o `confirm()`).
* **Estándar**: Toda alerta, confirmación o mensaje de error debe presentarse en componentes de diseño propios (tipo toast, modales de UI integrados o banners flotantes) con estilos redondeados (`rounded-2xl`), sombras suaves y colores consistentes con la marca.

---

## Regla 5: Eficiencia de Tokens y Lectura Quirúrgica (ETLQ)

* **Directriz**: Optimizar la latencia del modelo de IA y el consumo de tokens.
* **Lectura**: Queda prohibido leer archivos de más de 300 líneas en su totalidad si solo se requiere analizar un fragmento. Se deben utilizar rangos de líneas (`StartLine` y `EndLine`) para lecturas quirúrgicas.
* **Edición**: Las modificaciones deben aplicarse mediante reemplazos locales y precisos (`replace_file_content`). Solo se permite sobreescribir archivos enteros si son nuevos o menores a 50 líneas.
* **Conversación**: Evitar duplicar bloques extensos de código o planes de diseño en el chat; usar enlaces markdown (`[actions.ts:L100-120](file://...)`) y resúmenes breves.

---

## Regla 6: Esquemas Seguros de Base de Datos

* **Directriz**: Mantener consistencia entre el entorno de desarrollo y producción.
* **Norma**: Cualquier modificación a la estructura de la base de datos (tablas, columnas, triggers o políticas RLS) debe realizarse mediante **migraciones ordenadas hacia adelante** (`.sql` documentados). Queda prohibido alterar esquemas manualmente a través del panel web de Supabase sin registrar el script correspondiente en el código.
