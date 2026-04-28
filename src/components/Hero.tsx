'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative h-screen">
            <div className="fixed inset-0 -z-10 bg-brand-charcoal">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/Elena%20cociendo.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pt-20">
                <div className="max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="font-serif text-5xl md:text-6xl lg:text-8xl font-bold text-white mb-6 leading-tight uppercase tracking-tight"
                    >
                        Diseño <br /> A Medida
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="font-sans text-lg md:text-2xl font-medium uppercase tracking-[0.2em] text-white/90 max-w-3xl mx-auto mb-12 px-4"
                    >
                        El Oficio de la Costurera
                    </motion.p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 px-4">
                        <Link
                            href="/appointment"
                            className="w-full md:w-auto border border-white/50 text-white px-6 py-4 md:px-10 md:py-4 rounded-sm font-sans text-xs md:text-sm uppercase tracking-widest hover:bg-brand-terracotta hover:border-brand-terracotta transition-all text-center"
                        >
                            Habla con Elena
                        </Link>
                        <Link
                            href="/sastreria"
                            className="w-full md:w-auto border border-white text-white px-6 py-4 md:px-10 md:py-4 rounded-sm font-sans text-xs md:text-sm uppercase tracking-widest hover:bg-white hover:text-brand-charcoal transition-all text-center"
                        >
                            Confección a Medida
                        </Link>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/60 z-10">
                <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent" />
            </div>
        </section>
    );
}
