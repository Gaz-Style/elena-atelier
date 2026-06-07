import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensures this runs dynamically

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: Request) {
    // This endpoint should ideally be protected by a cron secret, but we'll leave it open for easy testing with external cron jobs
    try {
        // Encontrar eventos que ocurran exactamente en 1 hora (margen de 5 minutos si el cron corre cada 15 min)
        const now = new Date();
        const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
        
        // Damos un rango de 10 minutos para atrapar la cita
        const minTime = new Date(inOneHour.getTime() - 5 * 60 * 1000).toISOString();
        const maxTime = new Date(inOneHour.getTime() + 5 * 60 * 1000).toISOString();

        const { data: citas, error } = await supabase
            .from('agendamientos')
            .select('*')
            .eq('tipo_evento', 'cita_cliente')
            .eq('estado', 'confirmado')
            .gte('fecha_hora', minTime)
            .lte('fecha_hora', maxTime);

        if (error) throw error;

        let remindersSent = 0;

        for (const cita of citas) {
            const token = process.env.WHATSAPP_API_TOKEN;
            const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

            if (token && phoneId && cita.celular) {
                // Formatting phone number (strip + and spaces if needed)
                let phoneNumber = cita.celular.replace(/\D/g, '');
                
                const message = `¡Hola ${cita.nombre}! Elena La Costurera te recuerda que tu cita en el taller es en exactamente 1 hora. ¡Nos vemos pronto!`;

                const fbResponse = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: phoneNumber,
                        type: 'text',
                        text: { body: message }
                    })
                });

                if (fbResponse.ok) {
                    remindersSent++;
                    // Opcional: Marcar como "recordatorio_enviado" en la DB si agregas esa columna
                } else {
                    const errorData = await fbResponse.json();
                    console.error('Error enviando recordatorio a', cita.celular, errorData);
                }
            }
        }

        return NextResponse.json({ success: true, reminders_sent: remindersSent });

    } catch (err: any) {
        console.error('Error cron reminders:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
