'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Search, Tag, DollarSign, Package, Loader2, CheckCircle2, X, Clock, Scissors, TrendingUp, AlertCircle, Calculator, ChevronRight, Edit3 } from 'lucide-react';
import { getCatalog, addCatalogItem, deleteCatalogItem, getCostStructure, updateCatalogItem } from './actions';

export default function CatalogManager() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [costSettings, setCostSettings] = useState<any>(null);

    // Form Temporary State for Real-time Calculation
    const [tempTime, setTempTime] = useState(0);
    const [tempMaterials, setTempMaterials] = useState(0);
    const [suggestedPrice, setSuggestedPrice] = useState(0);

    useEffect(() => {
        fetchCatalog();
        getCostStructure().then(setCostSettings);
    }, []);

    // Recalculate suggested price in modal
    useEffect(() => {
        if (costSettings) {
            const laborCost = (tempTime / 60) * costSettings.labor_hourly_rate;
            const subtotal = laborCost + tempMaterials;
            const marginAmount = subtotal * (costSettings.default_margin_percentage / 100);
            const total = Math.round(subtotal + marginAmount);
            setSuggestedPrice(total);
        }
    }, [tempTime, tempMaterials, costSettings]);

    async function fetchCatalog() {
        setLoading(true);
        const data = await getCatalog();
        const sorted = data.sort((a: any, b: any) => {
            if (a.category !== b.category) return a.category.localeCompare(b.category);
            return a.name.localeCompare(b.name);
        });
        setItems(sorted);
        setLoading(false);
    }

    const openAddModal = () => {
        setEditingItem(null);
        setTempTime(0);
        setTempMaterials(0);
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        setTempTime(item.production_time_minutes || 0);
        setTempMaterials(item.material_cost || 0);
        setIsModalOpen(true);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaveStatus('idle');
        const formData = new FormData(e.currentTarget);
        formData.append('suggested_price', suggestedPrice.toString());
        
        let result;
        if (editingItem) {
            result = await updateCatalogItem(editingItem.id, formData);
        } else {
            result = await addCatalogItem(formData);
        }
        
        if (result.success) {
            setSaveStatus('success');
            setTimeout(() => {
                setIsModalOpen(false);
                setSaveStatus('idle');
                fetchCatalog();
            }, 1000);
        } else {
            setSaveStatus('error');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Está seguro de eliminar este ítem?')) return;
        const result = await deleteCatalogItem(id);
        if (result.success) fetchCatalog();
    }

    const calculateLiveSuggestion = (time: number, materials: number) => {
        if (!costSettings) return 0;
        const laborCost = (time / 60) * costSettings.labor_hourly_rate;
        const subtotal = laborCost + materials;
        const marginAmount = subtotal * (costSettings.default_margin_percentage / 100);
        return Math.round(subtotal + marginAmount);
    };

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = [...new Set(filteredItems.map(item => item.category))];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20 font-sans text-brand-charcoal">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Volver al Dashboard
                        </Link>
                        <h1 className="font-serif text-5xl tracking-tighter uppercase leading-none">Catálogo Maestro</h1>
                        <p className="text-gray-400 mt-2 italic font-serif text-lg">Auditoría y Gestión de Precios Inteligente</p>
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="bg-brand-charcoal text-white px-10 py-4 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all flex items-center gap-2 shadow-2xl"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Servicio
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="bg-brand-terracotta/10 p-3 rounded-full"><Tag className="w-5 h-5 text-brand-terracotta" /></div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Total Servicios</p>
                            <p className="text-2xl font-serif">{items.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="bg-green-50 p-3 rounded-full"><TrendingUp className="w-5 h-5 text-green-500" /></div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Tarifa Configurada</p>
                            <p className="text-2xl font-serif">${costSettings?.labor_hourly_rate?.toLocaleString('es-CL')}/hr</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="bg-amber-50 p-3 rounded-full"><AlertCircle className="w-5 h-5 text-amber-500" /></div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Alertas de Margen</p>
                            <p className="text-2xl font-serif">
                                {items.filter(i => i.price < calculateLiveSuggestion(i.production_time_minutes, i.material_cost)).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Buscar servicio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 outline-none text-sm rounded-sm focus:ring-1 focus:ring-brand-terracotta shadow-sm transition-all"
                    />
                </div>

                {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-brand-terracotta" />
                    </div>
                ) : (
                    <div className="space-y-12 pb-20">
                        {categories.map((cat) => (
                            <section key={cat} className="space-y-4">
                                <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-terracotta bg-white px-6 py-3 rounded-sm border border-gray-100 inline-block">
                                    {cat}
                                </h2>
                                <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 text-[9px] uppercase tracking-widest font-bold text-gray-400 border-b border-gray-100">
                                                <th className="px-8 py-5 w-1/2">Servicio</th>
                                                <th className="px-8 py-5">Tiempo</th>
                                                <th className="px-8 py-5">Evaluación ERP</th>
                                                <th className="px-8 py-5 text-right">Precio Actual</th>
                                                <th className="px-8 py-5 w-32">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredItems.filter(item => item.category === cat).map((item) => {
                                                const suggestion = calculateLiveSuggestion(item.production_time_minutes, item.material_cost);
                                                const isUnderpriced = item.price < suggestion;
                                                return (
                                                    <tr key={item.id} className={`group transition-colors ${isUnderpriced ? 'bg-amber-50/30' : 'hover:bg-gray-50'}`}>
                                                        <td className="px-8 py-6">
                                                            <div className="flex flex-col">
                                                                <span className="font-serif text-lg text-brand-charcoal">{item.name}</span>
                                                                <span className="text-[11px] text-gray-400 font-light mt-1">{item.description || 'Sin descripción.'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                                <Clock className="w-3.5 h-3.5 text-gray-300" />
                                                                {item.production_time_minutes} min
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[10px] font-bold text-gray-300 italic">Sugerido: ${suggestion.toLocaleString('es-CL')}</span>
                                                                {isUnderpriced && (
                                                                    <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase tracking-tighter animate-pulse">
                                                                        <AlertCircle className="w-3 h-3" /> Rentabilidad Baja
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <span className={`font-serif text-2xl tracking-tighter ${isUnderpriced ? 'text-amber-700' : 'text-brand-charcoal'}`}>
                                                                ${item.price.toLocaleString('es-CL')}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => openEditModal(item)} className="p-2 text-gray-300 hover:text-brand-terracotta hover:bg-brand-terracotta/5 rounded-full transition-all"><Edit3 className="w-4 h-4" /></button>
                                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><Trash2 className="w-4 h-4" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        ))}
                    </div>
                )}

                {isModalOpen && (
                    <div className="fixed inset-0 bg-brand-charcoal/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-sm shadow-2xl w-full max-w-5xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-200">
                            <div className="grid md:grid-cols-12">
                                <div className="md:col-span-7 p-12 space-y-10">
                                    <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                                        <div>
                                            <h2 className="font-serif text-3xl tracking-tighter uppercase">{editingItem ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">Configuración Comercial</p>
                                        </div>
                                        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-brand-terracotta"><X className="w-8 h-8" /></button>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-500">Nombre</label>
                                                <input name="name" defaultValue={editingItem?.name} required type="text" className="w-full p-4 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-brand-terracotta text-sm rounded-sm" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-500">Categoría</label>
                                                <select name="category" defaultValue={editingItem?.category || 'Bastas'} className="w-full p-4 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-brand-terracotta text-sm rounded-sm appearance-none">
                                                    <option value="Bastas">Bastas (Ajustes Rápidos)</option>
                                                    <option value="Sastrería">Sastrería y Compostura</option>
                                                    <option value="Gala">Vestidos de Gala</option>
                                                    <option value="Novias">Novias y Alta Costura</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4 text-brand-terracotta" /> Tiempo (Minutos)</label>
                                                <input name="production_time_minutes" required type="number" defaultValue={editingItem?.production_time_minutes} onChange={(e) => setTempTime(Number(e.target.value))} className="w-full p-4 bg-brand-sand/10 border-none outline-none focus:ring-1 focus:ring-brand-terracotta text-xl font-serif rounded-sm font-bold" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-500 flex items-center gap-2"><Scissors className="w-4 h-4 text-brand-terracotta" /> Insumos ($)</label>
                                                <input name="material_cost" type="number" defaultValue={editingItem?.material_cost} onChange={(e) => setTempMaterials(Number(e.target.value))} className="w-full p-4 bg-brand-sand/10 border-none outline-none focus:ring-1 focus:ring-brand-terracotta text-xl font-serif rounded-sm font-bold" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-500">Descripción</label>
                                            <textarea name="description" defaultValue={editingItem?.description} rows={2} className="w-full p-4 bg-gray-50 border-none outline-none focus:ring-1 focus:ring-brand-terracotta text-sm rounded-sm resize-none" />
                                        </div>
                                        <div className="pt-6 border-t border-gray-100">
                                            <label className="block text-[11px] uppercase tracking-widest font-bold text-brand-charcoal mb-4">Precio Final de Venta</label>
                                            <div className="relative group">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-charcoal font-serif text-3xl font-bold">$</span>
                                                <input name="price" required type="number" defaultValue={editingItem?.price} placeholder={suggestedPrice.toString()} className="w-full pl-14 p-8 bg-brand-terracotta/5 border-2 border-brand-terracotta/10 outline-none focus:border-brand-terracotta text-5xl font-serif rounded-sm text-brand-charcoal font-bold transition-all" />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-brand-charcoal text-white py-6 text-xs uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all shadow-xl flex items-center justify-center gap-3 rounded-sm">
                                            {saveStatus === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                                            {saveStatus === 'success' ? 'SINCRONIZADO' : 'GUARDAR CAMBIOS'}
                                        </button>
                                    </form>
                                </div>
                                <div className="md:col-span-5 bg-brand-charcoal text-white p-12 flex flex-col justify-between">
                                    <div className="space-y-12">
                                        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                                            <Calculator className="w-6 h-6 text-brand-terracotta" />
                                            <div><h3 className="text-xs uppercase tracking-widest font-bold">Evaluador de Precios</h3></div>
                                        </div>
                                        <div className="space-y-8">
                                            <div className="flex justify-between items-center text-sm"><span className="text-white/40 uppercase tracking-widest text-[10px]">Mano de Obra</span><span className="font-serif text-xl">${Math.round((tempTime / 60) * (costSettings?.labor_hourly_rate || 0)).toLocaleString('es-CL')}</span></div>
                                            <div className="flex justify-between items-center text-sm"><span className="text-white/40 uppercase tracking-widest text-[10px]">Insumos</span><span className="font-serif text-xl">${tempMaterials.toLocaleString('es-CL')}</span></div>
                                            <div className="flex justify-between items-center pt-8 border-t border-white/5"><span className="text-white/40 uppercase tracking-widest text-[10px]">Margen (+{costSettings?.default_margin_percentage}%)</span><span className="font-serif text-xl text-green-400">+${Math.round(((tempTime/60*costSettings?.labor_hourly_rate)+tempMaterials)*(costSettings?.default_margin_percentage/100)).toLocaleString('es-CL')}</span></div>
                                        </div>
                                    </div>
                                    <div className="pt-12 border-t border-white/10">
                                        <p className="text-[10px] text-brand-terracotta font-bold uppercase tracking-widest mb-4">BASE FINANCIERA SUGERIDA</p>
                                        <h4 className="text-7xl font-serif tracking-tighter leading-none">${suggestedPrice.toLocaleString('es-CL')}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
