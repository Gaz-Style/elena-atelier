import { createClient } from '@/lib/supabase/server';

/**
 * Números de teléfono autorizados para recibir alertas operativas y administrativas:
 * - Derivación humana de IA (Handoff)
 * - Agendamientos de citas
 * - Pagos POS / Caja y Webpay
 * - Pagos de Novias / Alta Costura
 * - Pagos Mercado Pago
 * - Correos entrantes
 */
export const ADMIN_NOTIFICATION_PHONES: string[] = ['56984021940', '56937667709'];

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

/**
 * Registra una notificación saliente del sistema en la bandeja de LiveChat (/admin/livechat)
 * para que sea visible en la conversación del teléfono receptor (administrador o cliente),
 * actualizando el timestamp para colocar el chat al tope de la lista.
 */
export async function registrarNotificacionEnLiveChat(
  celular: string,
  titulo: string,
  cuerpo: string
) {
  try {
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const cleanDigits = (n: string) => (n ? n.replace(/\D/g, '') : '');
    const phoneDigits = cleanDigits(celular);
    if (!phoneDigits) return;

    const formattedPhone = phoneDigits.startsWith('56') ? phoneDigits : `56${phoneDigits}`;
    const msgTime = new Date().toISOString();
    const textoCompleto = `🔔 *${titulo}*\n\n${cuerpo}`;

    // 1. Buscar o crear el chat en crm_whatsapp_chats
    let { data: chat } = await adminClient
      .from('crm_whatsapp_chats')
      .select('id, customer_id')
      .eq('phone_number', formattedPhone)
      .single();

    let chatId = chat?.id;

    if (!chatId) {
      const { data: customers } = await adminClient
        .from('customers')
        .select('id, phone')
        .not('phone', 'is', null);

      let matchedCustomerId = null;
      if (customers) {
        const match = customers.find(c => {
          const custDigits = cleanDigits(c.phone);
          return custDigits && custDigits.slice(-9) === phoneDigits.slice(-9);
        });
        if (match) matchedCustomerId = match.id;
      }

      const { data: newChat, error: newChatErr } = await adminClient
        .from('crm_whatsapp_chats')
        .insert([{
          phone_number: formattedPhone,
          session_status: 'bot',
          customer_id: matchedCustomerId,
          last_interaction: msgTime
        }])
        .select('id')
        .single();

      if (newChatErr) {
        console.error('Error al crear chat en LiveChat:', newChatErr);
        return;
      }
      chatId = newChat.id;
    } else {
      await adminClient
        .from('crm_whatsapp_chats')
        .update({ last_interaction: msgTime })
        .eq('id', chatId);
    }

    // 2. Insertar el mensaje con sender_type 'bot' (autorizado por el check constraint de Postgres)
    await adminClient
      .from('crm_whatsapp_messages')
      .insert([{
        chat_id: chatId,
        sender_type: 'bot',
        message_type: 'text',
        content: textoCompleto,
        created_at: msgTime
      }]);

    console.log(`[LiveChat Alert] Notificación registrada para ${formattedPhone}: ${titulo}`);
  } catch (err) {
    console.error('Error en registrarNotificacionEnLiveChat:', err);
  }
}
