'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Loader2, Mail, User, Phone, Sparkles, Heart } from 'lucide-react';
import { createCustomer } from '../admin/crm/actions';

export default function PublicRegistrationPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);
        
        const formData = new FormData(e.currentTarget);
        formData.append('marketing_opt_in', 'on');
        
        const result = await createCustomer(formData);
        
        setIsSaving(false);
        if (result.success) {
            setIsSuccess(true);
        } else {
            alert('Error: ' + result.error);
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-brand-charcoal flex items-center justify-center p-4 font-sans relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/Elena%20basos%20cruzados.jpeg')] bg-cover bg-center opacity-10 blur-sm scale-105"></div>
                <div className="max-w-md w-full bg-white/10 backdrop-blur-2xl p-12 text-center space-y-8 shadow-2xl border border-white/10 relative z-10 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-brand-terracotta/20 rounded-full flex items-center justify-center mx-auto border border-brand-terracotta/30">
                        <CheckCircle2 className="w-12 h-12 text-brand-terracotta" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="font-serif text-4xl text-brand-sand leading-tight">Bienvenida al <br/>Círculo Atelier</h1>
                        <p className="text-brand-sand/60 text-sm leading-relaxed">
                            Tu perfil ha sido integrado. Elena y su equipo ahora tienen tu historial listo para tu próxima visita.
                        </p>
                    </div>
                    <Link href="/" className="inline-flex items-center gap-2 bg-brand-terracotta text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-brand-charcoal transition-all">
                        Explorar Colección
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-charcoal font-sans relative flex items-center justify-center overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-terracotta/20 rounded-full blur-[120px] opacity-30 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-sand/10 rounded-full blur-[100px] opacity-20"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558603668-6570496b66f8?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

            <div className="max-w-5xl w-full mx-auto px-6 py-20 relative z-10 flex flex-col lg:flex-row gap-16 items-center">
                
                {/* Branding Side */}
                <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
                    <span className="text-brand-terracotta text-[10px] uppercase tracking-[0.6em] font-bold block">Exclusive Membership</span>
                    <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.1]">
                        Eleva tu <br/>
                        <span className="italic text-brand-sand">Experiencia</span>
                    </h1>
                    <p className="text-white/60 text-base md:text-lg max-w-md leading-relaxed">
                        Al unirte, digitalizas tus medidas y preferencias para una atención artesanal sin fricciones en nuestro taller de Tabancura.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-8 pt-8">
                        <div className="space-y-2">
                            <Sparkles className="w-6 h-6 text-brand-terracotta mx-auto lg:mx-0" />
                            <h4 className="text-brand-sand text-[10px] uppercase tracking-widest font-bold">Atención VIP</h4>
                            <p className="text-white/40 text-[9px] leading-tight">Acceso prioritario a pruebas y entregas.</p>
                        </div>
                        <div className="space-y-2">
                            <Heart className="w-6 h-6 text-brand-terracotta mx-auto lg:mx-0" />
                            <h4 className="text-brand-sand text-[10px] uppercase tracking-widest font-bold">Marketing de Lujo</h4>
                            <p className="text-white/40 text-[9px] leading-tight">Promociones personalizadas según tu estilo.</p>
                        </div>
                    </div>
                </div>

                {/* Glassmorphism Form Side */}
                <div className="w-full lg:w-[500px] bg-white/5 backdrop-blur-xl border border-white/10 p-10 md:p-12 shadow-2xl rounded-sm">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-5">
                            <div className="relative group">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/50 mb-1 block ml-1">Identidad</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand-terracotta transition-colors" />
                                    <input 
                                        name="full_name" required type="text" placeholder="Nombre Completo" 
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-sm text-white text-sm outline-none focus:border-brand-terracotta focus:bg-white/10 transition-all placeholder:text-white/20" 
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/50 mb-1 block ml-1">Contacto Digital</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand-terracotta transition-colors" />
                                    <input 
                                        name="email" required type="email" placeholder="correo@ejemplo.com" 
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-sm text-white text-sm outline-none focus:border-brand-terracotta focus:bg-white/10 transition-all placeholder:text-white/20" 
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/50 mb-1 block ml-1">WhatsApp</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand-terracotta transition-colors" />
                                    <input 
                                        name="phone" type="tel" placeholder="+56 9 ..." 
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-sm text-white text-sm outline-none focus:border-brand-terracotta focus:bg-white/10 transition-all placeholder:text-white/20" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/50 ml-1">Estilo Favorito</label>
                                <select name="style_preference" className="w-full p-4 bg-white/5 border border-white/10 rounded-sm text-[10px] font-bold uppercase tracking-widest text-white outline-none focus:border-brand-terracotta focus:bg-white/10 shadow-sm appearance-none cursor-pointer">
                                    <option value="Minimalista" className="bg-brand-charcoal text-white">Minimalista</option>
                                    <option value="Clásico" className="bg-brand-charcoal text-white">Clásico</option>
                                    <option value="Moderno" className="bg-brand-charcoal text-white">Moderno</option>
                                    <option value="Bohemio" className="bg-brand-charcoal text-white">Bohemio</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/50 ml-1">Ocasión Principal</label>
                                <select name="typical_occasion" className="w-full p-4 bg-white/5 border border-white/10 rounded-sm text-[10px] font-bold uppercase tracking-widest text-white outline-none focus:border-brand-terracotta focus:bg-white/10 shadow-sm appearance-none cursor-pointer">
                                    <option value="Daily" className="bg-brand-charcoal text-white">Daily Wear</option>
                                    <option value="Gala" className="bg-brand-charcoal text-white">Gala / Fiesta</option>
                                    <option value="Novia" className="bg-brand-charcoal text-white">Novia</option>
                                    <option value="Ejecutiva" className="bg-brand-charcoal text-white">Ejecutiva</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            disabled={isSaving}
                            type="submit" 
                            className="w-full bg-brand-terracotta text-white py-5 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-brand-charcoal transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    <span>Unirse al Atelier</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-[9px] text-white/30 text-center uppercase tracking-widest">Atelier Elena Rojas &copy; 2026</p>
                </div>
            </div>
        </div>
    );
}
