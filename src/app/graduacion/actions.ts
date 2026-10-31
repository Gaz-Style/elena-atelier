'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const getAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

export async function guardarProspectoGraduacionAction(data: {
    name: string;
    email?: string;
    phone?: string;
    serviceType?: string;
    school?: string;
    eventDate?: string;
    stylePreference?: string;
    details?: string;
    step?: number;
}) {
    try {
        const supabase = getAdminClient();
        const cookieStore = await cookies();
        const utmDataCookie = cookieStore.get('utm_data');
        let utms: any = {};
        if (utmDataCookie) {
            try {
                utms = JSON.parse(decodeURIComponent(utmDataCookie.value));
            } catch (e) {}
        }

        const cleanPhone = (data.phone || '').replace(/\D/g, '');
        const formattedPhone = cleanPhone ? (cleanPhone.startsWith('56') ? `+${cleanPhone}` : `+56 ${cleanPhone}`) : null;

        // 1. Upsert / Buscar o Crear en customers
        let customerId: string | null = null;
        if (formattedPhone || data.email) {
            let query = supabase.from('customers').select('id');
            if (formattedPhone) {
                query = query.ilike('phone', `%${cleanPhone.slice(-8)}%`);
            } else if (data.email) {
                query = query.eq('email', data.email.trim());
            }
            const { data: existingCust } = await query.maybeSingle();

            if (existingCust) {
                customerId = existingCust.id;
                await supabase.from('customers').update({
                    typical_occasion: 'Graduación',
                    style_preference: data.stylePreference || undefined,
                    utm_source: utms?.utm_source || undefined,
                    utm_medium: utms?.utm_medium || undefined,
                    utm_campaign: utms?.utm_campaign || undefined,
                }).eq('id', customerId);
            } else {
                const uniqueEmail = data.email && data.email.trim() 
                    ? data.email.trim() 
                    : `graduacion.${cleanPhone || Date.now()}@cliente.elenalacosturera.cl`;

                const { data: newCust } = await supabase.from('customers').insert([{
                    full_name: data.name.trim() || 'Prospecto Graduación',
                    email: uniqueEmail,
                    phone: formattedPhone,
                    typical_occasion: 'Graduación',
                    style_preference: data.stylePreference || null,
                    utm_source: utms?.utm_source || null,
                    utm_medium: utms?.utm_medium || null,
                    utm_campaign: utms?.utm_campaign || null,
                }]).select('id').single();

                if (newCust) customerId = newCust.id;
            }
        }

        // 2. Insertar en agendamientos como prospecto calificado
        const notas = [
            data.school ? `Colegio: ${data.school}` : null,
            data.eventDate ? `Fecha Gala: ${data.eventDate}` : null,
            data.serviceType ? `Servicio: ${data.serviceType}` : null,
            data.stylePreference ? `Estilo: ${data.stylePreference}` : null,
            data.details ? `Detalles: ${data.details}` : null,
            data.step ? `Paso alcanzado: ${data.step}` : null,
        ].filter(Boolean).join(' | ');

        await supabase.from('agendamientos').insert([{
            nombre: data.name.trim() || 'Prospecto Graduación',
            celular: formattedPhone || 'Sin teléfono',
            correo: data.email || '',
            tipo_evento: 'graduacion',
            estado: 'prospecto_graduacion',
            notas: notas,
            customer_id: customerId,
            origen: 'web_calificador_graduacion',
            utm_source: utms?.utm_source || null,
            utm_medium: utms?.utm_medium || null,
            utm_campaign: utms?.utm_campaign || null,
            utm_term: utms?.utm_term || null,
        }]);

        return { success: true };
    } catch (err: any) {
        console.error('Error al guardar prospecto graduación:', err);
        return { success: false, error: err.message };
    }
}

