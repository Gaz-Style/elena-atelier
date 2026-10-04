'use client';

import React, { useState } from 'react';
import { ChevronDown, Star, ChevronRight } from 'lucide-react';
import TrackedLink from '@/components/TrackedLink';

const pricingData = [
  {
    category: "Chaquetas & Blazers",
    items: [
      { name: "Acortar Mangas desde el Puño", desc: "Mantiene ojales y terminación original.", price: "$26.000" },
      { name: "Acortar Mangas desde la Sisa (Hombro)", desc: "Ideal cuando la manga tiene ojales funcionales.", price: "$34.000" },
      { name: "Entallar Cuerpo Simple", desc: "Ajuste de costados para estilizar silueta.", price: "$17.000" },
      { name: "Entallar Cuerpo Complejo", desc: "Ajuste de costados y costura central de espalda.", price: "$24.000" },
      { name: "Rebajar Cogotera", desc: "Elimina el pliegue sobrante debajo de la nuca.", price: "$19.000" }
    ]
  },
  {
    category: "Pantalones de Vestir",
    items: [
      { name: "Basta Invisible a Mano", desc: "Puntada ciega de alta sastrería.", price: "$8.500" },
      { name: "Achicar Cintura en Pretina", desc: "Ajuste en V posterior manteniendo el asiento.", price: "$11.500" },
      { name: "Entrar Piernas (Ambos lados)", desc: "Reducción de ancho desde muslo a tobillo.", price: "$15.500" },
      { name: "Rebajar Tiro / Basin", desc: "Ajuste anatómico de la caída del pantalón.", price: "$16.000" }
    ]
  },
  {
    category: "Camisas",
    items: [
      { name: "Acortar Mangas subiendo Tajalí", desc: "Conserva la abertura y botones originales.", price: "$14.000" },
      { name: "Entallar Costados con Pespunte", desc: "Reducción de ancho general de la camisa.", price: "$16.000" },
      { name: "Entallar con Pinzas", desc: "Ajuste anatómico en la zona lumbar.", price: "$9.500" }
    ]
  },
  {
    category: "Abrigos",
    items: [
      { name: "Acortar Mangas Original", desc: "Mantiene correas y detalles de puño.", price: "$27.000" },
      { name: "Acortar Ruedo Completo", desc: "Ajuste de largo total preservando la caída.", price: "$30.000" },
      { name: "Entrar Hombros", desc: "Reducción de estructura conservando el aplomo.", price: "$33.000" }
    ]
  }
];

function getWhatsAppCotizarUrl(itemName: string) {
    const phone = "56972812907";
    const text = `Hola Elena Atelier. Quiero cotizar el servicio de sastrería: ${itemName}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export default function PremiumPricingTable() {
  const [openCategory, setOpenCategory] = useState<number | null>(0);

  const toggleCategory = (index: number) => {
    setOpenCategory(openCategory === index ? null : index);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-12">
      <div className="flex items-center justify-between mb-8 border-b border-[#C17F5F]/30 pb-4">
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-[#E29D7A] fill-[#E29D7A]" />
          <h2 className="font-serif text-2xl md:text-3xl text-white font-bold">Carta de Precios Sastreros</h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 border border-[#C17F5F]/40 bg-[#C17F5F]/10 px-3 py-1 rounded-full">
          <Star className="w-3 h-3 text-[#E29D7A] fill-[#E29D7A]" />
          <span className="text-[10px] uppercase tracking-widest text-[#E29D7A] font-bold">Valores Base Transparentes</span>
        </div>
      </div>

      <div className="space-y-4">
        {pricingData.map((category, catIdx) => {
          const isOpen = openCategory === catIdx;
          return (
            <div key={catIdx} className="border border-white/10 bg-[#121212] rounded-sm overflow-hidden transition-all duration-300 hover:border-[#C17F5F]/30 shadow-lg">
              <button 
                onClick={() => toggleCategory(catIdx)}
                className="w-full flex items-center justify-between p-5 md:p-6 bg-gradient-to-r from-black/20 to-transparent hover:bg-white/[0.02] transition-colors"
              >
                <h3 className="font-serif text-lg md:text-xl text-[#E29D7A] font-bold uppercase tracking-widest">{category.category}</h3>
                <ChevronDown className={`w-5 h-5 text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#C17F5F]' : ''}`} />
              </button>
              
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-2 pb-6 px-4 md:px-6">
                  <div className="flex flex-col gap-2">
                    {category.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-transparent hover:border-white/5 hover:bg-white/[0.02] rounded-sm group transition-all">
                        <div className="flex-1 pr-4 mb-3 md:mb-0">
                          <h4 className="text-white font-bold text-sm md:text-base group-hover:text-[#E29D7A] transition-colors flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-[#C17F5F] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            {item.name}
                          </h4>
                          <p className="text-xs text-white/50 mt-1 md:pl-3 font-light">{item.desc}</p>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                          <div className="text-white font-bold text-base md:text-lg tabular-nums border-b border-[#C17F5F]/30 pb-0.5">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest mr-2 font-normal">Desde</span>
                            {item.price}
                          </div>
                          <TrackedLink 
                            href={getWhatsAppCotizarUrl(item.name)}
                            target="_blank"
                            eventAction="click_whatsapp" eventCategory="Lead" eventLabel={`Pricing_${item.name.replace(/\s+/g, '_')}`}
                            className="text-[10px] font-bold uppercase tracking-widest text-[#E29D7A] border border-[#C17F5F]/40 px-4 py-2 hover:bg-[#C17F5F]/10 hover:border-[#C17F5F] transition-all rounded-sm flex items-center gap-1 group/btn"
                          >
                            Cotizar <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                          </TrackedLink>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
