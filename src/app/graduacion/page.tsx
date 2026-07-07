import { Metadata } from 'next';
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
        images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200'],
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
            <div className="pt-24 pb-8">
                <div className="text-center px-6 mb-4">
                    <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-brand-sand block mb-3 animate-fade-in">Temporada de Gala 2026</span>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold uppercase tracking-tight text-white mb-4">
                        Vestidos de Graduación <br className="hidden md:block" />
                        <span className="italic text-brand-sand lowercase">y fiesta a medida</span>
                    </h1>
                </div>
            </div>

            {/* Replicamos el Catálogo inmersivo que ya tiene el CTA de Agendar integrado */}
            <PortfolioClient data={categoryData} generalImages={generalImages} hideFilters={true} forceCategory="fiesta" />

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
