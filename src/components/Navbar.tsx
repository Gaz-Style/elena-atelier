'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    if (pathname.startsWith('/admin')) return null;

    const navLinks = [
        { href: '/restauracion', label: 'Restauración' },
        { href: '/sastreria', label: 'Sastrería' },
        { href: '/portafolio', label: 'Portafolio' },
        { href: '/b2b', label: 'B2B' },
    ];

    return (
        <>
            <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex flex-col items-stretch justify-center w-max mx-auto md:mx-0">
                        <div className="flex justify-between w-full font-serif text-2xl md:text-3xl font-black uppercase text-white leading-none drop-shadow-sm">
                            <span>E</span><span>L</span><span>E</span><span>N</span><span>A</span>
                        </div>
                        <div 
                            className="font-sans text-[0.65rem] md:text-[0.75rem] font-bold uppercase text-white/70 mt-1 text-center"
                            style={{ letterSpacing: '0.35em', marginRight: '-0.35em' }}
                        >
                            La Costurera
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest font-sans text-white/80">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="hover:text-brand-terracotta transition-colors">
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/appointment" className="border border-white/50 text-white px-6 py-3 rounded-sm hover:bg-brand-terracotta hover:border-brand-terracotta transition-all">
                            Habla con Elena
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-white z-50"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 left-0 w-full bg-black/80 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-6 shadow-xl z-40"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="text-lg uppercase tracking-widest text-white hover:text-brand-terracotta transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/appointment"
                            onClick={() => setIsOpen(false)}
                            className="border border-white/50 text-white px-10 py-4 rounded-sm hover:bg-brand-terracotta hover:border-brand-terracotta transition-all uppercase tracking-widest text-sm text-center"
                        >
                            Habla con Elena
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
