import crypto from 'crypto';

// Helper to hash string to SHA-256 for privacy compliance (Meta & TikTok)
export function hashSHA256(value: string | undefined | null): string | null {
  if (!value) return null;
  const cleanValue = value.trim().toLowerCase();
  return crypto.createHash('sha256').update(cleanValue).digest('hex');
}

interface TrackingUserData {
  email?: string;
  phone?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
}

interface TrackingCustomData {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  [key: string]: any;
}

export async function sendServerEvent(
  eventName: string,
  userData: TrackingUserData,
  customData: TrackingCustomData = {}
) {
  const metaPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  const metaAccessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const tiktokAccessToken = process.env.TIKTOK_ACCESS_TOKEN;

  const eventTime = Math.floor(Date.now() / 1000);
  const hashedEmail = hashSHA256(userData.email);
  const hashedPhone = hashSHA256(userData.phone);
  const clientIp = userData.ip || '127.0.0.1';
  const clientUserAgent = userData.userAgent || 'unknown';
  const pageUrl = userData.url || 'https://www.elenalacosturera.cl/';

  const promises: Promise<any>[] = [];

  // 1. Send to Meta Conversions API (CAPI)
  if (metaPixelId && metaAccessToken) {
    const metaPayload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          user_data: {
            em: hashedEmail ? [hashedEmail] : undefined,
            ph: hashedPhone ? [hashedPhone] : undefined,
            client_ip_address: clientIp,
            client_user_agent: clientUserAgent,
          },
          custom_data: {
            content_name: customData.content_name,
            content_category: customData.content_category,
            value: customData.value,
            currency: customData.currency || 'CLP',
          },
          action_source: 'website',
          event_source_url: pageUrl,
        },
      ],
    };

    const metaUrl = `https://graph.facebook.com/v21.0/${metaPixelId}/events?access_token=${metaAccessToken}`;
    promises.push(
      fetch(metaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaPayload),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errLog = await res.json();
            console.error('Meta CAPI Error response:', errLog);
          } else {
            console.log(`Meta CAPI: Event "${eventName}" sent successfully.`);
          }
        })
        .catch((err) => console.error('Meta CAPI Fetch Error:', err))
    );
  } else {
    console.log(`Meta CAPI skipped: Missing Pixel ID or Access Token.`);
  }

  // 2. Send to TikTok Events API
  if (tiktokPixelId && tiktokAccessToken && tiktokPixelId !== 'TU_PIXEL_ID_DE_TIKTOK_AQUI') {
    const tiktokPayload = {
      event_source: 'web',
      event_source_id: tiktokPixelId,
      data: [
        {
          event: eventName,
          event_time: eventTime,
          user: {
            email: hashedEmail || undefined,
            phone_number: hashedPhone || undefined,
            ip: clientIp,
            user_agent: clientUserAgent,
          },
          properties: {
            contents: customData.content_name ? [{ content_name: customData.content_name }] : undefined,
            content_type: customData.content_category ? 'product' : undefined,
            value: customData.value,
            currency: customData.currency || 'CLP',
          },
          page: {
            url: pageUrl,
          },
        },
      ],
    };

    const tiktokUrl = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
    promises.push(
      fetch(tiktokUrl, {
        method: 'POST',
        headers: {
          'Access-Token': tiktokAccessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tiktokPayload),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errLog = await res.json();
            console.error('TikTok Events API Error response:', errLog);
          } else {
            console.log(`TikTok Events API: Event "${eventName}" sent successfully.`);
          }
        })
        .catch((err) => console.error('TikTok Events API Fetch Error:', err))
    );
  } else {
    console.log(`TikTok Events API skipped: Missing Pixel ID or Access Token.`);
  }

  if (promises.length > 0) {
    await Promise.all(promises);
  }
}
