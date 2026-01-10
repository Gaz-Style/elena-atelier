'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const opacityBefore = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
    const opacityAfter = useTransform(scrollYProgress, [0.4, 0.8], [0, 1]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

    return (
        <section ref={containerRef} className="relative h-[200vh] bg-brand-sand">
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center px-6">

                <div className="absolute inset-0 z-0">
                    <motion.div
                        style={{ opacity: opacityBefore, scale }}
                        className="absolute inset-0 bg-[url('/hero-before.jpg')] bg-cover bg-center grayscale brightness-75"
                    >
                        <div className="absolute inset-0 bg-black/20" />
                    </motion.div>

                    <motion.div
                        style={{ opacity: opacityAfter, scale }}
                        className="absolute inset-0 bg-[url('/hero-after.jpg')] bg-cover bg-center"
                    >
                        <div className="absolute inset-0 bg-black/10" />
                    </motion.div>
                </div>

                <div className="relative z-10 text-center max-w-4xl">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="font-sans text-sm uppercase tracking-[0.3em] text-white/80 mb-6 block"
                    >
                        Vitacura, Chile
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="font-serif text-6xl md:text-8xl text-white mb-8 leading-tight"
                    >
                        El Verdadero Lujo es <br /> <span className="italic">el Calce Perfecto</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="font-sans text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12"
                    >
                        No solo reparamos prendas, elevamos inversiones. Restauración de Prendas y Sastrería Tecnológica para transformar su guardarropa en Vitacura.
                    </motion.p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <button className="bg-white text-brand-charcoal px-10 py-4 rounded-sm font-sans text-sm uppercase tracking-widest hover:bg-brand-terracotta hover:text-white transition-all w-full md:w-auto">
                            Reservar Restauración
                        </button>
                        <button className="border border-white text-white px-10 py-4 rounded-sm font-sans text-sm uppercase tracking-widest hover:bg-white hover:text-brand-charcoal transition-all w-full md:w-auto">
                            Ver Colección
                        </button>
                    </div>
                </div>

                <motion.div
                    style={{ opacity: opacityBefore }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/60"
                >
                    <span className="text-[10px] uppercase tracking-widest mb-2">Desliza para ver la transformación</span>
                    <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent" />
                </motion.div>
            </div>
        </section>
    );
}
