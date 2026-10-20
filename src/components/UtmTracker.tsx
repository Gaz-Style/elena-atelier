'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function UtmTrackerContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');
    const utmCampaign = searchParams.get('utm_campaign');
    const utmTerm = searchParams.get('utm_term');

    if (utmSource) {
      const expirationDate = new Date();
      expirationDate.setTime(expirationDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días
      const expires = `expires=${expirationDate.toUTCString()}`;
      
      const utmData = {
        utm_source: utmSource,
        utm_medium: utmMedium || '',
        utm_campaign: utmCampaign || '',
        utm_term: utmTerm || ''
      };

      document.cookie = `utm_data=${encodeURIComponent(JSON.stringify(utmData))}; ${expires}; path=/`;
    }
  }, [searchParams]);

  return null;
}

export function UtmTracker() {
  return (
    <Suspense fallback={null}>
      <UtmTrackerContent />
    </Suspense>
  );
}
