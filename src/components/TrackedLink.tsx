'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { trackGAEvent } from './GoogleAnalytics';

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
    trackGAEvent(eventAction, eventCategory, eventLabel, eventValue);
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
