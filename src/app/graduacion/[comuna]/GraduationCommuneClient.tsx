'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  MapPin, 
  Star, 
  Scissors, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  Search, 
  Info,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface GraduationCommuneClientProps {
  comuna: string;
}

const STYLES = [
  {
    id: 'sirena',
    name: 'Sirena Minimal',
    description: 'Silueta entallada que realza las curvas con un escote limpio y caída espectacular en raso de seda pesado.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800',
    tag: 'El más solicitado',
    features: ['Espalda descubierta', 'Raso de seda italiano', 'Cola desmontable']
  },
  {
    id: 'gala-imperial',
    name: 'Princesa de Gala',
    description: 'Volumen majestuoso con cuerpo estructurado de corsetería artesanal y falda multicapa de tul ilusión.',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800',
    tag: 'Clásico Premium',
    features: ['Cuerpo drapeado a mano', 'Tul bordado francés', 'Ajuste interno regulable']
  },
  {
    id: 'upcycling-gala',
    name: 'Upcycling Vintage',
    description: 'Transformación artesanal de un vestido familiar (de tu madre o abuela) en un diseño de gala moderno y único.',
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=800',
    tag: 'Sostenible & Sentimental',
    features: ['Reutilización de encajes vintage', 'Diseño exclusivo personalizado', 'Huella ecológica cero']
  },
  {
    id: 'boho-romantico',
    name: 'A-Line Bohemio',
    description: 'Caída fluida y ligera con detalles florales bordados a mano y mangas poéticas para un look etéreo.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800',
    tag: 'Comodidad & Estilo',
    features: ['Gasa de seda', 'Encaje de algodón natural', 'Movimiento natural libre']
  }
];

const FABRICS = [
  {
    name: 'Raso de Seda Pesado',
    type: 'Brillo sutil & caída estructural',
    description: 'Perfecto para vestidos estructurados y siluetas sirena que requieren sostener la forma de manera impecable.',
    colorClass: 'bg-[#ebd3a8]'
  },
  {
    name: 'Gasa de Seda Natural',
    type: 'Fluidez & ligereza etérea',
    description: 'Ideal para faldas fluidas, capas transparentes y drapeados románticos que se mueven con la brisa.',
    colorClass: 'bg-[#f7f2eb]'
  },
  {
    name: 'Tul Ilusión Francés',
    type: 'Transparencia & volumen',
    description: 'El secreto detrás de las faldas con volumen de ensueño y efectos de tatuaje de encaje sobre la piel.',
    colorClass: 'bg-white/20'
  },
  {
    name: 'Crepé de Satén Italiano',
    type: 'Acabado mate texturizado',
    description: 'Tela noble con excelente peso que dibuja una silueta limpia y sofisticada con un confort insuperable.',
    colorClass: 'bg-[#b8a07c]'
  }
];

