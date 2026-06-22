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
  const isPlanificador = pathname?.startsWith('/admin/planificador');

  return (
    <header className={`fixed top-0 left-0 w-full h-20 bg-brand-charcoal border-b border-white/10 z-50 ${isPlanificador ? 'hidden' : 'flex'} items-center justify-between px-6 md:px-8 shadow-md`}>
      <div className="flex items-center gap-6">
        {/* Logo ELENA */}
        <Link href="/admin" className="flex flex-col items-stretch justify-center w-max transition-opacity hover:opacity-80">
          <div className="flex justify-between w-full font-serif text-xl font-black uppercase text-white leading-none tracking-widest">
            <span>E</span><span>L</span><span>E</span><span>N</span><span>A</span>
          </div>
          <div 
            className="font-sans text-[0.55rem] font-bold uppercase text-brand-sand/70 mt-1 text-center"
            style={{ letterSpacing: '0.35em', marginRight: '-0.35em' }}
          >
            La Costurera
          </div>
        </Link>

        {/* Back to Dashboard Link (Only shown in subpages) */}
        {hasUser && isSubpage && (
          <Link 
            href="/admin" 
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-sand hover:text-brand-terracotta hover:border-brand-terracotta/40 transition-all px-3.5 py-2 border border-white/10 rounded-sm bg-white/5 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-brand-terracotta" />
            <span>Volver al Dashboard</span>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {hasUser && (
          <form action={logoutAction}>
            <button 
              type="submit" 
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/60 hover:text-brand-terracotta hover:border-brand-terracotta/40 transition-all px-3.5 py-2 border border-transparent hover:border-white/10 rounded-sm bg-transparent hover:bg-white/5 hover:shadow-sm"
            >
              <span>Cerrar Sesión</span>
              <LogOut className="w-3.5 h-3.5 text-white/40" />
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
