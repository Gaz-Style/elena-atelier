'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCatalog() {
    const supabase = await createClient();
    const { data } = await supabase.from('catalog').select('*').order('category', { ascending: true });
    return data || [];
}

export async function getCostStructure() {
    const supabase = await createClient();
    const { data } = await supabase.from('company_settings').select('value').eq('key', 'cost_structure').maybeSingle();
    return data?.value || { labor_hourly_rate: 25000, default_margin_percentage: 15 };
}

export async function addCatalogItem(formData: FormData) {
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const price = Number(formData.get('price'));
    const description = formData.get('description') as string;
    const production_time_minutes = Number(formData.get('production_time_minutes') || 0);
    const material_cost = Number(formData.get('material_cost') || 0);
    const suggested_price = Number(formData.get('suggested_price') || 0);

    const supabase = await createClient();
    const { error } = await supabase.from('catalog').insert([{ 
        name, 
        category, 
        price, 
        description,
        production_time_minutes,
        material_cost,
        suggested_price,
        active: true 
    }]);

    if (error) return { error: error.message };
    revalidatePath('/admin/catalog');
    return { success: true };
}

export async function updateCatalogItem(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const price = Number(formData.get('price'));
    const description = formData.get('description') as string;
    const production_time_minutes = Number(formData.get('production_time_minutes') || 0);
    const material_cost = Number(formData.get('material_cost') || 0);
    const suggested_price = Number(formData.get('suggested_price') || 0);

    const supabase = await createClient();
    const { error } = await supabase.from('catalog').update({ 
        name, 
        category, 
        price, 
        description,
        production_time_minutes,
        material_cost,
        suggested_price
    }).eq('id', id);

    if (error) return { error: error.message };
    revalidatePath('/admin/catalog');
    return { success: true };
}

export async function deleteCatalogItem(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('catalog').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/admin/catalog');
    return { success: true };
}
