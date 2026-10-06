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

async function analyzeTopDressesFixed() {
  console.log('====================================================');
  console.log('  ANÁLISIS DE ITEMS DE VESTIDOS (GA4)');
  console.log('====================================================\n');

  // Query itemsViewed metric with itemName dimension
  try {
    const [itemReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'itemName' }],
      metrics: [{ name: 'itemsViewed' }],
      orderBys: [{ metric: { metricName: 'itemsViewed' }, desc: true }],
      limit: 20
    });

    console.log('👗 TOP VESTIDOS MÁS REVISADOS EN DETALLE (itemsViewed):');
    if (itemReport.rows && itemReport.rows.length > 0) {
      itemReport.rows.forEach((r, i) => {
        const item = r.dimensionValues[0].value;
        const count = r.metricValues[0].value;
        console.log(`   ${i+1}. Vestido "${item}" -> ${count} veces visualizado`);
      });
    } else {
      console.log('   Sin registros reportados por `itemName` en itemsViewed.');
    }
  } catch (err1) {
    console.log('   Error query 1:', err1.message);
  }

  // Also query custom event parameter item_name if registered
  try {
    const [paramReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'customEvent:item_name' }],
      metrics: [{ name: 'eventCount' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 20
    });

    console.log('\n💬 PARAMETRO item_name EN EVENTOS CUSTOM:');
    if (paramReport.rows && paramReport.rows.length > 0) {
      paramReport.rows.forEach((r, i) => {
        const item = r.dimensionValues[0].value;
        const count = r.metricValues[0].value;
        console.log(`   ${i+1}. "${item}" -> ${count} eventos`);
      });
    } else {
      console.log('   El parámetro `customEvent:item_name` no está creado como dimensión personalizada en la consola de GA4 aún.');
    }
  } catch (err2) {
    console.log('   (Parámetro de evento custom requiere registro en GA4 admin panel).');
  }
}

analyzeTopDressesFixed();
