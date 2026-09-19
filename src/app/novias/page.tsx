'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import BackLink from '@/components/BackLink';
import { Heart, RefreshCw, Scissors, Award, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function BridalLandingPage() {
    return (
        <div className="min-h-screen bg-transparent font-sans relative selection:bg-[#cda45e] selection:text-black">
            {/* Fixed Parallax Background Video: Elena probando un vestido de novia */}
            <div className="fixed inset-0 -z-10 bg-brand-charcoal">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                >
                    <source src="/Elena%20vestido%20de%20novia%20.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/65" />
            </div>

            <Navbar />

            {/* Back Link */}
            <BackLink />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 space-y-24">
                {/* Hero Section */}
                <section className="relative min-h-[70vh] flex flex-col justify-center items-center text-center px-4">
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-brand-sand block">
                            Novias 2026-2027 · Confección & Upcycling
                        </span>
                        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight text-white uppercase tracking-tight">
                            Novias de<br />
                            <span className="italic text-brand-sand font-serif normal-case tracking-normal">Alta Costura</span>
                        </h1>
                        <p className="font-serif italic text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
                            "Diseñamos y confeccionamos a medida. Más de 300 novias vestidas en el sector oriente de Santiago."
                        </p>
                        <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
                            En Elena La Costurera, tu vestido de novia es una creación única. Diseñamos desde cero sobre tus medidas físicas exactas o realizamos un Upcycling de lujo transformando vestidos heredados familiares con garantía de calce de 15 días.
                        </p>
                        
                        <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                            <Link
                                href="/agenda"
                                className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] w-full sm:w-auto"
                            >
                                <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                                    Agendar Cita de Novias
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
                                </span>
                            </Link>
                            <a
                                href="#upcycling"
                                className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-12 md:py-5 border-[0.5px] border-white/10 border-t-white/20 border-l-white/20 border-b-white/5 border-r-white/5 text-white/80 font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] font-semibold bg-white/[0.02] backdrop-blur-[5px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/[0.08] hover:border-white/20 hover:text-white text-center rounded-[1px] w-full sm:w-auto"
                            >
                                Conocer Upcycling Nupcial
                            </a>
                        </div>
                    </div>
                </section>

                {/* Slow Fashion / Upcycling Philosophy */}
                <section id="upcycling" className="py-20 md:py-28 bg-white/[0.03] backdrop-blur-[12px] border border-white/10 rounded-sm p-8 md:p-16 relative z-10 shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7 space-y-6">
                            <span className="flex items-center gap-2 text-brand-sand">
                                <Heart className="w-5 h-5" />
                                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Moda Circular y Conciencia</span>
                            </span>
                            <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
                                Upcycling: La Historia Convertida en Diseño
                            </h2>
                            <p className="text-white/80 text-base md:text-lg leading-relaxed font-light">
                                Rediseñamos vestidos de novia con alto valor emocional. Si deseas vestir el traje de novia de tu madre o abuela, en nuestro atelier realizamos una transformación completa: modernizamos el corte, adaptamos las medidas al milímetro y creamos una propuesta de diseño contemporánea sin perder su esencia.
                            </p>
                            <div className="pt-2">
                                <Link
                                    href="/appointment"
                                    className="inline-flex items-center gap-2 text-brand-sand text-xs uppercase tracking-widest font-bold hover:text-white transition-colors"
                                >
                                    Agendar consulta de rediseño <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="lg:col-span-5">
                            <div className="relative aspect-[3/4] border border-white/10 p-6 flex flex-col justify-end shadow-2xl rounded-sm overflow-hidden group">
                                <img 
                                    src="/novia/Novia%20Elegante%201.png" 
                                    alt="Upcycling Vestido de Novia" 
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 group-hover:opacity-80 transition-opacity"></div>
                                <div className="relative z-20 space-y-2">
                                    <span className="text-brand-sand text-[10px] uppercase tracking-widest font-bold block">Oficio de Alta Costura</span>
                                    <p className="font-serif text-xl italic text-white">"Tu historia, tu vestido."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Pillars */}
                <section className="py-16 md:py-24 bg-transparent border-t border-white/10 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <span className="text-brand-sand text-[10px] uppercase tracking-[0.45em] font-semibold block">La Experiencia Novias</span>
                        <h2 className="font-serif text-4xl md:text-5xl text-white">Diseño con Sentido e Identidad</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="relative p-8 border border-white/10 rounded-sm bg-white/[0.03] backdrop-blur-[10px] hover:bg-white/[0.06] hover:border-brand-sand/30 hover:shadow-[0_0_24px_rgba(255,255,255,0.06)] transition-all duration-500 group space-y-4">
                            <Scissors className="w-8 h-8 text-brand-sand" />
                            <h3 className="font-serif text-2xl text-white">Patronaje a tu Medida</h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                Diseñamos y cortamos la tela exclusivamente sobre tus proporciones físicas. Olvídate de los ajustes masivos del retail; aquí cada costura está pensada para ti.
                            </p>
                        </div>

                        <div className="relative p-8 border border-white/10 rounded-sm bg-white/[0.03] backdrop-blur-[10px] hover:bg-white/[0.06] hover:border-brand-sand/30 hover:shadow-[0_0_24px_rgba(255,255,255,0.06)] transition-all duration-500 group space-y-4">
                            <RefreshCw className="w-8 h-8 text-brand-sand" />
                            <h3 className="font-serif text-2xl text-white">Upcycling de Vestidos</h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                Transformación de telas vintage, encajes y siluetas para novias que buscan un vestido con alma y un profundo respeto medioambiental.
                            </p>
                        </div>

                        <div className="relative p-8 border border-white/10 rounded-sm bg-white/[0.03] backdrop-blur-[10px] hover:bg-white/[0.06] hover:border-brand-sand/30 hover:shadow-[0_0_24px_rgba(255,255,255,0.06)] transition-all duration-500 group space-y-4">
                            <Award className="w-8 h-8 text-brand-sand" />
                            <h3 className="font-serif text-2xl text-white">Dedicación Manual</h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                Cada detalle de encaje, pedrería o terminación interna es ejecutado artesanalmente en nuestro taller de costura por modistas expertas.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Comunas Cobertura Section */}
                <section id="comunas" className="py-16 md:py-24 border-t border-white/10 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <div className="space-y-3">
                            <span className="text-brand-sand text-[10px] uppercase tracking-[0.45em] font-semibold block">Cobertura Novias</span>
                            <h2 className="font-serif text-4xl text-white">Atención en tu Comuna</h2>
                            <p className="text-white/70 text-sm max-w-md mx-auto leading-relaxed">
                                Diseñamos vestidos de novia y hacemos upcycling nupcial de lujo con pruebas en nuestro atelier para novias de todo Santiago.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                            {[
                                { name: 'Vitacura', slug: 'vitacura' },
                                { name: 'Las Condes', slug: 'las-condes' },
                                { name: 'Lo Barnechea', slug: 'lo-barnechea' },
                                { name: 'Providencia', slug: 'providencia' },
                                { name: 'La Reina', slug: 'la-reina' },
                                { name: 'Ñuñoa', slug: 'nunoa' }
                            ].map((c) => (
                                <Link 
                                    key={c.slug}
                                    href={`/novias/${c.slug}`}
                                    className="p-5 border border-white/10 bg-white/[0.03] backdrop-blur-[10px] hover:border-brand-sand/50 hover:bg-white/[0.08] transition-all duration-300 group flex flex-col items-center justify-center gap-2 rounded-sm"
                                >
                                    <MapPin className="w-4 h-4 text-brand-sand" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-white/90 group-hover:text-brand-sand transition-colors">{c.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

