const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: configs, error } = await supabase.from('configuracion_horarios').select('*');
    console.log('--- CONFIGURACION HORARIOS ---');
    console.log(configs);

    const { data: agendamientos } = await supabase.from('agendamientos').select('*').order('created_at', { ascending: false }).limit(5);
    console.log('--- ULTIMOS AGENDAMIENTOS ---');
    console.log(agendamientos);
}

check();
