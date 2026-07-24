'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

export const TT_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

export const ttPageview = () => {
  if (typeof window !== 'undefined' && (window as any).ttq) {
    (window as any).ttq.page();
  }
};

export const trackTikTokEvent = (name: string, options = {}) => {
  if (typeof window !== 'undefined' && (window as any).ttq) {
    (window as any).ttq.track(name, options);
  }
};

function TikTokPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!TT_PIXEL_ID) return;
    ttPageview();
  }, [pathname, searchParams]);

  return null;
}

export default function TikTokPixel() {
  if (!TT_PIXEL_ID) return null;

  return (
    <>
      <Script
        id="tiktok-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","setCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var o="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=o,ttq._t=ttq._t||[],ttq._t.push(e),ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=d.createElement("script");a.type="text/javascript",a.async=!0,a.src=o;var c=d.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c)};
              ttq.load('${TT_PIXEL_ID}');
            }(window, document, 'ttq');
          `,
        }}
      />
      <Suspense fallback={null}>
        <TikTokPixelTracker />
      </Suspense>
    </>
  );
}
