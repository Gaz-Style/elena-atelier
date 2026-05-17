'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Plus, Search, Ruler, Info, Layers } from 'lucide-react';

export default function InventoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Mock data for initial professional look, but ready for DB connection
    const fabrics = [
        { id: 'FAB-001', name: 'Seda Habotai 8mm', type: 'Seda', composition: '100% Seda Natural', stock: 45.5, unit: 'm', color: 'Marfil' },
        { id: 'FAB-002', name: 'Lana Biella Super 120s', type: 'Lana', composition: '100% Lana Merino', stock: 12.0, unit: 'm', color: 'Azul Midnight' },
        { id: 'FAB-003', name: 'Encaje Chantilly Francés', type: 'Encaje', composition: 'Nylon/Rayon', stock: 5.2, unit: 'm', color: 'Blanco Invierno' },
        { id: 'FAB-004', name: 'Crepe de Chine', type: 'Seda', composition: '100% Seda', stock: 22.8, unit: 'm', color: 'Rosa Palo' },
    ];

    return (
        <div className="min-h-screen bg-brand-sand/10 p-4 md:p-8 pt-20 font-sans text-brand-charcoal">
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Volver al Dashboard
                        </Link>
                        <h1 className="font-serif text-5xl">Control de Inventario</h1>
                        <p className="text-text-secondary mt-2">Gestión de activos textiles y suministros críticos - Elena Atelier</p>
                    </div>
                    <button className="bg-brand-charcoal text-white px-8 py-3 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all flex items-center gap-2 shadow-lg">
                        <Plus className="w-4 h-4" /> Registrar Ingreso de Tela
                    </button>
                </header>

                <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-4 rounded-sm border border-gray-100 shadow-sm">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar tela, composición o color..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none outline-none text-sm rounded-sm focus:ring-1 focus:ring-brand-terracotta"
                        />
                    </div>
                    <div className="flex gap-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                        <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {fabrics.length} Variedades</span>
                        <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {fabrics.reduce((s,f) => s+f.stock, 0).toFixed(1)} Metros Totales</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {fabrics.map((fabric) => (
                        <div key={fabric.id} className="bg-white rounded-sm border border-gray-100 shadow-sm hover:border-brand-terracotta transition-all group overflow-hidden">
                            <div className="h-3 bg-gray-50 border-b border-gray-100" style={{ backgroundColor: fabric.color === 'Marfil' ? '#F5F5DC' : fabric.color === 'Azul Midnight' ? '#191970' : fabric.color === 'Blanco Invierno' ? '#F8F8FF' : '#E6E6FA' }}></div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-brand-terracotta">{fabric.type}</span>
                                    <span className="text-[8px] font-bold text-gray-300">ID: {fabric.id}</span>
                                </div>
                                <h3 className="font-serif text-lg leading-tight">{fabric.name}</h3>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 flex items-center gap-2"><Info className="w-3 h-3" /> {fabric.composition}</p>
                                    <p className="text-[10px] text-gray-400 flex items-center gap-2"><Package className="w-3 h-3" /> Color: {fabric.color}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold mb-1">Stock Disponible</p>
                                        <p className="text-2xl font-serif">{fabric.stock} {fabric.unit}</p>
                                    </div>
                                    <button className="p-2 text-gray-300 hover:text-brand-terracotta transition-colors">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Professional Tip */}
                <div className="bg-brand-charcoal text-white p-8 rounded-sm flex flex-col md:flex-row items-center gap-8 border-l-4 border-brand-terracotta">
                    <Ruler className="w-12 h-12 text-brand-terracotta opacity-50" />
                    <div className="flex-1">
                        <h3 className="font-serif text-xl mb-2">Trazabilidad de Activos</h3>
                        <p className="text-sm text-white/60">El control de inventario profesional te permite calcular el costo real de cada prenda (Escandallo) y asegurar que nunca te falten insumos críticos para tus clientas.</p>
                    </div>
                    <button className="px-6 py-3 border border-white/20 text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-brand-charcoal transition-all">Generar Reporte de Stock</button>
                </div>
            </div>
        </div>
    );
}
