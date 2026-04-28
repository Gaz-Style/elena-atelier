'use client';

import React from 'react';
import { Scissors, Users, GraduationCap, Coffee, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function CollaborationsPage() {
    return (
        <div className="min-h-screen bg-brand-sand/10 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 space-y-24">
                
                {/* Header Section */}
                <header className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-brand-terracotta">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Colaboraciones y Proyectos Especiales</span>
                        </div>
                        <h1 className="font-serif text-5xl md:text-6xl leading-tight text-brand-charcoal">
                            Mi Taller,<br className="hidden md:block" /><span className="italic">Tu Espacio Creativo</span>
                        </h1>
                        <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
                            Me encanta abrir las puertas de mi taller en Vitacura. Ya sea para dar vida a la colección de un diseñador emergente, colaborar en editoriales artísticas o enseñar el oficio a quienes comparten esta pasión por los hilos.
                        </p>
                    </div>
                    <div className="flex-1 w-full h-[350px] md:h-[500px] relative rounded-sm overflow-hidden shadow-2xl">
                        <img 
                            src="/trabajos/PHOTO-2026-02-25-13-20-14.jpg" 
                            alt="Elena en su taller colaborando" 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-brand-charcoal/5 mix-blend-multiply" />
                    </div>
                </header>

                {/* Offerings Section */}
                <section className="bg-white p-8 md:p-16 rounded-sm shadow-sm">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl text-brand-charcoal">¿Qué podemos crear juntos?</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="w-12 h-12 bg-brand-sand rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                                <Scissors className="w-5 h-5 text-brand-terracotta" />
                            </div>
                            <h3 className="font-serif text-2xl text-brand-charcoal">Colecciones Cápsula</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Ayudo a diseñadores y marcas independientes a materializar sus ideas. Desde el patronaje hasta la confección del muestrario, aportando la precisión y el cuidado de la alta costura (como en mi colaboración con SEVALI en París).
                            </p>
                        </div>
                        
                        <div className="space-y-4 text-center md:text-left">
                            <div className="w-12 h-12 bg-brand-sand rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                                <GraduationCap className="w-5 h-5 text-brand-terracotta" />
                            </div>
                            <h3 className="font-serif text-2xl text-brand-charcoal">Mentorías y Clases</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                El oficio textil debe transmitirse. Recibo a estudiantes de diseño y apasionados de la moda que quieran aprender las técnicas tradicionales "puntada a puntada" directamente en mi mesa de corte.
                            </p>
                        </div>

                        <div className="space-y-4 text-center md:text-left">
                            <div className="w-12 h-12 bg-brand-sand rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0">
                                <Users className="w-5 h-5 text-brand-terracotta" />
                            </div>
                            <h3 className="font-serif text-2xl text-brand-charcoal">Alianzas Artísticas</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Vestuario para teatro, piezas únicas para editoriales de moda, o colaboraciones multidisciplinarias. Si tienes un proyecto creativo desafiante, mi taller es el lugar para construirlo juntos.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact Footer */}
                <section className="bg-brand-charcoal text-white p-12 md:p-20 rounded-sm text-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-5 transform translate-x-1/3 -translate-y-1/4">
                        <Scissors className="w-64 h-64" />
                    </div>
                    <div className="relative z-10">
                        <Coffee className="w-8 h-8 text-brand-terracotta mx-auto mb-6" />
                        <h2 className="font-serif text-4xl md:text-5xl mb-6">Hablemos de tu proyecto</h2>
                        <p className="max-w-xl mx-auto text-white/80 text-sm md:text-base leading-relaxed mb-10">
                            Todo gran diseño empieza con una buena conversación. Cuéntame qué tienes en mente y veamos cómo mis manos y mi experiencia pueden sumar a tu visión.
                        </p>
                        <Link
                            href="/appointment"
                            className="inline-block bg-brand-terracotta text-white px-10 py-4 text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-brand-charcoal transition-all text-center shadow-lg rounded-sm"
                        >
                            Tomémonos un Café en el Taller
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
