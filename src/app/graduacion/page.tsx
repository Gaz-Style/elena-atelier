import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import GraduacionCatalog from '@/components/GraduacionCatalog';

export const metadata: Metadata = {
  title: 'Vestidos de Graduación | ELENA La Costurera — Alta Costura',
  description: 'Descubre nuestra colección exclusiva de vestidos de graduación de alta costura. Cada pieza es diseñada y confeccionada a mano en nuestro atelier de Vitacura, Santiago.',
  openGraph: {
    title: 'Vestidos de Graduación | ELENA La Costurera',
    description: 'Colección exclusiva de vestidos de graduación de alta costura, confeccionados a mano en Santiago.',
    url: 'https://elenalacosturera.cl/graduacion',
    siteName: 'ELENA La Costurera',
    locale: 'es_CL',
    type: 'website',
  },
};

export default function GraduacionPage() {
  return (
    <div className="min-h-screen bg-brand-charcoal">
      {/* ─── HERO ─── */}
      <section className="relative pt-16 sm:pt-24 md:pt-32 pb-16 md:pb-24 px-6 text-center overflow-hidden">
        {/* Decorative lines */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-4xl mx-auto space-y-6">
          <span className="text-[10px] uppercase tracking-[0.5em] font-semibold text-brand-sand block">
            Colección Exclusiva
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-white leading-[1.1] tracking-tight">
            Vestidos de{' '}
            <span className="italic text-brand-sand">Graduación</span>
          </h1>
          <p className="text-white/50 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
            Cada vestido es una pieza única confeccionada a mano en nuestro atelier de Vitacura.
            Diseñados para que ese día no se te olvide.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="w-12 h-px bg-white/15" />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-terracotta/60" />
            <div className="w-12 h-px bg-white/15" />
          </div>
        </div>
      </section>

      {/* ─── CATALOG ─── */}
      <section className="px-4 sm:px-6 lg:px-12 pb-20 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <GraduacionCatalog />
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-20 md:py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <span className="text-[10px] uppercase tracking-[0.4em] font-semibold text-brand-sand block">
            Experiencia Atelier
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white leading-tight">
            Agenda tu prueba{' '}
            <span className="italic text-brand-sand">privada</span>
          </h2>
          <p className="text-white/50 text-sm max-w-xl mx-auto leading-relaxed">
            Visita nuestro taller en Vitacura para probarte los vestidos, recibir asesoría personalizada
            y asegurar que el ajuste sea perfecto para tu gran noche.
          </p>
          <div className="pt-4">
            <Link
              href="/appointment"
              className="glass-btn group relative inline-flex items-center justify-center gap-3 px-8 py-4 md:px-12 md:py-5 text-white font-serif text-[10px] md:text-xs uppercase tracking-[0.28em] font-semibold transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] w-full sm:w-auto"
            >
              <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-center">
                Reservar mi hora
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
              </span>
            </Link>
          </div>
          <p className="text-[10px] text-white/25 uppercase tracking-widest pt-2">
            Av. Tabancura 1091 · Vitacura, Santiago
          </p>
        </div>
      </section>
    </div>
  );
}
