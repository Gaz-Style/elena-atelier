'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { ShieldCheck, Ruler, Sparkles, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RestauracionPage() {
    return (
        <div className="min-h-screen bg-brand-sand/10 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-8 pt-32 pb-24">
                {/* Luxury Hero for Service */}
                <section className="grid lg:grid-cols-2 gap-16 items-center border-b border-gray-200 pb-24">
                    <div className="space-y-8">
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta">Compromiso con el Oficio</span>
                        <h1 className="font-serif text-6xl leading-tight text-brand-charcoal">
                            El Oficio del Detalle: <br />
                            <span className="italic text-brand-terracotta">Tu Ropa, Tu Historia</span>
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Más que arreglar, cuidamos lo que amas. En nuestro taller de Vitacura, nos comprometemos con cada puntada para que tus prendas favoritas te acompañen por siempre, aplicando una curaduría técnica que respeta el diseño original.
                        </p>
                        <div className="flex gap-6">
                            <Link href="/appointment" className="bg-brand-charcoal text-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-brand-terracotta transition-all">
                                Agendar Evaluación Técnica
                            </Link>
                        </div>
                    </div>
                    <div className="aspect-[4/5] bg-gray-200 overflow-hidden rounded-sm shadow-2xl">
                        <img src="/assets/media/restauracion_vestido_gala.png" alt="Alta Costura y Vestidos de Gala" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" />
                    </div>
                </section>

                {/* Process Steps */}
                <section className="py-24 space-y-20">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="font-serif text-4xl mb-4">El Método Atelier</h2>
                        <p className="text-sm text-gray-500 uppercase tracking-widest">Precisión en cada fibra</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { title: 'Revisión Honesta', desc: 'Analizamos tu prenda contigo para determinar el proceso más respetuoso con el diseño original.', icon: ShieldCheck },
                            { title: 'Manos Expertas', desc: 'Recuperamos la forma y caída original usando técnicas de costura invisibles y materiales de calidad.', icon: Sparkles },
                            { title: 'Tu Calce Real', desc: 'Cada restauración incluye una prueba final para que te sientas cómoda y segura con el resultado.', icon: Ruler },
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-12 border border-gray-100 space-y-6 hover:shadow-xl transition-shadow">
                                <feature.icon className="w-10 h-10 text-brand-terracotta" />
                                <h3 className="font-serif text-2xl">{feature.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Call to Action Portfolio */}
                <section className="bg-brand-charcoal text-white p-20 flex flex-col lg:flex-row justify-between items-center gap-12 rounded-sm">
                    <div className="max-w-xl">
                        <h2 className="font-serif text-4xl mb-4">Nuestro Trabajo</h2>
                        <p className="text-gray-400 text-sm">Mira cómo hemos cuidado y transformado prendas que sus dueños daban por perdidas. Cada intervención es un compromiso con la longevidad de tu armario.</p>
                    </div>
                    <Link
                        href="/appointment"
                        className="whitespace-nowrap flex items-center gap-2 border border-white/20 px-10 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-brand-charcoal transition-all"
                    >
                        Ver Casos de Éxito <ArrowRight className="w-4 h-4" />
                    </Link>
                </section>
            </main>
        </div>
    );
}
