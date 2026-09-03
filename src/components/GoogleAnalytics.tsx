'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

export const getStoredUTMs = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem('ea_utm');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const trackGAEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  params?: Record<string, any>
) => {
  if (typeof window !== 'undefined') {
    const utms = getStoredUTMs();
    const payload = {
      event_category: category,
      event_label: label,
      value: value,
      ...utms,
      ...params,
    };
    if ((window as any).gtag) {
      (window as any).gtag('event', action, payload);
    } else if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: action,
        ...payload,
      });
    }
  }
};

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_TRACKING_ID) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Auto-capture UTM parameters if present in URL
    if (searchParams) {
      const utmSource = searchParams.get('utm_source');
      const utmMedium = searchParams.get('utm_medium');
      const utmCampaign = searchParams.get('utm_campaign');
      const utmContent = searchParams.get('utm_content');
      const utmTerm = searchParams.get('utm_term');

      if (utmSource || utmMedium || utmCampaign) {
        const utmObj = {
          ...(utmSource && { utm_source: utmSource }),
          ...(utmMedium && { utm_medium: utmMedium }),
          ...(utmCampaign && { utm_campaign: utmCampaign }),
          ...(utmContent && { utm_content: utmContent }),
          ...(utmTerm && { utm_term: utmTerm }),
        };
        try {
          sessionStorage.setItem('ea_utm', JSON.stringify(utmObj));
        } catch {
          // Ignore storage errors
        }
      }
    }

    pageview(url);
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  if (!GA_TRACKING_ID) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </>
  );
}
