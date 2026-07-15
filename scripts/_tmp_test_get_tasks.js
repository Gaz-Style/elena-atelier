const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDB() {
    const startDate = "2026-07-13";
    const endDate = "2026-07-18";
    const { data, error } = await supabase
        .from('planner_tasks')
        .select('*')
        .gte('task_date', startDate)
        .lte('task_date', endDate);
    
    if (error) {
        console.error("DB Error:", error.message);
    } else {
        console.log(`Found ${data.length} tasks in range ${startDate} to ${endDate}.`);
    }
}
testDB();
