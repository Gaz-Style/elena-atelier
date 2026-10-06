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

async function analyzeFiestaGraduacionFunnel() {
  console.log('===============================================================');
  console.log('  ANÁLISIS FUNNEL FIESTA & GRADUACIÓN: VISTAS -> DETALLE -> BOTÓN ELENA');
  console.log('===============================================================\n');

  // Filter out admin
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

  // 1. PAGE VIEWS ON FIESTA / GRADUACIÓN / PORTAFOLIO PAGES (90 DAYS)
  const [pagesReport] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'activeUsers' },
      { name: 'sessions' }
    ],
    dimensionFilter,
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }]
  });

  console.log('📄 1. NAVEGACIÓN EN PÁGINAS DE FIESTA / GRADUACIÓN / PORTAFOLIO:');
  let fiestaPages = [];
  if (pagesReport.rows) {
    pagesReport.rows.forEach(r => {
      const p = r.dimensionValues[0].value;
      if (p.includes('graduacion') || p.includes('fiesta') || p.includes('portafolio') || p.includes('presupuesto')) {
        const views = parseInt(r.metricValues[0].value, 10);
        const users = parseInt(r.metricValues[1].value, 10);
        const sessions = parseInt(r.metricValues[2].value, 10);
        fiestaPages.push({ path: p, views, users, sessions });
        console.log(`  • ${p} -> ${users} usuarios únicos, ${sessions} sesiones, ${views} vistas`);
      }
    });
  }

  // 2. DETALLE DE EVENTOS ESPECÍFICOS EN EL CATALOGO (view_item y generate_lead / click_whatsapp)
  console.log('\n🔍 2. INTERACCIÓN CON EL MODAL "VER DETALLES" Y BOTÓN "DISEÑAR CON ELENA":');

  const [eventsReport] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'eventName' }],
    metrics: [
      { name: 'eventCount' },
      { name: 'activeUsers' }
    ],
    dimensionFilter
  });

  if (eventsReport.rows) {
    eventsReport.rows.forEach(r => {
      const evt = r.dimensionValues[0].value;
      const count = r.metricValues[0].value;
      const users = r.metricValues[1].value;
      if (['view_item', 'generate_lead', 'click_whatsapp', 'form_start', 'Contact'].includes(evt)) {
        console.log(`  • Evento "${evt}": ${count} clics totales por ${users} usuarios únicos`);
      }
    });
  }

  // 3. EVENTOS DÍA A DÍA ÚLTIMOS 30 DÍAS
  console.log('\n📅 3. DESGLOSE ÚLTIMOS 30 DÍAS PARA FIESTA / GRADUACIÓN:');
  const [recentReport] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'eventName' }],
    metrics: [
      { name: 'eventCount' },
      { name: 'activeUsers' }
    ],
    dimensionFilter
  });

  if (recentReport.rows) {
    recentReport.rows.forEach(r => {
      const evt = r.dimensionValues[0].value;
      const count = r.metricValues[0].value;
      const users = r.metricValues[1].value;
      if (['view_item', 'generate_lead', 'click_whatsapp', 'form_start', 'Contact', 'page_view'].includes(evt)) {
        console.log(`  • [Últimos 30 días] "${evt}": ${count} clics por ${users} usuarios`);
      }
    });
  }
}

analyzeFiestaGraduacionFunnel();
