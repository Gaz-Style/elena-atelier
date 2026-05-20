'use client';

import React, { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '@/components/Navbar';
import BackLink from '@/components/BackLink';
import BookingForm from '@/components/BookingForm';

export default function AppointmentPage() {
    const [mounted, setMounted] = React.useState(false);
    const experienceRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    const { scrollY } = useScroll();
    
    // Scale and translate parallax for the background videos
    const scaleVideo = useTransform(scrollY, [0, 1000], [1, 1.08]);
    const yVideo = useTransform(scrollY, [0, 1000], [0, 40]);

    // Scroll-linked parallax for the editorial gallery background image (in color)
    // Runs smoothly as the user scrolls past the Hero section
    const scaleBgImage = useTransform(scrollY, [600, 2500], [1.08, 1.25]);
    const yBgImage = useTransform(scrollY, [600, 2500], [-60, 60]);

    // Opacity transforms:
    // Video 1 (clase 2) fades out past the Hero section
    const opacityClase2 = useTransform(scrollY, [300, 700], [1, 0]);
    
    // Fixed Runway Image (Desfile in Color) fades in as Video 1 fades out
    // and stays solid to the end, completely replacing the second video.
    const opacityDesfile = useTransform(scrollY, [300, 700], [0, 1]);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const scrollToSection = (elementRef: React.RefObject<HTMLDivElement | null>) => {
        elementRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!mounted) {
        return <div className="min-h-screen bg-brand-charcoal text-white" />;
    }

    return (
        <div className="min-h-screen bg-transparent text-white font-sans relative selection:bg-brand-sand selection:text-brand-charcoal overflow-x-hidden">
            {/* Pure Black Base Layer to prevent body gray color leaks */}
            <div className="fixed inset-0 -z-30 bg-black" />

            <Navbar />
            
            {/* Back Link with scroll logic */}
            <BackLink />

            {/* Fixed Parallax Background Video 1 (Clase 2 - Hero) */}
            <motion.div 
                style={{ opacity: opacityClase2 }}
                className="fixed inset-0 -z-10 overflow-hidden bg-black"
            >
                <motion.div 
                    style={{ scale: scaleVideo, y: yVideo }}
                    className="absolute inset-0 w-full h-full"
                >
                    <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover object-[65%_center] md:object-center brightness-[0.70] contrast-[1.05] saturate-[0.85]"
                    >
                        <source src="/clase 2.mp4" type="video/mp4" />
                    </video>
                </motion.div>
                {/* Clean Pure Black Parallax Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
            </motion.div>



            {/* Fixed Parallax Background Image 3 (Desfile Runway - Section 5 Editorial Gallery) */}
            <motion.div 
                style={{ opacity: opacityDesfile }}
                className="fixed inset-0 -z-15 overflow-hidden bg-black"
            >
                <motion.div 
                    style={{ scale: scaleBgImage, y: yBgImage }}
                    className="absolute inset-0 w-full h-full"
                >
                    <img 
                        src="/galeria editorial/Gemini_Generated_Image_pzpt3lpzpt3lpzpt.png" 
                        alt="Fondo Desfile de Alta Costura" 
                        className="w-full h-full object-cover object-center filter brightness-[0.65] contrast-[1.02]" 
                    />
                </motion.div>
                {/* Clean Pure Black Parallax Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </motion.div>

            {/* ━━━━━━━━━━ 1. HERO CINEMATOGRÁFICO ━━━━━━━━━━ */}
            <section className="relative h-[95vh] -mt-20 flex flex-col justify-center pt-24 pb-12 px-6 md:px-12 overflow-hidden bg-transparent">
                <div className="relative z-10 max-w-4xl mx-auto w-full text-center flex flex-col items-center space-y-6">
                    <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.5em] text-brand-sand/90 font-medium animate-fade-in">
                        APRENDER HACIENDO
                    </span>
                    <h1 className="font-serif text-4xl md:text-7xl leading-tight text-white tracking-tight">
                        No todo se aprende <br />
                        en una <span className="italic font-light text-brand-sand">sala de clases.</span>
                    </h1>
                    <p className="text-sm md:text-lg text-white/80 max-w-xl leading-relaxed font-light font-sans tracking-wide">
                        El taller es un espacio vivo. Aquí las ideas se prueban, las prendas se corrigen y el oficio se transmite desde la práctica real.
                    </p>
                    <div className="pt-16 md:pt-24">
                        <button 
                            onClick={() => scrollToSection(ctaRef)}
                            className="glass-btn group relative inline-flex items-center justify-center gap-3 px-8 py-4 md:px-12 md:py-5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] rounded-[1px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
                        >
                            <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms]">
                                Agendar con Elena
                                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-[600ms] group-hover:translate-x-1" />
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ━━━━━━━━━━ 2. SECCIÓN — EL TALLER COMO EXPERIENCIA ━━━━━━━━━━ */}
            <section ref={experienceRef} className="relative z-10 py-24 md:py-36 bg-black px-6 md:px-12 border-t border-transparent">
                <div className="max-w-5xl mx-auto space-y-16">
                    <div className="text-center">
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-brand-sand block">El Taller</span>
                    </div>

                    {/* Editorial Photo Grid / Collage */}
                    <div className="grid grid-cols-12 gap-4 md:gap-6 relative">
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
            <section className="relative py-24 md:py-36 bg-transparent px-6 md:px-12 border-t border-b border-white/5 overflow-hidden">
                <div className="relative z-10 max-w-6xl mx-auto space-y-10 md:space-y-16">
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
                <div className="absolute inset-0 opacity-50">
                    <img 
                        src="/elena-brazos-cruzados.png" 
                        alt="Elena Rojas con brazos cruzados en el taller" 
                        className="w-full h-full object-cover object-center filter contrast-[1.05] brightness-[0.75]"
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
            <section className="py-24 md:py-36 bg-transparent px-6 md:px-12 relative z-10">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center">
                        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-brand-sand block">Miradas del Taller</span>
                        <h2 className="font-serif text-3xl md:text-5xl text-white mt-2">Galería Editorial</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:gap-8 items-start max-w-5xl mx-auto">
                        {/* Columna Izquierda */}
                        <div className="flex flex-col gap-4 md:gap-8">
                            {/* Imagen 1 - Dominante (Muy Alta) */}
                            <div className="aspect-[3/4.5] relative group rounded-sm overflow-hidden bg-brand-sand/10 border border-white/5 shadow-sm hover:shadow-xl transition-all duration-500">
                                <img 
                                    src="/galeria editorial/rubia .jpeg" 
                                    alt="Galería Editorial 1" 
                                    className="w-full h-full object-cover object-[55%_15%] filter grayscale hover:grayscale-0 transition-all duration-[1200ms] group-hover:scale-[1.03]" 
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity duration-500" />
                            </div>
                            
                            {/* Imagen 3 - Apaisada Horizontal */}
                            <div className="aspect-[4/3] relative group rounded-sm overflow-hidden bg-brand-sand/10 border border-white/5 shadow-sm hover:shadow-xl transition-all duration-500">
                                <img 
                                    src="/galeria editorial/Gemini_Generated_Image_pcpo3lpcpo3lpcpo.png" 
                                    alt="Galería Editorial 3" 
                                    className="w-full h-full object-cover object-center filter grayscale hover:grayscale-0 transition-all duration-[1200ms] group-hover:scale-[1.03]" 
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity duration-500" />
                            </div>
                        </div>

                        {/* Columna Derecha */}
                        <div className="flex flex-col gap-4 md:gap-8">
                            {/* Imagen 2 - Cuadrada (Animada estilo Video Ken Burns) */}
                            <div className="aspect-[1/1] relative group rounded-sm overflow-hidden bg-brand-sand/10 border border-white/5 shadow-sm hover:shadow-xl transition-all duration-500">
                                <motion.img 
                                    src="/galeria editorial/Gemini_Generated_Image_pzpt3lpzpt3lpzpt.png" 
                                    alt="Galería Editorial 2 - Desfile de Alta Costura" 
                                    className="w-full h-full object-cover object-center filter grayscale hover:grayscale-0 transition-all duration-[1200ms]" 
                                    animate={{
                                        scale: [1.02, 1.09, 1.04, 1.11, 1.02],
                                        x: [0, 5, -5, 3, 0],
                                        y: [0, -4, 4, -2, 0]
                                    }}
                                    transition={{
                                        duration: 24,
                                        ease: "easeInOut",
                                        repeat: Infinity,
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity duration-500" />
                            </div>

                            {/* Imagen 4 - Mediana Alta */}
                            <div className="aspect-[3/4] relative group rounded-sm overflow-hidden bg-brand-sand/10 border border-white/5 shadow-sm hover:shadow-xl transition-all duration-500">
                                <img 
                                    src="/galeria editorial/Gemini_Generated_Image_yfng1tyfng1tyfng.png" 
                                    alt="Galería Editorial 4" 
                                    className="w-full h-full object-cover object-[60%_center] filter grayscale hover:grayscale-0 transition-all duration-[1200ms] group-hover:scale-[1.03]" 
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity duration-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ━━━━━━━━━━ 6. CTA FINAL & FORMULARIO ━━━━━━━━━━ */}
            <section ref={ctaRef} className="pt-24 pb-12 md:py-36 bg-black px-6 md:px-12 border-t border-white/5 relative">
                {/* Mobile Title block (Only visible on mobile) */}
                <div className="block md:hidden space-y-6 mb-10 max-w-xl mx-auto">
                    <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-brand-sand block">ELENA LA COSTURERA</span>
                    <h2 className="font-serif text-4xl text-white leading-tight font-normal">
                        Ven a conocer <br />
                        <span className="italic text-brand-sand">el taller</span>
                    </h2>
                    <p className="text-white/75 text-sm leading-relaxed font-light">
                        Conversemos sobre tu proceso creativo, tus ideas o el proyecto que quieres comenzar.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 md:gap-24 items-start">
                    
                    {/* CTA Details */}
                    <div className="space-y-8 mt-0 md:mt-4 order-2 md:order-1">
                        {/* Title block (Desktop only) */}
                        <div className="hidden md:block space-y-8">
                            <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-brand-sand block">ELENA LA COSTURERA</span>
                            <h2 className="font-serif text-5xl md:text-7xl text-white leading-tight font-normal">
                                Ven a conocer <br />
                                <span className="italic text-brand-sand">el taller</span>
                            </h2>
                            <p className="text-white/75 text-base md:text-lg max-w-md leading-relaxed font-light">
                                Conversemos sobre tu proceso creativo, tus ideas o el proyecto que quieres comenzar.
                            </p>
                        </div>

                        {/* Ubicación block (Visible on mobile below the form, and on desktop below the title) */}
                        <div className="pt-0 space-y-2 md:pt-6 w-full text-center md:text-left">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-sand/60 text-center md:text-left">UBICACIÓN</p>
                            <a 
                                href="https://maps.google.com/?q=Av.+Tabancura+1091,+Oficina+319,+Vitacura,+Santiago" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm text-white/90 hover:text-brand-terracotta transition-colors duration-300 font-light font-serif text-center md:text-left inline-flex items-center gap-1.5 justify-center md:justify-start group"
                            >
                                <span>Av. Tabancura 1091, Of. 319</span>
                                <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:text-brand-terracotta transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                            <p className="text-xs text-white/60 font-light text-center md:text-left">Vitacura, Santiago de Chile</p>
                        </div>
                    </div>

                    {/* Integrated Booking Form Card */}
                    <div className="w-full order-1 md:order-2">
                        <BookingForm />
                    </div>

                </div>
            </section>
        </div>
    );
}
