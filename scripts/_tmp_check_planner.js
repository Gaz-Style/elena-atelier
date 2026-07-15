const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDB() {
    const { data, error } = await supabase
        .from('planner_tasks')
        .select('*');
    
    if (error) {
        console.error("DB Error:", error.message);
    } else {
        console.log(`Found ${data.length} rows.`);
        console.log(data);
    }
}
testDB();
