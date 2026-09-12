import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Pulso liviano a Supabase para prevenir suspensiones por inactividad
        const { data, error } = await supabase
            .from('agendamientos')
            .select('id')
            .limit(1);

        if (error) {
            console.error('Error enviando pulso a Supabase:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        console.log('[Cron Keep-Alive] Pulso a Supabase ejecutado con éxito');
        return NextResponse.json({ 
            success: true, 
            message: 'Pulso diario a Supabase completado con éxito',
            timestamp: new Date().toISOString()
        });

    } catch (err: any) {
        console.error('Error en keep-alive cron:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
