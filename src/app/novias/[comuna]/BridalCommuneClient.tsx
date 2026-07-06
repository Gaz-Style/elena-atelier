'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  MapPin, 
  Star, 
  Scissors, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface BridalCommuneClientProps {
  comuna: string;
}

const NUPCIAL_STYLES = [
  {
    id: 'sirena-encaje',
    name: 'Sirena Nupcial',
    description: 'Ajuste perfecto que esculpe la silueta, confeccionado en crepé pesado de seda con una deslumbrante espalda descubierta en encaje Chantilly francés.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800', // Elegante
    tag: 'Colección Clásica',
    features: ['Encaje Chantilly bordado', 'Cola real de 1.5 metros', 'Botones de perla forrados']
  },
  {
    id: 'mikado-princesa',
    name: 'Mikado Majestuoso',
    description: 'Silueta princesa estructurada con faldón amplio de pliegues profundos en Mikado noble y bolsillos ocultos para un aire contemporáneo.',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800', // Volumen
    tag: 'Alta Estructura',
    features: ['Corsetería interna de alta gama', 'Faldón con bolsillos funcionales', 'Brillo satinado premium']
  },
  {
    id: 'upcycling-novia',
    name: 'Upcycling Heredado',
    description: 'Transformamos el vestido de novia de tu madre o abuela. Conservamos la carga emocional y restauramos las fibras para adaptarlo a tu estilo.',
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=800', // Vintage
    tag: 'Taller Sostenible',
    features: ['Restauración de hilos antiguos', 'Modernización de corte y silueta', 'Herencia familiar única']
  },
  {
    id: 'boho-flotante',
    name: 'Boho de Gasa',
    description: 'Silueta A-Line ligera y fluida en gasa de seda que flota al caminar, ideal para bodas al aire libre o de día.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800', // Bohemio
    tag: 'Aire Libre / Playa',
    features: ['Gasa de seda italiana ultraligera', 'Detalles en encaje guipur', 'Espalda con tirantes cruzados']
  }
];

const NUPCIAL_FABRICS = [
  {
    name: 'Mikado de Seda',
    type: 'Cuerpo, estructura & brillo regio',
    description: 'Una tela gruesa con un brillo mate satinado ideal para faldones estructurados y corpiños con pliegues esculturales.',
    colorClass: 'bg-[#faf6f0]'
  },
  {
    name: 'Encaje Chantilly Francés',
    type: 'Transparencias delicadas & bordados',
    description: 'El encaje nupcial por excelencia, suave al tacto y con patrones florales finos tejidos artesanalmente.',
    colorClass: 'bg-[#fffdfa]'
  },
  {
    name: 'Gasa de Seda Plisada',
    type: 'Fluidez mágica & ligereza',
    description: 'Tela etérea con caída libre de gran movimiento, ideal para crear velos y faldas que fluyen al caminar.',
    colorClass: 'bg-white'
  },
  {
    name: 'Crepé de Seda Pesado',
    type: 'Elasticidad natural & caída limpia',
    description: 'Con un peso inigualable que dibuja la silueta del cuerpo de manera suave y elegante sin aportar volumen.',
    colorClass: 'bg-[#fcf8f2]'
  }
];

