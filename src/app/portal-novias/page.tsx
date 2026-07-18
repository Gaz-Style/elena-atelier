'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Sparkles, Lock } from 'lucide-react';
import { loginBridalPortal } from './actions';

export default function BridalPortalLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [rut, setRut] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const res = await loginBridalPortal(email, rut);
            if (res.success && res.projectId) {
                // Redirect to the personalized dashboard
                router.push(`/portal-novias/${res.projectId}`);
            } else {
                setErrorMsg(res.error || 'Credenciales inválidas');
                setLoading(false);
            }
        } catch (error) {
            setErrorMsg('Ocurrió un error inesperado');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070707] text-white font-sans flex items-center justify-center py-12 px-4 relative overflow-hidden" style={{ backgroundImage: "radial-gradient(circle at center, #141414 0%, #070707 100%)" }}>
            
            {/* Decorative background gradients */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#C17F5F]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#C17F5F]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-12">
                    <div className="flex flex-col items-stretch justify-center w-max mx-auto">
                        <div className="flex justify-between w-full font-serif text-3xl font-black uppercase text-white leading-none drop-shadow-sm">
                            <span>E</span><span>L</span><span>E</span><span>N</span><span>A</span>
                        </div>
                        <div
                            className="font-sans text-[0.75rem] font-bold uppercase text-white/70 mt-1 text-center"
                            style={{ letterSpacing: '0.45em', marginRight: '-0.45em' }}
                        >
                            La Costurera
                        </div>
                    </div>
                </div>

                <div className="bg-[#111111]/80 backdrop-blur-md rounded-lg shadow-2xl p-8 border border-white/10 relative">
                    <div className="text-center mb-8">
                        <div className="text-[#C17F5F] mb-3 text-[10px] tracking-widest uppercase flex items-center justify-center gap-2">
                            <Lock className="w-3.5 h-3.5" /> Portal Privado
                        </div>
                        <h2 className="font-serif text-2xl text-white mb-2 italic">Acceso Exclusivo</h2>
                        <p className="text-xs text-gray-400 font-light">
                            Ingresa tus datos para acceder al progreso de tu vestido y gestionar tus citas.
                        </p>
                    </div>

                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded text-xs text-center">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-1 relative group">
                            <label className="text-[9px] text-gray-500 uppercase tracking-widest absolute -top-4 left-0 transition-colors group-focus-within:text-[#C17F5F]">Correo Electrónico</label>
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-white/20 focus:border-[#C17F5F] py-3 text-sm text-white outline-none transition-colors placeholder-white/10" 
                                placeholder="tu@correo.com"
                            />
                        </div>
                        <div className="space-y-1 relative group pt-2">
                            <label className="text-[9px] text-gray-500 uppercase tracking-widest absolute -top-2 left-0 transition-colors group-focus-within:text-[#C17F5F]">RUT (Sin dígito verificador)</label>
                            <input 
                                type="text" 
                                required 
                                value={rut}
                                onChange={(e) => setRut(e.target.value.replace(/[^0-9]/g, ''))}
                                maxLength={8}
                                className="w-full bg-transparent border-b border-white/20 focus:border-[#C17F5F] py-3 text-sm text-white outline-none transition-colors placeholder-white/10" 
                                placeholder="Ej: 12345678"
                            />
                        </div>

                        <div className="pt-8">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full border border-[#C17F5F] bg-transparent text-[#C17F5F] hover:bg-[#C17F5F] hover:text-white py-4 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                                ) : (
                                    <>
                                        Ingresar a mi Portal 
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="text-center mt-8">
                    <p className="text-[9px] text-gray-600 uppercase tracking-widest flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#C17F5F]" /> Elena Atelier &middot; Santiago de Chile
                    </p>
                </div>
            </div>
        </div>
    );
}
