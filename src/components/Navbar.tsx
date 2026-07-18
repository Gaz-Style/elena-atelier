'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ArrowLeft } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    if (pathname.startsWith('/admin')) return null;

    const navLinks = [
        { href: '/portal-novias', label: 'Portal Novia' },
        { href: '/restauracion', label: 'Restauración' },
        { href: '/sastreria', label: 'Sastrería' },
        { href: '/portafolio', label: 'Portafolio' },
        { href: '/b2b', label: 'B2B' },
    ];

    const isHome = pathname === '/';

    return (
        <>
            <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
                    {/* Left Area: Back Button (History) & Brand Logo */}
                    <div className="flex items-center gap-4">
                        {!isHome && (
                            <button 
                                onClick={() => router.back()}
                                className="flex items-center justify-center p-2 -ml-2 text-white hover:text-brand-sand transition-all duration-300 z-50 group"
                                aria-label="Volver atrás"
                            >
                                <ArrowLeft className="w-6 h-6 md:w-5 md:h-5 text-white stroke-[2.5px] group-hover:scale-115 transition-transform duration-300" />
                            </button>
                        )}
                        
                        <Link href="/" className={`${!isHome ? 'hidden md:flex' : 'flex'} flex-col items-stretch justify-center w-max`}>
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
                    </div>

                    {/* Centered Logo on Mobile when Back Button is active */}
                    {!isHome && (
                        <Link href="/" className="flex md:hidden flex-col items-stretch justify-center w-max absolute left-1/2 -translate-x-1/2">
                            <div className="flex justify-between w-full font-serif text-2xl font-black uppercase text-white leading-none drop-shadow-sm gap-1">
                                <span>E</span><span>L</span><span>E</span><span>N</span><span>A</span>
                            </div>
                            <div 
                                className="font-sans text-[0.55rem] font-bold uppercase text-white/70 mt-0.5 text-center"
                                style={{ letterSpacing: '0.3em', marginRight: '-0.3em' }}
                            >
                                La Costurera
                            </div>
                        </Link>
                    )}

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.2em] font-sans text-white/80 font-semibold">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="hover:text-brand-sand transition-all duration-300">
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/registro?redirect=/portal/agenda" className="glass-btn px-6 py-2.5 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.2em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:text-[#121212] hover:border-[#f5f2eb] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] rounded-[1px] whitespace-nowrap">
                            Agenda
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
                        className="fixed top-20 left-0 w-full bg-black/90 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-6 shadow-xl z-40"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="text-sm uppercase tracking-[0.2em] font-semibold text-white hover:text-brand-sand transition-all duration-300"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/registro?redirect=/portal/agenda"
                            onClick={() => setIsOpen(false)}
                            className="glass-btn block w-full py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.2em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:text-[#121212] hover:border-[#f5f2eb] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] rounded-[1px] text-center whitespace-nowrap"
                        >
                            Agenda
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
