'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

const DRESSES = [
  {
    id: 1,
    name: 'Estrella Zafiro',
    price: '$450.000',
    category: 'fiesta',
    image: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=800', // Blue
  },
  {
    id: 2,
    name: 'Plata Estrella',
    price: '$520.000',
    category: 'gala',
    image: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=800', // Silver/White
  },
  {
    id: 3,
    name: 'Océano Profundo',
    price: '$480.000',
    category: 'fiesta',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800', // Deep/Teal
  },
  {
    id: 4,
    name: 'Amatista',
    price: '$390.000',
    category: 'fiesta',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800', // Purple
  },
  {
    id: 5,
    name: 'Esmeralda Drapeado',
    price: '$460.000',
    category: 'gala',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800', // Emerald/Green
  },
  {
    id: 6,
    name: 'Champagne Brillo',
    price: '$510.000',
    category: 'gala',
    image: 'https://images.unsplash.com/photo-1583391733958-d25e07fac044?q=80&w=800', // Gold/Silver
  },
  {
    id: 7,
    name: 'Turquesa Satén',
    price: '$420.000',
    category: 'fiesta',
    image: 'https://images.unsplash.com/photo-1550614000-4b95dd52623b?q=80&w=800', // Light Blue/Satin
  },
  {
    id: 8,
    name: 'Rubí Sirena',
    price: '$550.000',
    category: 'gala',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800', // Red/Pink
  },
];

export default function GraduationGallery() {
  const [filter, setFilter] = useState<'todos' | 'fiesta' | 'gala'>('todos');

  const filteredDresses = DRESSES.filter(dress => filter === 'todos' || dress.category === filter);

  return (
    <div className="w-full bg-[#111111] pb-24">
      {/* Filtros circulares al estilo de la referencia */}
      <div className="flex justify-center gap-6 py-10 sticky top-0 bg-[#111111]/90 backdrop-blur-md z-40">
        <button 
          onClick={() => setFilter('todos')}
          className="flex flex-col items-center gap-2 group"
        >
          <div className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all ${filter === 'todos' ? 'border-[#cda45e] bg-white/5' : 'border-gray-500 hover:border-gray-300'}`}>
            <span className={`text-lg font-serif ${filter === 'todos' ? 'text-[#cda45e]' : 'text-gray-300'}`}>T</span>
          </div>
          <span className={`text-[10px] tracking-widest uppercase font-bold ${filter === 'todos' ? 'text-[#cda45e]' : 'text-gray-400'}`}>Todos</span>
        </button>

        <button 
          onClick={() => setFilter('fiesta')}
          className="flex flex-col items-center gap-2 group"
        >
          <div className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all ${filter === 'fiesta' ? 'border-[#cda45e] bg-white/5' : 'border-gray-500 hover:border-gray-300'}`}>
            <span className={`text-lg font-serif ${filter === 'fiesta' ? 'text-[#cda45e]' : 'text-gray-300'}`}>F</span>
          </div>
          <span className={`text-[10px] tracking-widest uppercase font-bold ${filter === 'fiesta' ? 'text-[#cda45e]' : 'text-gray-400'}`}>Fiesta</span>
        </button>

        <button 
          onClick={() => setFilter('gala')}
          className="flex flex-col items-center gap-2 group"
        >
          <div className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all ${filter === 'gala' ? 'border-[#cda45e] bg-white/5' : 'border-gray-500 hover:border-gray-300'}`}>
            <span className={`text-lg font-serif ${filter === 'gala' ? 'text-[#cda45e]' : 'text-gray-300'}`}>G</span>
          </div>
          <span className={`text-[10px] tracking-widest uppercase font-bold ${filter === 'gala' ? 'text-[#cda45e]' : 'text-gray-400'}`}>Gala</span>
        </button>
      </div>

      {/* Grid inmersivo sin márgenes entre imágenes (mobile-first 2 columnas, desktop 4 columnas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 px-1">
        {filteredDresses.map((dress) => (
          <div key={dress.id} className="relative group overflow-hidden bg-black aspect-[3/4]">
            <img 
              src={dress.image} 
              alt={dress.name}
              className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Overlay sutil en la parte inferior */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <span className="text-[10px] text-gray-300 uppercase tracking-widest font-bold block mb-1">
                {dress.category}
              </span>
              <h3 className="text-xl font-serif text-white">{dress.name}</h3>
              <p className="text-sm text-[#cda45e] mt-1">{dress.price}</p>
              
              <Link 
                href={`https://wa.me/56930510626?text=Hola%20Elena,%20me%20encant%C3%B3%20el%20vestido%20${encodeURIComponent(dress.name)}.%20Quiero%20agendar%20una%20cita.`}
                target="_blank"
                className="inline-flex items-center gap-2 text-[10px] text-white uppercase tracking-widest border-b border-white/30 pb-1 mt-4 hover:border-white transition-colors"
              >
                Agendar Cita para este modelo
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Bar for Mobile Booking */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#000000] border-t border-white/10 p-4 z-50 lg:hidden flex justify-center">
        <Link 
          href="https://wa.me/56930510626?text=Hola%20Elena,%20me%20gustar%C3%ADa%20agendar%20una%20cita%20para%20un%20vestido%20de%20graduaci%C3%B3n."
          target="_blank"
          className="w-full max-w-sm bg-white text-black py-4 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest"
        >
          <Calendar className="w-4 h-4" />
          Agendar Cita en el Atelier
        </Link>
      </div>
    </div>
  );
}
