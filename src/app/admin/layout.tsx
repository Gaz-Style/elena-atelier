import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Admin Topbar */}
      <header className="bg-brand-charcoal border-b border-white/10 h-16 flex items-center px-6 md:px-8 sticky top-0 z-50">
        <Link href="/admin" className="flex flex-col items-stretch justify-center w-max">
            <div className="flex justify-between w-full font-serif text-xl font-black uppercase text-white leading-none tracking-widest">
                <span>E</span><span>L</span><span>E</span><span>N</span><span>A</span>
            </div>
            <div 
                className="font-sans text-[0.5rem] font-bold uppercase text-brand-terracotta mt-1 text-center"
                style={{ letterSpacing: '0.35em', marginRight: '-0.35em' }}
            >
                Atelier Admin
            </div>
        </Link>
        <div className="ml-auto">
            {/* You can add user profile info or logout button here in the future */}
        </div>
      </header>
      
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}
