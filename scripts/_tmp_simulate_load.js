const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function simulateLoad() {
    console.log("Simulating load for July 15, 2026...");
    
    // 1. Get Elena Rojas ID
    const { data: ops } = await supabase.from('atelier_operators').select('*').eq('name', 'Elena Rojas').limit(1);
    if (!ops || ops.length === 0) return console.log("Operator not found");
    const opId = ops[0].id;
    console.log("Elena Rojas ID:", opId);

    // 2. Get tasks for the week
    const startStr = "2026-07-13";
    const endStr = "2026-07-18";
    const { data: tasks } = await supabase
        .from('planner_tasks')
        .select('*')
        .gte('task_date', startStr)
        .lte('task_date', endStr)
        .eq('operator_id', opId);
        
    console.log(`Found ${tasks?.length || 0} tasks for Elena in that week.`);
    console.log(tasks);
}
simulateLoad();
