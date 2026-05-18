import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { logoutAction } from '@/app/admin/login/actions';
import { LogOut } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden relative">
      {/* Admin Topbar */}
      <header className="bg-transparent h-16 flex items-center justify-between px-6 md:px-8 absolute top-0 w-full z-50 pointer-events-none">
        <Link href="/admin" className="flex flex-col items-stretch justify-center w-max pointer-events-auto">
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

        {user && (
          <form action={logoutAction} className="pointer-events-auto">
            <button type="submit" className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-brand-terracotta transition-colors px-3 py-2 border border-transparent hover:border-brand-terracotta rounded-sm">
              <span>Cerrar Sesión</span>
              <LogOut className="w-3 h-3" />
            </button>
          </form>
        )}
      </header>
      
      <div className="flex-grow w-full max-w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
