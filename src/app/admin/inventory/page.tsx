'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, Package, Plus, Search, Ruler, Info, Layers, 
    AlertTriangle, Loader2, X, Trash2, CheckCircle, Disc, Scissors, Tag, Wrench
} from 'lucide-react';
import { getInventoryItems, addInventoryItem, updateInventoryStock } from './actions';

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

    // Form State for new item
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'telas',
        stock: 0,
        unit: 'm',
        price: 0,
        color: '',
        composition: ''
    });

    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState(false);

    useEffect(() => {
        fetchInventory();
    }, []);

    // Set default unit based on selected category in form
    useEffect(() => {
        let defaultUnit = 'un';
        if (newItem.category === 'telas') defaultUnit = 'm';
        else if (newItem.category === 'hilos') defaultUnit = 'conos';
        else if (newItem.category === 'agujas') defaultUnit = 'cajas';
        
        setNewItem(prev => ({ ...prev, unit: defaultUnit }));
    }, [newItem.category]);

    async function fetchInventory() {
        setLoading(true);
        const data = await getInventoryItems();
        setItems(data || []);
        setLoading(false);
    }

    const categories = [
        { id: 'all', label: 'Todos los Activos', icon: Layers },
        { id: 'telas', label: 'Telas / Paños', icon: Ruler },
        { id: 'hilos', label: 'Hilos / Bobinas', icon: Disc },
        { id: 'agujas', label: 'Agujas / Alfileres', icon: Info },
        { id: 'fornituras', label: 'Botones y Cierres', icon: Tag },
        { id: 'herramientas', label: 'Tijeras y Herramientas', icon: Scissors }
    ];

    const isLowStock = (item: any) => {
        const stock = Number(item.stock || 0);
        if (item.category === 'telas') return stock <= 5;
        if (item.category === 'hilos') return stock <= 2;
        if (item.category === 'agujas') return stock <= 1;
        if (item.category === 'fornituras') return stock <= 10;
        return stock <= 1;
    };

    // Filter Items
    const filteredItems = items.filter(item => {
        // Category check
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        
        // Search term check (search by name, composition, color, or category)
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
            item.name.toLowerCase().includes(term) ||
            (item.composition || '').toLowerCase().includes(term) ||
            (item.color || '').toLowerCase().includes(term) ||
            (item.category || '').toLowerCase().includes(term);

        // Low stock filter check
        const matchesLowStock = !showLowStockOnly || isLowStock(item);

        return matchesCategory && matchesSearch && matchesLowStock;
    });

    // Quick stock adjustment (+ / -)
    async function handleQuickStockChange(id: string, currentStock: number, delta: number) {
        const newStock = Math.max(0, currentStock + delta);
        setIsUpdatingId(id);
        const res = await updateInventoryStock(id, newStock);
        if (res.success) {
            // Update local state instantly
            setItems(prev => prev.map(item => item.id === id ? { ...item, stock: newStock, stock_meters: item.category === 'telas' ? newStock : item.stock_meters } : item));
        }
        setIsUpdatingId(null);
    }

    // Handle form submit
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError('');
        setFormSuccess(false);

        if (!newItem.name.trim()) {
            setFormError('El nombre del insumo es obligatorio.');
            return;
        }

        setLoading(true);
        const res = await addInventoryItem({
            name: newItem.name,
            category: newItem.category,
            stock: Number(newItem.stock),
            unit: newItem.unit,
            price: Number(newItem.price),
            color: newItem.color,
            composition: newItem.composition
        });

        if (res.success) {
            setFormSuccess(true);
            setNewItem({
                name: '',
                category: 'telas',
                stock: 0,
                unit: 'm',
                price: 0,
                color: '',
                composition: ''
            });
            await fetchInventory();
            setTimeout(() => {
                setIsAdding(false);
                setFormSuccess(false);
            }, 1000);
        } else {
            setFormError(res.error || 'Ocurrió un error al guardar el insumo.');
        }
        setLoading(false);
    }

    const getCategoryBadgeColor = (cat: string) => {
        switch (cat) {
            case 'telas': return 'bg-blue-50 text-blue-700 border-blue-150';
            case 'hilos': return 'bg-purple-50 text-purple-700 border-purple-150';
            case 'agujas': return 'bg-amber-50 text-amber-700 border-amber-150';
            case 'fornituras': return 'bg-rose-50 text-rose-700 border-rose-150';
            default: return 'bg-gray-50 text-gray-700 border-gray-150';
        }
    };

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'telas': return Ruler;
            case 'hilos': return Disc;
            case 'agujas': return Info;
            case 'fornituras': return Tag;
            default: return Wrench;
        }
    };

    return (
        <div className="min-h-screen bg-brand-sand/10 p-4 md:p-8 pt-20 font-sans text-brand-charcoal animate-in fade-in duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Volver al Dashboard
                        </Link>
                        <h1 className="font-serif text-3xl md:text-5xl">Control de Inventario</h1>
                        <p className="text-text-secondary mt-2 text-sm">Gestión integral de telas, hilos, agujas, cierres, botones y herramientas del taller.</p>
                    </div>
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="bg-brand-charcoal text-white px-8 py-3 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> Registrar Insumo / Tela
                    </button>
                </header>

                {/* Categories Tabs Selector */}
                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        const isActive = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-5 py-3 rounded-sm text-[10px] uppercase tracking-widest font-bold border transition-all whitespace-nowrap flex items-center gap-2 ${
                                    isActive 
                                        ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-sm' 
                                        : 'bg-white text-gray-400 border-gray-100 hover:text-brand-charcoal hover:border-gray-300'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-sm border border-gray-100 shadow-sm">
                    
                    {/* Search Field */}
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, color, material..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none outline-none text-sm rounded-sm focus:ring-1 focus:ring-brand-terracotta text-brand-charcoal"
                        />
                    </div>

                    {/* Low Stock Toggle checkbox */}
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                checked={showLowStockOnly}
                                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                                className="w-4 h-4 border-gray-300 rounded text-brand-terracotta focus:ring-brand-terracotta"
                            />
                            <span>⚠️ Solo Stock Bajo / Crítico</span>
                        </label>

                        <div className="flex gap-4 text-[10px] uppercase tracking-widest font-bold text-gray-400 border-l border-gray-100 pl-6">
                            <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {filteredItems.length} Insumos</span>
                            <span className="flex items-center gap-1 text-rose-600 font-bold"><AlertTriangle className="w-3.5 h-3.5" /> {items.filter(isLowStock).length} Alertas</span>
                        </div>
                    </div>
                </div>

                {loading && items.length === 0 ? (
                    <div className="h-96 flex items-center justify-center bg-white border border-gray-100 rounded-sm">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-terracotta" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-24 bg-white border border-gray-100 rounded-sm">
                        <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="font-serif text-xl text-gray-400">Sin resultados</h3>
                        <p className="text-xs text-gray-300 mt-1">No encontramos ningún insumo que coincida con tus filtros de búsqueda.</p>
                    </div>
                ) : (
                    /* General Inventory Cards Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredItems.map(item => {
                            const isLow = isLowStock(item);
                            const Icon = getCategoryIcon(item.category);
                            
                            return (
                                <div 
                                    key={item.id} 
                                    className={`bg-white rounded-sm border transition-all overflow-hidden flex flex-col justify-between hover:shadow-md ${
                                        isLow ? 'border-rose-200 ring-1 ring-rose-50' : 'border-gray-100'
                                    }`}
                                >
                                    {/* Color stripe or top decorator */}
                                    <div 
                                        className="h-3 border-b border-gray-100/50" 
                                        style={{ 
                                            backgroundColor: item.color 
                                                ? (item.color.toLowerCase() === 'marfil' ? '#F5F5DC' 
                                                  : item.color.toLowerCase() === 'azul midnight' ? '#191970' 
                                                  : item.color.toLowerCase() === 'blanco invierno' ? '#F8F8FF' 
                                                  : item.color.toLowerCase() === 'negro' ? '#1A1A1A'
                                                  : item.color.toLowerCase() === 'rojo' ? '#DC143C'
                                                  : item.color.toLowerCase() === 'rosa palo' ? '#FFD1DC'
                                                  : '#E6E6FA')
                                                : '#F5F5F0'
                                        }}
                                    />
                                    
                                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-3">
                                            
                                            {/* Tag and ID */}
                                            <div className="flex justify-between items-center">
                                                <span className={`text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm border ${getCategoryBadgeColor(item.category)}`}>
                                                    {item.category === 'telas' ? 'Tela' :
                                                     item.category === 'hilos' ? 'Hilo' :
                                                     item.category === 'agujas' ? 'Aguja' :
                                                     item.category === 'fornituras' ? 'Avío / Botón' : 'Herramienta'}
                                                </span>
                                                <span className="text-[8px] font-mono text-gray-300 font-bold">#{item.id.slice(0, 6)}</span>
                                            </div>

                                            <h3 className="font-serif text-lg leading-snug text-brand-charcoal font-medium">{item.name}</h3>

                                            <div className="space-y-1 text-[11px] text-text-secondary">
                                                {item.composition && (
                                                    <p className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-gray-400" /> {item.composition}</p>
                                                )}
                                                {item.color && (
                                                    <p className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-gray-400" /> Color: {item.color}</p>
                                                )}
                                                {item.price > 0 && (
                                                    <p className="flex items-center gap-1.5"><span className="text-xs text-gray-400 font-bold">$</span> Costo: ${item.price} x {item.unit}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-50 space-y-3">
                                            {/* Low Stock Warning */}
                                            {isLow && (
                                                <div className="bg-rose-50 text-[9px] font-bold text-rose-700 uppercase tracking-widest px-2.5 py-1 rounded-sm border border-rose-100 flex items-center gap-1 animate-pulse">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                                    Stock Crítico / Bajo
                                                </div>
                                            )}

                                            {/* Stock Indicator and Increments */}
                                            <div className="flex justify-between items-center bg-gray-50/50 p-2 border border-gray-100 rounded-sm">
                                                <div>
                                                    <p className="text-[7px] uppercase tracking-widest text-gray-400 font-bold">Stock Disponible</p>
                                                    <p className="text-xl font-serif text-brand-charcoal">{item.stock} <span className="text-xs font-sans text-gray-400">{item.unit}</span></p>
                                                </div>

                                                {/* Increment Decrement Controls */}
                                                <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden bg-white shadow-sm">
                                                    <button 
                                                        disabled={isUpdatingId !== null}
                                                        onClick={() => handleQuickStockChange(item.id, Number(item.stock), -1)}
                                                        className="p-1 px-2.5 text-sm font-bold text-gray-400 hover:text-brand-terracotta hover:bg-gray-50 transition-colors border-r border-gray-100 disabled:opacity-50"
                                                    >
                                                        -
                                                    </button>
                                                    
                                                    {isUpdatingId === item.id ? (
                                                        <div className="p-1 px-1.5 bg-gray-50">
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-terracotta" />
                                                        </div>
                                                    ) : (
                                                        <span className="px-2 text-[10px] font-bold text-brand-charcoal">{item.stock}</span>
                                                    )}

                                                    <button 
                                                        disabled={isUpdatingId !== null}
                                                        onClick={() => handleQuickStockChange(item.id, Number(item.stock), 1)}
                                                        className="p-1 px-2.5 text-sm font-bold text-gray-400 hover:text-brand-terracotta hover:bg-gray-50 transition-colors border-l border-gray-100 disabled:opacity-50"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Professional Tip Section */}
                <div className="bg-brand-charcoal text-white p-8 rounded-sm flex flex-col md:flex-row items-center gap-8 border-l-4 border-brand-terracotta animate-in fade-in duration-500">
                    <Ruler className="w-12 h-12 text-brand-terracotta opacity-50" />
                    <div className="flex-1">
                        <h3 className="font-serif text-xl mb-2">Escandallo y Rentabilidad del Atelier</h3>
                        <p className="text-sm text-white/60">Registrar todos tus insumos (desde agujas hasta cierres invisibles) te permite cuantificar el costo real de producción de tus prendas exclusivas y evitar detenciones inesperadas en el taller.</p>
                    </div>
                </div>
            </div>

            {/* REGISTER INSUMO MODAL */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-350">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-8 duration-350">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="font-serif text-xl flex items-center gap-2"><Package className="w-5 h-5 text-brand-terracotta" /> Registrar Nuevo Insumo</h2>
                            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-brand-terracotta transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                            
                            {formError && (
                                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-sm font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                                    {formError}
                                </div>
                            )}

                            {formSuccess && (
                                <div className="p-4 bg-green-50 border border-green-150 text-green-700 text-xs rounded-sm font-bold flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    ¡Insumo registrado correctamente en el Atelier!
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name */}
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block">Nombre del Insumo *</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Ej: Encaje Chantilly Francés, Agujas Schmetz 90/14..."
                                        value={newItem.name}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full p-2.5 border border-gray-200 outline-none text-xs rounded-sm focus:border-brand-terracotta"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block">Categoría</label>
                                    <select 
                                        value={newItem.category}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full p-2.5 border border-gray-200 bg-white outline-none text-xs rounded-sm focus:border-brand-terracotta"
                                    >
                                        <option value="telas">Telas / Paños</option>
                                        <option value="hilos">Hilos / Bobinas</option>
                                        <option value="agujas">Agujas / Alfileres</option>
                                        <option value="fornituras">Botones, Cierres y Avíos</option>
                                        <option value="herramientas">Herramientas / Tijeras</option>
                                    </select>
                                </div>

                                {/* Color */}
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block">Color (Si aplica)</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Negro, Blanco Invierno, Marfil..."
                                        value={newItem.color}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, color: e.target.value }))}
                                        className="w-full p-2.5 border border-gray-200 outline-none text-xs rounded-sm focus:border-brand-terracotta"
                                    />
                                </div>

                                {/* Stock Inicial */}
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block">Stock Inicial ({newItem.unit})</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="any"
                                        value={newItem.stock}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, stock: Number(e.target.value) }))}
                                        className="w-full p-2.5 border border-gray-200 outline-none text-xs rounded-sm focus:border-brand-terracotta"
                                    />
                                </div>

                                {/* Unit */}
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block">Unidad de Medida</label>
                                    <input 
                                        type="text" 
                                        placeholder="m, conos, un, cajas..."
                                        value={newItem.unit}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                                        className="w-full p-2.5 border border-gray-200 outline-none text-xs rounded-sm focus:border-brand-terracotta"
                                    />
                                </div>

                                {/* Cost Price */}
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block">Costo Unitario ($ CLP)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        placeholder="Costo por unidad o metro"
                                        value={newItem.price}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                                        className="w-full p-2.5 border border-gray-200 outline-none text-xs rounded-sm focus:border-brand-terracotta"
                                    />
                                </div>

                                {/* Composition */}
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block">Composición / Notas</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: 100% Algodón, Metal Niquelado..."
                                        value={newItem.composition}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, composition: e.target.value }))}
                                        className="w-full p-2.5 border border-gray-200 outline-none text-xs rounded-sm focus:border-brand-terracotta"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-150">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAdding(false)}
                                    className="px-6 py-3 border border-gray-200 text-gray-400 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-all rounded-sm"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="px-8 py-3 bg-brand-charcoal text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all rounded-sm flex items-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Guardar Insumo'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
