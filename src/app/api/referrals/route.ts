import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Endpoint para registrar que una nueva clienta viene recomendada por una VIP
export async function POST(request: Request) {
    try {
        const payload = await request.json();
        
        // referrer_id = ID de la clienta VIP que recomendó
        // new_customer_email = Email de la nueva clienta
        const { referrer_id, new_customer_email, new_customer_name } = payload;

        if (!referrer_id || !new_customer_email) {
            return NextResponse.json({ error: "Faltan datos de referido (referrer_id, new_customer_email)." }, { status: 400 });
        }

        console.log(`[VIRAL LOOP] Procesando recomendación. Referente: ${referrer_id} | Nueva Clienta: ${new_customer_email}`);

        // 1. Verificar que el referente exista
        const { data: referrer, error: referrerError } = await supabase
            .from('customers')
            .select('id, full_name, email')
            .eq('id', referrer_id)
            .single();

        if (referrerError || !referrer) {
            return NextResponse.json({ error: "Clienta referente no encontrada." }, { status: 404 });
        }

        // 2. Aquí insertaríamos a la nueva clienta en la DB con un tag de "Referida por X"
        // Simulando la creación en CRM
        const { data: newCustomer, error: insertError } = await supabase
            .from('customers')
            .insert({
                full_name: new_customer_name || 'Amiga de ' + referrer.full_name,
                email: new_customer_email,
                notes: `[COFRE ATELIER] Referida por: ${referrer.full_name}`
            })
            .select()
            .single();

        if (insertError) {
            console.error("Error al crear cliente referido:", insertError);
            // Ignoramos el error si ya existía para efectos de demo
        }

        // 3. (Simulado) Disparar el "Bucle Viral" - Enviar correo de regalo a ambas
        console.log(`[VIRAL LOOP] Éxito. Generando regalo de 'Servicio Ecológico' para ${referrer.full_name} y ${new_customer_name}`);

        return NextResponse.json({
            success: true,
            message: "Programa 'Cofre Atelier' activado. Beneficios registrados.",
            data: {
                referrer: referrer.full_name,
                referred: newCustomer?.full_name || new_customer_name,
                reward_issued: "Servicio de Limpieza/Ajuste Ecológico de Cortesía"
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
