import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Scissors, Star, MapPin, CheckCircle2 } from 'lucide-react';

// Formateadores de texto para las rutas (ej. "las-condes" -> "Las Condes")
function formatTitle(slug: string) {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

type Props = {
    params: Promise<{
        comuna: string;
        especialidad: string;
    }>;
};

// Generación Dinámica de Metaetiquetas para Programmatic SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const comuna = formatTitle(resolvedParams.comuna);
    const pedigreedSpecialty = formatTitle(resolvedParams.especialidad);

    const title = `${pedigreedSpecialty} en ${comuna} | Elena Atelier de Alta Costura`;
    const description = `Servicio exclusivo de ${pedigreedSpecialty.toLowerCase()} en ${comuna}. Elena Atelier ofrece confección a medida, terminaciones de lujo y ajuste perfecto. Agenda tu cita en nuestro taller.`;

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

export default async function ProgrammaticSeoPage({ params }: Props) {
    const resolvedParams = await params;
    const comuna = formatTitle(resolvedParams.comuna);
    const especialidad = formatTitle(resolvedParams.especialidad);

    return (
        <div className="min-h-screen bg-brand-sand/15 font-sans text-brand-charcoal pt-10">
            {/* Cabecera Hero Específica */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-terracotta/10 text-brand-terracotta text-xs uppercase tracking-widest font-bold rounded-sm">
                        <MapPin className="w-3 h-3" /> Atención Exclusiva para {comuna}
                    </div>
                    <h1 className="font-serif text-5xl md:text-6xl text-brand-charcoal leading-tight">
                        Especialistas en {especialidad}
                    </h1>
                    <p className="text-lg text-text-secondary leading-relaxed">
                        Bienvenida a Elena Atelier. Si vives en <strong>{comuna}</strong> y buscas un nivel de exigencia y pulcritud insuperable para tu <strong>{especialidad.toLowerCase()}</strong>, estás en el lugar indicado. 
                    </p>
                    <div className="pt-6">
                        <Link href="https://wa.me/56930510626?text=Hola%20Elena,%20necesito%20una%20cita%20para%20dise%C3%B1o" target="_blank" className="bg-brand-charcoal text-brand-sand hover:bg-brand-terracotta px-8 py-4 rounded-sm transition-all flex items-center gap-2 uppercase tracking-widest text-xs font-bold w-max">
                            Agendar Asesoría VIP <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Beneficios Locales */}
            <div className="bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <Scissors className="w-8 h-8 text-brand-terracotta" />
                        <h3 className="font-serif text-xl">Artesanía y Precisión</h3>
                        <p className="text-sm text-text-secondary">Aplicamos técnicas de sastrería tradicional y alta costura para que tu {especialidad.toLowerCase()} tenga un calce absolutamente perfecto.</p>
                    </div>
                    <div className="space-y-4">
                        <Star className="w-8 h-8 text-brand-terracotta" />
                        <h3 className="font-serif text-xl">Terminaciones Invisibles</h3>
                        <p className="text-sm text-text-secondary">Costuras imperceptibles y cuidado meticuloso por el tejido. El verdadero lujo se nota en los detalles internos de cada prenda.</p>
                    </div>
                    <div className="space-y-4">
                        <MapPin className="w-8 h-8 text-brand-terracotta" />
                        <h3 className="font-serif text-xl">Ubicación Estratégica</h3>
                        <p className="text-sm text-text-secondary">Para las clientas de {comuna}, nuestro atelier en Tabancura, Vitacura ofrece un ambiente privado, seguro y de fácil acceso.</p>
                    </div>
                </div>
            </div>

            {/* Testimonio Genérico VIP */}
            <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-8">
                <p className="font-serif text-2xl md:text-3xl italic text-brand-charcoal/80 leading-relaxed">
                    "La experiencia en el taller de Elena es de otro nivel. Entienden exactamente lo que necesitas y transforman la tela con una precisión que no se encuentra en cualquier lugar."
                </p>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex text-emerald-500 gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-xs uppercase tracking-widest text-text-secondary font-bold">Clienta VIP de {comuna}</p>
                </div>
            </div>

            {/* Schema SEO Inyectado Automáticamente para esta ruta */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "name": `${especialidad} en ${comuna}`,
                        "provider": {
                            "@type": "LocalBusiness",
                            "name": "ELENA La Costurera",
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
                        "description": `Servicio premium de ${especialidad.toLowerCase()} atendiendo a la comuna de ${comuna}.`
                    })
                }}
            />
        </div>
    );
}
