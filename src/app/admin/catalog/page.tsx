'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Search, Tag, DollarSign, Package, Loader2, CheckCircle2, X } from 'lucide-react';
import { getCatalog, addCatalogItem, deleteCatalogItem } from './actions';

export default function CatalogManager() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        fetchCatalog();
    }, []);

    async function fetchCatalog() {
        setLoading(true);
        const data = await getCatalog();
        setItems(data);
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaveStatus('idle');
        const formData = new FormData(e.currentTarget);
        const result = await addCatalogItem(formData);
        
        if (result.success) {
            setSaveStatus('success');
            setIsAdding(false);
            fetchCatalog();
            setTimeout(() => setSaveStatus('idle'), 3000);
        } else {
            setSaveStatus('error');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Está seguro de eliminar este ítem del catálogo?')) return;
        const result = await deleteCatalogItem(id);
        if (result.success) {
            fetchCatalog();
        }
    }

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-brand-sand/20 p-4 md:p-8 pt-20 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Volver al Dashboard
                        </Link>
                        <h1 className="font-serif text-5xl">Gestión de Catálogo</h1>
                        <p className="text-text-secondary mt-2">Administra los servicios, productos y precios del Atelier.</p>
                    </div>
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="bg-brand-charcoal text-white px-8 py-3 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all flex items-center gap-2 shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> Agregar Ítem
                    </button>
                </header>

                <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-4 rounded-sm border border-gray-100 shadow-sm">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar en el catálogo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none outline-none text-sm rounded-sm focus:ring-1 focus:ring-brand-terracotta"
                        />
                    </div>
                    <div className="flex gap-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {items.length} Ítems Totales</span>
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-terracotta" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-sm border border-gray-100 hover:border-brand-terracotta transition-all shadow-sm group relative">
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <span className="text-[10px] uppercase tracking-tighter text-brand-terracotta font-bold mb-2 block">{item.category}</span>
                                <h3 className="font-serif text-lg mb-2 pr-8">{item.name}</h3>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">{item.description || 'Sin descripción.'}</p>
                                <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-50">
                                    <p className="text-2xl font-serif">${item.price.toLocaleString('es-CL')}</p>
                                    <span className={`text-[8px] uppercase tracking-widest px-2 py-1 rounded-full ${item.active ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                        {item.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Modal */}
                {isAdding && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="font-serif text-xl">Nuevo Ítem de Catálogo</h2>
                                <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-brand-terracotta transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">Nombre del Servicio/Producto</label>
                                    <input name="name" required type="text" placeholder="Ej. Ajuste Vestido de Gala" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">Categoría</label>
                                    <select name="category" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta">
                                        <option value="Servicio">Servicio</option>
                                        <option value="Confección">Confección</option>
                                        <option value="Suministro">Suministro</option>
                                        <option value="Restauración">Restauración</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">Precio (CLP)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-serif">$</span>
                                        <input name="price" required type="number" placeholder="0" className="w-full pl-8 p-3 bg-gray-50 border border-gray-100 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">Descripción (Opcional)</label>
                                    <textarea name="description" rows={3} placeholder="Detalles del ítem..." className="w-full p-3 bg-gray-50 border border-gray-100 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta resize-none" />
                                </div>
                                <div className="pt-4 flex gap-4">
                                    <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:bg-gray-50 transition-all">Cancelar</button>
                                    <button type="submit" className="flex-1 bg-brand-charcoal text-white py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all shadow-lg flex items-center justify-center gap-2">
                                        {saveStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                                        {saveStatus === 'success' ? 'Guardado' : 'Guardar Ítem'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
