require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const propertyId = process.env.GA4_PROPERTY_ID || '489116804';

let analyticsDataClient;
if (fs.existsSync('./ga_key.json')) {
  analyticsDataClient = new BetaAnalyticsDataClient({ keyFilename: './ga_key.json' });
} else if (process.env.GA_SERVICE_ACCOUNT_JSON) {
  const credentials = JSON.parse(process.env.GA_SERVICE_ACCOUNT_JSON);
  analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
} else if (process.env.GA_CLIENT_EMAIL && process.env.GA_PRIVATE_KEY) {
  analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA_CLIENT_EMAIL,
      private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  });
} else {
  analyticsDataClient = new BetaAnalyticsDataClient({ keyFilename: './ga_key.json' });
}

async function analyzeDemographicsAndPages() {
  try {
    console.log('\n=======================================');
    console.log('  GA4 ANALYSIS: EDADES Y PÁGINAS (90 días)');
    console.log('=======================================\n');

    // 1. EDADES (userAgeBracket)
    console.log('👥 1. DISTRIBUCIÓN POR EDAD (userAgeBracket):');
    try {
      const [ageReport] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'userAgeBracket' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
      });

      if (ageReport.rows && ageReport.rows.length > 0) {
        ageReport.rows.forEach(row => {
          const age = row.dimensionValues[0].value;
          const users = row.metricValues[0].value;
          const sessions = row.metricValues[1].value;
          const views = row.metricValues[2].value;
          console.log(`   • Rango de Edad: ${age} -> ${users} usuarios activos, ${sessions} sesiones, ${views} vistas`);
        });
      } else {
        console.log('   Sin datos de edad registrados (Google Signals desactivado o volumen bajo).');
      }
    } catch (e) {
      console.log('   Error consultando edades:', e.message);
    }

    // 2. GÉNERO (userGender)
    console.log('\n👫 2. DISTRIBUCIÓN POR GÉNERO (userGender):');
    try {
      const [genderReport] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'userGender' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' }
        ],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
      });

      if (genderReport.rows && genderReport.rows.length > 0) {
        genderReport.rows.forEach(row => {
          const gender = row.dimensionValues[0].value;
          const users = row.metricValues[0].value;
          const sessions = row.metricValues[1].value;
          console.log(`   • Género: ${gender} -> ${users} usuarios, ${sessions} sesiones`);
        });
      }
    } catch (e) {
      console.log('   Error consultando género:', e.message);
    }

    // 3. PÁGINAS MÁS VISITADAS (pagePath)
    console.log('\n📄 3. TOP PÁGINAS MÁS VISITADAS (pagePath):');
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
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 25
    });

    if (pagesReport.rows && pagesReport.rows.length > 0) {
      pagesReport.rows.forEach((row, i) => {
        const path = row.dimensionValues[0].value;
        const title = row.dimensionValues[1].value;
        const views = row.metricValues[0].value;
        const users = row.metricValues[1].value;
        const avgDuration = parseFloat(row.metricValues[2].value).toFixed(1);
        const bounce = (parseFloat(row.metricValues[3].value) * 100).toFixed(1);
        console.log(`   ${i+1}. ${path} ("${title}")`);
        console.log(`      Vistas: ${views} | Usuarios: ${users} | Tiempo Prom: ${avgDuration}s | Rebote: ${bounce}%`);
      });
    } else {
      console.log('   Sin datos de páginas.');
    }

    // 4. DISPOSITIVOS CATEGORY
    console.log('\n📱 4. DISPOSITIVOS (deviceCategory):');
    const [deviceReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' }
      ]
    });

    if (deviceReport.rows && deviceReport.rows.length > 0) {
      deviceReport.rows.forEach(row => {
        console.log(`   • ${row.dimensionValues[0].value}: ${row.metricValues[0].value} usuarios (${row.metricValues[1].value} sesiones)`);
      });
    }

  } catch (err) {
    console.error('Error general:', err);
  }
}

analyzeDemographicsAndPages();
