'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Loader2, Mail, User, Phone, Sparkles, Heart } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { createCustomer } from '../admin/crm/actions';
import BackLink from '@/components/BackLink';

function RegistrationContent() {
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';
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
            if (typeof window !== 'undefined') {
                localStorage.setItem('agenda_email', formData.get('email') as string);
            }
            setIsSuccess(true);
        } else {
            alert('Error: ' + result.error);
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-brand-charcoal flex items-center justify-center p-4 font-sans relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/elena-brazos-cruzados.png')] bg-cover bg-center opacity-10 blur-sm scale-105"></div>
                <div className="max-w-md w-full bg-white/10 backdrop-blur-2xl p-12 text-center space-y-8 shadow-2xl border border-white/10 relative z-10 animate-in fade-in zoom-in duration-500 rounded-sm">
                    <div className="w-24 h-24 bg-brand-sand/10 rounded-full flex items-center justify-center mx-auto border border-brand-sand/20">
                        <CheckCircle2 className="w-12 h-12 text-brand-sand" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="font-serif text-4xl text-brand-sand leading-tight">Bienvenida al <br/>Círculo Atelier</h1>
                        <p className="text-brand-sand/60 text-sm leading-relaxed">
                            Tu perfil ha sido integrado. Elena y su equipo ahora tienen tu historial listo para tu próxima visita.
                        </p>
                    </div>
                    <Link 
                        href={redirectUrl} 
                        className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] w-full"
                    >
                        <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                            {redirectUrl !== '/' ? 'Agendar mi Visita al Taller' : 'Explorar Colección'}
                        </span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-charcoal font-sans relative flex items-center justify-center overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-sand/10 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-sand/5 rounded-full blur-[100px] opacity-10"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558603668-6570496b66f8?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

            {/* Back Link */}
            <BackLink />

            <div className="max-w-5xl w-full mx-auto px-6 py-20 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    {/* Branding Side */}
                    <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
                        <span className="text-brand-sand/60 text-[10px] uppercase tracking-[0.6em] font-semibold block">Exclusive Membership</span>
                        <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.1]">
                            Eleva tu <br/>
                            <span className="italic text-brand-sand">Experiencia</span>
                        </h1>
                        <p className="text-white/60 text-base md:text-lg max-w-md leading-relaxed">
                            Al unirte, digitalizas tus medidas y preferencias para una atención artesanal sin fricciones en nuestro taller de Tabancura.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-8 pt-8">
                            <div className="space-y-2">
                                <span className="flex items-center justify-center lg:justify-start">
                                    <Sparkles className="w-6 h-6 text-brand-sand" />
                                </span>
                                <h4 className="text-brand-sand text-[10px] uppercase tracking-widest font-bold pt-2">Atención VIP</h4>
                                <p className="text-white/40 text-[9px] leading-tight">Acceso prioritario a pruebas y entregas.</p>
                            </div>
                            <div className="space-y-2">
                                <span className="flex items-center justify-center lg:justify-start">
                                    <Heart className="w-6 h-6 text-brand-sand" />
                                </span>
                                <h4 className="text-brand-sand text-[10px] uppercase tracking-widest font-bold pt-2">Marketing de Lujo</h4>
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
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand-sand transition-colors" />
                                        <input 
                                            name="full_name" required type="text" placeholder="Nombre Completo" 
                                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-sm text-white text-sm outline-none focus:border-brand-sand focus:bg-white/10 transition-all placeholder:text-white/20" 
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/50 mb-1 block ml-1">Contacto Digital</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-brand-sand transition-colors" />
                                        <input 
                                            name="email" required type="email" placeholder="correo@ejemplo.com" 
                                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-sm text-white text-sm outline-none focus:border-brand-sand focus:bg-white/10 transition-all placeholder:text-white/20" 
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/50 mb-1 block ml-1">WhatsApp</label>
                                    <div className="relative flex items-center">
                                        <Phone className="absolute left-4 w-4 h-4 text-white/30 group-focus-within:text-brand-sand transition-colors" />
                                        <span className="absolute left-11 text-brand-sand font-bold text-sm select-none pointer-events-none tracking-widest">+56 9</span>
                                        <input 
                                            type="tel" placeholder="1234 5678" 
                                            maxLength={9} // 8 digits + optional space
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/\D/g, '').slice(0, 8);
                                                if (val.length > 4) val = val.slice(0,4) + ' ' + val.slice(4);
                                                e.target.value = val;
                                            }}
                                            className="w-full pl-24 pr-4 py-4 bg-white/5 border border-white/10 rounded-sm text-white text-sm tracking-widest font-mono outline-none focus:border-brand-sand focus:bg-white/10 transition-all placeholder:text-white/20" 
                                        />
                                        {/* Hidden input to inject the full formatted phone into FormData seamlessly */}
                                        <input type="hidden" name="phone" />
                                        <script dangerouslySetInnerHTML={{__html: `
                                            document.currentScript.parentElement.querySelector('input[type="tel"]').addEventListener('input', function(e) {
                                                const clean = e.target.value.replace(/\\D/g, '');
                                                document.currentScript.parentElement.querySelector('input[type="hidden"]').value = clean.length > 0 ? '+56 9 ' + clean : '';
                                            });
                                        `}} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/50 ml-1">Estilo Favorito</label>
                                    <select name="style_preference" className="w-full p-4 bg-white/5 border border-white/10 rounded-sm text-[10px] font-bold uppercase tracking-widest text-white outline-none focus:border-brand-sand focus:bg-white/10 shadow-sm appearance-none cursor-pointer">
                                        <option value="Minimalista" className="bg-brand-charcoal text-white">Minimalista</option>
                                        <option value="Clásico" className="bg-brand-charcoal text-white">Clásico</option>
                                        <option value="Moderno" className="bg-brand-charcoal text-white">Moderno</option>
                                        <option value="Bohemio" className="bg-brand-charcoal text-white">Bohemio</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/50 ml-1">Ocasión Principal</label>
                                    <select name="typical_occasion" className="w-full p-4 bg-white/5 border border-white/10 rounded-sm text-[10px] font-bold uppercase tracking-widest text-white outline-none focus:border-brand-sand focus:bg-white/10 shadow-sm appearance-none cursor-pointer">
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
                                className="w-full glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] max-w-full cursor-pointer"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (
                                    <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                                        Unirse al Atelier
                                        <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform duration-[600ms] group-hover:translate-x-1" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-[9px] text-white/30 text-center uppercase tracking-widest">Atelier Elena Rojas &copy; 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PublicRegistrationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-brand-charcoal flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <RegistrationContent />
        </Suspense>
    );
}
