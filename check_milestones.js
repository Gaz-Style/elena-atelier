const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: orders } = await supabase
        .from('production_orders')
        .select('id, description, pos_order_id, customer_id')
        .not('status', 'in', '("delivered","cancelled")');
        
    if (orders && orders.length > 0) {
        const projectIds = orders.map(o => o.pos_order_id).filter(Boolean);
        console.log("PROJECT IDS:", projectIds);
        
        const { data: milestones, error } = await supabase
            .from('bridal_milestones')
            .select('id, project_id, title, scheduled_date, status, agenda_event_id')
            .in('project_id', projectIds);
            
        if (error) {
            console.error("QUERY ERROR:", error);
        } else {
            console.log("MILESTONES LENGTH:", milestones?.length);
            console.log("MILESTONES SAMPLES:", milestones?.slice(0, 5));
        }
    }
}
run();
