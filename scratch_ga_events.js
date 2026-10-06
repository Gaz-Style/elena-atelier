require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const propertyId = process.env.GA4_PROPERTY_ID || '489116804'; // Your Property ID

let analyticsDataClient;
if (fs.existsSync('./ga_key.json')) {
  analyticsDataClient = new BetaAnalyticsDataClient({ keyFilename: './ga_key.json' });
} else {
  analyticsDataClient = new BetaAnalyticsDataClient();
}

async function runReport() {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'eventName' }
      ],
      metrics: [
        { name: 'eventCount' },
      ],
      orderBys: [
        {
            metric: { metricName: 'eventCount' },
            desc: true
        }
      ]
    });

    console.log("--- TOP CLICKED BUTTONS / EVENTS (LAST 30 DAYS) ---");
    response.rows.forEach(row => {
      // Filter out basic GA4 events to focus on clicks/custom events
      const eventName = row.dimensionValues[0].value;
      const eventCount = row.metricValues[0].value;
      
      if (!['page_view', 'session_start', 'first_visit', 'user_engagement', 'scroll', 'form_start'].includes(eventName)) {
          console.log(`${eventName} - Clicks: ${eventCount}`);
      }
    });

  } catch (error) {
    console.error("Error fetching GA4 data:", error);
  }
}

runReport();
