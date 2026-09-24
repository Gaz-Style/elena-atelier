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
    const text = `Hola Elena, me encantó uno de tus vestidos me gustaría cotizar la confección a medida de un diseño para mi.`;
    return `https://wa.me/56937667709?text=${encodeURIComponent(text)}`;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/95" />
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

        {/* INFO DEL VESTIDO / INVITACIÓN DE AUTOR (FONDO NEGRO / ELEGANCIA DE AUTOR) */}
        <div className={`flex-none text-white bg-gradient-to-b from-[#141414] via-[#121212] to-[#0e0e0e] p-6 md:p-10 rounded-[2px] shadow-2xl flex flex-col justify-end md:flex-1 md:max-w-md transition-opacity duration-300 ${isFullscreen ? 'hidden' : 'flex'}`}>
          <div className="space-y-6 md:space-y-7 animate-fade-in">
            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-brand-sand/80 block mb-2 font-semibold">Modelo de Inspiración #{vestido.id}</span>
              <h2 className="font-serif text-3xl md:text-5xl text-white font-normal leading-tight">{vestido.nombre}</h2>
            </div>
            
            {/* Texto de Invitación Editorial con Línea de Alineación */}
            <div className="border-l-2 border-brand-sand/50 pl-4 py-1 space-y-1.5">
              <p className="font-serif text-white/95 text-base sm:text-lg font-normal leading-snug italic">
                Hazlo tuyo, hasta el último detalle.
              </p>
              <p className="font-sans text-white/60 text-xs sm:text-sm leading-relaxed">
                Personaliza el color, escote, tela, abertura y detalles para crear un vestido que refleje tu estilo.
              </p>
            </div>

            {/* Separador decorativo */}
            <div className="flex items-center gap-3 opacity-30">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-sand to-transparent"></div>
              <span className="text-brand-sand text-[8px] tracking-[0.5em]">✦</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-sand to-transparent"></div>
            </div>

            {/* Opciones de Confección: Texto limpio sin recuadro */}
            <div className="font-sans space-y-2.5">
              <span className="font-semibold text-brand-sand/90 uppercase tracking-[0.2em] text-[10px] sm:text-xs block">Confección a medida en nuestro Atelier de Vitacura</span>
              
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                Cada vestido se crea de forma única y exclusiva. Cotizamos tu proyecto a medida según diseño, moldería y selección textil.
              </p>

              {/* Microcopy inferior de confianza */}
              <div className="pt-1 text-[11px] sm:text-xs text-brand-sand/80 font-medium flex items-center gap-1.5">
                <span className="text-brand-sand/60">✓</span> Incluye moldería exclusiva y pruebas de calce presenciales
              </div>
            </div>
            
            <div className="pt-1 flex flex-col gap-3">
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
                className="glass-btn group relative inline-flex items-center justify-center w-full py-4 sm:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-sm sm:text-base uppercase tracking-[0.2em] font-bold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:text-[#121212] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] cursor-pointer gap-2.5"
              >
                <span className="glass-text relative z-10 flex items-center justify-center gap-2.5 whitespace-nowrap !text-sm sm:!text-base">
                  Diseñar con Elena
                  <svg className="glass-arrow w-4 h-4 fill-current opacity-90 group-hover:opacity-100" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </span>
              </a>
            </div>
          </div>
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

  const getWhatsAppLink = () => {
    const text = `Hola Elena, me encantó uno de tus vestidos me gustaría cotizar la confección a medida de un diseño para mi.`;
    return `https://wa.me/56937667709?text=${encodeURIComponent(text)}`;
  };

  const handleCardClick = () => {
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
      className="break-inside-avoid relative group overflow-hidden sm:rounded-sm border-b sm:border border-white/5 sm:border-white/10 sm:shadow-sm sm:hover:shadow-[0_0_24px_rgba(255,255,255,0.06)] hover:border-brand-sand/30 transition-all duration-500 mb-1 sm:mb-0"
    >
      <div 
        onClick={handleCardClick}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full h-full relative cursor-pointer"
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
      
      {/* Catalog Info Overlay (pointer-events-none allows native horizontal swipe to see back photo) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-85 group-hover:opacity-75 transition-opacity duration-700 pointer-events-none" />
      
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 md:p-7 space-y-2 pointer-events-none">
        <div onClick={handleCardClick} className="cursor-pointer pointer-events-auto">
          <h3 className="font-serif text-2xl md:text-3xl text-white leading-tight">{vestido.nombre}</h3>
          <p className="text-white/60 text-[10px] md:text-xs uppercase tracking-[0.2em] mb-3">
            {vestido.color}
          </p>
        </div>

        <div className="pt-1 w-full pointer-events-auto flex flex-col gap-2">
          {/* BOTÓN MÓVIL (1-clic a WhatsApp) */}
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'generate_lead', {
                  item_name: vestido.nombre,
                  value: vestido.precio,
                  currency: 'CLP'
                });
              }
            }}
            className="sm:hidden inline-flex items-center justify-center gap-2 border border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[11px] uppercase tracking-[0.2em] font-bold bg-white/[0.08] backdrop-blur-[10px] px-4 py-3.5 transition-all duration-[400ms] hover:bg-[#f5f2eb]/90 hover:text-[#121212] hover:border-[#f5f2eb] rounded-[1px] w-full text-center whitespace-nowrap shadow-lg cursor-pointer"
          >
            Diseñar con Elena
            <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>

          {/* BOTÓN DESKTOP (Abre Modal con foto gigante e información completa) */}
          <button
            onClick={handleCardClick}
            className="hidden sm:inline-flex items-center justify-center gap-2.5 border border-white/10 border-t-white/20 border-l-white/20 border-b-white/5 border-r-white/5 text-white font-serif text-[10px] uppercase tracking-[0.28em] font-semibold bg-white/[0.04] backdrop-blur-[5px] px-6 py-3.5 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-[#f5f2eb]/90 group-hover:text-[#121212] group-hover:border-[#f5f2eb] rounded-[1px] w-auto text-center whitespace-nowrap cursor-pointer"
          >
            Ver Detalles
            <ArrowRight className="w-3 h-3 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Swipe Dots */}
      {hasBack && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeIndex === 0 ? 'bg-white' : 'bg-white/30'}`} />
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeIndex === 1 ? 'bg-white' : 'bg-white/30'}`} />
        </div>
      )}
    </div>
  );
}