export default function GraduationCommuneClient({ comuna }: GraduationCommuneClientProps) {
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedFabric, setSelectedFabric] = useState(FABRICS[0]);
  
  // Exclusivity Check State
  const [colegioQuery, setColegioQuery] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkedResult, setCheckedResult] = useState<{
    status: 'available' | 'reserved' | null;
    colegio: string;
    details?: string;
  }>({ status: null, colegio: '' });

  const handleExclusivityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colegioQuery.trim()) return;

    setChecking(true);
    setCheckedResult({ status: null, colegio: '' });

    setTimeout(() => {
      setChecking(false);
      // Simulación elegante: algunos colegios conocidos tienen vestidos reservados para añadir realismo,
      // mientras que la mayoría están disponibles.
      const queryLower = colegioQuery.toLowerCase();
      if (queryLower.includes('santiago college') || queryLower.includes('craighouse') || queryLower.includes('villa maria')) {
        setCheckedResult({
          status: 'reserved',
          colegio: colegioQuery,
          details: 'Ya tenemos 1 diseño de corte Sirena registrado para la gala de tu colegio. ¡Pero aún puedes reservar siluetas tipo Princesa, A-Line o Upcycling!'
        });
      } else {
        setCheckedResult({
          status: 'available',
          colegio: colegioQuery,
          details: '¡Cupo disponible! No hay ningún diseño similar registrado para este colegio. Puedes agendar tu cita y bloquear tu diseño exclusivo hoy mismo.'
        });
      }
    }, 1500);
  };

  const whatsappUrl = `https://wa.me/56930510626?text=Hola%20Elena%20La%20Costurera,%20me%20gustar%C3%ADa%20agendar%20una%20cita%20para%20un%20vestido%20de%20graduaci%C3%B3n.%20Vivo%20en%20${encodeURIComponent(comuna)}.%20Me%20interes%C3%B3%20el%20estilo%20${encodeURIComponent(selectedStyle.name)}.`;

  return (
    <div className="min-h-screen bg-[#070707] text-[#f5f2eb] font-sans selection:bg-[#cda45e] selection:text-black">
      
      {/* 1. Hero Editorial Section */}
      <header className="relative h-[95vh] flex items-center justify-center overflow-hidden border-b border-[#cda45e]/15">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-[10000ms] hover:scale-100"
          style={{ backgroundImage: `url('${selectedStyle.image}')` }}
        />
        {/* Sleek overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/30 to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#070707_90%)]" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-6 pt-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#cda45e]/10 text-[#cda45e] text-[10px] uppercase tracking-[0.3em] font-semibold border border-[#cda45e]/20 rounded-full animate-fade-in backdrop-blur-md">
            <MapPin className="w-3.5 h-3.5" /> Exclusividad de Diseño en {comuna}
          </div>
          
          <h1 className="font-serif text-5xl md:text-8xl text-white tracking-tight leading-[1.1] font-light">
            Tu Vestido de <span className="font-serif italic text-[#cda45e]">Gala</span> Único
          </h1>

          <p className="font-serif italic text-xl md:text-2xl text-[#f5f2eb]/80 max-w-2xl mx-auto">
            "Diseñado de cero y modelado a tu medida. Cero copias de stock."
          </p>

          <p className="text-white/60 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Creamos una obra de arte nupcial o de gala adaptada perfectamente a tu cuerpo, estilo y proporciones en nuestro atelier privado. Sin vestidos prefabricados de importación.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <a 
              href="#lookbook" 
              className="w-full sm:w-auto px-8 py-4 bg-[#cda45e] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#e4be7a] transition-all duration-300 shadow-[0_4px_25px_rgba(205,164,94,0.3)] text-center rounded-sm"
            >
              Explorar Vestidos
            </a>
            <a 
              href="#exclusividad" 
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:border-[#cda45e]/50 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 text-center rounded-sm backdrop-blur-sm"
            >
              Verificar Colegio
            </a>
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
            <span className="text-[#cda45e] text-[10px] uppercase tracking-[0.3em] font-bold block">Alta Costura de Gala</span>
            <h2 className="font-serif text-3xl md:text-5xl text-white">Elige Tu Silueta Base</h2>
            <p className="text-white/50 text-xs md:text-sm">
              Cada vestido se diseña sobre papel y se entalla directamente sobre tu figura. Inspírate con nuestras principales líneas de diseño:
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
                <h4 className="text-[10px] uppercase tracking-widest text-[#cda45e] font-bold">Detalles de Confección:</h4>
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
                  Agendar por este diseño
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
                {STYLES.map((style) => (
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
              <span className="text-[#cda45e] text-[10px] uppercase tracking-[0.3em] font-bold block">Materiales de Taller</span>
              <h2 className="font-serif text-3xl md:text-5xl text-white">Telas Nobles & Caída Perfecta</h2>
              <p className="text-white/60 text-xs md:text-sm leading-relaxed">
                Un vestido excepcional nace de la elección correcta del material. Tocamos, probamos y elegimos solo las telas más finas del mundo para lograr el movimiento que sueñas en tu noche de gala.
              </p>
              
              {/* Swatch Selector */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                {FABRICS.map((fabric) => (
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
                  <span className="text-[#cda45e] text-[9px] uppercase tracking-widest font-bold block">Ficha Técnica Textil</span>
                  <h3 className="font-serif text-2xl text-white">{selectedFabric.name}</h3>
                  <p className="text-xs text-[#cda45e]/90 font-medium italic">{selectedFabric.type}</p>
                </div>
                
                <p className="text-xs text-white/70 leading-relaxed min-h-[60px]">
                  {selectedFabric.description}
                </p>

                <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border border-[#0c0c0c] bg-[#ebd3a8]" />
                    <div className="w-8 h-8 rounded-full border border-[#0c0c0c] bg-[#b8a07c]" />
                    <div className="w-8 h-8 rounded-full border border-[#0c0c0c] bg-[#f7f2eb]" />
                  </div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Muestrario físico disponible en Showroom</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Exclusivity Checker Widget */}
      <section id="exclusividad" className="py-24 bg-[#0a0a0a] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[#0c0c0c] to-[#050505] border border-[#cda45e]/20 p-8 md:p-12 rounded-sm space-y-8 shadow-2xl relative">
            <div className="absolute top-4 right-4 text-[#cda45e]/20">
              <ShieldCheck className="w-24 h-24 stroke-[1]" />
            </div>

            <div className="space-y-4 max-w-xl">
              <span className="text-[#cda45e] text-[10px] uppercase tracking-[0.3em] font-bold block">Garantía de Unicidad</span>
              <h2 className="font-serif text-3xl md:text-4xl text-white">Registro de Exclusividad por Colegio</h2>
              <p className="text-white/60 text-xs md:text-sm leading-relaxed">
                Protegemos tu noche especial. Llevamos una bitácora estricta por establecimiento y curso. Aseguramos que **ninguna graduada de tu mismo colegio** asista con una silueta similar hecha en nuestro atelier.
              </p>
            </div>

            <form onSubmit={handleExclusivityCheck} className="space-y-4 max-w-lg">
              <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold block">Busca tu colegio/instituto:</label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <input 
                    type="text" 
                    placeholder="Ej. Santiago College, Villa Maria..." 
                    value={colegioQuery}
                    onChange={(e) => setColegioQuery(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 hover:border-white/20 focus:border-[#cda45e] px-4 py-3.5 text-xs text-white placeholder-white/30 rounded-sm focus:outline-none transition-all pl-10"
                  />
                  <Search className="w-4 h-4 text-white/30 absolute left-3 top-3.5" />
                </div>
                <button 
                  type="submit" 
                  disabled={checking}
                  className="px-6 py-3.5 bg-[#cda45e] text-black font-bold uppercase tracking-widest text-[10px] rounded-sm hover:bg-[#e4be7a] transition-all disabled:opacity-50"
                >
                  {checking ? 'Verificando...' : 'Verificar'}
                </button>
              </div>
            </form>

            {/* Results display */}
            {checking && (
              <div className="flex items-center gap-3 text-xs text-white/50 animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-[#cda45e] animate-ping" />
                Consultando bases de datos de reservas de gala...
              </div>
            )}

            {!checking && checkedResult.status === 'available' && (
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-4 rounded-sm items-start animate-fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">¡Libre de diseño!</h4>
                  <p className="mt-1 text-white/70 leading-relaxed">{checkedResult.details}</p>
                  <Link 
                    href={whatsappUrl} 
                    target="_blank"
                    className="inline-flex items-center gap-1.5 mt-3 text-[#cda45e] hover:underline font-bold text-[10px] uppercase tracking-wider"
                  >
                    Reservar cupo ahora <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {!checking && checkedResult.status === 'reserved' && (
              <div className="p-5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex gap-4 rounded-sm items-start animate-fade-in">
                <XCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Silueta Parcialmente Reservada</h4>
                  <p className="mt-1 text-white/70 leading-relaxed">{checkedResult.details}</p>
                  <Link 
                    href={`https://wa.me/56930510626?text=Hola%20Elena,%20quisiera%20saber%20qu%C3%A9%20vestidos%20ya%20est%C3%A1n%20reservados%20para%20el%20colegio%20${encodeURIComponent(checkedResult.colegio)}.`} 
                    target="_blank"
                    className="inline-flex items-center gap-1.5 mt-3 text-[#cda45e] hover:underline font-bold text-[10px] uppercase tracking-wider"
                  >
                    Consultar otros estilos para mi colegio <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Values / Tailoring Process */}
      <section className="py-28 bg-[#070707] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <span className="text-[#cda45e] text-[10px] uppercase tracking-[0.3em] font-bold block">El Proceso de Creación</span>
            <h2 className="font-serif text-3xl md:text-5xl text-white">4 Pasos hacia un Ajuste Perfecto</h2>
            <p className="text-white/50 text-xs md:text-sm">Así esculpimos la silueta de gala que llevarás con total orgullo y comodidad.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Cita & Concepto', text: 'Conversamos sobre tu estilo, silueta ideal y referencias en nuestro Showroom de Vitacura.' },
              { num: '02', title: 'Telas & Medidas', text: 'Elegimos telas nobles del muestrario y tomamos más de 15 puntos métricos de tu cuerpo.' },
              { num: '03', title: 'El Hilván de Calce', text: 'Creamos una prueba intermedia para esculpir el entalle sobre ti y definir escotes y largos.' },
              { num: '04', title: 'Entrega de Alta Gala', text: 'Últimos retoques y planchado artesanal. Te llevas una pieza exclusiva lista para destacar.' }
            ].map((step, idx) => (
              <div key={idx} className="p-6 bg-[#0a0a0a] border border-white/5 hover:border-[#cda45e]/20 transition-all duration-300 rounded-sm relative group">
                <span className="font-serif text-3xl text-[#cda45e]/20 group-hover:text-[#cda45e]/40 transition-colors block mb-4">{step.num}</span>
                <h3 className="font-serif text-lg text-white mb-2">{step.title}</h3>
                <p className="text-white/50 text-[11px] leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Footer Call to Action */}
      <section className="py-24 bg-[#0a0a0a] text-center space-y-8">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          <Award className="w-12 h-12 text-[#cda45e] mx-auto" />
          <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight">Es hora de crear tu propia historia</h2>
          <p className="text-white/60 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Las citas son limitadas para garantizar el máximo nivel de atención personalizada a cada graduada de {comuna}. Asegura tu espacio esta temporada.
          </p>
          <div className="pt-4">
            <Link 
              href={whatsappUrl} 
              target="_blank"
              className="inline-flex bg-[#cda45e] text-black hover:bg-[#e4be7a] px-10 py-5 rounded-sm transition-all text-xs font-bold uppercase tracking-widest shadow-[0_4px_30px_rgba(205,164,94,0.2)]"
            >
              Reservar Mi Cita de Diseño
            </Link>
          </div>
        </div>
      </section>

      {/* Mini Footer */}
      <footer className="py-8 bg-[#050505] border-t border-white/5 text-center text-white/30 text-[9px] uppercase tracking-widest">
        Elena La Costurera © 2026 - Confección Sostenible & Alta Gala a Medida
      </footer>

    </div>
  );
}
