'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/components/FacebookPixel';
import { trackTikTokEvent } from '@/components/TikTokPixel';
import { trackGAEvent } from '@/components/GoogleAnalytics';

export default function GlobalWhatsAppTracker() {
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Traverse up to find if an anchor tag was clicked
      let target = e.target as HTMLElement | null;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (target && target.tagName === 'A') {
        const href = (target as HTMLAnchorElement).href;
        
        // Detect if it's a WhatsApp link
        if (href && (href.includes('wa.me/') || href.includes('api.whatsapp.com/send'))) {
          // Extraer número de teléfono
          const phoneMatch = href.match(/wa\.me\/(\d+)/) || href.match(/phone=(\d+)/);
          const phone = phoneMatch ? phoneMatch[1] : 'unknown';

          // Extraer contexto de dónde viene el lead
          const urlObj = new URL(href);
          const textParam = urlObj.searchParams.get('text') || 'Sin mensaje precargado';
          const originPath = window.location.pathname;
          
          let leadSource = 'General Web';
          if (originPath.includes('/graduacion')) leadSource = 'Graduación';
          else if (originPath.includes('/novias')) leadSource = 'Novias';
          else if (originPath.includes('/portafolio')) leadSource = 'Portafolio Alta Costura';
          else if (originPath.includes('/vip')) leadSource = 'Programa VIP';
          else if (originPath.includes('/costuras')) leadSource = 'Arreglos de Ropa';
          else if (originPath === '/') leadSource = 'Página Principal';

          const eventName = 'Contact';
          const eventLabel = `WhatsApp Click: ${leadSource}`;

          const pixelData = { 
            method: 'WhatsApp Web Link',
            content_name: eventLabel,
            content_category: leadSource,
            lead_source: leadSource,
            preloaded_message: textParam.substring(0, 50) // Truncado por límites de APIs
          };

          trackEvent(eventName, pixelData);
          trackTikTokEvent(eventName, pixelData);
          trackGAEvent(eventName, 'WhatsApp', eventLabel);

          // Server-side Event Relay (Meta CAPI & TikTok Events API)
          fetch('/api/tracking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  eventName: eventName,
                  customData: {
                      ...pixelData,
                      phone_number: phone,
                      source_url: window.location.href
                  }
              })
          }).catch((err) => console.error('Server tracking error:', err));
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return null;
}
