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

async function analyzeCosturasTraffic() {
  console.log('Consultando GA4 para páginas de /costuras/ (Últimos 30 días)...\n');

  try {
    const [pagesReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' }
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'CONTAINS',
            value: '/costuras/'
          }
        }
      },
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 20
    });

    if (pagesReport.rows && pagesReport.rows.length > 0) {
      console.log('🔝 TOP PÁGINAS DE COSTURAS MÁS VISITADAS (30 Días):');
      pagesReport.rows.forEach((row, i) => {
        const path = row.dimensionValues[0].value;
        const views = row.metricValues[0].value;
        const users = row.metricValues[1].value;
        const avgDuration = parseFloat(row.metricValues[2].value);
        console.log(`  ${i+1}. ${path} -> Vistas: ${views} | Usuarios: ${users} | Tiempo medio: ${avgDuration.toFixed(1)}s`);
      });
    } else {
      console.log('No se encontraron visitas a páginas de /costuras/ en los últimos 30 días.');
    }
  } catch (error) {
    console.error('Error fetching GA data:', error);
  }
}

analyzeCosturasTraffic();
