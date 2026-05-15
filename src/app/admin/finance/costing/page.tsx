'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Receipt, Save, RefreshCw } from 'lucide-react';

export default function CostingSimulator() {
    // Inputs
    const [garmentType, setGarmentType] = useState('Vestido de Novia');
    const [fixedCost, setFixedCost] = useState(349000);
    const [hoursEstimated, setHoursEstimated] = useState(15);
    const [hourlyRate, setHourlyRate] = useState(25000);
    const [materialsCost, setMaterialsCost] = useState(200000);
    const [extraCost, setExtraCost] = useState(0); // Pedrería, etc
    const [marginPercentage, setMarginPercentage] = useState(0); // 0 = sin margen sobre costo

    // Outputs
    const [laborCost, setLaborCost] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [suggestedPrice, setSuggestedPrice] = useState(0);

    // Calculate whenever inputs change
    useEffect(() => {
        const labor = hoursEstimated * hourlyRate;
        const total = labor + materialsCost + extraCost + fixedCost;
        const finalPrice = marginPercentage > 0 ? total / (1 - (marginPercentage / 100)) : total;

        setLaborCost(labor);
        setTotalCost(total);
        setSuggestedPrice(finalPrice);
    }, [fixedCost, hoursEstimated, hourlyRate, materialsCost, extraCost, marginPercentage]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <div className="min-h-screen bg-brand-sand/10 p-4 md:p-8 pt-20 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin/finance" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Volver a Finanzas
                        </Link>
                        <h1 className="font-serif text-3xl md:text-5xl text-brand-charcoal">Simulador ERP</h1>
                        <p className="text-text-secondary mt-2 text-sm md:text-base">Costeo real y cálculo de rentabilidad para prendas a medida.</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button 
                            onClick={() => {
                                setHoursEstimated(0);
                                setMaterialsCost(0);
                                setExtraCost(0);
                                setMarginPercentage(0);
                            }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 bg-white text-xs uppercase tracking-widest hover:border-brand-terracotta hover:text-brand-terracotta transition-all rounded-sm"
                        >
                            <RefreshCw className="w-4 h-4" /> Reset
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inputs Panel */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 1. Definición */}
                        <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                                <Calculator className="w-5 h-5 text-brand-terracotta" />
                                <h2 className="font-serif text-2xl">Parámetros de Producción</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Tipo de Prenda / Proyecto</label>
                                    <input 
                                        type="text" 
                                        value={garmentType}
                                        onChange={(e) => setGarmentType(e.target.value)}
                                        className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" 
                                        placeholder="Ej: Vestido de Novia"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Horas Estimadas de Trabajo</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={hoursEstimated || ''}
                                        onChange={(e) => setHoursEstimated(Number(e.target.value))}
                                        className="w-full border border-gray-200 px-4 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Tarifa por Hora (Mano de Obra)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={hourlyRate || ''}
                                            onChange={(e) => setHourlyRate(Number(e.target.value))}
                                            className="w-full border border-gray-200 pl-8 pr-4 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Costo Materiales Base</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={materialsCost || ''}
                                            onChange={(e) => setMaterialsCost(Number(e.target.value))}
                                            className="w-full border border-gray-200 pl-8 pr-4 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Costo Extras (Pedrería, etc)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={extraCost || ''}
                                            onChange={(e) => setExtraCost(Number(e.target.value))}
                                            className="w-full border border-gray-200 pl-8 pr-4 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Operacional y Margen */}
                        <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-100 space-y-6">
                            <h2 className="font-serif text-2xl border-b border-gray-100 pb-4">Estructura Operacional</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Costo Fijo Asignado (Atelier)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={fixedCost || ''}
                                            onChange={(e) => setFixedCost(Number(e.target.value))}
                                            className="w-full border border-gray-200 pl-8 pr-4 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" 
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 leading-tight mt-1">Porción de arriendo, luz, etc. asignada a este proyecto.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-terracotta">Margen de Ganancia (Opcional %)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            min="0"
                                            max="100"
                                            value={marginPercentage || ''}
                                            onChange={(e) => setMarginPercentage(Number(e.target.value))}
                                            className="w-full border border-gray-200 pl-4 pr-8 py-3 text-sm rounded-sm focus:outline-none focus:border-brand-terracotta transition-colors" 
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 leading-tight mt-1">Rentabilidad adicional sobre el costo total.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Receipt / Output Panel */}
                    <div className="bg-brand-charcoal text-white p-6 md:p-8 shadow-xl flex flex-col h-fit sticky top-24 rounded-sm">
                        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                            <Receipt className="w-6 h-6 text-brand-terracotta" />
                            <h2 className="font-serif text-2xl">Ficha de Costeo</h2>
                        </div>
                        
                        <div className="space-y-2 mb-8">
                            <p className="text-[10px] text-white/50 uppercase tracking-widest">Proyecto</p>
                            <p className="text-lg font-medium">{garmentType || 'Sin nombre'}</p>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="space-y-3 border-b border-white/10 pb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/70">Mano de Obra ({hoursEstimated}hrs)</span>
                                    <span>{formatCurrency(laborCost)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/70">Materiales & Extras</span>
                                    <span>{formatCurrency(materialsCost + extraCost)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/70">Costo Fijo (Operación)</span>
                                    <span>{formatCurrency(fixedCost)}</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center py-2">
                                <span className="text-[10px] uppercase tracking-widest text-white/50">Costo Real Base</span>
                                <span className="font-mono text-white/80">{formatCurrency(totalCost)}</span>
                            </div>

                            {marginPercentage > 0 && (
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-[10px] uppercase tracking-widest text-brand-terracotta font-bold">Margen Aplicado ({marginPercentage}%)</span>
                                    <span className="font-mono text-brand-terracotta">+{formatCurrency(suggestedPrice - totalCost)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-end pt-6 border-t border-white/20">
                                <span className="font-bold uppercase text-xs tracking-widest">Precio Sugerido</span>
                                <span className="text-4xl font-serif">{formatCurrency(suggestedPrice)}</span>
                            </div>
                        </div>

                        <button className="w-full bg-white text-brand-charcoal py-4 mt-8 text-xs uppercase tracking-widest font-bold hover:bg-brand-terracotta hover:text-white transition-all rounded-sm flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" /> Guardar Ficha
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
