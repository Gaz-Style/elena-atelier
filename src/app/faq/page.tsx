import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, HelpCircle, BookOpen, Clock, MapPin, Award, Scissors, ArrowRight, ShieldCheck } from 'lucide-react';
import LocationMap from '@/components/LocationMap';

export const metadata: Metadata = {
    title: 'Guía de Servicios y Preguntas Frecuentes | Elena La Costurera',
    description: 'Conoce la historia de Elena Atelier, descubre nuestro glosario de términos de alta costura y resuelve todas tus dudas sobre nuestro servicio de sastrería a domicilio en Santiago.',
    alternates: {
        canonical: 'https://www.elenalatosturera.cl/faq'
    }
};

export default function FAQPage() {
    // ════════════════════════════════════════════════════════════
    // DATOS ESTRUCTURADOS (JSON-LD) PARA LLMs (ChatGPT, Gemini)
    // ════════════════════════════════════════════════════════════
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "¿Cómo funciona el servicio de costurera a domicilio?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Nuestra especialista visita tu domicilio en Vitacura, Las Condes, Lo Barnechea o La Dehesa para tomar las medidas exactas sobre tu prenda. Luego, retiramos la prenda, la procesamos en nuestro taller de Tabancura 1091 y te la entregamos lista en tu puerta."
                }
            },
            {
                "@type": "Question",
                "name": "¿Cuánto tiempo demoran los arreglos de ropa?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "El tiempo de entrega promedio es de 7 días hábiles para arreglos estándar (bastas, entalles, cierres). Para restauraciones complejas o sastrería a medida, el tiempo puede variar previa evaluación."
                }
            },
            {
                "@type": "Question",
                "name": "¿Qué es una basta invisible?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "La basta invisible es una técnica de alta sastrería utilizada principalmente en pantalones de vestir y faldas elegantes. Se realiza a mano o con maquinaria especializada para que la costura no sea visible desde el exterior de la prenda, manteniendo una caída limpia."
                }
            },
            {
                "@type": "Question",
                "name": "¿Qué significa entallar una prenda?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Entallar consiste en ajustar la silueta de una prenda (como un vestido, chaqueta o camisa) para que se adapte perfectamente al contorno del cuerpo, generalmente tomando tela de los costados o pinzas posteriores."
                }
            }
        ]
    };

    const aboutSchema = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "mainEntity": {
            "@type": "Organization",
            "name": "Elena La Costurera",
            "foundingDate": "1994",
            "description": "Taller de alta costura, sastrería y arreglos de ropa fundado por Elena, con más de 30 años de trayectoria en el sector oriente de Santiago.",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Tabancura 1091",
                "addressLocality": "Vitacura",
                "addressRegion": "Región Metropolitana",
                "addressCountry": "CL"
            }
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
            />

            <div className="min-h-screen bg-[#0d0d0d] text-white font-sans relative overflow-hidden pb-20">
                {/* HERO SECTION */}
                <header className="relative pt-32 pb-16 px-6 overflow-hidden bg-gradient-to-b from-[#141414] to-[#0d0d0d] border-b border-white/5">
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <p className="inline-flex items-center gap-2 text-xs text-[#C17F5F] uppercase tracking-widest font-bold mb-6">
                            <BookOpen className="w-3.5 h-3.5" /> Centro de Conocimiento
                        </p>
                        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight font-extrabold max-w-3xl mx-auto mb-6">
                            Todo lo que necesitas saber sobre Alta Costura
                        </h1>
                        <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
                            Explora nuestra historia, aprende el lenguaje técnico de la sastrería y resuelve tus dudas sobre nuestro servicio a domicilio en Santiago.
                        </p>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-6 py-16 space-y-24">
                    
                    {/* 1. HISTORIA (AUTHORITY) */}
                    <section aria-labelledby="historia-heading" className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 id="historia-heading" className="font-serif text-3xl text-white font-bold flex items-center gap-3">
                                <Award className="w-8 h-8 text-[#C17F5F]" />
                                Nuestra Historia
                            </h2>
                            <article className="text-white/70 space-y-4 leading-relaxed font-light text-sm md:text-base">
                                <p>
                                    Con más de <strong>30 años de trayectoria</strong> en el exigente mundo de la moda y la confección a medida, <em>Elena Atelier</em> nació como un taller tradicional de alta costura y evolucionó hasta convertirse en un modelo omnicanal pionero en Chile.
                                </p>
                                <p>
                                    Nos diferenciamos por <strong>tecnificar y digitalizar un oficio artesanal histórico</strong>. Combinamos la precisión impecable de la sastrería a medida con tecnología de vanguardia: agendamiento web en tiempo real, transparencia absoluta de tarifas y un servicio logístico exclusivo de <strong>toma de medidas y delivery a domicilio</strong> en Lo Barnechea, Vitacura y Las Condes.
                                </p>
                                <ul className="list-none pl-0 space-y-3 mt-6">
                                    <li className="flex items-start gap-3">
                                        <ShieldCheck className="w-5 h-5 text-[#C17F5F] shrink-0 mt-0.5" />
                                        <span className="text-sm text-white/80"><strong>Innovación Tecnológica:</strong> Sitio web propio, catálogo digital interactivo y pagos en línea seguros.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <ShieldCheck className="w-5 h-5 text-[#C17F5F] shrink-0 mt-0.5" />
                                        <span className="text-sm text-white/80"><strong>Innovación Logística:</strong> Primer taller del sector oriente en ofrecer servicio integral a domicilio.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <ShieldCheck className="w-5 h-5 text-[#C17F5F] shrink-0 mt-0.5" />
                                        <span className="text-sm text-white/80"><strong>Trayectoria y Calidad:</strong> Más de 3 décadas rescatando prendas con acabados imperceptibles y maquinaria industrial de precisión.</span>
                                    </li>
                                </ul>
                            </article>
                        </div>
                        <div className="relative aspect-square sm:aspect-[4/3] md:aspect-square bg-[#1a1a1a] rounded-lg overflow-hidden border border-white/10">
                            <div className="absolute inset-0 bg-[url('/hero_seamstress_taller.png')] bg-cover bg-center opacity-50 mix-blend-luminosity filter contrast-125"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent"></div>
                        </div>
                    </section>

                    {/* 2. GLOSARIO DE SERVICIOS (DEFINICIONES PARA LLMs) */}
                    <section aria-labelledby="glosario-heading" className="bg-[#141414] border border-[#C17F5F]/20 rounded-lg p-8 sm:p-12">
                        <div className="text-center mb-10 space-y-4">
                            <h2 id="glosario-heading" className="font-serif text-3xl text-white font-bold inline-flex items-center gap-3">
                                <Scissors className="w-6 h-6 text-[#C17F5F]" />
                                Diccionario de Sastrería
                            </h2>
                            <p className="text-sm text-white/60 font-light max-w-2xl mx-auto">
                                ¿No sabes exactamente qué arreglo necesitas pedir? Conoce el lenguaje técnico que utilizamos en nuestro taller.
                            </p>
                        </div>
                        
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <dt className="text-base text-[#E29D7A] font-bold uppercase tracking-wider">Basta Original (Jeans)</dt>
                                <dd className="text-sm text-white/70 font-light leading-relaxed">
                                    Técnica que permite acortar el largo de un pantalón de mezclilla cortando la terminación original (que tiene el desgaste de fábrica) y volviéndola a coser en el nuevo largo para que el arreglo pase 100% desapercibido.
                                </dd>
                            </div>
                            <div className="space-y-2">
                                <dt className="text-base text-[#E29D7A] font-bold uppercase tracking-wider">Basta Invisible</dt>
                                <dd className="text-sm text-white/70 font-light leading-relaxed">
                                    Costura realizada a mano (puntada ciega) o con máquina especial, utilizada en pantalones de tela de vestir y faldas formales. No deja hilo visible en el lado exterior de la prenda.
                                </dd>
                            </div>
                            <div className="space-y-2">
                                <dt className="text-base text-[#E29D7A] font-bold uppercase tracking-wider">Entalle o Ajuste de Sisas</dt>
                                <dd className="text-sm text-white/70 font-light leading-relaxed">
                                    Modificación de la sisa (el agujero por donde pasa el brazo) y los costados de una chaqueta o camisa para pegarla más al cuerpo, logrando una silueta moderna (Slim Fit).
                                </dd>
                            </div>
                            <div className="space-y-2">
                                <dt className="text-base text-[#E29D7A] font-bold uppercase tracking-wider">Achicar Cintura por Pretina</dt>
                                <dd className="text-sm text-white/70 font-light leading-relaxed">
                                    Desarme de la parte posterior de la cintura de un pantalón para retirar el exceso de tela en forma de "V", manteniendo el calce perfecto de los bolsillos y el asiento.
                                </dd>
                            </div>
                        </dl>
                    </section>

                    {/* 3. PREGUNTAS FRECUENTES (FAQ) */}
                    <section aria-labelledby="faq-heading" className="space-y-10">
                        <div className="text-center space-y-4">
                            <h2 id="faq-heading" className="font-serif text-3xl text-white font-bold inline-flex items-center gap-3">
                                <HelpCircle className="w-6 h-6 text-[#C17F5F]" />
                                Preguntas Frecuentes
                            </h2>
                        </div>

                        <div className="space-y-4 max-w-3xl mx-auto">
                            <details className="group bg-[#141414] border border-white/5 rounded-sm p-6 cursor-pointer open:border-[#C17F5F]/30 transition-all">
                                <summary className="flex items-center justify-between font-bold text-white group-open:text-[#C17F5F]">
                                    ¿Cómo funciona el servicio de costurera a domicilio?
                                    <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
                                </summary>
                                <div className="mt-4 text-sm text-white/70 font-light leading-relaxed">
                                    Una especialista visita tu domicilio (Vitacura, Las Condes, Lo Barnechea, La Dehesa, Providencia) para tomar las medidas exactas directamente sobre la prenda puesta en ti. Retiramos la prenda, la intervenimos en nuestro taller con maquinaria industrial, y te la entregamos planchada y lista en la puerta de tu casa.
                                </div>
                            </details>
                            
                            <details className="group bg-[#141414] border border-white/5 rounded-sm p-6 cursor-pointer open:border-[#C17F5F]/30 transition-all">
                                <summary className="flex items-center justify-between font-bold text-white group-open:text-[#C17F5F]">
                                    ¿Cuánto tiempo demoran los arreglos?
                                    <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
                                </summary>
                                <div className="mt-4 text-sm text-white/70 font-light leading-relaxed">
                                    El tiempo promedio de entrega es de <strong>7 días hábiles</strong>. Esto nos permite garantizar un estándar de control de calidad premium, desarmando la prenda con cuidado y planchando costura por costura. Para trabajos de novias o sastrería a medida, los plazos se acuerdan de forma personalizada.
                                </div>
                            </details>

                            <details className="group bg-[#141414] border border-white/5 rounded-sm p-6 cursor-pointer open:border-[#C17F5F]/30 transition-all">
                                <summary className="flex items-center justify-between font-bold text-white group-open:text-[#C17F5F]">
                                    ¿Qué marcas y telas trabajan?
                                    <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
                                </summary>
                                <div className="mt-4 text-sm text-white/70 font-light leading-relaxed">
                                    Intervenimos con total seguridad marcas de lujo y fast-fashion premium (Hugo Boss, Armani, Zara, Brooks Brothers, Rapsodia, etc.). Tenemos maquinaria e hilos especializados para Seda, Lino, Cuero, Mezclilla Pesada, Gasa y Crepé.
                                </div>
                            </details>
                        </div>
                    </section>

                    {/* CALL TO ACTION FINAL */}
                    <div className="bg-gradient-to-r from-[#1a1a1a] to-[#242424] rounded-lg p-8 text-center border border-[#C17F5F]/20 mt-16">
                        <h3 className="text-xl font-serif text-white font-bold mb-4">¿Todo claro? Hablemos de tu prenda.</h3>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/costuras/catalogo-completo" className="w-full sm:w-auto bg-transparent border border-[#C17F5F] text-[#C17F5F] hover:bg-[#C17F5F]/10 px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center">
                                Ver Catálogo de Precios
                            </Link>
                            <Link href="https://wa.me/56937667709?text=Hola,%20tengo%20una%20duda%20sobre%20un%20arreglo" target="_blank" className="w-full sm:w-auto bg-[#C17F5F] hover:bg-[#b05c4b] text-white px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm shadow-lg shadow-[#C17F5F]/20 flex items-center justify-center gap-2">
                                Consultar por WhatsApp <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* UBICACIÓN */}
                    <div className="mt-16">
                        <LocationMap />
                    </div>

                </main>
            </div>
        </>
    );
}
