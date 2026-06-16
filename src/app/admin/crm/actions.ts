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

  const supabase = await createClient();
  const { data, error } = await supabase
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

