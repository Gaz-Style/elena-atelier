'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="w-full py-8 border-t border-brand-charcoal/10 bg-transparent mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-xs text-brand-charcoal/60 font-sans">
          &copy; {new Date().getFullYear()} Elena La Costurera. Todos los derechos reservados.
        </div>
        <div className="flex items-center gap-6 text-xs text-brand-charcoal/60 font-sans tracking-widest uppercase">
          <Link href="/admin" className="hover:text-brand-terracotta transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
