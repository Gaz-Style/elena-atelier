'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Users, Receipt, DollarSign, Settings, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { getCostSettings, saveCostSettings } from './actions';

export default function FinanceDashboard() {
    const [settings, setSettings] = React.useState<any>(null);
    const [isSaving, setIsSaving] = React.useState(false);
    const [saveStatus, setSaveStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

    React.useEffect(() => {
        getCostSettings().then(setSettings);
    }, []);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus('idle');
        const formData = new FormData(e.currentTarget);
        const result = await saveCostSettings(formData);
        setIsSaving(false);
        if (result.success) {
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } else {
            setSaveStatus('error');
        }
    };

    if (!settings) {
        return (
            <div className="min-h-screen bg-brand-sand/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-terracotta" />
            </div>
        );
    }

    const metrics = [
        { title: 'Ventas Netas', value: '$4.250.000', icon: DollarSign, trend: '+12%', color: 'text-green-600' },
        { title: 'Gastos Operativos', value: '$1.800.000', icon: TrendingUp, trend: '-5%', color: 'text-red-500' },
        { title: 'IVA por Pagar (19%)', value: '$807.500', icon: Receipt, trend: 'Calculado', color: 'text-brand-terracotta' },
        { title: 'Personal (Buk)', value: '8 Activos', icon: Users, trend: 'Sincronizado', color: 'text-blue-600' },
    ];

    return (
        <div className="min-h-screen bg-brand-sand/20 p-8 pt-20 font-sans">
            <div className="max-w-7xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Volver al Dashboard
                        </Link>
                        <h1 className="font-serif text-5xl">Dashboard Financiero</h1>
                        <p className="text-text-secondary mt-2">Control de ingresos, egresos e impuestos - elenalacosturera</p>
                    </div>
                    <div className="space-x-4">
                        <button className="px-6 py-2 border border-brand-charcoal text-xs uppercase tracking-widest hover:bg-brand-charcoal hover:text-white transition-all">
                            Exportar Informe SII
                        </button>
                    </div>
                </header>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {metrics.map((m) => (
                        <div key={m.title} className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                            <div className="flex justify-between items-start">
                                <m.icon className={`w-5 h-5 ${m.color}`} />
                                <span className="text-[10px] bg-gray-50 px-2 py-1 rounded-full text-gray-400 font-medium uppercase tracking-tighter">
                                    {m.trend}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">{m.title}</p>
                                <p className="text-2xl font-serif">{m.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {/* Sales chart placeholder */}
                    <div className="md:col-span-2 bg-white p-10 border border-gray-100 flex flex-col space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="font-serif text-2xl">Estructura de Costos Administrativos</h2>
                            <Settings className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">Tarifa Hora Hombre (CLP)</label>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-serif text-gray-400">$</span>
                                    <input 
                                        name="labor_hourly_rate"
                                        type="number" 
                                        defaultValue={settings.labor_hourly_rate} 
                                        className="w-full bg-gray-50 border-none p-3 text-lg font-serif outline-none focus:ring-1 focus:ring-brand-terracotta" 
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 italic">Costo por hora de costura y confección.</p>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">Costo Fijo Operativo (CLP)</label>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-serif text-gray-400">$</span>
                                    <input 
                                        name="operational_fixed_cost"
                                        type="number" 
                                        defaultValue={settings.operational_fixed_cost} 
                                        className="w-full bg-gray-50 border-none p-3 text-lg font-serif outline-none focus:ring-1 focus:ring-brand-terracotta" 
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 italic">Gastos generales base (luz, arriendo, etc).</p>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">Margen de Ganancia Estándar (%)</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        name="default_margin_percentage"
                                        type="number" 
                                        defaultValue={settings.default_margin_percentage} 
                                        className="w-full bg-gray-50 border-none p-3 text-lg font-serif outline-none focus:ring-1 focus:ring-brand-terracotta" 
                                    />
                                    <span className="text-xl font-serif text-gray-400">%</span>
                                </div>
                                <p className="text-[10px] text-gray-400 italic">Margen de utilidad sobre el costo total.</p>
                            </div>

                            <div className="flex items-end">
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    className={`w-full py-4 text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${
                                        saveStatus === 'success' ? 'bg-green-600 text-white' : 'bg-brand-charcoal text-white hover:bg-brand-terracotta'
                                    }`}
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    {saveStatus === 'success' ? 'Guardado Correctamente' : 'Guardar Estructura'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Tax summary list */}
                    <div className="bg-brand-charcoal text-white p-10 flex flex-col">
                        <h2 className="font-serif text-2xl mb-8">Resumen Tributario</h2>
                        <div className="space-y-6 flex-1">
                            <div className="flex justify-between border-b border-white/10 pb-4">
                                <span className="text-white/60 text-sm">IVA Débito</span>
                                <span>$1.200.000</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-4">
                                <span className="text-white/60 text-sm">IVA Crédito</span>
                                <span>$392.500</span>
                            </div>
                            <div className="flex justify-between pt-4">
                                <span className="font-medium text-brand-terracotta uppercase text-xs tracking-widest">Saldo F29 a Pagar</span>
                                <span className="text-xl font-serif">$807.500</span>
                            </div>
                        </div>
                        <button className="w-full bg-white text-brand-charcoal py-4 mt-8 text-xs uppercase tracking-widest hover:bg-brand-terracotta hover:text-white transition-all">
                            Generar Boletas SimpleAPI
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
