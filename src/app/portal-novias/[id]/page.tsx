'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Loader2, ChevronRight, User, Phone, FileText, Calendar, MapPin } from 'lucide-react';

export default function PortalNoviasPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (params?.id) {
            loadProject(params.id as string);
        }
    }, [params]);

    async function loadProject(id: string) {
        try {
            const { getBridalProjectById } = await import('@/app/admin/novias/actions');
            const data = await getBridalProjectById(id);
            if (data) setProject(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');
        try {
            const formData = new FormData(e.currentTarget);
            const { processBridalFormAction } = await import('@/app/admin/novias/actions');
            const res = await processBridalFormAction(params.id as string, formData);
            if (res.success) {
                router.push(`/portal-novias/${params.id}/contrato`);
            } else {
                setErrorMsg(res.error || 'Ocurrió un error al procesar el formulario.');
            }
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#C17F5F]" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="font-serif text-3xl text-white mb-2">Proyecto no encontrado</h1>
                <p className="text-gray-400">El enlace al que intentas acceder no es válido o ha expirado.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-sans flex items-center justify-center py-12 px-4 relative overflow-hidden" style={{ backgroundImage: "radial-gradient(circle at center, #1A1A1A 0%, #0A0A0A 100%)" }}>
            
            <div className="w-full max-w-2xl relative z-10">
                {/* Minimal Header inside the page flow */}
                <div className="text-center mb-12">
                    <h1 className="font-serif text-3xl md:text-4xl font-black text-white tracking-[0.3em] mb-2">ELENA</h1>
                    <p className="text-[9px] uppercase tracking-[0.5em] text-white/70 font-bold ml-1">LA COSTURERA</p>
                </div>

                {/* Form Card */}
                <div className="bg-[#111111]/80 backdrop-blur-md rounded-lg shadow-2xl p-8 md:p-12 border border-white/10 relative">
                    
                    <div className="text-center mb-10">
                        <div className="text-[#C17F5F] mb-4 text-xs tracking-widest uppercase">✦ Ingreso Atelier ✦</div>
                        <h2 className="font-serif text-3xl text-white mb-4 italic">Bienvenida a tu Portal</h2>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto font-light">
                            Estamos felices de diseñar el vestido de tus sueños. 
                            Por favor completa los siguientes datos para formalizar tu reserva.
                        </p>
                    </div>

                    {errorMsg && (
                        <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded text-xs text-center">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">
                        
                        <div>
                            <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#C17F5F] border-b border-white/10 pb-3 mb-6 flex items-center gap-2">
                                <User className="w-3.5 h-3.5" /> 1. Datos Personales
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1 relative group">
                                    <label className="text-[9px] text-gray-500 uppercase tracking-widest absolute -top-4 left-0 transition-colors group-focus-within:text-[#C17F5F]">Nombre Completo</label>
                                    <input 
                                        type="text" 
                                        name="fullName" 
                                        required 
                                        defaultValue={project.customers?.full_name || ''}
                                        className="w-full bg-transparent border-b border-white/20 focus:border-[#C17F5F] py-2 text-sm text-white outline-none transition-colors placeholder-white/20" 
                                        placeholder="Tu nombre y apellido"
                                    />
                                </div>
                                <div className="space-y-1 relative group">
                                    <label className="text-[9px] text-gray-500 uppercase tracking-widest absolute -top-4 left-0 transition-colors group-focus-within:text-[#C17F5F]">RUT</label>
                                    <input 
                                        type="text" 
                                        name="rut" 
                                        required 
                                        defaultValue={project.customers?.rut || ''}
                                        className="w-full bg-transparent border-b border-white/20 focus:border-[#C17F5F] py-2 text-sm text-white outline-none transition-colors placeholder-white/20" 
                                        placeholder="12.345.678-9"
                                    />
                                </div>
                                <div className="space-y-1 relative group md:col-span-2">
                                    <label className="text-[9px] text-gray-500 uppercase tracking-widest absolute -top-4 left-0 transition-colors group-focus-within:text-[#C17F5F] flex items-center gap-2">
                                        Teléfono WhatsApp
                                    </label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        required 
                                        defaultValue={project.customers?.phone || ''}
                                        className="w-full bg-transparent border-b border-white/20 focus:border-[#C17F5F] py-2 text-sm text-white outline-none transition-colors placeholder-white/20" 
                                        placeholder="+56 9 1234 5678"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#C17F5F] border-b border-white/10 pb-3 mb-6 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> 2. Detalles del Evento
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1 relative group">
                                    <label className="text-[9px] text-gray-500 uppercase tracking-widest absolute -top-4 left-0 transition-colors group-focus-within:text-[#C17F5F]">Fecha del Evento</label>
                                    <input 
                                        type="date" 
                                        name="eventDate" 
                                        required 
                                        defaultValue={project.event_date ? project.event_date.split('T')[0] : ''}
                                        className="w-full bg-transparent border-b border-white/20 focus:border-[#C17F5F] py-2 text-sm text-white outline-none transition-colors [color-scheme:dark]" 
                                    />
                                </div>
                                <div className="space-y-1 relative group">
                                    <label className="text-[9px] text-gray-500 uppercase tracking-widest absolute -top-4 left-0 transition-colors group-focus-within:text-[#C17F5F]">Lugar del Evento</label>
                                    <input 
                                        type="text" 
                                        name="eventVenue" 
                                        required 
                                        defaultValue={project.event_venue || ''}
                                        className="w-full bg-transparent border-b border-white/20 focus:border-[#C17F5F] py-2 text-sm text-white outline-none transition-colors placeholder-white/20" 
                                        placeholder="Ej: Centro de Eventos..."
                                    />
                                </div>
                                <div className="space-y-1 relative group md:col-span-2">
                                    <label className="text-[9px] text-gray-500 uppercase tracking-widest absolute -top-4 left-0 transition-colors group-focus-within:text-[#C17F5F]">Notas Adicionales (Opcional)</label>
                                    <textarea 
                                        name="notes" 
                                        rows={2}
                                        defaultValue={project.description || ''}
                                        className="w-full bg-transparent border-b border-white/20 focus:border-[#C17F5F] py-2 text-sm text-white outline-none transition-colors resize-none placeholder-white/20" 
                                        placeholder="Detalles importantes sobre tu vestido..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 text-center">
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full border border-[#C17F5F] text-[#C17F5F] hover:bg-[#C17F5F] hover:text-white py-4 rounded text-xs font-bold uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {submitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                                ) : (
                                    <>
                                        Generar Contrato 
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            <p className="text-[9px] text-gray-500 mt-4 uppercase tracking-widest">
                                Al continuar, se generará tu contrato formal y presupuesto.
                            </p>
                        </div>
                    </form>
                </div>
                
                <div className="text-center mt-8">
                    <p className="text-[#C17F5F] font-serif italic text-lg mb-1">Con cariño,</p>
                    <p className="text-[8px] text-gray-500 uppercase tracking-widest">Elena La Costurera | Atelier</p>
                </div>
            </div>
        </div>
    );
}
