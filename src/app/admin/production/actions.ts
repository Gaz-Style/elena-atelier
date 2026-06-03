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
      ),
      atelier_operators (
        name
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
  
  // 1. Verificar si tiene costurera asignada antes de cambiar de estado
  const { data: order, error: fetchError } = await supabase
    .from('production_orders')
    .select('assigned_operator_id, status')
    .eq('id', id)
    .single();

  if (fetchError) return { error: `No se encontrÃ³ la orden: ${fetchError.message}` };

  if (!order.assigned_operator_id && newStatus !== 'draft') {
    return { error: 'No se puede avanzar el estado de producciÃ³n sin asignar una costurera.' };
  }

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
  revalidatePath('/admin/production-board');
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

export async function getWorkloadForecastAction() {
    const supabase = await createClient();
    
    const { data: operators } = await supabase.from('atelier_operators').select('*').eq('status', 'active');
    const { data: config } = await supabase.from('atelier_config').select('*').single();
    const { data: activeOrders } = await supabase.from('production_orders').select('estimated_hours, deadline, production_start_date').in('status', ['draft', 'cutting', 'sewing', 'finishing']);
        
    const activeOpCount = operators ? operators.length : 0;
    const dailyCapacity = config ? config.labor_capacity_per_operator_daily : 8;
    const workingDays = 5;
    
    const weeklyCapacity = activeOpCount * dailyCapacity * workingDays;
    const monthlyCapacity = weeklyCapacity * 4;
    
    const now = new Date();
    const next7Days = new Date(now);
    next7Days.setDate(now.getDate() + 7);
    const next30Days = new Date(now);
    next30Days.setDate(now.getDate() + 30);
    
    let hoursNext7 = 0;
    let hoursNext30 = 0;
    
    if (activeOrders) {
        activeOrders.forEach(o => {
            const targetDateStr = o.production_start_date || o.deadline;
            if (targetDateStr) {
                const d = new Date(targetDateStr);
                if (d <= next7Days && d >= now) {
                    hoursNext7 += Number(o.estimated_hours || 0);
                }
                if (d <= next30Days && d >= now) {
                    hoursNext30 += Number(o.estimated_hours || 0);
                }
            } else {
                hoursNext7 += Number(o.estimated_hours || 0);
                hoursNext30 += Number(o.estimated_hours || 0);
            }
        });
    }
    
    let status = 'optimal';
    let recommendation = '';
    let requiredHeadcount = activeOpCount;
    
    if (weeklyCapacity > 0) {
        if (hoursNext7 > (weeklyCapacity * 0.9)) {
            status = 'deficit';
            requiredHeadcount = Math.ceil(hoursNext7 / (dailyCapacity * workingDays));
            recommendation = `Déficit crítico. Para cubrir ${hoursNext7} hrs en 7 días, se sugieren ${requiredHeadcount} operarias (tienes ${activeOpCount}).`;
        } else if (hoursNext7 < (weeklyCapacity * 0.4) && activeOpCount > 1) {
            status = 'surplus';
            requiredHeadcount = Math.max(1, Math.ceil(hoursNext7 / (dailyCapacity * workingDays)));
            recommendation = `Capacidad ociosa. Carga de ${hoursNext7} hrs en 7 días. Podrías reducir a ${requiredHeadcount} operaria(s).`;
        } else {
            status = 'optimal';
            recommendation = `Fuerza laboral balanceada. Carga: ${hoursNext7} hrs / Capacidad: ${weeklyCapacity} hrs.`;
        }
    }
    
    return {
        status,
        recommendation,
        metrics: {
            activeOpCount,
            dailyCapacity,
            weeklyCapacity,
            monthlyCapacity,
            hoursNext7,
            hoursNext30,
            requiredHeadcount
        }
    };
}
