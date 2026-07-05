'use server';

import { createClient } from '@/lib/supabase/server';

export async function searchAgendaEventsAction(query: string) {
    if (!query || query.length < 2) return { success: true, events: [] };
    
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('agendamientos')
        .select('*')
        .neq('estado', 'cancelado')
        .or(`nombre.ilike.%${query}%,apellido.ilike.%${query}%,correo.ilike.%${query}%`)
        .order('fecha_hora', { ascending: true })
        .limit(10);
        
    if (error) {
        console.error('Error searching agenda:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, events: data };
}
