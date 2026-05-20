import { createClient } from '@/lib/supabase/server';

export async function sendWelcomeNotifications(customer: { id: string; full_name: string; email: string; phone: string }) {
  const supabase = await createClient();
  
  const firstName = customer.full_name.split(' ')[0];

  // 1. Email Simulation
  const emailBody = `
    Hola ${firstName},
    
    ¡Bienvenida al Círculo Exclusivo de Elena Atelier! 
    Es un honor para nosotros que seas parte de nuestra comunidad de alta costura. 
    A partir de ahora, tu historial y medidas estarán centralizados para brindarte 
    una atención artesanal perfecta.
    
    Como parte de nuestro compromiso con la excelencia, te invitamos a conocer las opiniones de nuestra distinguida clientela y compartir tu experiencia en nuestro perfil de Google:
    https://g.page/r/Cfv2lRZLdYUuEBM/review
    
    Te esperamos pronto en Av. Tabancura 1091, Vitacura.
    
    Con cariño,
    Elena Rojas
  `;

  console.log('--- ENVIANDO CORREO ELECTRÓNICO ---');
  console.log('Para:', customer.email);
  console.log('Mensaje:', emailBody);

  await supabase.from('notification_logs').insert({
    customer_id: customer.id,
    type: 'email',
    template: 'welcome_v1',
    status: 'sent'
  });

  // 2. WhatsApp Simulation (Real automation would use Meta API or Twilio)
  const whatsappMessage = `*¡Bienvenida a Elena Atelier, ${firstName}!* ✨ %0A%0AEstamos felices de tenerte con nosotros. Tu perfil y medidas ya están activos en nuestro sistema para brindarte una atención artesanal perfecta. 👗%0A%0ATe invitamos a conocer nuestra reputación o compartir tu experiencia en Google: %0Ahttps://g.page/r/Cfv2lRZLdYUuEBM/review %0A%0AAtelier Vitacura (Av. Tabancura 1091) ✨`;
  
  console.log('--- ENVIANDO WHATSAPP ---');
  console.log('Para:', customer.phone);
  console.log('Mensaje:', whatsappMessage);

  await supabase.from('notification_logs').insert({
    customer_id: customer.id,
    type: 'whatsapp',
    template: 'welcome_v1',
    status: 'sent'
  });

  return { success: true };
}
