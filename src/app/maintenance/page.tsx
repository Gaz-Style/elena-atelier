import React from 'react';
import Link from 'next/link';
import { Sparkles, Clock, MapPin, Mail, ShieldCheck } from 'lucide-react';
import { MAINTENANCE_CONFIG } from '@/lib/maintenance';

export const metadata = {
  title: 'Mantenimiento en Curso — Elena Atelier',
  description: 'Nuestra plataforma se encuentra en mantenimiento programado. Volveremos pronto.',
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F2EB] font-sans flex flex-col justify-between selection:bg-[#C17F5F] selection:text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C17F5F]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Minimal */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between relative z-10 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-serif text-lg font-bold text-[#E5D3B3]">
            E
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base tracking-[0.25em] text-white font-bold leading-none">
              ELENA
            </span>
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#C17F5F] font-semibold mt-1">
              ATELIER VITACURA
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-[#E5D3B3]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          Mantenimiento Programado
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 text-[#C17F5F] shadow-2xl mx-auto mb-2">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-[#C17F5F] font-semibold">
              Actualización del Sistema
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.15]">
              Estamos mejorando <br />
              <span className="italic font-light text-[#E5D3B3]">nuestra experiencia.</span>
            </h1>
            <p className="text-sm sm:text-base text-white/70 max-w-lg mx-auto font-light leading-relaxed pt-2">
              {MAINTENANCE_CONFIG.subtitle}
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-2xl text-left space-y-5">
            <div className="flex items-start gap-4">
              <Clock className="w-5 h-5 text-[#C17F5F] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Estado Actual</h3>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  {MAINTENANCE_CONFIG.estimatedTime} Los pedidos, agendas y servicios en curso se encuentran respaldados.
                </p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex items-start gap-4">
              <MapPin className="w-5 h-5 text-[#C17F5F] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Atelier Presencial</h3>
                <p className="text-xs text-white/70 mt-1">
                  {MAINTENANCE_CONFIG.address}
                </p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex items-start gap-4">
              <Mail className="w-5 h-5 text-[#C17F5F] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Contacto Directo</h3>
                <p className="text-xs text-white/70 mt-1">
                  Para consultas urgentes puedes escribir a <a href={`mailto:${MAINTENANCE_CONFIG.contactEmail}`} className="text-[#E5D3B3] underline underline-offset-4">{MAINTENANCE_CONFIG.contactEmail}</a>
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Minimal with Admin link */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40 relative z-10">
        <div>
          &copy; {new Date().getFullYear()} Elena Atelier. Todos los derechos reservados.
        </div>
        <div className="flex items-center gap-6">
          <Link 
            href="/admin/login" 
            className="text-white/40 hover:text-white/80 transition-colors flex items-center gap-1.5"
            title="Consola de Administración"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Acceso Administrativo</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
