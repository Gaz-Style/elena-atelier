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
        .gte('created_at', firstDayOfMonth)
        .not('internal_id', 'like', '%_balance_%');
        
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

export async function getDetailedDashboardData() {
    const supabase = await createClient();

    // 1. Cash Register Status
    const { data: activeRegister, error: registerError } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('status', 'open')
        .order('opened_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    let cashRegisterStatus = {
        id: activeRegister?.id || null,
        isOpen: !!activeRegister,
        openedAt: activeRegister?.opened_at || null,
        openedBy: activeRegister?.opened_by || null,
        openingAmount: activeRegister?.opening_amount || 0,
        expectedCash: 0,
        salesCount: 0
    };

    if (activeRegister) {
        // Fetch sales since opening
        const { data: sales } = await supabase
            .from('sales_ledger')
            .select('id, internal_id, total_amount, paid_amount, payment_method')
            .gte('created_at', activeRegister.opened_at)
            .eq('status', 'completed');

        // Fetch movements
        const { data: movements } = await supabase
            .from('cash_movements')
            .select('amount, type')
            .eq('register_id', activeRegister.id);

        let expectedCash = Number(activeRegister.opening_amount);
        if (sales && sales.length > 0) {
            const salesGrouped = new Map<string, typeof sales>();
            sales.forEach(sale => {
                const baseId = sale.internal_id?.split('_balance_')[0] || sale.id;
                if (!salesGrouped.has(baseId)) salesGrouped.set(baseId, []);
                salesGrouped.get(baseId)!.push(sale);
            });

            salesGrouped.forEach((groupSales) => {
                const originalSale = groupSales.find(s => !s.internal_id?.includes('_balance_'));
                if (originalSale) {
                    const method = originalSale.payment_method?.toLowerCase() || '';
                    if (method.includes('efectivo') || method.includes('transferencia')) {
                        expectedCash += Number(originalSale.paid_amount || originalSale.total_amount);
                    } else if (method.includes('mixto')) {
                        const cashMatch = method.match(/efectivo:\s*\$(\d+)/i);
                        if (cashMatch) expectedCash += Number(cashMatch[1]);
                    }
                } else {
                    groupSales.forEach(balanceSale => {
                        const method = balanceSale.payment_method?.toLowerCase() || '';
                        if (method.includes('efectivo') || method.includes('transferencia')) {
                            expectedCash += Number(balanceSale.paid_amount || balanceSale.total_amount);
                        } else if (method.includes('mixto')) {
                            const cashMatch = method.match(/efectivo:\s*\$(\d+)/i);
                            if (cashMatch) expectedCash += Number(cashMatch[1]);
                        }
                    });
                }
            });
        }
        if (movements) {
            movements.forEach(m => {
                if (m.type === 'in') expectedCash += Number(m.amount);
                else if (m.type === 'out') expectedCash -= Number(m.amount);
            });
        }
        cashRegisterStatus.expectedCash = expectedCash;
        cashRegisterStatus.salesCount = sales?.length || 0;
    }

    // 2. CRM Stats
    const { count: totalChats } = await supabase
        .from('crm_whatsapp_chats')
        .select('*', { count: 'exact', head: true });

    const { count: pendingHandoffs } = await supabase
        .from('crm_whatsapp_chats')
        .select('*', { count: 'exact', head: true })
        .eq('session_status', 'human_handoff');

    const { data: chatsWithScore } = await supabase
        .from('crm_whatsapp_chats')
        .select('lead_score')
        .not('lead_score', 'is', null);

    let avgLeadScore = 0;
    if (chatsWithScore && chatsWithScore.length > 0) {
        const sum = chatsWithScore.reduce((acc, c) => acc + Number(c.lead_score || 0), 0);
        avgLeadScore = Math.round(sum / chatsWithScore.length);
    }

    // 3. AI Agent Tasks Stats
    const { data: tasks } = await supabase
        .from('ai_agent_tasks')
        .select('status, prompt_tokens, completion_tokens, agent_role')
        .order('created_at', { ascending: false });

    let aiStats = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        totalTokens: 0,
        activeAgents: new Set<string>()
    };

    if (tasks) {
        tasks.forEach(t => {
            if (t.status === 'pending') aiStats.pending++;
            else if (t.status === 'processing') aiStats.processing++;
            else if (t.status === 'completed') aiStats.completed++;
            else if (t.status === 'failed') aiStats.failed++;

            aiStats.totalTokens += (t.prompt_tokens || 0) + (t.completion_tokens || 0);
            if (t.agent_role) aiStats.activeAgents.add(t.agent_role);
        });
    }

    // 4. Recent notifications
    const { data: recentNotifications } = await supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    return {
        cashRegister: cashRegisterStatus,
        crm: {
            totalChats: totalChats || 0,
            pendingHandoffs: pendingHandoffs || 0,
            avgLeadScore
        },
        ai: {
            pending: aiStats.pending,
            processing: aiStats.processing,
            completed: aiStats.completed,
            failed: aiStats.failed,
            totalTokens: aiStats.totalTokens,
            activeAgentsCount: aiStats.activeAgents.size
        },
        notifications: recentNotifications || []
    };
}
