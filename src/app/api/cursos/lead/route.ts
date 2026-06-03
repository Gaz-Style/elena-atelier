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

        if (!full_name || !email) {
            return NextResponse.json({ error: 'Nombre y email son requeridos.' }, { status: 400 });
        }

        // Save lead to Supabase
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
