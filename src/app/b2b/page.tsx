'use client';

import React from 'react';
import { Briefcase, Building2, TabletSmartphone, ShieldCheck, MapPin, ArrowRight, Clock, Star, Scissors, Search, Gem } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import BackLink from '@/components/BackLink';
import TrackedLink from '@/components/TrackedLink';
import LocationMap from '@/components/LocationMap';

function getWhatsAppB2BUrl() {
    const phone = "56937667709";
    const text = `Hola Elena Atelier. Me interesa gestionar un convenio corporativo de sastrería a domicilio para nuestra empresa en el sector oriente. Me gustaría coordinar una reunión.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function getWhatsAppServiceUrl(serviceType: 'sastre' | 'costurera') {
    const phone = "56937667709";
    const text = `Hola Elena Atelier. Me interesa agendar el servicio de ${serviceType === 'sastre' ? 'Sastre a Domicilio' : 'Costurera a Domicilio'} en mi oficina.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export default function B2BPage() {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans relative pb-24">
            <Navbar />
            <BackLink />

            <main className="max-w-7xl mx-auto px-5 md:px-6 pt-24 md:pt-32 space-y-20 md:space-y-32">
                
                {/* 1. HERO SECTION B2B */}
                <header className="flex flex-col lg:flex-row gap-12 md:gap-16 items-center">
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#C17F5F]">
                            <Building2 className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">División Corporativa · B2B</span>
                        </div>
                        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-white font-black tracking-tight">
                            Sastrería Ejecutiva <br className="hidden md:block" />
                            <span className="italic text-[#E29D7A]">en tu Oficina.</span>
                        </h1>
                        <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
                            Llevamos la precisión de la alta costura directamente al piso de gerencia. Optimizamos el tiempo de tus ejecutivos con nuestro servicio integral de <strong className="text-white font-medium">toma de medidas in-situ</strong> y gestión digital en <span className="text-[#C17F5F] font-semibold">El Golf, Vitacura y Las Condes</span>.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
                            <TrackedLink
                                href={getWhatsAppB2BUrl()}
                                target="_blank"
                                eventAction="click_whatsapp" eventCategory="Lead" eventLabel="B2B_Hero"
                                className="glass-btn relative inline-flex items-center justify-center gap-3 px-8 py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.2em] font-bold bg-[#C17F5F]/20 backdrop-blur-[10px] transition-all hover:bg-[#C17F5F] hover:border-[#E29D7A] hover:shadow-[0_0_30px_rgba(193,127,95,0.3)] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-sm w-full sm:w-auto"
                            >
                                Agendar Visita Corporativa
                                <ArrowRight className="w-4 h-4" />
                            </TrackedLink>
                            
                            <div className="flex items-center gap-3 text-white/50 text-xs font-semibold uppercase tracking-widest justify-center sm:justify-start">
                                <MapPin className="w-4 h-4 text-[#C17F5F]" />
                                <span>Cobertura Sanhattan</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative">
                        <div className="aspect-[4/5] md:aspect-square lg:aspect-[4/5] relative rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
                            <img 
                                src="/b2b_hero.png" 
                                alt="Sastrería Ejecutiva en Oficina Corporativa" 
                                className="absolute inset-0 w-full h-full object-cover filter contrast-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-black/20 to-transparent pointer-events-none" />
                        </div>
                        {/* Floating Badge */}
                        <div className="absolute -bottom-8 -left-8 md:-bottom-12 md:-left-12 bg-[#141414] p-6 rounded-lg border border-white/10 shadow-2xl max-w-xs hidden sm:block">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-[#C17F5F]/10 border border-[#C17F5F]/20">
                                    <Clock className="w-6 h-6 text-[#E29D7A]" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">SLA Express</h4>
                                    <p className="text-[11px] text-white/60 leading-relaxed mt-1">Ajustes prioritarios en 48 hrs para ejecutivos con agendas críticas.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 1.5 CARTA DE ALTA GAMA BANNER */}
                <section className="relative overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-[#C17F5F]/40 transition-colors">
                    <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-[#C17F5F]/10 to-transparent pointer-events-none" />
                    <div className="space-y-3 z-10 text-center md:text-left">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <Briefcase className="w-5 h-5 text-[#E29D7A]" />
                            <h3 className="font-serif text-2xl text-white font-bold">Catálogo de Especialidades</h3>
                        </div>
                        <p className="text-white/60 text-sm max-w-xl">
                            La excelencia se demuestra en el trabajo. Presentamos nuestro portafolio digital corporativo con <strong className="text-white font-medium">141 intervenciones de grado sastrero</strong>. Diseñe el nivel de prioridad y exigencia que su empresa necesita.
                        </p>
                    </div>
                    <div className="z-10 w-full md:w-auto">
                        <Link href="/costuras/catalogo-completo" className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-sm transition-transform hover:scale-105 shadow-xl w-full">
                            Acceder a la Carta de Precios
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>

                {/* 2. SASTRERÍA A DOMICILIO (FOCO MASCULINO/TRAJES) */}
                <section className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                        <img 
                            src="/b2b_sastreria.png" 
                            alt="Ajuste de traje en oficina" 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                    </div>
                    <div className="order-1 lg:order-2 space-y-6">
                        <div className="inline-flex items-center gap-2 text-[#C17F5F] mb-2">
                            <Scissors className="w-5 h-5" />
                            <span className="text-xs uppercase tracking-widest font-bold">Men's Tailoring</span>
                        </div>
                        <h2 className="font-serif text-4xl lg:text-5xl text-white font-bold leading-tight">
                            Arquitectura <br/>
                            <span className="italic text-[#E29D7A]">del Traje Perfecto.</span>
                        </h2>
                        <div className="space-y-4 text-white/70 text-sm md:text-base font-light leading-relaxed">
                            <p>
                                Un traje corporativo no es solo tela; es la armadura del ejecutivo moderno. Entendemos la complejidad geométrica de la sastrería tradicional y la importancia de no alterar la estructura original de una prenda de alta gama.
                            </p>
                            <p>
                                Nuestra maestría técnica abarca desde la <strong>deconstrucción y ajuste de hombros en chaquetas</strong>, la preservación del <em>canvas</em> (lona interior), hasta el acortamiento de mangas subiendo el puño desde el tajalí para conservar los ojales originales.
                            </p>
                            <p>
                                Un pantalón con la medida exacta y el tiro perfecto transmite un mensaje silencioso de prolijidad, orden y estatus absoluto en la sala de juntas.
                            </p>
                        </div>
                        <div className="pt-6 space-y-4">
                            <div className="flex items-center gap-4 bg-white/5 border border-[#C17F5F]/30 p-4 rounded-lg w-full max-w-md">
                                <div className="p-2 bg-[#C17F5F]/10 rounded-full shrink-0">
                                    <MapPin className="w-5 h-5 text-[#E29D7A]" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base sm:text-lg">Sastre a Domicilio <span className="text-[#E29D7A] block sm:inline mt-1 sm:mt-0 sm:ml-2">$9.990</span></p>
                                    <p className="text-[10px] sm:text-[11px] text-white/50 uppercase tracking-widest mt-1">Visita a Oficina + Entrega</p>
                                </div>
                            </div>
                            <div>
                                <TrackedLink
                                    href={getWhatsAppServiceUrl('sastre')}
                                    target="_blank"
                                    eventAction="click_whatsapp" eventCategory="Lead" eventLabel="B2B_Sastre_Domicilio"
                                    className="glass-btn inline-flex items-center justify-center gap-3 px-8 py-3.5 border-[0.5px] border-white/20 text-white font-sans text-xs uppercase tracking-[0.2em] font-bold bg-[#C17F5F]/10 backdrop-blur-[10px] transition-all hover:bg-[#C17F5F] hover:border-[#E29D7A] shadow-lg rounded-sm w-full max-w-md"
                                >
                                    Solicitar Visita Sastre
                                    <ArrowRight className="w-4 h-4" />
                                </TrackedLink>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. COSTURERA A DOMICILIO (FOCO FEMENINO/UNIFORMES) */}
                <section className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 text-[#C17F5F] mb-2">
                            <Gem className="w-5 h-5" />
                            <span className="text-xs uppercase tracking-widest font-bold">Women's & Uniforms</span>
                        </div>
                        <h2 className="font-serif text-4xl lg:text-5xl text-white font-bold leading-tight">
                            Precisión para <br/>
                            <span className="italic text-[#E29D7A]">Ejecutivas y Equipos.</span>
                        </h2>
                        <div className="space-y-4 text-white/70 text-sm md:text-base font-light leading-relaxed">
                            <p>
                                La indumentaria ejecutiva femenina requiere una sensibilidad estética superior. Nuestras modistas maestras se desplazan a su empresa para entallar blusas de seda, ajustar vestidos corporativos y rediseñar faldas lápiz, asegurando un calce que proyecte autoridad y elegancia.
                            </p>
                            <p>
                                Más allá del nivel gerencial, resolvemos el problema crónico de los <strong>uniformes institucionales estandarizados</strong>. Las curvas de tallaje masivo rara vez sientan bien. Nosotros ajustamos la flota completa de uniformes de sus equipos de atención al cliente para que cada colaborador luzca impecable.
                            </p>
                        </div>
                        <ul className="grid grid-cols-2 gap-4 pt-4">
                            <li className="flex items-center gap-2 text-sm text-white/80"><ShieldCheck className="w-4 h-4 text-[#C17F5F]"/> Entalle de Blusas</li>
                            <li className="flex items-center gap-2 text-sm text-white/80"><ShieldCheck className="w-4 h-4 text-[#C17F5F]"/> Ajuste de Faldas</li>
                            <li className="flex items-center gap-2 text-sm text-white/80"><ShieldCheck className="w-4 h-4 text-[#C17F5F]"/> Vestidos Corporativos</li>
                            <li className="flex items-center gap-2 text-sm text-white/80"><ShieldCheck className="w-4 h-4 text-[#C17F5F]"/> Uniformes Estandarizados</li>
                        </ul>
                        <div className="pt-6 space-y-4">
                            <div className="flex items-center gap-4 bg-white/5 border border-[#C17F5F]/30 p-4 rounded-lg w-full max-w-md">
                                <div className="p-2 bg-[#C17F5F]/10 rounded-full shrink-0">
                                    <MapPin className="w-5 h-5 text-[#E29D7A]" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base sm:text-lg">Costurera Domicilio <span className="text-[#E29D7A] block sm:inline mt-1 sm:mt-0 sm:ml-2">$9.990</span></p>
                                    <p className="text-[10px] sm:text-[11px] text-white/50 uppercase tracking-widest mt-1">Visita a Oficina + Entrega</p>
                                </div>
                            </div>
                            <div>
                                <TrackedLink
                                    href={getWhatsAppServiceUrl('costurera')}
                                    target="_blank"
                                    eventAction="click_whatsapp" eventCategory="Lead" eventLabel="B2B_Costurera_Domicilio"
                                    className="glass-btn inline-flex items-center justify-center gap-3 px-8 py-3.5 border-[0.5px] border-white/20 text-white font-sans text-xs uppercase tracking-[0.2em] font-bold bg-[#C17F5F]/10 backdrop-blur-[10px] transition-all hover:bg-[#C17F5F] hover:border-[#E29D7A] shadow-lg rounded-sm w-full max-w-md"
                                >
                                    Solicitar Visita Costurera
                                    <ArrowRight className="w-4 h-4" />
                                </TrackedLink>
                            </div>
                        </div>
                    </div>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#C17F5F]/20 shadow-[0_0_40px_rgba(193,127,95,0.15)]">
                        <img 
                            src="/b2b_power_executive.jpg" 
                            alt="Costurera ajustando uniforme ejecutivo" 
                            className="absolute inset-0 w-full h-full object-cover filter contrast-110 saturate-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d]/40 to-transparent" />
                    </div>
                </section>

                {/* 4. LA VENTAJA TECNOLÓGICA (EL KILLER FEATURE VS SARTTO) */}
                <section className="bg-[#141414] border border-white/5 p-8 md:p-16 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                        <TabletSmartphone className="w-64 h-64 text-white" />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-16 relative z-10">
                        <div className="space-y-6">
                            <h2 className="font-serif text-3xl md:text-4xl text-white font-bold leading-tight">
                                La Experiencia de Servicio <br/>
                                <span className="italic text-[#C17F5F]">Más Avanzada Digitalmente.</span>
                            </h2>
                            <p className="text-white/60 text-sm md:text-base leading-relaxed font-light">
                                Atrás quedaron los cuadernos de papel y la incertidumbre. Cuando nuestra especialista visita sus oficinas, opera con una <strong className="text-white">Tablet conectada en tiempo real a nuestro sistema central (CRM)</strong> y al Catálogo de Precios.
                            </p>
                            <ul className="space-y-4 pt-4">
                                <li className="flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-[#C17F5F] shrink-0 mt-0.5" />
                                    <p className="text-sm text-white/80"><strong className="text-white">Presupuestos In-Situ:</strong> El ejecutivo recibe la cotización exacta en su correo en el mismo instante de la medición, basada en nuestro catálogo público.</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-[#C17F5F] shrink-0 mt-0.5" />
                                    <p className="text-sm text-white/80"><strong className="text-white">Control de Pagos Inmediato:</strong> Integración directa con Transbank y MercadoPago a través de la tablet del especialista.</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-[#C17F5F] shrink-0 mt-0.5" />
                                    <p className="text-sm text-white/80"><strong className="text-white">Seguimiento Digital:</strong> Portal corporativo para que RRHH supervise el estado de las prendas de toda la flota.</p>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-black/50 border border-white/10 rounded-lg p-8 flex flex-col justify-center">
                            <h3 className="text-xs text-[#E29D7A] font-bold uppercase tracking-[0.2em] mb-6">El Proceso B2B</h3>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent hidden sm:block">
                                {[
                                    { step: "01", title: "Agendamiento Corporativo", desc: "Coordinamos un bloque horario en su oficina." },
                                    { step: "02", title: "Toma de Medidas (Tablet)", desc: "Ajuste técnico, cotización en tiempo real e ingreso al CRM." },
                                    { step: "03", title: "Intervención en Taller", desc: "Alta costura con maquinaria industrial (3 a 7 días)." },
                                    { step: "04", title: "Delivery de Retorno", desc: "Prendas listas entregadas en su recepción." }
                                ].map((item, i) => (
                                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-[#141414] text-[#C17F5F] font-serif font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            {item.step}
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 border border-white/10 p-4 rounded-lg shadow-md transition-all group-hover:border-[#C17F5F]/50">
                                            <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                                            <p className="text-[11px] text-white/50">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. MODELOS DE CONVENIO */}
                <section className="space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="font-serif text-3xl md:text-4xl text-white font-bold">Soluciones a la Medida de su Empresa</h2>
                        <p className="text-white/50 text-sm max-w-2xl mx-auto">Diseñamos modelos de atención según el volumen y las exigencias de su capital humano.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Executive Care */}
                        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-[#C17F5F]/20 p-8 md:p-12 rounded-xl space-y-6 hover:border-[#C17F5F]/50 transition-colors">
                            <div className="w-14 h-14 bg-[#C17F5F]/10 rounded-full flex items-center justify-center border border-[#C17F5F]/20">
                                <Star className="w-6 h-6 text-[#E29D7A]" />
                            </div>
                            <h3 className="font-serif text-2xl text-white font-bold">Executive Care (C-Level)</h3>
                            <p className="text-sm text-white/60 leading-relaxed font-light">
                                Servicio premium diseñado exclusivamente para Altos Directivos, Socios de Bufetes y Family Offices. Mantenimiento de sastrería Bespoke, entalle de trajes importados y ajustes arquitectónicos.
                            </p>
                            <ul className="space-y-2 text-[11px] text-white/70">
                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3 text-[#C17F5F]"/> SLA Prioritario Express (24-48 hrs)</li>
                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3 text-[#C17F5F]"/> Sastre o Modista Maestra Asignada</li>
                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3 text-[#C17F5F]"/> Facturación Consolidada Mensual</li>
                            </ul>
                        </div>

                        {/* Ajuste de Flota */}
                        <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 p-8 md:p-12 rounded-xl space-y-6 hover:border-white/20 transition-colors">
                            <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                <Briefcase className="w-6 h-6 text-white/80" />
                            </div>
                            <h3 className="font-serif text-2xl text-white font-bold">Ajuste de Flota Corporativa</h3>
                            <p className="text-sm text-white/60 leading-relaxed font-light">
                                La ropa institucional por talla estándar rara vez proyecta la autoridad que su marca necesita. Ofrecemos convenios masivos para entallar los uniformes de todo su equipo (Atención al cliente, Seguridad, Sucursales).
                            </p>
                            <ul className="space-y-2 text-[11px] text-white/70">
                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3 text-white/40"/> Operativo "Día de Toma de Medidas" In-Situ</li>
                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3 text-white/40"/> Estandarización Absoluta de Imagen Institucional</li>
                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3 text-white/40"/> Tarifas por Volumen (Descuentos B2B)</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 6. CTA FINAL */}
                <section className="relative overflow-hidden rounded-xl border border-[#C17F5F]/30 bg-[#141414] py-20 px-6 text-center">
                    <div className="absolute inset-0 bg-[url('/textile-pattern-dark.jpg')] opacity-5 bg-cover mix-blend-overlay"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl bg-[#C17F5F]/5 blur-[120px] rounded-full pointer-events-none"></div>
                    
                    <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
                        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight">Proteja la Inversión en Imagen de su Empresa</h2>
                        <p className="text-white/60 text-sm md:text-base font-light">
                            Delegue la sastrería técnica y logística a los expertos. Coordina una reunión de evaluación con nuestro equipo comercial hoy mismo.
                        </p>
                        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                            <TrackedLink
                                href={getWhatsAppB2BUrl()}
                                target="_blank"
                                eventAction="click_whatsapp" eventCategory="Lead" eventLabel="B2B_Footer_CTA"
                                className="glass-btn inline-flex items-center justify-center gap-3 px-10 py-5 border-[0.5px] border-white/20 text-white font-sans text-xs uppercase tracking-[0.2em] font-bold bg-white/5 backdrop-blur-[10px] transition-all hover:bg-white hover:text-black rounded-sm"
                            >
                                Contactar División Corporativa
                                <ArrowRight className="w-4 h-4" />
                            </TrackedLink>
                            <Link href="/costuras/catalogo-completo" className="inline-flex items-center justify-center gap-3 px-10 py-5 border-[0.5px] border-[#C17F5F]/50 text-[#E29D7A] font-sans text-xs uppercase tracking-[0.2em] font-bold bg-transparent transition-all hover:bg-[#C17F5F]/10 rounded-sm">
                                Explorar Precios Transparentes
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 7. MAPA DE UBICACIÓN */}
                <section className="pt-8">
                    <LocationMap />
                </section>

            </main>
        </div>
    );
}
