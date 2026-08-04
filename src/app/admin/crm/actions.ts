'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendWelcomeNotifications } from '@/lib/notifications';

/** Normalize any Chilean phone input to the canonical format: +56 9 XXXX XXXX */
function normalizePhone(raw: string | null): string | null {
    if (!raw || raw.trim() === '') return null;
    let digits = raw.replace(/\D/g, '');
    // Remove country code if present
    if (digits.startsWith('56')) digits = digits.slice(2);
    // Remove leading 9 (mobile prefix) to get the 8 local digits
    if (digits.startsWith('9') && digits.length === 9) digits = digits.slice(1);
    // If we don't have exactly 8 digits, return cleaned original
    if (digits.length !== 8) return raw.trim();
    return `+56 9 ${digits.slice(0, 4)} ${digits.slice(4)}`;
}

export async function getCustomers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  return data;
}

export async function createCustomer(formData: FormData) {
  const full_name = formData.get('full_name') as string;
  const email = formData.get('email') as string;
  const phone = normalizePhone(formData.get('phone') as string);
  const birthday = formData.get('birthday') as string;
  const style_preference = formData.get('style_preference') as string;
  const typical_occasion = formData.get('typical_occasion') as string;
  const marketing_opt_in = formData.get('marketing_opt_in') === 'on';

  const { createClient: createAdminClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin
    .from('customers')
    .insert([{
      full_name,
      email,
      phone,
      birthday: birthday || null,
      style_preference,
      typical_occasion,
      marketing_opt_in
    }])
    .select()
    .single();

  if (error) return { error: error.message };

  // Trigger Notifications
  await sendWelcomeNotifications(data);

  revalidatePath('/admin/crm');
  return { success: true, data };
}

export async function updateCustomer(id: string, formData: FormData) {
  const full_name = formData.get('full_name') as string;
  const email = formData.get('email') as string;
  const phone = normalizePhone(formData.get('phone') as string);
  const rut = formData.get('rut') as string;
  const birthday = formData.get('birthday') as string;
  const style_preference = formData.get('style_preference') as string;
  const typical_occasion = formData.get('typical_occasion') as string;
  const measurements = formData.get('measurements') as string;
  const marketing_opt_in = formData.get('marketing_opt_in') === 'on';

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .update({
      full_name,
      email,
      phone,
      rut: rut || null,
      birthday: birthday || null,
      style_preference,
      typical_occasion,
      measurements: measurements || null,
      marketing_opt_in
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin/crm');
  revalidatePath(`/admin/crm/${id}`);
  return { success: true, data };
}

export async function searchCustomersAction(query: string) {
    if (!query || query.length < 2) return { success: true, customers: [] };
    
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('full_name', { ascending: true })
        .limit(10);
        
    if (error) {
        console.error('Error searching customers:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, customers: data };
}

export async function getNotificationLogsAction(customerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notification_logs')
    .select('*')
    .eq('customer_id', customerId)
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('Error fetching notification logs:', error);
    return [];
  }
  return data;
}

export async function sendTemplatedEmailAction(
  customerId: string | null,
  templateId: string,
  subject: string,
  variables: Record<string, string>,
  rawEmail?: string
) {
  const supabase = await createClient();
  
  let targetEmail = rawEmail || '';
  let targetName = 'Clienta';

  if (customerId) {
    // 1. Fetch customer details
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('email, full_name')
      .eq('id', customerId)
      .single();

    if (customerError || !customer || !customer.email) {
      return { success: false, error: 'Cliente no encontrado o no tiene correo electrónico' };
    }
    targetEmail = customer.email;
    targetName = customer.full_name;
  }

  if (!targetEmail) {
    return { success: false, error: 'Dirección de correo electrónico de destino no especificada' };
  }

  // 2. Import email senders dynamically to keep imports light
  const emailModule = await import('@/lib/email');
  
  let sendResult: { success: boolean; error?: any; messageId?: string } = { success: false };

  try {
    switch (templateId) {
      case 'welcome':
        sendResult = await emailModule.sendWelcomeEmail(targetEmail, targetName);
        break;
      case 'appointment':
        sendResult = await emailModule.sendAppointmentConfirmation(
          targetEmail,
          targetName,
          variables.DATE || '',
          variables.TIME || '',
          variables.SERVICE || ''
        );
        break;
      case 'budget':
        sendResult = await emailModule.sendBudgetReminder(
          targetEmail,
          targetName,
          variables.LINK || ''
        );
        break;
      case 'payment':
        sendResult = await emailModule.sendPaymentReceivedEmail(
          targetEmail,
          targetName,
          variables.AMOUNT || '',
          variables.METHOD || '',
          variables.SERVICE || ''
        );
        break;
      case 'order_ready':
        sendResult = await emailModule.sendOrderReadyEmail(
          targetEmail,
          targetName,
          variables.ITEM || '',
          variables.HOURS || 'Lunes a Viernes de 10:00 a 19:00 hrs'
        );
        break;
      case 'custom':
        sendResult = await emailModule.sendGeneralContactEmail(
          targetEmail,
          targetName,
          subject,
          variables.MESSAGE || ''
        );
        break;
      case 'luxury_pass':
        sendResult = await emailModule.sendLuxuryPassEmail(
          targetEmail,
          targetName,
          subject,
          variables.TITLE || 'LUXURY PASS',
          variables.SUBTITLE || 'LUXURY PASS & RESERVA',
          variables.FIELD1_LABEL || 'Fecha de Visita',
          variables.FIELD1_VALUE || '',
          variables.FIELD2_LABEL || 'Horario Exclusivo',
          variables.FIELD2_VALUE || '',
          variables.DETAILS || '',
          variables.BARCODE_TEXT || 'ELENA*VIP*PASS'
        );
        break;
      default:
        // Try compiling a raw template if custom html is generated client-side
        if (variables.HTML_CONTENT) {
          sendResult = await emailModule.sendRawCustomEmail(targetEmail, subject, variables.HTML_CONTENT);
        } else {
          return { success: false, error: 'Plantilla desconocida' };
        }
    }

    // 3. Log notification in database
    await supabase.from('notification_logs').insert({
      customer_id: customerId || null,
      type: 'email',
      template: templateId,
      status: sendResult.success ? 'sent' : 'failed'
    });

     if (sendResult.success) {
      // Log sent email in CRM threads
      await supabase.from('crm_email_threads').insert({
        customer_id: customerId || null,
        subject: subject,
        direction: 'outbound',
        sender: 'contacto@elenalacosturera.cl',
        recipient: targetEmail,
        body_html: variables.MESSAGE || variables.HTML_CONTENT || 'Mensaje de plantilla enviado',
        message_id: sendResult.messageId
      });

      if (customerId) {
        revalidatePath(`/admin/crm/${customerId}`);
        revalidatePath(`/admin/crm/${customerId}/correo`);
      }
      revalidatePath('/admin/crm/correo-central');
      return { success: true };
    } else {
      return { success: false, error: sendResult.error?.message || 'Error al enviar por SMTP' };
    }
  } catch (error: any) {
    console.error('Error in sendTemplatedEmailAction:', error);
    
    // Log failure
    await supabase.from('notification_logs').insert({
      customer_id: customerId,
      type: 'email',
      template: templateId,
      status: 'failed'
    });

    return { success: false, error: error.message || 'Error interno del servidor' };
  }
}

/**
 * Fetch conversational threads for a specific customer.
 */
export async function getEmailThreadsAction(customerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('crm_email_threads')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: true });
  return { success: !error, threads: data || [], error };
}

/**
 * Get all marketing campaigns logged in the system.
 */
export async function getMarketingCampaignsAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  return { success: !error, campaigns: data || [], error };
}

/**
 * Triggers a bulk email campaign.
 */
export async function sendBulkCampaignAction(
  campaignName: string,
  subject: string,
  htmlContent: string,
  segment?: string,
  recipientEmails?: string[]
) {
  const supabase = await createClient();

  let emails: string[] = [];

  if (recipientEmails && recipientEmails.length > 0) {
    emails = recipientEmails;
  } else {
    // Fetch recipients
    let query = supabase.from('customers').select('email, full_name').neq('email', null);
    
    if (segment && segment !== 'all') {
      // Optional filter if segment column exists, otherwise send to all
    }

    const { data: customers, error: customersError } = await query;
    if (customersError || !customers || customers.length === 0) {
      return { success: false, error: 'No se encontraron clientes para este segmento' };
    }

    emails = customers.map(c => c.email!).filter(Boolean);
  }

  // Send bulk email
  const emailModule = await import('@/lib/email');
  const results = await emailModule.sendBulkEmail(emails, subject, htmlContent);

  const sentCount = results.filter(r => r.success).length;

  // Log campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('marketing_campaigns')
    .insert({
      name: campaignName,
      subject,
      content_html: htmlContent,
      recipient_count: emails.length,
      segment: segment || 'all',
      status: sentCount > 0 ? 'sent' : 'failed'
    })
    .select()
    .single();

  return { success: true, campaign, sentCount, total: emails.length };
}

/**
 * Sends a reply inside an email conversation thread.
 */
export async function replyToEmailThreadAction(
  customerId: string,
  subject: string,
  messageBody: string,
  lastMessageId?: string
) {
  const supabase = await createClient();

  // 1. Fetch customer details
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('email, full_name')
    .eq('id', customerId)
    .single();

  if (customerError || !customer || !customer.email) {
    return { success: false, error: 'Cliente no encontrado o no tiene correo electrónico' };
  }

  // 2. Setup reply headers
  const headers: Record<string, string> = {};
  if (lastMessageId) {
    headers['In-Reply-To'] = lastMessageId;
    headers['References'] = lastMessageId;
  }

  // 3. Send email via SMTP
  const emailModule = await import('@/lib/email');
  const sendResult = await emailModule.sendGeneralContactEmail(
    customer.email,
    customer.full_name,
    subject,
    messageBody,
    headers
  );

  if (sendResult.success) {
    // 4. Save thread record
    const { data: threadRecord } = await supabase
      .from('crm_email_threads')
      .insert({
        customer_id: customerId,
        subject,
        direction: 'outbound',
        sender: 'contacto@elenalacosturera.cl',
        recipient: customer.email,
        body_text: messageBody,
        message_id: sendResult.messageId,
        references_id: lastMessageId || null
      })
      .select()
      .single();

    revalidatePath(`/admin/crm/${customerId}`);
    revalidatePath(`/admin/crm/correo-central`);

    return { success: true, thread: threadRecord };
  }

  return { success: false, error: (sendResult.error as any)?.message || 'Error al enviar respuesta' };
}

/**
 * Mark all inbound threads for a customer as read.
 */
export async function markThreadsAsReadAction(customerId: string | null, senderEmail?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('crm_email_threads')
    .update({ read_at: new Date().toISOString() })
    .eq('direction', 'inbound')
    .is('read_at', null);

  if (customerId) {
    query = query.eq('customer_id', customerId);
  } else if (senderEmail) {
    query = query.eq('sender', senderEmail);
  } else {
    return { success: false, error: 'Must provide customerId or senderEmail' };
  }

  await query;
  revalidatePath('/admin/crm/correo-central');
  return { success: true };
}

/**
 * Get unread inbound email count per customer (for inbox badges).
 * Returns: { [customerId]: unreadCount }
 */
export async function getUnreadCountsPerCustomer(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('crm_email_threads')
    .select('customer_id')
    .eq('direction', 'inbound')
    .is('read_at', null)
    .not('customer_id', 'is', null);

  const counts: Record<string, number> = {};
  (data || []).forEach((row: { customer_id: string | null }) => {
    if (row.customer_id) {
      counts[row.customer_id] = (counts[row.customer_id] || 0) + 1;
    }
  });
  return counts;
}
