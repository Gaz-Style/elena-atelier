'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface PortfolioData {
  category: string;
  images: string[];
}

export default function PortfolioClient({ data, generalImages }: { data: PortfolioData[], generalImages: string[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  // Build the list of categories including 'todos'
  const categories = ['todos', ...data.map(d => d.category)];

  // Get images for current active category
  let currentImages: string[] = [];
  if (activeCategory === 'todos') {
    currentImages = generalImages;
  } else {
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
                  {/* We can use an icon or text here. For now, just the first letter */}
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
        {/* On mobile: 1 column full width. On desktop: 2-4 columns masonry */}
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
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 pointer-events-none hidden sm:block" />
            </div>
          ))}
        </div>

        {currentImages.length === 0 && (
          <div className="text-center py-32 text-white/40 px-6">
            <p className="font-sans text-sm tracking-widest uppercase mb-4">No hay imágenes</p>
            <p className="font-serif italic text-lg">Pronto subiremos trabajos a esta categoría.</p>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA for Mobile-First Funnel */}
      <div className="fixed bottom-0 left-0 w-full p-6 md:p-8 z-50 pointer-events-none flex justify-center">
        <Link 
          href="/registro?redirect=/portal/agenda" 
          className="pointer-events-auto glass-btn px-10 py-5 border border-brand-sand/30 bg-black/60 backdrop-blur-2xl text-brand-sand font-sans text-xs md:text-sm uppercase tracking-[0.25em] font-bold shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:bg-brand-sand hover:text-black hover:scale-105 transition-all duration-300 rounded-[1px] w-full max-w-sm text-center"
        >
          AGENDAR CITA
        </Link>
      </div>
    </div>
  );
}
