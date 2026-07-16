const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
    for (let h = 12; h < 20; h++) {
        const iso = new Date(`2026-08-15T${h}:00:00-04:00`).toISOString();
        const { error: updateError } = await supabase
            .from('agendamientos')
            .update({ fecha_hora: iso })
            .eq('id', '220d1db0-2923-403c-b672-2a120924d5d8');
        
        console.log(`Hour ${h}:`, updateError ? updateError.code : 'Success');
    }
}
check();
