'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Calendar, ShieldCheck, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';
import { trackEvent } from '@/components/FacebookPixel';
import { trackTikTokEvent } from '@/components/TikTokPixel';
import { trackGAEvent } from '@/components/GoogleAnalytics';

export default function GraduationQualifierForm() {
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        serviceType: '',
        school: '',
        eventDate: '',
        stylePreference: '',
        details: '',
    });

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Track step progress
        trackEvent('Lead', { 
            content_name: 'Calificador Graduación - Paso 1',
            content_category: formData.serviceType 
        });
        trackTikTokEvent('Contact', {
            content_name: 'Calificador Graduación - Paso 1',
            content_category: formData.serviceType
        });
        trackGAEvent('Lead', 'Graduation Flow', 'Paso 1 Completado');

        // Server-side Event Relay
        fetch('/api/tracking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName: 'Lead',
                userData: {
                    email: formData.email,
                    phone: formData.phone,
                    name: formData.name
                },
                customData: {
                    content_name: 'Calificador Graduación - Paso 1',
                    content_category: formData.serviceType,
                    event_date: formData.eventDate
                }
            })
        }).catch((err) => console.error('Server tracking error:', err));

        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        // Simulate database/API registration
        await new Promise((resolve) => setTimeout(resolve, 1200));
        
        trackEvent('Schedule', {
            content_name: 'Diseño Calificado Completo',
            content_category: formData.serviceType,
            school: formData.school,
            style: formData.stylePreference
        });

        trackTikTokEvent('SubmitForm', {
            content_name: 'Diseño Calificado Completo',
            content_category: formData.serviceType,
            school: formData.school,
            style: formData.stylePreference
        });

        trackGAEvent('Schedule', 'Graduation Flow', 'Formulario Completo');

        // Server-side Event Relay
        fetch('/api/tracking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName: 'Schedule',
                userData: {
                    email: formData.email,
                    phone: formData.phone,
                    name: formData.name
                },
                customData: {
                    content_name: 'Diseño Calificado Completo',
                    content_category: formData.serviceType,
                    school: formData.school,
                    event_date: formData.eventDate
                }
            })
        }).catch((err) => console.error('Server tracking error:', err));

        setIsSaving(false);
        setStep(3);
    };

    const handleWhatsAppRedirect = () => {
        // Track the WhatsApp click as a conversion confirmation
        trackEvent('Contact', {
            method: 'WhatsApp Funnel CTA',
            content_name: 'Contacto Final Cita Graduación'
        });
        
        fetch('/api/tracking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName: 'Contact',
                customData: {
                    content_name: 'Contacto Final Cita Graduación',
                    content_category: 'WhatsApp'
                }
            })
        }).catch((err) => console.error('Server tracking error:', err));

        const formattedDate = formData.eventDate ? new Date(formData.eventDate).toLocaleDateString('es-CL') : 'por definir';
        const templateMessage = `Hola Elena Atelier, acabo de verificar mi diseño en la web para la graduación en el colegio/universidad *${formData.school}* el día *${formattedDate}*. Me interesa la opción *${formData.serviceType}*. ¿Tienen horas disponibles esta semana en Vitacura?`;
        
        const whatsappUrl = `https://wa.me/56937667709?text=${encodeURIComponent(templateMessage)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="max-w-xl mx-auto p-8 md:p-10 bg-[#121212]/95 border border-white/10 shadow-2xl rounded-sm text-white font-sans">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.form 
                        key="step1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-6" 
                        onSubmit={handleNextStep}
                    >
                        <div className="text-center pb-4">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-sand font-bold block mb-1">Paso 1 de 2</span>
                            <h2 className="font-serif text-2xl md:text-3xl text-white/95 tracking-wide">Tu Evento de Gala</h2>
                            <p className="text-xs text-white/50 mt-1">Ingresa los detalles básicos para verificar la disponibilidad de fecha.</p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-widest text-white/50 block font-bold">Selecciona tu Servicio</label>
                            {[
                                { val: 'Todo Incluido ($160k - $220k)', label: 'Diseño y Confección Todo Incluido', desc: 'Nosotros nos encargamos de todo (incluye telas premium y confección a medida).' },
                                { val: 'Trae tu Tela ($120k - $160k)', label: 'Diseño y Confección - Trae tu tela', desc: 'Tú compras la tela que te encante y nosotros nos encargamos del diseño y calce.' },
                                { val: 'Fiesta / Invitada / Madrinas', label: 'Vestido de Fiesta o Gala a Medida', desc: 'Para bodas, eventos de noche, madrinas o graduaciones universitarias.' }
                            ].map((opt) => (
                                <button
                                    key={opt.val}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, serviceType: opt.val })}
                                    className={`w-full p-4 text-left border rounded-sm transition-all flex items-start gap-3 cursor-pointer bg-transparent ${formData.serviceType === opt.val ? 'border-brand-sand bg-brand-sand/5' : 'border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${formData.serviceType === opt.val ? 'border-brand-sand bg-brand-sand' : 'border-white/30'}`}>
                                            {formData.serviceType === opt.val && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <span className={`block text-sm font-semibold transition-colors ${formData.serviceType === opt.val ? 'text-brand-sand' : 'text-white/80'}`}>{opt.label}</span>
                                        <span className="text-[11px] text-white/40 block mt-0.5 leading-relaxed">{opt.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/50 block font-bold flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-brand-sand" /> Fecha de la Graduación / Evento
                            </label>
                            <input
                                required
                                type="date"
                                className="w-full border-b border-white/20 py-3 bg-transparent text-white focus:border-brand-sand outline-none transition-colors text-sm appearance-none cursor-pointer"
                                value={formData.eventDate}
                                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!formData.serviceType || !formData.eventDate}
                            className="w-full glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-300 hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.1)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                            <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-300">
                                Siguiente
                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
                            </span>
                        </button>
                    </motion.form>
                )}

                {step === 2 && (
                    <motion.form 
                        key="step2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-6" 
                        onSubmit={handleSubmit}
                    >
                        <div className="text-center pb-4">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-sand font-bold block mb-1">Paso 2 de 2</span>
                            <h2 className="font-serif text-2xl md:text-3xl text-white/95 tracking-wide">Viabilidad de Diseño</h2>
                            <p className="text-xs text-white/50 mt-1">Queremos conocer tu entorno para diseñar tu pieza perfecta.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/50 block font-bold">Colegio o Universidad del Evento</label>
                                <input
                                    required
                                    className="w-full border-b border-white/20 py-3 bg-transparent text-white focus:border-brand-sand outline-none transition-colors placeholder:text-white/20 text-sm"
                                    placeholder="Ej. Santiago College, Villa María, etc."
                                    value={formData.school}
                                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                />
                            </div>

                            <div className="p-4 bg-brand-sand/5 border border-brand-sand/20 rounded-sm flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-brand-sand flex-shrink-0 mt-0.5" />
                                <div className="text-[11px] text-white/70 leading-relaxed">
                                    <strong className="text-brand-sand">Diseño de Autor Irrepetible:</strong> Confeccionamos cada pieza sobre tus medidas y estilo desde cero. Tu vestido será una creación exclusiva e inédita.
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-white/50 block font-bold">Estilo de Vestido</label>
                                    <select
                                        className="w-full border-b border-white/20 py-2.5 outline-none focus:border-brand-sand bg-transparent text-white cursor-pointer appearance-none text-xs"
                                        onChange={(e) => setFormData({ ...formData, stylePreference: e.target.value })}
                                        value={formData.stylePreference}
                                    >
                                        <option value="" className="bg-brand-charcoal text-white">Seleccione estilo...</option>
                                        <option value="minimal" className="bg-brand-charcoal text-white">Minimalista / Liso / Limpio</option>
                                        <option value="classic" className="bg-brand-charcoal text-white">Princesa / Corte Clásico</option>
                                        <option value="bold" className="bg-brand-charcoal text-white">Moderno / Sirena / Espalda abierta</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-white/50 block font-bold">Tu Nombre</label>
                                    <input
                                        required
                                        className="w-full border-b border-white/20 py-2 bg-transparent text-white focus:border-brand-sand outline-none transition-colors placeholder:text-white/20 text-xs"
                                        placeholder="Nombre completo"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-white/50 block font-bold">Email</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full border-b border-white/20 py-2 bg-transparent text-white focus:border-brand-sand outline-none transition-colors placeholder:text-white/20 text-xs"
                                        placeholder="correo@ejemplo.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-white/50 block font-bold">WhatsApp</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full border-b border-white/20 py-2 bg-transparent text-white focus:border-brand-sand outline-none transition-colors placeholder:text-white/20 text-xs"
                                        placeholder="+569..."
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 border border-white/20 py-4 uppercase tracking-widest text-xs font-semibold hover:bg-white/5 transition-all rounded-sm cursor-pointer"
                            >
                                Atrás
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || !formData.school || !formData.name || !formData.email || !formData.phone}
                                className="flex-[2] glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-300 hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.1)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                                {isSaving ? <span className="text-white/60">Verificando...</span> : (
                                    <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-300">
                                        Validar Disponibilidad
                                        <Sparkles className="w-4 h-4 transition-transform duration-300 flex-shrink-0" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </motion.form>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8 space-y-6"
                    >
                        <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto text-green-500 text-2xl shadow-md">✓</div>
                        <div className="space-y-2">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-sand font-bold block">Solicitud Recibida</span>
                            <h2 className="font-serif text-2xl md:text-3xl text-white/95 tracking-wide">¡Tu Propuesta de Diseño es Viable!</h2>
                            <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
                                Contamos con cupos en agenda para diseñar y confeccionar tu vestido a medida para tu gala en <strong className="text-brand-sand">{formData.school}</strong>.
                            </p>
                        </div>

                        <div className="border border-white/5 p-4 rounded-sm bg-white/[0.01] text-xs text-white/40 max-w-sm mx-auto flex items-center gap-2 justify-center">
                            <AlertCircle className="w-4 h-4 text-brand-sand" /> Reserva tu cupo de asesoría de diseño para asegurar tu fecha de entrega.
                        </div>

                        <div className="pt-4 max-w-xs mx-auto">
                            <button
                                onClick={handleWhatsAppRedirect}
                                className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] text-black font-semibold px-6 py-4 rounded-sm hover:bg-[#1ebd59] transition-colors duration-300 shadow-[0_8px_24px_rgba(37,211,102,0.2)] text-xs uppercase tracking-widest cursor-pointer"
                            >
                                <MessageCircle className="w-5 h-5 text-black" />
                                Agendar Cita en Vitacura
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
