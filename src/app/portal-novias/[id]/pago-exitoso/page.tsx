'use client';

import React, { useEffect, useState } from 'react';
import { Heart, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PortalNoviasPagoExitosoPage() {
    return (
        <div className="min-h-screen bg-[#F8F6F0] font-sans text-[#1A1A1A] flex flex-col relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-96 bg-[#1A1A1A] z-0"></div>
            
            <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-12 md:py-24 relative z-10 flex flex-col items-center justify-center">
                
                {/* Main Card */}
                <div className="bg-white rounded-sm shadow-[0_20px_60px_rgba(193,127,95,0.08)] p-10 md:p-16 relative text-center w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#F8F6F0] rounded-full flex items-center justify-center shadow-inner">
                        <div className="w-16 h-16 rounded-full bg-emerald-500 text-[#1A1A1A] flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Heart className="w-8 h-8" />
                        </div>
                    </div>

                    <h2 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] mt-8 mb-4">
                        ¡Reserva Confirmada!
                    </h2>
                    
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Hemos recibido el pago de tu reserva exitosamente. Tu cupo de producción ya está asegurado en nuestro taller.
                    </p>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-6 mb-8 flex flex-col items-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
                        <h3 className="font-bold text-sm mb-2 text-emerald-800">¡Felicidades!</h3>
                        <p className="text-xs text-emerald-700">
                            Pronto nos contactaremos contigo para agendar tu primera prueba de vestuario. 
                            Mientras tanto, te hemos enviado un correo de confirmación con tu recibo.
                        </p>
                    </div>

                    <Link 
                        href="/" 
                        className="text-[10px] uppercase tracking-widest font-bold text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </main>
        </div>
    );
}
