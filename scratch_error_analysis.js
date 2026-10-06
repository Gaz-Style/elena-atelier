require('dotenv').config({ path: '.env.local' });
// Next.js polyfills for running server actions in node
global.Request = class Request {};
global.Headers = class Headers {};

async function runStats() {
    try {
        // Just directly query the DB like getStatisticsData does, since importing next.js files might fail in raw node
        const { createClient } = require('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Active Orders
        const { count: activeOrdersCount } = await supabase
            .from('production_orders')
            .select('*', { count: 'exact', head: true })
            .in('status', ['draft', 'cutting', 'sewing', 'finishing']);
            
        // Sales this month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { data: sales } = await supabase
            .from('sales_ledger')
            .select('total_amount')
            .gte('created_at', firstDayOfMonth)
            .not('internal_id', 'like', '%_balance_%');
            
        const salesThisMonth = sales?.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0) || 0;
        
        console.log('--- RENDIMIENTO DEL NEGOCIO ---');
        console.log(`Órdenes Activas en Taller: ${activeOrdersCount}`);
        console.log(`Ventas este mes: $${salesThisMonth.toLocaleString('es-CL')}`);
        
    } catch (e) {
        console.log('Error:', e);
    }
}
runStats();
