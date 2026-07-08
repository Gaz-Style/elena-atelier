import { Metadata } from 'next';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import PortfolioClient from '@/app/portafolio/PortfolioClient';

export const metadata: Metadata = {
    title: 'Vestidos de Graduación 2026: Diseños Exclusivos a Medida | Elena La Costurera',
    description: 'Encuentra el vestido de graduación perfecto. Alta costura a medida, exclusividad por colegio garantizada y upcycling. Agenda tu prueba en Vitacura, Santiago.',
    keywords: 'vestidos de graduacion, vestidos de fiesta a medida, vestidos de gala santiago, exclusividad por colegio, upcycling vestidos, elena la costurera',
    openGraph: {
        title: 'Vestidos de Graduación 2026 | Alta Costura a Medida',
        description: 'Explora nuestra colección exclusiva de gala. Confección a medida con garantía de exclusividad por colegio. Agenda tu cita en nuestro Atelier.',
        images: ['https://www.elenalacosturera.cl/trabajos/fiesta/4.%20Rebecca%20Verde%20Sage.jpg'],
        locale: 'es_CL',
        type: 'website',
    }
};

export default function GraduationLandingPage() {
    // Fetch images like the Portfolio page does
    const baseDirectory = path.join(process.cwd(), 'public', 'trabajos');
    let generalImages: string[] = [];
    try {
        const files = fs.readdirSync(baseDirectory, { withFileTypes: true });
        generalImages = files
            .filter(dirent => dirent.isFile() && dirent.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
            .map(dirent => `/trabajos/${dirent.name}`);
    } catch (err) {
        console.error("Error reading base directory", err);
    }

    const categoryData: { category: string, images: string[] }[] = [];
    try {
        const subDirs = fs.readdirSync(baseDirectory, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory());
            
        for (const dir of subDirs) {
            const catPath = path.join(baseDirectory, dir.name);
            const catFiles = fs.readdirSync(catPath, { withFileTypes: true });
            const catImages = catFiles
                .filter(dirent => dirent.isFile() && dirent.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
                .map(dirent => `/trabajos/${dir.name}/${dirent.name}`);
                
            if (catImages.length > 0) {
                categoryData.push({
                    category: dir.name,
                    images: catImages
                });
            }
        }
    } catch (err) {
        console.error("Error reading subdirectories", err);
    }

    return (
        <div className="min-h-screen bg-brand-charcoal text-white font-sans selection:bg-[#cda45e] selection:text-black">
            
            {/* Título SEO. Completamente integrado pero sin ser invasivo visualmente. */}
            <div className="pt-16 md:pt-24 pb-2 md:pb-6">
                <div className="text-center px-6">
                    <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-brand-sand block mb-2 animate-fade-in">Temporada de Gala 2026</span>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold uppercase tracking-tight text-white">
                        Vestidos de Graduación <br className="hidden md:block" />
                        <span className="italic text-brand-sand lowercase">y fiesta a medida</span>
                    </h1>
                </div>
            </div>

            {/* Replicamos el Catálogo inmersivo que ya tiene el CTA de Agendar integrado */}
            <PortfolioClient data={categoryData} generalImages={generalImages} hideFilters={true} forceCategory="fiesta" />

            {/* Comunas Cobertura Section */}
            <section id="comunas" className="py-20 bg-[#121212] border-t border-white/5 relative z-10">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <div className="space-y-2">
                        <span className="text-brand-sand text-[10px] uppercase tracking-widest font-bold">Cobertura Vestidos de Gala</span>
                        <h2 className="font-serif text-3xl text-white">Vestidos por Comuna</h2>
                        <p className="text-white/60 text-xs max-w-md mx-auto leading-relaxed">
                            Aseguramos la exclusividad de tu vestido por colegio. Pruébate tu diseño a medida en nuestro taller reservando cita desde tu comuna.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                        {[
                            { name: 'Vitacura', slug: 'vitacura' },
                            { name: 'Las Condes', slug: 'las-condes' },
                            { name: 'Lo Barnechea', slug: 'lo-barnechea' },
                            { name: 'Providencia', slug: 'providencia' },
                            { name: 'La Reina', slug: 'la-reina' },
                            { name: 'Ñuñoa', slug: 'nunoa' }
                        ].map((c) => (
                            <Link 
                                key={c.slug}
                                href={`/graduacion/${c.slug}`}
                                className="p-4 border border-white/5 hover:border-brand-sand/40 hover:bg-[#0d0d0d]/60 text-center rounded-sm transition-all duration-300 group flex flex-col items-center justify-center gap-2"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-brand-sand"
                                >
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span className="text-xs font-bold uppercase tracking-wider text-white/80 group-hover:text-brand-sand transition-colors">{c.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Schema Markup Local */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": "Catálogo de Vestidos de Graduación y Fiesta",
                        "description": "Colección exclusiva de vestidos de gala, fiesta y graduación confeccionados a medida. Diseños únicos con exclusividad por colegio garantizada.",
                        "url": "https://www.elenalacosturera.cl/graduacion",
                        "provider": {
                            "@type": "LocalBusiness",
                            "name": "Elena La Costurera",
                            "image": "https://www.elenalacosturera.cl/elena-torso.jpeg",
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": "Av. Tabancura 1091, Oficina 319",
                                "addressLocality": "Vitacura",
                                "addressRegion": "Santiago",
                                "addressCountry": "CL"
                            }
                        }
                    })
                }}
            />
        </div>
    );
}
