const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fix() {
    console.log('Fetching milestones without agenda_event_id...');
    const { data: milestones, error } = await supabase
        .from('bridal_milestones')
        .select('*, bridal_projects(customers(full_name, email, phone))')
        .is('agenda_event_id', null);

    if (error) {
        console.error('Error fetching milestones:', error);
        return;
    }

    console.log(`Found ${milestones.length} milestones to fix.`);

    for (const m of milestones) {
        if (!m.bridal_projects || !m.bridal_projects.customers) continue;

        const cust = m.bridal_projects.customers;
        const nameParts = (cust.full_name || 'Novia').trim().split(/\s+/);
        const nombre = nameParts[0] || 'Novia';
        const apellido = nameParts.slice(1).join(' ') || '';

        console.log(`Creating agenda event for ${nombre} ${apellido} - ${m.title}`);

        let attempts = 0;
        let success = false;
        let updateDateIso = m.scheduled_date;

        while (attempts < 8 && !success) {
            const { data: newEvent, error: insertError } = await supabase
                .from('agendamientos')
                .insert([{
                    nombre,
                    apellido,
                    celular: cust.phone || '',
                    correo: cust.email || '',
                    fecha_hora: updateDateIso,
                    origen: 'admin',
                    tipo_evento: 'cita_cliente',
                    estado: 'confirmado',
                    notas: `Prueba coordinada: ${m.title}`
                }])
                .select()
                .maybeSingle();

            if (!insertError && newEvent) {
                const { error: updateError } = await supabase
                    .from('bridal_milestones')
                    .update({ agenda_event_id: newEvent.id, scheduled_date: updateDateIso })
                    .eq('id', m.id);

                if (updateError) {
                    console.error('Error updating milestone:', updateError);
                } else {
                    console.log(`Updated milestone ${m.id} with event ${newEvent.id} at ${updateDateIso}`);
                }
                success = true;
            } else if (insertError?.code === '23505') {
                const d = new Date(updateDateIso);
                d.setHours(d.getHours() + 1);
                updateDateIso = d.toISOString();
                attempts++;
            } else {
                console.error('Error inserting agenda event:', insertError);
                break;
            }
        }
    }
    console.log('Done!');
}

fix();
