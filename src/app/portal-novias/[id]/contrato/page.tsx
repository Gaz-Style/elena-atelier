'use client';

import React from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PortalNoviasSuccessPage() {
    return (
        <div className="min-h-screen bg-[#F8F6F0] font-sans text-[#1A1A1A] flex flex-col relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-96 bg-[#1A1A1A] z-0"></div>
            
            <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-12 md:py-24 relative z-10 flex flex-col items-center justify-center">
                
                {/* Main Card */}
                <div className="bg-white rounded-sm shadow-2xl p-10 md:p-16 relative text-center w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#F8F6F0] rounded-full flex items-center justify-center shadow-inner">
                        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                    </div>

                    <h2 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] mt-8 mb-4">
                        ¡Datos Recibidos!
                    </h2>
                    
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Hemos actualizado tu ficha y generado tu presupuesto formal. 
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-sm p-6 mb-8 flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-[#C17F5F]">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-sm mb-2 text-gray-800">Revisa tu correo electrónico</h3>
                        <p className="text-xs text-gray-500">
                            Te acabamos de enviar el <strong>Contrato y Presupuesto</strong>. <br className="hidden md:block" />
                            Desde ese correo podrás leer las condiciones, aceptarlo y realizar el pago de la reserva.
                        </p>
                    </div>

                    <Link 
                        href="/" 
                        className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-gray-800 transition-colors"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </main>
        </div>
    );
}
