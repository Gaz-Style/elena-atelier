import Hero from "@/components/Hero";
import Link from "next/link";

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
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-terracotta block">Elena Rojas Bustamante</span>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6 md:mb-8">De coser en casa a <br className="hidden md:block"/><span className="italic text-brand-sand">colaborar en París</span></h2>
              <div className="space-y-4 text-white/80 text-sm md:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  <p>
                    Mi historia siempre ha estado ligada al esfuerzo y al amor por los hilos. Empecé cosiendo en el living de mi casa para apoyar a mi familia y criar a mis cuatro hijos. La vida, y el trabajo hecho con transparencia, me llevó a lugares que nunca imaginé, como trabajar con la marca SEVALI en Francia.
                  </p>
                  <p>
                    Pero hoy sigo siendo la misma Elena. En mi taller de Vitacura sigo trabajando con las manos y el corazón, recibiendo a mis clientas con un café y la misma dedicación de siempre.
                  </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/sobre-mi"
                  className="inline-block border border-white text-white px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-brand-charcoal transition-colors"
                >
                  Lee mi historia completa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section (Visual Cards Funnel) */}
      <section className="py-16 px-6 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <Link href="/restauracion" className="group relative h-[380px] overflow-hidden rounded-sm flex flex-col justify-end p-6 shadow-sm hover:shadow-xl transition-shadow duration-500 border border-transparent hover:border-brand-terracotta/30">
              <img src="/trabajos/PHOTO-2026-02-25-13-20-13.jpg" alt="Reparaciones" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-90" />
              <div className="relative z-10 flex flex-col items-start">
                <span className="text-brand-terracotta font-sans text-[10px] tracking-[0.2em] uppercase font-bold mb-2">01</span>
                <h3 className="font-serif text-2xl text-white mb-2">Ajustes y Restauración</h3>
                <p className="text-white/80 text-sm mb-6 line-clamp-2">Le doy nueva vida y el calce perfecto a tus prendas favoritas.</p>
                <span className="border border-white/50 text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold group-hover:border-brand-terracotta group-hover:bg-brand-terracotta group-hover:text-white transition-all w-full text-center">Agendar Ajuste</span>
              </div>
            </Link>

            <Link href="/sastreria" className="group relative h-[380px] overflow-hidden rounded-sm flex flex-col justify-end p-6 shadow-sm hover:shadow-xl transition-shadow duration-500 border border-transparent hover:border-brand-terracotta/30">
              <img src="/trabajos/PHOTO-2026-02-25-13-20-09.jpg" alt="Confección" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-90" />
              <div className="relative z-10 flex flex-col items-start">
                <span className="text-brand-terracotta font-sans text-[10px] tracking-[0.2em] uppercase font-bold mb-2">02</span>
                <h3 className="font-serif text-2xl text-white mb-2">Diseño a Medida</h3>
                <p className="text-white/80 text-sm mb-6 line-clamp-2">Confección desde cero, pensada y estructurada para tu cuerpo.</p>
                <span className="border border-white/50 text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold group-hover:border-brand-terracotta group-hover:bg-brand-terracotta group-hover:text-white transition-all w-full text-center">Cotizar Confección</span>
              </div>
            </Link>

            <Link href="/b2b" className="group relative h-[380px] overflow-hidden rounded-sm flex flex-col justify-end p-6 shadow-sm hover:shadow-xl transition-shadow duration-500 border border-transparent hover:border-brand-terracotta/30">
              <img src="/trabajos/PHOTO-2026-02-25-13-20-14.jpg" alt="Colaboraciones" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-90" />
              <div className="relative z-10 flex flex-col items-start">
                <span className="text-brand-terracotta font-sans text-[10px] tracking-[0.2em] uppercase font-bold mb-2">03</span>
                <h3 className="font-serif text-2xl text-white mb-2">Colaboraciones</h3>
                <p className="text-white/80 text-sm mb-6 line-clamp-2">Colecciones cápsula, alianzas artísticas y mentoría en mi taller.</p>
                <span className="border border-white/50 text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold group-hover:border-brand-terracotta group-hover:bg-brand-terracotta group-hover:text-white transition-all w-full text-center">Ver Proyectos</span>
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
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-terracotta block mb-3 md:mb-4">Archivo Histórico</span>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight text-white">Portafolio <br className="hidden md:block" /><span className="italic text-brand-sand">Destacado</span></h2>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link
                href="/portafolio"
                className="inline-block border-b border-white/50 pb-1 text-sm uppercase tracking-widest font-bold hover:text-brand-terracotta hover:border-brand-terracotta transition-colors text-white"
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
                className="border border-white/50 text-white px-10 py-4 rounded-sm hover:bg-brand-terracotta hover:border-brand-terracotta transition-all uppercase tracking-widest text-xs font-bold text-center inline-block"
              >
                ¿Hacemos algo juntas? Escríbeme
              </Link>
          </div>
        </div>
      </section>

      {/* Location / Final CTA Section */}
      <section className="py-16 md:py-32 bg-transparent px-6 border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 space-y-6 md:space-y-8 w-full">
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-center md:text-left text-white">Ven a tomarte un <br className="hidden md:block" /><span className="italic text-brand-terracotta">café a mi taller</span></h2>
            <div className="space-y-4 font-sans text-white/80 text-center md:text-left">
              <p className="text-lg md:text-xl text-white font-medium">Av. Tabancura 1091, Of. 319 <br/>Vitacura (Esquina Las Condes)</p>
              <p className="text-sm md:text-base">Mi espacio siempre tiene las puertas abiertas. Ven a conocerme para reparar esa prenda que tanto quieres o para que diseñemos algo nuevo desde cero. Me encantaría escucharte.</p>
              <p className="text-xs md:text-sm font-medium text-white/50">Lunes a Viernes: 10:00 - 19:00 <br />Sábados: Con cita previa</p>
            </div>
            <div className="flex justify-center md:justify-start pt-4">
              <Link
                href="/appointment"
                className="w-full md:w-auto border border-white/50 text-white px-12 py-5 rounded-sm hover:bg-brand-terracotta hover:border-brand-terracotta transition-all uppercase tracking-widest text-sm font-bold text-center flex items-center justify-center gap-2"
              >
                Agenda tu visita
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </div>
          <div className="flex-1 h-[300px] md:h-[500px] w-full rounded-sm overflow-hidden relative shadow-2xl">
            <img
              src="/elena-taller.png"
              alt="Elena La Costurera en su Taller"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}

