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
            <h3 className="font-serif text-xl md:text-2xl font-bold uppercase tracking-wide group-hover:text-brand-terracotta transition-colors">Reparaciones, Ajustes</h3>
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              Más que ajustes, cuidamos tu ropa. Restauramos tus prendas favoritas en nuestro taller de Vitacura para que vuelvan a ser parte de tu día a día.
            </p>
          </Link>
          <Link href="/sastreria" className="space-y-6 group cursor-pointer block">
            <span className="text-brand-terracotta font-serif text-3xl md:text-4xl block">02</span>
            <h3 className="font-serif text-xl md:text-2xl font-bold uppercase tracking-wide group-hover:text-brand-terracotta transition-colors">Diseño y Confección</h3>
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              Confección a medida con alma Wabi-Sabi. Diseñamos prendas únicas desde cero, entendiendo tu calce y estilo de vida para crear inversiones duraderas.
            </p>
          </Link>
          <Link href="/b2b" className="space-y-6 group cursor-pointer block">
            <span className="text-brand-terracotta font-serif text-3xl md:text-4xl block">03</span>
            <h3 className="font-serif text-xl md:text-2xl font-bold uppercase tracking-wide group-hover:text-brand-terracotta transition-colors">Laboratorio de Lujo y Alianzas</h3>
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              Desde colaboraciones con firmas de vanguardia en París hasta el apoyo a jóvenes talentos. Mi taller funciona como un hub de diseño de puertas abiertas.
            </p>
          </Link>
        </div>
      </section>

      {/* Portfolio Preview Section */}
      <section className="py-20 bg-brand-sand/10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-terracotta block mb-4">Archivo Histórico</span>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight">Portafolio <br /><span className="italic">Destacado</span></h2>
            </div>
            <Link
              href="/portafolio"
              className="inline-block border-b border-brand-charcoal pb-1 text-sm uppercase tracking-widest font-bold hover:text-brand-terracotta hover:border-brand-terracotta transition-colors"
            >
              Ver Galería Completa
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </div>
      </section>

      {/* Elena's Story Section */}
      <section className="py-20 md:py-32 bg-brand-sand/30 border-t border-brand-sand overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            <div className="lg:col-span-5 relative h-[500px] lg:h-[700px] rounded-sm overflow-hidden shadow-xl">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/Sevali.MOV" type="video/mp4" />
                Tu navegador no soporta el formato de video.
              </video>
              <div className="absolute inset-0 bg-brand-charcoal/5 pointer-events-none" />
            </div>
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-terracotta block">La Fuerza Creativa</span>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-8">Elena Rojas: De la vocación <br className="hidden md:block"/><span className="italic">a la alta costura</span></h2>
              <div className="space-y-6 text-text-secondary text-sm md:text-base leading-relaxed">
                  <p>
                    Mi historia es un relato de resiliencia y maestría en el oficio textil. De orígenes humildes, comencé mi trayectoria cosiendo desde mi propia casa como una forma de apoyar económicamente a mi familia. Con determinación, ingresé a estudiar diseño de vestuario cuando ya era madre de cuatro niños.
                  </p>
                  <p>
                    A lo largo de mi carrera, y caracterizándome siempre por la transparencia, he logrado ganarme la confianza de figuras influyentes de la escena cultural, política y empresarial de Chile. Al convertirme en su costurera y diseñadora personal, mi trabajo cobró una nueva dimensión, destacando por un nivel de personalización impecable que me llevó a participar en desfiles exclusivos y a ser galardonada con premios internacionales.
                  </p>
                  <p>
                    He colaborado con firmas de vanguardia como SEVALI, reconocida mundialmente en París por su revolucionaria práctica de la <em>upcycled couture</em> (alta costura suprarreciclada) y la deconstrucción de prendas.
                  </p>
                  <p>
                    Hoy, mi espacio de trabajo ha evolucionado hasta convertirse en un verdadero hub de diseño. En este espacio de puertas abiertas, junto a mi equipo dejo volar la creatividad, ajustando cada prenda "puntada a puntada", dignificando el trabajo hecho a mano y acogiendo tanto a clientes como a jóvenes estudiantes que buscan <em>expertise</em>.
                  </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location / GEO Section */}
      <section className="py-20 md:py-32 bg-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
          <div className="flex-1 space-y-8 w-full">
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-center md:text-left">Mi Taller <br className="hidden md:block" />en Vitacura</h2>
            <div className="space-y-4 font-sans text-text-secondary text-center md:text-left">
              <p className="text-lg md:text-xl text-brand-charcoal font-medium">Av. Tabancura 1091, Of. 319 <br/>Vitacura (Esquina Las Condes)</p>
              <p className="text-sm md:text-base">Un espacio abierto donde la tradición y el diseño se encuentran. Ven a conocerme para reparar tus prendas favoritas o diseñar algo desde cero. Cada visita a mi taller es el inicio de una prenda que durará toda la vida.</p>
              <p className="text-xs md:text-sm">Lunes a Viernes: 10:00 - 19:00 <br />Sábados: Con cita previa</p>
            </div>
            <div className="flex justify-center md:justify-start">
              <Link
                href="/appointment"
                className="w-full md:w-auto bg-brand-charcoal text-white px-10 py-4 rounded-sm hover:bg-brand-terracotta transition-all uppercase tracking-widest text-xs font-medium text-center flex items-center justify-center"
              >
                Habla con Elena
              </Link>
            </div>
          </div>
          <div className="flex-1 h-[350px] md:h-[500px] w-full rounded-sm overflow-hidden relative shadow-2xl">
            <img
              src="/elena-taller.png"
              alt="Elena La Costurera en su Taller"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
