import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-brand-sand">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="font-serif text-2xl tracking-tight text-brand-charcoal">
                    ELENA ATELIER
                </Link>

                <div className="hidden md:flex items-center space-x-12 text-sm uppercase tracking-widest font-sans text-text-secondary">
                    <Link href="/restoration" className="hover:text-brand-terracotta transition-colors">Restauración</Link>
                    <Link href="/tailoring" className="hover:text-brand-terracotta transition-colors">Sastrería</Link>
                    <Link href="/b2b" className="hover:text-brand-terracotta transition-colors">B2B</Link>
                    <Link href="/appointment" className="bg-brand-charcoal text-white px-6 py-3 rounded-sm hover:bg-brand-terracotta transition-all">
                        Agendar Cita
                    </Link>
                </div>
            </div>
        </nav>
    );
}
