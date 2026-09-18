"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2 } from 'lucide-react';

const reviews = [
    {
        avatar: "/avatar_maria.png",
        title: "María F.",
        role: "AJUSTE VESTIDO DE GALA",
        text: "Elena tiene unas manos mágicas. Le confié mi vestido de diseñador para un entalle a medida y la precisión del ajuste fue excepcional. Nadie notó la intervención.",
        altSEO: "Testimonio de clienta sobre ajuste de vestido de gala alta costura en Elena Atelier"
    },
    {
        avatar: "/avatar_hombre_pantalon.png",
        title: "Roberto M.",
        role: "BASTA Y ENTALLE DE PANTALÓN",
        text: "Impresionante la precisión. Me hicieron la basta y entallaron mi pantalón de traje conservando la caída original a la perfección. 100% recomendados.",
        altSEO: "Reseña de servicio de sastrería masculina, basta y entalle de pantalón de traje a medida"
    },
    {
        avatar: "/avatar_camila.png",
        title: "Camila V.",
        role: "BASTA ORIGINAL JEANS",
        text: "El servicio de retiro a domicilio es súper cómodo. La basta original de mis jeans de marca quedó idéntica a la de fábrica, valió totalmente la pena.",
        altSEO: "Opinión de reparación de ropa a domicilio, basta original para jeans premium"
    },
    {
        avatar: "/avatar_novia.png",
        title: "Sofía T.",
        role: "AJUSTE VESTIDO DE NOVIA",
        text: "El ajuste de mi vestido de novia fue perfecto. Elena entendió de inmediato lo que necesitaba y me dio muchísima tranquilidad en todo el proceso. Un trabajo hermoso.",
        altSEO: "Testimonio de novia feliz con el entalle a medida de su vestido de novia"
    },
    {
        avatar: "/avatar_isabel.png",
        title: "Isabel S.",
        role: "ENTALLE DE BLAZER",
        text: "Llevaba meses buscando quién achicara las mangas de mi blazer desde el hombro sin arruinarlo. Quedó como hecho a medida, excelente nivel de sastrería.",
        altSEO: "Reseña de clienta sobre entalle de blazer y sastrería femenina de alta gama"
    },
    {
        avatar: "/avatar_hombre_pluma.png",
        title: "Diego C.",
        role: "CAMBIO CIERRE CHAQUETA DE PLUMAS",
        text: "Llevé mi chaqueta de plumas porque se rompió el cierre. Lo cambiaron por uno nuevo impecable y no perdió nada de relleno. Quedó como nueva.",
        altSEO: "Testimonio de cambio de cierre en chaqueta de plumas y reparación de ropa técnica de invierno"
    }
];

export default function AnimatedTestimonials() {
    const [currentReview, setCurrentReview] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentReview((prev) => (prev + 1) % reviews.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-12 bg-[#0d0d0d] relative z-10 border-b border-white/5">
            <div className="max-w-3xl mx-auto px-6 text-center">
                <span className="text-[10px] text-[#C17F5F] uppercase tracking-widest font-bold mb-3 block">Ellas ya confían en nuestro atelier</span>
                <h2 className="font-serif text-2xl md:text-3xl text-white mb-8">Experiencias <span className="italic text-[#E29D7A]">Premium</span></h2>
                
                <div className="bg-[#121212] p-6 md:p-8 rounded-sm border border-white/5 relative overflow-hidden min-h-[160px] flex items-center shadow-lg mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentReview}
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full text-center sm:text-left"
                        >
                            {/* Avatar Circular (Con Imagen) */}
                            <div className="relative shrink-0">
                                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#C17F5F]/80 to-transparent mx-auto sm:mx-0">
                                    <div className="w-full h-full bg-[#1a1a1a] rounded-full border-2 border-[#0d0d0d] flex items-center justify-center overflow-hidden">
                                        <Image 
                                            src={reviews[currentReview].avatar} 
                                            alt={reviews[currentReview].altSEO} 
                                            title={`Elena Atelier - ${reviews[currentReview].title} (${reviews[currentReview].role})`}
                                            itemProp="image"
                                            width={64} 
                                            height={64} 
                                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
                                        />
                                    </div>
                                </div>
                                {/* Verified Badge */}
                                <div className="absolute top-0 right-0 w-5 h-5 rounded-full bg-[#C17F5F] flex items-center justify-center shadow-[0_0_10px_rgba(193,127,95,0.4)] z-10">
                                    <CheckCircle2 className="w-3 h-3 text-white stroke-[3px]" />
                                </div>
                            </div>
                            
                            {/* Contenido del Testimonio */}
                            <div className="flex-1 w-full">
                                <div className="flex justify-center sm:justify-start text-[#C17F5F] gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 fill-current" />)}
                                </div>
                                <p className="font-serif text-base md:text-lg text-white/90 italic leading-relaxed mb-4">
                                    &quot;{reviews[currentReview].text}&quot;
                                </p>
                                <div>
                                    <p className="font-bold text-white text-sm tracking-wide">{reviews[currentReview].title}</p>
                                    <p className="text-[9px] text-[#C17F5F] font-bold uppercase tracking-widest mt-1">
                                        {reviews[currentReview].role}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
