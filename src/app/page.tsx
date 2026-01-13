import Hero from "@/components/Hero";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Value Proposition Section */}
      <section className="py-20 md:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16 md:gap-24">
          <Link href="/restauracion" className="space-y-6 group cursor-pointer block">
            <span className="text-brand-terracotta font-serif text-3xl md:text-4xl block">01</span>
            <h3 className="font-serif text-xl md:text-2xl group-hover:text-brand-terracotta transition-colors">Expertos en arreglos</h3>
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              Transformamos vestidos de gala y prendas favoritas en piezas de calce impecable. Nuestra restauración técnica preserva la elegancia de cada fibra con maestría artesanal.
            </p>
          </Link>
          <Link href="/sastreria" className="space-y-6 group cursor-pointer block">
            <span className="text-brand-terracotta font-serif text-3xl md:text-4xl block">02</span>
            <h3 className="font-serif text-xl md:text-2xl group-hover:text-brand-terracotta transition-colors">Alta Costura & Gala</h3>
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              Confección exclusiva de vestidos y piezas de noche que priorizan su elegancia y comodidad. Diseños trazables que representan una inversión real en su estilo personal.
            </p>
          </Link>
          <Link href="/b2b" className="space-y-6 group cursor-pointer block">
            <span className="text-brand-terracotta font-serif text-3xl md:text-4xl block">03</span>
            <h3 className="font-serif text-xl md:text-2xl group-hover:text-brand-terracotta transition-colors">Producción Ética</h3>
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              Colaboramos con boutiques locales para fabricar lotes pequeños (Small Batch), reduciendo el desperdicio textil y garantizando artesanía de alto nivel en Chile.
            </p>
          </Link>
        </div>
      </section>

      {/* Slow Fashion / Sustainability Section */}
      <section className="py-20 bg-white border-t border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative h-[400px] rounded-sm overflow-hidden">
              <img
                src="/assets/media/restauracion_vestido.png"
                alt="Detalle de costura a mano"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-brand-charcoal/20" />
            </div>
            <div className="order-1 lg:order-2 space-y-8 text-center lg:text-left">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-terracotta block">Manifiesto Slow Fashion</span>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight">No lo botes, <br /><span className="italic">renuévalo</span></h2>
              <p className="text-text-secondary text-lg leading-relaxed">
                En un mundo saturado de moda desechable, en Elena Atelier creemos que reparar es el acto más sostenible. La verdadera elegancia reside en la durabilidad y en el respeto por las piezas que ya amamos.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 pt-4">
                <div className="space-y-2">
                  <h4 className="font-serif text-xl">Transparencia Radical</h4>
                  <p className="text-xs text-text-secondary uppercase tracking-widest">Taller abierto a la comunidad</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif text-xl">Artesanía de Oficio</h4>
                  <p className="text-xs text-text-secondary uppercase tracking-widest">Hecho a mano en Vitacura</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location / GEO Section */}
      <section className="py-20 md:py-32 bg-brand-sand/50 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
          <div className="flex-1 space-y-8 w-full">
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-center md:text-left">Expertise local <br className="hidden md:block" />en Vitacura</h2>
            <div className="space-y-4 font-sans text-text-secondary text-center md:text-left">
              <p className="text-lg md:text-xl text-brand-charcoal">Av. Tabancura 1091, Santiago, Chile</p>
              <p className="text-sm md:text-base">Nuestro estudio combina la tradición manual con trazabilidad digital. Venga a conocer el proceso detrás de cada costura.</p>
              <p className="text-xs md:text-sm">Lunes a Viernes: 10:00 - 19:00 <br />Sábados: Con cita previa</p>
            </div>
            <div className="flex justify-center md:justify-start">
              <Link
                href="/appointment"
                className="w-full md:w-auto bg-brand-charcoal text-white px-10 py-4 rounded-sm hover:bg-brand-terracotta transition-all uppercase tracking-widest text-xs font-medium text-center flex items-center justify-center"
              >
                Agendar Visita
              </Link>
            </div>
          </div>
          <div className="flex-1 h-[350px] md:h-[500px] w-full rounded-sm overflow-hidden relative shadow-2xl">
            <img
              src="/assets/media/showroom_main.png"
              alt="Elena Atelier Showroom Vitacura"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
