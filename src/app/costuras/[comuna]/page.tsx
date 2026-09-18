import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Clock, Truck, ShieldCheck, Scissors, Star, Camera, UserCheck, Shirt, Sparkles, Ruler, Layers, List } from 'lucide-react';
import BrandCarousel from '@/components/BrandCarousel';
import LocationMap from '@/components/LocationMap';
import AnimatedTestimonials from '@/components/AnimatedTestimonials';
import TrackedLink from '@/components/TrackedLink';

function formatTitle(slug: string) {
    const titles: Record<string, string> = {
        'el-huinganal': 'El Huinganal',
        'la-dehesa': 'La Dehesa',
        'los-trapenses': 'Los Trapenses',
        'el-arrayan': 'El Arrayán',
        'golf-de-manquehue': 'Golf de Manquehue',
        'cerro-dieciocho': 'Cerro Dieciocho',
        'valle-escondido': 'Valle Escondido',
        'las-condes': 'Las Condes',
        'san-carlos-de-apoquindo': 'San Carlos de Apoquindo',
        'el-golf': 'El Golf',
        'san-damian': 'San Damián',
        'estoril': 'Estoril / Tabancura',
        'los-dominicos': 'Los Dominicos',
        'lo-barnechea': 'Lo Barnechea',
        'vitacura': 'Vitacura',
        'santa-maria-de-manquehue': 'Santa María de Manquehue',
        'jardin-del-este': 'Jardín del Este',
        'lo-curro': 'Lo Curro',
        'alonso-de-cordova': 'Alonso de Córdova',
        'borde-rio': 'Borde Río / Nueva Costanera',
    };
    if (titles[slug]) return titles[slug];
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

type Props = {
    params: Promise<{
        comuna: string;
    }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolvedParams = await params;
    const comuna = formatTitle(resolvedParams.comuna);

    const title = `Arreglos de Ropa y Sastrería a Domicilio en ${comuna} | ELENA`;
    const description = `Recupera el calce original de tus prendas en ${comuna} sin moverte de tu casa. Expertos en trajes, vestidos y reparaciones técnicas con retiro a domicilio.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: ['/og-image.jpg'],
        },
        alternates: {
            canonical: `https://www.elenalacosturera.cl/costuras/${resolvedParams.comuna}`
        }
    };
}

