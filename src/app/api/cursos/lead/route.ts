import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for API routes that don't have user sessions
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { full_name, email, phone, course_id, course_name, current_level, message } = body;

        if (!full_name || !email || !phone) {
            return NextResponse.json({ error: 'Nombre, email y teléfono son requeridos.' }, { status: 400 });
        }

        // 1. Store globally in system: Upsert into 'customers' table
        let customerId = null;
        try {
            // Check if customer exists by email
            const { data: existingCustomer } = await supabase
                .from('customers')
                .select('id')
                .eq('email', email)
                .maybeSingle();

            if (existingCustomer) {
                customerId = existingCustomer.id;
                // Update their name/phone if they left new ones
                await supabase
                    .from('customers')
                    .update({ full_name, phone, updated_at: new Date().toISOString() })
                    .eq('id', customerId);
            } else {
                // Create customer globally
                const { data: newCustomer, error: insertError } = await supabase
                    .from('customers')
                    .insert([{
                        email,
                        full_name,
                        phone,
                        style_preference: `Interesada en curso: ${course_name}`,
                        notes: `Origen: Embudo de cursos. Nivel: ${current_level}. Mensaje inicial: ${message || 'Ninguno'}`
                    }])
                    .select('id')
                    .single();

                if (!insertError && newCustomer) {
                    customerId = newCustomer.id;
                }
            }
        } catch (crmErr) {
            console.error('Error syncing with global customers table:', crmErr);
            // Non-blocking for the lead submission itself
        }

        // 2. Save lead details to Supabase course_leads table
        const { data, error } = await supabase
            .from('course_leads')
            .insert([{
                full_name,
                email,
                phone,
                course_id,
                course_name,
                current_level,
                message,
                status: 'new',
                source: 'cursos_page'
            }])
            .select('id')
            .single();

        if (error) {
            console.error('Error saving lead:', error);
            return NextResponse.json({ error: 'No se pudo guardar tu información. Por favor intenta de nuevo.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, leadId: data.id });
    } catch (err) {
        console.error('Lead API error:', err);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
