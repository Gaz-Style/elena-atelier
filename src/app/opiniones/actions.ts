'use server';

import { createClient } from '@/lib/supabase/server';

export async function submitPrivateFeedbackAction(payload: {
    name: string;
    email: string;
    phone: string;
    rating: number;
    message: string;
}) {
    try {
        const supabase = await createClient();
        
        // Intenta insertar en la tabla de logs del sistema
        const { error } = await supabase.from('system_logs').insert([{
            service: 'Opiniones Cliente (Privado)',
            level: 'WARN',
            message: `Feedback negativo recibido (${payload.rating} estrellas) de ${payload.name}`,
            payload: {
                ...payload,
                submitted_at: new Date().toISOString()
            }
        }]);

        if (error) {
            console.error('Error saving feedback to system_logs:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        console.error('Excepción al guardar feedback privado:', err);
        return { success: false, error: err.message || String(err) };
    }
}
