'use client';

import { useEffect, useState } from 'react';

interface ClientDateProps {
  date: string;
}

export function ClientDate({ date }: ClientDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format using the browser's local timezone
  const formatted = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));

  if (!mounted) {
    // Render an empty span with the same format to avoid hydration mismatch,
    // or just render the date without suppressHydrationWarning since we use mounted check.
    // By returning null or empty initially, we avoid hydration mismatch entirely.
    return <span className="opacity-0">{formatted}</span>;
  }

  return <span>{formatted}</span>;
}
