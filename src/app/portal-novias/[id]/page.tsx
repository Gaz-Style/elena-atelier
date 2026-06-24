'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Loader2, CheckCircle2, ChevronRight, Calendar, MapPin, User, Phone, FileText } from 'lucide-react';

export default function PortalNoviasPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
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
            if (data) {
                setProject(data);
            }
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
                setSuccess(true);
                // Optionally redirect to pending state
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
            <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#C17F5F]" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="font-serif text-3xl text-[#1A1A1A] mb-2">Proyecto no encontrado</h1>
                <p className="text-gray-500">El enlace al que intentas acceder no es válido o ha expirado.</p>
            </div>
        );
    }

    const typeConfig: Record<string, string> = {
        novia: 'Novia',
        madrina: 'Madrina',
        graduacion: 'Graduación',
    };

    return (
        <div className="min-h-screen bg-[#F8F6F0] font-sans text-[#1A1A1A] flex flex-col relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-96 bg-[#1A1A1A] z-0"></div>
            <div className="absolute top-0 right-0 w-1/3 h-96 bg-gradient-to-l from-white/10 to-transparent z-0"></div>

            <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 md:py-24 relative z-10">
                {/* Logo & Header */}
                <div className="text-center mb-12">
                    <h1 className="font-serif text-3xl md:text-5xl font-light text-white tracking-[0.2em] mb-2">ELENA</h1>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/70 font-bold">LA COSTURERA</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-sm shadow-2xl p-8 md:p-12 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#F8F6F0] rounded-full flex items-center justify-center shadow-inner">
                        <div className="w-12 h-12 rounded-full bg-[#C17F5F] text-white flex items-center justify-center">
                            <Heart className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="text-center mt-6 mb-10">
                        <h2 className="font-serif text-2xl md:text-4xl text-[#1A1A1A] mb-3">Bienvenida a tu Portal</h2>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-xl mx-auto">
                            Estamos felices de comenzar el proceso de creación de tu vestido de {typeConfig[project.project_type]?.toLowerCase() || 'ensueño'}. 
                            Para formalizar tu contrato y presupuesto, por favor completa los siguientes datos.
                        </p>
                    </div>

                    {errorMsg && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-sm text-sm text-center">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Seccion: Datos Personales */}
                        <div>
                            <h3 className="font-bold text-xs uppercase tracking-widest text-[#C17F5F] border-b border-gray-100 pb-2 mb-6">1. Datos Personales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" /> Nombre Completo
                                    </label>
                                    <input 
                                        type="text" 
                                        name="fullName" 
                                        required 
                                        defaultValue={project.customers?.full_name || ''}
                                        className="w-full bg-[#F8F6F0] border border-transparent focus:border-[#C17F5F] rounded-sm px-4 py-3 text-sm outline-none transition-colors" 
                                        placeholder="Tu nombre y apellido"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5" /> RUT
                                    </label>
                                    <input 
                                        type="text" 
                                        name="rut" 
                                        required 
                                        defaultValue={project.customers?.rut || ''}
                                        className="w-full bg-[#F8F6F0] border border-transparent focus:border-[#C17F5F] rounded-sm px-4 py-3 text-sm outline-none transition-colors" 
                                        placeholder="12.345.678-9"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5" /> Teléfono WhatsApp
                                    </label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        required 
                                        defaultValue={project.customers?.phone || ''}
                                        className="w-full bg-[#F8F6F0] border border-transparent focus:border-[#C17F5F] rounded-sm px-4 py-3 text-sm outline-none transition-colors" 
                                        placeholder="+56 9 1234 5678"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seccion: Detalles del Evento */}
                        <div>
                            <h3 className="font-bold text-xs uppercase tracking-widest text-[#C17F5F] border-b border-gray-100 pb-2 mb-6">2. Detalles del Evento</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" /> Fecha del Evento
                                    </label>
                                    <input 
                                        type="date" 
                                        name="eventDate" 
                                        required 
                                        defaultValue={project.event_date ? project.event_date.split('T')[0] : ''}
                                        className="w-full bg-[#F8F6F0] border border-transparent focus:border-[#C17F5F] rounded-sm px-4 py-3 text-sm outline-none transition-colors" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" /> Lugar del Evento
                                    </label>
                                    <input 
                                        type="text" 
                                        name="eventVenue" 
                                        required 
                                        defaultValue={project.event_venue || ''}
                                        className="w-full bg-[#F8F6F0] border border-transparent focus:border-[#C17F5F] rounded-sm px-4 py-3 text-sm outline-none transition-colors" 
                                        placeholder="Ej: Centro de Eventos, Viña..."
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <Heart className="w-3.5 h-3.5" /> Notas sobre tu vestido (Opcional)
                                    </label>
                                    <textarea 
                                        name="notes" 
                                        rows={3}
                                        defaultValue={project.description || ''}
                                        className="w-full bg-[#F8F6F0] border border-transparent focus:border-[#C17F5F] rounded-sm px-4 py-3 text-sm outline-none transition-colors resize-none" 
                                        placeholder="Cuéntanos algún detalle importante que quieras que quede en tu ficha..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full bg-[#1A1A1A] hover:bg-[#C17F5F] text-white py-4 rounded-sm text-sm font-bold uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 disabled:bg-gray-300 disabled:cursor-not-allowed group"
                            >
                                {submitting ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                                ) : (
                                    <>
                                        Generar Contrato 
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest">
                                Al hacer clic, se generará tu contrato formal con estos datos.
                            </p>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
