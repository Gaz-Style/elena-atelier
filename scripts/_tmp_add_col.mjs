import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', {
    query: 'ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS bridal_project_id UUID REFERENCES bridal_projects(id);'
  });
  console.log('Result:', error || 'OK');
}
run();
