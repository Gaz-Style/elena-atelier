'use client';

import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, X, Loader2, CheckCircle2, ShieldCheck, User, Phone, Mail, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import BackLink from '@/components/BackLink';
import PremiumCalendar from '@/components/PremiumCalendar';
import { guardarCitaCliente } from './actions';

export default function AgendaPage() {
    // Vista actual en pantalla única centrada:
    // 'hero' -> Vista Hero inicial
    // 'step1' -> Vista PremiumCalendar (Consultando disponibilidad real de BD en vivo)
    // 'step2' -> Vista Formulario Registro Modelo Oficial (Identidad, Email, WhatsApp, Estilo, Ocasión)
    // 'step3' -> Vista Confirmación Éxito (Glassmorphism)
    const [activeView, setActiveView] = useState<'hero' | 'step1' | 'step2' | 'step3'>('hero');

    // Estado de fecha y hora seleccionadas en PremiumCalendar
    const [selectedDateStr, setSelectedDateStr] = useState<string>('');
    const [selectedTimeStr, setSelectedTimeStr] = useState<string>('');

    // Estado del formulario oficial de Registro Atelier
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [servicioRequerido, setServicioRequerido] = useState('');
    const [descripcionDetalle, setDescripcionDetalle] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Callback de selección en PremiumCalendar
    const handleCalendarSelection = (dateStr: string, timeStr: string) => {
        setSelectedDateStr(dateStr);
        setSelectedTimeStr(timeStr);
        setActiveView('step2');
    };

    const handleConfirmBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        const cleanDigits = phone.replace(/\D/g, '');
        const fullPhone = cleanDigits ? `+56 9 ${cleanDigits}` : '';
        const fechaHoraCombined = `${selectedDateStr}T${selectedTimeStr.length === 5 ? selectedTimeStr : selectedTimeStr.slice(0, 5)}:00`;

        const res = await guardarCitaCliente({
            nombre: fullName,
            celular: fullPhone,
            correo: email,
            fecha_hora: fechaHoraCombined,
            motivo: servicioRequerido ? `${servicioRequerido}${descripcionDetalle ? `: ${descripcionDetalle}` : ''}` : (descripcionDetalle || 'Cita General')
        });

        setIsSubmitting(false);

        if (res.success) {
            setActiveView('step3');
        } else {
            setErrorMessage(res.error || 'Ocurrió un error al procesar tu cita.');
        }
    };

    const resetBooking = () => {
        setActiveView('hero');
        setSelectedDateStr('');
        setSelectedTimeStr('');
        setErrorMessage('');
    };

    const formatFechaLegible = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(`${dateStr}T12:00:00`);
        return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    return (
        <div className="min-h-screen bg-transparent text-white font-sans relative selection:bg-brand-sand selection:text-brand-charcoal overflow-hidden flex flex-col justify-between">
            {/* Pure Black Base Layer */}
            <div className="fixed inset-0 -z-30 bg-black" />

            {/* FIXED BACKGROUND VIDEO: 1:1 igual a /appointment */}
            <div className="fixed inset-0 -z-10 overflow-hidden bg-black pointer-events-none">
                <div className="absolute inset-0 w-full h-full">
                    <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover object-[65%_center] md:object-center brightness-[0.60] contrast-[1.05] saturate-[0.85]"
                    >
                        <source src="/clase 2.mp4" type="video/mp4" />
                    </video>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
            </div>

            <Navbar />
            <BackLink />

            {/* CONTENEDOR CENTRAL ÚNICO (Pantalla Fija) */}
            <main className="flex-1 flex items-center justify-center px-4 md:px-12 relative z-10 w-full max-w-5xl mx-auto -mt-6 pb-8">
                <AnimatePresence mode="wait">
                    
                    {/* ━━━━━━━━━━ VISTA 0: HERO INICIAL ━━━━━━━━━━ */}
                    {activeView === 'hero' && (
                        <motion.div 
                            key="hero-view"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -25, filter: 'blur(8px)' }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full text-center flex flex-col items-center space-y-6"
                        >
                            <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.5em] text-brand-sand/90 font-medium animate-fade-in">
                                ELENA LA COSTURERA VITACURA
                            </span>
                            <h1 className="font-serif text-4xl md:text-7xl leading-tight text-white tracking-tight">
                                Agenda <span className="italic font-light text-brand-sand">tu cita.</span>
                            </h1>
                            <p className="text-sm md:text-lg text-white/80 max-w-xl leading-relaxed font-light font-sans tracking-wide">
                                Agenda para: Arreglos de tus prendas, upcycling, diseño y confección o asesoría para estudiantes. Al agendar me comunicaré contigo para confirmar tu cita y que me cuentes qué servicio requieres.
                            </p>
                            <div className="pt-10 md:pt-14">
                                <button 
                                    onClick={() => setActiveView('step1')}
                                    className="glass-btn group relative inline-flex items-center justify-center gap-3 px-8 py-4 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium bg-white/[0.08] backdrop-blur-[12px] transition-all duration-[600ms] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] rounded-[1px] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] cursor-pointer"
                                >
                                    <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms]">
                                        Agendar con Elena
                                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] group-hover:translate-x-1" />
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ━━━━━━━━━━ VISTA 1: MODELO PREMIUM CALENDAR (GLASSMORPHISM) ━━━━━━━━━━ */}
                    {activeView === 'step1' && (
                        <motion.div 
                            key="step1-view"
                            initial={{ opacity: 0, scale: 0.96, y: 25 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: -25, filter: 'blur(8px)' }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full max-w-5xl relative bg-black/60 backdrop-blur-2xl border border-white/20 rounded-sm shadow-[0_16px_50px_rgba(0,0,0,0.75)] p-4 md:p-8 max-h-[88vh] overflow-y-auto md:max-h-none md:overflow-visible custom-scrollbar"
                        >
                            {/* Brillo de borde superior */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-sand/60 to-transparent" />

                            {/* Botón cerrar para volver al Hero */}
                            <button 
                                onClick={resetBooking}
                                className="absolute top-4 right-4 z-30 p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="mb-4 space-y-1">
                                <span className="text-brand-sand text-[10px] uppercase tracking-[0.4em] font-semibold">Taller Tabancura</span>
                                <h2 className="font-serif text-xl md:text-2xl text-white">Agendar Evaluación</h2>
                                <p className="text-white/60 text-xs md:text-sm leading-relaxed max-w-xl">
                                    Selecciona el día y la hora para tu visita al taller. Verificaremos en tiempo real la disponibilidad de la agenda.
                                </p>
                            </div>

                            {/* Componente Oficial PremiumCalendar Integrado */}
                            <PremiumCalendar onConfirm={handleCalendarSelection} />
                        </motion.div>
                    )}

                    {/* ━━━━━━━━━━ VISTA 2: FORMULARIO OFICIAL DE REGISTRO REGISTRO/PAGE.TSX (GLASSMORPHISM) ━━━━━━━━━━ */}
                    {activeView === 'step2' && (
                        <motion.div 
                            key="step2-view"
                            initial={{ opacity: 0, scale: 0.96, x: 25 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.96, x: -25, filter: 'blur(8px)' }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full max-w-[500px] relative bg-black/60 backdrop-blur-2xl border border-white/20 rounded-sm shadow-[0_16px_50px_rgba(0,0,0,0.75)] p-6 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            {/* Brillo de borde superior */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-sand/60 to-transparent" />

                            {/* Header del Formulario */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                                <button 
                                    type="button"
                                    onClick={() => setActiveView('step1')}
                                    className="text-xs text-white/60 hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Volver al Calendario
                                </button>
                                <span className="text-[10px] uppercase tracking-widest text-brand-sand font-medium">Paso 2 de 2</span>
                            </div>

                            {/* Resumen de cita seleccionada sin recuadro con máxima legibilidad */}
                            <div className="mb-5 space-y-1 px-1 bg-white/[0.04] p-3 rounded-sm border-l-2 border-brand-sand">
                                <p className="text-[10px] text-brand-sand font-bold uppercase tracking-[0.25em]">Cita Seleccionada</p>
                                <p className="text-base md:text-lg text-white font-medium capitalize font-sans tracking-wide drop-shadow-sm">
                                    {formatFechaLegible(selectedDateStr)} a las <span className="text-brand-sand font-bold">{selectedTimeStr} hrs</span>
                                </p>
                            </div>

                            {/* Formulario Estilo Oficial de Registro */}
                            <form onSubmit={handleConfirmBooking} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <label className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/70 mb-1 block ml-1">Identidad</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand-sand transition-colors" />
                                            <input 
                                                required type="text" placeholder="Nombre Completo" 
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-sm text-white text-xs outline-none focus:border-brand-sand focus:bg-white/10 transition-all placeholder:text-white/20" 
                                            />
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <label className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/70 mb-1 block ml-1">Contacto Digital</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand-sand transition-colors" />
                                            <input 
                                                required type="email" placeholder="correo@ejemplo.com" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-sm text-white text-xs outline-none focus:border-brand-sand focus:bg-white/10 transition-all placeholder:text-white/20" 
                                            />
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <label className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/70 mb-1 block ml-1">WhatsApp</label>
                                        <div className="relative flex items-center">
                                            <Phone className="absolute left-4 w-4 h-4 text-white/30 group-focus-within:text-brand-sand transition-colors" />
                                            <span className="absolute left-11 text-brand-sand font-bold text-xs select-none pointer-events-none tracking-widest">+56 9</span>
                                            <input 
                                                required
                                                type="tel" placeholder="1234 5678" 
                                                maxLength={9}
                                                value={phone}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/\D/g, '').slice(0, 8);
                                                    if (val.length > 4) val = val.slice(0, 4) + ' ' + val.slice(4);
                                                    setPhone(val);
                                                }}
                                                className="w-full pl-24 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-sm text-white text-xs tracking-widest font-mono outline-none focus:border-brand-sand focus:bg-white/10 transition-all placeholder:text-white/20" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/70 ml-1">Servicio Requerido (Opcional)</label>
                                        <select 
                                            value={servicioRequerido}
                                            onChange={(e) => setServicioRequerido(e.target.value)}
                                            className="w-full p-3.5 bg-black/60 border border-white/10 rounded-sm text-xs font-medium uppercase tracking-wider text-white outline-none focus:border-brand-sand appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-brand-charcoal text-white/50">-- Selecciona un servicio (opcional) --</option>
                                            <option value="Compostura - Arreglos" className="bg-brand-charcoal text-white">Compostura - Arreglos</option>
                                            <option value="Upcycling - Transformaciones" className="bg-brand-charcoal text-white">Upcycling - Transformaciones</option>
                                            <option value="Diseño y Confección" className="bg-brand-charcoal text-white">Diseño y Confección</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/70 ml-1">¿Qué deseas realizar? (Opcional)</label>
                                        <textarea
                                            rows={2}
                                            value={descripcionDetalle}
                                            onChange={(e) => setDescripcionDetalle(e.target.value)}
                                            placeholder="Describe brevemente tus prendas o la idea que tienes en mente..."
                                            className="w-full p-3 bg-white/5 border border-white/10 rounded-sm text-xs text-white placeholder:text-white/20 outline-none focus:border-brand-sand focus:bg-white/10 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                {errorMessage && (
                                    <p className="text-red-400 text-xs bg-red-500/10 p-3 rounded-sm border border-red-500/20">{errorMessage}</p>
                                )}

                                <button 
                                    disabled={isSubmitting}
                                    type="submit" 
                                    className="w-full glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2 text-white">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Registrando Cita...
                                        </span>
                                    ) : (
                                        <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms]">
                                            Unirse al Atelier y Agendar
                                            <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform duration-[600ms] group-hover:translate-x-1" />
                                        </span>
                                    )}
                                </button>
                            </form>
                            <p className="mt-6 text-[9px] text-white/30 text-center uppercase tracking-widest">Elena La Costurera &copy; 2026</p>
                        </motion.div>
                    )}

                    {/* ━━━━━━━━━━ VISTA 3: CONFIRMACIÓN DE ÉXITO ━━━━━━━━━━ */}
                    {activeView === 'step3' && (
                        <motion.div 
                            key="step3-view"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-lg relative bg-black/60 backdrop-blur-2xl border border-white/20 rounded-sm shadow-[0_16px_50px_rgba(0,0,0,0.7)] overflow-hidden p-8 text-center flex flex-col items-center justify-center space-y-6"
                        >
                            <div className="w-16 h-16 bg-brand-sand/10 border border-brand-sand/30 rounded-full flex items-center justify-center text-brand-sand shadow-lg animate-bounce">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="font-serif text-2xl md:text-3xl text-white">
                                ¡Reserva Confirmada!
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed font-light">
                                Gracias <strong className="text-white font-normal">{fullName}</strong>. Tu cita ha sido agendada con éxito para el <strong className="text-brand-sand font-normal capitalize">{formatFechaLegible(selectedDateStr)} a las {selectedTimeStr} hrs</strong>.
                            </p>
                            <p className="text-white/50 text-xs max-w-sm">
                                Hemos enviado un correo de confirmación a <span className="text-white/80">{email}</span> y te notificaremos por WhatsApp.
                            </p>
                            <div className="pt-2">
                                <button 
                                    onClick={resetBooking}
                                    className="glass-btn px-8 py-3.5 bg-brand-sand text-brand-charcoal font-sans text-xs uppercase tracking-widest font-bold rounded-sm hover:bg-white transition-colors cursor-pointer"
                                >
                                    Entendido / Volver al Taller
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
}
