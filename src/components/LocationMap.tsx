'use client';

import React from 'react';
import { MapPin, Navigation, Clock, Phone, ExternalLink } from 'lucide-react';

type Props = {
  comuna?: string;
};

export default function LocationMap({ comuna }: Props) {
  const address = "Tabancura 1091, Oficina 319, Vitacura, Región Metropolitana";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;

  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-12 relative z-10">
      <div className="border border-[#C17F5F]/30 rounded-lg bg-[#141414] overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Columna Información & Botones Inteligentes */}
          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-[#161616]">
            <div>
              <span className="text-xs text-[#C17F5F] uppercase tracking-widest font-bold block mb-2">
                Atelier Principal
              </span>
              <h3 className="font-serif text-2xl text-white font-bold leading-tight">
                Visítanos en Vitacura
              </h3>
              {comuna && (
                <p className="text-xs text-white/60 mt-1 font-light">
                  A pocos minutos de {comuna}. Retiro a domicilio o atención presencial previa cita.
                </p>
              )}
            </div>

            <div className="space-y-4 text-xs text-white/80">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C17F5F] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Dirección</div>
                  <div>Tabancura 1091, Oficina 319</div>
                  <div className="text-white/50 text-[11px]">Vitacura, Santiago</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#C17F5F] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Horario de Atención</div>
                  <div>Lun - Vie: 10:00 - 21:00 hrs</div>
                  <div>Sáb: 10:00 - 14:00 hrs</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#C17F5F] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Contacto Directo</div>
                  <div>+56 9 3766 7709</div>
                </div>
              </div>
            </div>

            {/* BOTONES INTELIGENTES DE NAVEGACIÓN */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#C17F5F] hover:bg-[#b05c4b] text-white py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.01]"
              >
                <Navigation className="w-4 h-4" /> Cómo Llegar en Google Maps <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border border-[#C17F5F]/40 bg-black/40 hover:bg-[#C17F5F]/20 text-[#E29D7A] hover:text-white py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-2 transition-all backdrop-blur-sm"
              >
                Navegar con Waze
              </a>
            </div>
          </div>

          {/* Columna Mapa Embebido */}
          <div className="lg:col-span-7 min-h-[300px] lg:min-h-[420px] relative bg-black">
            <iframe
              title="Ubicación Elena La Costurera Tabancura Vitacura"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3330.9856519183494!2d-70.54848382348577!3d-33.37142879409893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662cbfdb05a4157%3A0xa193bb92b512c019!2sTabancura%201091%2C%207650020%20Vitacura%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1710000000000!5m2!1ses!2scl"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1)' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full min-h-[320px]"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
