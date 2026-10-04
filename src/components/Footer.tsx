'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="w-full py-16 border-t border-white/5 bg-[#0d0d0d] mt-auto relative z-10 text-white/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          
          {/* Col 2: Useful Links */}
          <div className="space-y-4">
            <h4 className="text-white text-xs uppercase tracking-[0.2em] font-bold">Enlaces Útiles</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-[#cda45e] transition-colors">Inicio</Link></li>
              <li><Link href="/novias" className="hover:text-[#cda45e] transition-colors">Vestidos de Novia</Link></li>
              <li><Link href="/graduacion" className="hover:text-[#cda45e] transition-colors">Vestidos de Gala</Link></li>
              <li><Link href="/costuras" className="hover:text-[#cda45e] transition-colors">Taller de Costuras</Link></li>
              <li><Link href="/faq" className="hover:text-[#cda45e] transition-colors">Centro de Conocimiento (FAQ)</Link></li>
              <li><Link href="/graduacion/registro-exclusividad" className="hover:text-[#cda45e] transition-colors">Registro Exclusividad</Link></li>
            </ul>
          </div>

          {/* Col 3: Novias por Comuna */}
          <div className="space-y-4 lg:col-span-1">
            <h4 className="text-white text-xs uppercase tracking-[0.2em] font-bold">Novias</h4>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] w-max">
              <li><Link href="/novias/vitacura" className="hover:text-[#cda45e] transition-colors">Novias Vitacura</Link></li>
              <li><Link href="/novias/las-condes" className="hover:text-[#cda45e] transition-colors">Novias Las Condes</Link></li>
              <li><Link href="/novias/lo-barnechea" className="hover:text-[#cda45e] transition-colors">Novias Lo Barnechea</Link></li>
              <li><Link href="/novias/providencia" className="hover:text-[#cda45e] transition-colors">Novias Providencia</Link></li>
              <li><Link href="/novias/la-reina" className="hover:text-[#cda45e] transition-colors">Novias La Reina</Link></li>
              <li><Link href="/novias/nunoa" className="hover:text-[#cda45e] transition-colors">Novias Ñuñoa</Link></li>
              <li><Link href="/novias/maipu" className="hover:text-[#cda45e] transition-colors">Novias Maipú</Link></li>
              <li><Link href="/novias/la-florida" className="hover:text-[#cda45e] transition-colors">Novias La Florida</Link></li>
              <li><Link href="/novias/penalolen" className="hover:text-[#cda45e] transition-colors">Novias Peñalolén</Link></li>
              <li><Link href="/novias/san-miguel" className="hover:text-[#cda45e] transition-colors">Novias San Miguel</Link></li>
              <li><Link href="/novias/chicureo" className="hover:text-[#cda45e] transition-colors">Novias Chicureo</Link></li>
              <li><Link href="/novias/huechuraba" className="hover:text-[#cda45e] transition-colors">Novias Huechuraba</Link></li>
            </ul>
          </div>

          {/* Col 4: Graduacion por Comuna */}
          <div className="space-y-4 lg:col-span-1">
            <h4 className="text-white text-xs uppercase tracking-[0.2em] font-bold">Graduación</h4>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] w-max">
              <li><Link href="/graduacion/vitacura" className="hover:text-[#cda45e] transition-colors">Gala Vitacura</Link></li>
              <li><Link href="/graduacion/las-condes" className="hover:text-[#cda45e] transition-colors">Gala Las Condes</Link></li>
              <li><Link href="/graduacion/lo-barnechea" className="hover:text-[#cda45e] transition-colors">Gala Lo Barnechea</Link></li>
              <li><Link href="/graduacion/providencia" className="hover:text-[#cda45e] transition-colors">Gala Providencia</Link></li>
              <li><Link href="/graduacion/la-reina" className="hover:text-[#cda45e] transition-colors">Gala La Reina</Link></li>
              <li><Link href="/graduacion/nunoa" className="hover:text-[#cda45e] transition-colors">Gala Ñuñoa</Link></li>
              <li><Link href="/graduacion/maipu" className="hover:text-[#cda45e] transition-colors">Gala Maipú</Link></li>
              <li><Link href="/graduacion/la-florida" className="hover:text-[#cda45e] transition-colors">Gala La Florida</Link></li>
              <li><Link href="/graduacion/penalolen" className="hover:text-[#cda45e] transition-colors">Gala Peñalolén</Link></li>
              <li><Link href="/graduacion/san-miguel" className="hover:text-[#cda45e] transition-colors">Gala San Miguel</Link></li>
              <li><Link href="/graduacion/chicureo" className="hover:text-[#cda45e] transition-colors">Gala Chicureo</Link></li>
              <li><Link href="/graduacion/huechuraba" className="hover:text-[#cda45e] transition-colors">Gala Huechuraba</Link></li>
            </ul>
          </div>

          {/* Col 5: Sastrería & B2B */}
          <div className="space-y-4 lg:col-span-1">
            <h4 className="text-white text-xs uppercase tracking-[0.2em] font-bold">Sastrería & B2B</h4>
            <ul className="space-y-1.5 text-[11px] w-max">
              <li><Link href="/sastreria" className="hover:text-[#cda45e] transition-colors font-semibold text-white/80">Confección a Medida</Link></li>
              <li className="pt-2"><span className="text-[9px] uppercase tracking-widest text-white/30">División B2B</span></li>
              <li><Link href="/b2b" className="hover:text-[#cda45e] transition-colors">Sastrería Corporativa</Link></li>
              <li><Link href="/b2b#ejecutiva" className="hover:text-[#cda45e] transition-colors">Executive Care</Link></li>
              <li><Link href="/b2b#uniformes" className="hover:text-[#cda45e] transition-colors">Ajuste de Flota</Link></li>
              <li className="pt-2"><span className="text-[9px] uppercase tracking-widest text-white/30">Cobertura Destacada</span></li>
              <li><Link href="/b2b" className="hover:text-[#cda45e] transition-colors">Sastrería El Golf</Link></li>
              <li><Link href="/b2b" className="hover:text-[#cda45e] transition-colors">Sastrería Las Condes</Link></li>
              <li><Link href="/b2b" className="hover:text-[#cda45e] transition-colors">Sastrería Sanhattan</Link></li>
              <li><Link href="/b2b" className="hover:text-[#cda45e] transition-colors">Sastrería Vitacura</Link></li>
            </ul>
          </div>

          {/* Col 6 & 7: Costuras por Comuna & Sectores */}
          <div className="space-y-4 lg:col-span-2">
            <h4 className="text-white text-xs uppercase tracking-[0.2em] font-bold">Taller Costuras</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <ul className="space-y-1 text-[10px]">
                <li><Link href="/costuras/vitacura" title="Costuras a medida en Vitacura" className="hover:text-[#cda45e] transition-colors font-semibold text-white/80">Vitacura</Link></li>
                <li><Link href="/costuras/santa-maria-de-manquehue" title="Costuras en Santa María de Manquehue" className="hover:text-[#cda45e] transition-colors">Sta. María</Link></li>
                <li><Link href="/costuras/jardin-del-este" title="Costuras en Jardín del Este" className="hover:text-[#cda45e] transition-colors">Jardín del Este</Link></li>
                <li><Link href="/costuras/lo-curro" title="Costuras en Lo Curro" className="hover:text-[#cda45e] transition-colors">Lo Curro</Link></li>
                <li><Link href="/costuras/alonso-de-cordova" title="Costuras en Alonso de Córdova" className="hover:text-[#cda45e] transition-colors">Alonso Córdova</Link></li>
                <li><Link href="/costuras/borde-rio" title="Costuras en Borde Río y Nueva Costanera" className="hover:text-[#cda45e] transition-colors">Borde Río</Link></li>
              </ul>

              <ul className="space-y-1 text-[10px]">
                <li><Link href="/costuras/las-condes" title="Costuras a medida en Las Condes" className="hover:text-[#cda45e] transition-colors font-semibold text-white/80">Las Condes</Link></li>
                <li><Link href="/costuras/san-carlos-de-apoquindo" title="Costuras en San Carlos de Apoquindo" className="hover:text-[#cda45e] transition-colors">S.C. Apoquindo</Link></li>
                <li><Link href="/costuras/el-golf" title="Costuras en barrio El Golf" className="hover:text-[#cda45e] transition-colors">El Golf</Link></li>
                <li><Link href="/costuras/san-damian" title="Costuras en San Damián" className="hover:text-[#cda45e] transition-colors">San Damián</Link></li>
                <li><Link href="/costuras/estoril" title="Costuras en Estoril y Tabancura" className="hover:text-[#cda45e] transition-colors">Estoril</Link></li>
                <li><Link href="/costuras/los-dominicos" title="Costuras en Los Dominicos" className="hover:text-[#cda45e] transition-colors">Los Dominicos</Link></li>
              </ul>

              <ul className="space-y-1 text-[10px]">
                <li><Link href="/costuras/lo-barnechea" title="Costuras a medida en Lo Barnechea" className="hover:text-[#cda45e] transition-colors font-semibold text-white/80">Lo Barnechea</Link></li>
                <li><Link href="/costuras/la-dehesa" title="Costuras en La Dehesa" className="hover:text-[#cda45e] transition-colors">La Dehesa</Link></li>
                <li><Link href="/costuras/los-trapenses" title="Costuras en Los Trapenses" className="hover:text-[#cda45e] transition-colors">Los Trapenses</Link></li>
                <li><Link href="/costuras/el-huinganal" title="Costuras en El Huinganal" className="hover:text-[#cda45e] transition-colors">El Huinganal</Link></li>
                <li><Link href="/costuras/el-arrayan" title="Costuras en El Arrayán" className="hover:text-[#cda45e] transition-colors">El Arrayán</Link></li>
                <li><Link href="/costuras/valle-escondido" title="Costuras en Valle Escondido" className="hover:text-[#cda45e] transition-colors">Valle Escondido</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Brand horizontal strip */}
        <div className="py-8 border-t border-white/5 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-white text-[10px] uppercase tracking-[0.3em] font-bold mb-3">Elena La Costurera</h4>
            <p className="text-[11px] leading-relaxed text-white/50 max-w-2xl">
              Alta costura a medida y upcycling. Diseños únicos y exclusivos para novias, graduaciones y arreglos sastreros en Santiago.
            </p>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-white/5">
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
