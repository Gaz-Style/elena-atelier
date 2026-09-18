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

async function analyzeCosturasPage() {
  try {
    // 1. TRÁFICO GENERAL DE /costuras (últimos 90 días)
    console.log('\n═══════════════════════════════════════');
    console.log('  ANÁLISIS GA4: /costuras (90 días)');
    console.log('═══════════════════════════════════════\n');

    const [trafficReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'engagedSessions' },
        { name: 'userEngagementDuration' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: { matchType: 'CONTAINS', value: 'costuras' },
        },
      },
    });

    console.log('📊 TRÁFICO /costuras:');
    if (trafficReport.rows && trafficReport.rows.length > 0) {
      trafficReport.rows.forEach(row => {
        const path = row.dimensionValues[0].value;
        const views = row.metricValues[0].value;
        const users = row.metricValues[1].value;
        const sessions = row.metricValues[2].value;
        const avgDuration = parseFloat(row.metricValues[3].value).toFixed(1);
        const bounceRate = (parseFloat(row.metricValues[4].value) * 100).toFixed(1);
        const engaged = row.metricValues[5].value;
        console.log(`  Ruta: ${path}`);
        console.log(`  Vistas de página: ${views}`);
        console.log(`  Usuarios activos: ${users}`);
        console.log(`  Sesiones: ${sessions}`);
        console.log(`  Duración promedio sesión: ${avgDuration}s`);
        console.log(`  Tasa de rebote: ${bounceRate}%`);
        console.log(`  Sesiones comprometidas: ${engaged}`);
        console.log('  ---');
      });
    } else {
      console.log('  Sin datos para /costuras en los últimos 90 días.');
    }

    // 2. FUENTES DE TRÁFICO hacia /costuras
    console.log('\n📡 FUENTES DE TRÁFICO hacia /costuras:');
    const [sourceReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
      dimensions: [
        { name: 'sessionSource' },
        { name: 'sessionMedium' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'landingPage',
          stringFilter: { matchType: 'CONTAINS', value: 'costuras' },
        },
      },
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 15,
    });

    if (sourceReport.rows && sourceReport.rows.length > 0) {
      sourceReport.rows.forEach(row => {
        const source = row.dimensionValues[0].value;
        const medium = row.dimensionValues[1].value;
        const sessions = row.metricValues[0].value;
        const users = row.metricValues[1].value;
        const bounceRate = (parseFloat(row.metricValues[2].value) * 100).toFixed(1);
        const avgDuration = parseFloat(row.metricValues[3].value).toFixed(1);
        console.log(`  ${source}/${medium} — ${sessions} sesiones, ${users} usuarios, rebote: ${bounceRate}%, duración: ${avgDuration}s`);
      });
    } else {
      console.log('  Sin datos de fuentes para landing en /costuras.');
    }

    // 3. DISPOSITIVOS en /costuras
    console.log('\n📱 DISPOSITIVOS en /costuras:');
    const [deviceReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: { matchType: 'CONTAINS', value: 'costuras' },
        },
      },
    });

    if (deviceReport.rows && deviceReport.rows.length > 0) {
      deviceReport.rows.forEach(row => {
        const device = row.dimensionValues[0].value;
        const sessions = row.metricValues[0].value;
        const users = row.metricValues[1].value;
        const bounceRate = (parseFloat(row.metricValues[2].value) * 100).toFixed(1);
        const avgDuration = parseFloat(row.metricValues[3].value).toFixed(1);
        console.log(`  ${device}: ${sessions} sesiones, ${users} usuarios, rebote: ${bounceRate}%, duración: ${avgDuration}s`);
      });
    } else {
      console.log('  Sin datos de dispositivos.');
    }

    // 4. EVENTOS Y CONVERSIONES en /costuras
    console.log('\n🎯 EVENTOS en páginas /costuras:');
    const [eventReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'eventName' }],
      metrics: [
        { name: 'eventCount' },
        { name: 'activeUsers' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: { matchType: 'CONTAINS', value: 'costuras' },
        },
      },
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 20,
    });

    if (eventReport.rows && eventReport.rows.length > 0) {
      eventReport.rows.forEach(row => {
        const event = row.dimensionValues[0].value;
        const count = row.metricValues[0].value;
        const users = row.metricValues[1].value;
        console.log(`  ${event}: ${count} eventos, ${users} usuarios`);
      });
    } else {
      console.log('  Sin eventos registrados.');
    }

    // 5. PÁGINAS DE COMUNAS /costuras/[comuna]
    console.log('\n📍 TRÁFICO POR COMUNA (/costuras/[comuna]):');
    const [communeReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'bounceRate' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: { matchType: 'BEGINS_WITH', value: '/costuras/' },
        },
      },
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 20,
    });

    if (communeReport.rows && communeReport.rows.length > 0) {
      communeReport.rows.forEach(row => {
        const path = row.dimensionValues[0].value;
        const views = row.metricValues[0].value;
        const users = row.metricValues[1].value;
        const bounceRate = (parseFloat(row.metricValues[2].value) * 100).toFixed(1);
        console.log(`  ${path}: ${views} vistas, ${users} usuarios, rebote: ${bounceRate}%`);
      });
    } else {
      console.log('  Sin datos de comunas.');
    }

    // 6. COMPARATIVA: /costuras vs todo el sitio
    console.log('\n📈 COMPARATIVA: /costuras vs SITIO COMPLETO:');
    const [siteReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
    });

    if (siteReport.rows && siteReport.rows.length > 0) {
      const row = siteReport.rows[0];
      console.log(`  SITIO TOTAL:`);
      console.log(`    Vistas: ${row.metricValues[0].value}`);
      console.log(`    Usuarios: ${row.metricValues[1].value}`);
      console.log(`    Sesiones: ${row.metricValues[2].value}`);
      console.log(`    Rebote: ${(parseFloat(row.metricValues[3].value) * 100).toFixed(1)}%`);
      console.log(`    Duración promedio: ${parseFloat(row.metricValues[4].value).toFixed(1)}s`);
    }

    // 7. TOP LANDING PAGES (para ver donde queda /costuras)
    console.log('\n🏠 TOP 15 LANDING PAGES (para contexto):');
    const [landingReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'landingPage' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 15,
    });

    if (landingReport.rows && landingReport.rows.length > 0) {
      landingReport.rows.forEach((row, i) => {
        const page = row.dimensionValues[0].value;
        const sessions = row.metricValues[0].value;
        const users = row.metricValues[1].value;
        const bounceRate = (parseFloat(row.metricValues[2].value) * 100).toFixed(1);
        const avgDuration = parseFloat(row.metricValues[3].value).toFixed(1);
        const marker = page.includes('costuras') ? ' ⬅️ COSTURAS' : '';
        console.log(`  ${i+1}. ${page} — ${sessions} ses, ${users} usr, rebote: ${bounceRate}%, dur: ${avgDuration}s${marker}`);
      });
    }

    // 8. FLUJO: ¿A dónde van después de /costuras?
    console.log('\n🔄 FLUJO POSTERIOR: ¿Qué ven después de /costuras?');
    const [flowReport] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: 'pagePath',
                stringFilter: { matchType: 'EXACT', value: '/costuras' },
              },
            },
          ],
        },
      },
    });
    // Note: GA4 doesn't easily support "next page" analysis via API, so this is approximate
    console.log('  (Nota: El flujo de navegación post-visita requiere exploración en el panel GA4)');

    console.log('\n═══════════════════════════════════════');
    console.log('  ANÁLISIS COMPLETADO');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

analyzeCosturasPage();
