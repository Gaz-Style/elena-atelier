'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isPlanificador = pathname?.startsWith('/admin/planificador');
  
  return (
    <div className="flex min-h-screen w-full bg-zinc-50 text-zinc-800 font-sans selection:bg-zinc-200/60 -mt-20">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div 
            className={cn(
            "flex-1 transition-all duration-300 relative flex flex-col min-h-screen overflow-x-hidden",
            isCollapsed ? "ml-0 lg:ml-[80px]" : "ml-0 lg:ml-[280px]"
        )}
      >
        {children}
      </div>
    </div>
  );
}
