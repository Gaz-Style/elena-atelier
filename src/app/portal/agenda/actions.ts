'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

import { enviar_correo_confirmacion } from '@/lib/agenda';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret';

function verifyEmail(token: string) {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [b64Email, signature] = parts;
    const email = Buffer.from(b64Email, 'base64').toString('utf8');
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(email);
    if (hmac.digest('hex') === signature) return email;
    return null;
}

export async function bookCatalogConsultationAction(payload: {
    dateStr: string;
    timeStr: string;
}) {
    try {
        const { dateStr, timeStr } = payload;
        const supabaseEvent = getAdminClient();
        
        const cookieStore = await cookies();
        const token = cookieStore.get('agenda_access')?.value;
        if (!token) {
            return { success: false, error: 'No tienes una sesión temporal válida. Por favor regístrate nuevamente.' };
        }

        const email = verifyEmail(token);
        if (!email) {
            return { success: false, error: 'El acceso ha expirado o es inválido. Por favor regístrate nuevamente.' };
        }

        // Get customer data
        const { data: customer } = await supabaseEvent
            .from('customers')
            .select('full_name, phone, email')
            .eq('email', email)
            .single();

        if (!customer) {
            return { success: false, error: 'No se encontró el perfil de cliente.' };
        }

        const fechaHoraIso = `${dateStr}T${timeStr.padStart(5, '0')}:00-04:00`;

        const nombre = customer.full_name ? customer.full_name.split(' ')[0] : 'Cliente';
        const apellido = customer.full_name ? customer.full_name.split(' ').slice(1).join(' ') : '';

        // Insert appointment
        const { error: eventError } = await supabaseEvent.from('agendamientos').insert({
            nombre: nombre,
            apellido: apellido,
            celular: customer.phone || '',
            correo: customer.email || '',
            fecha_hora: fechaHoraIso,
            estado: 'confirmado',
            tipo_evento: 'cita_cliente',
            origen: 'web_catalogo',
            notas: 'Reserva generada desde el catálogo (Confección a medida)'
        });

        if (eventError) throw eventError;

        // Send confirmation email reusing existing logic
        try {
            await enviar_correo_confirmacion(nombre, apellido, customer.phone || '', customer.email || '', fechaHoraIso);
        } catch (emailError) {
            console.error('Error enviando correo de confirmacion:', emailError);
            // Non-fatal error, appointment is saved
        }

        return { success: true };
    } catch (err: any) {
        console.error('Error in catalog booking:', err);
        return { success: false, error: err.message || 'Error al agendar cita' };
    }
}
