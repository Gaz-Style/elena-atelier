require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkTasks() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: tasks, error } = await supabase
    .from('ai_agent_tasks')
    .select('id, status, error_log, created_at, payload')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) console.error(error);
  else console.log(JSON.stringify(tasks, null, 2));
}
checkTasks();
