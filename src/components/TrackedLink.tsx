'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { trackGAEvent } from './GoogleAnalytics';
import { trackEvent } from './FacebookPixel';
import { trackTikTokEvent } from './TikTokPixel';

interface TrackedLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  children: React.ReactNode;
  eventAction: string;
  eventCategory: string;
  eventLabel?: string;
  eventValue?: number;
}

export default function TrackedLink({
  href,
  children,
  eventAction,
  eventCategory,
  eventLabel,
  eventValue,
  onClick,
  ...props
}: TrackedLinkProps) {
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 1. Google Analytics (GA4)
    trackGAEvent(eventAction, eventCategory, eventLabel, eventValue);

    // 2. Meta Pixel (Facebook)
    trackEvent('Contact', {
      content_name: eventLabel || eventAction,
      content_category: eventCategory,
      value: eventValue,
    });

    // 3. TikTok Pixel
    trackTikTokEvent('Contact', {
      content_name: eventLabel || eventAction,
      content_category: eventCategory,
      value: eventValue,
    });

    // 4. Server-Side CAPI (Meta Conversions API & TikTok Events API)
    fetch('/api/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: 'Contact',
        customData: {
          content_name: eventLabel || eventAction,
          content_category: eventCategory,
          value: eventValue,
        }
      })
    }).catch((err) => console.error('CAPI Server tracking error:', err));

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
