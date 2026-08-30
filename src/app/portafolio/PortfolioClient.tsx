'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { X, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { vestidosFiesta, type Vestido } from '@/lib/fiesta-data';

interface PortfolioData {
  category: string;
  images: string[];
}

/* ─────────────────────────────────────────────
   LIGHTBOX MODAL (E-COMMERCE)
   ───────────────────────────────────────────── */
function Lightbox({ vestido, onClose }: { vestido: Vestido; onClose: () => void }) {
  const allImages = [vestido.imagenFrente, vestido.imagenEspalda, ...(vestido.imagenesExtra || [])].filter(Boolean);
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Chatbot State
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatStep, setChatStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState('');

  // Swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const prev = () => setCurrent((c) => (c === 0 ? allImages.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === allImages.length - 1 ? 0 : c + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  
  // Vertical swipe to close
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  const handleTouchStartCombined = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEndY(null);
    setTouchStartY(e.targetTouches[0].clientY);
  };
  const handleTouchMoveCombined = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };
  const handleTouchEndCombined = () => {
    if (!touchStart || !touchEnd || !touchStartY || !touchEndY) return;
    const distX = touchStart - touchEnd;
    const distY = touchStartY - touchEndY;
    
    // Only handle horizontal swipes for next/prev.
    // Let native vertical scrolling happen for the rest of the modal.
    if (Math.abs(distX) > Math.abs(distY)) {
      if (distX > 50) next();
      if (distX < -50) prev();
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  const getWhatsAppLink = () => {
    const text = 'Hola Elena, tengo una idea para mi vestido y me gustaría contártela.';
    return `https://wa.me/56937667709?text=${encodeURIComponent(text)}`;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
      <div
        className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center gap-0 md:gap-12 w-full h-[100dvh] md:h-auto max-w-6xl mx-auto md:px-6 py-0 md:py-8 overflow-hidden md:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-white/60 hover:text-white transition-colors bg-black/50 p-2 rounded-full md:bg-transparent"
        >
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        {/* IMAGEN */}
        <div 
          className={`relative overflow-hidden flex items-center justify-center transition-all duration-500 cursor-zoom-in ${isFullscreen ? 'fixed inset-0 z-[10000] bg-black w-full h-full cursor-zoom-out' : 'w-full flex-1 min-h-0 md:h-[80vh] bg-[#121212] md:rounded-sm'}`}
          onClick={() => setIsFullscreen(!isFullscreen)}
          onTouchStart={handleTouchStartCombined}
          onTouchMove={handleTouchMoveCombined}
          onTouchEnd={handleTouchEndCombined}
        >
          {allImages.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={`${vestido.nombre} - vista ${index + 1}`}
              fill
              className={`object-contain pointer-events-none transition-opacity duration-[800ms] ease-[cubic-bezier(0.25,0.1,0.25,1.0)] absolute inset-0 ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            />
          ))}

          {/* Instagram-style dots */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {allImages.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-white scale-125' : 'bg-white/35'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* INFO DEL VESTIDO / CHATBOT */}
        <div className={`flex-none text-white flex flex-col justify-end p-5 pb-6 md:p-0 md:flex-1 md:max-w-sm transition-opacity duration-300 ${isFullscreen ? 'hidden' : 'flex'}`}>
          {!showChatbot ? (
            <div className="space-y-3 md:space-y-6 animate-fade-in">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-brand-sand block mb-1 md:mb-2">Modelo #{vestido.id}</span>
                <h2 className="font-serif text-2xl md:text-5xl mb-1 md:mb-2">{vestido.nombre}</h2>
                <p className="text-sm md:text-base text-brand-sand tracking-widest uppercase font-semibold mt-1">
                  Diseño a Medida
                </p>
              </div>
              
              <p className="text-white/60 text-xs md:text-sm leading-relaxed font-sans line-clamp-3 md:line-clamp-none">
                {vestido.descripcion}
              </p>
              
              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={() => setShowChatbot(true)}
                  className="glass-btn group relative inline-flex items-center justify-center w-full py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.2em] font-bold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:text-[#121212] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] cursor-pointer"
                >
                  Hablemos
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="relative w-full border-[0.5px] border-white/[0.08] px-8 py-10 backdrop-blur-[8px] bg-black/[0.18] rounded-[1px] shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] animate-scale-up"
            >
              {/* Cabecera — Misma tipografía del logo */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-serif text-sm uppercase tracking-[0.25em] text-white font-normal">Elena</h3>
                  <p className="text-[8px] uppercase tracking-[0.35em] text-white/35 font-normal mt-0.5">La Costurera</p>
                </div>
                <button 
                  onClick={() => setShowChatbot(false)} 
                  className="text-white/25 hover:text-white/60 text-[9px] uppercase tracking-[0.2em] transition-colors duration-500 cursor-pointer"
                >
                  Volver
                </button>
              </div>

              {/* Línea divisoria sutil */}
              <div className="w-8 h-px bg-white/10 mb-8" />

              {/* Mensaje — Serif ligera, sin negritas, aire editorial */}
              <div className="space-y-5 text-left mb-10">
                <p className="text-[15px] text-white/90 leading-[1.8] font-serif font-light">
                  Hola, soy Elena ✨
                </p>
                <p className="text-[15px] text-white/70 leading-[1.8] font-serif font-light">
                  Será un placer conocerte y escuchar tu idea.
                </p>
                <p className="text-[15px] text-white/90 leading-[1.8] font-serif font-normal italic">
                  Cuéntame, ¿qué tienes en mente?
                </p>
              </div>

              {/* Botón — Mismo vidrio translúcido del Hero */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'generate_lead', {
                      item_name: vestido.nombre,
                      value: vestido.precio,
                      currency: 'CLP'
                    });
                  }
                }}
                className="glass-btn group relative inline-flex items-center justify-center w-full py-[18px] border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 bg-white/[0.06] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/92 hover:border-[#f5f2eb] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] cursor-pointer"
              >
                <span className="glass-text relative z-10 flex items-center justify-center gap-2.5 whitespace-nowrap">
                  CONVERSEMOS
                  <svg className="w-[14px] h-[14px] opacity-60 group-hover:opacity-100 transition-opacity duration-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </span>
              </a>

              <p className="text-center text-[7px] text-white/15 uppercase tracking-[0.3em] mt-6">
                Conexión directa · WhatsApp
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DRESS GRID ITEM (With Scroll Dots)
   ───────────────────────────────────────────── */
function DressGridItem({ vestido, onClick }: { vestido: Vestido, onClick: () => void }) {
  const hasBack = vestido.imagenEspalda && vestido.imagenEspalda !== vestido.imagenFrente;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasBack) return;
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const handleClick = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'view_item', {
        currency: 'CLP',
        value: vestido.precio,
        items: [{
          item_id: vestido.id.toString(),
          item_name: vestido.nombre,
          item_category: vestido.color
        }]
      });
    }
    onClick();
  };

  return (
    <div 
      onClick={handleClick}
      className="break-inside-avoid relative group overflow-hidden sm:rounded-sm border-b sm:border border-white/5 sm:border-white/10 sm:shadow-sm sm:hover:shadow-[0_0_24px_rgba(255,255,255,0.06)] hover:border-brand-sand/30 transition-all duration-500 mb-1 sm:mb-0 cursor-pointer"
    >
      <div 
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full h-full relative"
      >
        <div className="w-full flex-none snap-center relative">
          <Image 
            src={vestido.imagenFrente} 
            alt={vestido.nombre + " frente"}
            width={600} 
            height={800} 
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
          />
        </div>
        {hasBack && (
          <div className="w-full flex-none snap-center relative">
            <Image 
              src={vestido.imagenEspalda} 
              alt={vestido.nombre + " espalda"}
              width={600} 
              height={800} 
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            />
          </div>
        )}
      </div>
      
      {/* Catalog Info Overlay (must have pointer-events-none so swipe works on the container below) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />
      
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-8 space-y-2 pointer-events-none">
        <h3 className="font-serif text-2xl md:text-3xl text-white leading-tight">{vestido.nombre}</h3>
        <p className="text-white/60 text-[10px] md:text-xs uppercase tracking-[0.2em] mb-4">
          {vestido.color}
        </p>
        <div className="pt-2 w-auto">
          <span className="inline-flex items-center justify-center gap-2.5 border border-white/10 border-t-white/20 border-l-white/20 border-b-white/5 border-r-white/5 text-white font-serif text-[10px] uppercase tracking-[0.28em] font-semibold bg-white/[0.04] backdrop-blur-[5px] px-6 py-3.5 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#f5f2eb]/90 group-hover:text-[#121212] group-hover:border-[#f5f2eb] rounded-[1px] w-auto text-center whitespace-nowrap">
            Ver Detalles
            <ArrowRight className="w-3 h-3 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
          </span>
        </div>
      </div>

      {/* Swipe Dots */}
      {hasBack && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeIndex === 0 ? 'bg-white' : 'bg-white/30'}`} />
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeIndex === 1 ? 'bg-white' : 'bg-white/30'}`} />
        </div>
      )}
    </div>
  );
}

export default function PortfolioClient({ data, generalImages, hideFilters = false, forceCategory, layout = 'grid' }: { data: PortfolioData[], generalImages: string[], hideFilters?: boolean, forceCategory?: string, layout?: 'grid' | 'carousel' }) {
  const [activeCategory, setActiveCategory] = useState<string>(forceCategory || 'fiesta');
  const [selectedVestido, setSelectedVestido] = useState<Vestido | null>(null);

  // Hidden component to handle Next.js searchParams without de-opting the entire page
  const SearchParamHandler = () => {
    const searchParams = useSearchParams();
    const vestidoId = searchParams.get('vestido');
    
    useEffect(() => {
      if (vestidoId) {
        const v = vestidosFiesta.find(v => v.id.toString() === vestidoId);
        if (v) setSelectedVestido(v);
      }
    }, [vestidoId]);
    return null;
  };

  // Build the list of categories
  const categories: string[] = [];
  if (generalImages && generalImages.length > 0) {
    categories.push('todos');
  }
  categories.push(...data.map(d => d.category));

  // If the default 'fiesta' is not in categories and categories is not empty, fallback to the first one
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeCategory)) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // Get images for current active category (only for non-catalog folders)
  let currentImages: string[] = [];
  if (activeCategory === 'todos') {
    currentImages = generalImages;
  } else if (activeCategory !== 'fiesta') {
    const catData = data.find(d => d.category === activeCategory);
    if (catData) currentImages = catData.images;
  }

  // Format category name for display
  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');
  };

  return (
    <div className="w-full relative pb-32">
      <Suspense fallback={null}>
        <SearchParamHandler />
      </Suspense>

      {/* Highlights / Stories Filter Bar */}
      {!hideFilters && (
        <div className="border-b border-white/5 pb-4 pt-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-4 md:justify-center min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex flex-col items-center gap-2 group outline-none"
              >
                <div 
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 p-1 flex items-center justify-center transition-all duration-300 ${
                    activeCategory === cat 
                      ? 'border-brand-sand bg-brand-sand/10' 
                      : 'border-white/20 group-hover:border-white/50'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center overflow-hidden relative">
                    <span className={`font-serif text-xl ${activeCategory === cat ? 'text-brand-sand' : 'text-white'}`}>
                      {cat.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-semibold transition-colors duration-300 ${
                  activeCategory === cat ? 'text-brand-sand' : 'text-white/60'
                }`}>
                  {formatName(cat)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid / Fullwidth Mobile View */}
      <div className="max-w-7xl mx-auto px-0 md:px-6 mt-8">
        
        {/* IF E-COMMERCE CATALOG (FIESTA) */}
        {activeCategory === 'fiesta' && layout === 'grid' && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-0 sm:gap-6 space-y-0 sm:space-y-6">
            {vestidosFiesta.map((vestido) => (
              <DressGridItem 
                key={vestido.id} 
                vestido={vestido} 
                onClick={() => setSelectedVestido(vestido)} 
              />
            ))}
          </div>
        )}

        {/* IF CAROUSEL LAYOUT FOR FIESTA */}
        {activeCategory === 'fiesta' && layout === 'carousel' && (
          <div className="w-full overflow-x-auto no-scrollbar pb-8 snap-x snap-mandatory">
            <div className="flex gap-4 md:gap-6 w-max">
              {vestidosFiesta.map((vestido) => (
                <div key={vestido.id} className="w-[280px] sm:w-[320px] md:w-[380px] snap-center flex-none">
                  <DressGridItem 
                    vestido={vestido} 
                    onClick={() => setSelectedVestido(vestido)} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IF STANDARD GALLERY (OTROS) */}
        {activeCategory !== 'fiesta' && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-0 sm:gap-6 space-y-0 sm:space-y-6">
            {currentImages.map((img, idx) => (
              <div 
                key={idx} 
                className="break-inside-avoid relative group overflow-hidden sm:rounded-sm border-b sm:border border-white/5 sm:border-white/10 sm:shadow-sm sm:hover:shadow-[0_0_24px_rgba(255,255,255,0.06)] hover:border-brand-sand/30 transition-all duration-500 mb-1 sm:mb-0"
              >
                <Image 
                  src={img} 
                  alt={`Trabajo Elena ${formatName(activeCategory)} ${idx + 1}`} 
                  width={600} 
                  height={800} 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
            
            {currentImages.length === 0 && (
              <div className="text-center py-32 text-white/40 px-6 break-inside-avoid w-full col-span-full">
                <p className="font-sans text-sm tracking-widest uppercase mb-4">No hay imágenes</p>
                <p className="font-serif italic text-lg">Pronto subiremos trabajos a esta categoría.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Portal */}
      {selectedVestido && (
        <Lightbox vestido={selectedVestido} onClose={() => setSelectedVestido(null)} />
      )}
    </div>
  );
}