export default function BridalCommuneClient({ comuna }: BridalCommuneClientProps) {
  const [selectedStyle, setSelectedStyle] = useState(NUPCIAL_STYLES[0]);
  const [selectedFabric, setSelectedFabric] = useState(NUPCIAL_FABRICS[0]);

  const whatsappUrl = `https://wa.me/56930510626?text=Hola%20Elena%20La%20Costurera,%20me%20gustar%C3%ADa%20agendar%20una%20cita%20nupcial.%20Vivo%20en%20${encodeURIComponent(comuna)}.%20Me%20interes%C3%B3%20el%20estilo%20de%20novia%20${encodeURIComponent(selectedStyle.name)}.`;

  return (
    <div className="min-h-screen bg-[#070707] text-[#f5f2eb] font-sans selection:bg-[#cda45e] selection:text-black">
      
      {/* 1. Hero Editorial Section */}
      <header className="relative h-[95vh] flex items-center justify-center overflow-hidden border-b border-[#cda45e]/15">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-luminosity scale-105 transition-transform duration-[10000ms] hover:scale-100"
          style={{ backgroundImage: `url('${selectedStyle.image}')` }}
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/30 to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#070707_90%)]" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-6 pt-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#cda45e]/10 text-[#cda45e] text-[10px] uppercase tracking-[0.3em] font-semibold border border-[#cda45e]/20 rounded-full animate-fade-in backdrop-blur-md">
            <MapPin className="w-3.5 h-3.5" /> Atelier de Novias en {comuna}
          </div>
          
          <h1 className="font-serif text-5xl md:text-8xl text-white tracking-tight leading-[1.1] font-light">
            Tu Vestido de <span className="font-serif italic text-[#cda45e]">Novia</span> Soñado
          </h1>

          <p className="font-serif italic text-xl md:text-2xl text-[#f5f2eb]/80 max-w-2xl mx-auto">
            "Diseñado de cero y modelado a tu medida. Cero copias de stock."
          </p>

          <p className="text-white/60 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Creemos que un vestido de novia es una pieza de arte íntima. En nuestro taller privado diseñamos sobre tu cuerpo utilizando sedas nobles y encajes importados, o reinterpretamos el vestido familiar para hacerlo tuyo.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <a 
              href="#lookbook" 
              className="w-full sm:w-auto px-8 py-4 bg-[#cda45e] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#e4be7a] transition-all duration-300 shadow-[0_4px_25px_rgba(205,164,94,0.3)] text-center rounded-sm"
            >
              Ver Diseños Nupciales
            </a>
            <Link 
              href={whatsappUrl} 
              target="_blank"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:border-[#cda45e]/50 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 text-center rounded-sm backdrop-blur-sm"
            >
              Agendar Asesoría Directa
            </Link>
          </div>
        </div>
        
        {/* Bottom indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.4em] text-white/40 flex flex-col items-center gap-2">
          <span>Desplazar</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-[#cda45e] to-transparent animate-bounce" />
        </div>
      </header>

      {/* 2. Interactive Lookbook Gallery */}
      <section id="lookbook" className="py-28 bg-[#0a0a0a] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-[#cda45e] text-[10px] uppercase tracking-[0.3em] font-bold block">Colecciones del Atelier</span>
            <h2 className="font-serif text-3xl md:text-5xl text-white">Líneas de Alta Costura Nupcial</h2>
            <p className="text-white/50 text-xs md:text-sm">
              Cada propuesta es una base maleable. Modificamos escotes, faldas y detalles para crear tu obra maestra definitiva:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Style detail sheet */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <span className="px-3 py-1 bg-[#cda45e]/10 text-[#cda45e] text-[9px] uppercase tracking-widest font-bold border border-[#cda45e]/20 rounded-sm">
                  {selectedStyle.tag}
                </span>
                <h3 className="font-serif text-3xl md:text-4xl text-white font-medium">{selectedStyle.name}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{selectedStyle.description}</p>
              </div>

              <div className="space-y-4 border-t border-white/10 pt-6">
                <h4 className="text-[10px] uppercase tracking-widest text-[#cda45e] font-bold">Atributos del Modelo:</h4>
                <ul className="grid grid-cols-1 gap-2.5">
                  {selectedStyle.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-xs text-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#cda45e]" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <Link 
                  href={whatsappUrl} 
                  target="_blank" 
                  className="inline-flex items-center gap-3 px-7 py-4 bg-[#cda45e] hover:bg-[#e4be7a] text-black text-xs uppercase tracking-widest font-bold transition-all duration-300 rounded-sm"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar por este Estilo
                </Link>
              </div>
            </div>

            {/* Active image and selector grid */}
            <div className="lg:col-span-7 space-y-6">
              <div className="aspect-[4/3] w-full relative overflow-hidden border border-white/10 rounded-sm shadow-2xl bg-black">
                <img 
                  src={selectedStyle.image} 
                  alt={selectedStyle.name}
                  className="w-full h-full object-cover object-center transition-all duration-500 scale-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {/* Thumbnails to select style */}
              <div className="grid grid-cols-4 gap-3">
                {NUPCIAL_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`relative aspect-[4/3] overflow-hidden border transition-all duration-300 ${
                      selectedStyle.id === style.id 
                        ? 'border-[#cda45e] ring-1 ring-[#cda45e] scale-[1.02]' 
                        : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <img src={style.image} alt={style.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40" />
                    <span className="absolute bottom-1.5 left-1.5 text-[8px] uppercase tracking-wider font-bold text-white bg-black/80 px-1 py-0.5 max-w-[90%] truncate">
                      {style.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Interactive Fabrics & Materials Panel */}
      <section className="py-24 bg-[#070707] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[#cda45e] text-[10px] uppercase tracking-[0.3em] font-bold block">Textiles del Atelier</span>
              <h2 className="font-serif text-3xl md:text-5xl text-white">Encajes & Telas de Importación</h2>
              <p className="text-white/60 text-xs md:text-sm leading-relaxed">
                Cada fibra de tu vestido de novia debe sentirse cómoda y lucir impecable bajo las luces. En nuestro Showroom de Vitacura podrás tocar y comparar la caída de las telas más finas del mundo.
              </p>
              
              {/* Swatch Selector */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                {NUPCIAL_FABRICS.map((fabric) => (
                  <button
                    key={fabric.name}
                    onClick={() => setSelectedFabric(fabric)}
                    className={`p-4 border text-left rounded-sm transition-all duration-300 ${
                      selectedFabric.name === fabric.name 
                        ? 'bg-white/5 border-[#cda45e]' 
                        : 'bg-transparent border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border border-white/20 ${fabric.colorClass} shrink-0`} />
                      <div>
                        <h4 className="text-xs font-bold text-white max-w-[120px] truncate">{fabric.name}</h4>
                        <p className="text-[9px] text-white/40 truncate">{fabric.type.split('&')[0]}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Swatch Display */}
            <div className="lg:col-span-6">
              <div className="bg-[#0c0c0c] border border-white/10 p-8 rounded-sm space-y-6 relative overflow-hidden shadow-2xl">
                {/* Gold aesthetic line */}
                <div className="absolute top-0 left-0 w-2 h-full bg-[#cda45e]" />
                
                <div className="space-y-2">
                  <span className="text-[#cda45e] text-[9px] uppercase tracking-widest font-bold block">Ficha Técnica Textil Nupcial</span>
                  <h3 className="font-serif text-2xl text-white">{selectedFabric.name}</h3>
                  <p className="text-xs text-[#cda45e]/90 font-medium italic">{selectedFabric.type}</p>
                </div>
                
                <p className="text-xs text-white/70 leading-relaxed min-h-[60px]">
                  {selectedFabric.description}
                </p>

                <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border border-[#0c0c0c] bg-[#faf6f0]" />
                    <div className="w-8 h-8 rounded-full border border-[#0c0c0c] bg-[#fffdfa]" />
                    <div className="w-8 h-8 rounded-full border border-[#0c0c0c] bg-white" />
                  </div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Muestrario de alta costura en Showroom</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Experience & Tailoring Process */}
      <section className="py-28 bg-[#0a0a0a] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <span className="text-[#cda45e] text-[10px] uppercase tracking-[0.3em] font-bold block">El Viaje de Tu Vestido</span>
            <h2 className="font-serif text-3xl md:text-5xl text-white">El Proceso de Confección</h2>
            <p className="text-white/50 text-xs md:text-sm">Vivimos contigo cada etapa del diseño para garantizar que te sientas segura y radiante.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Entrevista de Diseño', text: 'Estudiamos tu silueta, estilo de boda y dibujamos los primeros bocetos para ti.' },
              { num: '02', title: 'Toma de Medidas', text: 'Elegimos los encajes e hilados nobles e iniciamos el modelado técnico sobre maniquí.' },
              { num: '03', title: 'Pruebas de Calce', text: 'Realizamos hasta 3 pruebas intermedias directamente sobre tu cuerpo para ajustar caídas y proporciones.' },
              { num: '04', title: 'Entrega Final', text: 'Retoques finales, planchado a mano de encajes y empaque de conservación nupcial.' }
            ].map((step, idx) => (
              <div key={idx} className="p-6 bg-[#070707] border border-white/5 hover:border-[#cda45e]/20 transition-all duration-300 rounded-sm relative group">
                <span className="font-serif text-3xl text-[#cda45e]/20 group-hover:text-[#cda45e]/40 transition-colors block mb-4">{step.num}</span>
                <h3 className="font-serif text-lg text-white mb-2">{step.title}</h3>
                <p className="text-white/50 text-[11px] leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Testimonial */}
      <section className="py-24 bg-[#070707] border-b border-white/5 text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <Heart className="w-8 h-8 text-[#cda45e] mx-auto fill-current" />
          <p className="font-serif text-2xl md:text-3xl italic text-[#f5f2eb]/80 leading-relaxed">
            "Elena logró plasmar exactamente lo que quería. Rediseñamos el vestido de novia de mi madre conservando su esencia vintage pero con una espalda y comodidad totalmente modernas."
          </p>
          <div className="flex flex-col items-center gap-2">
            <div className="flex text-[#cda45e] gap-1">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
            </div>
            <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Novia Real de {comuna}</p>
          </div>
        </div>
      </section>

      {/* 6. Footer Call to Action */}
      <section className="py-24 bg-[#0a0a0a] text-center space-y-8">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          <Award className="w-12 h-12 text-[#cda45e] mx-auto" />
          <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">Comienza a Diseñar Tu Vestido</h2>
          <p className="text-white/60 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Trabajamos con un cupo limitado de novias por mes para asegurar una entrega perfecta y artesanal. Reserva tu cita de diseño con anticipación.
          </p>
          <div className="pt-4">
            <Link 
              href={whatsappUrl} 
              target="_blank"
              className="inline-flex bg-[#cda45e] text-black hover:bg-[#e4be7a] px-10 py-5 rounded-sm transition-all text-xs font-bold uppercase tracking-widest shadow-[0_4px_30px_rgba(205,164,94,0.2)]"
            >
              Agendar Cita de Novia
            </Link>
          </div>
        </div>
      </section>

      {/* Mini Footer */}
      <footer className="py-8 bg-[#050505] border-t border-white/5 text-center text-white/30 text-[9px] uppercase tracking-widest">
        Elena La Costurera © 2026 - Alta Costura Nupcial & Upcycling Familiar
      </footer>

    </div>
  );
}
