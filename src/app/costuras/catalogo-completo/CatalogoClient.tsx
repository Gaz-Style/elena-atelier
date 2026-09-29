"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Truck, ShieldCheck, Scissors, Camera, MessageCircle, Info, ArrowLeft, Star, Sparkles, Shirt, Ruler, Layers, HelpCircle, CheckCircle2 } from 'lucide-react';
import BrandCarousel from '@/components/BrandCarousel';
import LocationMap from '@/components/LocationMap';
import TrackedLink from '@/components/TrackedLink';

function getWhatsAppUrl(servicio: string = "general") {
    const phone = "56937667709";
    const text = `Hola Elena Atelier. Tengo una prenda que necesita arreglo (${servicio}) y me gustaría cotizar.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

// 6 Arreglos más solicitados en el mercado (Ranking 80/20)
const top6Solicitados = [
    { nombre: "Basta Original de Jeans (Conservación de Ruedo)", precio: "$10.000", cat: "Jeans & Denim", desc: "Mantiene el desgaste de fábrica original." },
    { nombre: "Basta Invisible a Mano en Pantalón de Vestir", precio: "$8.000", cat: "Pantalones", desc: "Puntada ciega oculta de alta sastrería." },
    { nombre: "Acortar Mangas desde el Puño (Blazer con Forro)", precio: "$15.000", cat: "Chaquetas & Blazers", desc: "Reajuste de largo con terminado interno de forro." },
    { nombre: "Achicar Cintura en Pretina de Pantalón / Jeans", precio: "Desde $12.000", cat: "Pantalones", desc: "Ajuste en V posterior manteniendo el asiento." },
    { nombre: "Entalle de Vestidos de Fiesta (Costados y Pinzas)", precio: "Desde $12.000", cat: "Vestidos & Gala", desc: "Modelado de silueta para gala o uso diario." },
    { nombre: "Cambio de Cierre en Parkas / Chaqueta de Pluma", precio: "Desde $18.000", cat: "Abrigos & Cuero", desc: "Cierre hermético sin fuga de relleno." }
];

interface ArregloItem {
    nombre: string;
    precio: string;
    nota?: string;
    destacado?: boolean;
}

interface SubCategoria {
    subtitulo: string;
    items: ArregloItem[];
}

interface CategoriaArreglo {
    id: string;
    titulo: string;
    descripcion: string;
    icono: string;
    subcategorias: SubCategoria[];
}

const catalogoArreglos: CategoriaArreglo[] = [
    {
        id: "chaquetas",
        titulo: "Chaquetas, Blazers & Sacos de Traje",
        descripcion: "Sastrería técnica según estructura, materialidad y nivel de intervención. Diferenciamos chaquetas desestructuradas (sport), semi-estructuradas (blazer) y de estructura sastre completa (traje formal). Especialistas en acortar mangas desde tajalí (hombro) para trajes con ojales funcionales.",
        icono: "🧥",
        subcategorias: [
            {
                subtitulo: "Mangas — Largo de Brazo",
                items: [
                    { nombre: "Acortar mangas desde el puño — chaqueta sport / sin forro", precio: "$12.000" },
                    { nombre: "Acortar mangas desde el puño — blazer con forro", precio: "$15.000", nota: "Incluye ajuste de forro interno de manga" },
                    { nombre: "Acortar mangas desde el puño — saco de traje con forro completo", precio: "$18.000" },
                    { nombre: "Acortar mangas desde el tajalí (hombro) — ojales funcionales", precio: "$28.000 – $38.000", nota: "Desmonte completo de manga desde la sisa, recorte en cabeza de manga y reconstrucción.", destacado: true },
                    { nombre: "Acortar mangas desde el tajalí — saco con estructura sastre", precio: "$35.000 – $45.000", nota: "Alta sastrería artesanal", destacado: true },
                    { nombre: "Alargar mangas (si hay reserva) — sin forro", precio: "$12.000 – $16.000" },
                    { nombre: "Alargar mangas (si hay reserva) — con forro", precio: "$16.000 – $22.000" },
                ],
            },
            {
                subtitulo: "Mangas — Ancho de Brazo",
                items: [
                    { nombre: "Adelgazar manga (tapering) — sin forro", precio: "$12.000 – $16.000" },
                    { nombre: "Adelgazar manga (tapering) — con forro", precio: "$16.000 – $22.000" },
                    { nombre: "Ensanchar manga (si hay reserva)", precio: "$14.000 – $20.000" },
                ],
            },
            {
                subtitulo: "Hombros y Armadura",
                items: [
                    { nombre: "Reducir ancho de hombros — chaqueta sport", precio: "$25.000 – $35.000" },
                    { nombre: "Reducir ancho de hombros — estructura sastre", precio: "$35.000 – $50.000", destacado: true },
                    { nombre: "Ajuste / cambio / eliminar hombreras", precio: "$8.000 – $15.000" },
                ],
            },
            {
                subtitulo: "Entalle de Torso y Pecho",
                items: [
                    { nombre: "Entalle lateral (costados) — chaqueta sport", precio: "$15.000 – $22.000" },
                    { nombre: "Entalle lateral (costados) — blazer con forro", precio: "$20.000 – $28.000" },
                    { nombre: "Entalle lateral (costados) — saco de traje con estructura", precio: "$25.000 – $35.000" },
                    { nombre: "Entalle de espalda (pinzas)", precio: "$15.000 – $25.000" },
                    { nombre: "Ajuste de sisa (ampliar/reducir)", precio: "$18.000 – $28.000" },
                    { nombre: "Reducir pecho / delantero", precio: "$18.000 – $28.000" },
                ],
            },
            {
                subtitulo: "Largo de Chaqueta y Detallado",
                items: [
                    { nombre: "Acortar largo — chaqueta sin forro", precio: "$15.000 – $20.000" },
                    { nombre: "Acortar largo — blazer con forro", precio: "$20.000 – $28.000" },
                    { nombre: "Acortar largo — saco de traje con estructura", precio: "$25.000 – $35.000" },
                    { nombre: "Cambio de forro completo", precio: "$45.000 – $70.000", destacado: true },
                    { nombre: "Reparación de forro / costura", precio: "$6.000 – $15.000" },
                    { nombre: "Corrección de cuello (collar roll)", precio: "$15.000 – $25.000" },
                ],
            },
        ],
    },
    {
        id: "pantalones",
        titulo: "Pantalones de Vestir & Casuales",
        descripcion: "Ajustes de precisión para pantalones formales y casuales. Modificación de pretinas, piernas, entrepierna y terminaciones artesanales a mano.",
        icono: "👔",
        subcategorias: [
            {
                subtitulo: "Bastas y Ruedos",
                items: [
                    { nombre: "Basta simple a máquina", precio: "$6.000" },
                    { nombre: "Basta invisible a mano (blind hem)", precio: "$8.000", destacado: true },
                    { nombre: "Basta con conservación de ruedo original", precio: "$10.000", destacado: true },
                    { nombre: "Agregar/quitar valenciana (cuff)", precio: "$6.000 – $12.000" },
                ],
            },
            {
                subtitulo: "Cintura, Pretina y Asiento",
                items: [
                    { nombre: "Achicar cintura (hasta 4 cm)", precio: "$12.000 – $16.000" },
                    { nombre: "Achicar cintura (5 a 8 cm)", precio: "$18.000 – $25.000" },
                    { nombre: "Achicar cintura (más de 8 cm — reconstrucción integral)", precio: "$25.000 – $35.000", destacado: true },
                    { nombre: "Ensanchar cintura (si hay reserva)", precio: "$12.000 – $18.000" },
                ],
            },
            {
                subtitulo: "Piernas, Tiro y Cierres",
                items: [
                    { nombre: "Entalle de piernas (tapering slim/skinny)", precio: "$12.000 – $22.000" },
                    { nombre: "Ajuste de tiro (subir/bajar cintura)", precio: "$15.000 – $22.000" },
                    { nombre: "Ajuste de asiento (trasero)", precio: "$12.000 – $20.000" },
                    { nombre: "Reparación/refuerzo de entrepierna", precio: "$8.000 – $18.000" },
                    { nombre: "Cambio de cierre sintético o metálico", precio: "$8.000 – $12.000" },
                ],
            },
        ],
    },
    {
        id: "jeans",
        titulo: "Jeans & Denim",
        descripcion: "Maquinaria industrial reforzada para mantener la autenticidad del jean, el hilo ocre y el desgaste original de fábrica.",
        icono: "👖",
        subcategorias: [
            {
                subtitulo: "Bastas y Cintura",
                items: [
                    { nombre: "Basta con conservación de ruedo original", precio: "$10.000", destacado: true },
                    { nombre: "Basta simple (hilo denim)", precio: "$7.000" },
                    { nombre: "Achique de cintura en pretina denim", precio: "$12.000 – $18.000" },
                    { nombre: "Achique de cintura (reconstrucción completa)", precio: "$18.000 – $25.000" },
                ],
            },
            {
                subtitulo: "Piernas y Zurcidos",
                items: [
                    { nombre: "Entalle de piernas (skinny/slim)", precio: "$12.000 – $16.000" },
                    { nombre: "Reparación de entrepierna (refuerzo invisible)", precio: "$10.000 – $15.000", destacado: true },
                    { nombre: "Parche (funcional o invisible/zurcido)", precio: "$8.000 – $18.000" },
                    { nombre: "Cambio de cierre denim metálico (bronce/níquel)", precio: "$10.000 – $14.000" },
                ],
            },
        ],
    },
    {
        id: "vestidos",
        titulo: "Vestidos (Diario, Fiesta y Novia)",
        descripcion: "Tratamiento delicado para seda, gasa, tul y encajes. Desde vestidos ligeros de verano hasta complejos vestidos de gala o alta costura novia.",
        icono: "👗",
        subcategorias: [
            {
                subtitulo: "Bastas y Caída",
                items: [
                    { nombre: "Basta simple / invisible en tela ligera", precio: "$8.000 – $14.000" },
                    { nombre: "Basta con forro (dos capas)", precio: "$12.000 – $18.000" },
                    { nombre: "Basta múltiples capas (tul, forro, tela)", precio: "$18.000 – $28.000", destacado: true },
                    { nombre: "Basta con aplicaciones / encaje a mano", precio: "$25.000 – $40.000", destacado: true },
                ],
            },
            {
                subtitulo: "Corsatería y Escote",
                items: [
                    { nombre: "Ajuste de costados y cintura", precio: "$12.000 – $20.000" },
                    { nombre: "Ajuste de busto (achicar/ampliar)", precio: "$15.000 – $25.000" },
                    { nombre: "Ajuste de corsé estructurado con ballenas", precio: "$25.000 – $40.000", destacado: true },
                    { nombre: "Agregar/ajustar copas preformadas (bra cups)", precio: "$10.000 – $18.000" },
                    { nombre: "Cambio a cierre tipo cordón corsatero (lace-up)", precio: "$18.000 – $28.000" },
                ],
            },
            {
                subtitulo: "Servicios Integrales Novia y Gala",
                items: [
                    { nombre: "Ajuste integral vestido fiesta", precio: "Desde $45.000", destacado: true },
                    { nombre: "Ajuste integral vestido novia con pruebas", precio: "Evaluación presencial", destacado: true },
                    { nombre: "Reparación pedrería / reposicionar encaje a mano", precio: "$10.000 – $30.000" },
                ],
            },
        ],
    },
    {
        id: "camisas",
        titulo: "Camisas, Blusas & Faldas",
        descripcion: "Ajustes de precisión para camisería fina y faldas de todo tipo de pliegues.",
        icono: "👚",
        subcategorias: [
            {
                subtitulo: "Camisas y Blusas",
                items: [
                    { nombre: "Acortar mangas desde el puño", precio: "$8.000 – $14.000" },
                    { nombre: "Acortar mangas desde tajalí/hombro", precio: "$15.000 – $20.000", destacado: true },
                    { nombre: "Entalle costados y espalda (Slim Fit)", precio: "$10.000 – $15.000" },
                    { nombre: "Ajuste de pie de cuello (reducir/ampliar)", precio: "$12.000 – $18.000" },
                    { nombre: "Acortar largo de camisa (curvo/recto)", precio: "$8.000 – $12.000" },
                ],
            },
            {
                subtitulo: "Faldas",
                items: [
                    { nombre: "Basta (simple, invisible o con forro)", precio: "$6.000 – $16.000" },
                    { nombre: "Basta falda plisada (por pliegue)", precio: "$14.000 – $22.000" },
                    { nombre: "Ajustar cintura y cadera falda", precio: "$10.000 – $20.000" },
                    { nombre: "Entalle falda tubo / lápiz", precio: "$12.000 – $18.000" },
                ],
            },
        ],
    },
    {
        id: "abrigos",
        titulo: "Abrigos, Cuero & Ropa Técnica",
        descripcion: "Intervenciones en parkas de pluma, ecocuero, piel natural y abrigos de lana con aguja industrial de alta resistencia.",
        icono: "🧤",
        subcategorias: [
            {
                subtitulo: "Cierres Técnicos",
                items: [
                    { nombre: "Cambio cierre parka / cortavientos", precio: "$18.000 – $35.000" },
                    { nombre: "Cambio cierre chaqueta pluma (termosellado)", precio: "$22.000 – $32.000", destacado: true },
                    { nombre: "Cambio cierre abrigo lana / cuero", precio: "$22.000 – $40.000" },
                ],
            },
            {
                subtitulo: "Cuero y Materiales Pesados",
                items: [
                    { nombre: "Acortar mangas chaqueta cuero", precio: "$16.000 – $25.000" },
                    { nombre: "Entalle de cuero (costados)", precio: "$25.000 – $40.000" },
                    { nombre: "Ajuste hombros chaqueta cuero", precio: "$35.000 – $50.000", destacado: true },
                    { nombre: "Cambio de forro abrigo o cuero", precio: "$40.000 – $85.000" },
                ],
            },
        ],
    },
    {
        id: "hogar",
        titulo: "Textil Hogar & Servicios Exprés",
        descripcion: "Servicios de cortinaje, cojines y recargos por atención de máxima urgencia en el día.",
        icono: "🏠",
        subcategorias: [
            {
                subtitulo: "Cortinas y Cojines",
                items: [
                    { nombre: "Basta cortina (por paño)", precio: "$8.000 – $14.000" },
                    { nombre: "Angostar / acortar cortina", precio: "$10.000 – $16.000" },
                    { nombre: "Confección fundas cojín con cierre", precio: "$8.000 – $18.000" },
                ],
            },
            {
                subtitulo: "Servicios Prioritarios",
                items: [
                    { nombre: "Zurcido invisible / desgarros", precio: "$8.000 – $18.000" },
                    { nombre: "Servicio Express (Entrega en 24-48 horas)", precio: "+50% tarifa base", destacado: true },
                    { nombre: "Servicio Express (Entrega el Mismo Día)", precio: "+100% tarifa base", destacado: true },
                ],
            },
        ],
    },
];

export default function CatalogoClient() {
    const [searchTerm, setSearchTerm] = useState('');

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 130;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Filtro instantáneo para experiencia móvil sin fatiga de scroll
    const filteredCatalogo = catalogoArreglos.map(cat => {
        const matchingSubs = cat.subcategorias.map(sub => {
            const matchingItems = sub.items.filter(item => 
                item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.nota && item.nota.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            return { ...sub, items: matchingItems };
        }).filter(sub => sub.items.length > 0);

        return { ...cat, subcategorias: matchingSubs };
    }).filter(cat => cat.subcategorias.length > 0);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans relative pb-24 pt-24 md:pt-28">
            <div className="max-w-5xl mx-auto px-4 md:px-6">
                
                {/* Header SEO / GEO & Mobile First */}
                <div className="mb-6 space-y-3">
                    <Link href="/costuras" className="inline-flex items-center gap-2 text-[11px] text-white/50 hover:text-white uppercase tracking-widest font-bold transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Volver a Costuras
                    </Link>
                    <div className="space-y-1">
                        <span className="text-[10px] md:text-xs text-[#C17F5F] uppercase tracking-widest font-bold">Inventario Oficial 2026 — Sector Oriente</span>
                        <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl text-white font-extrabold leading-tight">
                            Catálogo Completo de <span className="italic text-[#E29D7A]">Arreglos</span>
                        </h1>
                    </div>
                    <p className="text-xs md:text-base text-white/70 max-w-3xl font-light leading-relaxed">
                        Explora los <strong className="text-white font-semibold">141+ arreglos técnicos</strong> disponibles. Retiro y entrega a domicilio en <strong className="text-[#E29D7A]">Vitacura, Las Condes, Lo Barnechea, La Dehesa y Los Trapenses</strong>.
                    </p>
                </div>

                {/* BUSCADOR INSTANTÁNEO MÓVIL (CERO FATIGA DE SCROLL) */}
                <div className="mb-4 relative">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="🔍 Buscar arreglo (ej: basta, mangas, cierre, cuero)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#141414] border border-[#C17F5F]/30 focus:border-[#C17F5F] text-white text-xs md:text-sm rounded-lg px-4 py-3 outline-none transition-all placeholder:text-white/40 shadow-lg"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 text-xs text-white/50 hover:text-white font-bold bg-white/10 px-2 py-0.5 rounded-full">
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* BARRA DE NAVEGACIÓN RÁPIDA (JUMP LINKS STICKY MOBILE-FIRST) */}
                {!searchTerm && (
                    <div className="sticky top-16 md:top-20 z-40 bg-[#0d0d0d]/95 backdrop-blur-md py-2.5 border-y border-white/10 mb-8 shadow-xl overflow-x-auto custom-scrollbar flex gap-2 -mx-4 px-4 md:mx-0 md:px-0">
                        {catalogoArreglos.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => scrollToSection(cat.id)}
                                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#C17F5F] hover:text-white text-[11px] font-semibold text-white/80 whitespace-nowrap transition-all flex items-center gap-1.5 border border-white/5 active:scale-95"
                            >
                                <span>{cat.icono}</span>
                                <span>{cat.titulo.split('&')[0].split('(')[0]}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════════════
                   RANKING MÁS SOLICITADOS (LISTA COMPACTA MOBILE-FIRST)
                   ══════════════════════════════════════════════════════════════════ */}
                {!searchTerm && (
                    <section className="mb-10 space-y-3">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <div className="flex items-center gap-2 text-[#C17F5F]">
                                <Star className="w-4 h-4 fill-current shrink-0" />
                                <h2 className="font-serif text-base md:text-xl text-white font-bold tracking-tight">
                                    Los Arreglos <span className="italic text-[#E29D7A]">Más Solicitados</span>
                                </h2>
                            </div>
                            <span className="text-[10px] text-[#C17F5F] font-semibold bg-[#C17F5F]/10 px-2 py-0.5 rounded-full border border-[#C17F5F]/20">
                                ⭐ Favoritos del Taller
                            </span>
                        </div>

                        <div className="divide-y divide-white/[0.04] border border-[#C17F5F]/30 rounded-lg bg-[#141414] overflow-hidden shadow-md">
                            {top6Solicitados.map((item, idx) => (
                                <article key={idx} className="flex items-center justify-between gap-2 p-3 transition-colors hover:bg-white/[0.03] bg-[#C17F5F]/[0.02]">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[8px] text-[#C17F5F] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-[#C17F5F]/15 rounded-xs border border-[#C17F5F]/20 shrink-0">
                                                {item.cat}
                                            </span>
                                            <h3 className="text-xs md:text-sm font-semibold text-white truncate">
                                                {item.nombre}
                                            </h3>
                                        </div>
                                        {item.desc && (
                                            <p className="text-[10px] text-white/40 font-light truncate">
                                                {item.desc}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2.5 shrink-0">
                                        <span className="font-serif text-xs md:text-sm font-bold text-[#E29D7A] whitespace-nowrap">
                                            {item.precio}
                                        </span>
                                        <TrackedLink 
                                            href={getWhatsAppUrl(item.nombre)} 
                                            target="_blank"
                                            eventAction="click_whatsapp" eventCategory="Lead" eventLabel={`Catalogo_Top6_${item.nombre.substring(0,20).replace(/\s+/g, '_')}`}
                                            className="text-[10px] font-bold text-white/90 hover:text-white bg-[#C17F5F]/25 hover:bg-[#C17F5F] transition-all border border-[#C17F5F]/40 px-2.5 py-1 rounded-sm whitespace-nowrap active:scale-95"
                                        >
                                            Cotizar
                                        </TrackedLink>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}



                {/* ══════════════════════════════════════════════════════════════════
                   CATÁLOGO COMPLETO 100% VISIBLE (FILAS ULTRA-COMPACTAS MOBILE-FIRST)
                   ══════════════════════════════════════════════════════════════════ */}
                <div className="space-y-10">
                    {filteredCatalogo.map((categoria) => (
                        <section id={categoria.id} key={categoria.id} className="scroll-mt-32 space-y-4">
                            
                            {/* Encabezado H2 de Categoría (Indexable SEO) */}
                            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                                <span className="text-2xl md:text-3xl">{categoria.icono}</span>
                                <div>
                                    <h2 className="font-serif text-lg md:text-2xl font-bold text-white tracking-tight">
                                        {categoria.titulo}
                                    </h2>
                                    <p className="text-[11px] text-white/60 font-light max-w-3xl leading-relaxed">
                                        {categoria.descripcion}
                                    </p>
                                </div>
                            </div>

                            {/* Subcategorías H3 */}
                            <div className="space-y-5">
                                {categoria.subcategorias.map((sub, subIndex) => (
                                    <div key={subIndex} className="space-y-2">
                                        <h3 className="text-[10px] md:text-xs text-[#C17F5F] uppercase tracking-widest font-bold flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#C17F5F]"></span>
                                            {sub.subtitulo}
                                        </h3>

                                        {/* TABLA DE FILAS COMPACTAS (MOBILE FIRST TÁCTIL) */}
                                        <div className="divide-y divide-white/[0.04] border border-white/10 rounded-lg bg-[#141414] overflow-hidden shadow-sm">
                                            {sub.items.map((item, itemIndex) => (
                                                <article key={itemIndex} className={`flex items-center justify-between gap-2 p-3 transition-colors hover:bg-white/[0.03] ${item.destacado ? 'bg-[#C17F5F]/[0.04]' : ''}`}>
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <h4 className={`text-xs md:text-sm font-medium truncate ${item.destacado ? 'text-[#E29D7A] font-semibold' : 'text-white/90'}`}>
                                                            {item.nombre}
                                                        </h4>
                                                        {item.nota && (
                                                            <p className="text-[10px] text-white/40 font-light truncate mt-0.5">
                                                                {item.nota}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2.5 shrink-0">
                                                        <span className={`font-serif text-xs md:text-sm font-bold whitespace-nowrap ${item.destacado ? 'text-white' : 'text-[#C17F5F]'}`}>
                                                            {item.precio}
                                                        </span>
                                                        <TrackedLink 
                                                            href={getWhatsAppUrl(item.nombre)} 
                                                            target="_blank"
                                                            eventAction="click_whatsapp" eventCategory="Lead" eventLabel={`Catalogo_Item_${item.nombre.substring(0,20).replace(/\s+/g, '_')}`}
                                                            className="text-[10px] font-bold text-white/80 hover:text-white bg-[#C17F5F]/20 hover:bg-[#C17F5F] transition-all border border-[#C17F5F]/40 px-2.5 py-1 rounded-sm whitespace-nowrap active:scale-95"
                                                        >
                                                            Cotizar
                                                        </TrackedLink>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* SECCIÓN PREGUNTAS FRECUENTES (FAQ SCHEMA PARA MOTORES DE IA) */}
                {!searchTerm && (
                    <section className="mt-16 pt-8 border-t border-white/10 space-y-4">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-[#C17F5F]" />
                            <h2 className="font-serif text-lg md:text-xl text-white font-bold">Preguntas Frecuentes sobre Sastrería a Domicilio</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#141414] p-4 border border-white/5 rounded-lg space-y-1">
                                <h3 className="text-xs text-[#E29D7A] font-bold uppercase tracking-wider">¿Cómo funciona el retiro y entrega a domicilio?</h3>
                                <p className="text-[11px] text-white/60 font-light leading-relaxed">
                                    Coordinamos la recepción de tu prenda directamente en tu residencia en Vitacura, Las Condes, Lo Barnechea o La Dehesa. La confección se realiza en nuestro taller especialista.
                                </p>
                            </div>
                            <div className="bg-[#141414] p-4 border border-white/5 rounded-lg space-y-1">
                                <h3 className="text-xs text-[#E29D7A] font-bold uppercase tracking-wider">¿Puedo agendar una visita presencial con la costurera?</h3>
                                <p className="text-[11px] text-white/60 font-light leading-relaxed">
                                    Sí, nuestra especialista visita tu hogar para tomar medidas sobre la propia prenda. Este valor es descontable si la orden supera el monto mínimo establecido.
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* UBICACIÓN Y BOTONES GPS INTELIGENTES (TABANCURA 1091, VITACURA) */}
                {!searchTerm && (
                    <div className="mt-12">
                        <LocationMap />
                    </div>
                )}

            </div>
        </div>
    );
}
