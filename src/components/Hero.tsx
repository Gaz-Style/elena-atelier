'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { trackGAEvent } from '@/components/GoogleAnalytics';

export default function Hero() {
    const { scrollY } = useScroll();
    
    // Al deslizar, la opacidad de la capa Blanco y Negro pasa de 0 (transparente) a 1 (100% B&N)
    const bwOpacity = useTransform(scrollY, [0, 350], [0, 1]);
    const scaleImg = useTransform(scrollY, [0, 600], [1, 1.06]);
    const yImg = useTransform(scrollY, [0, 600], [0, 36]);

    // Parallax y desvanecimiento para el contenedor del texto
    const yText = useTransform(scrollY, [0, 500], [0, 120]);
    const opacityText = useTransform(scrollY, [0, 400], [1, 0]);

    const handleWhatsAppClick = () => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'generate_lead', {
                event_category: 'WhatsApp',
                event_label: 'Conversación Directa Hero',
                value: 1
            });
        }
        trackGAEvent('Contact', 'WhatsApp', 'Boton Directo Hero');
    };

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

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 px-4 mt-12 md:mt-14">
                        {/* Botón Primario: Conversión Directa de Lujo a WhatsApp */}
                        <a
                            href={`https://wa.me/56937667709?text=${encodeURIComponent('Hola Elena, me gustaría consultar por un diseño de vestido y conversar sobre mi idea.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleWhatsAppClick}
                            className="glass-btn group relative w-full sm:w-auto px-10 py-[18px] border-[0.5px] border-white/26 border-t-white/48 border-l-white/48 border-b-white/15 border-r-white/15 text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/92 hover:border-[#f5f2eb] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] whitespace-nowrap cursor-pointer inline-flex items-center justify-center gap-2.5"
                        >
                            <span className="glass-text relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
                                HABLA CON ELENA
                                <svg className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity duration-300" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </span>
                        </a>

                        {/* Botón Secundario: Inspiración / Branding */}
                        <Link
                            href="/portafolio"
                            className="text-white/60 hover:text-white font-sans text-[11px] uppercase tracking-[0.25em] font-medium py-3 px-6 transition-all duration-300 flex items-center gap-2 group hover:underline underline-offset-4"
                        >
                            <span>Ver Colección</span>
                            <svg className="w-3 h-3 stroke-white/60 group-hover:stroke-white transition-all transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
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

