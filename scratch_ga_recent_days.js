require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { createClient } = require('@supabase/supabase-js');

const propertyId = process.env.GA4_PROPERTY_ID || '489116804';

let analyticsDataClient;
if (fs.existsSync('./ga_key.json')) {
  analyticsDataClient = new BetaAnalyticsDataClient({ keyFilename: './ga_key.json' });
} else {
  analyticsDataClient = new BetaAnalyticsDataClient();
}

async function analyzeRecentDays() {
  console.log('====================================================');
  console.log('  ANÁLISIS EXHAUSTIVO DE LOS ÚLTIMOS DÍAS (7 DÍAS)');
  console.log('====================================================\n');

  const dimensionFilter = {
    notExpression: {
      filter: {
        fieldName: 'pagePath',
        stringFilter: {
          matchType: 'BEGINS_WITH',
          value: '/admin'
        }
      }
    }
  };

  // 1. GA4 LAST 7 DAYS OVERVIEW (PUBLIC TRAFFIC)
  const [summaryReport] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' }
    ],
    dimensionFilter
  });

  if (summaryReport.rows && summaryReport.rows[0]) {
    const row = summaryReport.rows[0];
    const avgSec = parseFloat(row.metricValues[3].value);
    console.log('📊 MÉTRICAS GENERALES PÚBLICAS (Últimos 7 Días):');
    console.log(`  👥 Usuarios Activos Clientes: ${row.metricValues[0].value}`);
    console.log(`  🔄 Sesiones Públicas Totales: ${row.metricValues[1].value}`);
    console.log(`  📄 Vistas de Página Públicas: ${row.metricValues[2].value}`);
    console.log(`  ⏱️ Duración Promedio por Sesión: ${avgSec.toFixed(1)} seg (${(avgSec/60).toFixed(1)} min)`);
    console.log(`  📉 Tasa de Rebote Público: ${(parseFloat(row.metricValues[4].value) * 100).toFixed(1)}%\n`);
  }

  // 2. DAY BY DAY BREAKDOWN (LAST 7 DAYS)
  const [dailyReport] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' }
    ],
    dimensionFilter,
    orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
  });

  console.log('📅 DESGLOSE DÍA A DÍA (Últimos 7 Días):');
  if (dailyReport.rows) {
    dailyReport.rows.forEach(r => {
      const d = r.dimensionValues[0].value;
      const formattedDate = `${d.substring(0,4)}-${d.substring(4,6)}-${d.substring(6,8)}`;
      const users = r.metricValues[0].value;
      const sessions = r.metricValues[1].value;
      const views = r.metricValues[2].value;
      console.log(`  • ${formattedDate}: ${users} usuarios | ${sessions} sesiones | ${views} vistas`);
    });
  }

  // 3. TOP PÁGINAS VISITADAS EN LOS ÚLTIMOS 7 DÍAS
  const [pagesReport] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'activeUsers' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' }
    ],
    dimensionFilter,
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 15
  });

  console.log('\n🔝 TOP 15 PÁGINAS MÁS VISITADAS (Últimos 7 Días):');
  if (pagesReport.rows) {
    pagesReport.rows.forEach((row, i) => {
      const path = row.dimensionValues[0].value;
      const title = row.dimensionValues[1].value;
      const views = row.metricValues[0].value;
      const users = row.metricValues[1].value;
      const avgDuration = parseFloat(row.metricValues[2].value);
      const bounce = (parseFloat(row.metricValues[3].value) * 100).toFixed(1);
      console.log(`  ${i+1}. ${path}`);
      console.log(`     Vistas: ${views} | Usuarios: ${users} | Duración: ${avgDuration.toFixed(1)}s | Rebote: ${bounce}%`);
    });
  }

  // 4. DISPOSITIVOS ÚLTIMOS 7 DÍAS
  const [deviceReport] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' }
    ],
    dimensionFilter
  });

  console.log('\n📱 DISPOSITIVOS DE CLIENTES (Últimos 7 Días):');
  if (deviceReport.rows) {
    let tot = 0;
    deviceReport.rows.forEach(r => tot += parseInt(r.metricValues[0].value, 10));
    deviceReport.rows.forEach(row => {
      const dev = row.dimensionValues[0].value;
      const u = parseInt(row.metricValues[0].value, 10);
      const s = row.metricValues[1].value;
      const pct = tot > 0 ? ((u / tot) * 100).toFixed(1) : '0';
      console.log(`  • ${dev}: ${u} usuarios (${pct}%), ${s} sesiones`);
    });
  }

  // 5. EVENTOS CLAVE DE CONVERSIÓN ÚLTIMOS 7 DÍAS
  const [eventsReport] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'eventName' }],
    metrics: [
      { name: 'eventCount' },
      { name: 'activeUsers' }
    ],
    dimensionFilter,
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 15
  });

  console.log('\n🎯 EVENTOS CLAVE Y CONVERSIONES (Últimos 7 Días):');
  if (eventsReport.rows) {
    eventsReport.rows.forEach(row => {
      const evt = row.dimensionValues[0].value;
      const count = row.metricValues[0].value;
      const users = row.metricValues[1].value;
      console.log(`  • Evento "${evt}": ${count} ejecuciones por ${users} usuarios`);
    });
  }

  // 6. VENTAS Y PEDIDOS RECIENTES SUPABASE (ÚLTIMOS DÍAS)
  console.log('\n💰 REVISIÓN ERP / SUPABASE (Ventas Recientes):');
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: recentSales, error } = await supabase
        .from('sales')
        .select('id, created_at, total_amount, status, payment_method, customer_name')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.log('  Notice Supabase Sales Query:', error.message);
      } else if (recentSales && recentSales.length > 0) {
        console.log(`  Se encontraron ${recentSales.length} registros recientes en ventas:`);
        recentSales.forEach(s => {
          console.log(`   - ID ${s.id} | ${s.created_at} | $${s.total_amount} | ${s.status} | Cliente: ${s.customer_name || 'N/A'}`);
        });
      } else {
        console.log('  Sin registros de ventas en la tabla `sales` en los últimos días.');
      }
    }
  } catch (errDb) {
    console.log('  Error consultando DB Supabase:', errDb.message);
  }
}

analyzeRecentDays();
