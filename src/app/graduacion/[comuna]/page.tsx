import Link from 'next/link';
import React from 'react';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import PortfolioClient from '@/app/portafolio/PortfolioClient';

function formatTitle(slug: string) {
    if (slug === 'lo-barnechea') return 'Lo Barnechea';
    if (slug === 'las-condes') return 'Las Condes';
    if (slug === 'chicureo') return 'Colina / Chicureo';
    if (slug === 'la-reina') return 'La Reina';
    if (slug === 'nunoa') return 'Ñuñoa';
    if (slug === 'maipu') return 'Maipú';
    if (slug === 'la-florida') return 'La Florida';
    if (slug === 'penalolen') return 'Peñalolén';
    if (slug === 'san-miguel') return 'San Miguel';
    if (slug === 'huechuraba') return 'Huechuraba';
    return slug.charAt(0).toUpperCase() + slug.slice(1);
}

    const communesList = [
        { name: 'Vitacura', slug: 'vitacura' },
        { name: 'Las Condes', slug: 'las-condes' },
        { name: 'Lo Barnechea', slug: 'lo-barnechea' },
        { name: 'Providencia', slug: 'providencia' },
        { name: 'La Reina', slug: 'la-reina' },
        { name: 'Ñuñoa', slug: 'nunoa' },
        { name: 'Colina / Chicureo', slug: 'chicureo' },
    ];

type Props = {
    params: Promise<{
        comuna: string;
    }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;


    const comuna = formatTitle(resolvedParams.comuna);
    
    return {
        title: `Vestidos de Graduación y Fiesta en ${comuna} | Elena La Costurera`,
        description: `Catálogo de vestidos de graduación y fiesta confeccionados a medida para clientas de ${comuna}. Agenda tu cita en nuestro Atelier.`,
        openGraph: {
            title: `Vestidos de Graduación y Fiesta en ${comuna}`,
            description: `Descubre nuestra colección de vestidos exclusivos y hechos a medida. Atención especial para ${comuna}.`,
        },
    };
}

export default async function GraduationCommunePage({ params }: Props) {
    const resolvedParams = await params;
    const comuna = formatTitle(resolvedParams.comuna);
    
    // Helper recursivo para obtener todos los archivos de media dentro de subcarpetas
    const getAllImagesInDir = (dirPath: string, relativePrefix: string): string[] => {
        let results: string[] = [];
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                const relPath = `${relativePrefix}/${entry.name}`;
                if (entry.isDirectory()) {
                    results = results.concat(getAllImagesInDir(fullPath, relPath));
                } else if (entry.isFile() && entry.name.match(/\.(jpg|jpeg|png|gif|webp|mp4)$/i)) {
                    results.push(relPath);
                }
            }
        } catch (e) {
            console.error("Error scanning subfolder", e);
        }
        return results;
    };

    // Fetch images recursively
    const baseDirectory = path.join(process.cwd(), 'public', 'trabajos');
    let generalImages: string[] = [];
    try {
        const files = fs.readdirSync(baseDirectory, { withFileTypes: true });
        generalImages = files
            .filter(dirent => dirent.isFile() && dirent.name.match(/\.(jpg|jpeg|png|gif|webp|mp4)$/i))
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
            const catImages = getAllImagesInDir(catPath, `/trabajos/${dir.name}`);
                
            if (catImages.length > 0) {
                categoryData.push({
                    category: dir.name.toLowerCase(),
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
            <div className="pt-20 pb-4">
                <div className="text-center px-6 mb-4">
                    <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-brand-sand block mb-2">Colección Exclusiva</span>
                    <h1 className="font-serif text-3xl md:text-5xl font-bold uppercase tracking-tight text-white mb-2">
                        Vestidos de Graduación en {comuna}
                    </h1>
                    <div className="hidden md:block space-y-4 pt-2">
                        {['Vitacura', 'Las Condes', 'Lo Barnechea', 'Providencia', 'La Reina', 'Ñuñoa'].includes(comuna) ? (
                            <p className="text-white/70 text-xs sm:text-sm font-light max-w-xl mx-auto leading-relaxed">
                                Diseño exclusivo y pruebas presenciales en nuestro Atelier de Vitacura para clientas de {comuna}.
                            </p>
                        ) : (
                            <p className="text-white/70 text-xs sm:text-sm font-light max-w-xl mx-auto leading-relaxed">
                                El vestido de tus sueños merece el viaje. Recibimos frecuentemente a clientas de {comuna} en nuestro Atelier de Vitacura, garantizando un calce perfecto, exclusividad total y una experiencia de Alta Costura.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Replicamos el Catálogo inmersivo */}
            <PortfolioClient data={categoryData} generalImages={generalImages} hideFilters={true} forceCategory="fiesta" />

            
            {/* SECCIÓN DE OTRAS COMUNAS (ESTÉTICA MINIMALISTA) */}
            <section className="max-w-5xl mx-auto px-6 py-16 relative z-10 border-t border-white/10 mt-10">
                <div className="text-center mb-8">
                    <span className="text-[10px] text-brand-sand uppercase tracking-[0.3em] font-semibold">
                        Disponibilidad Geográfica
                    </span>
                    <h2 className="font-serif text-2xl text-white mt-2">Áreas de Atención de Fiesta</h2>
                </div>
                
                <ul className="flex flex-wrap justify-center items-center gap-4 max-w-4xl mx-auto">
                    {communesList.map((c, i) => (
                        <li key={c.slug} className="flex items-center">
                            <Link 
                                href={`/graduacion/${c.slug}`}
                                className={`text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${
                                    c.name === comuna 
                                        ? 'text-brand-sand font-bold' 
                                        : 'text-white/40 hover:text-white'
                                }`}
                            >
                                {c.name}
                            </Link>
                            {i < communesList.length - 1 && (
                                <span className="text-white/10 text-[10px] select-none ml-4">/</span>
                            )}
                        </li>
                    ))}
                </ul>
            </section>


            {/* Schema Markup Local */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        "name": `Vestidos de Graduación en ${comuna}`,
                        "brand": {
                            "@type": "Brand",
                            "name": "Elena La Costurera"
                        },
                        "category": "Apparel",
                        "description": `Vestidos exclusivos de gala y graduación confeccionados a medida, con atención a ${comuna}.`
                    })
                }}
            />
        </div>
    );
}
