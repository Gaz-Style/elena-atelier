'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Receipt, DollarSign, Settings, Save, Loader2, CheckCircle2, Building2, Plus, Calendar, Hash, Tag, FileText, History, User, Trash2, Calculator, Info } from 'lucide-react';
import { getCostSettings, saveCostSettings, getExpenses, getFixedCosts, registerPurchaseDocument, getRecentDocuments, deletePurchaseDocument, calculateSuggestedRate } from './actions';
import { getInventoryItems } from '../inventory/actions';

export default function FinanceDashboard() {
    const [settings, setSettings] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalFixedCosts, setTotalFixedCosts] = useState(0);
    const [recentDocs, setRecentDocs] = useState<any[]>([]);
    const [isRegistering, setIsRegistering] = useState(false);
    const [workshopCapacity, setWorkshopCapacity] = useState(160);
    const [isCalculating, setIsCalculating] = useState(false);
    const [suggestedData, setSuggestedData] = useState<{rate: number, total: number} | null>(null);
    const [currentHourlyRate, setCurrentHourlyRate] = useState<number>(0);

    // Generalised Inventory States
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [loadToInventory, setLoadToInventory] = useState(false);
    const [purchaseLines, setPurchaseLines] = useState<any[]>([{ inventory_item_id: '', quantity: 1, price_unit: 0 }]);

    useEffect(() => {
        getCostSettings().then(data => {
            setSettings(data);
            setCurrentHourlyRate(data.labor_hourly_rate);
        });
        getInventoryItems().then(data => {
            setInventoryItems(data || []);
        });
        refreshData();
    }, []);

    async function refreshData() {
        const now = new Date();
        const m = now.getMonth() + 1;
        const y = now.getFullYear();

        const [expData, fixedData, docsData] = await Promise.all([
            getExpenses(m, y),
            getFixedCosts(m, y),
            getRecentDocuments()
        ]);

        const totalExp = expData.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
        const totalFixed = fixedData.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);

        setTotalExpenses(totalExp);
        setTotalFixedCosts(totalFixed);
        setRecentDocs(docsData);
    }

    const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus('idle');
        const formData = new FormData();
        formData.append('labor_hourly_rate', currentHourlyRate.toString());
        formData.append('operational_fixed_cost', '0');
        formData.append('default_margin_percentage', settings.default_margin_percentage.toString());
        
        const result = await saveCostSettings(formData);
        setIsSaving(false);
        if (result.success) {
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } else {
            setSaveStatus('error');
        }
    };

    const handleRegisterDoc = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setIsRegistering(true);
        const formData = new FormData(form);

        if (loadToInventory) {
            const validLines = purchaseLines.filter(line => line.inventory_item_id && Number(line.quantity) > 0);
            formData.append('purchase_items', JSON.stringify(validLines));
            
            // Auto-overwrite total_amount inside formData
            const calculatedTotal = validLines.reduce((sum, line) => sum + (Number(line.quantity || 0) * Number(line.price_unit || 0)), 0);
            formData.set('total_amount', calculatedTotal.toString());
        }

        const result = await registerPurchaseDocument(formData);
        setIsRegistering(false);
        if (result.success) {
            form.reset();
            setLoadToInventory(false);
            setPurchaseLines([{ inventory_item_id: '', quantity: 1, price_unit: 0 }]);
            
            // Re-fetch both inventory lists and recent ledger documents
            getInventoryItems().then(data => {
                setInventoryItems(data || []);
            });
            await refreshData();
        } else {
            alert("Error: " + result.error);
        }
    };

    const handleDeleteDoc = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este documento? Esto también restará el monto de tus planillas mensuales.")) return;
        const result = await deletePurchaseDocument(id);
        if (result.success) {
            await refreshData();
        } else {
            alert("Error al eliminar: " + result.error);
        }
    };

    const handleCalculateSuggested = async () => {
        setIsCalculating(true);
        const result = await calculateSuggestedRate(workshopCapacity);
        setIsCalculating(false);
        if (result.suggestedRate !== undefined) {
            setSuggestedData({ rate: result.suggestedRate, total: result.totalFixed });
            setCurrentHourlyRate(result.suggestedRate);
        }
    };

    if (!settings) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-terracotta" />
            </div>
        );
    }

    const metrics = [
        { title: 'Ventas Netas', value: '$4.250.000', icon: DollarSign, trend: '+12%', color: 'text-green-600', link: null },
        { title: 'Gastos Variables (Mes)', value: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(totalExpenses), icon: TrendingUp, trend: 'Dinámico', color: 'text-red-500', link: '/admin/finance/expenses' },
        { title: 'Costos Fijos (Planilla)', value: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(totalFixedCosts), icon: Building2, trend: 'Configurado', color: 'text-brand-charcoal', link: '/admin/finance/fixed-costs' },
        { title: 'IVA por Pagar (19%)', value: '$807.500', icon: Receipt, trend: 'Calculado', color: 'text-brand-terracotta', link: null },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 pt-20 font-sans">
            <div className="max-w-7xl mx-auto space-y-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <h1 className="font-serif text-5xl text-brand-charcoal leading-none">Dashboard Financiero V2</h1>
                        <p className="text-gray-500 mt-2 italic font-serif text-lg">"Arquitectura de Clase Mundial para Elena Atelier"</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {metrics.map((m) => (
                        <div key={m.title} className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex flex-col justify-between h-36">
                            <div className="flex justify-between items-start">
                                <m.icon className={`w-5 h-5 ${m.color}`} />
                                {m.link && (
                                    <Link href={m.link} className="text-[9px] font-bold uppercase tracking-widest text-brand-terracotta hover:underline">Gestionar Planilla →</Link>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{m.title}</p>
                                <p className="text-2xl font-serif text-brand-charcoal">{m.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-10 border border-gray-100 shadow-sm rounded-sm">
                            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
                                <div className="bg-brand-charcoal p-2 rounded-sm">
                                    <Plus className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-serif text-2xl text-brand-charcoal leading-none uppercase tracking-tighter">Captador de Datos Pro</h2>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Registro de Compras con Desglose Tributario</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleRegisterDoc} className="grid grid-cols-1 md:grid-cols-6 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-2"><User className="w-3 h-3" /> RUT Proveedor</label>
                                    <input name="provider_rut" required type="text" placeholder="Ej: 76.123.456-7" className="w-full bg-gray-50 p-4 text-sm outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm font-mono" />
                                </div>
                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Razón Social / Nombre Comercio</label>
                                    <input name="provider_name" required type="text" placeholder="Ej: Telas Santiago S.A." className="w-full bg-gray-50 p-4 text-sm outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm" />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-2"><Calendar className="w-3 h-3" /> Fecha</label>
                                    <input name="date" required type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-gray-50 p-4 text-sm outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-2"><FileText className="w-3 h-3" /> Tipo Documento</label>
                                    <select name="document_type" className="w-full bg-gray-50 p-4 text-sm outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm">
                                        <option value="Factura">Factura de Compra</option>
                                        <option value="Boleta">Boleta de Venta</option>
                                        <option value="Voucher">Voucher / Recibo</option>
                                        <option value="Honorarios">Boleta Honorarios</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-2"><Hash className="w-3 h-3" /> N° Documento</label>
                                    <input name="document_number" required type="text" placeholder="Ej: 45601" className="w-full bg-gray-50 p-4 text-sm outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm" />
                                </div>

                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-2"><Tag className="w-3 h-3" /> Clasificación ERP</label>
                                    <select name="category" className="w-full bg-brand-sand/10 p-4 text-sm outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm font-bold">
                                        <option value="variable">Gasto Variable (Materia Prima/Producción)</option>
                                        <option value="fixed">Costo Fijo (Administración/Estructura)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Categoría / Ítem Destino</label>
                                    <select name="expense_item" className="w-full bg-gray-50 p-4 text-sm outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm">
                                        <option value="Telas">Telas</option>
                                        <option value="Insumos">Insumos (Hilos/Agujas)</option>
                                        <option value="Arriendo">Arriendo</option>
                                        <option value="Gasto Común">Gasto Común</option>
                                        <option value="Luz">Luz</option>
                                        <option value="Agua">Agua</option>
                                        <option value="Gas">Gas</option>
                                        <option value="Internet / Telefonía">Internet / Telefonía</option>
                                        <option value="Marketing Digital">Marketing Digital</option>
                                        <option value="Sueldos">Sueldos</option>
                                        <option value="Otros">Otros</option>
                                    </select>
                                </div>

                                {/* Desglose de Insumos para Inventario */}
                                <div className="md:col-span-6 space-y-4 bg-brand-sand/5 p-6 rounded-sm border border-brand-sand/20">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-charcoal cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={loadToInventory}
                                                onChange={(e) => setLoadToInventory(e.target.checked)}
                                                className="w-4 h-4 border-gray-300 rounded text-brand-terracotta focus:ring-brand-terracotta"
                                            />
                                            <span>📦 Cargar Compra en el Inventario de Elena Atelier</span>
                                        </label>
                                        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold bg-white px-2 py-0.5 border rounded-sm">
                                            {loadToInventory ? "Activo" : "Inactivo"}
                                        </span>
                                    </div>

                                    {loadToInventory && (
                                        <div className="space-y-4 animate-in fade-in duration-300">
                                            <p className="text-[10px] text-gray-400 font-medium">Elige las telas o insumos comprados. Su stock se incrementará automáticamente al guardar la factura.</p>
                                            
                                            <div className="space-y-3">
                                                {purchaseLines.map((line, idx) => (
                                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white p-3 border border-gray-100 rounded-sm shadow-sm">
                                                        {/* Select Item */}
                                                        <div className="md:col-span-6 space-y-1">
                                                            <label className="text-[8px] uppercase tracking-widest font-bold text-gray-400">Seleccionar Insumo / Tela *</label>
                                                            <select
                                                                required
                                                                value={line.inventory_item_id}
                                                                onChange={(e) => {
                                                                    const updated = [...purchaseLines];
                                                                    updated[idx].inventory_item_id = e.target.value;
                                                                    setPurchaseLines(updated);
                                                                }}
                                                                className="w-full p-2 bg-gray-50 border-none outline-none text-xs rounded-sm focus:ring-1 focus:ring-brand-terracotta text-brand-charcoal"
                                                            >
                                                                <option value="">-- Elegir de Inventario --</option>
                                                                {inventoryItems.map(item => (
                                                                    <option key={item.id} value={item.id}>
                                                                        {item.name} [{item.category.toUpperCase()}] ({item.stock} {item.unit})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* Quantity */}
                                                        <div className="md:col-span-2 space-y-1">
                                                            <label className="text-[8px] uppercase tracking-widest font-bold text-gray-400">Cantidad</label>
                                                            <input
                                                                type="number"
                                                                min="0.01"
                                                                step="any"
                                                                required
                                                                value={line.quantity}
                                                                onChange={(e) => {
                                                                    const updated = [...purchaseLines];
                                                                    updated[idx].quantity = Number(e.target.value);
                                                                    setPurchaseLines(updated);
                                                                }}
                                                                className="w-full p-2 bg-gray-50 border-none outline-none text-xs rounded-sm focus:ring-1 focus:ring-brand-terracotta text-right text-brand-charcoal"
                                                            />
                                                        </div>

                                                        {/* Price Unit */}
                                                        <div className="md:col-span-3 space-y-1">
                                                            <label className="text-[8px] uppercase tracking-widest font-bold text-gray-400">Costo Unit ($)</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                required
                                                                value={line.price_unit}
                                                                onChange={(e) => {
                                                                    const updated = [...purchaseLines];
                                                                    updated[idx].price_unit = Number(e.target.value);
                                                                    setPurchaseLines(updated);
                                                                }}
                                                                className="w-full p-2 bg-gray-50 border-none outline-none text-xs rounded-sm focus:ring-1 focus:ring-brand-terracotta text-right text-brand-charcoal"
                                                            />
                                                        </div>

                                                        {/* Remove button */}
                                                        <div className="md:col-span-1 flex justify-center pb-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (purchaseLines.length > 1) {
                                                                        setPurchaseLines(purchaseLines.filter((_, i) => i !== idx));
                                                                    }
                                                                }}
                                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                                title="Quitar Fila"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setPurchaseLines([...purchaseLines, { inventory_item_id: '', quantity: 1, price_unit: 0 }])}
                                                className="px-4 py-2 border border-dashed border-gray-200 text-gray-400 hover:text-brand-terracotta hover:border-brand-terracotta transition-all text-[9px] uppercase tracking-widest font-bold rounded-sm bg-white flex items-center gap-1.5"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Agregar Insumo a la Lista
                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Concepto Detallado</label>
                                    <input name="description" required type="text" placeholder="Ej: Compra de insumos quincenal" className="w-full bg-gray-50 p-4 text-sm outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Monto Total Bruto (CLP)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal font-bold">$</span>
                                        {loadToInventory ? (
                                            <input 
                                                key="controlled-amount"
                                                name="total_amount" 
                                                required 
                                                type="number" 
                                                readOnly
                                                value={purchaseLines.reduce((sum, line) => sum + (Number(line.quantity || 0) * Number(line.price_unit || 0)), 0)} 
                                                className="w-full bg-amber-50 pl-8 p-4 text-xl outline-none border border-amber-200 rounded-sm font-serif font-bold text-brand-charcoal cursor-not-allowed" 
                                            />
                                        ) : (
                                            <input 
                                                key="uncontrolled-amount"
                                                name="total_amount" 
                                                required 
                                                type="number" 
                                                placeholder="Total" 
                                                className="w-full bg-brand-terracotta/5 pl-8 p-4 text-xl outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm font-serif font-bold text-brand-charcoal" 
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-6 pt-6 border-t border-gray-50">
                                    <button 
                                        disabled={isRegistering}
                                        type="submit" 
                                        className="w-full bg-brand-charcoal text-white py-5 text-xs uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all flex items-center justify-center gap-3 shadow-xl rounded-sm"
                                    >
                                        {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        EJECUTAR REGISTRO CONTABLE V2
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
                            <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                <History className="w-4 h-4 text-gray-400" />
                                <h3 className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Libro de Documentos Recientes</h3>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr className="text-[9px] uppercase tracking-widest text-gray-400">
                                        <th className="p-4 font-bold">Fecha / Documento</th>
                                        <th className="p-4 font-bold">Proveedor (RUT)</th>
                                        <th className="p-4 font-bold">Detalle / Ítem</th>
                                        <th className="p-4 font-bold text-right">Monto Total</th>
                                        <th className="p-4 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentDocs.length === 0 ? (
                                        <tr><td colSpan={5} className="p-12 text-center text-gray-400 italic text-sm font-serif">No hay documentos registrados este periodo</td></tr>
                                    ) : (
                                        recentDocs.map((doc: any) => (
                                            <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="p-4">
                                                    <p className="text-xs text-gray-500 mb-1">{new Date(doc.date).toLocaleDateString('es-CL')}</p>
                                                    <span className="text-[9px] font-bold bg-brand-charcoal text-white px-2 py-1 rounded-sm uppercase">{doc.document_type}</span>
                                                    <span className="text-[10px] font-mono text-gray-400 ml-2">#{doc.document_number}</span>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-xs font-bold text-brand-charcoal">{doc.providers?.business_name || 'Desconocido'}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono">{doc.providers?.rut || 'S/RUT'}</p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-xs text-gray-600 truncate max-w-[200px]">{doc.description}</p>
                                                    <span className="text-[8px] uppercase font-bold bg-gray-100 text-gray-400 px-1">{doc.expense_item}</span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <p className="text-sm font-bold text-brand-charcoal">
                                                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(doc.total_amount)}
                                                    </p>
                                                    <div className="flex flex-col items-end gap-1 mt-1">
                                                        <span className="text-[8px] text-gray-400 uppercase tracking-tighter">Neto: {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(doc.net_amount)}</span>
                                                        <span className="text-[8px] text-brand-terracotta font-bold uppercase tracking-tighter">IVA (19%): {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(doc.vat_amount)}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button 
                                                        onClick={() => handleDeleteDoc(doc.id)}
                                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                                                        title="Eliminar documento y revertir montos"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-sm">
                            <h2 className="font-serif text-xl mb-6 text-brand-charcoal leading-none">Configuración</h2>
                            <form onSubmit={handleSaveSettings} className="space-y-8">
                                <div className="space-y-4 p-6 bg-brand-sand/10 rounded-sm border border-brand-sand/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calculator className="w-4 h-4 text-brand-terracotta" />
                                        <h3 className="text-[10px] uppercase font-bold tracking-widest text-brand-charcoal">Calibrador de Rentabilidad</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-between">
                                            Capacidad Taller (Hrs/Mes)
                                            <span className="text-[8px] text-gray-300 flex items-center gap-1"><Info className="w-2 h-2" /> 160 hrs = 1 Persona Full-time</span>
                                        </label>
                                        <input 
                                            type="number" 
                                            value={workshopCapacity} 
                                            onChange={(e) => setWorkshopCapacity(Number(e.target.value))}
                                            className="w-full bg-white p-4 text-lg font-serif outline-none border border-gray-100 focus:border-brand-terracotta rounded-sm" 
                                        />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={handleCalculateSuggested}
                                        disabled={isCalculating}
                                        className="w-full bg-brand-terracotta text-white py-3 text-[10px] uppercase font-bold hover:bg-brand-charcoal transition-all rounded-sm flex items-center justify-center gap-2"
                                    >
                                        {isCalculating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calculator className="w-3 h-3" />}
                                        Calcular Sugerido (Base Costos Reales)
                                    </button>
                                    {suggestedData && (
                                        <div className="pt-4 mt-4 border-t border-brand-sand/30 text-center animate-in fade-in slide-in-from-top-2">
                                            <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">Fórmula: {new Intl.NumberFormat('es-CL').format(suggestedData.total)} / {workshopCapacity} hrs</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Tarifa Sugerida:</p>
                                            <p className="text-2xl font-serif text-brand-terracotta font-bold">
                                                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(suggestedData.rate)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Tarifa Hora Hombre Final (CLP)</label>
                                    <input 
                                        name="labor_hourly_rate" 
                                        type="number" 
                                        value={currentHourlyRate ?? 0} 
                                        onChange={(e) => setCurrentHourlyRate(Number(e.target.value))}
                                        className="w-full bg-brand-charcoal/5 p-4 text-xl font-serif outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm font-bold text-brand-charcoal" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-400">Margen de Utilidad (%)</label>
                                    <input 
                                        name="default_margin_percentage" 
                                        type="number" 
                                        value={settings.default_margin_percentage ?? 0} 
                                        onChange={(e) => setSettings({...settings, default_margin_percentage: Number(e.target.value)})}
                                        className="w-full bg-gray-50 p-4 text-xl font-serif outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm" 
                                    />
                                </div>
                                <button type="submit" className="w-full bg-brand-charcoal text-white py-5 text-[10px] uppercase font-bold hover:bg-brand-terracotta transition-all rounded-sm shadow-md flex items-center justify-center gap-2">
                                    {saveStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    {saveStatus === 'success' ? 'Sincronizado con Éxito' : 'Actualizar Estructura Maestra'}
                                </button>
                            </form>
                        </div>

                        <div className="bg-brand-charcoal text-white p-10 rounded-sm shadow-2xl relative overflow-hidden border-t-4 border-brand-terracotta">
                            <h2 className="font-serif text-2xl mb-10 flex items-center gap-3 relative z-10 uppercase tracking-tighter">
                                <Receipt className="w-6 h-6 text-brand-terracotta" />
                                Monitor Tributario
                            </h2>
                            <div className="space-y-8 relative z-10">
                                <div className="flex justify-between border-b border-white/5 pb-4">
                                    <span className="text-white/40 text-[10px] uppercase tracking-widest">IVA Débito</span>
                                    <span className="font-bold text-sm">$1.200.000</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-4">
                                    <span className="text-white/40 text-[10px] uppercase tracking-widest">IVA Crédito</span>
                                    <span className="font-bold text-sm text-green-400">$392.500</span>
                                </div>
                                <div className="flex justify-between pt-6">
                                    <div className="space-y-1">
                                        <span className="font-bold text-brand-terracotta uppercase text-[10px] tracking-widest block">Impuesto F29</span>
                                        <p className="text-[9px] text-white/30 italic">Cálculo basado en Libro V2</p>
                                    </div>
                                    <span className="text-3xl font-serif">$807.500</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
