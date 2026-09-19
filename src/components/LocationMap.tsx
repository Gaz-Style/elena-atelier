'use client';

import React from 'react';
import { MapPin, Clock, Phone } from 'lucide-react';

type Props = {
  comuna?: string;
};

export default function LocationMap({ comuna }: Props) {
  const address = "Tabancura 1091, Oficina 319, Vitacura, Región Metropolitana";
  const businessName = "ELENA La Costurera - Alta Costura & Sastrería a Medida, Tabancura 1091, Vitacura";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName)}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent("Tabancura 1091, Vitacura")}&navigate=yes`;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 relative z-10">
      {/* Card Principal */}
      <div className="bg-[#1c1c1e] border border-white/10 rounded-xl p-5 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-stretch justify-between gap-8">
          
          {/* Mapa Embebido Estilizado */}
          <div className="w-full md:w-5/12 min-h-[250px] rounded-md overflow-hidden relative border border-white/10 shadow-inner group shrink-0">
            <iframe
              title="Ubicación Elena Atelier Tabancura Vitacura"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3330.9856519183494!2d-70.54848382348577!3d-33.37142879409893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662cbfdb05a4157%3A0xa193bb92b512c019!2sTabancura%201091%2C%207650020%20Vitacura%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses!2scl!4v1710000000000!5m2!1ses!2scl"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Información Detallada + Botones */}
          <div className="w-full md:w-7/12 flex flex-col justify-between space-y-6">
            
            {/* Textos Informativos */}
            <div className="space-y-5">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-white font-bold leading-tight mb-2">
                  Visítanos en Vitacura
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-white/80 font-light">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C17F5F] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white mb-0.5">Dirección</div>
                    <div>Tabancura 1091, Oficina 319</div>
                    <div className="text-white/50 text-[11px] sm:text-xs">Vitacura, Santiago</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#C17F5F] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white mb-0.5">Horario de Atención</div>
                    <div>Lun - Vie: 10:00 - 21:00 hrs</div>
                    <div>Sáb: 10:00 - 14:00 hrs</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#C17F5F] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white mb-0.5">Contacto Directo</div>
                    <div>+56 9 3766 7709</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Google Maps y Waze con Logos */}
            <div className="pt-4 border-t border-white/5">
              <h4 className="font-bold text-white mb-3 text-sm tracking-wide">Cómo Llegar</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Google Maps Button */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'click_navigation', {
                      event_category: 'Maps',
                      event_label: 'Google Maps Navigation'
                    });
                  }
                }}
                className="w-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white rounded-lg py-2.5 sm:py-3 px-4 flex items-center justify-center gap-2.5 transition-all text-xs sm:text-base font-medium shadow-sm hover:scale-[1.01] overflow-hidden"
              >
                <img src="/logos/Diseño%20sin%20título%20(1).png" alt="Google Maps" className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0 scale-[1.3]" />
                <span>Google Maps</span>
              </a>

              {/* Waze Button */}
              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'click_navigation', {
                      event_category: 'Maps',
                      event_label: 'Waze Navigation'
                    });
                  }
                }}
                className="w-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white rounded-lg py-2.5 sm:py-3 px-4 flex items-center justify-center gap-2.5 transition-all text-xs sm:text-base font-medium shadow-sm hover:scale-[1.01] overflow-hidden"
              >
                <img src="/logos/png-transparent-waze-gps-navigation-systems-app-store-ipa-waze-smiley-android-traffic-thumbnail%20(1).png" alt="Waze" className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0 scale-[1.3]" />
                <span>Waze</span>
              </a>
            </div>
            </div>

          </div>
        </div>
    </section>
  );
}
