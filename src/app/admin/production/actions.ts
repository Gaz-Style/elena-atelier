'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProductionOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('production_orders')
    .select(`
      *,
      customers (
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching production orders:', error);
    return [];
  }
  return data;
}

export async function updateOrderStatus(id: string, newStatus: string) {
  const supabase = await createClient();
  
  // Update the status
  const { error: updateError } = await supabase
    .from('production_orders')
    .update({ status: newStatus })
    .eq('id', id);

  if (updateError) return { error: updateError.message };

  // Log the status change (for history/WhatsApp triggers)
  const { error: logError } = await supabase
    .from('order_status_logs')
    .insert([{
      order_id: id,
      new_status: newStatus
    }]);

  revalidatePath('/admin/production');
  return { success: true };
}

export async function createProductionOrder(formData: FormData) {
    const customer_id = formData.get('customer_id') as string;
    const description = formData.get('description') as string;
    const order_type = formData.get('order_type') as string;
    const deadline = formData.get('deadline') as string;
    const notes = formData.get('notes') as string;

    const supabase = await createClient();
    const { error } = await supabase
        .from('production_orders')
        .insert([{
            customer_id,
            description,
            order_type,
            status: 'draft',
            deadline: deadline || null,
            notes
        }]);

    if (error) return { error: error.message };

    revalidatePath('/admin/production');
    return { success: true };
}
