'use server';

import { createClient } from '@/lib/supabase/server';

export async function searchAgendaEventsAction(query: string) {
    if (!query || query.length < 2) return { success: true, events: [] };
    
    const supabase = await createClient();
    
    const { data: agData, error: agErr } = await supabase
        .from('agendamientos')
        .select('*')
        .neq('estado', 'cancelado')
        .or(`nombre.ilike.%${query}%,apellido.ilike.%${query}%,correo.ilike.%${query}%`)
        .order('fecha_hora', { ascending: true })
        .limit(10);
        
    const { data: custData } = await supabase
        .from('customers')
        .select('id, full_name, email, phone')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);
        
    let mEvents: any[] = [];
    if (custData && custData.length > 0) {
        const custIds = custData.map(c => c.id);
        const { data: projData } = await supabase
            .from('bridal_projects')
            .select('id, customer_id')
            .in('customer_id', custIds);
            
        if (projData && projData.length > 0) {
            const projIds = projData.map(p => p.id);
            const { data: mData } = await supabase
                .from('bridal_milestones')
                .select('*')
                .in('project_id', projIds)
                .neq('status', 'completed')
                .not('scheduled_date', 'is', null);
                
            if (mData) {
                mEvents = mData.map((m: any) => {
                    const p = projData.find(pr => pr.id === m.project_id);
                    const c = custData.find(cu => cu.id === p?.customer_id);
                    return {
                        id: `milestone-${m.id}`,
                        fecha_hora: m.scheduled_date,
                        nombre: c?.full_name?.split(' ')[0] || 'Clienta',
                        apellido: c?.full_name?.split(' ').slice(1).join(' ') || '',
                        correo: c?.email,
                        celular: c?.phone,
                        tipo_evento: 'cita_cliente',
                        estado: 'confirmado',
                        notas: `Prueba Alta Costura: ${m.title}`
                    };
                });
            }
        }
    }
    
    if (agErr) {
        console.error('Error searching agenda:', agErr);
        return { success: false, error: agErr.message };
    }
    
    const combined = [...(agData || []), ...mEvents].sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()).slice(0, 10);
    
    return { success: true, events: combined };
}
