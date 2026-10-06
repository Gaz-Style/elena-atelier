require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanDB() {
  // Update Jesu Perez de Arce's specific orders
  const { data: jesuOrders } = await s.from('production_orders')
    .select('id, customers!inner(full_name)')
    .ilike('customers.full_name', '%Jesu Perez%')
    .eq('status', 'pending');

  if (jesuOrders && jesuOrders.length > 0) {
    const ids = jesuOrders.map(o => o.id);
    const { error } = await s.from('production_orders')
      .update({ status: 'delivered' })
      .in('id', ids);
    if (!error) console.log(`Cleaned ${ids.length} orders for Jesu Perez De Arce`);
  }

  // Also clean any other 'pending' or 'draft' orders from August or earlier (older than Sept 1)
  const { data: oldOrders } = await s.from('production_orders')
    .select('id')
    .in('status', ['pending', 'draft', 'cutting', 'sewing', 'finishing'])
    .lt('deadline', '2026-09-01T00:00:00+00:00');

  if (oldOrders && oldOrders.length > 0) {
    const oldIds = oldOrders.map(o => o.id);
    const { error: err2 } = await s.from('production_orders')
      .update({ status: 'delivered' })
      .in('id', oldIds);
    if (!err2) console.log(`Cleaned ${oldIds.length} old stuck orders from August or earlier.`);
  }
}

cleanDB();
