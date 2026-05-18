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
              <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6 md:mb-8">El oficio detrás <br className="hidden md:block"/><span className="italic text-brand-sand">de ELENA</span></h2>
              <div className="space-y-4 text-white/80 text-sm md:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  <p>
                    Empecé en el living de mi casa, entre arreglos, pruebas y horas aprendiendo a escuchar lo que cada prenda necesitaba. Con el tiempo, esa dedicación y la precisión de mi trabajo me llevaron a colaborar desde Chile en proyectos vinculados a pasarela, vestuario y diseño contemporáneo, participando en experiencias que expandieron mi manera de entender el oficio textil.
                  </p>
                  <p>
                    Hoy, desde mi atelier en Vitacura, sigo trabajando con la misma cercanía y dedicación de siempre. Cada ajuste, restauración o pieza a medida nace desde la idea de que la costura no solo transforma prendas, sino también la forma en que una persona se siente al habitarlas.
                  </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section (Visual Cards Funnel) */}
      <section className="py-16 md:py-28 px-6 bg-transparent relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-brand-sand block mb-4">Estructura Creativa</span>
            <h2 className="font-serif text-4xl md:text-6xl text-white tracking-tight uppercase">
              Tres formas <br className="md:hidden" />
              <span className="italic text-brand-sand font-serif normal-case tracking-normal">de habitar ELENA</span>
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
            {/* CARD A: Alta Costura Personal - DOMINANT, CINEMATIC */}
            <Link 
              href="/sastreria" 
              className="group relative flex-[1.4] min-h-[500px] md:min-h-[560px] overflow-hidden rounded-sm flex flex-col justify-end p-8 md:p-12 shadow-2xl border border-white/5 hover:border-white/20 transition-all duration-700"
            >
              <img 
                src="/trabajos/novia 2.jpeg" 
                alt="Alta Costura Personal" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-95 group-hover:opacity-90 transition-opacity duration-700" />
              
              <div className="relative z-10 flex flex-col items-start w-full space-y-4">
                <h3 className="font-serif text-3xl md:text-4xl text-white leading-tight">Alta Costura Personal</h3>
                <p className="text-white/70 text-sm max-w-lg leading-relaxed">
                  Piezas exclusivas creadas bajo una experiencia íntima y profundamente personalizada.
                </p>
                <div className="pt-2 w-full sm:w-auto">
                  <span className="inline-flex border border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] px-8 py-4 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#f5f2eb]/90 group-hover:text-[#121212] group-hover:border-[#f5f2eb] group-hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] rounded-[1px] w-full sm:w-auto text-center justify-center items-center whitespace-nowrap">
                    Reservar experiencia
                  </span>
                </div>
              </div>
            </Link>

            {/* Dynamic Column for Card B & Card C */}
            <div className="flex-[1] flex flex-col gap-8 md:gap-12">
              {/* CARD B: Del Boceto a la Prenda - WORKSPACE, PROCESS */}
              <Link 
                href="/appointment" 
                className="group relative flex-1 min-h-[350px] md:min-h-[260px] overflow-hidden rounded-sm flex flex-col justify-end p-8 shadow-2xl border border-white/5 hover:border-white/20 transition-all duration-700"
              >
                <img 
                  src="/Estudiante.png" 
                  alt="Del Boceto a la Prenda" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] brightness-95 contrast-[1.02] saturate-[0.85] group-hover:saturate-[0.95]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-700" />
                
                <div className="relative z-10 flex flex-col items-start w-full space-y-3">
                  <h3 className="font-serif text-2xl text-white leading-tight">Del Boceto a la Prenda</h3>
                  <p className="text-white/60 text-xs max-w-md leading-relaxed">
                    Acompañamiento técnico y desarrollo para transformar ideas creativas en realidad.
                  </p>
                  <div className="pt-2 w-full sm:w-auto">
                    <span className="inline-flex border border-white/10 border-t-white/20 border-l-white/20 border-b-white/5 border-r-white/5 text-white font-sans text-[9px] uppercase tracking-[0.25em] font-semibold bg-white/[0.04] backdrop-blur-[5px] px-6 py-3.5 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#f5f2eb]/90 group-hover:text-[#121212] group-hover:border-[#f5f2eb] rounded-[1px] w-full sm:w-auto text-center justify-center items-center whitespace-nowrap">
                      Entrar al taller
                    </span>
                  </div>
                </div>
              </Link>

              {/* CARD C: Desarrollo para Marcas - CLEAN, STRUCTURED */}
              <Link 
                href="/b2b" 
                className="group relative flex-1 min-h-[350px] md:min-h-[260px] overflow-hidden rounded-sm flex flex-col justify-end p-8 shadow-2xl border border-white/5 hover:border-white/20 transition-all duration-700"
              >
                <img 
                  src="/Desarrollo de marca 2.png" 
                  alt="Desarrollo para Marcas" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] brightness-95 contrast-[1.02] saturate-[0.85] group-hover:saturate-[0.95]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-700" />
                
                <div className="relative z-10 flex flex-col items-start w-full space-y-3">
                  <h3 className="font-serif text-2xl text-white leading-tight">Producción Boutique</h3>
                  <p className="text-white/60 text-xs max-w-md leading-relaxed">
                    Desarrollo para proyectos que buscan una ejecución a la altura de su propuesta.
                  </p>
                  <div className="pt-2 w-full sm:w-auto">
                    <span className="inline-flex border border-white/10 border-t-white/20 border-l-white/20 border-b-white/5 border-r-white/5 text-white font-sans text-[9px] uppercase tracking-[0.25em] font-semibold bg-white/[0.04] backdrop-blur-[5px] px-6 py-3.5 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#f5f2eb]/90 group-hover:text-[#121212] group-hover:border-[#f5f2eb] rounded-[1px] w-full sm:w-auto text-center justify-center items-center whitespace-nowrap">
                      Trabajar con ELENA
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Preview Section */}
      <section className="py-16 md:py-32 bg-transparent px-6 relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center md:text-left mb-10 md:mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-sand block mb-3 md:mb-4">Archivo Elena</span>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-white">Portafolio <br className="hidden md:block" /><span className="italic text-brand-sand">Destacado</span></h2>
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
                href="/portafolio"
                className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] max-w-full"
              >
                <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] text-center">
                  Entrar al Archivo
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

