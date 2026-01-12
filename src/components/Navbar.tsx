'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { href: '/restauracion', label: 'Restauración' },
        { href: '/sastreria', label: 'Sastrería' },
        { href: '/b2b', label: 'B2B' },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-brand-sand">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="font-serif text-2xl tracking-tight text-brand-charcoal">
                    ELENA ATELIER
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-12 text-sm uppercase tracking-widest font-sans text-text-secondary">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="hover:text-brand-terracotta transition-colors">
                            {link.label}
                        </Link>
                    ))}
                    <Link href="/appointment" className="bg-brand-charcoal text-white px-6 py-3 rounded-sm hover:bg-brand-terracotta transition-all">
                        Agendar Cita
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden flex flex-col gap-1.5 z-50 p-2"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    <div className={`w-6 h-0.5 bg-brand-charcoal transition-transform ${isOpen ? 'rotate-45 translate-y-[8px]' : ''}`} />
                    <div className={`w-6 h-0.5 bg-brand-charcoal transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
                    <div className={`w-6 h-0.5 bg-brand-charcoal transition-transform ${isOpen ? '-rotate-45 -translate-y-[8px]' : ''}`} />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center space-y-8 md:hidden"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="font-serif text-3xl text-brand-charcoal hover:text-brand-terracotta transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/appointment"
                            onClick={() => setIsOpen(false)}
                            className="bg-brand-charcoal text-white px-10 py-4 rounded-sm hover:bg-brand-terracotta transition-all uppercase tracking-widest text-sm"
                        >
                            Agendar Cita
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
