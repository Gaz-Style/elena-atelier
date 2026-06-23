'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Receipt, DollarSign, Settings, Save, Loader2, CheckCircle2, Building2, Plus, Calendar, Hash, Tag, FileText, History, User, Trash2, Calculator, Info } from 'lucide-react';
import { getCostSettings, saveCostSettings, getExpenses, getFixedCosts, registerPurchaseDocument, getRecentDocuments, deletePurchaseDocument, calculateSuggestedRate, getSalesMetrics } from './actions';
import { getInventoryItems } from '../inventory/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

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
    const [salesMetrics, setSalesMetrics] = useState<any>({ netSales: 0, ivaDebito: 0, ivaCredito: 0, f29: 0, totalGrossSales: 0 });

    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [loadToInventory, setLoadToInventory] = useState(false);
    const [purchaseLines, setPurchaseLines] = useState<any[]>([{ inventory_item_id: '', quantity: 1, price_unit: 0 }]);
    const [providerRut, setProviderRut] = useState('');

    const formatRUT = (value: string) => {
        let rut = value.replace(/[^0-9kK]/g, '').toUpperCase();
        if (rut.length === 0) return '';
        if (rut.length <= 1) return rut;
        
        let result = '-' + rut.charAt(rut.length - 1);
        let digitCount = 0;
        
        for (let i = rut.length - 2; i >= 0; i--) {
            result = rut.charAt(i) + result;
            digitCount++;
            if (digitCount === 3 && i !== 0) {
                result = '.' + result;
                digitCount = 0;
            }
        }
        return result;
    };

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

        const [expData, fixedData, docsData, salesData] = await Promise.all([
            getExpenses(m, y),
            getFixedCosts(m, y),
            getRecentDocuments(),
            getSalesMetrics(m, y)
        ]);

        const totalExp = expData.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
        const totalFixed = fixedData.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);

        setTotalExpenses(totalExp);
        setTotalFixedCosts(totalFixed);
        setRecentDocs(docsData);
        setSalesMetrics(salesData);
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
            
            const calculatedTotal = validLines.reduce((sum, line) => sum + (Number(line.quantity || 0) * Number(line.price_unit || 0)), 0);
            formData.set('total_amount', calculatedTotal.toString());
        }

        const result = await registerPurchaseDocument(formData);
        setIsRegistering(false);
        if (result.success) {
            form.reset();
            setProviderRut('');
            setLoadToInventory(false);
            setPurchaseLines([{ inventory_item_id: '', quantity: 1, price_unit: 0 }]);
            
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const formatCurrency = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

    const metrics = [
        { title: 'Ventas Netas', value: formatCurrency(salesMetrics.netSales), icon: DollarSign, trend: '+12%', link: null },
        { title: 'Gastos Variables (Mes)', value: formatCurrency(totalExpenses), icon: TrendingUp, trend: 'Dinámico', link: '/admin/finance/expenses' },
        { title: 'Costos Fijos (Planilla)', value: formatCurrency(totalFixedCosts), icon: Building2, trend: 'Configurado', link: '/admin/finance/fixed-costs' },
        { title: 'IVA por Pagar (19%)', value: formatCurrency(salesMetrics.f29), icon: Receipt, trend: 'Calculado', link: null },
    ];

    const inputClasses = "flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-8 pt-20 font-sans">
            <div className="max-w-7xl mx-auto space-y-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
                    <div>
                        <h1 className="font-serif text-5xl text-foreground leading-none">Dashboard Financiero</h1>
                        <p className="text-muted-foreground mt-2 italic font-serif text-lg">"Arquitectura de Clase Mundial para Elena Atelier"</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {metrics.map((m) => (
                        <Card key={m.title} className="flex flex-col justify-between h-36 rounded-sm shadow-none border-border/50">
                            <CardHeader className="p-6 pb-2">
                                <div className="flex justify-between items-start w-full">
                                    <m.icon className="w-5 h-5 text-primary" />
                                    {m.link && (
                                        <Link href={m.link} className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline">Gestionar →</Link>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-0">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{m.title}</p>
                                <p className="text-2xl font-serif text-foreground">{m.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="rounded-sm shadow-sm border-border">
                            <CardHeader className="border-b border-border/50 pb-6 mb-6 px-8 pt-8">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-sm">
                                        <Plus className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="font-serif text-2xl text-foreground leading-none uppercase tracking-tighter">Captador de Datos Pro</CardTitle>
                                        <CardDescription className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Registro de Compras con Desglose Tributario</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="px-8 pb-8">
                                <form onSubmit={handleRegisterDoc} className="grid grid-cols-1 md:grid-cols-6 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2"><User className="w-3 h-3" /> RUT Proveedor</Label>
                                        <Input 
                                            name="provider_rut" 
                                            required 
                                            type="text" 
                                            placeholder="Ej: 76.123.456-7" 
                                            value={providerRut}
                                            onChange={(e) => setProviderRut(formatRUT(e.target.value))}
                                            className="font-mono bg-secondary/30" 
                                        />
                                    </div>
                                    <div className="md:col-span-4 space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Razón Social / Nombre Comercio</Label>
                                        <Input name="provider_name" required type="text" placeholder="Ej: Telas Santiago S.A." className="bg-secondary/30" />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2"><Calendar className="w-3 h-3" /> Fecha</Label>
                                        <Input name="date" required type="date" defaultValue={new Date().toISOString().split('T')[0]} className="bg-secondary/30" />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2"><FileText className="w-3 h-3" /> Tipo Documento</Label>
                                        <select name="document_type" className={`${inputClasses} bg-secondary/30`}>
                                            <option value="Factura">Factura de Compra</option>
                                            <option value="Boleta">Boleta de Venta</option>
                                            <option value="Voucher">Voucher / Recibo</option>
                                            <option value="Honorarios">Boleta Honorarios</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2"><Hash className="w-3 h-3" /> N° Documento</Label>
                                        <Input name="document_number" required type="text" placeholder="Ej: 45601" className="bg-secondary/30" />
                                    </div>

                                    <div className="md:col-span-3 space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2"><Tag className="w-3 h-3" /> Clasificación ERP</Label>
                                        <select name="category" className={`${inputClasses} font-bold border-primary/20 bg-primary/5`}>
                                            <option value="variable">Gasto Variable (Materia Prima/Producción)</option>
                                            <option value="fixed">Costo Fijo (Administración/Estructura)</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Categoría / Ítem Destino</Label>
                                        <select name="expense_item" className={`${inputClasses} bg-secondary/30`}>
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

                                    <div className="md:col-span-6 space-y-4 bg-secondary/10 p-6 rounded-sm border border-border">
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground cursor-pointer select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={loadToInventory}
                                                    onChange={(e) => setLoadToInventory(e.target.checked)}
                                                    className="w-4 h-4 border-input rounded text-primary focus:ring-primary"
                                                />
                                                <span>📦 Cargar Compra en el Inventario de Elena Atelier</span>
                                            </label>
                                            <Badge variant={loadToInventory ? "default" : "outline"} className="text-[9px] uppercase tracking-widest rounded-sm">
                                                {loadToInventory ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </div>

                                        {loadToInventory && (
                                            <div className="space-y-4 animate-in fade-in duration-300 pt-2">
                                                <p className="text-[10px] text-muted-foreground font-medium">Elige las telas o insumos comprados. Su stock se incrementará automáticamente al guardar la factura.</p>
                                                
                                                <div className="space-y-3">
                                                    {purchaseLines.map((line, idx) => (
                                                        <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-background p-3 border border-border/50 rounded-sm shadow-sm">
                                                            <div className="md:col-span-6 space-y-1">
                                                                <Label className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground">Seleccionar Insumo / Tela *</Label>
                                                                <select
                                                                    required
                                                                    value={line.inventory_item_id}
                                                                    onChange={(e) => {
                                                                        const updated = [...purchaseLines];
                                                                        updated[idx].inventory_item_id = e.target.value;
                                                                        setPurchaseLines(updated);
                                                                    }}
                                                                    className={`${inputClasses} text-xs`}
                                                                >
                                                                    <option value="">-- Elegir de Inventario --</option>
                                                                    {inventoryItems.map(item => (
                                                                        <option key={item.id} value={item.id}>
                                                                            {item.name} [{item.category.toUpperCase()}] ({item.stock} {item.unit})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div className="md:col-span-2 space-y-1">
                                                                <Label className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground">Cantidad</Label>
                                                                <Input
                                                                    type="number" min="0.01" step="any" required
                                                                    value={line.quantity}
                                                                    onChange={(e) => {
                                                                        const updated = [...purchaseLines];
                                                                        updated[idx].quantity = Number(e.target.value);
                                                                        setPurchaseLines(updated);
                                                                    }}
                                                                    className="text-right text-xs"
                                                                />
                                                            </div>

                                                            <div className="md:col-span-3 space-y-1">
                                                                <Label className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground">Costo Unit ($)</Label>
                                                                <Input
                                                                    type="number" min="0" required
                                                                    value={line.price_unit}
                                                                    onChange={(e) => {
                                                                        const updated = [...purchaseLines];
                                                                        updated[idx].price_unit = Number(e.target.value);
                                                                        setPurchaseLines(updated);
                                                                    }}
                                                                    className="text-right text-xs"
                                                                />
                                                            </div>

                                                            <div className="md:col-span-1 flex justify-center pb-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (purchaseLines.length > 1) {
                                                                            setPurchaseLines(purchaseLines.filter((_, i) => i !== idx));
                                                                        }
                                                                    }}
                                                                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
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
                                                    className="px-4 py-2 border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary transition-all text-[9px] uppercase tracking-widest font-bold rounded-sm bg-background flex items-center gap-1.5"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Agregar Insumo a la Lista
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-4 space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Concepto Detallado</Label>
                                        <Input name="description" required type="text" placeholder="Ej: Compra de insumos quincenal" className="bg-secondary/30" />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Monto Total Bruto (CLP)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground font-bold">$</span>
                                            {loadToInventory ? (
                                                <Input 
                                                    name="total_amount" required type="number" readOnly
                                                    value={purchaseLines.reduce((sum, line) => sum + (Number(line.quantity || 0) * Number(line.price_unit || 0)), 0)} 
                                                    className="pl-8 text-lg font-serif font-bold text-foreground bg-secondary/50 cursor-not-allowed border-none" 
                                                />
                                            ) : (
                                                <Input 
                                                    name="total_amount" required type="number" placeholder="Total" 
                                                    className="pl-8 text-lg font-serif font-bold text-foreground focus-visible:ring-primary border-primary/20 bg-primary/5" 
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:col-span-6 pt-6 border-t border-border mt-2">
                                        <button 
                                            disabled={isRegistering}
                                            type="submit" 
                                            className="w-full bg-foreground text-background py-4 text-xs uppercase tracking-widest font-bold hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-sm rounded-sm"
                                        >
                                            {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            EJECUTAR REGISTRO CONTABLE V2
                                        </button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="rounded-sm shadow-sm border-border overflow-hidden">
                            <CardHeader className="bg-secondary/30 border-b border-border p-4 flex flex-row items-center gap-2 space-y-0">
                                <History className="w-4 h-4 text-muted-foreground" />
                                <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground m-0">Libro de Documentos Recientes</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-secondary/10">
                                            <tr className="text-[9px] uppercase tracking-widest text-muted-foreground">
                                                <th className="p-4 font-bold border-b border-border">Fecha / Documento</th>
                                                <th className="p-4 font-bold border-b border-border">Proveedor (RUT)</th>
                                                <th className="p-4 font-bold border-b border-border">Detalle / Ítem</th>
                                                <th className="p-4 font-bold text-right border-b border-border">Monto Total</th>
                                                <th className="p-4 text-center border-b border-border">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {recentDocs.length === 0 ? (
                                                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground italic text-sm font-serif">No hay documentos registrados este periodo</td></tr>
                                            ) : (
                                                recentDocs.map((doc: any) => (
                                                    <tr key={doc.id} className="hover:bg-secondary/20 transition-colors group">
                                                        <td className="p-4">
                                                            <p className="text-xs text-muted-foreground mb-1">{new Date(doc.date).toLocaleDateString('es-CL')}</p>
                                                            <Badge variant="outline" className="text-[9px] font-bold bg-foreground text-background px-2 py-0.5 rounded-sm uppercase">{doc.document_type}</Badge>
                                                            <span className="text-[10px] font-mono text-muted-foreground ml-2">#{doc.document_number}</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <p className="text-xs font-bold text-foreground">{doc.providers?.business_name || 'Desconocido'}</p>
                                                            <p className="text-[10px] text-muted-foreground font-mono">{doc.providers?.rut || 'S/RUT'}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <p className="text-xs text-foreground/80 truncate max-w-[200px]">{doc.description}</p>
                                                            <span className="text-[8px] uppercase font-bold bg-secondary text-muted-foreground px-1 py-0.5 rounded-sm mt-1 inline-block">{doc.expense_item}</span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <p className="text-sm font-bold text-foreground">
                                                                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(doc.total_amount)}
                                                            </p>
                                                            <div className="flex flex-col items-end gap-1 mt-1">
                                                                <span className="text-[8px] text-muted-foreground uppercase tracking-tighter">Neto: {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(doc.net_amount)}</span>
                                                                <span className="text-[8px] text-primary font-bold uppercase tracking-tighter">IVA (19%): {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(doc.vat_amount)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <button 
                                                                onClick={() => handleDeleteDoc(doc.id)}
                                                                className="p-2 text-muted-foreground/50 hover:text-destructive transition-colors rounded-full hover:bg-destructive/10"
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
                            </CardContent>
                        </Card>

                        <AccountsOrganizerCard />
                    </div>

                    <div className="space-y-10">
                        <Card className="rounded-sm shadow-sm border-border">
                            <CardHeader>
                                <CardTitle className="font-serif text-xl text-foreground leading-none">Configuración</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSaveSettings} className="space-y-8">
                                    <div className="space-y-4 p-6 bg-secondary/30 rounded-sm border border-border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calculator className="w-4 h-4 text-primary" />
                                            <h3 className="text-[10px] uppercase font-bold tracking-widest text-foreground">Calibrador de Rentabilidad</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-between">
                                                Capacidad Taller (Hrs/Mes)
                                                <span className="text-[8px] text-muted-foreground/70 flex items-center gap-1"><Info className="w-2 h-2" /> 160 hrs = 1 Persona</span>
                                            </Label>
                                            <Input 
                                                type="number" 
                                                value={workshopCapacity} 
                                                onChange={(e) => setWorkshopCapacity(Number(e.target.value))}
                                                className="bg-background text-lg font-serif border-border focus-visible:ring-primary" 
                                            />
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={handleCalculateSuggested}
                                            disabled={isCalculating}
                                            className="w-full bg-primary text-primary-foreground py-2 text-[10px] uppercase font-bold hover:bg-primary/90 transition-all rounded-sm flex items-center justify-center gap-2"
                                        >
                                            {isCalculating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calculator className="w-3 h-3" />}
                                            Calcular Sugerido (Base Costos Reales)
                                        </button>
                                        {suggestedData && (
                                            <div className="pt-4 mt-4 border-t border-border text-center animate-in fade-in slide-in-from-top-2">
                                                <p className="text-[8px] text-muted-foreground uppercase tracking-widest mb-1">Fórmula: {new Intl.NumberFormat('es-CL').format(suggestedData.total)} / {workshopCapacity} hrs</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Tarifa Sugerida:</p>
                                                <p className="text-2xl font-serif text-primary font-bold">
                                                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(suggestedData.rate)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tarifa Hora Hombre Final (CLP)</Label>
                                        <Input 
                                            name="labor_hourly_rate" 
                                            type="number" 
                                            value={currentHourlyRate ?? 0} 
                                            onChange={(e) => setCurrentHourlyRate(Number(e.target.value))}
                                            className="bg-secondary/10 text-xl font-serif font-bold text-foreground focus-visible:ring-primary" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Margen de Utilidad (%)</Label>
                                        <Input 
                                            name="default_margin_percentage" 
                                            type="number" 
                                            value={settings.default_margin_percentage ?? 0} 
                                            onChange={(e) => setSettings({...settings, default_margin_percentage: Number(e.target.value)})}
                                            className="bg-background text-xl font-serif focus-visible:ring-primary" 
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-foreground text-background py-4 text-[10px] uppercase font-bold hover:bg-primary transition-all rounded-sm shadow-sm flex items-center justify-center gap-2">
                                        {saveStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                        {saveStatus === 'success' ? 'Sincronizado con Éxito' : 'Actualizar Estructura Maestra'}
                                    </button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="bg-foreground text-background rounded-sm shadow-lg relative overflow-hidden border-t-2 border-t-primary border-transparent">
                            <CardHeader>
                                <CardTitle className="font-serif text-2xl flex items-center gap-3 relative z-10 uppercase tracking-tighter">
                                    <Receipt className="w-5 h-5 text-primary" />
                                    Monitor Tributario
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10">
                                <div className="flex justify-between border-b border-background/10 pb-3">
                                    <span className="text-background/50 text-[10px] uppercase tracking-widest">IVA Débito</span>
                                    <span className="font-bold text-sm">{formatCurrency(salesMetrics.ivaDebito)}</span>
                                </div>
                                <div className="flex justify-between border-b border-background/10 pb-3">
                                    <span className="text-background/50 text-[10px] uppercase tracking-widest">IVA Crédito</span>
                                    <span className="font-bold text-sm text-green-400">{formatCurrency(salesMetrics.ivaCredito)}</span>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <div className="space-y-1">
                                        <span className="font-bold text-primary uppercase text-[10px] tracking-widest block">Impuesto F29</span>
                                        <p className="text-[9px] text-background/40 italic">Cálculo basado en Libro V2</p>
                                    </div>
                                    <span className="text-3xl font-serif">{formatCurrency(salesMetrics.f29)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AccountsOrganizerCard() {
    const defaultCuentas = [
        { nombre: "Luz", monto: 24115 },
        { nombre: "Agua", monto: 65110 },
        { nombre: "Internet", monto: 14300 },
        { nombre: "Teléfono", monto: 43700 },
        { nombre: "Arriendo", monto: 280000 },
        { nombre: "GG.CC deuda", monto: 514000 },
        { nombre: "GG.CC Estacionamiento", monto: 89127 },
        { nombre: "Sueldo Elena", monto: 600000 },
        { nombre: "Sueldo costurera", monto: 600000 },
        { nombre: "Banigualdad", monto: 18400 }
    ];

    const [cuentas, setCuentas] = useState<any[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('elena_organizador_cuentas');
        if (stored) {
            try {
                setCuentas(JSON.parse(stored));
            } catch (e) {
                setCuentas(defaultCuentas);
            }
        } else {
            setCuentas(defaultCuentas);
        }
    }, []);

    const saveCuentas = (updated: any[]) => {
        setCuentas(updated);
        localStorage.setItem('elena_organizador_cuentas', JSON.stringify(updated));
    };

    const handleMontoChange = (idx: number, newVal: string) => {
        const updated = [...cuentas];
        updated[idx].monto = parseFloat(newVal) || 0;
        saveCuentas(updated);
    };

    const handleReset = () => {
        if (confirm("¿Estás seguro de restablecer los valores por defecto?")) {
            saveCuentas(defaultCuentas);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
    };

    const totalMensual = cuentas.reduce((sum, item) => sum + item.monto, 0);
    const totalSemanal = cuentas.reduce((sum, item) => sum + (item.monto / 4), 0);

    return (
        <Card className="rounded-sm shadow-sm border-border mt-8">
            <CardHeader className="border-b border-border/50 pb-6 mb-6 px-8 pt-8 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-sm">
                        <Calculator className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="font-serif text-2xl text-foreground leading-none uppercase tracking-tighter">Organizador de Cuentas</CardTitle>
                        <CardDescription className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Cálculo de Ahorro Semanal de Gastos Fijos</CardDescription>
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 border border-border text-[9px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-sm transition-all"
                >
                    Restablecer
                </button>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className="overflow-hidden border border-border rounded-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/20 text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-border">
                                <th className="p-4 border-r border-border">Concepto</th>
                                <th className="p-4 border-r border-border w-1/3">Monto Mensual ($)</th>
                                <th className="p-4 text-right w-1/3">Ahorro Semanal (25% / Mes)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-background">
                            {cuentas.map((item, idx) => (
                                <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                                    <td className="p-4 font-medium text-xs text-foreground border-r border-border">{item.nombre}</td>
                                    <td className="p-3 border-r border-border">
                                        <div className="relative flex items-center">
                                            <span className="absolute left-2.5 text-muted-foreground font-semibold text-xs">$</span>
                                            <input 
                                                type="number" 
                                                value={item.monto || ''} 
                                                onChange={(e) => handleMontoChange(idx, e.target.value)}
                                                className="w-full pl-6 pr-2 py-1.5 text-xs rounded bg-background border border-border focus:ring-1 focus:ring-primary outline-none font-mono text-foreground font-bold"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 text-right text-xs font-mono font-bold text-primary">
                                        {formatCurrency(item.monto / 4)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-primary/95 text-primary-foreground font-bold border-t-2 border-primary">
                                <td className="p-4 text-xs uppercase tracking-wider">TOTALES</td>
                                <td className="p-4 text-xs font-mono font-black border-l border-primary/20">
                                    {formatCurrency(totalMensual)}
                                </td>
                                <td className="p-4 text-right text-xs font-mono font-black border-l border-primary/20">
                                    {formatCurrency(totalSemanal)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="mt-6 bg-secondary/30 p-4 rounded-sm border border-border flex gap-3 items-start">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-foreground">Instrucciones y Funcionamiento</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                            Modifica cualquier valor en la columna central. El sistema guardará tus cambios automáticamente en este navegador y recalculará la cuota que necesitas separar cada semana (25% del total mensual) para cubrir las cuentas de forma planificada.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
