'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Scissors, Search, Loader2, Plus, X, User } from 'lucide-react';
import { getProductionOrders, updateOrderStatus, createProductionOrder } from './actions';

export default function ProductionPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const stages = [
        { id: 'draft', label: 'Ingresado' },
        { id: 'cutting', label: 'Corte' },
        { id: 'sewing', label: 'Confección' },
        { id: 'finishing', label: 'Fitting / Prueba' },
        { id: 'ready', label: 'Final QC / Listo' }
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        setLoading(true);
        const data = await getProductionOrders();
        setOrders(data);
        setLoading(false);
    }

    async function handleStatusChange(id: string, newStatus: string) {
        const result = await updateOrderStatus(id, newStatus);
        if (result.success) {
            fetchOrders();
        }
    }

    const filteredOrders = orders.filter(o => 
        o.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customers?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-brand-sand/10 p-4 md:p-8 pt-20 font-sans text-brand-charcoal">
            <div className="max-w-screen-2xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Volver al Dashboard
                        </Link>
                        <h1 className="font-serif text-3xl md:text-5xl">Gobernanza de Producción</h1>
                        <p className="text-text-secondary mt-2 text-sm md:text-base">Control real de flujo artesanal - Atelier Elena</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Buscar órden o cliente..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 md:py-2 border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-brand-terracotta outline-none" 
                            />
                        </div>
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="bg-brand-charcoal text-white px-6 py-3 md:py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all whitespace-nowrap flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Nueva Órden
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-terracotta" />
                    </div>
                ) : (
                    <div className="flex overflow-x-auto snap-x md:grid md:grid-cols-5 gap-6 h-[700px] pb-4">
                        {stages.map(stage => (
                            <div key={stage.id} className="min-w-[300px] md:min-w-0 snap-center bg-white/40 p-4 border border-gray-100 flex flex-col rounded-sm">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
                                    <h3 className="font-serif text-lg">{stage.label}</h3>
                                    <span className="text-[10px] bg-white px-2 py-1 border border-gray-100 rounded-full font-bold">
                                        {filteredOrders.filter(o => o.status === stage.id).length}
                                    </span>
                                </div>

                                <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                    {filteredOrders.filter(o => o.status === stage.id).map(order => (
                                        <div key={order.id} className="bg-white p-6 shadow-sm border border-gray-100 hover:border-brand-terracotta transition-all group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">#{order.id.slice(0, 8)}</span>
                                                <div className="flex gap-1">
                                                    <select 
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className="text-[8px] uppercase tracking-widest font-bold bg-gray-50 border-none outline-none focus:ring-0 cursor-pointer"
                                                        value={order.status}
                                                    >
                                                        {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <h4 className="font-serif text-sm mb-1">{order.description}</h4>
                                            <p className="text-xs text-text-secondary mb-4 flex items-center gap-1">
                                                <User className="w-3 h-3" /> {order.customers?.full_name || 'Sin cliente'}
                                            </p>

                                            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    {order.deadline ? new Date(order.deadline).toLocaleDateString('es-CL') : 'Sin fecha'}
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-brand-sand border border-white flex items-center justify-center text-[8px] font-bold">ER</div>
                                            </div>
                                        </div>
                                    ))}

                                    <button 
                                        onClick={() => setIsAdding(true)}
                                        className="w-full border-2 border-dashed border-gray-200 py-6 text-gray-300 hover:border-brand-terracotta hover:text-brand-terracotta transition-all text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded-sm mt-4"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Mover/Añadir aquí
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Order Modal (Simplified for now) */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="font-serif text-xl">Nueva Órden de Trabajo</h2>
                            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-brand-terracotta">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 text-center">
                            <AlertCircle className="w-12 h-12 text-brand-terracotta mx-auto mb-4" />
                            <p className="text-sm text-gray-500 italic">Las órdenes de producción profesionales se generan automáticamente desde el **Punto de Venta (POS)** al concretar un presupuesto.</p>
                            <div className="flex flex-col gap-3">
                                <Link href="/admin/pos" className="bg-brand-charcoal text-white py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all">Ir al POS para crear órden</Link>
                                <button onClick={() => setIsAdding(false)} className="py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
