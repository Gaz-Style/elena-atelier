'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);



export async function getIntakeData() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sixMonthsAgoStr = sixMonthsAgo.toISOString();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1)); 
  weekStart.setHours(0,0,0,0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Fetch Alta Costura Projects (Ventas)
  const { data: bridalProjects } = await supabase.from('bridal_projects')
    .select('created_at, total_amount, id')
    .gte('created_at', sixMonthsAgoStr);

  // 2. Fetch Sales Ledger (Ingresos y Ventas POS)
  const { data: allSales } = await supabase.from('sales_ledger')
    .select('internal_id, created_at, total_amount, paid_amount, status')
    .gte('created_at', sixMonthsAgoStr);
  const sales = (allSales || []).filter(s => s.status !== 'cancelled' && s.status !== 'failed');

  // 3. Fetch Production Orders (Para clasificar POS)
  const { data: prodOrders } = await supabase.from('production_orders')
    .select('pos_order_id, order_type, description, notes')
    .gte('created_at', sixMonthsAgoStr);
  
  const posCategoryMap = new Map();
  (prodOrders || []).forEach(po => {
    if (po.pos_order_id) {
      let type = po.order_type;
      if (type === 'bespoke') {
        const textToSearch = `${po.description || ''} ${po.notes || ''}`.toLowerCase();
        const isArreglo = ['ajuste', 'basta', 'arreglo', 'cierre', 'reducir', 'achicar', 'agrandar', 'reparacion', 'reparar'].some(w => textToSearch.includes(w));
        if (isArreglo) {
          type = 'b2b_batch'; // Forzar a Arreglos Especializados
        }
      }
      posCategoryMap.set(po.pos_order_id, type);
    }
  });

  // Estructuras de datos
  const kpis = {
    today: { sales: 0, revenue: 0, count: 0 },
    thisWeek: { sales: 0, revenue: 0, count: 0 },
    thisMonth: { sales: 0, revenue: 0, count: 0 },
  };

  const categories = {
    'Alta Costura': { count: 0, sales: 0, revenue: 0 },
    'Confección a Medida': { count: 0, sales: 0, revenue: 0 },
    'Arreglos Especializados': { count: 0, sales: 0, revenue: 0 },
    'Punto de Venta (Boutique)': { count: 0, sales: 0, revenue: 0 }
  };

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const trendsMap = new Map();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
    trendsMap.set(key, { key, sales: 0, revenue: 0 });
  }

  // A. Procesar Ventas de Alta Costura
  (bridalProjects || []).forEach(bp => {
    const d = new Date(bp.created_at);
    const amt = Number(bp.total_amount || 0);

    if (d >= todayStart) { kpis.today.sales += amt; kpis.today.count++; }
    if (d >= weekStart) { kpis.thisWeek.sales += amt; kpis.thisWeek.count++; }
    if (d >= monthStart) { 
      kpis.thisMonth.sales += amt; kpis.thisMonth.count++;
      categories['Alta Costura'].sales += amt;
      categories['Alta Costura'].count++;
    }

    const trendKey = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
    if (trendsMap.has(trendKey)) {
      trendsMap.get(trendKey).sales += amt;
    }
  });

  // B. Procesar Ingresos y Ventas POS
  sales.forEach((s: any) => {
    const d = new Date(s.created_at);
    const internalId = s.internal_id || '';
    const isBridal = internalId.startsWith('bridal_');
    const isBalance = internalId.includes('_balance_');
    
    // El ingreso siempre es paid_amount, si es 0 y total > 0 (ej abono), asumimos total_amount en pagos directos
    const revenueAmt = (s.paid_amount && Number(s.paid_amount) > 0) ? Number(s.paid_amount) : Number(s.total_amount || 0);
    
    // Si es un sub-registro de pago (balance), NO suma a la venta total (ya se sumó en la orden original)
    const salesAmt = isBalance ? 0 : Number(s.total_amount || 0);

    let catName = '';
    if (isBridal) {
      catName = 'Alta Costura';
    } else {
      // Intentamos recuperar la categoría original (pos_order_id no tiene el _balance_)
      const baseOrderId = internalId.split('_balance_')[0];
      const orderType = posCategoryMap.get(baseOrderId);
      
      if (orderType === 'bespoke') catName = 'Confección a Medida';
      else if (orderType === 'b2b_batch') catName = 'Arreglos Especializados';
      else catName = 'Punto de Venta (Boutique)';
    }

    // Sumar Ingresos Globales
    if (d >= todayStart) { kpis.today.revenue += revenueAmt; }
    if (d >= weekStart) { kpis.thisWeek.revenue += revenueAmt; }
    if (d >= monthStart) { 
      kpis.thisMonth.revenue += revenueAmt; 
      
      // Para Alta Costura, ya contamos la "Venta" en el bloque anterior (bridalProjects)
      // Aqui sumamos el Ingreso (Abono). No sumamos la Venta para no duplicar.
      if (isBridal) {
        categories['Alta Costura'].revenue += revenueAmt;
      } else {
        categories[catName as keyof typeof categories].sales += salesAmt;
        categories[catName as keyof typeof categories].revenue += revenueAmt;
        categories[catName as keyof typeof categories].count++;
        
        // Sumar Ventas Globales de POS
        kpis.thisMonth.sales += salesAmt;
        kpis.thisMonth.count++;
        if (d >= todayStart) { kpis.today.sales += salesAmt; kpis.today.count++; }
        if (d >= weekStart) { kpis.thisWeek.sales += salesAmt; kpis.thisWeek.count++; }
      }
    }

    // Trend de Ingresos y Ventas (POS)
    const trendKey = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
    if (trendsMap.has(trendKey)) {
      trendsMap.get(trendKey).revenue += revenueAmt;
      if (!isBridal) {
        trendsMap.get(trendKey).sales += salesAmt;
      }
    }
  });

  return {
    kpis,
    categories,
    trend: Array.from(trendsMap.values())
  };
}

// touch