import Hero from "@/components/Hero";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />



      {/* Elena's Story Section - Condensed for conversion */}
      <section className="py-16 md:py-32 bg-transparent text-white overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-20 items-center">
            <div className="lg:col-span-5 relative rounded-sm overflow-hidden shadow-2xl">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto opacity-90"
              >
                <source src="/Sevali.MOV" type="video/mp4" />
                Tu navegador no soporta el formato de video.
              </video>
            </div>
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="text-[10px] uppercase tracking-[0.45em] font-medium text-brand-sand block">Elena Rojas Bustamante</span>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6 md:mb-8">Del living de casa a <br className="hidden md:block"/><span className="italic text-brand-sand">las pasarelas de París</span></h2>
              <div className="space-y-4 text-white/80 text-sm md:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  <p>
                    Mi historia es la evolución del oficio textil real. Empecé en el living de mi casa, dominando las bases de la costura técnica a fuerza de constancia. Esa precisión manual y la transparencia de mi trabajo rompieron fronteras, llevándome a colaborar desde Chile con la marca de vanguardia SEVALI en Francia y en proyectos con Levi's, además de recibir invitaciones a los Fashion Weeks de Nueva York y París.
                  </p>
                  <p>
                    Hoy, el epicentro de esa maestría está en Vitacura. En nuestro Hub de Diseño sigo trabajando con la misma rigurosidad técnica y el corazón de siempre, recibiendo a cada cliente con un café y la dedicación exclusiva que define a nuestra comunidad.
                  </p>
              </div>
            </div>
          </div>
        </div>
      </section>
 
      {/* Services Section (Visual Cards Funnel) */}
      <section className="py-16 px-6 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <Link href="/restauracion" className="group relative h-[380px] overflow-hidden rounded-sm flex flex-col justify-end p-6 shadow-sm hover:shadow-xl transition-shadow duration-500 border border-transparent hover:border-white/10">
              <img src="/trabajos/PHOTO-2026-02-25-13-20-13.jpg" alt="Reparaciones" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-90" />
              <div className="relative z-10 flex flex-col items-start w-full">
                <span className="text-brand-sand font-sans text-[10px] tracking-[0.2em] uppercase font-bold mb-2">01</span>
                <h3 className="font-serif text-2xl text-white mb-2">Ajustes y Restauración</h3>
                <p className="text-white/80 text-sm mb-6 line-clamp-2">Le doy nueva vida y el calce perfecto a tus prendas favoritas.</p>
                <span className="border border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] px-6 py-3.5 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#f5f2eb]/90 group-hover:text-[#121212] group-hover:border-[#f5f2eb] group-hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] rounded-[1px] w-full text-center whitespace-nowrap">Agendar Ajuste</span>
              </div>
            </Link>
 
            <Link href="/sastreria" className="group relative h-[380px] overflow-hidden rounded-sm flex flex-col justify-end p-6 shadow-sm hover:shadow-xl transition-shadow duration-500 border border-transparent hover:border-white/10">
              <img src="/trabajos/PHOTO-2026-02-25-13-20-09.jpg" alt="Confección" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-90" />
              <div className="relative z-10 flex flex-col items-start w-full">
                <span className="text-brand-sand font-sans text-[10px] tracking-[0.2em] uppercase font-bold mb-2">02</span>
                <h3 className="font-serif text-2xl text-white mb-2">Diseño a Medida</h3>
                <p className="text-white/80 text-sm mb-6 line-clamp-2">Confección desde cero, pensada y estructurada para tu cuerpo.</p>
                <span className="border border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] px-6 py-3.5 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#f5f2eb]/90 group-hover:text-[#121212] group-hover:border-[#f5f2eb] group-hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] rounded-[1px] w-full text-center whitespace-nowrap">Cotizar Confección</span>
              </div>
            </Link>
 
            <Link href="/b2b" className="group relative h-[380px] overflow-hidden rounded-sm flex flex-col justify-end p-6 shadow-sm hover:shadow-xl transition-shadow duration-500 border border-transparent hover:border-white/10">
              <img src="/trabajos/PHOTO-2026-02-25-13-20-14.jpg" alt="Colaboraciones" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-90" />
              <div className="relative z-10 flex flex-col items-start w-full">
                <span className="text-brand-sand font-sans text-[10px] tracking-[0.2em] uppercase font-bold mb-2">03</span>
                <h3 className="font-serif text-2xl text-white mb-2">Colaboraciones</h3>
                <p className="text-white/80 text-sm mb-6 line-clamp-2">Colecciones cápsula, alianzas artísticas y mentoría en mi taller.</p>
                <span className="border border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] px-6 py-3.5 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#f5f2eb]/90 group-hover:text-[#121212] group-hover:border-[#f5f2eb] group-hover:shadow-[0_0_15px_rgba(255,255,255,0.12)] rounded-[1px] w-full text-center whitespace-nowrap">Ver Proyectos</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio Preview Section */}
      <section className="py-16 md:py-32 bg-transparent px-6 relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12 gap-4 md:gap-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-sand block mb-3 md:mb-4">Archivo Histórico</span>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight text-white">Portafolio <br className="hidden md:block" /><span className="italic text-brand-sand">Destacado</span></h2>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link
                href="/portafolio"
                className="inline-block border-b border-white/50 pb-1 text-sm uppercase tracking-widest font-bold hover:text-brand-sand hover:border-brand-sand transition-all duration-300 text-white"
              >
                Ver Galería Completa
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {['PHOTO-2026-02-25-13-20-08.jpg', 'PHOTO-2026-02-25-13-20-09.jpg', 'PHOTO-2026-02-25-13-20-10.jpg', 'PHOTO-2026-02-25-13-20-11.jpg'].map((img, idx) => (
              <div key={idx} className="aspect-[3/4] relative group rounded-sm overflow-hidden bg-brand-sand shadow-sm hover:shadow-xl transition-all duration-500">
                <img 
                  src={`/trabajos/${img}`} 
                  alt={`Trabajo Destacado ${idx + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
          
          <div className="mt-16 flex justify-center">
             <Link
                href="/appointment"
                className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] max-w-full"
              >
                <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] text-center">
                  ¿Hacemos algo juntas? Escríbeme
                  <svg 
                    className="w-3.5 h-3.5 stroke-white group-hover:stroke-[#121212] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform group-hover:translate-x-1 flex-shrink-0" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
          </div>
        </div>
      </section>
 
      {/* Community Registration Section */}
      <section className="py-24 bg-brand-charcoal px-6 relative z-10 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-sand">Exclusividad Atelier</span>
            <h2 className="font-serif text-4xl md:text-6xl text-white">Únete a nuestra <br/><span className="italic text-brand-sand">comunidad privada</span></h2>
            <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Regístrate para agilizar tus futuras órdenes, recibir invitaciones a pruebas exclusivas y obtener beneficios personalizados según tu estilo.
            </p>
            <div className="pt-4">
                <Link 
                    href="/registro"
                    className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] max-w-full"
                >
                    <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] text-center">
                        Crear mi Perfil de Clienta
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
                    </span>
                </Link>
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest pt-4">Integración automática con nuestro sistema de taller</p>
        </div>
      </section>
 
      {/* Location / Final CTA Section */}
      <section className="py-16 md:py-32 bg-transparent px-6 border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 space-y-6 md:space-y-8 w-full">
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-center md:text-left text-white">Ven a tomarte un <br className="hidden md:block" /><span className="italic text-brand-sand">café a mi taller</span></h2>
            <div className="space-y-4 font-sans text-white/80 text-center md:text-left">
              <p className="text-lg md:text-xl text-white font-medium">Av. Tabancura 1091, Of. 319 <br/>Vitacura (Esquina Las Condes)</p>
              <p className="text-sm md:text-base">Mi espacio siempre tiene las puertas abiertas. Ven a conocerme para reparar esa prenda que tanto quieres o para que diseñemos algo nuevo desde cero. Me encantaría escucharte.</p>
              <p className="text-xs md:text-sm font-medium text-white/50">Lunes a Viernes: 10:00 - 19:00 <br />Sábados: Con cita previa</p>
            </div>
            <div className="flex justify-center md:justify-start pt-4">
              <Link
                href="/appointment"
                className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] w-full md:w-auto max-w-full"
              >
                <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] text-center">
                  Agenda tu visita
                  <svg 
                    className="w-3.5 h-3.5 stroke-white group-hover:stroke-[#121212] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform group-hover:translate-x-1 flex-shrink-0" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>


          <div className="flex-1 h-[300px] md:h-[500px] w-full rounded-sm overflow-hidden relative shadow-2xl">
            <img
              src="/Elena%20basos%20cruzados.jpeg"
              alt="Elena La Costurera de brazos cruzados"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}

