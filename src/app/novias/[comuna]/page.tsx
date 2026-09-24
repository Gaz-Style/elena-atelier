import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import Navbar from '@/components/Navbar';
import BackLink from '@/components/BackLink';
import Link from 'next/link';
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
        title: `Vestidos de Novia & Alta Costura en ${comuna} | ELENA`,
        description: `Diseño de vestidos de novia a medida, alta costura y upcycling nupcial en ${comuna}. Experiencia exclusiva de atelier. Agenda tu cita de diseño.`,
        openGraph: {
            title: `Vestidos de Novia & Alta Costura en ${comuna} | ELENA`,
            description: `Diseño exclusivo de vestidos de novia a medida con atención y pruebas en ${comuna}.`,
        },
    };
}

export default async function BridalCommunePage({ params }: Props) {
    const resolvedParams = await params;
    const comuna = formatTitle(resolvedParams.comuna);
    
    // Helper recursivo para obtener todos los archivos de media dentro de subcarpetas (ej: novias/civil, novias/iglesia)
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
    
    const whatsappMessage = encodeURIComponent(
        `Hola Elena, estoy en la sección de vestidos de novia de ${comuna} y me gustaría cotizar / agendar una cita para diseñar mi vestido de novia a medida.`
    );
    const whatsappUrl = `https://wa.me/56937667709?text=${whatsappMessage}`;

    return (
        <div className="min-h-screen bg-brand-charcoal text-white font-sans selection:bg-[#cda45e] selection:text-black">
            <Navbar />
            <BackLink />
            
            {/* Título SEO & CTA superior above the fold */}
            <div className="pt-28 pb-6 px-6 max-w-4xl mx-auto text-center space-y-6">
                <span className="text-[10px] uppercase tracking-[0.45em] font-semibold text-brand-sand block">Colección Nupcial 2026-2027</span>
                <h1 className="font-serif text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white">
                    Vestidos de Novia en {comuna}
                </h1>
                <p className="text-white/70 text-xs sm:text-sm font-light max-w-xl mx-auto leading-relaxed">
                    Diseño a medida, moldería anatómica y pruebas presenciales en nuestro Atelier de Vitacura para novias de {comuna}.
                </p>

                {/* BOTONES DE LLAMADO A LA ACCIÓN VISIBLES ARRIBA DEL PLIEGUE */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-brand-sand text-black font-sans font-bold text-xs uppercase tracking-[0.2em] rounded-[1px] hover:bg-white transition-all shadow-lg text-center cursor-pointer"
                    >
                        Diseñar con Elena 💬
                    </a>
                    <Link
                        href="/agenda"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 border border-white/20 text-white font-sans font-semibold text-xs uppercase tracking-[0.2em] rounded-[1px] hover:bg-white/10 transition-all text-center"
                    >
                        Agendar Cita Presencial
                    </Link>
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
