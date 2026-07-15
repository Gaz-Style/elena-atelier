const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanDB() {
    const { data, error } = await supabase
        .from('planner_tasks')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes all rows
    
    if (error) {
        console.error("DB Error:", error.message);
    } else {
        console.log(`Cleaned up planner_tasks successfully.`);
    }
}
cleanDB();
