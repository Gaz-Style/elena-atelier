'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Hero() {
    return (
        <section className="relative h-screen bg-brand-sand overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-[url('/hero-after.jpg')] bg-cover bg-center"
                >
                    <div className="absolute inset-0 bg-black/30" />
                </div>
            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
                <div className="max-w-4xl">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="font-sans text-xs md:text-sm uppercase tracking-[0.3em] text-white/80 mb-6 block"
                    >
                        Vitacura, Chile
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="font-serif text-5xl md:text-8xl text-white mb-8 leading-tight"
                    >
                        El Verdadero Lujo es <br /> <span className="italic">el Calce Perfecto</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="font-sans text-base md:text-xl text-white/90 max-w-3xl mx-auto mb-12 px-4"
                    >
                        Arreglos de alta calidad y sastreria profesional. Transformamos tus prendas con precisión para que luzcas impecable todos los días.
                    </motion.p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 px-4">
                        <button className="bg-white text-brand-charcoal px-10 py-4 rounded-sm font-sans text-sm uppercase tracking-widest hover:bg-brand-terracotta hover:text-white transition-all w-full md:w-auto">
                            Reservar Restauración
                        </button>
                        <button className="border border-white text-white px-10 py-4 rounded-sm font-sans text-sm uppercase tracking-widest hover:bg-white hover:text-brand-charcoal transition-all w-full md:w-auto">
                            Ver Colección
                        </button>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/60">
                <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent" />
            </div>
        </section>
    );
}
