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

  const prev = () => setCurrent((c) => (c === 0 ? allImages.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === allImages.length - 1 ? 0 : c + 1));

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
        <div className="relative w-full h-[60vh] md:h-[80vh] md:flex-1 bg-[#121212] md:rounded-sm overflow-hidden flex items-center justify-center">
          <Image
            src={allImages[current]}
            alt={vestido.nombre}
            fill
            className="object-contain"
            unoptimized
          />
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/80 text-white rounded-full transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/80 text-white rounded-full transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* INFO DEL VESTIDO */}
        <div className="flex-1 text-white flex flex-col justify-center p-6 md:p-0 md:max-w-sm">
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
                className="bg-brand-sand hover:bg-white text-brand-charcoal text-center py-4 font-bold text-xs uppercase tracking-[0.2em] transition-all w-full"
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

export default function PortfolioClient({ data, generalImages }: { data: PortfolioData[], generalImages: string[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('fiesta');
  const [selectedVestido, setSelectedVestido] = useState<Vestido | null>(null);

  // Build the list of categories
  const categories = [];
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
      <div className="sticky top-20 z-40 bg-brand-charcoal/90 backdrop-blur-xl border-b border-white/5 pb-4 pt-4 px-4 overflow-x-auto no-scrollbar">
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
              <div 
                key={vestido.id}
                onClick={() => setSelectedVestido(vestido)}
                className="break-inside-avoid relative group overflow-hidden sm:rounded-sm border-b sm:border border-white/5 sm:border-white/10 sm:shadow-sm sm:hover:shadow-[0_0_24px_rgba(255,255,255,0.06)] hover:border-brand-sand/30 transition-all duration-500 mb-1 sm:mb-0 cursor-pointer"
              >
                <Image 
                  src={vestido.imagenFrente} 
                  alt={vestido.nombre}
                  width={600} 
                  height={800} 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                
                {/* Catalog Info Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                  <span className="text-brand-sand text-[10px] uppercase tracking-widest mb-1">{vestido.color}</span>
                  <h3 className="font-serif text-2xl text-white mb-1">{vestido.nombre}</h3>
                  <p className="text-white/80 text-sm">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(vestido.precio)}</p>
                  
                  <div className="mt-4 flex items-center text-xs uppercase tracking-widest font-semibold text-white group/btn">
                    Ver Detalles 
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
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
                  unoptimized
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

      {/* Sticky Bottom CTA for Mobile-First Funnel (Only visible when NO lightbox is open) */}
      {!selectedVestido && (
        <div className="fixed bottom-0 left-0 w-full p-6 md:p-8 z-30 pointer-events-none flex justify-center">
          <Link 
            href="/registro?redirect=/portal/agenda" 
            className="pointer-events-auto glass-btn px-10 py-5 border border-brand-sand/30 bg-black/60 backdrop-blur-2xl text-brand-sand font-sans text-xs md:text-sm uppercase tracking-[0.25em] font-bold shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:bg-brand-sand hover:text-black hover:scale-105 transition-all duration-300 rounded-[1px] w-full max-w-sm text-center"
          >
            AGENDAR CITA
          </Link>
        </div>
      )}
    </div>
  );
}
