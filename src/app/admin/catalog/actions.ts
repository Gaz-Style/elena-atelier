'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCatalog() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('catalog')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function addCatalogItem(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = Number(formData.get('price'));
  const category = formData.get('category') as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from('catalog')
    .insert([{ name, description, price, category }]);

  if (error) return { error: error.message };

  revalidatePath('/admin/catalog');
  revalidatePath('/admin/pos');
  return { success: true };
}

export async function deleteCatalogItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('catalog')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/catalog');
  revalidatePath('/admin/pos');
  return { success: true };
}
