'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, ShieldCheck, RefreshCw, Award, ArrowRight, Instagram } from 'lucide-react';

export default function GraduationLandingPage() {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-[#cda45e] selection:text-black">
            {/* Hero Section */}
            <header className="relative h-[80vh] flex items-center justify-center overflow-hidden border-b border-white/5">
                {/* Background image overlay */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1600')] bg-cover bg-center opacity-25 mix-blend-luminosity"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent"></div>
                
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
                    <span className="text-[#cda45e] text-xs uppercase tracking-[0.4em] font-semibold block animate-fade-in">
                        Gala de Graduación 2026
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight">
                        Elena La Costurera
                    </h1>
                    <p className="font-serif italic text-xl md:text-2xl text-[#f5f2eb]/70 max-w-2xl mx-auto">
                        "Diseñamos y confeccionamos a medida. No vendemos vestidos de stock."
                    </p>
                    <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                        Cada pieza es un lienzo en blanco. Creamos un vestido único adaptado perfectamente a tu cuerpo, tu estilo y tus proporciones, o transformamos una joya familiar mediante Upcycling.
                    </p>
                    
                    <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link 
                            href="/graduacion/registro-exclusividad" 
                            className="w-full sm:w-auto px-8 py-4 bg-[#cda45e] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#b08b49] transition-all duration-300 shadow-[0_4px_20px_rgba(205,164,94,0.15)] text-center"
                        >
                            Verificar Exclusividad por Colegio
                        </Link>
                        <a 
                            href="#comunas" 
                            className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white font-semibold text-xs uppercase tracking-widest hover:bg-white/5 transition-all duration-300 text-center"
                        >
                            Reservar Cita de Calce
                        </a>
                    </div>
                </div>
            </header>

            {/* Miss World Runway Proof Section */}
            <section className="py-24 border-b border-white/5 bg-[#121212]">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-7 space-y-6">
                            <span className="flex items-center gap-2 text-[#cda45e]">
                                <Award className="w-5 h-5" />
                                <span className="text-[10px] uppercase tracking-widest font-bold">Prestigio de Alta Gala</span>
                            </span>
                            <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
                                De las Pasarelas del Mundo a tu Gala de Graduación
                            </h2>
                            <p className="text-white/70 text-sm md:text-base leading-relaxed">
                                Tuvimos el honor de diseñar y confeccionar el vestido de gala para la representante de **Miss Mundo**. El mismo nivel de precisión técnica, modelado sobre el cuerpo y maestría artesanal está disponible para crear tu vestido de 4to medio.
                            </p>
                            
                            <div className="pt-4">
                                <a 
                                    href="https://www.instagram.com/p/C603Hl5rQ7T/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-[#cda45e] text-xs uppercase tracking-widest font-bold transition-all duration-300"
                                >
                                    <Instagram className="w-4 h-4 text-[#cda45e]" />
                                    Ver Vestido en Pasarela (Instagram)
                                </a>
                            </div>
                        </div>
                        <div className="lg:col-span-5 relative">
                            {/* Visual representation card */}
                            <div className="aspect-[3/4] bg-[url('https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000')] bg-cover bg-center border border-white/10 p-6 flex flex-col justify-end shadow-2xl group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-0"></div>
                                <div className="relative z-10 space-y-2">
                                    <span className="text-[#cda45e] text-[9px] uppercase tracking-widest font-bold">Gala Miss Mundo</span>
                                    <p className="font-serif text-lg italic text-white/90">"La excelencia del oficio hecha vestido."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values / Concept */}
            <section className="py-24 bg-[#0d0d0d] border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
                        <span className="text-[#cda45e] text-[10px] uppercase tracking-widest font-bold">Por qué Elena La Costurera</span>
                        <h2 className="font-serif text-3xl md:text-5xl">El Oficio Detrás de cada Diseño</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Value 1 */}
                        <div className="space-y-4 border border-white/5 bg-[#121212] p-8 rounded-sm hover:border-[#cda45e]/30 transition-all duration-300">
                            <Sparkles className="w-8 h-8 text-[#cda45e]" />
                            <h3 className="font-serif text-xl">100% Confección a Medida</h3>
                            <p className="text-white/60 text-xs leading-relaxed">
                                No importamos ni vendemos ropa prefabricada. Diseñamos de cero sobre tus medidas físicas exactas, garantizando un entalle impecable y una silueta favorecedora.
                            </p>
                        </div>

                        {/* Value 2 */}
                        <div className="space-y-4 border border-white/5 bg-[#121212] p-8 rounded-sm hover:border-[#cda45e]/30 transition-all duration-300">
                            <RefreshCw className="w-8 h-8 text-[#cda45e]" />
                            <h3 className="font-serif text-xl">Upcycling & Moda Sostenible</h3>
                            <p className="text-white/60 text-xs leading-relaxed">
                                Promovemos un sentido medioambiental consciente. Trae una prenda familiar o un vestido especial, y mediante el oficio lo rediseñamos y transformamos para tu noche de gala.
                            </p>
                        </div>

                        {/* Value 3 */}
                        <div className="space-y-4 border border-white/5 bg-[#121212] p-8 rounded-sm hover:border-[#cda45e]/30 transition-all duration-300">
                            <ShieldCheck className="w-8 h-8 text-[#cda45e]" />
                            <h3 className="font-serif text-xl">Registro de Exclusividad</h3>
                            <p className="text-white/60 text-xs leading-relaxed">
                                Llevamos un registro estricto por establecimiento. Garantizamos que no confeccionaremos ni reformaremos un diseño similar para otra graduada de tu mismo colegio y curso.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Target Communes and Booking Widget Hook */}
            <section id="comunas" className="py-24 bg-[#121212]">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
                    <div className="space-y-4">
                        <span className="text-[#cda45e] text-[10px] uppercase tracking-widest font-bold">Showroom & Citas</span>
                        <h2 className="font-serif text-3xl md:text-5xl text-white">Reserva tu Cita de Diseño</h2>
                        <p className="text-white/60 text-xs md:text-sm max-w-xl mx-auto">
                            Atendemos exclusivamente con cita previa en nuestro Showroom de Vitacura. Selecciona tu comuna de procedencia para coordinar tu visita:
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
                                href={`/graduacion/${c.path}`} 
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
                Elena La Costurera &copy; 2026 - Alta Costura a Medida y Upcycling
            </footer>
        </div>
    );
}
