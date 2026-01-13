'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { Ruler, Scissors, UserCheck, Award, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function SastreriaPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-8 pt-32 pb-24 space-y-32">
                {/* Luxury Hero for Sastreria */}
                <section className="flex flex-col items-center text-center space-y-10">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-terracotta">Oficio Moderno</span>
                    <h1 className="font-serif text-7xl leading-tight text-brand-charcoal max-w-4xl">
                        Diseño Consciente: <br />
                        <span className="italic text-brand-terracotta font-light">Piezas con Alma</span>
                    </h1>
                    <p className="text-gray-500 text-xl max-w-2xl leading-relaxed">
                        Co-creamos contigo prendas que nacen de una conversación. En nuestro taller, la sastrería es una forma de expresión personal, joven y honesta, donde cada diseño cuenta tu propia historia.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/appointment" className="bg-brand-charcoal text-white px-12 py-5 text-xs uppercase tracking-widest hover:bg-brand-terracotta transition-all shadow-xl">
                            Diseñar mi prenda
                        </Link>
                        <Link href="/b2b" className="border border-brand-charcoal px-12 py-5 text-xs uppercase tracking-widest hover:bg-brand-sand transition-all">
                            Consultoría B2B
                        </Link>
                    </div>
                </section>

                {/* Technical Showcase */}
                <section className="grid lg:grid-cols-3 gap-4 md:gap-1 items-stretch bg-gray-50">
                    <div className="lg:col-span-2 min-h-[400px] md:h-auto overflow-hidden relative shadow-inner">
                        <img
                            src="/assets/media/confeccion_gala_pink.png"
                            alt="Confección de alta costura - Vestido de gala"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                    <div className="bg-brand-charcoal text-white p-12 md:p-16 flex flex-col justify-center space-y-8">
                        <h3 className="font-serif text-3xl">Materiales Reales</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Buscamos las mejores telas para que tu prenda no solo se vea impecable, sino que se sienta como una extensión de tu personalidad. Calidad que se toca y se siente.
                        </p>
                        <ul className="space-y-4 text-xs uppercase tracking-widest font-bold text-brand-terracotta">
                            <li className="flex items-center gap-3"><Scissors className="w-4 h-4" /> Corte Láser de Precisión</li>
                            <li className="flex items-center gap-3"><Ruler className="w-4 h-4" /> 42 Puntos de Medición</li>
                            <li className="flex items-center gap-3"><Award className="w-4 h-4" /> Origen Garantizado</li>
                        </ul>
                    </div>
                </section>

                {/* Clienteling section */}
                <section className="py-24 bg-brand-sand/20 rounded-sm p-16 flex flex-col md:flex-row gap-16 items-center">
                    <div className="flex-1 space-y-6">
                        <h2 className="font-serif text-4xl">Tu Estilo, Tu Medida</h2>
                        <p className="text-gray-600 leading-relaxed">
                            El proceso en Elena Atelier comienza con una conversación honesta. Entendemos tu estilo de vida y tus gustos para crear una pieza que sea una verdadera expresión de quien eres.
                        </p>
                        <div className="grid grid-cols-2 gap-8 pt-8">
                            <div>
                                <h4 className="font-serif text-xl mb-2">Pruebas Cercanas</h4>
                                <p className="text-xs text-gray-500">Sesiones en nuestro taller de Tabancura, donde nos tomamos el tiempo para escucharte.</p>
                            </div>
                            <div>
                                <h4 className="font-serif text-xl mb-2">Proceso Transparente</h4>
                                <p className="text-xs text-gray-500">Sigue el avance de tu pieza y conoce quién está detrás de cada proceso.</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-[400px] space-y-8">
                        <div className="bg-white p-10 border border-gray-100 shadow-sm text-center">
                            <UserCheck className="w-12 h-12 text-brand-terracotta mx-auto mb-6" />
                            <h3 className="font-serif text-2xl mb-4">¿Hablamos?</h3>
                            <p className="text-xs text-gray-400 mb-8 uppercase tracking-widest">Atención hiper-personalizada</p>
                            <Link
                                href="https://wa.me/56912345678"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-green-600 text-white py-4 flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold hover:bg-green-700 transition-all text-center"
                            >
                                <MessageCircle className="w-4 h-4" /> WhatsApp Directo
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
