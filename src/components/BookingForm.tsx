'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function BookingForm() {
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        serviceType: '',
        description: '',
        occasion: '',
        stylePreference: '',
        referencePhoto: null as File | null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simular llamada a API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSaving(false);
        setStep(3);
    };

    return (
        <div className="max-w-xl mx-auto p-8 md:p-10 bg-[#121212]/90 border border-white/10 shadow-2xl rounded-sm text-white">
            {step === 1 && (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                    <h2 className="font-serif text-xl md:text-2xl mb-6 tracking-wide text-white/95">Comencemos a Crear</h2>

                    <div className="grid gap-2">
                        {/* Opción 1: Soy estudiante de moda */}
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, serviceType: 'Soy estudiante de moda' })}
                            className="py-3 px-1 text-left flex items-center gap-2 transition-colors cursor-pointer w-full bg-transparent border-0 group relative overflow-hidden"
                        >
                            {/* Button Container */}
                            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
                                    {/* Button body outline */}
                                    <circle 
                                        cx="12" cy="12" r="8" 
                                        stroke={formData.serviceType === 'Soy estudiante de moda' ? "#D4AF37" : "rgba(255,255,255,0.2)"} 
                                        strokeWidth="1.5" 
                                        className="transition-colors duration-300"
                                        fill={formData.serviceType === 'Soy estudiante de moda' ? "rgba(212, 175, 55, 0.08)" : "transparent"}
                                    />
                                    {/* Inner ring for realism */}
                                    <circle 
                                        cx="12" cy="12" r="5" 
                                        stroke={formData.serviceType === 'Soy estudiante de moda' ? "rgba(212, 175, 55, 0.3)" : "rgba(255,255,255,0.1)"} 
                                        strokeWidth="0.8" 
                                        className="transition-colors duration-300"
                                    />
                                    
                                    {/* 4 Button Holes */}
                                    <circle cx="10" cy="10" r="0.8" fill={formData.serviceType === 'Soy estudiante de moda' ? "#D4AF37" : "rgba(255,255,255,0.2)"} className="transition-colors duration-300" />
                                    <circle cx="14" cy="10" r="0.8" fill={formData.serviceType === 'Soy estudiante de moda' ? "#D4AF37" : "rgba(255,255,255,0.2)"} className="transition-colors duration-300" />
                                    <circle cx="10" cy="14" r="0.8" fill={formData.serviceType === 'Soy estudiante de moda' ? "#D4AF37" : "rgba(255,255,255,0.2)"} className="transition-colors duration-300" />
                                    <circle cx="14" cy="14" r="0.8" fill={formData.serviceType === 'Soy estudiante de moda' ? "#D4AF37" : "rgba(255,255,255,0.2)"} className="transition-colors duration-300" />

                                    {/* Golden Thread Cross Stitch (Sewing Animation in X) */}
                                    {formData.serviceType === 'Soy estudiante de moda' && (
                                        <>
                                            <motion.line 
                                                x1="10" y1="10" x2="14" y2="14" 
                                                stroke="#D4AF37" 
                                                strokeWidth="1.5" 
                                                strokeLinecap="round"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.3, ease: "easeOut" }}
                                            />
                                            <motion.line 
                                                x1="14" y1="10" x2="10" y2="14" 
                                                stroke="#D4AF37" 
                                                strokeWidth="1.5" 
                                                strokeLinecap="round"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
                                            />
                                        </>
                                    )}
                                </svg>
                            </div>
                            {/* Text with dynamic basting stitch under it */}
                            <motion.div
                                animate={{ x: formData.serviceType === 'Soy estudiante de moda' ? 6 : 0 }}
                                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                                className="flex flex-col justify-center"
                            >
                                <span className={`block font-serif text-sm transition-colors ${formData.serviceType === 'Soy estudiante de moda' ? 'text-brand-sand font-medium' : 'text-white/60 group-hover:text-white'}`}>
                                    1- Soy estudiante de moda
                                </span>
                                
                                {formData.serviceType === 'Soy estudiante de moda' ? (
                                    <div className="relative w-[180px] h-3 mt-0.5 overflow-visible">
                                        <svg className="absolute inset-0 w-full h-full overflow-visible">
                                            {/* Basting Stitch (Wavy hand-sewn Hilván) */}
                                            <motion.path 
                                                d="M 0,4 Q 15,0 30,4 T 60,4 T 90,4 T 120,4 T 150,4 T 170,4" 
                                                stroke="#D4AF37" 
                                                strokeWidth="1.2" 
                                                strokeDasharray="4 3"
                                                fill="none"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 1.4, ease: "easeInOut" }}
                                            />
                                            {/* Sewing Needle pulling thread (waving, rocking back-and-forth, and tilting) */}
                                            <motion.g
                                                initial={{ x: 0, y: 4, rotate: 0, opacity: 0 }}
                                                animate={{ 
                                                    x: [0, 20, 15, 45, 40, 75, 70, 105, 100, 135, 130, 170, 170], 
                                                    y: [4, 0, 8, 0, 8, 0, 8, 0, 8, 0, 8, 4, 4],
                                                    rotate: [0, 18, -18, 18, -18, 18, -18, 18, -18, 18, -18, 0, 0],
                                                    opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0] 
                                                }}
                                                transition={{ duration: 1.4, ease: "easeInOut" }}
                                            >
                                                <path 
                                                    d="M-15,4 L0,4 M-11,2 L-11,6" 
                                                    stroke="#BDC3C7" 
                                                    strokeWidth="1" 
                                                />
                                                <circle cx="-13" cy="4" r="0.5" fill="#fff" />
                                                <path d="M-13,4 Q-17,2.2 -20,4" stroke="#D4AF37" strokeWidth="0.6" fill="none" />
                                            </motion.g>
                                        </svg>
                                    </div>
                                ) : (
                                    <span className="text-[11px] text-white/40 italic block mt-0.5">Acompañamiento técnico y creativo.</span>
                                )}
                            </motion.div>
                        </button>

                        {/* Opción 2: Quiero aprender costura */}
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, serviceType: 'Quiero aprender costura' })}
                            className="py-3 px-1 text-left flex items-center gap-2 transition-colors cursor-pointer w-full bg-transparent border-0 group relative overflow-hidden"
                        >
                            {/* Button Container */}
                            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="overflow-visible">
                                    {/* Button body outline */}
                                    <circle 
                                        cx="12" cy="12" r="8" 
                                        stroke={formData.serviceType === 'Quiero aprender costura' ? "#D4AF37" : "rgba(255,255,255,0.2)"} 
                                        strokeWidth="1.5" 
                                        className="transition-colors duration-300"
                                        fill={formData.serviceType === 'Quiero aprender costura' ? "rgba(212, 175, 55, 0.08)" : "transparent"}
                                    />
                                    {/* Inner ring for realism */}
                                    <circle 
                                        cx="12" cy="12" r="5" 
                                        stroke={formData.serviceType === 'Quiero aprender costura' ? "rgba(212, 175, 55, 0.3)" : "rgba(255,255,255,0.1)"} 
                                        strokeWidth="0.8" 
                                        className="transition-colors duration-300"
                                    />
                                    
                                    {/* 4 Button Holes */}
                                    <circle cx="10" cy="10" r="0.8" fill={formData.serviceType === 'Quiero aprender costura' ? "#D4AF37" : "rgba(255,255,255,0.2)"} className="transition-colors duration-300" />
                                    <circle cx="14" cy="10" r="0.8" fill={formData.serviceType === 'Quiero aprender costura' ? "#D4AF37" : "rgba(255,255,255,0.2)"} className="transition-colors duration-300" />
                                    <circle cx="10" cy="14" r="0.8" fill={formData.serviceType === 'Quiero aprender costura' ? "#D4AF37" : "rgba(255,255,255,0.2)"} className="transition-colors duration-300" />
                                    <circle cx="14" cy="14" r="0.8" fill={formData.serviceType === 'Quiero aprender costura' ? "#D4AF37" : "rgba(255,255,255,0.2)"} className="transition-colors duration-300" />

                                    {/* Golden Thread Cross Stitch (Sewing Animation in X) */}
                                    {formData.serviceType === 'Quiero aprender costura' && (
                                        <>
                                            <motion.line 
                                                x1="10" y1="10" x2="14" y2="14" 
                                                stroke="#D4AF37" 
                                                strokeWidth="1.5" 
                                                strokeLinecap="round"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.3, ease: "easeOut" }}
                                            />
                                            <motion.line 
                                                x1="14" y1="10" x2="10" y2="14" 
                                                stroke="#D4AF37" 
                                                strokeWidth="1.5" 
                                                strokeLinecap="round"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
                                            />
                                        </>
                                    )}
                                </svg>
                            </div>
                            {/* Text with dynamic basting stitch under it */}
                            <motion.div
                                animate={{ x: formData.serviceType === 'Quiero aprender costura' ? 6 : 0 }}
                                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                                className="flex flex-col justify-center"
                            >
                                <span className={`block font-serif text-sm transition-colors ${formData.serviceType === 'Quiero aprender costura' ? 'text-brand-sand font-medium' : 'text-white/60 group-hover:text-white'}`}>
                                    2- Quiero aprender costura
                                </span>
                                
                                {formData.serviceType === 'Quiero aprender costura' ? (
                                    <div className="relative w-[180px] h-3 mt-0.5 overflow-visible">
                                        <svg className="absolute inset-0 w-full h-full overflow-visible">
                                            {/* Basting Stitch (Wavy hand-sewn Hilván) */}
                                            <motion.path 
                                                d="M 0,4 Q 15,0 30,4 T 60,4 T 90,4 T 120,4 T 150,4 T 170,4" 
                                                stroke="#D4AF37" 
                                                strokeWidth="1.2" 
                                                strokeDasharray="4 3"
                                                fill="none"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 1.4, ease: "easeInOut" }}
                                            />
                                            {/* Sewing Needle pulling thread (waving, rocking back-and-forth, and tilting) */}
                                            <motion.g
                                                initial={{ x: 0, y: 4, rotate: 0, opacity: 0 }}
                                                animate={{ 
                                                    x: [0, 20, 15, 45, 40, 75, 70, 105, 100, 135, 130, 170, 170], 
                                                    y: [4, 0, 8, 0, 8, 0, 8, 0, 8, 0, 8, 4, 4],
                                                    rotate: [0, 18, -18, 18, -18, 18, -18, 18, -18, 18, -18, 0, 0],
                                                    opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0] 
                                                }}
                                                transition={{ duration: 1.4, ease: "easeInOut" }}
                                            >
                                                <path 
                                                    d="M-15,4 L0,4 M-11,2 L-11,6" 
                                                    stroke="#BDC3C7" 
                                                    strokeWidth="1" 
                                                />
                                                <circle cx="-13" cy="4" r="0.5" fill="#fff" />
                                                <path d="M-13,4 Q-17,2.2 -20,4" stroke="#D4AF37" strokeWidth="0.6" fill="none" />
                                            </motion.g>
                                        </svg>
                                    </div>
                                ) : (
                                    <span className="text-[11px] text-white/40 italic block mt-0.5">Workshops creativos dentro del taller.</span>
                                )}
                            </motion.div>
                        </button>
                    </div>

                    <div className="space-y-4 pt-4">
                        <input
                            required
                            className="w-full border-b border-white/20 py-3 bg-transparent text-white focus:border-brand-sand outline-none transition-colors placeholder:text-white/20 text-sm"
                            placeholder="Nombre Completo"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <input
                            required
                            type="email"
                            className="w-full border-b border-white/20 py-3 bg-transparent text-white focus:border-brand-sand outline-none transition-colors placeholder:text-white/20 text-sm"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <input
                            required
                            type="tel"
                            className="w-full border-b border-white/20 py-3 bg-transparent text-white focus:border-brand-sand outline-none transition-colors placeholder:text-white/20 text-sm"
                            placeholder="WhatsApp (ej. +569...)"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!formData.serviceType}
                        className="w-full glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                        <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                            Siguiente
                            <ArrowRight className="w-4 h-4 transition-transform duration-[600ms] group-hover:translate-x-1 flex-shrink-0" />
                        </span>
                    </button>
                </form>
            )}

            {step === 2 && (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <h2 className="font-serif text-xl md:text-2xl mb-6 tracking-wide text-white/95">Personalización Previa</h2>
                    <p className="text-sm text-white/60 italic mb-6 leading-relaxed">
                        Para que su visita sea impecable, cuéntenos sus preferencias. <br />
                        Sus medidas serán guardadas en su <strong className="text-brand-sand">Historial Digital de Medidas</strong> para futuras confecciones sin necesidad de nuevas pruebas.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/50 block">Ocasión</label>
                            <select
                                className="w-full border-b border-white/20 py-2 outline-none focus:border-brand-sand bg-transparent text-white cursor-pointer appearance-none text-xs"
                                onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                                value={formData.occasion}
                            >
                                <option value="" className="bg-brand-charcoal text-white">Seleccione...</option>
                                <option value="daily" className="bg-brand-charcoal text-white">Uso Diario / Oficina</option>
                                <option value="event" className="bg-brand-charcoal text-white">Evento Especial / Gala</option>
                                <option value="wedding" className="bg-brand-charcoal text-white">Novias / Ceremonia</option>
                                <option value="other" className="bg-brand-charcoal text-white">Otro</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/50 block">Estilo Preferido</label>
                            <select
                                className="w-full border-b border-white/20 py-2 outline-none focus:border-brand-sand bg-transparent text-white cursor-pointer appearance-none text-xs"
                                onChange={(e) => setFormData({ ...formData, stylePreference: e.target.value })}
                                value={formData.stylePreference}
                            >
                                <option value="" className="bg-brand-charcoal text-white">Seleccione...</option>
                                <option value="minimal" className="bg-brand-charcoal text-white">Minimalista / Limpio</option>
                                <option value="classic" className="bg-brand-charcoal text-white">Clásico / Atemporal</option>
                                <option value="bold" className="bg-brand-charcoal text-white">Vanguardista / Audaz</option>
                            </select>
                        </div>
                    </div>

                    <textarea
                        required
                        className="w-full border border-white/10 p-4 h-24 bg-white/5 text-white focus:border-brand-sand outline-none transition-colors resize-none mt-4 rounded-sm placeholder:text-white/20 text-sm"
                        placeholder="¿Algún detalle o tela específica que le interese?"
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        value={formData.description}
                    />

                    <div className="border-[0.5px] border-dashed border-white/20 p-8 text-center rounded-sm hover:border-brand-sand transition-colors bg-white/[0.02]">
                        <input
                            type="file"
                            className="hidden"
                            id="photo-upload"
                            accept="image/*"
                            onChange={(e) => setFormData({ ...formData, referencePhoto: e.target.files?.[0] || null })}
                        />
                        <label htmlFor="photo-upload" className="cursor-pointer block">
                            <span className="block text-brand-sand font-medium mb-1 text-sm">Subir Foto de Referencia</span>
                            <span className="text-xs text-white/40 italic block">Opcional pero recomendado para mayor precisión</span>
                            {formData.referencePhoto && (
                                <span className="mt-4 text-xs font-sans text-brand-charcoal bg-brand-sand py-1 px-3 rounded-full inline-block">
                                    ✓ {formData.referencePhoto.name}
                                </span>
                            )}
                        </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex-1 border border-white/20 py-4 uppercase tracking-widest text-xs font-semibold hover:bg-white/10 transition-all rounded-sm cursor-pointer"
                        >
                            Atrás
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-[2] glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (
                                <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                                    Confirmar Solicitud
                                    <ArrowRight className="w-4 h-4 transition-transform duration-[600ms] group-hover:translate-x-1 flex-shrink-0" />
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {step === 3 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                >
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-sand text-2xl shadow-md">✓</div>
                    <h2 className="font-serif text-xl md:text-2xl mb-4 tracking-wide text-white/95">¡Todo Listo!</h2>
                    <p className="text-white/60 mb-8 text-sm leading-relaxed">
                        Gracias {formData.name.split(' ')[0]}. Hemos recibido tu interés en {formData.serviceType}. <br />
                        Te hablaremos por WhatsApp muy pronto para coordinar tu visita al taller en Tabancura 1091.
                    </p>
                    <button
                        onClick={() => setStep(1)}
                        className="text-brand-sand underline uppercase tracking-widest text-xs font-semibold cursor-pointer hover:text-white transition-colors"
                    >
                        Volver al Inicio
                    </button>
                </motion.div>
            )}
        </div>
    );
}