export default function PortfolioClient({ data, generalImages, hideFilters = false, forceCategory, layout = 'grid' }: { data: PortfolioData[], generalImages: string[], hideFilters?: boolean, forceCategory?: string, layout?: 'grid' | 'carousel' }) {
  const [activeCategory, setActiveCategory] = useState<string>(forceCategory || 'novias');
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

  // Build the list of categories (Clean 3 main tabs: Colaboraciones, Fiesta, Novias)
  const categories: string[] = Array.from(new Set(data.map(d => d.category)));

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

      {/* DESTACADO ESPECIAL: PORTAFOLIO DE HISTORIAS REALES DE NOVIA (DISEÑO ORGANICO EDITORIAL SIN MARCO CUADRADO) */}
      {(activeCategory === 'novias' || (!forceCategory && activeCategory === 'todos')) && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-16 pt-4 border-b border-white/10 pb-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.35em] font-bold text-brand-sand block">
                Editorial Nupcial • Colaboración de Marcas & Modelos
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal leading-tight">
                Trilogía Nupcial: Producción Editorial en Casona Las Condes
              </h2>
              <p className="font-sans text-white/70 text-sm sm:text-base leading-relaxed">
                Lookbook nupcial en colaboración con modelos profesionales, casas de joyería fina y locaciones exclusivas, presentando la versatilidad de 3 vestidos diseñados a medida para Civil, Iglesia y Fiesta.
              </p>
              <Link
                href="/portafolio/novias/sofia-tres-vestidos-matrimonio-las-condes"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-sand hover:text-white transition-colors pt-2 border-b border-brand-sand/40 pb-1"
              >
                Ver Producción Editorial & Ficha de Colaboradores <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative aspect-[16/9] sm:aspect-[4/3] overflow-hidden rounded-xs border border-white/10">
              <Image
                src="/trabajos/baners y fondos/historia_sofia_iglesia.png"
                alt="Historia de Novia Sofía en Elena Atelier"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* DESTACADO ESPECIAL FIESTA & GALA: VISIBLE EN DESKTOP, OCULTO EN MÓVIL PARA QUE CLARA CELESTE CAIGA ARRIBA DEL PLIEGUE */}
      {activeCategory === 'fiesta' && (
        <div className="hidden md:block max-w-7xl mx-auto px-4 md:px-6 mb-16 pt-4 border-b border-white/10 pb-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.35em] font-bold text-brand-sand block">
                Gala & Fiesta • Garantía de Exclusividad
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal leading-tight">
                El Temor al Vestido Repetido: Solución a Medida con Elena
              </h2>
              <p className="font-sans text-white/70 text-sm sm:text-base leading-relaxed">
                ¿El nerviosismo de llegar a un evento y ver a otra invitada con tu mismo vestido? En Elena Atelier registramos cada evento y diseñamos piezas únicas en moldería, textura y calce para que brilles con total exclusividad.
              </p>
              <a
                href="https://wa.me/56937667709?text=Hola%20Elena,%20tengo%20un%20evento%20de%20gala/fiesta%20y%20busco%20un%20dise%C3%B1o%20exclusivo%20a%20medida%20sin%20riesgo%20de%20vestido%20repetido."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-sand hover:text-white transition-colors pt-2 border-b border-brand-sand/40 pb-1"
              >
                Consultar Cita de Diseño de Gala <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="relative aspect-[16/9] sm:aspect-[4/3] overflow-hidden rounded-xs border border-white/10">
              <Image
                src="/trabajos/fiesta/2. Lola Verde Esmeralda.jpg"
                alt="Vestido de Gala Exclusivo Elena Atelier"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      )}

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

        {/* IF CATEGORY NOVIAS: GALERÍA NARRATIVA SUBDIVIDIDA POR HITOS DE SCROLL */}
        {activeCategory === 'novias' && (
          <div className="space-y-20 pb-16">
            
            {/* ETAPA 1: EL PROCESO DE CREACIÓN EN EL ATELIER */}
            <div className="space-y-4">
              <div className="py-2 border-b border-white/10 pb-4">
                <span className="text-[10px] uppercase tracking-[0.35em] text-brand-sand font-bold block mb-1">Fase 01 • Behind The Scenes</span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">El Proceso de Creación & Taller</h3>
                <p className="font-sans text-white/60 text-xs sm:text-sm max-w-2xl mt-1">
                  La magia de la moldería anatómica, la lectura corporal y el trabajo minucioso a mano con modistas reales y pruebas de lienzo.
                </p>
              </div>

              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-0 sm:gap-6 space-y-0 sm:space-y-6">
                {currentImages.filter(img => img.includes('/novias/proceso/')).map((item, idx) => (
                  <div key={idx} className="break-inside-avoid relative group overflow-hidden sm:rounded-sm border-b sm:border border-white/10 hover:border-brand-sand/30 transition-all duration-500 mb-1 sm:mb-0">
                    {item.toLowerCase().endsWith('.mp4') ? (
                      <div className="relative aspect-[9/16] w-full bg-black overflow-hidden">
                        <video 
                          src={item} 
                          controls 
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                          preload="auto"
                          className="w-full h-full object-cover transform-gpu transform translate-z-0 backface-hidden" 
                        />
                      </div>
                    ) : (
                      <Image src={item} alt={`Proceso Taller ${idx + 1}`} width={600} height={800} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ETAPA 2: EL MATRIMONIO CIVIL */}
            <div className="space-y-4">
              <div className="py-2 border-b border-white/10 pb-4">
                <span className="text-[10px] uppercase tracking-[0.35em] text-brand-sand font-bold block mb-1">Fase 02 • Intimidad Urbana</span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">El Matrimonio Civil</h3>
                <p className="font-sans text-white/60 text-xs sm:text-sm max-w-2xl mt-1">
                  Propuestas contemporáneas, trajes sastre a medida en crepé marfil y capas desprendibles de encaje para recepciones íntimas.
                </p>
              </div>

              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-0 sm:gap-6 space-y-0 sm:space-y-6">
                {currentImages.filter(img => img.includes('/novias/civil/')).map((item, idx) => (
                  <div key={idx} className="break-inside-avoid relative group overflow-hidden sm:rounded-sm border-b sm:border border-white/10 hover:border-brand-sand/30 transition-all duration-500 mb-1 sm:mb-0">
                    {item.toLowerCase().endsWith('.mp4') ? (
                      <div className="relative aspect-[9/16] w-full bg-black overflow-hidden">
                        <video 
                          src={item} 
                          controls 
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                          preload="auto"
                          className="w-full h-full object-cover transform-gpu transform translate-z-0 backface-hidden" 
                        />
                      </div>
                    ) : (
                      <Image src={item} alt={`Matrimonio Civil ${idx + 1}`} width={600} height={800} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ETAPA 3: LA CEREMONIA RELIGIOSA EN LA IGLESIA */}
            <div className="space-y-4">
              <div className="py-2 border-b border-white/10 pb-4">
                <span className="text-[10px] uppercase tracking-[0.35em] text-brand-sand font-bold block mb-1">Fase 03 • Solemnidad & Sacralidad</span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">La Ceremonia Religiosa</h3>
                <p className="font-sans text-white/60 text-xs sm:text-sm max-w-2xl mt-1">
                  Vestidos majestuosos en Seda Mikado, escotes trabajados a mano, velos infinitos y colas catedral diseñadas para impactar en la nave central.
                </p>
              </div>

              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-0 sm:gap-6 space-y-0 sm:space-y-6">
                {currentImages.filter(img => img.includes('/novias/iglesia/')).map((item, idx) => (
                  <div key={idx} className="break-inside-avoid relative group overflow-hidden sm:rounded-sm border-b sm:border border-white/10 hover:border-brand-sand/30 transition-all duration-500 mb-1 sm:mb-0">
                    {item.toLowerCase().endsWith('.mp4') ? (
                      <div className="relative aspect-[9/16] w-full bg-black overflow-hidden">
                        <video 
                          src={item} 
                          controls 
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                          preload="auto"
                          className="w-full h-full object-cover transform-gpu transform translate-z-0 backface-hidden" 
                        />
                      </div>
                    ) : (
                      <Image src={item} alt={`Ceremonia Religiosa ${idx + 1}`} width={600} height={800} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ETAPA 4: LA NOCHE DE FIESTA Y BAILE */}
            <div className="space-y-4">
              <div className="py-2 border-b border-white/10 pb-4">
                <span className="text-[10px] uppercase tracking-[0.35em] text-brand-sand font-bold block mb-1">Fase 04 • Libertad & Celebración</span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">La Fiesta & Noche de Baile</h3>
                <p className="font-sans text-white/60 text-xs sm:text-sm max-w-2xl mt-1">
                  Soltura absoluta, slip dresses livianos y caídas fluidas para que la novia salte, baile y disfrute sin restricciones hasta el amanecer.
                </p>
              </div>

              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-0 sm:gap-6 space-y-0 sm:space-y-6">
                {currentImages.filter(img => img.includes('/novias/fiesta/')).map((item, idx) => (
                  <div key={idx} className="break-inside-avoid relative group overflow-hidden sm:rounded-sm border-b sm:border border-white/10 hover:border-brand-sand/30 transition-all duration-500 mb-1 sm:mb-0">
                    {item.toLowerCase().endsWith('.mp4') ? (
                      <div className="relative aspect-[9/16] w-full bg-black overflow-hidden">
                        <video 
                          src={item} 
                          controls 
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                          preload="auto"
                          className="w-full h-full object-cover transform-gpu transform translate-z-0 backface-hidden" 
                        />
                      </div>
                    ) : (
                      <Image src={item} alt={`Fiesta y Baile ${idx + 1}`} width={600} height={800} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* IF STANDARD GALLERY (OTROS: TODOS O FIESTA) */}
        {activeCategory !== 'fiesta' && activeCategory !== 'novias' && (
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
