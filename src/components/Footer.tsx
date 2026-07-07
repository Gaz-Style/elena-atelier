'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="w-full py-16 border-t border-white/5 bg-[#0d0d0d] mt-auto relative z-10 text-white/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <h4 className="text-white text-xs uppercase tracking-[0.2em] font-bold">Elena La Costurera</h4>
            <p className="text-xs leading-relaxed max-w-xs">
              Alta costura a medida y upcycling. Diseños únicos y exclusivos para novias, graduaciones y fiestas en Santiago.
            </p>
          </div>
          
          {/* Col 2 */}
          <div className="space-y-4">
            <h4 className="text-white text-xs uppercase tracking-[0.2em] font-bold">Enlaces Útiles</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-[#cda45e] transition-colors">Inicio</Link></li>
              <li><Link href="/graduacion" className="hover:text-[#cda45e] transition-colors">Catálogo de Gala</Link></li>
              <li><Link href="/portal-colegios" className="hover:text-[#cda45e] transition-colors">Portal Colegios</Link></li>
              <li><Link href="/graduacion/registro-exclusividad" className="hover:text-[#cda45e] transition-colors">Registro Exclusividad</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-4">
            <h4 className="text-white text-xs uppercase tracking-[0.2em] font-bold">Showroom (Comunas)</h4>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              <li><Link href="/graduacion/vitacura" className="hover:text-[#cda45e] transition-colors">Vitacura</Link></li>
              <li><Link href="/graduacion/las-condes" className="hover:text-[#cda45e] transition-colors">Las Condes</Link></li>
              <li><Link href="/graduacion/lo-barnechea" className="hover:text-[#cda45e] transition-colors">Lo Barnechea</Link></li>
              <li><Link href="/graduacion/providencia" className="hover:text-[#cda45e] transition-colors">Providencia</Link></li>
              <li><Link href="/graduacion/la-reina" className="hover:text-[#cda45e] transition-colors">La Reina</Link></li>
              <li><Link href="/graduacion/nunoa" className="hover:text-[#cda45e] transition-colors">Ñuñoa</Link></li>
              <li><Link href="/graduacion/chicureo" className="hover:text-[#cda45e] transition-colors">Chicureo</Link></li>
              <li><Link href="/graduacion/maipu" className="hover:text-[#cda45e] transition-colors">Maipú</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5">
          <div className="text-[9px] text-white/40 font-sans tracking-widest uppercase font-semibold text-center md:text-left">
            &copy; {new Date().getFullYear()} Elena La Costurera. Todos los derechos reservados.
          </div>
          <div className="flex items-center justify-center gap-6 text-[9px] text-white/40 font-sans tracking-[0.2em] uppercase font-semibold">
            <Link href="/admin" className="hover:text-[#cda45e] transition-all duration-300">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
