'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gift, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function VipQrLandingPage({ params }: { params: { codigo: string } }) {
    const [mounted, setMounted] = useState(false);
    
    // El codigo es el origen, ej: 'edificio-parque-titikaka'
    const sourceCode = params.codigo;

    useEffect(() => {
        setMounted(true);
        // Aquí es donde en el futuro inyectaríamos una llamada al Supabase CRM
        // para registrar silenciosamente que se escaneó un QR desde 'sourceCode'
        console.log(`[CRM Analytics] Tracking QR scan from source: ${sourceCode}`);
    }, [sourceCode]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-brand-charcoal text-white font-sans flex flex-col justify-center items-center p-6 text-center">
            <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                
                {/* VIP Badge */}
                <div className="mx-auto w-16 h-16 rounded-full bg-brand-terracotta/20 border border-brand-terracotta/50 flex items-center justify-center">
                    <Gift className="w-8 h-8 text-brand-terracotta" />
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-widest text-brand-terracotta font-bold">
                        Invitación Exclusiva
                    </p>
                    <h1 className="font-serif text-4xl md:text-5xl text-brand-sand">
                        Bienvenida al Círculo Privado de Elena
                    </h1>
                </div>

                <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-md mx-auto">
                    Gracias por escanear tu tarjeta física. Como vecina seleccionada, tienes acceso directo a una <strong>sesión de diseño y estilismo de cortesía</strong> en nuestro atelier de alta costura, además de un beneficio especial en tu primer encargo a medida.
                </p>

                <div className="bg-white/5 border border-white/10 p-6 rounded-sm text-left flex gap-4 max-w-sm mx-auto">
                    <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                        <h4 className="font-medium text-sm text-white">Beneficio Activado</h4>
                        <p className="text-[10px] text-gray-400 mt-1">Tu código <span className="font-mono text-brand-terracotta uppercase">{sourceCode}</span> ha sido verificado.</p>
                    </div>
                </div>

                <div className="pt-6">
                    <Link 
                        href={`https://wa.me/56930510626?text=Hola%20Elena,%20escane%C3%A9%20mi%20tarjeta%20f%C3%ADsica%20VIP%20(c%C3%B3digo:%20${sourceCode})%20y%20me%20gustar%C3%ADa%20agendar%20mi%20cita%20de%20dise%C3%B1o.`}
                        target="_blank"
                        className="inline-flex bg-brand-terracotta text-white hover:bg-brand-terracotta/90 px-8 py-4 rounded-sm transition-all items-center gap-2 uppercase tracking-widest text-xs font-bold"
                    >
                        Reclamar Beneficio VIP por WhatsApp <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="flex justify-center gap-1 pt-12 text-gray-600">
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                </div>
            </div>
        </div>
    );
}
