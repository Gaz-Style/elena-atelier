'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { ShieldCheck, Sparkles, Ruler } from 'lucide-react';
import Link from 'next/link';

export default function RestauracionPage() {
    return (
        <div className="relative min-h-screen font-sans bg-white">
            <Navbar />

            {/* ── Hero Section: Video con overlay muy claro ── */}
            <section className="relative min-h-screen flex items-center justify-center text-center px-6 pt-20 overflow-hidden">
                {/* Video de fondo con overlay blanco translúcido */}
                <div className="absolute inset-0 -z-10">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src="/Reparaciones.mp4" type="video/mp4" />
                    </video>
                    {/* Overlay blanco suave para efecto pulcro */}
                    <div className="absolute inset-0 bg-white/75" />
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-terracotta block">
                        El Oficio del Detalle
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-brand-charcoal leading-tight uppercase tracking-tight">
                        Tu Ropa,<br />
                        <span className="italic font-serif normal-case tracking-normal text-brand-terracotta">Tu Historia</span>
                    </h1>
                    <p className="font-sans text-base md:text-xl text-brand-charcoal/70 max-w-2xl mx-auto leading-relaxed">
                        Más que arreglar, cuidamos lo que amas. Cada puntada respeta el diseño original para que tus prendas favoritas te acompañen por siempre.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            href="/appointment"
                            className="w-full md:w-auto bg-brand-charcoal text-white px-10 py-4 rounded-sm text-xs uppercase tracking-widest hover:bg-brand-terracotta transition-all text-center"
                        >
                            Agendar Evaluación
                        </Link>
                        <Link
                            href="/sastreria"
                            className="w-full md:w-auto border border-brand-charcoal/40 text-brand-charcoal px-10 py-4 rounded-sm text-xs uppercase tracking-widest hover:border-brand-terracotta hover:text-brand-terracotta transition-all text-center"
                        >
                            Ver Confección a Medida
                        </Link>
                    </div>
            </div>
            </section>

            {/* ── Proceso / Método ── */}
            <section className="bg-white py-24 md:py-32 px-6 border-t border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-terracotta block mb-4">
                            Cómo Trabajamos
                        </span>
                        <h2 className="font-serif text-4xl md:text-5xl text-brand-charcoal leading-tight">
                            El Método <span className="italic text-brand-terracotta">Atelier</span>
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
                                className="relative p-10 border border-gray-100 rounded-sm hover:shadow-xl hover:border-brand-terracotta/20 transition-all duration-500 group bg-white"
                            >
                                <span className="absolute top-6 right-8 font-serif text-5xl text-gray-100 group-hover:text-brand-terracotta/10 transition-all">
                                    {item.num}
                                </span>
                                <item.icon className="w-8 h-8 text-brand-terracotta mb-6" />
                                <h3 className="font-serif text-2xl text-brand-charcoal mb-3">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Qué reparamos ── */}
            <section className="bg-gray-50/80 py-24 md:py-32 px-6 border-t border-gray-100">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-terracotta block">
                            Nuestros Servicios
                        </span>
                        <h2 className="font-serif text-4xl md:text-5xl text-brand-charcoal leading-tight">
                            ¿Qué podemos<br />
                            <span className="italic text-brand-terracotta">reparar?</span>
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                            Desde un dobladillo hasta la restauración completa de un vestido de novia. No hay prenda demasiado delicada ni demasiado compleja para nuestras manos.
                        </p>
                        <ul className="space-y-3 text-brand-charcoal/80 text-sm">
                            {[
                                'Ajustes y entradas de tela',
                                'Cambio y reparación de cierres',
                                'Dobladillos y ruedos',
                                'Restauración de vestidos de novia y gala',
                                'Reparación de cuero y tejidos especiales',
                                'Arreglos de ropa de trabajo y uniformes',
                            ].map((s, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta flex-shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                        <div className="pt-4">
                            <Link
                                href="/appointment"
                                className="inline-block bg-brand-charcoal text-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-brand-terracotta transition-all"
                            >
                                Agenda tu visita
                            </Link>
                        </div>
                    </div>

                    <div className="relative h-[400px] md:h-[550px] rounded-sm overflow-hidden shadow-xl">
                        <img
                            src="/Elena%20basos%20cruzados.jpeg"
                            alt="Elena La Costurera"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>
            </section>

            {/* ── CTA Final ── */}
            <section className="bg-brand-charcoal py-24 md:py-32 px-6 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-terracotta block">
                        El Primer Paso es Fácil
                    </span>
                    <h2 className="font-serif text-4xl md:text-6xl text-white leading-tight">
                        Trae tu prenda,<br />
                        <span className="italic text-brand-sand">yo me encargo del resto</span>
                    </h2>
                    <p className="text-white/60 text-sm md:text-base">
                        Av. Tabancura 1091, Of. 319 · Vitacura · Lunes a Viernes 10:00–19:00
                    </p>
                    <Link
                        href="/appointment"
                        className="inline-flex items-center gap-2 border border-white/30 text-white px-12 py-5 rounded-sm text-sm uppercase tracking-widest font-bold hover:bg-brand-terracotta hover:border-brand-terracotta transition-all"
                    >
                        Agenda tu visita
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </section>
        </div>
    );
}
