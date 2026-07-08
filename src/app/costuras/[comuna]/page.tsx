import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, Clock, Truck, ShieldCheck, Scissors, Star } from 'lucide-react';

function formatTitle(slug: string) {
    if (slug === 'el-huinganal') return 'El Huinganal';
    if (slug === 'la-dehesa') return 'La Dehesa';
    if (slug === 'los-trapenses') return 'Los Trapenses';
    if (slug === 'las-condes') return 'Las Condes';
    if (slug === 'lo-barnechea') return 'Lo Barnechea';
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
    const description = `Recupera el calce original de tus prendas en ${comuna} sin moverte de tu casa. Expertos en trajes, vestidos de fiesta y reparaciones técnicas complejas.`;

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

function getWhatsAppUrl(comunaFormatted: string) {
    const phone = "56937667709";
    const text = `Hola. Tengo una prenda que necesita arreglo y estoy en el sector de ${comunaFormatted}. ¿Puedo enviarles una foto rápida para saber si se puede reparar y cuánto costaría?`;
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export default async function CosturasComunaPage({ params }: Props) {
    const resolvedParams = await params;
    const comuna = formatTitle(resolvedParams.comuna);

    const communes = [
        { name: 'Vitacura', slug: 'vitacura' },
        { name: 'Las Condes', slug: 'las-condes' },
        { name: 'Lo Barnechea', slug: 'lo-barnechea' },
        { name: 'La Dehesa', slug: 'la-dehesa' },
        { name: 'Los Trapenses', slug: 'los-trapenses' },
        { name: 'El Huinganal', slug: 'el-huinganal' }
    ];

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans relative overflow-hidden pb-20">
            {/* Fondos Decorativos Premium */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#C17F5F] mix-blend-screen filter blur-[150px] opacity-[0.05] animate-pulse"></div>
            <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#C17F5F] mix-blend-screen filter blur-[120px] opacity-[0.05]"></div>

            {/* HERO SECTION */}
            <header className="max-w-3xl mx-auto px-6 pt-32 pb-16 text-center space-y-6 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C17F5F]/15 text-[#C17F5F] text-[9px] uppercase tracking-wider font-bold rounded-sm">
                    <MapPin className="w-3.5 h-3.5" /> Servicio y retiro a domicilio en {comuna}
                </div>
                <div className="space-y-3">
                    <h1 className="font-serif text-4xl md:text-5xl text-white tracking-tight leading-tight font-extrabold">
                        Arreglos de Ropa y Sastrería a Domicilio en {comuna}
                    </h1>
                    <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light">
                        Recupera el calce original de tus prendas en {comuna} sin moverte de tu casa. Expertos en trajes, vestidos de fiesta y reparaciones técnicas complejas.
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 pt-2">
                    <Link 
                        href={getWhatsAppUrl(comuna)} 
                        target="_blank" 
                        className="w-full sm:w-auto bg-[#C17F5F] hover:bg-[#b05c4b] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2"
                    >
                        Agendar Retiro por WhatsApp <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="text-[10px] uppercase tracking-wider text-white/40 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#C17F5F]" /> Entregas promedio en 7 días
                    </span>
                </div>
            </header>

            {/* SECCIÓN VISUAL: ARREGLOS Y REPARACIONES FRECUENTES */}
            <section className="max-w-4xl mx-auto px-6 py-12 relative z-10 border-t border-white/5">
                <div className="text-center mb-10 space-y-2">
                    <h2 className="font-serif text-2xl text-white">Servicios en el Taller</h2>
                    <p className="text-xs text-white/50 uppercase tracking-widest">Problemas frecuentes que solucionamos a domicilio en {comuna}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Caso 1: Jeans Rotos / Remiendos */}
                    <div className="border border-white/5 rounded-sm bg-[#121212] overflow-hidden group">
                        <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                            <img 
                                src="/patched_jeans_repair.png" 
                                alt="Reparación de roturas en pantalones y jeans" 
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-3 left-3 bg-[#C17F5F]/20 text-[#C17F5F] text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-sm">
                                Jeans & Pantalones
                            </div>
                        </div>
                        <div className="p-5 space-y-2">
                            <h3 className="font-serif text-lg text-white">Reparación de Jeans</h3>
                            <p className="text-xs text-white/60 leading-relaxed font-light">
                                Parches y costuras de refuerzo en zonas gastadas o rotas.
                            </p>
                        </div>
                    </div>

                    {/* Caso 2: Cierres de Parkas / Chaquetas */}
                    <div className="border border-white/5 rounded-sm bg-[#121212] overflow-hidden group">
                        <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                            <img 
                                src="/zipper_repair_macro.png" 
                                alt="Reemplazo de cierre en parkas y chaquetas" 
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-3 left-3 bg-[#C17F5F]/20 text-[#C17F5F] text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-sm">
                                Cierres & Parkas
                            </div>
                        </div>
                        <div className="p-5 space-y-2">
                            <h3 className="font-serif text-lg text-white">Cambio de Cierres</h3>
                            <p className="text-xs text-white/60 leading-relaxed font-light">
                                Reemplazo de cierres en parkas, chaquetas y pantalones.
                            </p>
                        </div>
                    </div>

                    {/* Caso 3: Ajustes / Medidas */}
                    <div className="border border-white/5 rounded-sm bg-[#121212] overflow-hidden group">
                        <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                            <img 
                                src="/dress_measuring_tape.png" 
                                alt="Ajuste de talla y entalle de prendas" 
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-3 left-3 bg-[#C17F5F]/20 text-[#C17F5F] text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-sm">
                                Entalle & Ajuste
                            </div>
                        </div>
                        <div className="p-5 space-y-2">
                            <h3 className="font-serif text-lg text-white">Ajuste de Cintura y Entalle</h3>
                            <p className="text-xs text-white/60 leading-relaxed font-light">
                                Ajustamos el calce en trajes, faldas y vestidos en {comuna}.
                            </p>
                        </div>
                    </div>

                    {/* Caso 4: Basta original / Marcado */}
                    <div className="border border-white/5 rounded-sm bg-[#121212] overflow-hidden group">
                        <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                            <img 
                                src="/tailoring_chalk_mark.png" 
                                alt="Modificación de bastas de pantalones" 
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-3 left-3 bg-[#C17F5F]/20 text-[#C17F5F] text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-sm">
                                Bastas & Dobladillos
                            </div>
                        </div>
                        <div className="p-5 space-y-2">
                            <h3 className="font-serif text-lg text-white">Bastas y Dobladillos</h3>
                            <p className="text-xs text-white/60 leading-relaxed font-light">
                                Acortamos el largo en pantalones y jeans.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TABLA DE PRECIOS BASE (Tema Oscuro por Comuna) */}
            <section className="max-w-3xl mx-auto px-6 py-12 relative z-10 border-t border-white/5">
                <div className="text-center mb-8">
                    <h2 className="font-serif text-lg text-white/60 uppercase tracking-wider">Valores Base Referenciales en {comuna}</h2>
                </div>

                <div className="overflow-x-auto border border-white/5 rounded-sm bg-[#1c1c1c]/50">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-[#C17F5F] uppercase tracking-wider font-bold">
                                <th className="p-4 font-semibold">Servicio Específico</th>
                                <th className="p-4 font-semibold text-right">Valor Base</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-white/80">
                            <tr className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4">Basta original de pantalón o jeans</td>
                                <td className="p-4 text-right font-bold text-[#C17F5F] font-serif text-sm">Desde $6.500</td>
                            </tr>
                            <tr className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4">Cambio de cierre (pantalón o falda)</td>
                                <td className="p-4 text-right font-bold text-[#C17F5F] font-serif text-sm">Desde $8.000 a $12.000</td>
                            </tr>
                            <tr className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4">Entalle o ajuste anatómico de cintura</td>
                                <td className="p-4 text-right font-bold text-[#C17F5F] font-serif text-sm">Desde $15.000</td>
                            </tr>
                            <tr className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4">Cambio de cierre en chaqueta técnica / parka</td>
                                <td className="p-4 text-right font-bold text-[#C17F5F] font-serif text-sm">Desde $18.000 a $35.000</td>
                            </tr>
                            <tr className="bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 font-semibold">Retiro y entrega a domicilio (Logística)</td>
                                <td className="p-4 text-right font-bold text-[#C17F5F] font-serif text-sm">$10.000</td>
                            </tr>
                            <tr className="bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 font-semibold">Visita a domicilio para toma de medidas</td>
                                <td className="p-4 text-right font-bold text-[#C17F5F] font-serif text-sm">$20.000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* TRES GARANTÍAS OBLIGATORIAS (Tema Oscuro) */}
            <section className="max-w-4xl mx-auto px-6 py-12 relative z-10 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3 p-6 border border-white/5 rounded-sm bg-[#1c1c1c]/30">
                        <div className="flex items-center gap-2">
                            <Truck className="w-5 h-5 text-[#C17F5F]" />
                            <h3 className="font-serif text-base text-white">Retiro & Medidas a Domicilio</h3>
                        </div>
                        <p className="text-xs text-white/60 font-light leading-relaxed">
                            No pierdas tiempo en el tráfico. Vamos a tu puerta en {comuna} para retirar tus prendas o tomarte las medidas de forma cómoda.
                        </p>
                    </div>

                    <div className="space-y-3 p-6 border border-white/5 rounded-sm bg-[#1c1c1c]/30">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#C17F5F]" />
                            <h3 className="font-serif text-base text-white">Calidad Premium Garantizada</h3>
                        </div>
                        <p className="text-xs text-white/60 font-light leading-relaxed">
                            Tratamos prendas finas, trajes de sastre y ropa técnica con maquinaria de precisión especializada para mantener acabados y costuras idénticas a las de fábrica.
                        </p>
                    </div>

                    <div className="space-y-3 p-6 border border-white/5 rounded-sm bg-[#1c1c1c]/30">
                        <div className="flex items-center gap-2">
                            <Scissors className="w-5 h-5 text-[#C17F5F]" />
                            <h3 className="font-serif text-base text-white">Precios y Tiempos Claros</h3>
                        </div>
                        <p className="text-xs text-white/60 font-light leading-relaxed">
                            Sin presupuestos ocultos. Sabrás exactamente cuánto cuesta y cuándo estará listo antes de que toquemos la tela.
                        </p>
                    </div>
                </div>
            </section>

            {/* TESTIMONIOS (Tema Oscuro) */}
            <section className="max-w-4xl mx-auto px-6 py-12 relative z-10 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#121212] p-5 border border-white/5 text-center space-y-1">
                        <div className="flex text-[#C17F5F] gap-0.5 justify-center mb-2">
                            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 fill-current" />)}
                        </div>
                        <p className="text-xs text-white/80 font-light italic">"Salvaron mi vestido a 2 días del evento en {comuna}. Excelente trabajo."</p>
                        <p className="text-[9px] text-[#C17F5F] font-bold">María — {comuna}</p>
                    </div>
                    <div className="bg-[#121212] p-5 border border-white/5 text-center space-y-1">
                        <div className="flex text-[#C17F5F] gap-0.5 justify-center mb-2">
                            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 fill-current" />)}
                        </div>
                        <p className="text-xs text-white/80 font-light italic">"Basta original idéntica en mis jeans y entrega a tiempo."</p>
                        <p className="text-[9px] text-[#C17F5F] font-bold">Andrés — {comuna}</p>
                    </div>
                    <div className="bg-[#121212] p-5 border border-white/5 text-center space-y-1">
                        <div className="flex text-[#C17F5F] gap-0.5 justify-center mb-2">
                            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 fill-current" />)}
                        </div>
                        <p className="text-xs text-white/80 font-light italic">"El servicio de retiro a domicilio en {comuna} funciona impecable."</p>
                        <p className="text-[9px] text-[#C17F5F] font-bold">Camila — {comuna}</p>
                    </div>
                </div>
            </section>

            {/* CTAs DIRECTOS (Tema Oscuro) */}
            <section className="max-w-4xl mx-auto px-6 py-12 relative z-10 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CTA A */}
                    <div className="bg-[#121212]/50 p-6 border border-white/5 rounded-sm flex flex-col justify-between text-center space-y-4">
                        <p className="text-xs text-white/70 font-light leading-relaxed">No pierdas tiempo en el tráfico. Retiramos en tu casa en {comuna}.</p>
                        <Link 
                            href={getWhatsAppUrl(comuna)}
                            target="_blank"
                            className="py-3 bg-[#C17F5F] hover:bg-[#b05c4b] text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm block"
                        >
                            Agendar Retiro por WhatsApp
                        </Link>
                    </div>

                    {/* CTA B */}
                    <div className="bg-[#121212]/50 p-6 border border-white/5 rounded-sm flex flex-col justify-between text-center space-y-4">
                        <p className="text-xs text-white/70 font-light leading-relaxed">¿Quieres cotizar tu arreglo enviándonos fotos rápidas?</p>
                        <Link 
                            href={getWhatsAppUrl(comuna)}
                            target="_blank"
                            className="py-3 bg-transparent border border-[#C17F5F] hover:bg-[#C17F5F] text-[#C17F5F] hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm block"
                        >
                            Cotizar Arreglo con una Foto
                        </Link>
                    </div>

                    {/* CTA C */}
                    <div className="bg-[#121212]/50 p-6 border border-white/5 rounded-sm flex flex-col justify-between text-center space-y-4">
                        <p className="text-xs text-white/70 font-light leading-relaxed">¿Quieres validar plazos de entrega especiales en {comuna}?</p>
                        <Link 
                            href={getWhatsAppUrl(comuna)}
                            target="_blank"
                            className="py-3 bg-transparent border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm block"
                        >
                            Consultar Factibilidad
                        </Link>
                    </div>
                </div>
            </section>

            {/* SECCIÓN DE OTRAS COMUNAS */}
            <section className="max-w-4xl mx-auto px-6 py-8 relative z-10 bg-[#242424]/40 border border-white/5 p-6 rounded-sm mt-12">
                <div className="text-center mb-6">
                    <p className="text-xs text-white/50 uppercase tracking-widest">También retiramos en otros sectores aledaños</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {communes.filter(c => c.name !== comuna).map((commune) => (
                        <Link 
                            key={commune.slug}
                            href={`/costuras/${commune.slug}`}
                            className="py-3 border border-white/5 hover:border-[#C17F5F]/40 hover:bg-[#242424]/60 text-center rounded-sm transition-all duration-300 group flex items-center justify-center gap-1.5 text-xs text-white/80"
                        >
                            <MapPin className="w-3.5 h-3.5 text-[#C17F5F]" />
                            {commune.name}
                        </Link>
                    ))}
                </div>
            </section>

            {/* JSON-LD Schema local dinámico para la comuna como LocalBusiness */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "LocalBusiness",
                        "name": `Taller de Costura y Arreglos de Ropa en ${comuna}`,
                        "provider": {
                            "@type": "LocalBusiness",
                            "name": "ELENA - Alta Costura & Sastrería",
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": "Av. Tabancura 1091, Oficina 319",
                                "addressLocality": "Vitacura",
                                "addressRegion": "Santiago",
                                "addressCountry": "CL"
                            },
                            "telephone": "+56937667709"
                        },
                        "description": `Taller de costura especializado en arreglos de ropa rápidos, hacer bastas, cambiar cierres y achicar prendas en la comuna de ${comuna}.`,
                        "areaServed": {
                            "@type": "City",
                            "name": comuna
                        },
                        "hasOfferCatalog": {
                            "@type": "OfferCatalog",
                            "name": `Servicios de Arreglos de Ropa en ${comuna}`,
                            "itemListElement": [
                                {
                                    "@type": "OfferCatalog",
                                    "name": "Arreglos Rápidos",
                                    "itemListElement": [
                                        {
                                            "@type": "Offer",
                                            "itemOffered": {
                                                "@type": "Service",
                                                "name": "Hacer Basta de Pantalones",
                                                "serviceType": "Clothing Alteration"
                                            }
                                        }
                                    ]
                                },
                                {
                                    "@type": "OfferCatalog",
                                    "name": "Reparaciones",
                                    "itemListElement": [
                                        {
                                            "@type": "Offer",
                                            "itemOffered": {
                                                "@type": "Service",
                                                "name": "Cambio de Cierres",
                                                "serviceType": "Clothing Repair"
                                            }
                                        }
                                    ]
                                },
                                {
                                    "@type": "OfferCatalog",
                                    "name": "Arreglos Mayores",
                                    "itemListElement": [
                                        {
                                            "@type": "Offer",
                                            "itemOffered": {
                                                "@type": "Service",
                                                "name": "Achicar Trajes y Vestidos",
                                                "serviceType": "Clothing Alteration"
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    })
                }}
            />
        </div>
    );
}
