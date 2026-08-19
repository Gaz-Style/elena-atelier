/**
 * Plantilla de Cloudflare Worker para Recepción de Correos (Elena Atelier)
 * 
 * Este script se debe desplegar en Cloudflare Workers y asociar como destino
 * en Cloudflare Email Routing para la dirección "contacto@elenalacosturera.cl".
 * 
 * Requisitos:
 * 1. Instalar la librería 'postal-mime' en el Worker para procesar correos.
 * 2. Asociar la ruta de correo a este Worker.
 */

import PostalMime from 'postal-mime';

export default {
  async email(message, env, ctx) {
    // 1. Leer el flujo de datos del correo crudo
    const parser = new PostalMime();
    let parsedEmail;
    try {
      parsedEmail = await parser.parse(message.raw);
    } catch (parseError) {
      console.error('Error parseando el correo crudo:', parseError);
      // Intentamos seguir para no bloquear la cola de correos
    }

    // 2. Extraer y formatear los datos para el CRM
    if (parsedEmail) {
      const payload = {
        fromName: parsedEmail.from.name || '',
        fromEmail: parsedEmail.from.address,
        subject: parsedEmail.subject || '(Sin Asunto)',
        bodyText: parsedEmail.text || '',
        bodyHtml: parsedEmail.html || '',
        messageId: parsedEmail.messageId || null // Crucial para agrupar hilos
      };

      // 3. Enviar los datos estructurados al Webhook del CRM
      // Asegúrate de cambiar la URL en producción si tu dominio es distinto
      const webhookUrl = 'https://elenalacosturera.cl/api/webhooks/incoming-email?secret=elena_atelier_secret';

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Cloudflare-Email-Worker'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          console.error(`CRM Webhook respondió con error: ${response.status} ${response.statusText}`);
        } else {
          console.log('Correo registrado exitosamente en el CRM');
        }
      } catch (fetchError) {
        console.error('Error de red al llamar al webhook del CRM:', fetchError);
      }
    }

    // 4. Reenviar el correo original intacto a la casilla de Gmail de respaldo
    // Esto garantiza que sigas recibiendo el correo en tu bandeja diaria de Gmail.
    try {
      await message.forward('elenaatalier@gmail.com');
      console.log('Correo reenviado exitosamente a elenaatalier@gmail.com');
    } catch (forwardError) {
      console.error('Error al reenviar el correo a Gmail:', forwardError);
    }
  }
};
