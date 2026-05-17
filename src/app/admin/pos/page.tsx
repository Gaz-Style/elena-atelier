'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShoppingCart, User, Search, CreditCard, Tag, X, Plus, MessageSquare, Mail, ClipboardList, TrendingUp, Loader2, Package, Camera, FileText } from 'lucide-react';
import { getCostSettings } from '../finance/actions';
import { getCatalog } from '../catalog/actions';
import { getCustomers, createCustomer } from '../crm/actions';

export default function POSPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const addToCart = (p: any) => setCart([...cart, p]);
    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const total = cart.reduce((sum, item) => sum + item.price, 0);



    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [clientPhone, setClientPhone] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [customOrderName, setCustomOrderName] = useState('');
    const [customOrderCategory, setCustomOrderCategory] = useState('Diseño y confección');
    const [selectedCatalogCategory, setSelectedCatalogCategory] = useState('');
    const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<any>(null);
    
    // ERP Costing States
    const [hoursEstimated, setHoursEstimated] = useState<number>(0);
    const [hourlyRate, setHourlyRate] = useState<number>(25000);
    const [materialsCost, setMaterialsCost] = useState<number>(0);
    const [extraCost, setExtraCost] = useState<number>(0);
    const [fixedCost, setFixedCost] = useState<number>(349000);
    const [marginPercentage, setMarginPercentage] = useState<number>(15);
    const [globalSettings, setGlobalSettings] = useState<any>(null);
 
    const [allCustomers, setAllCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [isRegisteringClient, setIsRegisteringClient] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', phone: '56', email: '' });
    const [checkoutResult, setCheckoutResult] = useState<any>(null);
    const [orderNotes, setOrderNotes] = useState('');
    const [orderImages, setOrderImages] = useState<{ url: string; notes: string }[]>([]);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
 
    React.useEffect(() => {
        setLoading(true);
        Promise.all([
            getCostSettings(),
            getCatalog(),
            getCustomers().catch(() => []) // Fallback in case CRM is not fully seeded yet
        ]).then(([costData, catalogData, customersData]) => {
            setGlobalSettings(costData);
            setHourlyRate(costData.labor_hourly_rate);
            setFixedCost(costData.operational_fixed_cost);
            setMarginPercentage(costData.default_margin_percentage);
            setProducts(catalogData);
            setAllCustomers(customersData || []);
            setLoading(false);
        });
    }, []);
 
    const laborCost = hoursEstimated * hourlyRate;
    const productionCost = laborCost + materialsCost + extraCost;
    const totalCost = productionCost + fixedCost;
    const calculatedPrice = marginPercentage > 0 ? totalCost / (1 - (marginPercentage / 100)) : totalCost;
 
    const handleAddCustomOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customOrderName) return;
        
        addToCart({
            id: Date.now(),
            name: customOrderName,
            price: Math.round(calculatedPrice),
            category: customOrderCategory,
            isCustom: true,
            notes: orderNotes,
            images: orderImages,
            details: {
                hours: hoursEstimated,
                materials: materialsCost,
                extra: extraCost
            },
            costBreakdown: {
                labor: laborCost,
                materials: materialsCost + extraCost,
                fixed: fixedCost,
                margin: marginPercentage
            }
        });
        
        setCustomOrderName('');
        setCustomOrderCategory('Diseño y confección');
        setHoursEstimated(0);
        setMaterialsCost(0);
        setExtraCost(0);
        setMarginPercentage(globalSettings?.default_margin_percentage || 15);
        setOrderNotes('');
        setOrderImages([]);
        setActiveImageIndex(0);
    };

    const handleQuickRegister = async () => {
        if (!newClientData.name) return;
        setLoading(true);
        const fd = new FormData();
        fd.append('full_name', newClientData.name);
        fd.append('phone', newClientData.phone);
        fd.append('email', newClientData.email);
        
        const res = await createCustomer(fd);
        if (res.success) {
            setSelectedCustomer(res.data);
            setAllCustomers([...allCustomers, res.data]);
            setIsRegisteringClient(false);
            setClientSearch('');
            setNewClientData({ name: '', phone: '56', email: '' });
        } else {
            alert("Error al registrar: " + res.error);
        }
        setLoading(false);
    };

    const handleCheckout = async () => {
        if (cart.length === 0 || !paymentMethod || !selectedCustomer) return;
        setIsProcessing(true);
        
        // Simular llamada a API y guardado
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setCheckoutResult({
            orderId: Math.floor(Math.random() * 90000) + 10000,
            customer: selectedCustomer,
            items: [...cart],
            total: total,
            method: paymentMethod,
            date: new Date().toLocaleDateString()
        });
        
        setIsProcessing(false);
        setCart([]);
        setPaymentMethod(null);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
    };

    const generateBudgetLink = () => {
        const budgetData = {
            cart: cart,
            total: total,
            date: new Date().toISOString()
        };
        const jsonStr = JSON.stringify(budgetData);
        // UTF-8 friendly base64 encoding
        const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/presupuesto?d=${base64}`;
        setGeneratedLink(link);
        setIsBudgetModalOpen(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const shareViaWhatsApp = () => {
        if (!clientPhone) return;
        const message = encodeURIComponent(`¡Hola! Te envío el presupuesto formal de Elena Atelier para tu proyecto de alta costura. Puedes verlo y aceptarlo aquí: ${generatedLink}`);
        const cleanPhone = clientPhone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    };

    const shareViaEmail = () => {
        if (!clientEmail) return;
        const subject = encodeURIComponent("Presupuesto Formal - Elena Atelier");
        const body = encodeURIComponent(`¡Hola!\n\nTe envío el presupuesto formal para tu proyecto. Puedes verlo y aceptarlo directamente en el siguiente enlace interactivo:\n\n${generatedLink}\n\nQuedamos atentos a tus comentarios.\n\nSaludos,\nElena Atelier`);
        window.location.href = `mailto:${clientEmail}?subject=${subject}&body=${body}`;
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
                <h1 className="font-serif text-3xl text-brand-charcoal mb-8 flex items-center gap-3">
                    <ClipboardList className="w-8 h-8 text-brand-terracotta" />
                    Ingreso de Orden de Trabajo
                </h1>

                {/* Section 1: Client */}
                <div className="bg-white p-6 md:p-8 rounded-sm border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-brand-terracotta border-b border-gray-100 pb-2 flex items-center gap-2 mb-6">
                        <User className="w-4 h-4" /> 1. Identificación de Cliente
                    </h3>
                    
                    {selectedCustomer ? (
                        <div className="flex justify-between items-center bg-brand-sand/10 p-4 rounded-sm border border-brand-sand/30">
                            <div>
                                <p className="font-serif text-lg text-brand-charcoal">{selectedCustomer.full_name}</p>
                                <p className="text-xs text-gray-500">{selectedCustomer.phone || selectedCustomer.email}</p>
                            </div>
                            <button onClick={() => setSelectedCustomer(null)} className="text-xs uppercase tracking-widest text-gray-400 hover:text-red-500 font-bold">Cambiar Cliente</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Search and New Button Bar */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nombre, rut o correo..." 
                                        value={clientSearch}
                                        onChange={(e) => setClientSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta text-sm"
                                    />
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsRegisteringClient(!isRegisteringClient);
                                        setNewClientData({ name: '', phone: '', email: '' });
                                    }}
                                    className={`px-6 py-3 text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2 justify-center border ${isRegisteringClient ? 'bg-white border-red-200 text-red-500' : 'bg-brand-charcoal text-white border-brand-charcoal hover:bg-brand-terracotta'}`}
                                >
                                    {isRegisteringClient ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                                    {isRegisteringClient ? 'Cancelar' : 'Nuevo Cliente'}
                                </button>
                            </div>

                            {/* Search Results Dropdown */}
                            {clientSearch && (
                                <div className="bg-white border border-gray-100 shadow-lg rounded-sm max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                    {allCustomers.filter(c => c.full_name.toLowerCase().includes(clientSearch.toLowerCase()) || (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase()))).map(c => (
                                        <div key={c.id} onClick={() => { setSelectedCustomer(c); setClientSearch(''); }} className="p-4 hover:bg-brand-sand/10 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center group">
                                            <div>
                                                <p className="text-sm font-medium text-brand-charcoal">{c.full_name}</p>
                                                <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{c.email} | {c.phone}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-terracotta transition-all" />
                                        </div>
                                    ))}
                                    {allCustomers.filter(c => c.full_name.toLowerCase().includes(clientSearch.toLowerCase()) || (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase()))).length === 0 && (
                                        <div className="p-6 text-center">
                                            <p className="text-xs text-gray-500 italic mb-2">No se encontró cliente con "{clientSearch}"</p>
                                            <button onClick={() => { setIsRegisteringClient(true); setClientSearch(''); }} className="text-[10px] uppercase tracking-widest font-bold text-brand-terracotta hover:underline">+ Crear ficha de cliente nuevo</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Quick Registration Form (Expandable) */}
                            {isRegisteringClient && (
                                <div className="bg-white p-8 rounded-sm border border-gray-100 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm relative">
                                    <button 
                                        onClick={() => setIsRegisteringClient(false)}
                                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <div className="text-center space-y-1">
                                        <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta">Nueva Ficha de Cliente</h4>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Ingrese los datos para registro oficial en CRM</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block px-1">Nombre Completo</label>
                                            <input 
                                                type="text" 
                                                placeholder="Nombre y Apellido" 
                                                value={newClientData.name} 
                                                onChange={e => {
                                                    const formatted = e.target.value.replace(/\b\w/g, c => c.toUpperCase());
                                                    setNewClientData({...newClientData, name: formatted});
                                                }} 
                                                className={`w-full p-3 text-sm border rounded-sm outline-none transition-all ${
                                                    newClientData.name 
                                                        ? newClientData.name.trim().split(/\s+/).length < 2 
                                                            ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                                            : 'border-green-500/30 bg-green-50/30 focus:border-green-500' 
                                                        : 'bg-gray-50 border-gray-200 focus:border-brand-terracotta focus:bg-white'
                                                }`} 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block px-1">WhatsApp</label>
                                            <div className={`flex border rounded-sm overflow-hidden transition-all ${
                                                newClientData.phone 
                                                    ? (newClientData.phone.length < 8 || newClientData.phone.length > 12) 
                                                        ? 'border-red-300 bg-red-50 focus-within:border-red-500' 
                                                        : 'border-green-500/30 bg-green-50/30 focus-within:border-green-500' 
                                                    : 'bg-gray-50 border-gray-200 focus-within:border-brand-terracotta'
                                            }`}>
                                                <select className="bg-transparent border-r border-gray-200 p-2 text-[10px] uppercase font-bold outline-none cursor-pointer text-gray-600">
                                                    <option value="56">🇨🇱 +56</option>
                                                    <option value="54">🇦🇷 +54</option>
                                                    <option value="55">🇧🇷 +55</option>
                                                    <option value="51">🇵🇪 +51</option>
                                                    <option value="1">🇺🇸 +1</option>
                                                </select>
                                                <input 
                                                    type="tel" 
                                                    placeholder="9 1234 5678" 
                                                    value={newClientData.phone} 
                                                    onChange={e => {
                                                        const raw = e.target.value.replace(/\D/g, "");
                                                        setNewClientData({...newClientData, phone: raw});
                                                    }} 
                                                    className="flex-1 p-3 text-sm bg-transparent outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block px-1">Email</label>
                                            <input 
                                                type="email" 
                                                placeholder="ejemplo@correo.com" 
                                                value={newClientData.email} 
                                                onChange={e => setNewClientData({...newClientData, email: e.target.value})} 
                                                className={`w-full p-3 text-sm border rounded-sm outline-none transition-all ${
                                                    newClientData.email 
                                                        ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClientData.email) 
                                                            ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                                            : 'border-green-500/30 bg-green-50/30 focus:border-green-500' 
                                                        : 'bg-gray-50 border-gray-200 focus:border-brand-terracotta focus:bg-white'
                                                }`} 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-center pt-4">
                                        <button 
                                            onClick={handleQuickRegister} 
                                            disabled={
                                                !newClientData.name || 
                                                newClientData.name.trim().split(/\s+/).length < 2 || 
                                                newClientData.phone.length < 8 ||
                                                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClientData.email)
                                            } 
                                            className="w-full md:w-[400px] py-4 bg-brand-charcoal text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-terracotta transition-all disabled:opacity-20 disabled:bg-gray-400 rounded-sm shadow-md active:scale-95 text-center"
                                        >
                                            Registrar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Section 2: Service Details */}
                <div className={`bg-white p-6 md:p-8 rounded-sm border border-gray-100 shadow-sm space-y-6 transition-all ${!selectedCustomer ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-brand-terracotta border-b border-gray-100 pb-2 flex items-center gap-2 mb-6">
                        <Tag className="w-4 h-4" /> 2. Detalle del Trabajo
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Categoría Principal</label>
                            <select value={customOrderCategory} onChange={(e) => setCustomOrderCategory(e.target.value)} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta">
                                <option value="Diseño y confección">Diseño y confección</option>
                                <option value="Arreglos especializados">Arreglos especializados</option>
                                <option value="Catálogo de servicios">Catálogo de servicios</option>
                            </select>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            {customOrderCategory !== 'Catálogo de servicios' && (
                                <>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Descripción del Trabajo *</label>
                                    <input type="text" value={customOrderName} onChange={(e) => setCustomOrderName(e.target.value)} placeholder="Ej. Ajuste de hombros vestido seda" className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                </>
                            )}
                        </div>
                    </div>

                    {customOrderCategory === 'Catálogo de servicios' ? (
                        <div className="space-y-6 pt-4 border-t border-gray-50 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Tipo de Prenda / Subcategoría</label>
                                    <select 
                                        value={selectedCatalogCategory} 
                                        onChange={(e) => {
                                            setSelectedCatalogCategory(e.target.value);
                                            setSelectedCatalogProduct(null);
                                        }} 
                                        className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta cursor-pointer font-medium transition-all"
                                    >
                                        <option value="">-- Seleccionar Subcategoría --</option>
                                        {Array.from(new Set(products.map(p => p.category))).sort().map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Servicio / Operación</label>
                                    <select 
                                        disabled={!selectedCatalogCategory}
                                        value={selectedCatalogProduct ? selectedCatalogProduct.id : ''} 
                                        onChange={(e) => {
                                            const prodId = e.target.value;
                                            const found = products.find(p => p.id.toString() === prodId.toString() || p.id === Number(prodId));
                                            setSelectedCatalogProduct(found || null);
                                        }} 
                                        className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium transition-all"
                                    >
                                        <option value="">
                                            {!selectedCatalogCategory 
                                                ? 'Primero seleccione una subcategoría...' 
                                                : '-- Seleccionar Servicio --'}
                                        </option>
                                        {products
                                            .filter(p => p.category === selectedCatalogCategory)
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} ({formatCurrency(p.price)})
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>

                            {/* Beautiful visual feedback box when a service is selected */}
                            {selectedCatalogProduct && (
                                <div className="bg-brand-sand/5 p-6 rounded-sm border border-brand-sand/30 animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6 mt-6">
                                    {/* Item-specific Notes and Image inside Catalog view */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Notas Especiales / Especificaciones</label>
                                            <textarea 
                                                value={orderNotes}
                                                onChange={(e) => setOrderNotes(e.target.value)}
                                                placeholder="Detalles específicos para esta prenda (ej: basta con hilo invisible)..."
                                                className="w-full h-[120px] p-3 text-xs bg-white border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta resize-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Fotos de Referencia (Hasta 4)</label>
                                            {orderImages.length > 0 ? (
                                                <div className="space-y-2 h-[120px] flex flex-col justify-between">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {orderImages.map((img, idx) => (
                                                            <div 
                                                                key={idx}
                                                                onClick={() => setActiveImageIndex(idx)}
                                                                className={`relative w-[50px] h-[50px] border rounded-sm overflow-hidden flex items-center justify-center cursor-pointer bg-white transition-all ${
                                                                    idx === activeImageIndex 
                                                                        ? 'border-brand-terracotta ring-1 ring-brand-terracotta' 
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                            >
                                                                <img src={img.url} alt={`Prenda ${idx + 1}`} className="w-full h-full object-contain" />
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const filtered = orderImages.filter((_, i) => i !== idx);
                                                                        setOrderImages(filtered);
                                                                        setActiveImageIndex(Math.max(0, filtered.length - 1));
                                                                    }}
                                                                    className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full shadow hover:bg-red-600 transition-colors z-20"
                                                                >
                                                                    <X className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        
                                                        {orderImages.length < 4 && (
                                                            <div className="border border-dashed border-gray-300 hover:border-brand-terracotta rounded-sm w-[50px] h-[50px] bg-white transition-colors flex flex-col items-center justify-center cursor-pointer relative group">
                                                                <input 
                                                                    type="file" 
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            const reader = new FileReader();
                                                                            reader.onloadend = () => {
                                                                                const newImages = [...orderImages, { url: reader.result as string, notes: '' }];
                                                                                setOrderImages(newImages);
                                                                                setActiveImageIndex(newImages.length - 1);
                                                                            };
                                                                            reader.readAsDataURL(file);
                                                                        }
                                                                    }}
                                                                    className="absolute inset-0 cursor-pointer w-full h-full z-10"
                                                                    style={{ opacity: 0 }}
                                                                />
                                                                <Camera className="w-4 h-4 text-gray-400 group-hover:text-brand-terracotta transition-colors" />
                                                                <span className="text-[7px] uppercase font-bold text-gray-400 mt-0.5">+ Foto</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {orderImages[activeImageIndex] && (
                                                        <input 
                                                            type="text"
                                                            value={orderImages[activeImageIndex].notes}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setOrderImages(prev => prev.map((img, i) => i === activeImageIndex ? { ...img, notes: val } : img));
                                                            }}
                                                            placeholder={`Indicaciones para foto ${activeImageIndex + 1}...`}
                                                            className="w-full p-2 text-xs bg-white border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta transition-all"
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="border border-dashed border-gray-200 rounded-sm h-[120px] bg-white hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer relative group">
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setOrderImages([{ url: reader.result as string, notes: '' }]);
                                                                    setActiveImageIndex(0);
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                        className="absolute inset-0 cursor-pointer w-full h-full z-10"
                                                        style={{ opacity: 0 }}
                                                    />
                                                    <Camera className="w-5 h-5 text-gray-400 group-hover:text-brand-terracotta transition-colors mb-1" />
                                                    <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400 group-hover:text-brand-charcoal transition-colors">Adjuntar Fotos</span>
                                                    <span className="text-[8px] text-gray-400 mt-0.5">Soporta múltiples imágenes (Máx 4)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action footer containing product total beside action button */}
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-brand-charcoal text-white p-6 rounded-sm shadow-lg">
                                        <div className="text-center sm:text-left">
                                            <span className="bg-brand-terracotta text-white px-2 py-0.5 rounded-[2px] text-[8px] uppercase tracking-widest font-bold mb-1.5 inline-block">
                                                {selectedCatalogProduct.category}
                                            </span>
                                            <h4 className="font-serif text-lg text-brand-sand">{selectedCatalogProduct.name}</h4>
                                            <p className="text-2xl font-serif text-white mt-0.5">{formatCurrency(selectedCatalogProduct.price)}</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                addToCart({
                                                    ...selectedCatalogProduct,
                                                    notes: orderNotes,
                                                    images: orderImages
                                                });
                                                setSelectedCatalogProduct(null);
                                                setSelectedCatalogCategory('');
                                                setOrderNotes('');
                                                setOrderImages([]);
                                                setActiveImageIndex(0);
                                            }}
                                            className="w-full sm:w-auto bg-brand-terracotta text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-white hover:text-brand-terracotta transition-all shadow-md active:scale-95 text-center"
                                        >
                                            Añadir a la Orden
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 pt-4 border-t border-gray-50 animate-in fade-in duration-500">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Análisis ERP de Costos y Margen</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Horas Taller Estimadas</label>
                                    <input type="number" min="0" value={hoursEstimated || ''} onChange={(e) => setHoursEstimated(Number(e.target.value))} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Insumos y Materiales</label>
                                    <input type="number" min="0" value={materialsCost || ''} onChange={(e) => setMaterialsCost(Number(e.target.value))} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Detalles / Pedrería / Extras</label>
                                    <input type="number" min="0" value={extraCost || ''} onChange={(e) => setExtraCost(Number(e.target.value))} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta" placeholder="0" />
                                </div>
                            </div>
                            
                            {/* Notes and Photo attachment for Custom Order */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-1">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Notas Especiales / Especificaciones</label>
                                    <textarea 
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                        placeholder="Detalles específicos (medidas, tipo de tela, defectos a reparar, etc.)..."
                                        className="w-full h-[120px] p-3 text-xs bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta resize-none transition-all focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">Foto de Referencia (Prenda - Hasta 4)</label>
                                    {orderImages.length > 0 ? (
                                        <div className="space-y-2 h-[120px] flex flex-col justify-between">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {orderImages.map((img, idx) => (
                                                    <div 
                                                        key={idx}
                                                        onClick={() => setActiveImageIndex(idx)}
                                                        className={`relative w-[50px] h-[50px] border rounded-sm overflow-hidden flex items-center justify-center cursor-pointer bg-white transition-all ${
                                                            idx === activeImageIndex 
                                                                ? 'border-brand-terracotta ring-1 ring-brand-terracotta' 
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <img src={img.url} alt={`Prenda Custom ${idx + 1}`} className="w-full h-full object-contain" />
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const filtered = orderImages.filter((_, i) => i !== idx);
                                                                setOrderImages(filtered);
                                                                setActiveImageIndex(Math.max(0, filtered.length - 1));
                                                            }}
                                                            className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full shadow hover:bg-red-600 transition-colors z-20"
                                                        >
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                
                                                {orderImages.length < 4 && (
                                                    <div className="border border-dashed border-gray-300 hover:border-brand-terracotta rounded-sm w-[50px] h-[50px] bg-white transition-colors flex flex-col items-center justify-center cursor-pointer relative group">
                                                        <input 
                                                            type="file" 
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        const newImages = [...orderImages, { url: reader.result as string, notes: '' }];
                                                                        setOrderImages(newImages);
                                                                        setActiveImageIndex(newImages.length - 1);
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                            className="absolute inset-0 cursor-pointer w-full h-full z-10"
                                                            style={{ opacity: 0 }}
                                                        />
                                                        <Camera className="w-4 h-4 text-gray-400 group-hover:text-brand-terracotta transition-colors" />
                                                        <span className="text-[7px] uppercase font-bold text-gray-400 mt-0.5">+ Foto</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {orderImages[activeImageIndex] && (
                                                <input 
                                                    type="text"
                                                    value={orderImages[activeImageIndex].notes}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setOrderImages(prev => prev.map((img, i) => i === activeImageIndex ? { ...img, notes: val } : img));
                                                    }}
                                                    placeholder={`Indicaciones para foto ${activeImageIndex + 1}...`}
                                                    className="w-full p-2 text-xs bg-white border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta transition-all"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="border border-dashed border-gray-200 rounded-sm h-[120px] bg-white hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer relative group">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setOrderImages([{ url: reader.result as string, notes: '' }]);
                                                            setActiveImageIndex(0);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="absolute inset-0 cursor-pointer w-full h-full z-10"
                                                style={{ opacity: 0 }}
                                            />
                                            <Camera className="w-5 h-5 text-gray-400 group-hover:text-brand-terracotta transition-colors mb-1" />
                                            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400 group-hover:text-brand-charcoal transition-colors">Adjuntar Fotos</span>
                                            <span className="text-[8px] text-gray-400 mt-0.5">Soporta múltiples imágenes (Máx 4)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-center bg-brand-charcoal text-white p-6 rounded-sm mt-4 shadow-lg gap-4">
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] uppercase tracking-widest text-brand-sand font-bold mb-1">Precio Sugerido (Con Margen {marginPercentage}%)</p>
                                    <p className="text-3xl font-serif">{formatCurrency(calculatedPrice)}</p>
                                </div>
                                <button 
                                    onClick={(e) => handleAddCustomOrder(e)}
                                    disabled={!customOrderName || (!hoursEstimated && !materialsCost && !extraCost)}
                                    className="w-full md:w-auto bg-brand-terracotta text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-white hover:text-brand-terracotta transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    Añadir a la Orden
                                </button>
                            </div>
                        </div>
                    )}
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
                        cart.map((item: any, i) => (
                            <div key={i} className="flex justify-between items-start p-4 bg-gray-50 rounded-sm group relative gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-2">
                                        <p className="text-sm font-medium text-brand-charcoal">{item.name}</p>
                                        {item.costBreakdown && (
                                            <span className="bg-brand-charcoal text-white px-1.5 py-0.5 rounded-[2px] text-[8px] uppercase tracking-widest font-bold">ERP Costeado</span>
                                        )}
                                        {item.images && item.images.length > 0 && (
                                            <span className="bg-brand-terracotta text-white px-1.5 py-0.5 rounded-[2px] text-[8px] uppercase tracking-widest font-bold">{item.images.length} {item.images.length === 1 ? 'Foto' : 'Fotos'}</span>
                                        )}
                                    </div>
                                    <p className="text-xs font-serif text-brand-terracotta mt-1">{formatCurrency(item.price)}</p>
                                    
                                    {/* Display item notes in cart */}
                                    {item.notes && (
                                        <p className="text-[11px] text-gray-500 italic mt-1.5 bg-white p-2 rounded-sm border border-gray-100/50 leading-normal">
                                            "{item.notes}"
                                        </p>
                                    )}
                                    
                                    {/* Display individual image notes in cart */}
                                    {item.images && item.images.map((img: any, idx: number) => img.notes && (
                                        <p key={idx} className="text-[10px] text-brand-terracotta mt-1 leading-normal flex items-start gap-1">
                                            <span className="font-bold uppercase text-[7px] bg-brand-terracotta/10 px-1 py-0.5 rounded-[2px] shrink-0 mt-0.5">Indicación Foto {idx + 1}:</span>
                                            <span className="italic">"{img.notes}"</span>
                                        </p>
                                    ))}
                                </div>
                                
                                <div className="flex flex-col gap-1 items-end shrink-0">
                                    <div className="flex gap-1 flex-wrap justify-end max-w-[120px]">
                                        {item.images && item.images.map((img: any, idx: number) => (
                                            <div key={idx} className="w-8 h-8 border border-gray-200 rounded-sm overflow-hidden bg-white flex items-center justify-center shadow-sm">
                                                <img src={img.url} alt={`Prenda ${idx + 1}`} className="h-full w-full object-contain" />
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => removeFromCart(i)} className="text-gray-300 hover:text-red-500 transition-colors p-1 mt-1">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
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
                        <button 
                            type="button"
                            onClick={() => setPaymentMethod('card')}
                            className="flex items-center justify-center gap-2 border border-brand-charcoal py-4 text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">
                            <CreditCard className="w-4 h-4" />
                            Mercado Pago
                        </button>
                        <button 
                            type="button"
                            onClick={() => setPaymentMethod('cash')}
                            className="flex items-center justify-center gap-2 bg-brand-charcoal text-white py-4 text-[10px] uppercase tracking-widest hover:bg-brand-terracotta transition-all">
                            Efectivo / Transf
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 mt-4">
                        <button 
                            type="button"
                            onClick={generateBudgetLink}
                            disabled={cart.length === 0}
                            className="w-full border border-brand-charcoal text-brand-charcoal py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            Generar Presupuesto Web (Link)
                        </button>
                        <button 
                            type="button"
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || !paymentMethod || !selectedCustomer || isProcessing}
                            className={`w-full py-4 text-[10px] uppercase tracking-widest font-bold transition-all ${cart.length === 0 || !paymentMethod || !selectedCustomer || isProcessing ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow-md'}`}>
                            {isProcessing ? 'Procesando...' : (!selectedCustomer ? 'Falta Identificar Cliente' : 'Cobrar y Emitir Boleta')}
                        </button>
                    </div>
                </div>
            </div>


            {/* Interactive Budget Link Modal */}
            {isBudgetModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-sm shadow-xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-16 h-16 bg-brand-sand/30 rounded-full flex items-center justify-center mx-auto">
                                <Plus className="w-8 h-8 text-brand-terracotta rotate-45" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="font-serif text-3xl text-brand-charcoal">¡Presupuesto Web Listo!</h2>
                                <p className="text-sm text-gray-500 px-8">Hemos generado un link interactivo para tu clienta. Puede verlo y pagar desde su celular.</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-sm border border-gray-100 flex flex-col gap-4">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 text-left italic">Enviar por WhatsApp</p>
                                        <div className="flex gap-2">
                                            <input 
                                                type="tel" 
                                                value={clientPhone}
                                                onChange={(e) => setClientPhone(e.target.value)}
                                                placeholder="Ej. 56912345678" 
                                                className="flex-1 bg-white border border-gray-200 px-3 py-2 text-xs rounded-sm outline-none focus:border-brand-terracotta" 
                                            />
                                            <button 
                                                onClick={shareViaWhatsApp}
                                                disabled={!clientPhone}
                                                className="bg-[#25D366] text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#128C7E] transition-all rounded-sm flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <MessageSquare className="w-3 h-3" /> WhatsApp
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 border-t border-gray-200 pt-4">
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 text-left italic">Enviar por Correo</p>
                                        <div className="flex gap-2">
                                            <input 
                                                type="email" 
                                                value={clientEmail}
                                                onChange={(e) => setClientEmail(e.target.value)}
                                                placeholder="cliente@email.com" 
                                                className="flex-1 bg-white border border-gray-200 px-3 py-2 text-xs rounded-sm outline-none focus:border-brand-terracotta" 
                                            />
                                            <button 
                                                onClick={shareViaEmail}
                                                disabled={!clientEmail}
                                                className="bg-brand-charcoal text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all rounded-sm flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <Mail className="w-3 h-3" /> Email
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 text-left mb-2">Link Directo</p>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={generatedLink} 
                                            className="flex-1 bg-white border border-gray-200 px-3 py-2 text-[10px] text-gray-400 rounded-sm outline-none" 
                                        />
                                        <button 
                                            onClick={copyToClipboard}
                                            className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm flex items-center gap-2 ${copySuccess ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                        >
                                            {copySuccess ? 'Copiado' : 'Copiar Link'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => window.open(generatedLink, '_blank')}
                                    className="flex items-center justify-center gap-2 py-3 border border-gray-200 text-brand-charcoal text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-all rounded-sm"
                                >
                                    Ver como Cliente
                                </button>
                                <button 
                                    onClick={() => setIsBudgetModalOpen(false)}
                                    className="py-3 bg-brand-charcoal text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all rounded-sm"
                                >
                                    Finalizar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Work Order / Success Modal */}
            {checkoutResult && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
                        <div className="bg-brand-charcoal text-white p-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <ClipboardList className="w-6 h-6 text-brand-sand" />
                                <div>
                                    <h2 className="font-serif text-xl">Orden de Trabajo #{checkoutResult.orderId}</h2>
                                    <p className="text-[8px] uppercase tracking-[0.3em] text-brand-sand/60">Elena Atelier - Alta Costura</p>
                                </div>
                            </div>
                            <button onClick={() => setCheckoutResult(null)} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                            {/* Staff Info */}
                            <div className="grid grid-cols-2 gap-8 pb-6 border-b border-gray-100">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Cliente</p>
                                    <p className="font-serif text-lg">{checkoutResult.customer.full_name}</p>
                                    <p className="text-xs text-gray-500">{checkoutResult.customer.phone || 'Sin teléfono'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Fecha de Ingreso</p>
                                    <p className="text-sm font-bold">{checkoutResult.date}</p>
                                    <p className="text-[10px] text-brand-terracotta font-bold uppercase mt-1">Metodo: {checkoutResult.method === 'card' ? 'Mercado Pago' : 'Efectivo'}</p>
                                </div>
                            </div>

                            {/* Work Details */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">Detalle para Taller</h3>
                                <div className="space-y-3">
                                    {checkoutResult.items.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-serif text-md">{item.name}</p>
                                                <span className="text-[10px] uppercase font-bold text-brand-terracotta">{item.category}</span>
                                            </div>
                                            {item.isCustom && item.details && (
                                                <div className="grid grid-cols-3 gap-4 mt-2 pt-2 border-t border-gray-200/50">
                                                    <div>
                                                        <p className="text-[9px] uppercase text-gray-400">Horas Estimadas</p>
                                                        <p className="text-xs font-bold">{item.details.hours} hrs</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] uppercase text-gray-400">Costo Mat.</p>
                                                        <p className="text-xs font-bold">{formatCurrency(item.details.materials)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] uppercase text-gray-400">Extras</p>
                                                        <p className="text-xs font-bold">{formatCurrency(item.details.extra)}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Item-specific Notes and Image inside the Success/Print Modal */}
                                            {(item.notes || (item.images && item.images.length > 0)) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 print:break-inside-avoid">
                                                    {item.notes && (
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] uppercase tracking-widest font-bold text-brand-terracotta">Instrucciones Especiales</p>
                                                            <p className="text-xs text-gray-700 whitespace-pre-line italic leading-relaxed">
                                                                "{item.notes}"
                                                            </p>
                                                        </div>
                                                    )}
                                                    {item.images && item.images.length > 0 && (
                                                        <div className="space-y-3">
                                                            <p className="text-[9px] uppercase tracking-widest font-bold text-brand-terracotta">Registro Fotográfico ({item.images.length})</p>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {item.images.map((img: any, imgIdx: number) => (
                                                                    <div key={imgIdx} className="space-y-1 bg-white p-2 border border-gray-100 rounded-sm shadow-sm">
                                                                        <div className="border border-gray-100 rounded-[1px] overflow-hidden bg-gray-50 flex items-center justify-center h-[90px]">
                                                                            <img src={img.url} alt={`Registro ${imgIdx + 1}`} className="h-full w-full object-contain" />
                                                                        </div>
                                                                        {img.notes && (
                                                                            <p className="text-[9px] text-brand-charcoal italic leading-tight p-1 bg-brand-sand/5 border-t border-gray-100">
                                                                                "{img.notes}"
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-brand-sand/10 p-4 rounded-sm border border-brand-sand/30 text-center">
                                <p className="text-[10px] uppercase tracking-widest text-brand-charcoal mb-1">Total de la Orden</p>
                                <p className="text-3xl font-serif text-brand-terracotta">{formatCurrency(checkoutResult.total)}</p>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                            <button onClick={() => window.print()} className="flex-1 py-3 border border-brand-charcoal text-brand-charcoal text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all rounded-sm">
                                Imprimir Orden (Taller)
                            </button>
                            <button onClick={() => setCheckoutResult(null)} className="flex-1 py-3 bg-brand-charcoal text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all rounded-sm">
                                Finalizar y Nueva Orden
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}
