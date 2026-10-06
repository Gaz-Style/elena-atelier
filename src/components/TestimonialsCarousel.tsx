'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Review {
    name: string;
    rating: number;
    message: string;
    date: string;
}

interface TestimonialsCarouselProps {
    reviews: Review[];
}

export default function TestimonialsCarousel({ reviews }: TestimonialsCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Auto-play
    useEffect(() => {
        if (!reviews || reviews.length <= 1) return;
        const interval = setInterval(() => {
            handleNext();
        }, 6000);
        return () => clearInterval(interval);
    }, [currentIndex, reviews]);

    if (!reviews || reviews.length === 0) return null;

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const handlePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const currentReview = reviews[currentIndex];

    return (
        <div className="relative w-full max-w-4xl mx-auto px-4 md:px-12 py-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-20 text-brand-sand">
                <Quote size={80} strokeWidth={1} />
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                {/* Estrellas */}
                <div className="flex gap-1.5">
                    {[...Array(5)].map((_, i) => (
                        <Star 
                            key={i} 
                            className={`w-5 h-5 md:w-6 md:h-6 ${i < currentReview.rating ? 'fill-brand-sand text-brand-sand' : 'text-white/20'}`} 
                        />
                    ))}
                </div>

                {/* Comentario con animación de fade (simple opacity based on key) */}
                <div 
                    key={currentIndex} 
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
                >
                    <p className="text-white text-lg md:text-2xl font-serif leading-relaxed italic px-4 md:px-8">
                        "{currentReview.message}"
                    </p>
                </div>

                {/* Autora */}
                <div className="pt-4 flex flex-col items-center">
                    <span className="text-white font-semibold tracking-wider text-sm md:text-base uppercase">
                        {currentReview.name}
                    </span>
                    <span className="text-white/50 text-[10px] tracking-widest uppercase mt-1">
                        Clienta Elena La Costurera
                    </span>
                </div>
            </div>

            {/* Controles */}
            {reviews.length > 1 && (
                <>
                    <button 
                        onClick={handlePrev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition-colors"
                        aria-label="Anterior testimonio"
                    >
                        <ChevronLeft size={32} strokeWidth={1} />
                    </button>
                    <button 
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition-colors"
                        aria-label="Siguiente testimonio"
                    >
                        <ChevronRight size={32} strokeWidth={1} />
                    </button>
                    
                    {/* Indicadores */}
                    <div className="flex justify-center gap-2 mt-10">
                        {reviews.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    if (!isAnimating && i !== currentIndex) {
                                        setIsAnimating(true);
                                        setCurrentIndex(i);
                                        setTimeout(() => setIsAnimating(false), 500);
                                    }
                                }}
                                className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-brand-sand' : 'w-2 bg-white/20'}`}
                                aria-label={`Ir al testimonio ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
