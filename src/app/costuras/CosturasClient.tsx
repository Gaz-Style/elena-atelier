"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Truck, Clock, ShieldCheck, Scissors, Star, Camera, UserCheck, MessageCircle, List, Ruler, Shirt, Sparkles, Layers, CheckCircle2 } from 'lucide-react';
import AnimatedTestimonials from '@/components/AnimatedTestimonials';
import BrandCarousel from '@/components/BrandCarousel';
import LocationMap from '@/components/LocationMap';
import TrackedLink from '@/components/TrackedLink';

function getWhatsAppUrl(comunaFormatted: string = "[La Dehesa / Los Trapenses / Lo Barnechea / Otro]", servicio: string = "general") {
    const phone = "56937667709";
    const text = `Hola. Tengo una prenda que necesita arreglo (${servicio}) y estoy en el sector de ${comunaFormatted}. ¿Puedo enviarles una foto rápida para saber si se puede reparar y cuánto costaría?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function getWhatsAppPhotoUrl() {
    const phone = "56937667709";
    const text = "Hola Elena Atelier. Les envío una foto de mi prenda para cotizar el arreglo. ¿Pueden darme un precio estimado?";
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

const serviciosPrenda = [
    {
        titulo: "Bastas & Reparaciones Denim",
        badge: "Jeans & Pantalones",
        imagen: "/Servicios%20principales/Bastas.png",
        alt: "Basta original y reparación de jeans — Elena Atelier",
        descripcion: "Basta con conservación del ruedo original de fábrica, refuerzos invisibles en entrepierna y achique de pretina en jeans.",
        precio: "$8.000+",
        cotizarServicio: "Jeans y Pantalones",
    },
    {
        titulo: "Cierres & Reparaciones Técnicas",
        badge: "Parkas & Chaquetas",
        imagen: "/Servicios%20principales/Cierres.png",
        alt: "Reemplazo de cierres en parkas — Elena Atelier",
        descripcion: "Cambio de cierres metálicos y plásticos YKK en parkas de pluma, cortavientos, chaquetas de cuero y abrigos pesados.",
        precio: "$8.000+",
        cotizarServicio: "Cierres y Parkas",
    },
    {
        titulo: "Vestidos & Calce Anatómico",
        badge: "Vestidos & Faldas",
        imagen: "/Servicios%20principales/Entalle.png",
        alt: "Ajuste de vestidos — Elena Atelier",
        descripcion: "Bastas invisibles a mano, toma de sisa, reducción de cintura, ajuste de tirantes y calce de vestidos de uso diario o fiesta.",
        precio: "$12.000+",
        cotizarServicio: "Vestidos y Faldas",
    },
    {
        titulo: "Sastrería & Sacos",
        badge: "Sacos, Trajes & Camisas",
        imagen: "/Servicios%20principales/Acortar%20mangas.png",
        alt: "Ajuste de sacos y trajes — Elena Atelier",
        descripcion: "Entalle de chaquetas en espalda y sisa, ajuste de largo de mangas, entalle de camisas y basta en pantalones de vestir.",
        precio: "$12.000+",
        cotizarServicio: "Trajes y Sacos",
    },
];

const logistica = [
    { nombre: "Retiro y entrega a domicilio (ida y vuelta)", precio: "$10.000", nota: "Sector Oriente: Vitacura, Las Condes, Lo Barnechea, La Dehesa, Los Trapenses" },
    { nombre: "Visita de costurera a domicilio", precio: "$20.000", nota: "Toma de medidas y evaluación presencial. Descontable si el arreglo supera $40.000" },
];

export default function CosturasClient() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const communes = [
        { name: 'Vitacura', slug: 'vitacura' },
        { name: 'Las Condes', slug: 'las-condes' },
        { name: 'Lo Barnechea', slug: 'lo-barnechea' },
        { name: 'La Dehesa', slug: 'la-dehesa' },
    ];

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans relative overflow-hidden pb-24">


            {/* Fondos Decorativos Premium */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#C17F5F] mix-blend-screen filter blur-[160px] opacity-[0.04] pointer-events-none"></div>
            
            {/* HERO SECTION */}
            <header className="relative min-h-[70vh] flex items-center justify-center pt-28 pb-4 px-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image src="/hero_seamstress_taller.png" alt="Taller de sastrería" fill priority className="object-cover object-[65%_center] sm:object-center scale-105 filter brightness-[0.45] contrast-[1.10]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-black/30 md:via-[#0d0d0d]/60" />
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <p className="inline-flex items-center gap-2 text-xs text-[#C17F5F] uppercase tracking-widest font-bold mb-8">
                        <Truck className="w-3.5 h-3.5" /> Retiro y entrega a domicilio
                    </p>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight font-extrabold max-w-3xl mx-auto mb-5">
                        Sastrería y Arreglos a Domicilio
                    </h1>
                    <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light mb-8">
                        Recupera el calce perfecto de tus prendas sin salir de casa. Expertos en intervenciones técnicas manteniendo los acabados de fábrica.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                        <TrackedLink href={getWhatsAppPhotoUrl()} target="_blank" eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Hero_Solicitar_Servicio" className="w-full sm:w-1/2 bg-[#C17F5F] hover:bg-[#b05c4b] text-white px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C17F5F]/20 hover:scale-[1.02]">
                            <Scissors className="w-4 h-4" /> Solicitar Servicio
                        </TrackedLink>
                        <TrackedLink href="/costuras/catalogo-completo" eventAction="click_catalog" eventCategory="Navigation" eventLabel="Hero_Ver_Catalogo" className="w-full sm:w-1/2 border border-[#C17F5F]/50 bg-black/40 hover:bg-[#C17F5F]/20 text-[#E29D7A] hover:text-white px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 backdrop-blur-md hover:scale-[1.02] group">
                            <List className="w-4 h-4 text-[#C17F5F]" /> Ver Catálogo
                        </TrackedLink>
                    </div>
                </div>
            </header>

            <AnimatedTestimonials />

            {/* ═══════════════════════════════════════════
                TOP ARREGLOS (ALTA CONVERSIÓN)
            ═══════════════════════════════════════════ */}
            <section className="max-w-4xl mx-auto px-6 pt-8 pb-16 relative z-10">
                <div className="text-center mb-10 flex flex-col items-center">
                    <span className="text-xs text-[#C17F5F] uppercase tracking-widest font-bold mb-4">Nuestros Servicios Estrella</span>
                    <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Los Arreglos <span className="italic text-[#E29D7A]">Más Solicitados</span></h2>
                    <p className="text-sm text-white/50 max-w-xl mx-auto font-light">
                        Precios base referenciales para nuestros trabajos más frecuentes. El valor final se confirma mediante evaluación técnica.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
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
                                        href={getWhatsAppUrl(undefined, servicio.cotizarServicio)} 
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
                    <TrackedLink href="/costuras/catalogo-completo" eventAction="click_catalog" eventCategory="Navigation" eventLabel="Services_Ver_Catalogo" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#C17F5F]/40 bg-[#C17F5F]/5 hover:bg-[#C17F5F]/10 text-[#E29D7A] px-8 py-4 rounded-sm text-xs font-bold uppercase tracking-widest transition-all">
                        <List className="w-4 h-4" /> Ver Catálogo Completo
                    </TrackedLink>
                    <TrackedLink href={getWhatsAppPhotoUrl()} target="_blank" eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Services_Cotizar_Arreglo" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C17F5F] hover:bg-[#b05c4b] text-white px-8 py-4 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#C17F5F]/20 hover:scale-[1.02]">
                        <Camera className="w-4 h-4" /> Cotizar Arreglo Ahora
                    </TrackedLink>
                </div>
            </section>

            {/* LOGOS MARCAS - INFINITE SCROLL */}
            <BrandCarousel />

            {/* COSTURERA A DOMICILIO */}
            <section className="max-w-5xl mx-auto px-6 py-12 relative z-10">
                <div className="relative overflow-hidden border border-[#C17F5F]/30 rounded-lg bg-[#141414] shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                        <div className="lg:col-span-5 relative min-h-[300px] sm:min-h-[360px] lg:min-h-full overflow-hidden bg-black">
                            <Image src="/costurera_domicilio_medidas.png" alt="Costurera a domicilio en Vitacura" fill className="object-cover object-center opacity-90 transition-transform duration-700 hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#141414]" />
                        </div>
                        <div className="lg:col-span-7 p-8 sm:p-10 md:p-12 flex flex-col justify-center space-y-6 relative">
                            <span className="text-xs text-[#C17F5F] uppercase tracking-widest font-bold">Servicio Especializado</span>
                            <div className="space-y-3">
                                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-bold tracking-tight leading-tight">
                                    Costurera a Domicilio: <span className="text-[#E29D7A]">Elena Va a Tu Casa</span>
                                </h2>
                                <p className="text-sm text-white/75 font-light leading-relaxed">
                                    Nuestra costurera especialista visita tu residencia en el sector oriente para tomar medidas exactas directamente en tu propia prenda. Retiramos, confeccionamos en nuestro Taller de Vitacura y te entregamos la prenda impecable en tu puerta.
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
                                <TrackedLink href={getWhatsAppUrl()} target="_blank" eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Domicilio_Solicitar" className="inline-flex items-center justify-center gap-2 bg-[#C17F5F] hover:bg-[#b05c4b] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm shadow-lg shadow-[#C17F5F]/20 hover:scale-[1.02]">
                                    Solicitar Costurera a Domicilio <ArrowRight className="w-4 h-4" />
                                </TrackedLink>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* GARANTÍAS Y PROCESO */}
            <section className="max-w-4xl mx-auto px-6 py-12 relative z-10 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3 p-6 border border-white/5 rounded-sm bg-[#1c1c1c]/30">
                        <div className="flex items-center gap-2">
                            <Truck className="w-5 h-5 text-[#C17F5F]" />
                            <h3 className="font-serif text-base text-white font-bold">1. Retiro a Domicilio</h3>
                        </div>
                        <p className="text-xs text-white/60 font-light leading-relaxed">No pierdas tiempo en el tráfico. Vamos a tu puerta en Vitacura, Las Condes o Lo Barnechea.</p>
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
                    <span className="text-xs text-[#C17F5F] uppercase tracking-widest font-bold mb-4 block">Hablemos de tu prenda</span>
                    <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">La perfección, <span className="italic text-[#E29D7A]">a un paso de distancia.</span></h2>
                    <p className="text-sm md:text-base text-white/60 font-light mb-12 max-w-xl mx-auto leading-relaxed">
                        Envíanos una foto de lo que necesitas ajustar o agenda el retiro a domicilio. Nuestro equipo de expertos evaluará tu caso de inmediato.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <TrackedLink href={getWhatsAppPhotoUrl()} target="_blank" eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Footer_Cotizar_WhatsApp" className="w-full sm:w-auto bg-[#C17F5F] hover:bg-[#b05c4b] text-white px-10 py-5 text-xs font-bold uppercase tracking-widest transition-all rounded-sm shadow-[0_0_20px_rgba(193,127,95,0.3)] hover:shadow-[0_0_30px_rgba(193,127,95,0.5)] hover:scale-[1.02] flex items-center justify-center gap-2">
                            <Camera className="w-4 h-4" /> Cotizar por WhatsApp
                        </TrackedLink>
                        <TrackedLink href={getWhatsAppUrl()} target="_blank" eventAction="click_whatsapp" eventCategory="Lead" eventLabel="Footer_Agendar_Retiro" className="w-full sm:w-auto bg-transparent border border-[#C17F5F] text-[#C17F5F] hover:bg-[#C17F5F]/10 px-10 py-5 text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 hover:scale-[1.02]">
                            Agendar Retiro <Truck className="w-4 h-4" />
                        </TrackedLink>
                    </div>
                </div>
            </section>

            {/* MAPA Y UBICACIÓN CON BOTONES INTELIGENTES */}
            <LocationMap />

        </div>
    );
}
