import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

async function test() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabaseAdmin.from('configuracion_horarios').upsert({
        dia_semana: 1,
        activo: true,
        hora_inicio: '10:00:00',
        hora_fin: '18:00:00'
    }, { onConflict: 'dia_semana' });

    console.log("Upsert Data:", data);
    console.log("Upsert Error:", error);

    const { data: selectData, error: selectError } = await supabaseAdmin.from('configuracion_horarios').select('*');
    console.log("Select Data:", selectData);
    console.log("Select Error:", selectError);
}

test();
