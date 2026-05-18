'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
    const { scrollY } = useScroll();
    
    // Al deslizar, la opacidad de la capa Blanco y Negro pasa de 0 (transparente) a 1 (100% B&N)
    const bwOpacity = useTransform(scrollY, [0, 350], [0, 1]);
    const scaleImg = useTransform(scrollY, [0, 600], [1, 1.06]);
    const yImg = useTransform(scrollY, [0, 600], [0, 36]);

    // Parallax y desvanecimiento para el contenedor del texto
    const yText = useTransform(scrollY, [0, 500], [0, 120]);
    const opacityText = useTransform(scrollY, [0, 400], [1, 0]);

    return (
        <section className="relative h-screen overflow-hidden">
            <div className="fixed inset-0 -z-10 bg-brand-charcoal">
                {/* 1. Capa de Fondo: Imagen Tratada Color (100% Opacidad, nítida y expuesta) */}
                <motion.img
                    style={{ scale: scaleImg, y: yImg }}
                    src="/trabajos/model_desnuda_color.png"
                    alt="ELENA LA COSTURERA - Somos tu piel (Color)"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* 2. Capa Superior: Imagen Tratada Blanco y Negro (Aparece lentamente al hacer scroll) */}
                <motion.img
                    style={{ opacity: bwOpacity, scale: scaleImg, y: yImg }}
                    src="/trabajos/model_desnuda_bw.png"
                    alt="ELENA LA COSTURERA - Somos tu piel (B&W)"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* Un viñeteado mínimo y sutil en los bordes para mantener la elegancia de la foto */}
                <div className="absolute inset-0 bg-black/15" />
                {/* Capa de contraste central sutil tras el texto */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.48)_0%,rgba(0,0,0,0)_75%)]" />
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes stitchSlide {
                    to { stroke-dashoffset: -20; }
                }
                .stitch-btn:hover .stitch-rect {
                    animation: stitchSlide 1.2s linear infinite;
                    stroke: #c27a65 !important;
                }
                .stitch-btn:hover .stitch-text {
                    color: #c27a65 !important;
                }
                .glass-btn {
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }
                .glass-btn:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.35), 0 0 32px 0 rgba(245, 242, 235, 0.22) !important;
                }
                .glass-text {
                    font-family: var(--font-heading), serif !important;
                    color: #f5f2eb !important;
                    font-size: 0.68rem !important;
                    font-weight: 600 !important;
                    letter-spacing: 0.32em !important;
                    text-shadow: 0 1px 2.5px rgba(0, 0, 0, 0.9);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }
                .glass-arrow {
                    stroke: #f5f2eb;
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }
                .glass-btn:hover .glass-text {
                    text-shadow: none !important;
                    color: #121212 !important;
                    letter-spacing: 0.32em !important;
                }
                .glass-btn:hover .glass-arrow {
                    stroke: #121212;
                    transform: translateX(4px) !important;
                }
            `}} />

            <motion.div 
                style={{ y: yText, opacity: opacityText }}
                className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pt-20 -translate-y-[6.5vh] md:-translate-y-[10.5vh]"
            >
                {/* Texto y botón enmarcados juntos en una sola composición editorial */}
                <div className="max-w-[90vw] md:max-w-xl mx-auto border-[0.5px] border-white/[0.05] px-6 py-10 md:px-12 md:py-12 backdrop-blur-[2.5px] bg-black/[0.08] rounded-[1px] shadow-[0_8px_32px_0_rgba(0,0,0,0.25)]">
                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        className="font-serif text-3xl md:text-5xl lg:text-[3.25rem] font-bold text-white mb-6 leading-tight uppercase tracking-tight"
                    >
                        No diseñamos, <br />
                        somos parte <br />
                        de tu piel
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                        className="font-sans text-xs md:text-sm font-medium uppercase tracking-[0.45em] text-white/90 max-w-3xl mx-auto mb-0 px-4"
                    >
                        Diseño & Alta Costura
                    </motion.p>
 
                    <div className="flex justify-center px-4 mt-12 md:mt-14">
                        <Link
                            href="https://walink.co/5cm5kh"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass-btn group relative w-auto px-12 py-[18px] border-[0.5px] border-white/26 border-t-white/48 border-l-white/48 border-b-white/15 border-r-white/15 text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/92 hover:border-[#f5f2eb] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] whitespace-nowrap"
                        >
                            <span className="glass-text relative z-10 flex items-center justify-center gap-3 whitespace-nowrap">
                                HABLA CON ELENA
                                <svg 
                                    className="w-3.5 h-3.5 glass-arrow" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    strokeWidth="1.5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </span>
                        </Link>
                    </div>
                </div>
            </motion.div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
            </div>
        </section>
    );
}

