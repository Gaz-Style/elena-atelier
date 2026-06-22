require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOrders() {
  const { data, error } = await supabase.from('production_orders')
    .select('*')
    .gte('production_start_date', '2026-06-01T00:00:00Z');
  console.log('June orders:', data ? data.length : 0);
  if (data && data.length > 0) {
      console.log(JSON.stringify(data.slice(0, 3), null, 2));
  }
}

checkOrders();
