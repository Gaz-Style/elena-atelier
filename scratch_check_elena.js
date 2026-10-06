const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkBooking() {
    const { data, error } = await supabase
        .from('agendamientos')
        .select('*')
        .or('correo.ilike.%nenitadesign%,apellido.ilike.%Rojas%')
        .order('created_at', { ascending: false });

    console.log('--- BUSQUEDA DE AGENDAMIENTO ELENA ROJAS ---');
    console.log(data);
}

checkBooking();
