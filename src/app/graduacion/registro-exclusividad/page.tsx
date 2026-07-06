'use client';

import React, { useState } from 'react';
import { checkDesignExclusivityAction } from '../../admin/pos/actions';
import { ShieldCheck, HelpCircle, ArrowRight, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ExclusivityCheckPage() {
    const [colegio, setColegio] = useState('');
    const [diseno, setDiseno] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [result, setResult] = useState<{ checked: boolean; available: boolean; error?: string } | null>(null);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!colegio.trim() || !diseno.trim()) return;

        setIsChecking(true);
        setResult(null);

        try {
            const res = await checkDesignExclusivityAction('graduacion', colegio, diseno);
            if (res.success) {
                setResult({
                    checked: true,
                    available: !!res.available
                });
            } else {
                setResult({
                    checked: true,
                    available: true,
                    error: res.error || 'Ocurrió un error al verificar.'
                });
            }
        } catch (err: any) {
            setResult({
                checked: true,
                available: true,
                error: err.message || 'Error de conexión.'
            });
        } finally {
            setIsChecking(false);
        }
    };

    // Pre-filled WhatsApp link
    const getBookingLink = (status: 'available' | 'locked') => {
        const text = status === 'available'
            ? `Hola Elena La Costurera, verifiqué que el diseño "${diseno}" está disponible para mi colegio "${colegio}". Me gustaría agendar una cita para diseñar mi vestido de graduación a medida y bloquear este modelo.`
            : `Hola Elena La Costurera, verifiqué que el diseño "${diseno}" ya está reservado para mi colegio "${colegio}". De todas formas, me gustaría agendar una cita de diseño a medida para explorar otros modelos exclusivos.`;
        return `https://wa.me/56930510626?text=${encodeURIComponent(text)}`;
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-[#cda45e] selection:text-black py-20 flex items-center justify-center">
            <div className="max-w-xl w-full mx-auto px-6">
                <div className="bg-[#121212] border border-white/5 p-8 md:p-12 shadow-2xl rounded-sm space-y-8">
                    
                    <div className="text-center space-y-3">
                        <span className="inline-flex p-3 bg-[#cda45e]/10 border border-[#cda45e]/20 rounded-full text-[#cda45e] mb-2">
                            <ShieldCheck className="w-6 h-6" />
                        </span>
                        <h1 className="font-serif text-3xl text-white">Consulta de Exclusividad</h1>
                        <p className="text-white/60 text-xs leading-relaxed max-w-sm mx-auto">
                            Ingresa los datos de tu colegio y el diseño para verificar si está disponible para bloqueo en tu gala.
                        </p>
                    </div>

                    <form onSubmit={handleCheck} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1 ml-1">Colegio y Curso</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={colegio} 
                                    onChange={(e) => setColegio(e.target.value)}
                                    placeholder="Ej. Villa Maria 4to Medio A" 
                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-sm text-sm text-white outline-none focus:border-[#cda45e] focus:bg-white/10 transition-all placeholder:text-white/20"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1 ml-1">Nombre del Vestido / Modelo</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={diseno} 
                                    onChange={(e) => setDiseno(e.target.value)}
                                    placeholder="Ej. Clara Celeste" 
                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-sm text-sm text-white outline-none focus:border-[#cda45e] focus:bg-white/10 transition-all placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isChecking || !colegio.trim() || !diseno.trim()}
                            className="w-full bg-[#cda45e] text-black font-bold uppercase tracking-widest text-xs py-4 hover:bg-[#b08b49] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(205,164,94,0.15)]"
                        >
                            {isChecking ? (
                                <Loader2 className="w-4 h-4 animate-spin text-black" />
                            ) : (
                                <>Verificar Disponibilidad <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    {result?.checked && (
                        <div className="pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
                            {result.error ? (
                                <p className="text-xs text-red-400 text-center font-bold">⚠ {result.error}</p>
                            ) : result.available ? (
                                <div className="text-center space-y-4 bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-sm">
                                    <div className="flex justify-center text-emerald-500">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-serif text-lg text-white">¡Modelo Disponible!</h3>
                                        <p className="text-white/60 text-xs">El diseño "{diseno}" está libre para {colegio}.</p>
                                    </div>
                                    <Link 
                                        href={getBookingLink('available')}
                                        target="_blank"
                                        className="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-xs py-3 transition-colors mt-2"
                                    >
                                        Bloquear e Iniciar mi Vestido
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-center space-y-4 bg-amber-500/10 border border-amber-500/20 p-6 rounded-sm">
                                    <div className="flex justify-center text-amber-500">
                                        <AlertTriangle className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-serif text-lg text-white">Diseño Bloqueado</h3>
                                        <p className="text-white/60 text-xs">El diseño "{diseno}" ya fue reservado para {colegio}.</p>
                                    </div>
                                    <p className="text-white/40 text-[10px] leading-normal px-4">
                                        Para asegurar tu exclusividad total, Elena diseñará una silueta alternativa única para ti en tu cita.
                                    </p>
                                    <Link 
                                        href={getBookingLink('locked')}
                                        target="_blank"
                                        className="inline-flex items-center justify-center w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs py-3 transition-colors mt-2"
                                    >
                                        Agendar Cita para Diseño Alternativo
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="text-center">
                        <Link href="/graduacion" className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                            &larr; Volver a Graduaciones
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
