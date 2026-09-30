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
          // Extract the phone number if possible
          const phoneMatch = href.match(/wa\.me\/(\d+)/) || href.match(/phone=(\d+)/);
          const phone = phoneMatch ? phoneMatch[1] : 'unknown';

          // Ensure it's the bot number (or any number)
          // Fire all tracking events
          
          const eventLabel = `WhatsApp Link Click - ${phone}`;

          trackEvent('Contact', { 
            method: 'WhatsApp Web Link',
            content_name: eventLabel
          });
          
          trackTikTokEvent('Contact', { 
            method: 'WhatsApp Web Link',
            content_name: eventLabel
          });
          
          trackGAEvent('Contact', 'WhatsApp', eventLabel);

          // Server-side Event Relay (Meta CAPI & TikTok Events API)
          fetch('/api/tracking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  eventName: 'Contact',
                  customData: {
                      content_name: eventLabel,
                      content_category: 'WhatsApp',
                      phone_number: phone
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