function getWhatsAppUrl(comunaFormatted: string, servicio: string = "general") {
    const phone = "56937667709";
    const text = `Hola. Tengo una prenda que necesita arreglo (${servicio}) y estoy en el sector de ${comunaFormatted}. ¿Puedo enviarles una foto rápida para saber si se puede reparar y cuánto costaría?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function getWhatsAppPhotoUrl(comunaFormatted: string) {
    const phone = "56937667709";
    const text = `Hola Elena Atelier. Estoy en ${comunaFormatted} y les envío una foto de mi prenda para cotizar el arreglo. ¿Pueden darme un precio estimado?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export default async function CosturasComunaPage({ params }: Props) {
    const resolvedParams = await params;
    const comuna = formatTitle(resolvedParams.comuna);

    const communes = [
        { name: 'Vitacura', slug: 'vitacura' },
        { name: 'Santa María de Manquehue', slug: 'santa-maria-de-manquehue' },
        { name: 'Jardín del Este', slug: 'jardin-del-este' },
        { name: 'Lo Curro', slug: 'lo-curro' },
        { name: 'Alonso de Córdova', slug: 'alonso-de-cordova' },
        { name: 'Borde Río / Nueva Costanera', slug: 'borde-rio' },
        { name: 'Las Condes', slug: 'las-condes' },
        { name: 'San Carlos de Apoquindo', slug: 'san-carlos-de-apoquindo' },
        { name: 'El Golf', slug: 'el-golf' },
        { name: 'San Damián', slug: 'san-damian' },
        { name: 'Estoril / Tabancura', slug: 'estoril' },
        { name: 'Los Dominicos', slug: 'los-dominicos' },
        { name: 'Lo Barnechea', slug: 'lo-barnechea' },
        { name: 'La Dehesa', slug: 'la-dehesa' },
        { name: 'Los Trapenses', slug: 'los-trapenses' },
        { name: 'El Huinganal', slug: 'el-huinganal' },
        { name: 'El Arrayán', slug: 'el-arrayan' },
        { name: 'Golf de Manquehue', slug: 'golf-de-manquehue' },
        { name: 'Cerro Dieciocho', slug: 'cerro-dieciocho' },
        { name: 'Valle Escondido', slug: 'valle-escondido' },
    ];

    const serviciosPrenda = [
        {
            titulo: "Bastas & Reparaciones Denim",
            badge: "Jeans & Pantalones",
            imagen: "/Servicios%20principales/Bastas.png",
            alt: `Basta original y reparación de jeans en ${comuna}`,
            descripcion: "Basta con conservación del ruedo original de fábrica, refuerzos invisibles en entrepierna y achique de pretina en jeans.",
            precio: "Desde $8.000",
            cotizarServicio: "Jeans y Pantalones",
        },
        {
            titulo: "Cierres & Reparaciones Técnicas",
            badge: "Parkas & Chaquetas",
            imagen: "/Servicios%20principales/Cierres.png",
            alt: `Reemplazo de cierres en parkas en ${comuna}`,
            descripcion: "Cambio de cierres metálicos y plásticos YKK en parkas de pluma, cortavientos, chaquetas de cuero y abrigos pesados.",
            precio: "Desde $8.000",
            cotizarServicio: "Cierres y Parkas",
        },
        {
            titulo: "Vestidos & Calce Anatómico",
            badge: "Vestidos & Faldas",
            imagen: "/Servicios%20principales/Entalle.png",
            alt: `Ajuste de vestidos en ${comuna}`,
            descripcion: "Bastas invisibles a mano, toma de sisa, reducción de cintura, ajuste de tirantes y calce de vestidos de uso diario o fiesta.",
            precio: "Desde $12.000",
            cotizarServicio: "Vestidos y Faldas",
        },
        {
            titulo: "Sastrería & Sacos",
            badge: "Sacos, Trajes & Camisas",
            imagen: "/Servicios%20principales/Acortar%20mangas.png",
            alt: `Ajuste de sacos y trajes en ${comuna}`,
            descripcion: "Entalle de chaquetas en espalda y sisa, ajuste de largo de mangas, entalle de camisas y basta en pantalones de vestir.",
            precio: "Desde $12.000",
            cotizarServicio: "Trajes y Sacos",
        },
    ];

    // JSON-LD para SEO y motores de búsqueda LLM
    const jsonLdLocalBusiness = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": `Elena Atelier - Sastrería & Arreglos a Domicilio en ${comuna}`,
        "image": "https://www.elenalacosturera.cl/hero_seamstress_taller.png",
        "@id": `https://www.elenalacosturera.cl/costuras/${resolvedParams.comuna}#business`,
        "url": `https://www.elenalacosturera.cl/costuras/${resolvedParams.comuna}`,
        "telephone": "+56937667709",
        "priceRange": "$$",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Tabancura 1091, Oficina 319",
            "addressLocality": "Vitacura",
            "addressRegion": "Región Metropolitana",
            "postalCode": "7650020",
            "addressCountry": "CL"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": -33.3714288,
            "longitude": -70.5484838
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "10:00",
                "closes": "21:00"
            },
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": "Saturday",
                "opens": "10:00",
                "closes": "14:00"
            }
        ],
        "areaServed": {
            "@type": "AdministrativeArea",
            "name": comuna
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": `Servicios de Sastrería y Arreglos de Ropa en ${comuna}`,
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": { "@type": "Service", "name": "Bastas & Reparaciones Denim" },
                    "priceSpecification": { "@type": "UnitPriceSpecification", "price": "8000", "priceCurrency": "CLP" }
                },
                {
                    "@type": "Offer",
                    "itemOffered": { "@type": "Service", "name": "Cierres & Reparaciones Técnicas" },
                    "priceSpecification": { "@type": "UnitPriceSpecification", "price": "8000", "priceCurrency": "CLP" }
                },
                {
                    "@type": "Offer",
                    "itemOffered": { "@type": "Service", "name": "Vestidos & Calce Anatómico" },
                    "priceSpecification": { "@type": "UnitPriceSpecification", "price": "12000", "priceCurrency": "CLP" }
                },
                {
                    "@type": "Offer",
                    "itemOffered": { "@type": "Service", "name": "Sastrería & Sacos" },
                    "priceSpecification": { "@type": "UnitPriceSpecification", "price": "12000", "priceCurrency": "CLP" }
                }
            ]
        }
    };

    const jsonLdFaq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `¿Cómo funciona el servicio de arreglos de ropa a domicilio en ${comuna}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Retiramos tus prendas directamente en tu domicilio en ${comuna}. También contamos con visita de costurera para toma de medidas presencial. Realizamos los arreglos en nuestro taller central de Vitacura y te entregamos la prenda impecable con calce perfecto.`
                }
            },
            {
                "@type": "Question",
                "name": "¿Cuánto demoran en hacer un arreglo de ropa?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "El tiempo estándar de entrega es de 7 días hábiles. Para urgencias de sastrería o vestidos de fiesta se evalúa según disponibilidad de taller."
                }
            },
            {
                "@type": "Question",
                "name": `¿Cuánto cuesta el retiro a domicilio en ${comuna}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `El retiro y entrega a domicilio en ${comuna} tiene un costo de $10.000 (ida y vuelta). La visita de costurera a domicilio para toma de medidas presencial es de $10.000.`
                }
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
            />
            <div className="min-h-screen bg-[#0d0d0d] text-white font-sans relative overflow-hidden pb-20">

                {/* Fondos Decorativos Premium */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#C17F5F] mix-blend-screen filter blur-[150px] opacity-[0.05] animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#C17F5F] mix-blend-screen filter blur-[120px] opacity-[0.05]"></div>

                {/* HERO SECTION */}
                <header className="relative min-h-[75vh] flex items-center justify-center pt-28 pb-16 px-6 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <Image 
                            src="/hero_seamstress_taller.png" 
                            alt={`Taller de sastrería y arreglos de ropa en ${comuna}`} 
                            fill
                            priority
                            className="object-cover object-[65%_center] sm:object-center scale-105 filter brightness-[0.75] sm:brightness-[0.55] md:brightness-[0.45] contrast-[1.10] transition-all" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-black/30 md:via-[#0d0d0d]/60" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d]/30 via-transparent to-[#0d0d0d]/30 md:from-[#0d0d0d]/80 md:to-[#0d0d0d]/80" />
                    </div>

                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <p className="inline-flex items-center gap-2 text-xs text-[#C17F5F] uppercase tracking-widest font-bold mb-6 sm:mb-8 md:mb-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            <MapPin className="w-3.5 h-3.5" /> Servicio y retiro a domicilio en {comuna}
                        </p>
                        <div className="space-y-5">
                            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight font-extrabold max-w-3xl mx-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                                Arreglos de Ropa y Sastrería en {comuna}
                            </h1>
                            <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                                Recupera el calce perfecto de tus prendas en {comuna} sin salir de casa. Ajustes de precisión en trajes, vestidos, pantalones y abrigos con retiro directo en tu puerta.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto">
                            <TrackedLink 
                                href={getWhatsAppPhotoUrl(comuna)} 
                                target="_blank" 
                                eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Comuna_Hero_Solicitar_Servicio"
                                className="w-full sm:w-1/2 bg-[#C17F5F] hover:bg-[#b05c4b] text-white px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C17F5F]/20 hover:scale-[1.02]"
                            >
                                <Scissors className="w-4 h-4" /> Solicitar Servicio
                            </TrackedLink>
                            <TrackedLink 
                                href="/costuras/catalogo-completo" 
                                eventAction="click_catalog" eventCategory="Navigation" eventLabel="Comuna_Hero_Ver_Catalogo"
                                className="w-full sm:w-1/2 border border-[#C17F5F]/50 bg-black/40 hover:bg-[#C17F5F]/20 text-[#E29D7A] hover:text-white px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 backdrop-blur-md hover:scale-[1.02]"
                            >
                                <List className="w-4 h-4 text-[#C17F5F]" /> Ver Catálogo
                            </TrackedLink>
                        </div>
                        {/* Badges de micro-confianza */}
                        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-white/60 font-light">
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#C17F5F]" /> Entregas promedio en 7 días
                            </span>
                            <span className="flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-[#C17F5F]" /> Costurera a Domicilio en {comuna}
                            </span>
                        </div>
                    </div>
                </header>
                
                <AnimatedTestimonials />
                
                {/* ═══════════════════════════════════════════
                    COSTURERA A DOMICILIO
                ═══════════════════════════════════════════ */}
                <section className="max-w-5xl mx-auto px-6 py-12 relative z-10">
                    <div className="relative overflow-hidden border border-[#C17F5F]/30 rounded-lg bg-[#141414] shadow-2xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                            <div className="lg:col-span-5 relative min-h-[300px] sm:min-h-[360px] lg:min-h-full overflow-hidden bg-black">
                                <Image 
                                    src="/costurera_domicilio_medidas.png" 
                                    alt={`Costurera a domicilio en ${comuna} tomando medidas exactas a una persona`} 
                                    fill
                                    className="object-cover object-center opacity-90 transition-transform duration-700 hover:scale-105" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#141414]" />
                            </div>
                            <div className="lg:col-span-7 p-8 sm:p-10 md:p-12 flex flex-col justify-center space-y-6 relative">
                                <span className="text-xs text-[#C17F5F] uppercase tracking-widest font-bold">Servicio Estrella en {comuna}</span>
                                <div className="space-y-3">
                                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-bold tracking-tight leading-tight">
                                        Costurera a Domicilio: <span className="text-[#E29D7A]">Elena Va a {comuna}</span>
                                    </h2>
                                    <p className="text-sm text-white/75 font-light leading-relaxed">
                                        Nuestra costurera especialista visita tu residencia en {comuna} para tomar medidas exactas directamente en tu propia prenda. Retiramos, confeccionamos en nuestro Taller de Vitacura y te entregamos la prenda impecable en tu puerta.
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-4 bg-[#C17F5F]/10 border border-[#C17F5F]/30 px-6 py-4 rounded-sm w-full hover:bg-[#C17F5F]/20 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-[#C17F5F]/20 flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-[#C17F5F]" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-[#E29D7A] uppercase tracking-widest font-bold mb-0.5">Visita de Costurera + Retiro y Entrega de Prendas</div>
                                            <div className="text-sm sm:text-base text-white font-medium">Servicio Completo a Domicilio por <strong className="text-lg sm:text-xl text-[#C17F5F] ml-1">$9.990</strong></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <TrackedLink 
                                        href={getWhatsAppUrl(comuna)} 
                                        target="_blank" 
                                        eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Comuna_Domicilio_Solicitar"
                                        className="inline-flex items-center justify-center gap-2 bg-[#C17F5F] hover:bg-[#b05c4b] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm shadow-lg shadow-[#C17F5F]/20 hover:scale-[1.02]"
                                    >
                                        Solicitar Costurera a Domicilio en {comuna} <ArrowRight className="w-4 h-4" />
                                    </TrackedLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════
                    TARJETAS DE SERVICIOS CON IMÁGENES REALES
                ═══════════════════════════════════════════ */}
                <section className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                    <div className="text-center mb-10 flex flex-col items-center">
                        <span className="text-xs text-[#C17F5F] uppercase tracking-widest font-bold mb-4">Servicios en {comuna}</span>
                        <h2 className="font-serif text-2xl text-white">Arreglos por Tipo de Prenda</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {serviciosPrenda.map((servicio, idx) => (
                            <div key={idx} className="border border-white/5 rounded-sm bg-[#121212] overflow-hidden group hover:border-[#C17F5F]/40 transition-all duration-300">
                                <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                                    <Image 
                                        src={servicio.imagen} 
                                        alt={servicio.alt} 
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                                    />
                                    <div className="absolute top-3 left-3 bg-[#C17F5F]/20 text-[#C17F5F] text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-sm border border-[#C17F5F]/30">
                                        {servicio.badge}
                                    </div>
                                </div>
                                <div className="p-5 space-y-2">
                                    <h3 className="font-serif text-lg text-white">{servicio.titulo}</h3>
                                    <p className="text-xs text-white/60 leading-relaxed font-light">{servicio.descripcion}</p>
                                    <div className="pt-2 flex items-center justify-between text-xs text-[#C17F5F]">
                                        <span>{servicio.precio}</span>
                                        <Link 
                                            href={getWhatsAppUrl(comuna, servicio.cotizarServicio)} 
                                            target="_blank" 
                                            className="font-bold flex items-center gap-1 hover:underline"
                                        >
                                            Cotizar <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                        <TrackedLink href="/costuras/catalogo-completo" eventAction="click_catalog" eventCategory="Navigation" eventLabel="Comuna_Services_Ver_Catalogo" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#C17F5F]/40 bg-[#C17F5F]/5 hover:bg-[#C17F5F]/10 text-[#E29D7A] px-8 py-4 rounded-sm text-xs font-bold uppercase tracking-widest transition-all">
                            <List className="w-4 h-4" /> Ver Catálogo Completo
                        </TrackedLink>
                        <TrackedLink href={getWhatsAppPhotoUrl(comuna)} target="_blank" eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Comuna_Services_Cotizar_Arreglo" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C17F5F] hover:bg-[#b05c4b] text-white px-8 py-4 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#C17F5F]/20 hover:scale-[1.02]">
                            <Camera className="w-4 h-4" /> Cotizar Arreglo Ahora
                        </TrackedLink>
                    </div>
                </section>

                <BrandCarousel comuna={comuna} />

                {/* GARANTÍAS Y PROCESO */}
                <section className="max-w-4xl mx-auto px-6 py-12 relative z-10 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3 p-6 border border-white/5 rounded-sm bg-[#1c1c1c]/30">
                            <div className="flex items-center gap-2">
                                <Truck className="w-5 h-5 text-[#C17F5F]" />
                                <h3 className="font-serif text-base text-white font-bold">1. Retiro a Domicilio</h3>
                            </div>
                            <p className="text-xs text-white/60 font-light leading-relaxed">No pierdas tiempo en el tráfico. Vamos a tu puerta en {comuna}.</p>
                        </div>
                        <div className="space-y-3 p-6 border border-white/5 rounded-sm bg-[#1c1c1c]/30">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#C17F5F]" />
                                <h3 className="font-serif text-base text-white font-bold">2. Confección Premium</h3>
                            </div>
                            <p className="text-xs text-white/60 font-light leading-relaxed">Maquinaria de precisión especializada. Acabados y costuras idénticas a las de fábrica.</p>
                        </div>
                        <div className="space-y-3 p-6 border border-white/5 rounded-sm bg-[#1c1c1c]/30">
                            <div className="flex items-center gap-2">
                                <Scissors className="w-5 h-5 text-[#C17F5F]" />
                                <h3 className="font-serif text-base text-white font-bold">3. Entrega Exacta</h3>
                            </div>
                            <p className="text-xs text-white/60 font-light leading-relaxed">Recibes tu prenda con calce perfecto en tu puerta. Incluye garantía de ajuste de 15 días.</p>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="py-20 md:py-32 relative z-10 border-t border-[#C17F5F]/20 bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a] overflow-hidden">
                    {/* Decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C17F5F]/5 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <span className="text-xs text-[#C17F5F] uppercase tracking-widest font-bold mb-4 block">Hablemos de tu prenda en {comuna}</span>
                        <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">La perfección, <span className="italic text-[#E29D7A]">a un paso de distancia.</span></h2>
                        <p className="text-sm md:text-base text-white/60 font-light mb-12 max-w-xl mx-auto leading-relaxed">
                            Envíanos una foto de lo que necesitas ajustar o agenda el retiro a domicilio. Nuestro equipo de expertos evaluará tu caso de inmediato.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <TrackedLink href={getWhatsAppPhotoUrl(comuna)} target="_blank" eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Comuna_Footer_Cotizar_WhatsApp" className="w-full sm:w-auto bg-[#C17F5F] hover:bg-[#b05c4b] text-white px-10 py-5 text-xs font-bold uppercase tracking-widest transition-all rounded-sm shadow-[0_0_20px_rgba(193,127,95,0.3)] hover:shadow-[0_0_30px_rgba(193,127,95,0.5)] hover:scale-[1.02] flex items-center justify-center gap-2">
                                <Camera className="w-4 h-4" /> Cotizar por WhatsApp
                            </TrackedLink>
                            <TrackedLink href={getWhatsAppUrl(comuna)} target="_blank" eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Comuna_Footer_Agendar_Retiro" className="w-full sm:w-auto bg-transparent border border-[#C17F5F] text-[#C17F5F] hover:bg-[#C17F5F]/10 px-10 py-5 text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 hover:scale-[1.02]">
                                Agendar Retiro <Truck className="w-4 h-4" />
                            </TrackedLink>
                        </div>
                    </div>
                </section>

                {/* UBICACIÓN Y MAPA INTERACTIVO CON BOTONES INTELIGENTES */}
                <LocationMap comuna={comuna} />

                {/* SECCIÓN DE OTRAS COMUNAS */}
                <section className="max-w-4xl mx-auto px-6 py-8 relative z-10 bg-[#242424]/40 border border-white/5 p-6 rounded-sm mt-12">
                    <div className="text-center mb-6">
                        <p className="text-xs text-white/50 uppercase tracking-widest">Otras Comunas con Cobertura de Retiro</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {communes.map((c) => (
                            <Link 
                                key={c.slug}
                                href={`/costuras/${c.slug}`}
                                className={`py-3 border text-center rounded-sm transition-all duration-300 group flex items-center justify-center gap-1.5 text-xs ${
                                    c.name === comuna 
                                        ? 'border-[#C17F5F] bg-[#C17F5F]/20 text-[#C17F5F] font-bold' 
                                        : 'border-white/5 hover:border-[#C17F5F]/40 hover:bg-[#242424]/60 text-white/80'
                                }`}
                            >
                                <MapPin className="w-3.5 h-3.5 text-[#C17F5F]" />
                                {c.name}
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
