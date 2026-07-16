const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
    const { data } = await supabase.from('bridal_milestones')
        .select('id, title, agenda_event_id, scheduled_date, project_id')
        .eq('title', 'Prueba 2 — Estructura y Calce Base');
    
    for (const m of data) {
        const { data: proj } = await supabase.from('bridal_projects')
            .select('customers(full_name)')
            .eq('id', m.project_id)
            .single();
        if (proj && proj.customers && proj.customers.full_name.includes('Celeste')) {
            console.log(m);
            const { data: agenda } = await supabase.from('agendamientos').select('*').eq('id', m.agenda_event_id).single();
            console.log("Agenda Event:", agenda);
        }
    }
}
check();
