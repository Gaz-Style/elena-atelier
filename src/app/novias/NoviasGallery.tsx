'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

const BRIDAL_DRESSES = [
  {
    id: 1,
    name: 'Blanco Sirena',
    price: 'Desde $850.000',
    category: 'sirena',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800', 
  },
  {
    id: 2,
    name: 'Princesa Tul',
    price: 'Desde $920.000',
    category: 'princesa',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800', 
  },
  {
    id: 3,
    name: 'Vintage Heredado',
    price: 'Upcycling $650.000',
    category: 'upcycling',
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?q=80&w=800', 
  },
  {
    id: 4,
    name: 'Boho de Gasa',
    price: 'Desde $790.000',
    category: 'boho',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800', 
  },
  {
    id: 5,
    name: 'Encaje Ilusión',
    price: 'Desde $950.000',
    category: 'sirena',
    image: 'https://images.unsplash.com/photo-1583391733958-d25e07fac044?q=80&w=800', 
  },
  {
    id: 6,
    name: 'Mikado Clásico',
    price: 'Desde $1.100.000',
    category: 'princesa',
    image: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=800', 
  },
];

export default function NoviasGallery() {
  const [filter, setFilter] = useState<'todos' | 'sirena' | 'princesa' | 'upcycling' | 'boho'>('todos');

  const filteredDresses = BRIDAL_DRESSES.filter(dress => filter === 'todos' || dress.category === filter);

  return (
    <div className="w-full bg-[#111111] pb-24">
      {/* Filtros circulares minimalistas al estilo e-commerce */}
      <div className="flex justify-center gap-4 py-10 sticky top-0 bg-[#111111]/90 backdrop-blur-md z-40 overflow-x-auto px-4">
        {[
          { id: 'todos', label: 'T', name: 'Todos' },
          { id: 'sirena', label: 'S', name: 'Sirena' },
          { id: 'princesa', label: 'P', name: 'Princesa' },
          { id: 'boho', label: 'B', name: 'Boho' },
          { id: 'upcycling', label: 'U', name: 'Upcycling' },
        ].map((f) => (
          <button 
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className="flex flex-col items-center gap-2 group shrink-0"
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full border flex items-center justify-center transition-all ${filter === f.id ? 'border-[#cda45e] bg-white/5' : 'border-gray-500 hover:border-gray-300'}`}>
              <span className={`text-sm md:text-lg font-serif ${filter === f.id ? 'text-[#cda45e]' : 'text-gray-300'}`}>{f.label}</span>
            </div>
            <span className={`text-[9px] md:text-[10px] tracking-widest uppercase font-bold ${filter === f.id ? 'text-[#cda45e]' : 'text-gray-400'}`}>{f.name}</span>
          </button>
        ))}
      </div>

      {/* Grid inmersivo sin márgenes entre imágenes (mobile-first 2 columnas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 px-1">
        {filteredDresses.map((dress) => (
          <div key={dress.id} className="relative group overflow-hidden bg-black aspect-[3/4]">
            <img 
              src={dress.image} 
              alt={dress.name}
              className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Overlay sutil en la parte inferior */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <span className="text-[10px] text-gray-300 uppercase tracking-widest font-bold block mb-1">
                {dress.category}
              </span>
              <h3 className="text-2xl font-serif text-white">{dress.name}</h3>
              <p className="text-sm text-[#cda45e] mt-1">{dress.price}</p>
              
              <Link 
                href={`https://wa.me/56930510626?text=Hola%20Elena,%20me%20encant%C3%B3%20el%20vestido%20de%20novia%20${encodeURIComponent(dress.name)}.%20Quiero%20agendar%20una%20cita%20nupcial.`}
                target="_blank"
                className="inline-flex items-center gap-2 text-[10px] text-white uppercase tracking-widest border-b border-white/30 pb-1 mt-4 hover:border-white transition-colors"
              >
                Agendar Entrevista por este Modelo
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Bar for Mobile Booking */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#000000] border-t border-white/10 p-4 z-50 lg:hidden flex justify-center">
        <Link 
          href="https://wa.me/56930510626?text=Hola%20Elena,%20me%20gustar%C3%ADa%20agendar%20una%20cita%20para%20un%20vestido%20de%20novia."
          target="_blank"
          className="w-full max-w-sm bg-[#cda45e] text-black hover:bg-[#e4be7a] py-4 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest"
        >
          <Calendar className="w-4 h-4" />
          Agendar Cita Nupcial
        </Link>
      </div>
    </div>
  );
}
