const { google } = require('googleapis');
const fs = require('fs');

async function reindexSitemap() {
  console.log('====================================================');
  console.log(' 🚀 NOTIFICANDO A GOOGLE SEARCH CONSOLE RE-INDEXACIÓN');
  console.log('====================================================\n');

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: './ga_key.json',
      scopes: ['https://www.googleapis.com/auth/webmasters'],
    });

    const searchconsole = google.searchconsole({ version: 'v1', auth });

    // Re-submit sitemap to Google Search Console
    const siteUrl = 'https://www.elenalacosturera.cl/';
    const feedpath = 'https://www.elenalacosturera.cl/sitemap.xml';

    console.log(`📡 Enviando solicitud de actualización de Sitemap: ${feedpath}`);
    await searchconsole.sitemaps.submit({
      siteUrl,
      feedpath
    });

    console.log('✅ Sitemap enviado exitosamente a Google Search Console.');
    console.log('🤖 Googlebot procesará el sitemap y re-indexará las páginas públicas en el próximo ciclo de rastreo.');

  } catch (err) {
    console.log('Notice GSC submit:', err.message);
  }
}

reindexSitemap();
