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
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta">Servicio Especializado</span>
                        <h1 className="font-serif text-6xl leading-tight text-brand-charcoal">
                            Alta Costura: <br />
                            <span className="italic text-brand-terracotta">Restauración de Gala</span>
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Especialistas en la preservación de vestidos de fiesta y prendas de alta gama. En Elena Atelier aplicamos maestría técnica en sedas, encajes y pedrería para que sus piezas más memorables mantengan su esplendor original.
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
                            { title: 'Revisión Detallada', desc: 'Analizamos la composición de la fibra y el estado de la trama para determinar el proceso menos invasivo.', icon: ShieldCheck },
                            { title: 'Arreglos de Precisión', desc: 'Uso de hilos de seda y técnicas de costura invisibles para recuperar la forma y caída original.', icon: Sparkles },
                            { title: 'Calce Perfecto', desc: 'Cada restauración incluye una prueba final para asegurar que la prenda se ajuste perfectamente a su fisonomía.', icon: Ruler },
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
                        <h2 className="font-serif text-4xl mb-4">Galería de Trabajos</h2>
                        <p className="text-gray-400 text-sm">Vea cómo hemos transformado piezas de alta costura mediante nuestra restauración técnica. Cada intervención cuenta una historia de durabilidad.</p>
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
