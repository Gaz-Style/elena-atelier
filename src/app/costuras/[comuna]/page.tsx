import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, Clock, Truck, ShieldCheck, Scissors, Star, Camera, UserCheck } from 'lucide-react';
import BrandCarousel from '@/components/BrandCarousel';

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
    const description = `Recupera el calce original de tus prendas en ${comuna} sin moverte de tu casa. Expertos en trajes, vestidos y reparaciones técnicas con retiro a domicilio.`;

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

            {/* HERO SECTION CON FOTOGRAFÍA EDITORIAL DE LUJO EN EL FONDO */}
            <header className="relative min-h-[75vh] flex items-center justify-center pt-28 pb-16 px-6 overflow-hidden">
                {/* Imagen de Fondo de Alta Definición con Degradado Cinematic */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/hero_seamstress_taller.png"
                        alt={`Taller de sastrería y arreglos de ropa en ${comuna}`}
                        className="w-full h-full object-cover object-center scale-105 filter brightness-[0.38] contrast-[1.15]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d]/80 via-transparent to-[#0d0d0d]/80" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <p className="inline-flex items-center gap-2 text-xs text-[#C17F5F] uppercase tracking-widest font-bold mb-6 sm:mb-8 md:mb-10">
                        <MapPin className="w-3.5 h-3.5" /> Servicio y retiro a domicilio en {comuna}
                    </p>
                    <div className="space-y-5">
                        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight font-extrabold max-w-3xl mx-auto drop-shadow-md">
                            Arreglos de Ropa y Sastrería en {comuna}
                        </h1>
                        <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light drop-shadow">
                            Recupera el calce perfecto de tus prendas en {comuna} sin salir de casa. Ajustes de precisión en trajes, vestidos, pantalones y abrigos con retiro directo en tu puerta.
                        </p>
                    </div>

                    {/* DOBLE CTA WHATSAPP */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto">
                        <Link 
                            href={getWhatsAppUrl(comuna)} 
                            target="_blank" 
                            className="w-full sm:w-1/2 bg-[#C17F5F] hover:bg-[#b05c4b] text-white px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C17F5F]/20 hover:scale-[1.02]"
                        >
                            Agendar Retiro <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link 
                            href={getWhatsAppPhotoUrl(comuna)} 
                            target="_blank" 
                            className="w-full sm:w-1/2 border border-[#C17F5F]/50 bg-black/40 hover:bg-[#C17F5F]/20 text-[#E29D7A] hover:text-white px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 backdrop-blur-md hover:scale-[1.02]"
                        >
                            <Camera className="w-4 h-4 text-[#C17F5F]" /> Cotizar con Foto
                        </Link>
                    </div>

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

            {/* CARRUSEL DE MARCAS DE PRESTIGIO CON LOGOS REALES (ESTILO SOJO LUXURY) */}
            <BrandCarousel comuna={comuna} />

            {/* DESTACADO: SERVICIO COSTURERA A DOMICILIO CON ENFOQUE SEO Y DISEÑO DE LUJO */}
            <section className="max-w-5xl mx-auto px-6 py-12 relative z-10">
                <div className="relative overflow-hidden border border-[#C17F5F]/30 rounded-lg bg-[#141414] shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                        {/* FOTOGRAFÍA PROFESIONAL DE COSTURERA TOMANDO MEDIDAS */}
                        <div className="lg:col-span-5 relative min-h-[300px] sm:min-h-[360px] lg:min-h-full overflow-hidden bg-black">
                            <img
                                src="/costurera_domicilio_medidas.png"
                                alt={`Costurera a domicilio en ${comuna} tomando medidas exactas a una persona`}
                                className="w-full h-full object-cover object-center opacity-90 transition-transform duration-700 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#141414]" />
                        </div>

                        {/* DETALLES DEL SERVICIO Y CONVERSIÓN SEO EN COMUNA */}
                        <div className="lg:col-span-7 p-8 sm:p-10 md:p-12 flex flex-col justify-center space-y-6 relative">
                            <span className="text-xs text-[#C17F5F] uppercase tracking-widest font-bold">
                                Servicio Estrella en {comuna}
                            </span>

                            <div className="space-y-3">
                                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-bold tracking-tight leading-tight">
                                    Costurera a Domicilio: <span className="text-[#E29D7A]">Elena Va a {comuna}</span>
                                </h2>
                                <p className="text-sm text-white/75 font-light leading-relaxed">
                                    Nuestra costurera especialista visita tu residencia en {comuna} para tomar medidas exactas directamente en tu propia prenda. Retiramos, confeccionamos en nuestro Taller de Vitacura y te entregamos la prenda impecable en tu puerta.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#C17F5F]/15 border border-[#C17F5F]/30 flex items-center justify-center shrink-0">
                                        <Truck className="w-4 h-4 text-[#C17F5F]" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Delivery en {comuna}</div>
                                        <div className="text-xs text-white font-medium"><strong className="text-[#C17F5F]">$10.000</strong> ida y vuelta</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#C17F5F]/15 border border-[#C17F5F]/30 flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4 text-[#C17F5F]" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Visita de Costurera</div>
                                        <div className="text-xs text-white font-medium"><strong className="text-[#C17F5F]">$10.000</strong> (Toma de medidas)</div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Link
                                    href={getWhatsAppUrl(comuna)}
                                    target="_blank"
                                    className="inline-flex items-center justify-center gap-2 bg-[#C17F5F] hover:bg-[#b05c4b] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm shadow-lg shadow-[#C17F5F]/20 hover:scale-[1.02]"
                                >
                                    Agendar Costurera a Domicilio en {comuna} <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN VISUAL: ARREGLOS POR TIPO DE PRENDA */}
            <section className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <div className="text-center mb-10 space-y-2">
                    <span className="text-xs text-[#C17F5F] uppercase tracking-widest font-bold">Servicios en {comuna}</span>
                    <h2 className="font-serif text-2xl text-white">Arreglos por Tipo de Prenda</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Prenda 1: Sacos & Trajes */}
                    <div className="border border-white/5 rounded-sm bg-[#121212] overflow-hidden group hover:border-[#C17F5F]/40 transition-all duration-300">
                        <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                            <img 
                                src="/hero_tailoring.png" 
                                alt={`Ajuste de sacos y trajes en ${comuna}`} 
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-3 left-3 bg-[#C17F5F]/20 text-[#C17F5F] text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-sm border border-[#C17F5F]/30">
                                Sacos, Trajes & Camisas
                            </div>
                        </div>
                        <div className="p-5 space-y-2">
                            <h3 className="font-serif text-lg text-white">Sastrería & Sacos</h3>
                            <p className="text-xs text-white/60 leading-relaxed font-light">
                                Entalle de chaquetas en espalda y sisa, ajuste de largo de mangas, entalle de camisas y basta en pantalones de vestir.
                            </p>
                            <div className="pt-2 flex items-center justify-between text-xs text-[#C17F5F]">
                                <span>Desde $8.500</span>
                                <Link href={getWhatsAppUrl(comuna, "Trajes y Sacos")} target="_blank" className="font-bold flex items-center gap-1 hover:underline">
                                    Cotizar <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Prenda 2: Vestidos & Faldas */}
                    <div className="border border-white/5 rounded-sm bg-[#121212] overflow-hidden group hover:border-[#C17F5F]/40 transition-all duration-300">
                        <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                            <img 
                                src="/dress_measuring_tape.png" 
                                alt={`Ajuste de vestidos en ${comuna}`} 
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-3 left-3 bg-[#C17F5F]/20 text-[#C17F5F] text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-sm border border-[#C17F5F]/30">
                                Vestidos & Faldas
                            </div>
                        </div>
                        <div className="p-5 space-y-2">
                            <h3 className="font-serif text-lg text-white">Vestidos & Calce Anatómico</h3>
                            <p className="text-xs text-white/60 leading-relaxed font-light">
                                Bastas invisibles a mano, toma de sisa, reducción de cintura, ajuste de tirantes y calce de vestidos de uso diario o fiesta.
                            </p>
                            <div className="pt-2 flex items-center justify-between text-xs text-[#C17F5F]">
                                <span>Desde $9.500</span>
                                <Link href={getWhatsAppUrl(comuna, "Vestidos y Faldas")} target="_blank" className="font-bold flex items-center gap-1 hover:underline">
                                    Cotizar <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Prenda 3: Cierres & Parkas */}
                    <div className="border border-white/5 rounded-sm bg-[#121212] overflow-hidden group hover:border-[#C17F5F]/40 transition-all duration-300">
                        <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                            <img 
                                src="/zipper_repair_macro.png" 
                                alt={`Reemplazo de cierres en parkas en ${comuna}`} 
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-3 left-3 bg-[#C17F5F]/20 text-[#C17F5F] text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-sm border border-[#C17F5F]/30">
                                Parkas & Chaquetas
                            </div>
                        </div>
                        <div className="p-5 space-y-2">
                            <h3 className="font-serif text-lg text-white">Cierres & Reparaciones Técnicas</h3>
                            <p className="text-xs text-white/60 leading-relaxed font-light">
                                Cambio de cierres metálicos y plásticos YKK en parkas de pluma, cortavientos, chaquetas de cuero y abrigos pesados.
                            </p>
                            <div className="pt-2 flex items-center justify-between text-xs text-[#C17F5F]">
                                <span>Desde $12.000</span>
                                <Link href={getWhatsAppUrl(comuna, "Cierres y Parkas")} target="_blank" className="font-bold flex items-center gap-1 hover:underline">
                                    Cotizar <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Prenda 4: Jeans & Denim */}
                    <div className="border border-white/5 rounded-sm bg-[#121212] overflow-hidden group hover:border-[#C17F5F]/40 transition-all duration-300">
                        <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                            <img 
                                src="/patched_jeans_repair.png" 
                                alt={`Basta original y reparación de jeans en ${comuna}`} 
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-3 left-3 bg-[#C17F5F]/20 text-[#C17F5F] text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-sm border border-[#C17F5F]/30">
                                Jeans & Pantalones
                            </div>
                        </div>
                        <div className="p-5 space-y-2">
                            <h3 className="font-serif text-lg text-white">Bastas & Reparaciones Denim</h3>
                            <p className="text-xs text-white/60 leading-relaxed font-light">
                                Basta con conservación del ruedo original de fábrica, refuerzos invisibles en entrepierna y achique de pretina en jeans.
                            </p>
                            <div className="pt-2 flex items-center justify-between text-xs text-[#C17F5F]">
                                <span>Desde $8.000</span>
                                <Link href={getWhatsAppUrl(comuna, "Jeans y Pantalones")} target="_blank" className="font-bold flex items-center gap-1 hover:underline">
                                    Cotizar <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TABLA DE PRECIOS BASE EN COMUNA */}
            <section className="max-w-3xl mx-auto px-6 py-12 relative z-10 border-t border-white/5">
                <div className="text-center mb-8 space-y-1">
                    <span className="text-xs text-[#C17F5F] uppercase tracking-widest font-bold">Tarifario Transparente</span>
                    <h2 className="font-serif text-lg text-white/90">Valores Base Referenciales en {comuna}</h2>
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
                                <td className="p-4 font-semibold text-white">Basta original de pantalón o jeans</td>
                                <td className="p-4 text-right font-bold text-[#C17F5F] font-serif text-sm">Desde $8.000</td>
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
                                <td className="p-4 font-semibold text-white">Retiro y entrega a domicilio en {comuna}</td>
                                <td className="p-4 text-right font-bold text-[#C17F5F] font-serif text-sm">$10.000</td>
                            </tr>
                            <tr className="bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 font-semibold text-white">Visita a domicilio para toma de medidas</td>
                                <td className="p-4 text-right font-bold text-[#C17F5F] font-serif text-sm">$20.000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

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
    );
}
