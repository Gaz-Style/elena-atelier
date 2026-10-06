require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await s.from('production_orders')
    .select(`
      id,
      description,
      status,
      estimated_hours,
      deadline,
      customer_id,
      pos_order_id,
      payment_status,
      paid_amount,
      total_amount,
      created_at,
      customers (
        full_name,
        phone
      )
    `)
    .in('status', ['draft', 'pending', 'scheduled', 'cutting', 'sewing', 'finishing', 'ready'])
    .order('deadline', { ascending: true, nullsFirst: false });
    
  if (error) {
    console.error('Query Error:', error);
  } else {
    console.log('Returned rows:', data?.length);
    if (data?.length > 0) {
      console.log('Sample:', data[0]);
    }
  }
}
check();
