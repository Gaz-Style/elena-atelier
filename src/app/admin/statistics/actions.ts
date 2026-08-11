'use server';

import { createClient } from '@/lib/supabase/server';

export interface ReviewLog {
    id: string;
    created_at: string;
    service: string;
    level: string;
    message: string;
    payload: any;
}

export async function getStatisticsData() {
    const supabase = await createClient();

    // 1. Fetch system_logs representing reviews
    const { data: logs, error } = await supabase
        .from('system_logs')
        .select('id, created_at, service, level, message, payload')
        .or('service.eq.Opiniones Cliente (Privado),service.eq.Opiniones Cliente (Positivo + KPI)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching review logs:', error);
    }

    const reviewLogs: ReviewLog[] = logs || [];

    // Initialize metrics
    let totalReviews = reviewLogs.length;
    let sumRating = 0;
    let starsCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    // Positive KPIs (4-5 stars)
    let positiveKpis = {
        quality: 0,
        service: 0,
        professionalism: 0
    };
    
    // Negative KPIs (1-3 stars)
    let negativeKpis = {
        fit: 0,
        deliveryTime: 0,
        service: 0,
        price: 0
    };

    const parsedReviews = reviewLogs.map(log => {
        const payload = log.payload || {};
        const rating = Number(payload.rating || 0);

        if (rating >= 1 && rating <= 5) {
            starsCount[rating as 1 | 2 | 3 | 4 | 5]++;
            sumRating += rating;
        }

        // Positive KPIs
        if (payload.kpiQuality) positiveKpis.quality++;
        if (payload.kpiService) positiveKpis.service++;
        if (payload.kpiProfessionalism) positiveKpis.professionalism++;

        // Negative KPIs (can also inspect raw message if flags are not set, but we will count flags first)
        // From opiniones page: "Aspectos a mejorar: Calce o ajuste de la prenda, Tiempos de entrega..."
        const msg = String(payload.message || '').toLowerCase();
        if (msg.includes('calce') || msg.includes('ajuste')) negativeKpis.fit++;
        if (msg.includes('tiempos') || msg.includes('plazos') || msg.includes('entrega')) negativeKpis.deliveryTime++;
        if (msg.includes('atención') || msg.includes('atencion') || msg.includes('comunicación') || msg.includes('comunicacion')) negativeKpis.service++;
        if (msg.includes('precio') || msg.includes('presupuesto') || msg.includes('claridad')) negativeKpis.price++;

        return {
            id: log.id,
            date: log.created_at,
            type: log.service.includes('Privado') ? 'crítico' : 'positivo',
            level: log.level,
            rating,
            name: payload.name || (log.service.includes('Privado') ? 'Anónimo' : 'Clienta de Elena'),
            email: payload.email || '',
            message: payload.message || '',
            rawPayload: payload
        };
    });

    const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;
    const positivePercentage = totalReviews > 0 
        ? Math.round(((starsCount[4] + starsCount[5]) / totalReviews) * 100) 
        : 0;

    // 2. Core Business metrics for contextual reference
    // Monthly Sales
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const { data: sales } = await supabase
        .from('sales_ledger')
        .select('total_amount')
        .gte('created_at', firstDayOfMonth)
        .not('internal_id', 'like', '%_balance_%');
        
    const salesThisMonth = sales?.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0) || 0;

    // Active Orders
    const { count: activeOrdersCount } = await supabase
        .from('production_orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['draft', 'cutting', 'sewing', 'finishing']);

    // Total CRM Chats
    const { count: totalChats } = await supabase
        .from('crm_whatsapp_chats')
        .select('*', { count: 'exact', head: true });

    // Financial KPIs from getSalesMetrics and calculateSuggestedRate
    let financialKpis = {
        totalGrossSales: 0,
        netSales: 0,
        ivaDebito: 0,
        ivaCredito: 0,
        f29: 0,
        suggestedRate: 0,
        totalFixedCosts: 0,
        masterRate: 0
    };

    try {
        const { getSalesMetrics, calculateSuggestedRate, getCostSettings } = await import('@/app/admin/finance/actions');
        const metrics = await getSalesMetrics(currentMonth, currentYear);
        const rates = await calculateSuggestedRate(160); // Assuming standard 160 hours
        const settings = await getCostSettings();

        financialKpis = {
            totalGrossSales: metrics.totalGrossSales || 0,
            netSales: metrics.netSales || 0,
            ivaDebito: metrics.ivaDebito || 0,
            ivaCredito: metrics.ivaCredito || 0,
            f29: metrics.f29 || 0,
            suggestedRate: rates.suggestedRate || 0,
            totalFixedCosts: rates.totalFixed || 0,
            masterRate: settings.labor_hourly_rate || 0
        };
    } catch (e) {
        console.error('Error fetching financial statistics KPIs:', e);
    }

    return {
        reviews: {
            total: totalReviews,
            average: averageRating,
            positivePct: positivePercentage,
            starsCount,
            positiveKpis,
            negativeKpis,
            list: parsedReviews
        },
        generalKpis: {
            salesThisMonth,
            activeOrdersCount: activeOrdersCount || 0,
            totalChats: totalChats || 0,
            avgTicket: sales && sales.length > 0 ? Math.round(salesThisMonth / sales.length) : 0,
            ...financialKpis
        }
    };
}
