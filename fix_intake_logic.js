const fs = require('fs');
const path = require('path');

const actionsCode = `'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getIntakeData() {
  // We fetch sales from the last 6 months to build the trend
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: allSales } = await supabase.from('sales_ledger')
    .select('id, internal_id, created_at, total_amount, status')
    .gte('created_at', sixMonthsAgo.toISOString());

  // Filter out cancelled sales if needed. Usually we only want completed or pending.
  const sales = (allSales || []).filter(s => s.status !== 'cancelled' && s.status !== 'failed');

  // Let's also fetch production orders to match POS orders to "Arreglos"
  const { data: prodOrders } = await supabase.from('production_orders')
    .select('pos_order_id, description')
    .gte('created_at', sixMonthsAgo.toISOString());

  const prodDescMap = new Map();
  (prodOrders || []).forEach(po => {
    if (po.pos_order_id) {
      prodDescMap.set(po.pos_order_id, (po.description || '').toLowerCase());
    }
  });

  function categorizeSale(sale: any) {
    const internalId = sale.internal_id || '';
    if (internalId.startsWith('bridal_')) {
      return 'Alta Costura (Abonos)';
    }
    if (internalId.startsWith('order_')) {
      // Check if it has a production order that looks like an arreglo
      const desc = prodDescMap.get(internalId) || '';
      if (desc.includes('arreglo') || desc.includes('basta') || desc.includes('pinza') || desc.includes('compostura') || desc.includes('ajuste') || desc.includes('reparaci')) {
        return 'Arreglos y Ajustes';
      }
      return 'Punto de Venta (Boutique)';
    }
    return 'Otros';
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1)); // Lunes
  weekStart.setHours(0,0,0,0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // KPIs
  const kpis = {
    today: { count: 0, amount: 0 },
    thisWeek: { count: 0, amount: 0 },
    thisMonth: { count: 0, amount: 0 },
  };

  const categories = {
    'Alta Costura (Abonos)': { count: 0, amount: 0 },
    'Arreglos y Ajustes': { count: 0, amount: 0 },
    'Punto de Venta (Boutique)': { count: 0, amount: 0 },
    'Otros': { count: 0, amount: 0 }
  };

  // Trend mapping
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const trendsMap = new Map();
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = \`\${monthNames[d.getMonth()]} \${d.getFullYear().toString().substring(2)}\`;
    trendsMap.set(key, { count: 0, amount: 0, key });
  }

  sales.forEach((s: any) => {
    const d = new Date(s.created_at);
    const p = Number(s.total_amount || 0);
    const cat = categorizeSale(s);

    // Timeline filtering
    if (d >= todayStart) {
      kpis.today.count++;
      kpis.today.amount += p;
    }
    if (d >= weekStart) {
      kpis.thisWeek.count++;
      kpis.thisWeek.amount += p;
    }
    if (d >= monthStart) {
      kpis.thisMonth.count++;
      kpis.thisMonth.amount += p;

      // Populate current month categories
      if (categories[cat as keyof typeof categories]) {
        categories[cat as keyof typeof categories].count++;
        categories[cat as keyof typeof categories].amount += p;
      } else {
        categories['Otros'].count++;
        categories['Otros'].amount += p;
      }
    }

    // Trend
    const trendKey = \`\${monthNames[d.getMonth()]} \${d.getFullYear().toString().substring(2)}\`;
    if (trendsMap.has(trendKey)) {
      const t = trendsMap.get(trendKey);
      t.count++;
      t.amount += p;
    }
  });

  return {
    kpis,
    categories,
    trend: Array.from(trendsMap.values())
  };
}
`;

fs.writeFileSync(path.join(__dirname, 'src/app/admin/statistics/intake/actions.ts'), actionsCode);

console.log("Updated actions.ts");
