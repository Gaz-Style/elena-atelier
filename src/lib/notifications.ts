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
    
    Te esperamos pronto en Av. Tabancura 1091.
    
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
  const whatsappMessage = `*¡Bienvenida a Elena Atelier, ${firstName}!* ✨ %0A%0AEstamos felices de tenerte con nosotros. Tu perfil ya está activo en nuestro sistema para tu próxima visita. %0A%0AAtelier Vitacura 👗`;
  
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
