'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="w-full py-10 border-t border-white/10 bg-transparent mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-xs text-white/40 font-sans tracking-widest uppercase font-semibold">
          &copy; {new Date().getFullYear()} Elena Rojas Bustamante. Todos los derechos reservados.
        </div>
        <div className="flex items-center gap-6 text-xs text-white/40 font-sans tracking-[0.2em] uppercase font-semibold">
          <Link href="/admin" className="hover:text-brand-sand transition-all duration-300">
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
