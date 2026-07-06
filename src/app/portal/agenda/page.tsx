'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import PremiumCalendar from '@/components/PremiumCalendar';
import { bookCatalogConsultationAction } from './actions';
import BackLink from '@/components/BackLink';

export default function PortalAgendaPage() {
    const router = useRouter();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirmBooking = async (dateStr: string, timeStr: string) => {
        setIsConfirming(true);
        setError(null);
        
        try {
            const res = await bookCatalogConsultationAction({ dateStr, timeStr });
            if (res.success) {
                setIsSuccess(true);
            } else {
                setError(res.error || 'Ocurrió un error al agendar la cita.');
            }
        } catch (err: any) {
            setError(err.message || 'Error de red.');
        } finally {
            setIsConfirming(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-brand-charcoal text-white font-sans flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-2xl p-12 text-center shadow-2xl border border-white/10 rounded-sm space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="font-serif text-3xl text-brand-sand">¡Cita Confirmada!</h1>
                        <p className="text-white/60 text-sm leading-relaxed">Tu cita exclusiva para confección a medida ha sido agendada. Hemos enviado los detalles a tu correo electrónico.</p>
                    </div>
                    <button 
                        onClick={() => router.push('/graduacion')}
                        className="w-full glass-btn group relative inline-flex items-center justify-center px-6 py-4 border-[0.5px] border-white/20 text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold bg-white/[0.08] hover:bg-[#f5f2eb]/90 hover:text-black transition-all rounded-[1px]"
                    >
                        Volver al Catálogo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-charcoal text-white font-sans relative overflow-x-hidden pt-24 pb-32">
            <BackLink />
            <div className="max-w-5xl mx-auto px-6">
                <div className="mb-12 space-y-4 text-center lg:text-left">
                    <span className="text-brand-sand text-[10px] uppercase tracking-[0.4em] font-semibold">Taller Tabancura</span>
                    <h1 className="font-serif text-4xl md:text-5xl text-white">Agendar Evaluación</h1>
                    <p className="text-white/60 max-w-xl text-sm leading-relaxed">Selecciona el día y la hora para tu visita al taller. En esta sesión tomaremos tus medidas, discutiremos el diseño de tu vestido y definiremos los últimos detalles.</p>
                </div>
                
                {error && (
                    <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-sm text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-sm p-6 md:p-10 shadow-2xl">
                    <PremiumCalendar onConfirm={handleConfirmBooking} isConfirming={isConfirming} />
                </div>
            </div>
        </div>
    );
}
