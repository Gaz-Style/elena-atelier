'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { ShieldCheck, Sparkles, Ruler, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RestauracionPage() {
    return (
        <div className="relative min-h-screen font-sans bg-brand-charcoal text-white">
            <Navbar />

            {/* ── Hero Section: Video con overlay premium ── */}
            <section className="relative min-h-screen flex items-center justify-center text-center px-6 pt-20 overflow-hidden">
                {/* Video de fondo con overlay translúcido */}
                <div className="absolute inset-0 -z-10">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                    >
                        <source src="/Reparaciones.mp4" type="video/mp4" />
                    </video>
                    {/* Overlay oscuro suave para profundidad cinematográfica */}
                    <div className="absolute inset-0 bg-black/65" />
                </div>

                <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                    <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-brand-sand block">
                        El Oficio del Detalle
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight uppercase tracking-tight text-white">
                        Tu Ropa,<br />
                        <span className="italic text-brand-sand font-serif normal-case tracking-normal">Tu Historia</span>
                    </h1>
                    <p className="font-sans text-base md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                        Más que arreglar, cuidamos lo que amas. Cada puntada respeta el diseño original para que tus prendas favoritas te acompañen por siempre.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            href="/appointment"
                            className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] w-full md:w-auto max-w-full"
                        >
                            <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] text-center">
                                Agendar Evaluación
                                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
                            </span>
                        </Link>
                        <Link
                            href="/sastreria"
                            className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-12 md:py-5 border-[0.5px] border-white/10 border-t-white/20 border-l-white/20 border-b-white/5 border-r-white/5 text-white/80 font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] font-semibold bg-white/[0.02] backdrop-blur-[5px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/[0.08] hover:border-white/20 hover:text-white text-center rounded-[1px] w-full md:w-auto max-w-full"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-white transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                                Ver Confección a Medida
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Proceso / Método ── */}
            <section className="bg-transparent py-24 md:py-32 px-6 border-t border-white/10 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-brand-sand block mb-4">
                            Cómo Trabajamos
                        </span>
                        <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
                            El Método <span className="italic text-brand-sand">Atelier</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Revisión Honesta',
                                desc: 'Analizamos tu prenda contigo para determinar el proceso más respetuoso con el diseño original.',
                                icon: ShieldCheck,
                                num: '01'
                            },
                            {
                                title: 'Manos Expertas',
                                desc: 'Recuperamos la forma y caída original usando técnicas de costura invisibles y materiales de calidad.',
                                icon: Sparkles,
                                num: '02'
                            },
                            {
                                title: 'Tu Calce Real',
                                desc: 'Cada restauración incluye una prueba final para que te sientas cómoda y segura con el resultado.',
                                icon: Ruler,
                                num: '03'
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="relative p-10 border border-white/10 rounded-sm bg-white/[0.03] backdrop-blur-[10px] hover:bg-white/[0.06] hover:border-brand-sand/30 hover:shadow-[0_0_24px_rgba(255,255,255,0.06)] transition-all duration-500 group"
                            >
                                <span className="absolute top-6 right-8 font-serif text-5xl text-white/5 group-hover:text-brand-sand/10 transition-all">
                                    {item.num}
                                </span>
                                <item.icon className="w-8 h-8 text-brand-sand mb-6" />
                                <h3 className="font-serif text-2xl text-white mb-3">{item.title}</h3>
                                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Qué reparamos ── */}
            <section className="bg-white/[0.02] py-24 md:py-32 px-6 border-t border-white/10 relative z-10">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-brand-sand block">
                            Nuestros Servicios
                        </span>
                        <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
                            ¿Qué podemos<br />
                            <span className="italic text-brand-sand">reparar?</span>
                        </h2>
                        <p className="text-white/60 text-sm md:text-base leading-relaxed">
                            Desde un dobladillo hasta la restauración completa de un vestido de novia. No hay prenda demasiado delicada ni demasiado compleja para nuestras manos.
                        </p>
                        <ul className="space-y-3 text-white/80 text-sm">
                            {[
                                'Ajustes y entradas de tela',
                                'Cambio y reparación de cierres',
                                'Dobladillos y ruedos',
                                'Restauración de vestidos de novia y gala',
                                'Reparación de cuero y tejidos especiales',
                                'Arreglos de ropa de trabajo y uniformes',
                            ].map((s, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-sand flex-shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                        <div className="pt-4">
                            <Link
                                href="/appointment"
                                className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] w-full md:w-auto max-w-full"
                            >
                                <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] text-center">
                                    Agenda tu visita
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div className="relative h-[400px] md:h-[550px] rounded-sm overflow-hidden shadow-2xl border border-white/10">
                        <img
                            src="/Elena%20basos%20cruzados.jpeg"
                            alt="Elena La Costurera"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* ── CTA Final ── */}
            <section className="bg-brand-charcoal py-24 md:py-32 px-6 text-center border-t border-white/10 relative z-10">
                <div className="max-w-3xl mx-auto space-y-8">
                    <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-brand-sand block">
                        El Primer Paso es Fácil
                    </span>
                    <h2 className="font-serif text-4xl md:text-6xl text-white leading-tight">
                        Trae tu prenda,<br />
                        <span className="italic text-brand-sand">yo me encargo del resto</span>
                    </h2>
                    <p className="text-white/60 text-sm md:text-base">
                        Av. Tabancura 1091, Of. 319 · Vitacura · Lunes a Viernes 10:00–19:00
                    </p>
                    <div className="flex justify-center pt-4">
                        <Link
                            href="/appointment"
                            className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] w-full md:w-auto max-w-full"
                        >
                            <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] text-center">
                                Agenda tu visita
                                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
                            </span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
