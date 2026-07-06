import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, Star, Scissors, Heart, Award } from 'lucide-react';

function formatTitle(slug: string) {
    if (slug === 'lo-barnechea') return 'Lo Barnechea';
    if (slug === 'las-condes') return 'Las Condes';
    if (slug === 'chicureo') return 'Colina / Chicureo';
    return slug.charAt(0).toUpperCase() + slug.slice(1);
}

type Props = {
    params: {
        comuna: string;
    };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const comuna = formatTitle(params.comuna);
    const title = `Vestidos de Novia a Medida en ${comuna} | Elena La Costurera`;
    const description = `Diseño, confección a medida y upcycling de vestidos de novia en ${comuna}. Experiencia de alta costura artesanal. Agenda tu cita en Elena La Costurera.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: ['/og-image.jpg'],
        },
    };
}

export default function BridalCommunePage({ params }: Props) {
    const comuna = formatTitle(params.comuna);
    
    // Pre-filled WhatsApp message for bridal query
    const whatsappUrl = `https://wa.me/56930510626?text=Hola%20Elena%20La%20Costurera,%20me%20gustar%C3%ADa%20agendar%20una%20cita%20de%20dise%C3%B1o%20y%20confecci%C3%B3n%20a%20medida%20para%20mi%20vestido%20de%20novia.%20Vivo%20en%20${encodeURIComponent(comuna)}.`;

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans selection:bg-[#cda45e] selection:text-black pt-16">
            {/* Header Section */}
            <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#cda45e]/10 text-[#cda45e] text-xs uppercase tracking-widest font-bold rounded-sm border border-[#cda45e]/20">
                    <MapPin className="w-3.5 h-3.5" /> Asesoría exclusiva para {comuna}
                </div>
                <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
                    Vestidos de Novia a Medida
                </h1>
                <p className="font-serif italic text-lg md:text-xl text-[#f5f2eb]/70 max-w-2xl mx-auto">
                    Alta costura nupcial y upcycling de vestidos familiares en {comuna}
                </p>
                <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                    Creemos que cada novia merece un diseño irrepetible. Confeccionamos tu vestido desde cero en base a tus medidas exactas y tus gustos de diseño, o rediseñamos el vestido de novia de tu madre para adaptarlo a tu estilo actual.
                </p>
                
                <div className="pt-8 flex justify-center">
                    <Link 
                        href={whatsappUrl} 
                        target="_blank" 
                        className="bg-[#cda45e] text-black hover:bg-[#b08b49] px-8 py-4 font-bold uppercase tracking-widest text-xs transition-all duration-300 flex items-center gap-2 shadow-[0_4px_20px_rgba(205,164,94,0.15)]"
                    >
                        Agendar Cita en el Showroom <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Custom Tailoring & Upcycling Details */}
            <div className="bg-[#121212] border-y border-white/5 py-24">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <Scissors className="w-8 h-8 text-[#cda45e]" />
                        <h3 className="font-serif text-xl">Diseño Singular</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Trazamos tu molde sobre papel para tu cuerpo específico. Cada pinza, pliegue y drapeado se prueba sobre tu silueta en nuestro taller.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <Heart className="w-8 h-8 text-[#cda45e]" />
                        <h3 className="font-serif text-xl">Upcycling Emocional</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Restauramos y modernizamos vestidos antiguos. Una alternativa sostenible que pone en valor la tradición textil familiar.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <Award className="w-8 h-8 text-[#cda45e]" />
                        <h3 className="font-serif text-xl">Oficio Manual</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                            Trabajamos con telas finas (sedas, encajes bordados, crepés pesados) tratadas con la máxima pulcritud por costureras de amplia trayectoria.
                        </p>
                    </div>
                </div>
            </div>

            {/* Local Client Testimonial */}
            <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-8">
                <p className="font-serif text-xl md:text-2xl italic text-[#f5f2eb]/80 leading-relaxed">
                    "Ver transformado el vestido de novia de mi madre en un diseño tan moderno y cómodo fue emocionante. El calce final fue impecable."
                </p>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex text-[#cda45e] gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Novia de {comuna}</p>
                </div>
            </div>

            {/* Schema Markup for Local SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "name": `Vestidos de Novia a Medida en ${comuna}`,
                        "provider": {
                            "@type": "LocalBusiness",
                            "name": "Elena La Costurera",
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": "Vitacura",
                                "addressRegion": "Región Metropolitana",
                                "addressCountry": "CL"
                            }
                        },
                        "areaServed": {
                            "@type": "City",
                            "name": comuna
                        },
                        "description": `Servicios de alta costura nupcial y rediseño de vestidos de novia a medida en la comuna de ${comuna}.`
                    })
                }}
            />
        </div>
    );
}
