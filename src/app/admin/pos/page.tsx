'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, User, Search, CreditCard, Tag, X, Plus } from 'lucide-react';

export default function POSPage() {
    const [cart, setCart] = useState<any[]>([]);
    const products = [
        { id: 1, name: 'Restauración Técnia - Abrigo', price: 120000, category: 'Servicio' },
        { id: 2, name: 'Sastrería a Medida - Pantalón', price: 180000, category: 'Confección' },
        { id: 3, name: 'Ajuste de Calce - Vestido', price: 45000, category: 'Servicio' },
        { id: 4, name: 'Botones Vintage (Set)', price: 15000, category: 'Suministro' },
    ];

    const addToCart = (p: any) => setCart([...cart, p]);
    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [customOrderName, setCustomOrderName] = useState('');
    const [customOrderCategory, setCustomOrderCategory] = useState('Confección');
    
    // ERP Costing States
    const [hoursEstimated, setHoursEstimated] = useState<number>(0);
    const [hourlyRate, setHourlyRate] = useState<number>(25000);
    const [materialsCost, setMaterialsCost] = useState<number>(0);
    const [extraCost, setExtraCost] = useState<number>(0);
    const [fixedCost, setFixedCost] = useState<number>(349000);
    const [marginPercentage, setMarginPercentage] = useState<number>(0);

    const laborCost = hoursEstimated * hourlyRate;
    const totalCost = laborCost + materialsCost + extraCost + fixedCost;
    const calculatedPrice = marginPercentage > 0 ? totalCost / (1 - (marginPercentage / 100)) : totalCost;

    const handleAddCustomOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customOrderName) return;
        
        addToCart({
            id: Date.now(),
            name: customOrderName,
            price: Math.round(calculatedPrice),
            category: customOrderCategory,
            costBreakdown: {
                labor: laborCost,
                materials: materialsCost + extraCost,
                fixed: fixedCost,
                margin: marginPercentage
            }
        });
        
        setCustomOrderName('');
        setCustomOrderCategory('Confección');
        setHoursEstimated(0);
        setMaterialsCost(0);
        setExtraCost(0);
        setMarginPercentage(0);
        setIsCustomModalOpen(false);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <>
        <div className={`min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans ${isBudgetModalOpen ? 'print:hidden' : ''}`}>
            {/* Product Selection Area */}
            <div className="flex-1 p-4 md:p-8 pt-20 space-y-8 overflow-y-auto">
                <div className="mb-4">
                    <Link href="/admin" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 w-fit">
                        <ArrowLeft className="w-3 h-3" /> Volver al Dashboard
                    </Link>
                </div>
                <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 md:p-6 rounded-sm shadow-sm border border-gray-100">
                    <div className="relative w-full flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar producto o servicio..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none outline-none text-sm rounded-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 ml-0 md:ml-8 w-full md:w-auto justify-between md:justify-end">
                        <button
                            onClick={() => setIsCustomModalOpen(true)}
                            className="flex items-center gap-2 bg-brand-charcoal text-white px-4 py-2 rounded-sm text-[10px] md:text-xs uppercase tracking-widest hover:bg-brand-terracotta transition-all whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Orden
                        </button>
                        <div className="flex gap-2">
                            <div className="bg-brand-sand/30 p-2 rounded-sm cursor-pointer hover:bg-brand-sand transition-all">
                                <Tag className="w-5 h-5 text-brand-terracotta" />
                            </div>
                            <div className="bg-brand-sand/30 p-2 rounded-sm cursor-pointer hover:bg-brand-sand transition-all">
                                <User className="w-5 h-5 text-brand-terracotta" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {products.map(p => (
                        <div
                            key={p.id}
                            onClick={() => addToCart(p)}
                            className="bg-white p-6 rounded-sm border border-gray-100 hover:border-brand-terracotta transition-all cursor-pointer shadow-sm group"
                        >
                            <span className="text-[10px] uppercase tracking-tighter text-brand-terracotta font-bold mb-2 block">{p.category}</span>
                            <h3 className="font-serif text-lg mb-4">{p.name}</h3>
                            <p className="text-xl font-medium">${p.price.toLocaleString('es-CL')}</p>
                            <div className="mt-4 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase font-bold tracking-widest text-brand-charcoal">
                                + Agregar al pedido
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart Summary & Checkout */}
            <div className="w-full lg:w-[450px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-6 md:p-8 pt-8 md:pt-24 shadow-2xl flex flex-col h-[500px] lg:h-auto">
                <div className="flex items-center gap-3 mb-8">
                    <ShoppingCart className="w-6 h-6 text-brand-charcoal" />
                    <h2 className="font-serif text-2xl">Pedido Actual</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {cart.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 italic text-sm text-center">
                            Seleccione productos para comenzar el cobro en Tabancura.
                        </div>
                    ) : (
                        cart.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-sm group relative">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{item.name}</p>
                                        {item.costBreakdown && (
                                            <span className="bg-brand-charcoal text-white px-1.5 py-0.5 rounded-[2px] text-[8px] uppercase tracking-widest font-bold">ERP Costeado</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">${item.price.toLocaleString('es-CL')}</p>
                                </div>
                                <button onClick={() => removeFromCart(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 border-t border-gray-100 pt-8 space-y-4">
                    <div className="flex justify-between text-gray-400 text-sm">
                        <span>Subtotal</span>
                        <span>${Math.round(total / 1.19).toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm">
                        <span>IVA (19%)</span>
                        <span>${Math.round(total - (total / 1.19)).toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-serif pt-4">
                        <span>Total</span>
                        <span>${total.toLocaleString('es-CL')}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button className="flex items-center justify-center gap-2 border border-brand-charcoal py-4 text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">
                            <CreditCard className="w-4 h-4" />
                            Mercado Pago
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-brand-charcoal text-white py-4 text-[10px] uppercase tracking-widest hover:bg-brand-terracotta transition-all">
                            Efectivo / Transf
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 mt-4">
                        <button 
                            onClick={() => setIsBudgetModalOpen(true)}
                            disabled={cart.length === 0}
                            className="w-full border border-brand-charcoal text-brand-charcoal py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            Generar Presupuesto (PDF)
                        </button>
                        <button 
                            disabled={cart.length === 0}
                            className="w-full bg-green-600 text-white py-4 text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                            Cobrar y Emitir Boleta
                        </button>
                    </div>
                </div>
            </div>

            {/* ERP Custom Order Modal */}
            {isCustomModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-sm shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <div>
                                <h2 className="font-serif text-2xl text-brand-charcoal">Orden Especial / Alta Costura</h2>
                                <p className="text-xs text-gray-500 mt-1">Costeo ERP en tiempo real para mantener la rentabilidad del Atelier.</p>
                            </div>
                            <button onClick={() => setIsCustomModalOpen(false)} className="text-gray-400 hover:text-brand-terracotta">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
                            <form id="erp-form" onSubmit={handleAddCustomOrder} className="flex-1 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-brand-terracotta border-b border-gray-100 pb-2">1. Definición</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Nombre del Proyecto *</label>
                                            <input type="text" value={customOrderName} onChange={(e) => setCustomOrderName(e.target.value)} placeholder="Ej. Vestido Novia María" className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" required />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Categoría</label>
                                            <select value={customOrderCategory} onChange={(e) => setCustomOrderCategory(e.target.value)} className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta">
                                                <option value="Confección">Confección</option>
                                                <option value="Servicio">Servicio / Arreglo</option>
                                                <option value="Suministro">Suministro</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-brand-terracotta border-b border-gray-100 pb-2">2. Costos Directos</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Horas Estimadas</label>
                                            <input type="number" min="0" value={hoursEstimated || ''} onChange={(e) => setHoursEstimated(Number(e.target.value))} className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Tarifa por Hora ($)</label>
                                            <input type="number" min="0" value={hourlyRate || ''} onChange={(e) => setHourlyRate(Number(e.target.value))} className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Costo Materiales ($)</label>
                                            <input type="number" min="0" value={materialsCost || ''} onChange={(e) => setMaterialsCost(Number(e.target.value))} className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Extras / Pedrería ($)</label>
                                            <input type="number" min="0" value={extraCost || ''} onChange={(e) => setExtraCost(Number(e.target.value))} className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-brand-terracotta border-b border-gray-100 pb-2">3. Operación y Margen</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Costo Fijo Asignado ($)</label>
                                            <input type="number" min="0" value={fixedCost || ''} onChange={(e) => setFixedCost(Number(e.target.value))} className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Margen Ganancia (%)</label>
                                            <input type="number" min="0" max="100" value={marginPercentage || ''} onChange={(e) => setMarginPercentage(Number(e.target.value))} className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {/* Resumen Receipt */}
                            <div className="w-full md:w-72 bg-brand-charcoal text-white p-6 rounded-sm shadow-inner flex flex-col h-fit">
                                <h3 className="font-serif text-lg mb-6 border-b border-white/10 pb-4">Desglose (Ficha)</h3>
                                
                                <div className="space-y-4 text-sm flex-1">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Mano de Obra</span>
                                        <span>{formatCurrency(laborCost)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Insumos</span>
                                        <span>{formatCurrency(materialsCost + extraCost)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Costo Fijo</span>
                                        <span>{formatCurrency(fixedCost)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between pt-4 border-t border-white/10 text-white/80">
                                        <span className="text-xs uppercase tracking-widest">Costo Real</span>
                                        <span className="font-mono">{formatCurrency(totalCost)}</span>
                                    </div>

                                    {marginPercentage > 0 && (
                                        <div className="flex justify-between text-brand-terracotta text-xs font-bold pt-2">
                                            <span>Margen ({marginPercentage}%)</span>
                                            <span>+{formatCurrency(calculatedPrice - totalCost)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-4 border-t border-white/20">
                                    <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Precio Final Sugerido</p>
                                    <p className="text-3xl font-serif">{formatCurrency(calculatedPrice)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50">
                            <button type="button" onClick={() => setIsCustomModalOpen(false)} className="px-6 py-3 border border-gray-200 text-brand-charcoal text-xs uppercase tracking-widest font-bold hover:bg-white transition-all rounded-sm">
                                Cancelar
                            </button>
                            <button type="submit" form="erp-form" className="flex-1 py-3 bg-brand-charcoal text-white text-xs uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all rounded-sm">
                                Agregar Pedido al Carrito
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Printable Budget Modal */}
            {isBudgetModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:relative print:p-0 print:bg-white print:block">
                    <div className="bg-white rounded-sm shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col print:shadow-none print:max-h-none print:h-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 print:hidden">
                            <h2 className="font-serif text-2xl text-brand-charcoal">Vista Previa de Presupuesto</h2>
                            <div className="flex gap-4">
                                <button onClick={() => window.print()} className="bg-brand-charcoal text-white px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all rounded-sm">
                                    Imprimir / Guardar PDF
                                </button>
                                <button onClick={() => setIsBudgetModalOpen(false)} className="text-gray-400 hover:text-brand-terracotta">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Printable Area */}
                        <div id="printable-budget" className="p-8 md:p-12 overflow-y-auto flex-1 text-brand-charcoal bg-white print:p-0 print:overflow-visible">
                            <div className="flex justify-between items-start mb-12 border-b pb-8">
                                <div>
                                    <h1 className="font-serif text-3xl font-bold tracking-tight">ELENA ATELIER</h1>
                                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest text-[10px]">Alta Costura & Sastrería</p>
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                    <p className="font-bold text-brand-charcoal uppercase tracking-widest text-[10px] mb-1">Presupuesto Formal</p>
                                    <p>Fecha: {new Date().toLocaleDateString('es-CL')}</p>
                                    <p>Validez: 15 días</p>
                                </div>
                            </div>

                            <table className="w-full mb-12">
                                <thead>
                                    <tr className="border-b-2 border-brand-charcoal text-left uppercase tracking-widest text-[10px]">
                                        <th className="py-4 font-bold">Descripción</th>
                                        <th className="py-4 font-bold text-right">Categoría</th>
                                        <th className="py-4 font-bold text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item, i) => (
                                        <tr key={i} className="border-b border-gray-100 text-sm">
                                            <td className="py-4">
                                                <p className="font-medium">{item.name}</p>
                                                {item.costBreakdown && (
                                                    <p className="text-[10px] text-gray-400 mt-1">Confección a medida / Diseño personalizado</p>
                                                )}
                                            </td>
                                            <td className="py-4 text-right text-gray-500">{item.category}</td>
                                            <td className="py-4 text-right font-medium">{formatCurrency(item.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end mb-16">
                                <div className="w-64 space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Subtotal Neto</span>
                                        <span>{formatCurrency(Math.round(total / 1.19))}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>IVA (19%)</span>
                                        <span>{formatCurrency(Math.round(total - (total / 1.19)))}</span>
                                    </div>
                                    <div className="flex justify-between font-serif text-2xl pt-4 border-t-2 border-brand-charcoal font-bold">
                                        <span>TOTAL</span>
                                        <span>{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-[10px] text-gray-500 border-t pt-8 text-center mt-auto">
                                <p>Este documento es una cotización y no representa un comprobante de pago o boleta fiscal.</p>
                                <p className="mt-1">Para dar inicio al trabajo se requiere un abono del 50%. Los precios incluyen IVA.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}
