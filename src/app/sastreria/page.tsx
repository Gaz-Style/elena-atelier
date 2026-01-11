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
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-terracotta">The Master Tailor Experience</span>
                    <h1 className="font-serif text-7xl leading-tight text-brand-charcoal max-w-4xl">
                        Sastrería Consciente: <br />
                        <span className="italic text-brand-terracotta font-light">Diseñada para perdurar</span>
                    </h1>
                    <p className="text-gray-500 text-xl max-w-2xl leading-relaxed">
                        Creamos piezas únicas que son el reflejo de su personalidad. Nuestra sastrería combina la tradición antigua con tecnología moderna de calce para lograr una experiencia inigualable.
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
                <section className="grid lg:grid-cols-3 gap-1 grid-bg">
                    <div className="lg:col-span-2 aspect-video bg-gray-100 overflow-hidden">
                        <img src="/assets/media/elena_atelier_showroom_interior_1768080112223.png" alt="Showroom Sastrería" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-brand-charcoal text-white p-16 flex flex-col justify-center space-y-8">
                        <h3 className="font-serif text-3xl">Maestría en Telas</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Trabajamos con las casas textiles más prestigiosas del mundo (Loro Piana, Zegna, Scabal) para garantizar que su prenda no solo se vea perfecta, sino que se sienta como una segunda piel.
                        </p>
                        <ul className="space-y-4 text-xs uppercase tracking-widest font-bold text-brand-terracotta">
                            <li className="flex items-center gap-3"><Scissors className="w-4 h-4" /> Corte Láser de Precisión</li>
                            <li className="flex items-center gap-3"><Ruler className="w-4 h-4" /> 42 Puntos de Medición</li>
                            <li className="flex items-center gap-3"><Award className="w-4 h-4" /> Certificación de Trazabilidad</li>
                        </ul>
                    </div>
                </section>

                {/* Clienteling section */}
                <section className="py-24 bg-brand-sand/20 rounded-sm p-16 flex flex-col md:flex-row gap-16 items-center">
                    <div className="flex-1 space-y-6">
                        <h2 className="font-serif text-4xl">Su propia identidad textil</h2>
                        <p className="text-gray-600 leading-relaxed">
                            El proceso de sastrería en Elena Atelier comienza con una conversación. Entendemos su estilo de vida, sus ocasiones y sus preferencias para crear algo que no solo sea una prenda, sino una herramienta de confianza.
                        </p>
                        <div className="grid grid-cols-2 gap-8 pt-8">
                            <div>
                                <h4 className="font-serif text-xl mb-2">Fitting VIP</h4>
                                <p className="text-xs text-gray-500">Sesiones privadas en nuestro atelier de Tabancura con especialistas en calce.</p>
                            </div>
                            <div>
                                <h4 className="font-serif text-xl mb-2">Seguimiento Digital</h4>
                                <p className="text-xs text-gray-500">Monitoree el estado de confección de su pieza a través de su Pasaporte Digital.</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-[400px] space-y-8">
                        <div className="bg-white p-10 border border-gray-100 shadow-sm text-center">
                            <UserCheck className="w-12 h-12 text-brand-terracotta mx-auto mb-6" />
                            <h3 className="font-serif text-2xl mb-4">¿Hablamos?</h3>
                            <p className="text-xs text-gray-400 mb-8 uppercase tracking-widest">Atención hiper-personalizada</p>
                            <button className="w-full bg-green-600 text-white py-4 flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold hover:bg-green-700 transition-all">
                                <MessageCircle className="w-4 h-4" /> WhatsApp Directo
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
