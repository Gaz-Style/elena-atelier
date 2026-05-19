'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ArrowLeft } from 'lucide-react';
import { logoutAction } from '@/app/admin/login/actions';

interface AdminHeaderProps {
  hasUser: boolean;
}

export default function AdminHeader({ hasUser }: AdminHeaderProps) {
  const pathname = usePathname();
  const isSubpage = pathname !== '/admin';

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-6 md:px-8 absolute top-0 w-full z-50 pointer-events-none shadow-sm transition-all duration-300">
      <div className="flex items-center gap-6 pointer-events-auto">
        <Link href="/admin" className="flex flex-col items-stretch justify-center w-max transition-opacity hover:opacity-80">
          <div className="flex justify-between w-full font-serif text-xl font-black uppercase text-brand-charcoal leading-none tracking-widest">
            <span>E</span><span>L</span><span>E</span><span>N</span><span>A</span>
          </div>
          <div 
            className="font-sans text-[0.55rem] font-bold uppercase text-brand-charcoal/70 mt-1 text-center"
            style={{ letterSpacing: '0.35em', marginRight: '-0.35em' }}
          >
            La Costurera
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 md:gap-4 pointer-events-auto">
        {hasUser && isSubpage && (
          <Link 
            href="/admin" 
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-brand-terracotta hover:border-brand-terracotta/40 transition-all px-3.5 py-2 border border-gray-200 rounded-sm bg-white hover:shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-brand-terracotta" />
            <span>Volver al Dashboard</span>
          </Link>
        )}

        {hasUser && (
          <form action={logoutAction}>
            <button type="submit" className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-brand-terracotta hover:border-brand-terracotta/40 transition-all px-3.5 py-2 border border-transparent hover:border-gray-200 rounded-sm bg-transparent hover:bg-white hover:shadow-sm">
              <span>Cerrar Sesión</span>
              <LogOut className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
