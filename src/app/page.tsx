import Hero from "@/components/Hero";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { vestidosFiesta } from "@/lib/fiesta-data";
import ImageRotator from "@/components/ImageRotator";

const fiestaCarouselImages = [
  "/trabajos/fiesta/1. Clara Celeste  Azul Royal Frente.jpg",
  "/trabajos/fiesta/4. Rebecca Verde Sage.jpg",
  "/trabajos/fiesta/7. Estrella Plata.jpg",
  "/trabajos/fiesta/16. Camille Granate..jpg",
  "/trabajos/fiesta/23. Aliana Terracota.jpg"
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Gateway Gala & Graduacion Section */}
      <section className="py-16 md:py-24 px-6 bg-transparent relative z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* TEXT SIDE */}
            <div className="lg:col-span-6 space-y-6 lg:space-y-8 text-center lg:text-left order-2 lg:order-1 lg:pr-8">
              <div className="space-y-2 lg:space-y-3">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-sand block">Temporada 2026</span>
                <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1]">
                  Gala & <br className="hidden lg:block"/><span className="italic text-brand-sand">Graduación</span>
                </h2>
              </div>
              <div className="space-y-4 text-white/80 text-sm md:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                <p>
                  Alta costura diseñada para una noche irrepetible. Cada pieza de nuestra colección de graduación es un testimonio de artesanía meticulosa y diseño contemporáneo.
                </p>
                <p className="font-medium text-white">
                  Garantizamos exclusividad absoluta por colegio: tu vestido será único en tu fiesta.
                </p>
              </div>
              <div className="pt-4 lg:pt-6 w-full sm:w-auto flex justify-center lg:justify-start">
                <Link 
                  href="/graduacion" 
                  className="inline-flex items-center justify-center gap-3 border border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-serif text-[11px] uppercase tracking-[0.28em] font-semibold bg-white/[0.08] backdrop-blur-[10px] px-8 py-4 md:px-10 md:py-5 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:text-[#121212] hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] rounded-[1px] w-full sm:w-auto text-center whitespace-nowrap"
                >
                  Ver Catálogo Completo
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
                </Link>
              </div>
            </div>

            {/* IMAGE SIDE */}
            <Link href="/graduacion" className="group lg:col-span-6 relative rounded-sm overflow-hidden shadow-2xl border border-white/5 hover:border-white/20 transition-all duration-700 aspect-[3/4.5] order-1 lg:order-2 block">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none" />
              <div className="absolute inset-0 w-full h-full group-hover:scale-[1.03] transition-transform duration-[2000ms] ease-out">
                <ImageRotator images={fiestaCarouselImages} interval={5000} />
              </div>
            </Link>
          </div>
        </div>
      </section>





      {/* Services Section (Visual Cards Funnel) */}
      <section className="py-16 md:py-28 px-6 bg-transparent relative z-10">
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
              <Image 
                src="/trabajos/novia 2.jpeg" 
                alt="Alta Costura Personal" 
                fill
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-95 group-hover:opacity-90 transition-opacity duration-700" />
              
              <div className="relative z-10 flex flex-col items-start w-full space-y-4">
                <h3 className="font-serif text-3xl md:text-4xl text-white leading-tight">Alta Costura Personal</h3>
                <p className="text-white/70 text-sm max-w-lg leading-relaxed">
                  Piezas exclusivas creadas bajo una experiencia íntima y profundamente personalizada.
                </p>
                <div className="pt-2 w-full sm:w-auto">
                  <span className="inline-flex items-center justify-center gap-3 border border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-serif text-[11px] uppercase tracking-[0.28em] font-semibold bg-white/[0.08] backdrop-blur-[10px] px-8 py-4 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#f5f2eb]/90 group-hover:text-[#121212] group-hover:border-[#f5f2eb] group-hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] rounded-[1px] w-full sm:w-auto text-center whitespace-nowrap">
                    Reservar experiencia
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
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
                <Image 
                  src="/Estudiante.png" 
                  alt="Aprender Haciendo" 
                  fill
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] brightness-95 contrast-[1.02] saturate-[0.85] group-hover:saturate-[0.95]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-700" />
                
                <div className="relative z-10 flex flex-col items-start w-full space-y-3">
                  <h3 className="font-serif text-2xl text-white leading-tight">Aprender Haciendo</h3>
                  <p className="text-white/60 text-xs max-w-md leading-relaxed">
                    Un espacio donde el aprendizaje ocurre entre telas, pruebas y oficio real.
                  </p>
                  <div className="pt-2 w-full sm:w-auto">
                    <span className="inline-flex items-center justify-center gap-2.5 border border-white/10 border-t-white/20 border-l-white/20 border-b-white/5 border-r-white/5 text-white font-serif text-[10px] uppercase tracking-[0.28em] font-semibold bg-white/[0.04] backdrop-blur-[5px] px-6 py-3.5 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#f5f2eb]/90 group-hover:text-[#121212] group-hover:border-[#f5f2eb] rounded-[1px] w-full sm:w-auto text-center whitespace-nowrap">
                      Entrar al taller
                      <ArrowRight className="w-3 h-3 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* CARD C: Desarrollo para Marcas - CLEAN, STRUCTURED */}
              <Link 
                href="/b2b" 
                className="group relative flex-1 min-h-[350px] md:min-h-[260px] overflow-hidden rounded-sm flex flex-col justify-end p-8 shadow-2xl border border-white/5 hover:border-white/20 transition-all duration-700"
              >
                <Image 
                  src="/Desarrollo de marca 2.png" 
                  alt="Desarrollo para Marcas" 
                  fill
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] brightness-95 contrast-[1.02] saturate-[0.85] group-hover:saturate-[0.95]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-700" />
                
                <div className="relative z-10 flex flex-col items-start w-full space-y-3">
                  <h3 className="font-serif text-2xl text-white leading-tight">Producción Boutique</h3>
                  <p className="text-white/60 text-xs max-w-md leading-relaxed">
                    Desarrollo para proyectos que buscan una ejecución a la altura de su propuesta.
                  </p>
                  <div className="pt-2 w-full sm:w-auto">
                    <span className="inline-flex items-center justify-center gap-2.5 border border-white/10 border-t-white/20 border-l-white/20 border-b-white/5 border-r-white/5 text-white font-serif text-[10px] uppercase tracking-[0.28em] font-semibold bg-white/[0.04] backdrop-blur-[5px] px-6 py-3.5 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#f5f2eb]/90 group-hover:text-[#121212] group-hover:border-[#f5f2eb] rounded-[1px] w-full sm:w-auto text-center whitespace-nowrap">
                      Trabajar con ELENA
                      <ArrowRight className="w-3 h-3 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
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
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-white">Selección <br className="hidden md:block" /><span className="italic text-brand-sand">Curada</span></h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:gap-8 items-start max-w-5xl mx-auto">
            {/* Columna Izquierda */}
            <div className="flex flex-col gap-4 md:gap-8">
              {/* Imagen 1 - Dominante (Muy Alta) */}
              <div className="aspect-[3/5] relative group rounded-sm overflow-hidden bg-brand-sand/10 border border-white/5 shadow-sm hover:shadow-xl transition-all duration-500">
                <img 
                  src="/trabajos/PHOTO-2026-02-25-13-20-08.jpg" 
                  alt="Trabajo Destacado 1" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              {/* Imagen 3 - Apaisada Horizontal */}
              <div className="aspect-[4/3] relative group rounded-sm overflow-hidden bg-brand-sand/10 border border-white/5 shadow-sm hover:shadow-xl transition-all duration-500">
                <img 
                  src="/trabajos/PHOTO-2026-02-25-13-20-10.jpg" 
                  alt="Trabajo Destacado 3" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="flex flex-col gap-4 md:gap-8">
              {/* Imagen 2 - Cuadrada */}
              <div className="aspect-[1/1] relative group rounded-sm overflow-hidden bg-brand-sand/10 border border-white/5 shadow-sm hover:shadow-xl transition-all duration-500">
                <img 
                  src="/trabajos/PHOTO-2026-02-25-13-20-09.jpg" 
                  alt="Trabajo Destacado 2" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Imagen 4 - Mediana Alta */}
              <div className="aspect-[3/4.25] relative group rounded-sm overflow-hidden bg-brand-sand/10 border border-white/5 shadow-sm hover:shadow-xl transition-all duration-500">
                <img 
                  src="/trabajos/PHOTO-2026-02-25-13-20-11.jpg" 
                  alt="Trabajo Destacado 4" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
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

      {/* Community Registration Section */}
      <section className="py-24 bg-brand-charcoal px-6 relative z-10 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-sand block mb-4 md:mb-6">Exclusividad Atelier</span>
            <h2 className="font-serif text-4xl md:text-6xl text-white">Únete a nuestra <br/><span className="italic text-brand-sand">comunidad privada</span></h2>
            <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Accede a pruebas privadas, beneficios exclusivos y una experiencia más cercana dentro del atelier.
            </p>
            <div className="pt-4">
                <Link 
                    href="/registro"
                    className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] max-w-full"
                >
                    <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] text-center">
                        Solicitar acceso
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
                    </span>
                </Link>
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest pt-4">Acceso reservado para miembros ELENA</p>
        </div>
      </section>
 
      {/* Location / Final CTA Section */}
      <section className="py-16 md:py-32 bg-transparent px-6 border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 space-y-6 md:space-y-8 w-full">
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-center md:text-left text-white">Ven a tomarte un <br className="hidden md:block" /><span className="italic text-brand-sand">café a mi taller</span></h2>
            <div className="space-y-4 font-sans text-white/80 text-center md:text-left">
              <p className="text-sm md:text-base">
                Mi taller siempre tiene las puertas abiertas. <br className="hidden md:block" />
                Ven a conversar, ajustar una prenda o comenzar algo nuevo juntas.
              </p>
            </div>
          </div>


          <div className="flex-1 w-full space-y-8">
            <div className="h-[300px] md:h-[500px] w-full rounded-sm overflow-hidden relative shadow-2xl">
              <Image
                src="/elena-torso.jpeg"
                alt="Elena La Costurera torso"
                fill
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            </div>
            
            {/* Botón entre Dirección e Imagen */}
            <div className="flex justify-center md:justify-start pt-2">
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

            {/* Dirección */}
            <div className="pt-8 md:pt-10 space-y-1 font-sans text-center md:text-left text-white/70 font-light text-sm md:text-base leading-relaxed">
              <p className="text-white">Vitacura, Santiago</p>
              <a 
                href="https://maps.google.com/?q=Av.+Tabancura+1091,+Oficina+319,+Vitacura,+Santiago" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/60 hover:text-brand-terracotta transition-colors duration-300 inline-flex items-center gap-1.5 justify-center md:justify-start group"
              >
                <span>Av. Tabancura 1091 · Of. 319</span>
                <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:text-brand-terracotta transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

