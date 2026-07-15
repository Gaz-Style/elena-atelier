const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    const { data, error } = await supabase
        .from('agendamientos')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Columns:", data && data.length > 0 ? Object.keys(data[0]) : "No data, fetching generic type...");
        if (data.length === 0) {
            // We can insert a dummy row and rollback, or just try to describe it
            // Unfortunately REST API doesn't give schema directly easily if empty.
            console.log("Table is empty.");
        } else {
            console.log("Sample Data:", data[0]);
        }
    }
}
checkSchema();
