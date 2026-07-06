'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, RefreshCw, Scissors, Award, ArrowRight } from 'lucide-react';

export default function BridalLandingPage() {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-[#cda45e] selection:text-black">
            {/* Hero Section */}
            <header className="relative h-[80vh] flex items-center justify-center overflow-hidden border-b border-white/5">
                {/* Background image overlay */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=1600')] bg-cover bg-center opacity-25 mix-blend-luminosity"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent"></div>
                
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
                    <span className="text-[#cda45e] text-xs uppercase tracking-[0.4em] font-semibold block">
                        Novias 2026-2027
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight">
                        Novias de Alta Costura
                    </h1>
                    <p className="font-serif italic text-xl md:text-2xl text-[#f5f2eb]/70 max-w-2xl mx-auto">
                        "Diseñamos y confeccionamos a medida. No vendemos vestidos de stock."
                    </p>
                    <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                        En Elena La Costurera, tu vestido de novia es una creación única. Diseñamos de cero sobre tus medidas físicas o transformamos el vestido heredado de tu familia mediante Upcycling de lujo.
                    </p>
                    
                    <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <a 
                            href="#comunas" 
                            className="w-full sm:w-auto px-8 py-4 bg-[#cda45e] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#b08b49] transition-all duration-300 shadow-[0_4px_20px_rgba(205,164,94,0.15)] text-center"
                        >
                            Reservar Primera Cita de Diseño
                        </a>
                    </div>
                </div>
            </header>

            {/* Slow Fashion / Philosophy */}
            <section className="py-24 bg-[#121212] border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-7 space-y-6">
                            <span className="flex items-center gap-2 text-[#cda45e]">
                                <Heart className="w-5 h-5" />
                                <span className="text-[10px] uppercase tracking-widest font-bold">Moda Circular y Conciencia</span>
                            </span>
                            <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
                                Upcycling: La Historia Convertida en Diseño
                            </h2>
                            <p className="text-white/70 text-sm md:text-base leading-relaxed">
                                Rediseñamos vestidos de novia con alto valor emocional. Si deseas vestir el traje de novia de tu madre o abuela, en nuestro taller realizamos una transformación completa: modernizamos el corte, adaptamos las medidas al milímetro y creamos una propuesta de diseño contemporánea sin perder su esencia.
                            </p>
                        </div>
                        <div className="lg:col-span-5">
                            <div className="aspect-[3/4] bg-[url('https://images.unsplash.com/photo-1591551970138-0c864547c814?q=80&w=1000')] bg-cover bg-center border border-white/10 p-6 flex flex-col justify-end shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent z-0"></div>
                                <div className="relative z-10 space-y-2">
                                    <span className="text-[#cda45e] text-[9px] uppercase tracking-widest font-bold">Oficio de Costura</span>
                                    <p className="font-serif text-lg italic text-white/90">"Tu historia, tu vestido."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="py-24 bg-[#0d0d0d] border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
                        <span className="text-[#cda45e] text-[10px] uppercase tracking-widest font-bold">La Experiencia Novias</span>
                        <h2 className="font-serif text-3xl md:text-5xl">Diseño con Sentido e Identidad</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-4 border border-white/5 bg-[#121212] p-8 rounded-sm">
                            <Scissors className="w-8 h-8 text-[#cda45e]" />
                            <h3 className="font-serif text-xl">Patronaje a tu Medida</h3>
                            <p className="text-white/60 text-xs leading-relaxed">
                                Diseñamos y cortamos la tela exclusivamente sobre tus proporciones físicas. Olvídate de los ajustes masivos del retail; aquí cada costura está pensada para ti.
                            </p>
                        </div>

                        <div className="space-y-4 border border-white/5 bg-[#121212] p-8 rounded-sm">
                            <RefreshCw className="w-8 h-8 text-[#cda45e]" />
                            <h3 className="font-serif text-xl">Upcycling de Vestidos</h3>
                            <p className="text-white/60 text-xs leading-relaxed">
                                Transformación de telas vintage, encajes y siluetas para novias que buscan un vestido con alma y un profundo respeto medioambiental.
                            </p>
                        </div>

                        <div className="space-y-4 border border-white/5 bg-[#121212] p-8 rounded-sm">
                            <Award className="w-8 h-8 text-[#cda45e]" />
                            <h3 className="font-serif text-xl">Dedicación Manual</h3>
                            <p className="text-white/60 text-xs leading-relaxed">
                                Cada detalle de encaje, pedrería o terminación interna es ejecutado artesanalmente en nuestro taller de costura por modistas expertas.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Commune Targeting */}
            <section id="comunas" className="py-24 bg-[#121212]">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
                    <div className="space-y-4">
                        <span className="text-[#cda45e] text-[10px] uppercase tracking-widest font-bold">Showroom & Citas</span>
                        <h2 className="font-serif text-3xl md:text-5xl text-white">Agenda tu Asesoría de Novia</h2>
                        <p className="text-white/60 text-xs md:text-sm max-w-xl mx-auto">
                            Coordinamos citas de calce y diseño exclusivas en nuestro showroom en Vitacura. Selecciona tu comuna para iniciar el contacto:
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[
                            { name: 'Vitacura', path: 'vitacura' },
                            { name: 'Las Condes', path: 'las-condes' },
                            { name: 'Lo Barnechea', path: 'lo-barnechea' },
                            { name: 'Colina / Chicureo', path: 'chicureo' },
                            { name: 'Providencia', path: 'providencia' },
                            { name: 'La Reina', path: 'la-reina' },
                            { name: 'Ñuñoa', path: 'nunoa' },
                            { name: 'Huechuraba', path: 'huechuraba' },
                            { name: 'Maipú', path: 'maipu' },
                            { name: 'La Florida', path: 'la-florida' },
                            { name: 'Peñalolén', path: 'penalolen' },
                            { name: 'San Miguel', path: 'san-miguel' }
                        ].map((c) => (
                            <Link 
                                key={c.path}
                                href={`/novias/${c.path}`} 
                                className="group p-6 bg-[#0d0d0d] border border-white/5 hover:border-[#cda45e] transition-all duration-300 flex flex-col items-center justify-center gap-2 rounded-sm"
                            >
                                <span className="text-xs uppercase tracking-widest font-bold text-white group-hover:text-[#cda45e] transition-colors">{c.name}</span>
                                <ArrowRight className="w-4 h-4 text-white/30 group-hover:translate-x-1 transition-all group-hover:text-[#cda45e]" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 text-center text-white/40 text-xs bg-[#0d0d0d] tracking-widest uppercase">
                Elena La Costurera &copy; 2026 - Confección y Rediseño de Novias a Medida
            </footer>
        </div>
    );
}
