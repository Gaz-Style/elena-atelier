'use client';

import React from 'react';
import { TrendingUp, Users, Receipt, DollarSign } from 'lucide-react';

export default function FinanceDashboard() {
    const metrics = [
        { title: 'Ventas Netas', value: '$4.250.000', icon: DollarSign, trend: '+12%', color: 'text-green-600' },
        { title: 'Gastos Operativos', value: '$1.800.000', icon: TrendingUp, trend: '-5%', color: 'text-red-500' },
        { title: 'IVA por Pagar (19%)', value: '$807.500', icon: Receipt, trend: 'Calculado', color: 'text-brand-terracotta' },
        { title: 'Personal (Buk)', value: '8 Activos', icon: Users, trend: 'Sincronizado', color: 'text-blue-600' },
    ];

    return (
        <div className="min-h-screen bg-brand-sand/20 p-8 pt-24 font-sans">
            <div className="max-w-7xl mx-auto space-y-12">
                <header className="flex justify-between items-end border-b border-gray-200 pb-8">
                    <div>
                        <h1 className="font-serif text-5xl">Dashboard Financiero</h1>
                        <p className="text-text-secondary mt-2">Control de ingresos, egresos e impuestos - elenalacosturera</p>
                    </div>
                    <div className="space-x-4">
                        <button className="px-6 py-2 border border-brand-charcoal text-xs uppercase tracking-widest hover:bg-brand-charcoal hover:text-white transition-all">
                            Exportar Informe SII
                        </button>
                    </div>
                </header>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {metrics.map((m) => (
                        <div key={m.title} className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                            <div className="flex justify-between items-start">
                                <m.icon className={`w-5 h-5 ${m.color}`} />
                                <span className="text-[10px] bg-gray-50 px-2 py-1 rounded-full text-gray-400 font-medium uppercase tracking-tighter">
                                    {m.trend}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">{m.title}</p>
                                <p className="text-2xl font-serif">{m.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {/* Sales chart placeholder */}
                    <div className="md:col-span-2 bg-white p-10 h-[400px] border border-gray-100 flex flex-col">
                        <h2 className="font-serif text-2xl mb-8">Rendimiento Mensual vs Objetivos</h2>
                        <div className="flex-1 bg-brand-sand/10 rounded-sm border border-dashed border-gray-200 flex items-center justify-center italic text-text-secondary">
                            Visualización de Gráfico Proyectada (Mercado Pago Sync)
                        </div>
                    </div>

                    {/* Tax summary list */}
                    <div className="bg-brand-charcoal text-white p-10 flex flex-col">
                        <h2 className="font-serif text-2xl mb-8">Resumen Tributario</h2>
                        <div className="space-y-6 flex-1">
                            <div className="flex justify-between border-b border-white/10 pb-4">
                                <span className="text-white/60 text-sm">IVA Débito</span>
                                <span>$1.200.000</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-4">
                                <span className="text-white/60 text-sm">IVA Crédito</span>
                                <span>$392.500</span>
                            </div>
                            <div className="flex justify-between pt-4">
                                <span className="font-medium text-brand-terracotta uppercase text-xs tracking-widest">Saldo F29 a Pagar</span>
                                <span className="text-xl font-serif">$807.500</span>
                            </div>
                        </div>
                        <button className="w-full bg-white text-brand-charcoal py-4 mt-8 text-xs uppercase tracking-widest hover:bg-brand-terracotta hover:text-white transition-all">
                            Generar Boletas SimpleAPI
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
