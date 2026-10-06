require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const propertyId = process.env.GA4_PROPERTY_ID || '489116804';

let analyticsDataClient;
if (fs.existsSync('./ga_key.json')) {
  analyticsDataClient = new BetaAnalyticsDataClient({ keyFilename: './ga_key.json' });
} else {
  analyticsDataClient = new BetaAnalyticsDataClient();
}

async function analyzePublicTrafficOnly() {
  console.log('==============================================');
  console.log('  ANÁLISIS GA4 EXCLUSIVO TRÁFICO PÚBLICO (SIN /admin)');
  console.log('==============================================\n');

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

  // 1. PUBLIC PAGES OVERVIEW
  const [pagesReport] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'activeUsers' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' }
    ],
    dimensionFilter,
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 50
  });

  let totalPublicViews = 0;
  let pageList = [];

  if (pagesReport.rows) {
    pagesReport.rows.forEach((row) => {
      const path = row.dimensionValues[0].value;
      const title = row.dimensionValues[1].value;
      const views = parseInt(row.metricValues[0].value, 10);
      const users = parseInt(row.metricValues[1].value, 10);
      const avgDuration = parseFloat(row.metricValues[2].value);
      const bounce = parseFloat(row.metricValues[3].value) * 100;

      totalPublicViews += views;
      pageList.push({ path, title, views, users, avgDuration, bounce });
    });
  }

  console.log(`📄 Total Vistas en Páginas Públicas: ${totalPublicViews}\n`);
  console.log('--- TOP PÁGINAS PÚBLICAS CLIENTES ---');
  pageList.slice(0, 15).forEach((p, i) => {
    console.log(`${i+1}. ${p.path} ("${p.title}")`);
    console.log(`   Vistas: ${p.views} | Usuarios: ${p.users} | Duración Prom: ${p.avgDuration.toFixed(1)}s (${(p.avgDuration/60).toFixed(1)}m) | Rebote: ${p.bounce.toFixed(1)}%`);
  });

  // 2. PUBLIC TRAFFIC METRICS SUMMARY
  const [summaryReport] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
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
    console.log('\n📊 RESUMEN GENERAL PÚBLICO CLIENTES (Excluyendo /admin):');
    console.log(`  Usuarios Activos Reales: ${row.metricValues[0].value}`);
    console.log(`  Sesiones Totales Públicas: ${row.metricValues[1].value}`);
    console.log(`  Vistas de Página Públicas: ${row.metricValues[2].value}`);
    console.log(`  Duración Promedio Sesión Cliente: ${avgSec.toFixed(1)} seg (${(avgSec/60).toFixed(1)} min)`);
    console.log(`  Tasa de Rebote Promedio Público: ${(parseFloat(row.metricValues[4].value) * 100).toFixed(1)}%`);
  }

  // 3. PUBLIC DEVICES
  const [deviceReport] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' }
    ],
    dimensionFilter
  });

  console.log('\n📱 DISPOSITIVOS TRÁFICO PÚBLICO (CLIENTES):');
  if (deviceReport.rows) {
    let totalUsers = 0;
    deviceReport.rows.forEach(r => totalUsers += parseInt(r.metricValues[0].value, 10));
    deviceReport.rows.forEach(row => {
      const dev = row.dimensionValues[0].value;
      const u = parseInt(row.metricValues[0].value, 10);
      const s = row.metricValues[1].value;
      const v = row.metricValues[2].value;
      const pct = ((u / totalUsers) * 100).toFixed(1);
      console.log(`  • ${dev}: ${u} usuarios (${pct}%), ${s} sesiones, ${v} vistas`);
    });
  }
}

analyzePublicTrafficOnly();
