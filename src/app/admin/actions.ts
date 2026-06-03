'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDashboardData() {
    const supabase = await createClient();
    
    // 1. Get Sales for current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const { data: sales } = await supabase
        .from('sales_ledger')
        .select('total_amount')
        .gte('created_at', firstDayOfMonth);
        
    const salesThisMonth = sales?.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0) || 0;
    
    // 2. Active Orders
    const { count: activeOrdersCount } = await supabase
        .from('production_orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['draft', 'cutting', 'sewing', 'finishing']);
        
    // 3. Best selling products (Group by description in production_orders)
    // Supabase RPC is better, but doing it in memory since dataset is small
    const { data: allOrders } = await supabase
        .from('production_orders')
        .select('description')
        .not('description', 'is', null);
        
    const productCounts: Record<string, number> = {};
    if (allOrders) {
        allOrders.forEach(o => {
            if (o.description) {
                productCounts[o.description] = (productCounts[o.description] || 0) + 1;
            }
        });
    }
    
    const topProducts = Object.entries(productCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
        
    // 4. Best Margins (From Catalog)
    const { data: configData } = await supabase.from('company_settings').select('value').eq('key', 'cost_structure').maybeSingle();
    const laborHourlyRate = configData?.value?.labor_hourly_rate || 25000;
    
    const { data: catalogItems } = await supabase.from('catalog').select('*').eq('active', true);
    
    let bestMarginProducts: any[] = [];
    if (catalogItems) {
        bestMarginProducts = catalogItems.map(item => {
            const laborCost = (Number(item.production_time_minutes || 0) / 60) * laborHourlyRate;
            const materialCost = Number(item.material_cost || 0);
            const price = Number(item.suggested_price || item.price || 0);
            const totalCost = laborCost + materialCost;
            
            let marginPct = 0;
            if (price > 0) {
                marginPct = ((price - totalCost) / price) * 100;
            }
            
            return {
                name: item.name,
                marginPct: Math.round(marginPct),
                marginValue: price - totalCost
            };
        })
        .filter(item => item.marginPct > 0)
        .sort((a, b) => b.marginPct - a.marginPct)
        .slice(0, 5);
    }
    
    return {
        kpis: {
            salesThisMonth,
            activeOrdersCount: activeOrdersCount || 0,
            avgTicket: sales && sales.length > 0 ? Math.round(salesThisMonth / sales.length) : 0
        },
        topProducts,
        bestMarginProducts
    };
}
