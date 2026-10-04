'use client';

import React from 'react';
import { Briefcase, MapPin, ArrowRight, Clock, Star, Scissors, Gem, ShieldCheck, Camera, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import BackLink from '@/components/BackLink';
import TrackedLink from '@/components/TrackedLink';
import LocationMap from '@/components/LocationMap';
import PremiumPricingTable from '@/components/PremiumPricingTable';

function getWhatsAppSastreriaUrl() {
    const phone = "56972812907";
    const text = `Hola Elena Atelier. Me interesa el servicio de Sastrería a Medida. Me gustaría coordinar una visita al atelier en Vitacura.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function getWhatsAppServiceUrl(serviceType: 'sastre' | 'costurera') {
    const phone = "56972812907";
    const text = `Hola Elena Atelier. Me interesa agendar el servicio VIP de ${serviceType === 'sastre' ? 'Sastre a Domicilio' : 'Modista a Domicilio'} para mis prendas.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export default function SastreriaPage() {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans relative pb-24">
            <Navbar />
            <BackLink />

            <main className="max-w-7xl mx-auto px-5 md:px-6 pt-24 md:pt-32 space-y-20 md:space-y-32">
                
                {/* 1. HERO SECTION SASTRERIA */}
                <header className="flex flex-col lg:flex-row gap-12 md:gap-16 items-center">
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#C17F5F]">
                            <Scissors className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Bespoke & Alteraciones</span>
                        </div>
                        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-white font-black tracking-tight">
                            Sastrería a Medida <br className="hidden md:block" />
                            <span className="italic text-[#E29D7A]">y Entalle Perfecto.</span>
                        </h1>
                        <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
                            Elevamos la precisión de la sastrería tradicional. Desde la confección de trajes Bespoke hasta el entalle arquitectónico de sus prendas de lujo en nuestro Atelier de <span className="text-[#C17F5F] font-semibold">Vitacura</span>.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                            <TrackedLink
                                href={getWhatsAppSastreriaUrl() + "&text=" + encodeURIComponent("Hola Elena Atelier. Les envío una foto de mi traje/prenda para cotizar arreglo en sastreria. ¿Pueden darme un estimado?")}
                                target="_blank"
                                eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Sastreria_Hero_Foto"
                                className="w-full sm:w-auto bg-[#C17F5F] hover:bg-[#b05c4b] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(193,127,95,0.3)] hover:scale-[1.02]"
                            >
                                <Camera className="w-4 h-4" /> Consultar con Foto
                            </TrackedLink>

                            <TrackedLink
                                href={getWhatsAppSastreriaUrl()}
                                target="_blank"
                                eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Sastreria_Hero_Cita"
                                className="w-full sm:w-auto bg-transparent border border-white/20 hover:border-[#E29D7A] hover:bg-white/5 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 hover:scale-[1.02]"
                            >
                                <CheckCircle2 className="w-4 h-4 text-[#C17F5F]" /> Agendar Cita
                            </TrackedLink>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative">
                        <div className="aspect-[4/5] md:aspect-square lg:aspect-[4/5] relative rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
                            <img 
                                src="/b2b_hero.png" 
                                alt="Sastrería a Medida y Bespoke" 
                                className="absolute inset-0 w-full h-full object-cover filter contrast-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-black/20 to-transparent pointer-events-none" />
                        </div>
                        {/* Floating Badge */}
                        <div className="absolute -bottom-8 -left-8 md:-bottom-12 md:-left-12 bg-[#141414] p-6 rounded-lg border border-white/10 shadow-2xl max-w-xs hidden sm:block">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-[#C17F5F]/10 border border-[#C17F5F]/20">
                                    <Star className="w-6 h-6 text-[#E29D7A]" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Grado Sastrero</h4>
                                    <p className="text-[11px] text-white/60 leading-relaxed mt-1">Preservamos la estructura original de prendas importadas.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 1.5. CARTA DE PRECIOS TRANSPARENTE (BAJO EL HERO) */}
                <section className="px-0 sm:px-6">
                    <PremiumPricingTable />
                </section>

                {/* 2. MEN'S TAILORING */}
                <section className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                        <img 
                            src="/b2b_sastreria.png" 
                            alt="Ajuste de traje para hombres" 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                    </div>
                    <div className="order-1 lg:order-2 space-y-6">
                        <div className="inline-flex items-center gap-2 text-[#C17F5F] mb-2">
                            <Scissors className="w-5 h-5" />
                            <span className="text-xs uppercase tracking-widest font-bold">Men's Tailoring</span>
                        </div>
                        <h2 className="font-serif text-4xl lg:text-5xl text-white font-bold leading-tight">
                            Arquitectura <br/>
                            <span className="italic text-[#E29D7A]">del Traje Perfecto.</span>
                        </h2>
                        <div className="space-y-4 text-white/70 text-sm md:text-base font-light leading-relaxed">
                            <p>
                                Un traje no es solo tela; es la armadura del caballero moderno. Entendemos la complejidad geométrica de la sastrería tradicional y la importancia de no alterar la estructura original de una prenda de alta gama.
                            </p>
                            <p>
                                Nuestra maestría técnica abarca desde la <strong>deconstrucción y ajuste de hombros en chaquetas</strong>, la preservación del <em>canvas</em> (lona interior), hasta el acortamiento de mangas subiendo el puño desde el tajalí para conservar los ojales originales.
                            </p>
                        </div>
                        <div className="pt-6 space-y-4">
                            <div className="flex items-center gap-4 bg-white/5 border border-[#C17F5F]/30 p-4 rounded-lg w-full max-w-md">
                                <div className="p-2 bg-[#C17F5F]/10 rounded-full shrink-0">
                                    <Clock className="w-5 h-5 text-[#E29D7A]" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base sm:text-lg">Agenda en Vitacura</p>
                                    <p className="text-[10px] sm:text-[11px] text-white/50 uppercase tracking-widest mt-1">Evaluación Técnica en Taller</p>
                                </div>
                            </div>
                            <div>
                                <TrackedLink
                                    href={getWhatsAppServiceUrl('sastre')}
                                    target="_blank"
                                    eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Sastreria_Mens"
                                    className="glass-btn inline-flex items-center justify-center gap-3 px-8 py-3.5 border-[0.5px] border-white/20 text-white font-sans text-xs uppercase tracking-[0.2em] font-bold bg-[#C17F5F]/10 backdrop-blur-[10px] transition-all hover:bg-[#C17F5F] hover:border-[#E29D7A] shadow-lg rounded-sm w-full max-w-md"
                                >
                                    Solicitar Cita de Sastrería
                                    <ArrowRight className="w-4 h-4" />
                                </TrackedLink>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. WOMEN'S TAILORING */}
                <section className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 text-[#C17F5F] mb-2">
                            <Gem className="w-5 h-5" />
                            <span className="text-xs uppercase tracking-widest font-bold">Women's Tailoring</span>
                        </div>
                        <h2 className="font-serif text-4xl lg:text-5xl text-white font-bold leading-tight">
                            Precisión para <br/>
                            <span className="italic text-[#E29D7A]">la Silueta Femenina.</span>
                        </h2>
                        <div className="space-y-4 text-white/70 text-sm md:text-base font-light leading-relaxed">
                            <p>
                                La indumentaria femenina de alta gama requiere una sensibilidad estética superior. Nuestras modistas maestras dominan el arte de entallar blusas de seda, entallar vestidos de diseñador y rediseñar faldas lápiz, asegurando un calce perfecto.
                            </p>
                            <p>
                                Adaptamos prendas de pasarela y de uso diario respetando cortes asimétricos, pinzas complejas y forros delicados, para que cada pieza luzca como si hubiera sido creada exclusivamente para ti.
                            </p>
                        </div>
                        <ul className="grid grid-cols-2 gap-4 pt-4">
                            <li className="flex items-center gap-2 text-sm text-white/80"><ShieldCheck className="w-4 h-4 text-[#C17F5F]"/> Entalle de Blusas</li>
                            <li className="flex items-center gap-2 text-sm text-white/80"><ShieldCheck className="w-4 h-4 text-[#C17F5F]"/> Ajuste de Faldas Lápiz</li>
                            <li className="flex items-center gap-2 text-sm text-white/80"><ShieldCheck className="w-4 h-4 text-[#C17F5F]"/> Vestidos de Diseñador</li>
                            <li className="flex items-center gap-2 text-sm text-white/80"><ShieldCheck className="w-4 h-4 text-[#C17F5F]"/> Trajes de Dos Piezas</li>
                        </ul>
                        <div className="pt-6">
                            <TrackedLink
                                href={getWhatsAppServiceUrl('costurera')}
                                target="_blank"
                                eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Sastreria_Womens"
                                className="glass-btn inline-flex items-center justify-center gap-3 px-8 py-3.5 border-[0.5px] border-white/20 text-white font-sans text-xs uppercase tracking-[0.2em] font-bold bg-[#C17F5F]/10 backdrop-blur-[10px] transition-all hover:bg-[#C17F5F] hover:border-[#E29D7A] shadow-lg rounded-sm w-full max-w-md"
                            >
                                Agendar Toma de Medidas
                                <ArrowRight className="w-4 h-4" />
                            </TrackedLink>
                        </div>
                    </div>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#C17F5F]/20 shadow-[0_0_40px_rgba(193,127,95,0.15)]">
                        <img 
                            src="/b2b_power_executive.jpg" 
                            alt="Modista ajustando prenda femenina" 
                            className="absolute inset-0 w-full h-full object-cover filter contrast-110 saturate-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d]/40 to-transparent" />
                    </div>
                </section>

                {/* 4. CTA FINAL */}
                <section className="relative overflow-hidden rounded-xl border border-[#C17F5F]/30 bg-[#141414] py-20 px-6 text-center">
                    <div className="absolute inset-0 bg-[url('/textile-pattern-dark.jpg')] opacity-5 bg-cover mix-blend-overlay"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl bg-[#C17F5F]/5 blur-[120px] rounded-full pointer-events-none"></div>
                    
                    <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
                        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight">La Diferencia de un Calce Perfecto</h2>
                        <p className="text-white/60 text-sm md:text-base font-light">
                            Delegue la sastrería técnica de sus prendas más preciadas a manos expertas. Coordina una evaluación en nuestro atelier.
                        </p>
                        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                            <TrackedLink
                                href={getWhatsAppSastreriaUrl()}
                                target="_blank"
                                eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Sastreria_Footer_CTA"
                                className="glass-btn inline-flex items-center justify-center gap-3 px-10 py-5 border-[0.5px] border-white/20 text-white font-sans text-xs uppercase tracking-[0.2em] font-bold bg-white/5 backdrop-blur-[10px] transition-all hover:bg-white hover:text-black rounded-sm"
                            >
                                Contactar al Atelier
                                <ArrowRight className="w-4 h-4" />
                            </TrackedLink>
                            <Link href="/costuras/catalogo-completo" className="inline-flex items-center justify-center gap-3 px-10 py-5 border-[0.5px] border-[#C17F5F]/50 text-[#E29D7A] font-sans text-xs uppercase tracking-[0.2em] font-bold bg-transparent transition-all hover:bg-[#C17F5F]/10 rounded-sm">
                                Ver Catálogo de Arreglos
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 5. MAPA DE UBICACIÓN */}
                <section className="pt-8">
                    <LocationMap />
                </section>

            </main>
        </div>
    );
}
