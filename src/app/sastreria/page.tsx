'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { Scissors, Coffee, MessageCircle, Heart, ArrowRight } from 'lucide-react';
import BackLink from '@/components/BackLink';

export default function SastreriaPage() {
    return (
        <div className="min-h-screen bg-transparent font-sans relative">
            {/* Fixed Parallax Background Video */}
            <div className="fixed inset-0 -z-10 bg-brand-charcoal">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/Elena%20vestido%20de%20novia%20.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/60" />
            </div>

            <Navbar />

            {/* Back Link */}
            <BackLink />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 space-y-24">
                {/* Hero Section */}
                <section className="relative h-[50vh] md:h-[60vh] flex flex-col justify-center items-center text-center">
                    <div className="space-y-8 max-w-3xl mx-auto">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-semibold text-brand-sand block">Confección a Medida</span>
                        <h1 className="font-serif text-5xl md:text-7xl leading-tight text-white">
                            Tu historia,<br />
                            <span className="italic text-brand-sand">hecha a mano</span>
                        </h1>
                        <p className="text-white/90 text-base md:text-xl leading-relaxed max-w-2xl mx-auto">
                            Diseño y confecciono prendas desde cero. En mi taller, la creación de una pieza a medida nace de una conversación honesta para entender tu cuerpo, tu estilo y lo que quieres expresar.
                        </p>
                        <div className="pt-4 flex justify-center">
                            <Link 
                                href="#contacto" 
                                className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] max-w-full"
                            >
                                <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] text-center">
                                    Comenzar mi diseño
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* The Process */}
                <section className="py-16 md:py-24 bg-transparent border-t border-white/10 px-8 md:px-16">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl text-white">¿Cómo trabajaremos juntas?</h2>
                        <p className="text-white/80 mt-4 max-w-2xl mx-auto">Un proceso artesanal donde tú eres parte de cada decisión.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Coffee className="w-6 h-6 text-brand-sand" />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 block">Paso 01</span>
                            <h3 className="font-serif text-2xl text-white">La Conversación</h3>
                            <p className="text-sm text-white/80 leading-relaxed">
                                Nos sentamos a tomar un café en el taller. Escucho tus ideas, entiendo tu estilo de vida y estudiamos juntas lo que mejor resalta tu figura.
                            </p>
                        </div>
                        
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-6 h-6 text-brand-sand" />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 block">Paso 02</span>
                            <h3 className="font-serif text-2xl text-white">Las Telas</h3>
                            <p className="text-sm text-white/80 leading-relaxed">
                                Busco y selecciono personalmente los mejores materiales para tu diseño. Telas que no solo se vean hermosas, sino que tengan la caída y el tacto perfecto.
                            </p>
                        </div>

                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Scissors className="w-6 h-6 text-brand-sand" />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 block">Paso 03</span>
                            <h3 className="font-serif text-2xl text-white">El Calce</h3>
                            <p className="text-sm text-white/80 leading-relaxed">
                                A través de pruebas en mi taller de Vitacura, ajustamos la prenda "puntada a puntada" hasta lograr que te quede como una segunda piel.
                            </p>
                        </div>
                    </div>
                </section>

                {/* WhatsApp Contact Section */}
                <section id="contacto" className="bg-transparent border-t border-white/10 text-white rounded-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="flex-1 p-12 md:p-20 flex flex-col justify-center space-y-8">
                        <h2 className="font-serif text-4xl md:text-5xl leading-tight">Tu prenda única<br className="hidden md:block"/><span className="italic text-brand-sand">comienza aquí</span></h2>
                        <p className="text-white/80 leading-relaxed text-sm md:text-base max-w-md">
                            La confección a medida requiere tiempo y dedicación. Escríbeme directamente por WhatsApp para agendar tu primera visita al taller y empezar a darle forma a tu idea.
                        </p>
                        <div className="pt-4">
                            <Link
                                href="https://walink.co/5cm5kh"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] w-full md:w-auto max-w-full"
                            >
                                <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] text-center">
                                    <MessageCircle className="w-4 h-4 flex-shrink-0" /> Hablemos por WhatsApp
                                </span>
                            </Link>
                        </div>
                        <p className="text-[10px] text-white/50 uppercase tracking-widest mt-4 text-center md:text-left">Atención personal con Elena</p>
                    </div>
                    <div className="flex-1 min-h-[300px] md:min-h-full relative">
                        <img
                            src="/Elena%20basos%20cruzados.jpeg"
                            alt="Elena en su taller"
                            className="absolute inset-0 w-full h-full object-cover rounded-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 to-transparent opacity-90 md:opacity-50 rounded-sm" />
                    </div>
                </section>

            </main>
        </div>
    );
}
