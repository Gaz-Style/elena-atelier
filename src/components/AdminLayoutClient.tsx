'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPlanificador = pathname?.startsWith('/admin/planificador');

  return (
    <div className={`flex flex-col min-h-screen w-full max-w-full overflow-x-hidden relative bg-white text-brand-charcoal ${isPlanificador ? '-mt-20' : ''}`}>
      {children}
    </div>
  );
}
