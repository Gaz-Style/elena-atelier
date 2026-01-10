'use client';

import React, { useState } from 'react';
import { ShoppingCart, User, Search, CreditCard, Tag, X } from 'lucide-react';

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

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Product Selection Area */}
            <div className="flex-1 p-8 pt-24 space-y-8 overflow-y-auto">
                <header className="flex justify-between items-center bg-white p-6 rounded-sm shadow-sm border border-gray-100">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar producto o servicio..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none outline-none text-sm rounded-sm"
                        />
                    </div>
                    <div className="flex items-center gap-4 ml-8">
                        <div className="bg-brand-sand/30 p-2 rounded-sm cursor-pointer hover:bg-brand-sand transition-all">
                            <Tag className="w-5 h-5 text-brand-terracotta" />
                        </div>
                        <div className="bg-brand-sand/30 p-2 rounded-sm cursor-pointer hover:bg-brand-sand transition-all">
                            <User className="w-5 h-5 text-brand-terracotta" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(p => (
                        <div
                            key={p.id}
                            onClick={() => addToCart(p)}
                            className="bg-white p-6 rounded-sm border border-gray-100 hover:border-brand-terracotta transition-all cursor-pointer shadow-sm group"
                        >
                            <span className="text-[10px] uppercase tracking-tighter text-brand-terracotta font-bold mb-2 block">{p.category}</span>
                            <h3 className="font-serif text-lg mb-4">{p.name}</h3>
                            <p className="text-xl font-medium">${p.price.toLocaleString('es-CL')}</p>
                            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase font-bold tracking-widest text-brand-charcoal">
                                + Agregar al pedido
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart Summary & Checkout */}
            <div className="w-[450px] bg-white border-l border-gray-200 p-8 pt-24 shadow-2xl flex flex-col">
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
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-gray-400">${item.price.toLocaleString('es-CL')}</p>
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

                    <button className="w-full mt-4 bg-green-600 text-white py-4 text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all font-bold">
                        Cobrar y Emitir Boleta SimpleAPI
                    </button>
                </div>
            </div>
        </div>
    );
}
