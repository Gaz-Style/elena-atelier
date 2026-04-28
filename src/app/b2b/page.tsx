'use client';

import React from 'react';
import { Factory, Box, ClipboardCheck, Truck, Download, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function B2BPortal() {
    const productionBatches = [
        { id: 'B2B-8801', item: 'Uniforme Corporativo Boutique', units: 50, status: 'En Producción', progress: 65 },
        { id: 'B2B-8805', item: 'Colección Cápsula de Invierno', units: 120, status: 'Control de Calidad', progress: 90 },
        { id: 'B2B-8910', item: 'Muestrario de Telas Técnicas', units: 10, status: 'Despacho', progress: 100 },
    ];

    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-8 pt-32 pb-24 space-y-20">
                <header className="border-b border-gray-100 pb-12 flex justify-between items-end">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-4 text-brand-terracotta">
                            <Lock className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Portal Exclusivo para Empresas</span>
                        </div>
                        <h1 className="font-serif text-6xl leading-tight mb-4 text-brand-charcoal">
                            Socio de Producción Ágil para <br /> Marcas y Boutiques
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Bienvenido al portal exclusivo para partners de elenalacosturera. Gestione sus producciones técnicas y acceda a la trazabilidad total de sus lotes bajo el concepto de Tectonic Craft.
                        </p>
                    </div>
                    <Link
                        href="/appointment"
                        className="bg-brand-charcoal text-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-brand-terracotta transition-all shadow-lg text-center flex items-center justify-center"
                    >
                        Solicitar Nuevo Lote
                    </Link>
                </header>

                {/* B2B Value Props */}
                <section className="grid md:grid-cols-3 gap-12 border-b border-gray-100 pb-20">
                    {[
                        { title: 'Manufactura Ética', desc: 'Producción Small Batch con pago justo y trazabilidad total. La calidad de un atelier para su marca.', icon: Factory },
                        { title: 'Socio Ágil', desc: 'Optimice sus inventarios. Producimos lotes pequeños de alta calidad con tiempos de entrega competitivos.', icon: ClipboardCheck },
                        { title: 'Etiqueta Colaborativa', desc: 'Potencie su marca con el respaldo de la artesanía técnica de elenalacosturera. Calidad certificada en cada costura.', icon: Truck },
                    ].map((item, i) => (
                        <div key={i} className="space-y-4">
                            <item.icon className="w-8 h-8 text-brand-terracotta mb-4" />
                            <h3 className="font-serif text-xl">{item.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </section>

                {/* Active Batches */}
                <section className="space-y-10">
                    <div className="flex justify-between items-center">
                        <h2 className="font-serif text-3xl">Mis Lotes Activos</h2>
                        <div className="flex gap-4">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400">Filtrar por:</span>
                            <button className="text-[10px] uppercase tracking-widest font-bold border-b border-brand-charcoal">Todos</button>
                            <button className="text-[10px] uppercase tracking-widest text-gray-400">En Curso</button>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {productionBatches.map((batch) => (
                            <div key={batch.id} className="bg-brand-sand/10 border border-gray-100 p-8 rounded-sm hover:border-brand-terracotta transition-all group">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <span className="text-[10px] text-brand-terracotta font-bold uppercase tracking-widest mb-2 block">{batch.id}</span>
                                        <h4 className="font-serif text-2xl">{batch.item}</h4>
                                        <p className="text-xs text-gray-400 mt-1">{batch.units} unidades solicitadas</p>
                                    </div>
                                    <div className={`px-4 py-2 text-[8px] uppercase tracking-[0.2em] font-bold rounded-full ${batch.progress === 100 ? 'bg-green-100 text-green-700' : 'bg-brand-sand/50 text-brand-charcoal'
                                        }`}>
                                        {batch.status}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-400">
                                        <span>Progreso de Producción</span>
                                        <span className="text-brand-charcoal font-bold">{batch.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                                        <div
                                            className="bg-brand-charcoal h-full transition-all duration-1000"
                                            style={{ width: `${batch.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-brand-terracotta">
                                        <Download className="w-3 h-3" /> Reporte QC
                                    </button>
                                    <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-charcoal hover:underline">
                                        Ver Tracking Detallado
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact/Support Footer */}
                <section className="bg-brand-charcoal text-white p-16 rounded-sm text-center space-y-8">
                    <h2 className="font-serif text-4xl">¿Necesita una producción especial?</h2>
                    <p className="max-w-xl mx-auto text-gray-400 text-sm leading-relaxed">
                        Nuestro equipo de diseño y producción técnica está listo para materializar colecciones de gran escala manteniendo la calidad de un atelier boutique.
                    </p>
                    <div className="flex justify-center gap-8 pt-4">
                        <Link
                            href="/appointment"
                            className="bg-brand-terracotta px-10 py-4 text-xs uppercase tracking-widest hover:bg-white hover:text-brand-charcoal transition-all text-center flex items-center justify-center"
                        >
                            Hablar con un Experto
                        </Link>
                        <Link
                            href="#"
                            className="border border-white/20 px-10 py-4 text-xs uppercase tracking-widest hover:bg-white/10 transition-all text-center flex items-center justify-center"
                        >
                            Descargar Dossier Capacidad
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
