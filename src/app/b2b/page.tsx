'use client';

import React from 'react';
import { Scissors, Users, GraduationCap, Coffee, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function CollaborationsPage() {
    return (
        <div className="min-h-screen bg-brand-charcoal text-white font-sans relative">
            <Navbar />

            {/* Back Link */}
            <div className="absolute top-5 left-6 md:left-12 z-30">
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-[#f5f2eb]/50 hover:text-[#f5f2eb] transition-colors font-sans text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Volver al Inicio
                </Link>
            </div>

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 space-y-24">
                
                {/* Header Section */}
                <header className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-brand-sand">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Colaboraciones y Proyectos Especiales</span>
                        </div>
                        <h1 className="font-serif text-5xl md:text-6xl leading-tight text-white">
                            Mi Taller,<br className="hidden md:block" /><span className="italic text-brand-sand">Tu Espacio Creativo</span>
                        </h1>
                        <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
                            Me encanta abrir las puertas de mi taller en Vitacura. Ya sea para dar vida a la colección de un diseñador emergente, colaborar en editoriales artísticas o enseñar el oficio a quienes comparten esta pasión por los hilos.
                        </p>
                    </div>
                    <div className="flex-1 w-full h-[350px] md:h-[500px] relative rounded-sm overflow-hidden shadow-2xl border border-white/10">
                        <img 
                            src="/trabajos/PHOTO-2026-02-25-13-20-14.jpg" 
                            alt="Elena en su taller colaborando" 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
                    </div>
                </header>

                {/* Offerings Section */}
                <section className="bg-white/[0.02] border border-white/10 p-8 md:p-16 rounded-sm shadow-2xl backdrop-blur-[10px]">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl text-white">¿Qué podemos crear juntos?</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                                <Scissors className="w-5 h-5 text-brand-sand" />
                            </div>
                            <h3 className="font-serif text-2xl text-white">Colecciones Cápsula</h3>
                            <p className="text-sm text-white/60 leading-relaxed">
                                Ayudo a diseñadores y marcas independientes a materializar sus ideas. Desde el patronaje hasta la confección del muestrario, aportando la precisión y el cuidado de la alta costura (como en mi colaboración con SEVALI en París).
                            </p>
                        </div>
                        
                        <div className="space-y-4 text-center md:text-left">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                                <GraduationCap className="w-5 h-5 text-brand-sand" />
                            </div>
                            <h3 className="font-serif text-2xl text-white">Mentorías y Clases</h3>
                            <p className="text-sm text-white/60 leading-relaxed">
                                El oficio textil debe transmitirse. Recibo a estudiantes de diseño y apasionados de la moda que quieran aprender las técnicas tradicionales "puntada a puntada" directamente en mi mesa de corte.
                            </p>
                        </div>

                        <div className="space-y-4 text-center md:text-left">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                                <Users className="w-5 h-5 text-brand-sand" />
                            </div>
                            <h3 className="font-serif text-2xl text-white">Alianzas Artísticas</h3>
                            <p className="text-sm text-white/60 leading-relaxed">
                                Vestuario para teatro, piezas únicas para editoriales de moda, o colaboraciones multidisciplinarias. Si tienes un proyecto creativo desafiante, mi taller es el lugar para construirlo juntos.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact Footer */}
                <section className="bg-white/[0.01] border border-white/10 p-12 md:p-20 rounded-sm text-center space-y-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 opacity-5 transform translate-x-1/3 -translate-y-1/4">
                        <Scissors className="w-64 h-64 text-white" />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <Coffee className="w-8 h-8 text-brand-sand mx-auto mb-2" />
                        <h2 className="font-serif text-4xl md:text-5xl text-white">Hablemos de tu proyecto</h2>
                        <p className="max-w-xl mx-auto text-white/60 text-sm md:text-base leading-relaxed mb-6">
                            Todo gran diseño empieza con una buena conversación. Cuéntame qué tienes en mente y veamos cómo mis manos y mi experiencia pueden sumar a tu visión.
                        </p>
                        <div className="flex justify-center pt-2">
                            <Link
                                href="/appointment"
                                className="glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] w-full md:w-auto max-w-full"
                            >
                                <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] text-center">
                                    Tomémonos un Café en el Taller
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 flex-shrink-0" />
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
