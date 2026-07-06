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

type Props = {
    params: Promise<{
        comuna: string;
    }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const comuna = formatTitle(resolvedParams.comuna);
    
    return {
        title: `Vestidos de Novia a Medida en ${comuna} | Elena La Costurera`,
        description: `Catálogo de vestidos de novia confeccionados a medida y upcycling nupcial para clientas de ${comuna}. Agenda tu cita de diseño.`,
        openGraph: {
            title: `Vestidos de Novia a Medida en ${comuna}`,
            description: `Descubre nuestra colección de vestidos de novia exclusivos. Atención especial para ${comuna}.`,
        },
    };
}

export default async function BridalCommunePage({ params }: Props) {
    const resolvedParams = await params;
    const comuna = formatTitle(resolvedParams.comuna);
    
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
                // If this is the novias page, we might want to only pass the 'novias' category,
                // but the PortfolioClient handles all categories, so we pass everything and 
                // the user can select. Or we can just pass everything.
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
            
            {/* Título SEO */}
            <div className="pt-20 pb-4">
                <div className="text-center px-6 mb-4">
                    <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-brand-sand block mb-2">Colección Nupcial</span>
                    <h1 className="font-serif text-3xl md:text-5xl font-bold uppercase tracking-tight text-white mb-2">
                        Vestidos de Novia en {comuna}
                    </h1>
                </div>
            </div>

            {/* Replicamos el Catálogo inmersivo */}
            <PortfolioClient data={categoryData} generalImages={generalImages} hideFilters={true} forceCategory="novias" />

            {/* Schema Markup Local */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        "name": `Vestidos de Novia en ${comuna}`,
                        "brand": {
                            "@type": "Brand",
                            "name": "Elena La Costurera"
                        },
                        "category": "Apparel",
                        "description": `Vestidos exclusivos de novia confeccionados a medida, con atención a ${comuna}.`
                    })
                }}
            />
        </div>
    );
}
