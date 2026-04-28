'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
    const phoneNumber = '56937667709';
    const message = 'Hola, me gustaría agendar una cita o hacer una consulta.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-2xl transition-shadow duration-300 group"
            aria-label="Contactar por WhatsApp"
        >
            <MessageCircle size={32} fill="currentColor" className="group-hover:animate-pulse" />

            {/* Tooltip appearance on hover */}
            <span className="absolute right-full mr-4 px-4 py-2 bg-white text-brand-charcoal text-sm font-medium rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-brand-sand">
                ¿En qué podemos ayudarte?
            </span>

            {/* Subtle ring animation */}
            <span className="absolute inset-0 rounded-full border-4 border-[#25D366] opacity-50 animate-ping pointer-events-none" />
        </motion.a>
    );
}
