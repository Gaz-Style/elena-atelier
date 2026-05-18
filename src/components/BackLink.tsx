'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BackLink() {
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;

        const handleScroll = () => {
            setIsScrolling(true);
            clearTimeout(scrollTimeout);
            
            // Re-appear 400ms after scrolling stops
            scrollTimeout = setTimeout(() => {
                setIsScrolling(false);
            }, 400);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={
                isScrolling 
                    ? { opacity: 0, x: -15, scale: 0.95 } 
                    : { opacity: 1, x: 0, scale: 1 }
            }
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`fixed top-[6.5rem] left-6 md:left-12 z-40 ${isScrolling ? 'pointer-events-none' : ''}`}
        >
            <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-[#f5f2eb]/50 hover:text-[#f5f2eb] transition-all duration-300 font-sans text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver al Inicio
            </Link>
        </motion.div>
    );
}
