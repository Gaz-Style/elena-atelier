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

async function analyzeSastreriaTraffic() {
  console.log('Consultando GA4 para la página /sastreria (Últimos 30 días)...\n');

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
            matchType: 'EXACT',
            value: '/sastreria'
          }
        }
      }
    });

    if (pagesReport.rows && pagesReport.rows.length > 0) {
      console.log('📊 ESTADÍSTICAS PÁGINA SASTRERIA (30 Días):');
      pagesReport.rows.forEach((row) => {
        const path = row.dimensionValues[0].value;
        const views = row.metricValues[0].value;
        const users = row.metricValues[1].value;
        const avgDuration = parseFloat(row.metricValues[2].value);
        console.log(`  ${path} -> Vistas: ${views} | Usuarios: ${users} | Tiempo medio: ${avgDuration.toFixed(1)}s`);
      });
    } else {
      console.log('No se encontraron visitas a la página /sastreria en los últimos 30 días.');
    }
  } catch (error) {
    console.error('Error fetching GA data:', error);
  }
}

analyzeSastreriaTraffic();
