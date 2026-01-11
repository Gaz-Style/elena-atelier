import Hero from "@/components/Hero";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Value Proposition Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-24">
          <Link href="/restauracion" className="space-y-6 group cursor-pointer block">
            <span className="text-brand-terracotta font-serif text-4xl block">01</span>
            <h3 className="font-serif text-2xl group-hover:text-brand-terracotta transition-colors">Elevamos Inversiones</h3>
            <p className="text-text-secondary leading-relaxed">
              Transformamos prendas favoritas en tesoros de calce impecable. Nuestra restauración técnica extiende la vida útil de cada fibra con maestría artesanal.
            </p>
          </Link>
          <Link href="/sastreria" className="space-y-6 group cursor-pointer block">
            <span className="text-brand-terracotta font-serif text-4xl block">02</span>
            <h3 className="font-serif text-2xl group-hover:text-brand-terracotta transition-colors">Sastrería Consciente</h3>
            <p className="text-text-secondary leading-relaxed">
              Confección a medida que prioriza la calidad sobre la tendencia. Creamos piezas esenciales, éticas y trazables que representan una inversión real en su armario.
            </p>
          </Link>
          <div className="space-y-6">
            <span className="text-brand-terracotta font-serif text-4xl block">03</span>
            <h3 className="font-serif text-2xl">Producción Responsable</h3>
            <p className="text-text-secondary leading-relaxed">
              Colaboramos con boutiques locales para fabricar lotes pequeños, reduciendo el desperdicio y garantizando un pago justo por artesanía de alto nivel.
            </p>
          </div>
        </div>
      </section>

      {/* Location / GEO Section */}
      <section className="py-32 bg-brand-sand/50 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="font-serif text-5xl leading-tight">Expertise local <br />en Vitacura</h2>
            <div className="space-y-4 font-sans text-text-secondary">
              <p className="text-xl text-brand-charcoal">Av. Tabancura 1091, Santiago, Chile</p>
              <p>Nuestro estudio combina la tradición manual con trazabilidad digital. Venga a conocer el proceso detrás de cada costura.</p>
              <p className="text-sm">Lunes a Viernes: 10:00 - 19:00 <br />Sábados: Con cita previa</p>
            </div>
            <button className="bg-brand-charcoal text-white px-10 py-4 rounded-sm hover:bg-brand-terracotta transition-all uppercase tracking-widest text-xs font-medium">
              Agendar Visita
            </button>
          </div>
          <div className="flex-1 h-[500px] w-full rounded-sm overflow-hidden relative shadow-2xl">
            <img
              src="/assets/media/elena_atelier_vitacura_showroom.png"
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
