'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function BookingForm() {
    const [step, setStep] = useState(1);
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
        // Integration logic for HubSpot & n8n would go here
        console.log('Submitting booking...', formData);
        setStep(3);
    };

    return (
        <div className="max-w-xl mx-auto p-8 bg-white border border-brand-sand shadow-sm">
            {step === 1 && (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                    <h2 className="font-serif text-3xl mb-8">Pedir una cita</h2>

                    <div className="grid gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, serviceType: 'Confección a medida' })}
                            className={`p-4 border text-left flex justify-between items-center transition-all ${formData.serviceType === 'Confección a medida' ? 'border-brand-terracotta bg-brand-sand/30' : 'border-gray-200 hover:border-brand-terracotta'}`}
                        >
                            <div>
                                <span className="block font-medium">Confección a medida</span>
                                <span className="text-xs text-text-secondary italic">Diseñamos una prenda nueva para ti</span>
                            </div>
                            <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                                {formData.serviceType === 'Confección a medida' && <div className="w-2 h-2 rounded-full bg-brand-terracotta" />}
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, serviceType: 'Arreglos y composturas' })}
                            className={`p-4 border text-left flex justify-between items-center transition-all ${formData.serviceType === 'Arreglos y composturas' ? 'border-brand-terracotta bg-brand-sand/30' : 'border-gray-200 hover:border-brand-terracotta'}`}
                        >
                            <div>
                                <span className="block font-medium">Arreglos y composturas</span>
                                <span className="text-xs text-text-secondary italic">Ajustamos y reparamos tu ropa favorita</span>
                            </div>
                            <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                                {formData.serviceType === 'Arreglos y composturas' && <div className="w-2 h-2 rounded-full bg-brand-terracotta" />}
                            </div>
                        </button>
                    </div>

                    <div className="space-y-4 pt-4">
                        <input
                            required
                            className="w-full border-b border-gray-300 py-3 focus:border-brand-terracotta outline-none transition-colors"
                            placeholder="Nombre Completo"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <input
                            required
                            type="email"
                            className="w-full border-b border-gray-300 py-3 focus:border-brand-terracotta outline-none transition-colors"
                            placeholder="Email"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <input
                            required
                            type="tel"
                            className="w-full border-b border-gray-300 py-3 focus:border-brand-terracotta outline-none transition-colors"
                            placeholder="WhatsApp (ej. +569...)"
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!formData.serviceType}
                        className="w-full bg-brand-charcoal text-white py-4 mt-8 hover:bg-brand-terracotta transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                    >
                        Siguiente
                    </button>
                </form>
            )}

            {step === 2 && (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <h2 className="font-serif text-3xl mb-8">Algunos detalles</h2>
                    <p className="text-sm text-text-secondary italic mb-6">
                        Cuéntanos un poco más sobre lo que necesitas para que podamos atenderte mejor.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-text-secondary">Ocasión</label>
                            <select
                                className="w-full border-b border-gray-300 py-2 outline-none focus:border-brand-terracotta bg-transparent"
                                onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                                value={formData.occasion}
                            >
                                <option value="">Seleccione...</option>
                                <option value="daily">Uso Diario / Oficina</option>
                                <option value="event">Evento Especial / Gala</option>
                                <option value="wedding">Novias / Ceremonia</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-text-secondary">Estilo Preferido</label>
                            <select
                                className="w-full border-b border-gray-300 py-2 outline-none focus:border-brand-terracotta bg-transparent"
                                onChange={(e) => setFormData({ ...formData, stylePreference: e.target.value })}
                                value={formData.stylePreference}
                            >
                                <option value="">Seleccione...</option>
                                <option value="minimal">Minimalista / Limpio</option>
                                <option value="classic">Clásico / Atemporal</option>
                                <option value="bold">Vanguardista / Audaz</option>
                            </select>
                        </div>
                    </div>

                    <textarea
                        required
                        className="w-full border border-gray-200 p-4 h-24 focus:border-brand-terracotta outline-none transition-colors resize-none mt-4"
                        placeholder="¿Algún detalle o tela específica que le interese?"
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        value={formData.description}
                    />

                    <div className="border-2 border-dashed border-gray-200 p-8 text-center rounded-sm hover:border-brand-terracotta transition-colors">
                        <input
                            type="file"
                            className="hidden"
                            id="photo-upload"
                            accept="image/*"
                            onChange={(e) => setFormData({ ...formData, referencePhoto: e.target.files?.[0] || null })}
                        />
                        <label htmlFor="photo-upload" className="cursor-pointer">
                            <span className="block text-brand-terracotta font-medium mb-1">Subir Foto de Referencia</span>
                            <span className="text-xs text-text-secondary italic">Opcional pero recomendado para mayor precisión</span>
                            {formData.referencePhoto && (
                                <div className="mt-4 text-xs font-sans text-brand-charcoal bg-brand-sand py-1 px-3 rounded-full inline-block">
                                    ✓ {formData.referencePhoto.name}
                                </div>
                            )}
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex-1 border border-brand-charcoal py-4 uppercase tracking-widest text-sm hover:bg-brand-sand transition-all"
                        >
                            Atrás
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] bg-brand-charcoal text-white py-4 uppercase tracking-widest text-sm hover:bg-brand-terracotta transition-all"
                        >
                            Confirmar Solicitud
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
                    <div className="w-16 h-16 bg-brand-sand rounded-full flex items-center justify-center mx-auto mb-6 text-brand-terracotta text-2xl">✓</div>
                    <h2 className="font-serif text-3xl mb-4">Solicitud Enviada</h2>
                    <p className="text-text-secondary mb-8">
                        Gracias {formData.name.split(' ')[0]}. Recibimos tu pedido de {formData.serviceType}. <br />
                        Te contactaremos por WhatsApp para coordinar tu visita a nuestro taller en Av. Tabancura 1091.
                    </p>
                    <button
                        onClick={() => setStep(1)}
                        className="text-brand-terracotta underline uppercase tracking-widest text-xs font-medium"
                    >
                        Volver al Inicio
                    </button>
                </motion.div>
            )}
        </div>
    );
}
