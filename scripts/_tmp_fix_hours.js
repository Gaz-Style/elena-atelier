const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDB() {
    const { data, error } = await supabase
        .from('planner_tasks')
        .update({ start_hour: 10 })
        .eq('start_hour', 9);
    
    if (error) {
        console.error("DB Error:", error.message);
    } else {
        console.log(`Updated successfully.`);
    }
}
fixDB();
