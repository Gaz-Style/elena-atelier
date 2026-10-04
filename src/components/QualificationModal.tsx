'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { trackGAEvent } from './GoogleAnalytics';

interface QualificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QualificationModal({ isOpen, onClose }: QualificationModalProps) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState('');
  const [commune, setCommune] = useState('');

  const services = [
    'Vestido de Novia / Alta Costura',
    'Arreglo o Sastrería (Bastas, Cierres, etc.)',
    'Vestido de Graduación / Fiesta',
    'B2B / Producción de Marca'
  ];

  const communes = [
    'Vitacura',
    'Las Condes',
    'Lo Barnechea',
    'La Dehesa',
    'Providencia',
    'Otra Comuna (RM)'
  ];

  const handleNext = () => {
    if (step === 1 && service) setStep(2);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  const handleWhatsAppRedirect = () => {
    // Send event before redirect
    trackGAEvent('generate_lead', 'WhatsApp_Qualify', `${service} - ${commune}`, 1);
    
    if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead');
    }

    const text = `Hola Elena, me interesa cotizar un servicio de *${service}*. Soy de *${commune}*.`;
    const url = `https://wa.me/56972812907?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onClose();
    // Reset state after closing
    setTimeout(() => {
        setStep(1);
        setService('');
        setCommune('');
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-white/10 w-full max-w-md p-8 rounded-sm shadow-2xl relative"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-brand-sand block mb-2">
                  Paso {step} de 2
                </span>
                <h3 className="font-serif text-2xl text-white">
                  {step === 1 ? '¿Qué servicio buscas?' : '¿En qué comuna estás?'}
                </h3>
              </div>

              {step === 1 && (
                <div className="space-y-3">
                  {services.map((s) => (
                    <button
                      key={s}
                      onClick={() => setService(s)}
                      className={`w-full text-left px-5 py-4 text-sm font-light transition-all rounded-sm border ${
                        service === s
                          ? 'bg-[#C17F5F] border-[#C17F5F] text-white'
                          : 'bg-transparent border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    onClick={handleNext}
                    disabled={!service}
                    className="w-full mt-6 flex items-center justify-center gap-2 bg-white text-black py-4 text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                  >
                    Continuar <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {communes.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCommune(c)}
                        className={`w-full text-left px-4 py-3 text-xs font-light transition-all rounded-sm border ${
                          commune === c
                            ? 'bg-[#C17F5F] border-[#C17F5F] text-white'
                            : 'bg-transparent border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                     <button
                        onClick={handleBack}
                        className="flex-shrink-0 flex items-center justify-center px-4 border border-white/10 text-white hover:bg-white/5 transition-colors"
                     >
                         <ArrowLeft className="w-4 h-4" />
                     </button>
                     <button
                        onClick={handleWhatsAppRedirect}
                        disabled={!commune}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#20bd5a] transition-colors shadow-lg shadow-[#25D366]/20"
                     >
                        Ir a WhatsApp 
                     </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
