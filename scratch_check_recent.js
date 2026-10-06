const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkRecent() {
    const { data, error } = await supabase
        .from('agendamientos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    console.log('--- ULTIMOS 10 AGENDAMIENTOS DE LA BASE DE DATOS ---');
    console.log(data);
}

checkRecent();
