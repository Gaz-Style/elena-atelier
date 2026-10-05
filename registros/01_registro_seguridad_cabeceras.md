# 🛡️ Registro de Actualización de Seguridad

**Fecha:** 5 de Octubre de 2026  
**Componente:** `next.config.ts`  
**Tipo de Mejora:** Hardening HTTP (Cabeceras de Seguridad Parciales y Seguras)  

## Resumen del Cambio
Se aplicaron cabeceras de seguridad fundamentales a nivel de servidor (Next.js) para proteger la integridad de las sesiones de los usuarios y prevenir ataques automatizados, sin afectar integraciones de terceros (Pasarelas de Pago, Analytics, Píxeles).

## Cabeceras Implementadas:
1. **`X-Frame-Options: SAMEORIGIN`**: Previene ataques de Clickjacking. Bloquea que otras páginas web incrusten el panel de Elena Atalier dentro de iframes maliciosos.
2. **`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`**: (HSTS) Obliga a los navegadores a interactuar con la web **exclusivamente** mediante HTTPS, protegiendo contra ataques de "intermediario" (Man-in-the-Middle) en redes Wi-Fi públicas.
3. **`X-Content-Type-Options: nosniff`**: Impide que el navegador "adivine" el tipo de los archivos descargados, forzando la interpretación declarada. Esto bloquea inyecciones de scripts camuflados en archivos de imagen o PDFs.
4. **`X-DNS-Prefetch-Control: on`**: Controla el pre-procesamiento de DNS para equilibrar la fuga de información vs el rendimiento.
5. **`Referrer-Policy: origin-when-cross-origin`**: Protege la privacidad de las URLs internas (ej. tokens en la barra de direcciones) al navegar hacia sitios de terceros.

## Políticas Omitidas Intencionalmente
Se omitió deliberadamente la política **Content-Security-Policy (CSP)** estricta, dado que la plataforma consume scripts externos dinámicos (Transbank, Mercado Pago, Meta Pixel, Google Analytics). Implementar un CSP requerirá una auditoría posterior para incluir todos los orígenes en la lista blanca y evitar la disrupción de ventas.
