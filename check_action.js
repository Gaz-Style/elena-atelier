const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const agendaEventId = '220d1db0-2923-403c-b672-2a120924d5d8';
    const milestoneTitle = 'Prueba 2 — Estructura y Calce Base';
    const newDateStr = '2026-08-15';
    let dateIso = new Date(`${newDateStr}T12:00:00-04:00`).toISOString();
    
    let attempts = 0;
    let success = false;
    let updateDateIso = dateIso;
    
    while (attempts < 8 && !success) {
        console.log("Attempt", attempts, "updating to", updateDateIso);
        const { error: updateError } = await supabase
            .from('agendamientos')
            .update({
                fecha_hora: updateDateIso,
                notas: `Prueba coordinada: ${milestoneTitle}`
            })
            .eq('id', agendaEventId);
            
        console.log("Update Error:", updateError);
        
        if (!updateError) {
            success = true;
        } else if (updateError.code === '23505') {
            const d = new Date(updateDateIso);
            d.setHours(d.getHours() + 1);
            updateDateIso = d.toISOString();
            attempts++;
        } else {
            console.error('Error updating agenda event:', updateError);
            break;
        }
    }
    console.log("Success?", success);
}
run();
