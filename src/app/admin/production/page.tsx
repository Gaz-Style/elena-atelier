'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Scissors, Search } from 'lucide-react';

export default function ProductionPage() {
    const tasks = [
        { id: 'ORD-102', client: 'Catalina R.', item: 'Blazer Silk', stage: 'Corte', priority: 'High', days: 2 },
        { id: 'ORD-105', client: 'Roberto M.', item: 'Traje Lana Biella', stage: 'Confección', priority: 'Medium', days: 5 },
        { id: 'ORD-108', client: 'Valentina P.', item: 'Vestido Novia', stage: 'Fitting', priority: 'Critical', days: 1 },
        { id: 'ORD-110', client: 'Andrés L.', item: 'Abrigo Vintage', stage: 'Restauración', priority: 'Low', days: 8 },
    ];

    const stages = ['Ingresado', 'Corte', 'Confección', 'Fitting', 'Final QC'];

    return (
        <div className="min-h-screen bg-brand-sand/10 p-8 pt-16 md:pt-24 font-sans text-brand-charcoal">
            <div className="max-w-screen-2xl mx-auto space-y-12">
                <header className="flex justify-between items-end border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Volver al Dashboard
                        </Link>
                        <h1 className="font-serif text-5xl">Gobernanza de Producción</h1>
                        <p className="text-text-secondary mt-2">Seguimiento de pedidos activos y flujo artesanal - Atelier Tabancura</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Buscar órden..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-sm text-sm" />
                        </div>
                        <button className="bg-brand-charcoal text-white px-6 py-2 text-[10px] uppercase tracking-widest hover:bg-brand-terracotta transition-all">
                            Nueva Órden de Producción
                        </button>
                    </div>
                </header>

                {/* Kanban Board Simulation */}
                <div className="grid grid-cols-5 gap-6 h-[700px]">
                    {stages.map(stage => (
                        <div key={stage} className="bg-white/40 p-4 border border-gray-100 flex flex-col rounded-sm">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
                                <h3 className="font-serif text-lg">{stage}</h3>
                                <span className="text-[10px] bg-white px-2 py-1 border border-gray-100 rounded-full font-bold">
                                    {tasks.filter(t => t.stage === stage || (stage === 'Ingresado' && !tasks.find(x => x.stage === stage))).length}
                                </span>
                            </div>

                            <div className="space-y-4 flex-1 overflow-y-auto">
                                {tasks.filter(t => t.stage === stage).map(task => (
                                    <div key={task.id} className="bg-white p-6 shadow-sm border border-gray-100 hover:border-brand-terracotta transition-colors group cursor-grab active:cursor-grabbing">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{task.id}</span>
                                            {task.priority === 'Critical' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                        </div>
                                        <h4 className="font-serif text-sm mb-1">{task.item}</h4>
                                        <p className="text-xs text-text-secondary mb-4">{task.client}</p>

                                        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                {task.days} días restantes
                                            </div>
                                            <div className="flex -space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-brand-sand border border-white flex items-center justify-center text-[8px] font-bold">ES</div>
                                                <div className="w-6 h-6 rounded-full bg-brand-terracotta/20 border border-white flex items-center justify-center text-[8px] font-bold">MC</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button className="w-full border-2 border-dashed border-gray-200 py-4 text-gray-300 hover:border-brand-terracotta hover:text-brand-terracotta transition-all text-xs flex items-center justify-center gap-2 rounded-sm mt-4">
                                    <Scissors className="w-4 h-4" />
                                    + Asignar Tarea
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Global Stats Footer */}
                <div className="grid grid-cols-4 gap-8">
                    {[
                        { label: 'En Tiempo', value: '92%', icon: CheckCircle2, color: 'text-green-600' },
                        { label: 'Retrasos', value: '3', icon: AlertCircle, color: 'text-red-500' },
                        { label: 'Pruebas (Fittings) Hoy', value: '5', icon: Clock, color: 'text-blue-500' },
                        { label: 'Utilización Taller', value: '78%', icon: Scissors, color: 'text-brand-terracotta' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white p-6 border border-gray-100 flex items-center gap-4">
                            <stat.icon className={`w-8 h-8 ${stat.color}`} />
                            <div>
                                <p className="text-[10px] uppercase text-gray-400 tracking-widest">{stat.label}</p>
                                <p className="text-xl font-serif">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
