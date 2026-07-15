const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAgenda() {
    const { data, error } = await supabase
        .from('agendamientos')
        .select('*')
        .limit(5);
    
    if (error) {
        console.error("DB Error:", error.message);
    } else {
        console.log(data);
    }
}
checkAgenda();
