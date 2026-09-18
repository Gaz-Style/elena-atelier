const { google } = require('googleapis');
const fs = require('fs');

async function queryGSC() {
  try {
    console.log('\n=======================================');
    console.log('  GOOGLE SEARCH CONSOLE (GSC) LIVE QUERY');
    console.log('=======================================\n');

    const auth = new google.auth.GoogleAuth({
      keyFile: './ga_key.json',
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const searchconsole = google.searchconsole({ version: 'v1', auth });

    // Query 1: Top Keywords / Queries (90 days)
    console.log('🔍 1. TOP PALABRAS CLAVE BUSCADAS EN GOOGLE (90 días):');
    const resQueries = await searchconsole.searchanalytics.query({
      siteUrl: 'https://www.elenalacosturera.cl/',
      requestBody: {
        startDate: '2026-06-01',
        endDate: '2026-09-18',
        dimensions: ['query'],
        rowLimit: 20
      },
    });

    if (resQueries.data.rows && resQueries.data.rows.length > 0) {
      resQueries.data.rows.forEach((row, i) => {
        const query = row.keys[0];
        const clics = row.clicks;
        const impressions = row.impressions;
        const ctr = (row.ctr * 100).toFixed(1);
        const position = row.position.toFixed(1);
        console.log(`   ${i+1}. "${query}" -> ${clics} clics | ${impressions} impresiones | CTR: ${ctr}% | Posición: #${position}`);
      });
    } else {
      console.log('   (GSC recién activado: Google procesa datos iniciales en 24-48 hrs).');
    }

    // Query 2: Top Pages in Search
    console.log('\n📄 2. TOP PÁGINAS MEJOR POSICIONADAS EN GOOGLE:');
    const resPages = await searchconsole.searchanalytics.query({
      siteUrl: 'https://www.elenalacosturera.cl/',
      requestBody: {
        startDate: '2026-06-01',
        endDate: '2026-09-18',
        dimensions: ['page'],
        rowLimit: 15
      },
    });

    if (resPages.data.rows && resPages.data.rows.length > 0) {
      resPages.data.rows.forEach((row, i) => {
        const page = row.keys[0];
        const clics = row.clicks;
        const impressions = row.impressions;
        const ctr = (row.ctr * 100).toFixed(1);
        const position = row.position.toFixed(1);
        console.log(`   ${i+1}. ${page} -> ${clics} clics | ${impressions} impresiones | Posición: #${position}`);
      });
    } else {
      console.log('   (Esperando sincronización de páginas en GSC).');
    }

    // Query 3: Sitemaps status
    console.log('\n🗺️ 3. ESTADO DEL SITEMAP EN GOOGLE SEARCH CONSOLE:');
    const resSitemaps = await searchconsole.sitemaps.list({
      siteUrl: 'https://www.elenalacosturera.cl/',
    });

    if (resSitemaps.data.sitemap && resSitemaps.data.sitemap.length > 0) {
      resSitemaps.data.sitemap.forEach(s => {
        console.log(`   • Path: ${s.path} | Estado de procesamiento: ${s.isPending ? 'Pendiente' : 'Procesado Exitosamente'}`);
      });
    } else {
      console.log('   Sin sitemaps registrados.');
    }

  } catch (err) {
    console.error('Error GSC API:', err.message);
  }
}

queryGSC();
