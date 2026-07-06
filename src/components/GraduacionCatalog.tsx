'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { vestidos, siluetas, tejidos, colores, type Vestido, type Silueta, type Tejido, type ColorCategoria } from '@/lib/graduacion-data';

/* ─────────────────────────────────────────────
   LIGHTBOX MODAL
   ───────────────────────────────────────────── */
function Lightbox({ vestido, onClose }: { vestido: Vestido; onClose: () => void }) {
  const allImages = [vestido.imagenFrente, vestido.imagenEspalda, ...(vestido.imagenesExtra || [])];
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm lightbox-enter" />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-12 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 max-h-[95vh] lightbox-content-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-4 sm:top-4 sm:right-6 z-20 text-white/60 hover:text-white transition-colors p-2"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Carousel */}
        <div className="relative flex-shrink-0 w-full lg:w-[55%] aspect-[3/4] max-h-[70vh] lg:max-h-[85vh] overflow-hidden rounded-sm">
          {allImages.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt={`${vestido.nombre} - Vista ${i + 1}`}
              fill
              className={`object-contain transition-opacity duration-500 ease-in-out ${i === current ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority={i === 0}
            />
          ))}

          {/* Nav Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:bg-black/60 hover:text-white flex items-center justify-center transition-all"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:bg-black/60 hover:text-white flex items-center justify-center transition-all"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                  aria-label={`Imagen ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="flex-1 text-white space-y-6 lg:space-y-8 text-center lg:text-left w-full lg:w-auto py-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] font-semibold text-brand-sand block mb-3">
              Colección Graduación
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight">
              {vestido.nombre}
            </h2>
            <p className="text-white/50 text-sm mt-2 font-light tracking-wide">
              {vestido.color} · {vestido.tejido} · {vestido.silueta}
            </p>
          </div>
          <p className="text-white/70 text-sm leading-relaxed max-w-md mx-auto lg:mx-0">
            {vestido.descripcion}
          </p>
          <div className="pt-2">
            <Link
              href="/appointment"
              className="glass-btn group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-white font-serif text-[11px] uppercase tracking-[0.28em] font-semibold transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] w-full sm:w-auto"
            >
              <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-center">
                Agendar Prueba en Atelier
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRODUCT CARD
   ───────────────────────────────────────────── */
function ProductCard({ vestido, onClick }: { vestido: Vestido; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <article
      className="group cursor-pointer catalog-card"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4.5] overflow-hidden rounded-sm bg-[#c8c3bc]">
        {/* Front Image (Default) */}
        <Image
          src={vestido.imagenFrente}
          alt={`${vestido.nombre} ${vestido.color} - Frente`}
          fill
          className={`object-contain transition-opacity duration-[600ms] ease-in-out ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onLoad={() => setIsLoaded(true)}
        />
        {/* Back Image (Hover) */}
        <Image
          src={vestido.imagenEspalda}
          alt={`${vestido.nombre} ${vestido.color} - Espalda`}
          fill
          className={`object-contain transition-opacity duration-[600ms] ease-in-out ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Subtle overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Quick CTA on hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-500 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <span className="block w-full text-center text-white text-[10px] uppercase tracking-[0.3em] font-semibold bg-black/50 backdrop-blur-sm py-3 px-4 rounded-sm border border-white/10 hover:bg-black/70 transition-colors">
            Ver Detalles
          </span>
        </div>

        {/* Loading skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#f0ede8] to-[#e8e4dd] animate-pulse" />
        )}
      </div>

      {/* Info below image */}
      <div className="mt-4 space-y-1 text-center">
        <h3 className="font-serif text-lg sm:text-xl text-white group-hover:text-brand-sand transition-colors duration-400">
          {vestido.nombre}
        </h3>
        <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-light">
          {vestido.color} · {vestido.tejido}
        </p>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────
   FILTER BAR
   ───────────────────────────────────────────── */
function FilterBar({
  activeSilueta,
  activeTejido,
  activeColor,
  onSilueta,
  onTejido,
  onColor,
  onClear,
  resultCount,
}: {
  activeSilueta: Silueta | null;
  activeTejido: Tejido | null;
  activeColor: ColorCategoria | null;
  onSilueta: (s: Silueta | null) => void;
  onTejido: (t: Tejido | null) => void;
  onColor: (c: ColorCategoria | null) => void;
  onClear: () => void;
  resultCount: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasFilters = activeSilueta || activeTejido || activeColor;

  return (
    <div className="w-full">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-2.5 px-5 py-3 text-[10px] uppercase tracking-[0.25em] font-semibold rounded-sm border transition-all duration-300 ${isOpen ? 'bg-white text-brand-charcoal border-white' : 'bg-transparent text-white/70 border-white/15 hover:border-white/30 hover:text-white'}`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtros
          {hasFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta" />
          )}
        </button>
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-white/40 tracking-wider uppercase">
            {resultCount} {resultCount === 1 ? 'modelo' : 'modelos'}
          </span>
          {hasFilters && (
            <button
              onClick={onClear}
              className="text-[10px] text-brand-terracotta uppercase tracking-[0.2em] font-semibold hover:text-white transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'max-h-[600px] opacity-100 mb-10' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-sm p-6 sm:p-8 space-y-6">
          {/* Silueta */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/50 mb-3">Silueta</h4>
            <div className="flex flex-wrap gap-2">
              {siluetas.map((s) => (
                <button
                  key={s}
                  onClick={() => onSilueta(activeSilueta === s ? null : s)}
                  className={`filter-chip ${activeSilueta === s ? 'filter-chip-active' : ''}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Tejido */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/50 mb-3">Tejido</h4>
            <div className="flex flex-wrap gap-2">
              {tejidos.map((t) => (
                <button
                  key={t}
                  onClick={() => onTejido(activeTejido === t ? null : t)}
                  className={`filter-chip ${activeTejido === t ? 'filter-chip-active' : ''}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/50 mb-3">Color</h4>
            <div className="flex flex-wrap gap-2">
              {colores.map((c) => (
                <button
                  key={c}
                  onClick={() => onColor(activeColor === c ? null : c)}
                  className={`filter-chip ${activeColor === c ? 'filter-chip-active' : ''}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN CATALOG
   ───────────────────────────────────────────── */
export default function GraduacionCatalog() {
  const [selectedVestido, setSelectedVestido] = useState<Vestido | null>(null);
  const [activeSilueta, setActiveSilueta] = useState<Silueta | null>(null);
  const [activeTejido, setActiveTejido] = useState<Tejido | null>(null);
  const [activeColor, setActiveColor] = useState<ColorCategoria | null>(null);

  const filtered = vestidos.filter((v) => {
    if (activeSilueta && v.silueta !== activeSilueta) return false;
    if (activeTejido && v.tejido !== activeTejido) return false;
    if (activeColor && v.colorCategoria !== activeColor) return false;
    return true;
  });

  const clearAll = () => {
    setActiveSilueta(null);
    setActiveTejido(null);
    setActiveColor(null);
  };

  return (
    <>
      {/* Filter Bar */}
      <FilterBar
        activeSilueta={activeSilueta}
        activeTejido={activeTejido}
        activeColor={activeColor}
        onSilueta={setActiveSilueta}
        onTejido={setActiveTejido}
        onColor={setActiveColor}
        onClear={clearAll}
        resultCount={filtered.length}
      />

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-serif text-2xl text-white/50 mb-4">Sin resultados</p>
          <p className="text-sm text-white/30 mb-6">No encontramos modelos con esos filtros.</p>
          <button onClick={clearAll} className="text-brand-terracotta text-sm uppercase tracking-widest font-semibold hover:text-white transition-colors">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16">
          {filtered.map((vestido) => (
            <ProductCard
              key={vestido.id}
              vestido={vestido}
              onClick={() => setSelectedVestido(vestido)}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedVestido && (
        <Lightbox vestido={selectedVestido} onClose={() => setSelectedVestido(null)} />
      )}
    </>
  );
}
