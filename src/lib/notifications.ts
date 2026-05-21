import { createClient } from '@/lib/supabase/server';

export async function sendWelcomeNotifications(customer: { id: string; full_name: string; email: string; phone: string }) {
  const supabase = await createClient();
  
  const firstName = customer.full_name.split(' ')[0];

  // 1. Email Simulation
  const emailBody = `Estimada ${firstName},

Es un privilegio darte la bienvenida al atelier.

A partir de hoy, tu perfil está activo en ELENA La Costurera. Cada prenda que trabajemos juntas quedará registrada aquí, con la atención y el cuidado que cada pieza merece.

Nuestro espacio en Av. Tabancura 1091, Vitacura, siempre está disponible para ti.

Si deseas compartir tu primera impresión o conocer las experiencias de otras clientas:
https://g.page/r/Cfv2lRZLdYUuEBM/review

Con cariño,
Elena Rojas
ELENA La Costurera`;

  console.log('--- ENVIANDO CORREO ELECTRÓNICO ---');
  console.log('Para:', customer.email);
  console.log('Mensaje:', emailBody);

  await supabase.from('notification_logs').insert({
    customer_id: customer.id,
    type: 'email',
    template: 'welcome_v2',
    status: 'sent'
  });

  // 2. WhatsApp Simulation
  const whatsappMessage = `Hola ${firstName} ✨\n\nBienvenida a ELENA La Costurera. Tu perfil ya está activo en nuestro atelier.\n\nEstamos aquí para acompañarte en cada pieza.\n\n— ELENA La Costurera\nAv. Tabancura 1091, Vitacura`;

  console.log('--- ENVIANDO WHATSAPP ---');
  console.log('Para:', customer.phone);
  console.log('Mensaje:', whatsappMessage);

  await supabase.from('notification_logs').insert({
    customer_id: customer.id,
    type: 'whatsapp',
    template: 'welcome_v2',
    status: 'sent'
  });

  return { success: true };
}
