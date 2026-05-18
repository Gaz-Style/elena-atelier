'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function WhatsAppButton() {
    const pathname = usePathname();
    const phoneNumber = '56937667709';
    const message = 'Hola, me gustaría agendar una cita o hacer una consulta.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        if (pathname.startsWith('/admin')) return;

        let scrollTimeout: NodeJS.Timeout;

        const handleScroll = () => {
            // Ocultar el botón al hacer scroll
            setIsScrolling(true);
            
            clearTimeout(scrollTimeout);
            
            // Mostrar el botón de nuevo 400ms después de que se detenga el scroll
            scrollTimeout = setTimeout(() => {
                setIsScrolling(false);
            }, 400);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [pathname]);

    if (pathname.startsWith('/admin')) return null;

    return (
        <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={
                isScrolling 
                    ? { opacity: 0, scale: 0.8, y: 30 } 
                    : { opacity: 1, scale: 1, y: 0 }
            }
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full group ${isScrolling ? 'pointer-events-none' : ''}`}
            style={{
                background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 30%, rgba(26, 26, 26, 0.6) 70%, rgba(10, 10, 10, 0.9) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: 'inset 0px -4px 10px rgba(0, 0, 0, 0.5), inset 0px 3px 8px rgba(255, 255, 255, 0.08), 0px 12px 32px rgba(0, 0, 0, 0.45)',
                border: '0.5px solid rgba(255, 255, 255, 0.06)'
            }}
            aria-label="Contactar por WhatsApp"
        >
            {/* Ícono sólido oficial de WhatsApp en blanco, con sombra paralela */}
            <svg 
                viewBox="0 0 24 24" 
                width="28" 
                height="28" 
                fill="currentColor" 
                className="text-[#f5f2eb]/35 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:text-[#f5f2eb]/75 transition-all duration-300"
            >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>

            {/* Tooltip appearance on hover */}
            <span 
                className="absolute right-full mr-4 px-4 py-2.5 text-[#f5f2eb] text-xs font-serif rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.08) 0%, rgba(26, 26, 26, 0.85) 100%)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0px 2px 4px rgba(255, 255, 255, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.4)',
                    border: '0.5px solid rgba(255, 255, 255, 0.08)',
                    letterSpacing: '0.15em'
                }}
            >
                ¿En qué podemos ayudarte?
            </span>

            {/* Pulsación sand muy tenue y lenta */}
            <span className="absolute inset-0 rounded-full bg-white/10 animate-ping pointer-events-none" style={{ animationDuration: '4s' }} />
        </motion.a>
    );
}
