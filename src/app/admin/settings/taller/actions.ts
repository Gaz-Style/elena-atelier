'use server';

import { createClient } from '@/lib/supabase/server';

export async function getOperatorsAccessAction() {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('atelier_operators')
        .select('id, name, status, pin')
        .order('name');
        
    if (error) {
        console.error('Error fetching operators access:', error);
        return [];
    }
    
    return data || [];
}

export async function updateOperatorPinAction(formData: FormData) {
    const id = formData.get('id') as string;
    const pin = formData.get('pin') as string;
    
    if (!pin || pin.length !== 4) {
        return { success: false, error: 'La clave debe ser de 4 dígitos exactos' };
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from('atelier_operators')
        .update({ pin })
        .eq('id', id);
        
    if (error) return { success: false, error: error.message };
    return { success: true };
}
