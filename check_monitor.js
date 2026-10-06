require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await s.from('production_orders').select('status');
  if (error) { console.error('Error:', error.message); return; }
  const counts = {};
  (data || []).forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
  console.log('Status counts:', JSON.stringify(counts, null, 2));
  console.log('Total orders:', data?.length);
}
check();
