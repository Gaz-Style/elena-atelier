'use client';

import React, { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BackLink from '@/components/BackLink';
import BookingForm from '@/components/BookingForm';

export default function AppointmentPage() {
    const experienceRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    const scrollToSection = (elementRef: React.RefObject<HTMLDivElement | null>) => {
        elementRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-brand-charcoal text-white font-sans relative selection:bg-brand-sand selection:text-brand-charcoal overflow-x-hidden">
            <Navbar />
            
            {/* Back Link with scroll logic */}
            <BackLink />

            {/* ━━━━━━━━━━ 1. HERO CINEMATOGRÁFICO ━━━━━━━━━━ */}
            <section className="relative h-[95vh] flex flex-col justify-end pb-20 px-6 md:px-12 overflow-hidden">
                {/* Background Editorial Video */}
                <div className="absolute inset-0 z-0">
                    <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover object-[65%_center] md:object-center brightness-[0.70] contrast-[1.05] saturate-[0.85]"
                    >
                        <source src="/Elena cociendo.mp4" type="video/mp4" />
                    </video>
                    {/* Dark Elegant Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/30 to-black/40" />
                    <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
                </div>

                <div className="relative z-10 max-w-3xl mx-auto w-full text-center flex flex-col items-center space-y-6">
                    <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.5em] text-brand-sand/90 font-medium animate-fade-in">
                        EL OFICIO COMPARTIDO
                    </span>
                    <h1 className="font-serif text-5xl md:text-8xl leading-[1.05] text-white tracking-tight">
                        Aprender <br />
                        <span className="italic font-light text-brand-sand">Haciendo</span>
                    </h1>
                    <p className="text-sm md:text-lg text-white/80 max-w-lg leading-relaxed font-light font-sans tracking-wide">
                        Un espacio donde el aprendizaje ocurre entre telas, pruebas y oficio real.
                    </p>
                    <div className="pt-6">
                        <button 
                            onClick={() => scrollToSection(experienceRef)}
                            className="glass-btn group relative inline-flex items-center justify-center gap-3 px-8 py-4 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] rounded-[1px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
                        >
                            <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms]">
                                Entrar al taller
                                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] group-hover:translate-x-1" />
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ━━━━━━━━━━ 2. SECCIÓN — EL TALLER COMO EXPERIENCIA ━━━━━━━━━━ */}
            <section ref={experienceRef} className="py-24 md:py-36 bg-brand-charcoal px-6 md:px-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
                    
                    {/* Editorial Text Block */}
                    <div className="lg:col-span-5 space-y-8 lg:pr-12">
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-brand-sand block">El Espacio Vivo</span>
                        <h2 className="font-serif text-4xl md:text-6xl text-white leading-tight font-normal">
                            No todo se aprende en una sala de clases.
                        </h2>
                        <p className="text-white/70 text-base md:text-lg leading-relaxed font-light">
                            El taller es un espacio vivo. Aquí las ideas se prueban, las prendas se corrigen y el oficio se transmite desde la práctica real.
                        </p>
                    </div>

                    {/* Editorial Photo Grid / Collage */}
                    <div className="lg:col-span-7 grid grid-cols-12 gap-4 md:gap-6 relative">
                        <div className="col-span-8 overflow-hidden rounded-sm shadow-xl aspect-[4/5] relative group">
                            <img 
                                src="/Estudiante 2.png" 
                                alt="Estudiante trabajando en el taller" 
                                className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03] saturate-[0.8] group-hover:saturate-[0.95]"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity duration-500" />
                        </div>
                        <div className="col-span-4 flex flex-col gap-4 md:gap-6 pt-12">
                            <div className="overflow-hidden rounded-sm shadow-xl aspect-[3/4] relative group">
                                <img 
                                    src="/elena-torso.jpeg" 
                                    alt="Maniquí de pruebas y fitting" 
                                    className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03] saturate-[0.8] group-hover:saturate-[0.95]"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity duration-500" />
                            </div>
                            <div className="overflow-hidden rounded-sm shadow-xl aspect-square relative group">
                                <img 
                                    src="/elena-taller.png" 
                                    alt="Detalle de telas y bocetos" 
                                    className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03] saturate-[0.8] group-hover:saturate-[0.95]"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity duration-500" />
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ━━━━━━━━━━ 3. SECCIÓN — PARA QUIÉN ES ━━━━━━━━━━ */}
            <section className="py-24 md:py-36 bg-[#181817] px-6 md:px-12 border-t border-b border-white/5">
                <div className="max-w-6xl mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-brand-sand block">Perfiles & Caminos</span>
                        <h2 className="font-serif text-3xl md:text-5xl text-white">Cada proceso comienza distinto.</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Block 1 */}
                        <div className="bg-brand-charcoal/[0.4] border border-white/5 p-10 md:p-12 space-y-6 rounded-sm shadow-lg hover:border-brand-sand/20 hover:bg-brand-charcoal/[0.6] transition-all duration-500 flex flex-col justify-between min-h-[300px]">
                            <div className="space-y-4">
                                <span className="text-brand-sand/50 font-serif text-lg italic block">01</span>
                                <h3 className="font-serif text-2xl text-white">Estudiantes de diseño</h3>
                                <p className="text-white/70 text-sm leading-relaxed font-light">
                                    Acompañamiento técnico y creativo para quienes necesitan transformar ideas en prendas reales.
                                </p>
                            </div>
                        </div>

                        {/* Block 2 */}
                        <div className="bg-brand-charcoal/[0.4] border border-white/5 p-10 md:p-12 space-y-6 rounded-sm shadow-lg hover:border-brand-sand/20 hover:bg-brand-charcoal/[0.6] transition-all duration-500 flex flex-col justify-between min-h-[300px]">
                            <div className="space-y-4">
                                <span className="text-brand-sand/50 font-serif text-lg italic block">02</span>
                                <h3 className="font-serif text-2xl text-white">Personas que quieren aprender</h3>
                                <p className="text-white/70 text-sm leading-relaxed font-light">
                                    Clases y procesos personalizados para reconectar con el oficio y crear con las manos.
                                </p>
                            </div>
                        </div>

                        {/* Block 3 */}
                        <div className="bg-brand-charcoal/[0.4] border border-white/5 p-10 md:p-12 space-y-6 rounded-sm shadow-lg hover:border-brand-sand/20 hover:bg-brand-charcoal/[0.6] transition-all duration-500 flex flex-col justify-between min-h-[300px]">
                            <div className="space-y-4">
                                <span className="text-brand-sand/50 font-serif text-lg italic block">03</span>
                                <h3 className="font-serif text-2xl text-white">Proyectos personales</h3>
                                <p className="text-white/70 text-sm leading-relaxed font-light">
                                    Mentoría y guía para desarrollar piezas, colecciones o ideas propias dentro del taller.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ━━━━━━━━━━ 4. SECCIÓN — EL OFICIO ━━━━━━━━━━ */}
            <section className="relative py-32 md:py-48 bg-black px-6 md:px-12 overflow-hidden">
                <div className="absolute inset-0 opacity-40">
                    <img 
                        src="/Elena basos cruzados.jpeg" 
                        alt="Detalles de costura artesanal" 
                        className="w-full h-full object-cover filter grayscale contrast-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-black" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                    <span className="font-sans text-[10px] uppercase tracking-[0.5em] text-brand-sand block">FILOSOFÍA DEL ATELIER</span>
                    <h2 className="font-serif text-4xl md:text-6xl text-white leading-tight font-normal">
                        El oficio se transmite compartiendo el taller.
                    </h2>
                    <p className="text-white/80 text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-light italic">
                        “Más que enseñar costura, el espacio busca acompañar procesos creativos reales desde la práctica, la observación y la experiencia.”
                    </p>
                </div>
            </section>

            {/* ━━━━━━━━━━ 5. GALERÍA EDITORIAL ━━━━━━━━━━ */}
            <section className="py-24 md:py-36 bg-brand-charcoal px-6 md:px-12">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center">
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-brand-sand block">Miradas del Taller</span>
                        <h2 className="font-serif text-3xl md:text-5xl text-white mt-2">Galería Editorial</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <div className="overflow-hidden rounded-sm shadow-md aspect-[3/4] relative group">
                            <img src="/Estudiante.png" alt="Diseño de alta costura" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-[800ms] group-hover:scale-105" />
                        </div>
                        <div className="overflow-hidden rounded-sm shadow-md aspect-[3/4] relative group">
                            <img src="/Estudiante 2.png" alt="Elena enseñando costura" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-[800ms] group-hover:scale-105" />
                        </div>
                        <div className="overflow-hidden rounded-sm shadow-md aspect-[3/4] relative group">
                            <img src="/elena-taller.png" alt="Detalle de máquinas e hilos" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-[800ms] group-hover:scale-105" />
                        </div>
                        <div className="overflow-hidden rounded-sm shadow-md aspect-[3/4] relative group">
                            <img src="/elena-torso.jpeg" alt="Telas y fitting real" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-[800ms] group-hover:scale-105" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ━━━━━━━━━━ 6. CTA FINAL & FORMULARIO ━━━━━━━━━━ */}
            <section ref={ctaRef} className="py-24 md:py-36 bg-black px-6 md:px-12 border-t border-white/5 relative">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-start">
                    
                    {/* CTA Details */}
                    <div className="space-y-8 mt-4">
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-brand-sand block">ELENA LA COSTURERA</span>
                        <h2 className="font-serif text-5xl md:text-7xl text-white leading-tight font-normal">
                            Ven a conocer <br />
                            <span className="italic text-brand-sand">el taller</span>
                        </h2>
                        <p className="text-white/75 text-base md:text-lg max-w-md leading-relaxed font-light">
                            Conversemos sobre tu proceso creativo, tus ideas o el proyecto que quieres comenzar.
                        </p>

                        <div className="pt-6 space-y-4">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-sand/60">UBICACIÓN</p>
                            <p className="text-sm text-white/90 font-light font-serif">Vitacura, Santiago de Chile</p>
                        </div>
                    </div>

                    {/* Integrated Booking Form Card */}
                    <div className="w-full bg-[#121212]/95 border border-white/10 p-8 md:p-12 rounded-sm shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-md">
                        <div className="mb-8">
                            <h3 className="font-serif text-2xl text-white mb-2">Agendar Visita</h3>
                            <p className="text-xs text-white/60">Selecciona tu horario para que nos reunamos personalmente.</p>
                        </div>
                        <BookingForm />
                    </div>

                </div>
            </section>
        </div>
    );
}
