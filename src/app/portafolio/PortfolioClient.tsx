'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) next();
    if (distance < -50) prev();
  };

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
    // If vertical swipe is dominant and large enough
    if (Math.abs(distY) > Math.abs(distX) && Math.abs(distY) > 80) {
      if (isFullscreen) {
        // Exit fullscreen back to detail view (with Agendar button)
        setIsFullscreen(false);
      } else {
        // Close the entire lightbox
        onClose();
      }
      return;
    }
    // Horizontal swipe
    if (distX > 50) next();
    if (distX < -50) prev();
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

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
      <div
        className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center gap-0 md:gap-12 w-full h-full md:h-auto max-w-6xl mx-auto md:px-6 py-0 md:py-8 overflow-y-auto md:overflow-visible"
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
          className={`relative overflow-hidden flex items-center justify-center transition-all duration-500 cursor-zoom-in ${isFullscreen ? 'fixed inset-0 z-[10000] bg-black w-full h-full cursor-zoom-out' : 'w-full h-[60vh] md:h-[80vh] md:flex-1 bg-[#121212] md:rounded-sm'}`}
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

        {/* INFO DEL VESTIDO */}
        <div className={`flex-1 text-white flex flex-col justify-center p-6 md:p-0 md:max-w-sm transition-opacity duration-300 ${isFullscreen ? 'hidden' : 'flex'}`}>
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-brand-sand block mb-2">Modelo #{vestido.id}</span>
              <h2 className="font-serif text-3xl md:text-5xl mb-2">{vestido.nombre}</h2>
              <p className="text-xl md:text-2xl text-white/90 font-light">
                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(vestido.precio)}
              </p>
            </div>
            
            <p className="text-white/60 text-sm leading-relaxed font-sans">
              {vestido.descripcion}
            </p>
            
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/10 text-xs">
              <div>
                <span className="block text-white/40 uppercase tracking-widest mb-1">Color</span>
                <span className="text-white font-medium">{vestido.color}</span>
              </div>
              <div>
                <span className="block text-white/40 uppercase tracking-widest mb-1">Silueta</span>
                <span className="text-white font-medium">{vestido.silueta}</span>
              </div>
              <div>
                <span className="block text-white/40 uppercase tracking-widest mb-1">Tejido</span>
                <span className="text-white font-medium">{vestido.tejido}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Link
                href="/registro?redirect=/portal/agenda"
                className="glass-btn group relative inline-flex items-center justify-center w-full py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.2em] font-bold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:text-[#121212] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px]"
              >
                Agendar Prueba
              </Link>
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

  return (
    <div 
      onClick={onClick}
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 pointer-events-none">
        <span className="text-brand-sand text-[10px] uppercase tracking-widest mb-1">{vestido.color}</span>
        <h3 className="font-serif text-2xl text-white mb-1">{vestido.nombre}</h3>
        <p className="text-white/80 text-sm">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(vestido.precio)}</p>
        
        <div className="mt-4 flex items-center text-xs uppercase tracking-widest font-semibold text-white group-hover:translate-x-2 transition-transform">
          Ver Detalles 
          <ArrowRight className="w-4 h-4 ml-2" />
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

export default function PortfolioClient({ data, generalImages }: { data: PortfolioData[], generalImages: string[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('fiesta');
  const [selectedVestido, setSelectedVestido] = useState<Vestido | null>(null);

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
      {/* Highlights / Stories Filter Bar */}
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

      {/* Grid / Fullwidth Mobile View */}
      <div className="max-w-7xl mx-auto px-0 md:px-6 mt-8">
        
        {/* IF E-COMMERCE CATALOG (FIESTA) */}
        {activeCategory === 'fiesta' && (
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
