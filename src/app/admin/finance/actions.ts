'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCostSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('company_settings')
    .select('value')
    .eq('key', 'cost_structure')
    .single();

  if (error || !data) {
    return {
      labor_hourly_rate: 25000,
      operational_fixed_cost: 349000,
      default_margin_percentage: 15
    };
  }

  return data.value;
}

export async function saveCostSettings(formData: FormData) {
  const labor_hourly_rate = Number(formData.get('labor_hourly_rate'));
  const operational_fixed_cost = Number(formData.get('operational_fixed_cost'));
  const default_margin_percentage = Number(formData.get('default_margin_percentage'));

  const supabase = await createClient();
  
  const { error } = await supabase
    .from('company_settings')
    .upsert({
      key: 'cost_structure',
      value: {
        labor_hourly_rate,
        operational_fixed_cost,
        default_margin_percentage
      }
    }, { onConflict: 'key' });

  if (error) {
    return { error: 'Error al guardar la configuración' };
  }

  revalidatePath('/admin/finance');
  revalidatePath('/admin/pos');
  return { success: true };
}
