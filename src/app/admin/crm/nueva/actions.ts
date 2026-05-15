'use server';

import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export async function createCustomerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const fullName = formData.get('full_name') as string;
  const phone = formData.get('phone') as string;
  const stylePreference = formData.get('style_preference') as string;
  const typicalOccasion = formData.get('typical_occasion') as string;

  const shoulderWidth = formData.get('shoulder_width') ? parseFloat(formData.get('shoulder_width') as string) : null;
  const chestCircumference = formData.get('chest_circumference') ? parseFloat(formData.get('chest_circumference') as string) : null;
  const waistCircumference = formData.get('waist_circumference') ? parseFloat(formData.get('waist_circumference') as string) : null;
  const hipCircumference = formData.get('hip_circumference') ? parseFloat(formData.get('hip_circumference') as string) : null;
  const sleeveLength = formData.get('sleeve_length') ? parseFloat(formData.get('sleeve_length') as string) : null;
  const notes = formData.get('notes') as string;

  // Insert Customer
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
      email,
      full_name: fullName,
      phone,
      style_preference: stylePreference,
      typical_occasion: typicalOccasion
    })
    .select('id')
    .single();

  if (customerError) {
    if (customerError.code === '23505') {
      return { error: 'El correo electrónico ya está registrado.' };
    }
    return { error: 'Error al conectar con Supabase: ' + customerError.message };
  }

  // Insert Measurements
  if (shoulderWidth || chestCircumference || waistCircumference || hipCircumference || sleeveLength || notes) {
    const { error: measurementError } = await supabase
      .from('body_measurements')
      .insert({
        customer_id: customer.id,
        shoulder_width: shoulderWidth,
        chest_circumference: chestCircumference,
        waist_circumference: waistCircumference,
        hip_circumference: hipCircumference,
        sleeve_length: sleeveLength,
        notes: notes
      });
      
    if (measurementError) {
      return { error: 'Clienta creada, pero falló el registro de medidas.' };
    }
  }

  redirect('/admin/crm');
}
