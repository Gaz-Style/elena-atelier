'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    DollarSign,
    Users,
    TrendingUp,
    ShoppingBag,
    Settings,
    Scissors,
    ArrowRight,
    ShieldCheck,
    Package,
    Receipt,
    Activity,
    Award,
    TrendingDown,
    PieChart,
    BarChart
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getDashboardData } from './actions';

export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getDashboardData();
                setDashboardData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const modules = [
        {
            title: 'Punto de Venta (POS)',
            desc: 'Terminal de ventas showroom y emisión de boletas.',
            href: '/admin/pos',
            icon: ShoppingBag,
            color: 'bg-orange-100 text-orange-700'
        },
        {
            title: 'Planilla de Ventas',
            desc: 'Libro Mayor de Ventas, ingresos y trazabilidad financiera.',
            href: '/admin/sales',
            icon: DollarSign,
            color: 'bg-green-100 text-green-700'
        },
        {
            title: 'Gobernanza de Producción',
            desc: 'Control Kanban del taller y tiempos de entrega.',
            href: '/admin/production',
            icon: Scissors,
            color: 'bg-brand-sand/50 text-brand-charcoal'
        },
        {
            title: 'Live Production Board',
            desc: 'Monitoreo en vivo de costuras y retrasos para pantallas del taller.',
            href: '/admin/production-board',
            icon: Activity,
            color: 'bg-emerald-100 text-emerald-700'
        },
        {
            title: 'Catálogo de Servicios',
            desc: 'Administración de productos, precios y oferta comercial.',
            href: '/admin/catalog',
            icon: Package,
            color: 'bg-indigo-100 text-indigo-700'
        },
        {
            title: 'Finanzas & Contabilidad',
            desc: 'Libro mayor, P&L, impuestos SII y conciliación bancaria.',
            href: '/admin/finance',
            icon: DollarSign,
            color: 'bg-green-100 text-green-700'
        },
        {
            title: 'Inventario General',
            desc: 'Control de metros de telas, hilos, agujas y suministros de taller.',
            href: '/admin/inventory',
            icon: Package,
            color: 'bg-gray-200 text-brand-charcoal'
        },
        {
            title: 'CRM & Clienteling',
            desc: 'Gestión de clientas, historial y medidas corporales.',
            href: '/admin/crm',
            icon: Users,
            color: 'bg-rose-100 text-rose-700'
        },
        {
            title: 'Crecimiento & Marketing',
            desc: 'Métricas de ROAS, SEO/GEO Authority e influencia.',
            href: '/admin/marketing',
            icon: TrendingUp,
            color: 'bg-purple-100 text-purple-700'
        },
        {
            title: 'Recursos Humanos (Buk)',
            desc: 'Gestión de personal, nómina, vacaciones y contratos.',
            href: '/admin/hr',
            icon: Users,
            color: 'bg-blue-100 text-blue-700'
        },
        {
            title: 'Contabilidad ERP',
            desc: 'Libro mayor, asientos contables y centros de costo bajo norma.',
            href: '/admin/accounting',
            icon: Receipt,
            color: 'bg-emerald-100 text-emerald-700'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24 space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-brand-terracotta">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Consola de Administración Central</span>
                        </div>
                        <h1 className="font-serif text-5xl text-brand-charcoal">elenalacosturera OS</h1>
                        <p className="text-gray-500 mt-2">Sistema Operativo de Gestión de Lujo - Tabancura 1091</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] uppercase text-gray-400 font-bold">Estado del Sistema</p>
                            <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span> Operativo Local
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-brand-charcoal flex items-center justify-center text-white font-bold text-xs">
                            EA
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-brand-terracotta animate-pulse" />
                    </div>
                ) : dashboardData && (
                    <div className="space-y-8">
                        {/* Global Overview Section (Real KPIs) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                            <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col justify-between">
                                <p className="text-[10px] uppercase text-gray-400 tracking-widest mb-2 font-bold">Ventas del Mes</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-serif text-brand-charcoal">
                                        ${dashboardData.kpis.salesThisMonth.toLocaleString('es-CL')}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col justify-between">
                                <p className="text-[10px] uppercase text-gray-400 tracking-widest mb-2 font-bold">Órdenes Activas</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-serif text-brand-charcoal">
                                        {dashboardData.kpis.activeOrdersCount}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col justify-between">
                                <p className="text-[10px] uppercase text-gray-400 tracking-widest mb-2 font-bold">Ticket Promedio</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-serif text-brand-charcoal">
                                        ${dashboardData.kpis.avgTicket.toLocaleString('es-CL')}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col justify-between">
                                <p className="text-[10px] uppercase text-gray-400 tracking-widest mb-2 font-bold">Salud del Taller</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-serif text-brand-charcoal">
                                        Óptimo
                                    </p>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> OK
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Rankings Section */}
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Top Productos Más Vendidos */}
                            <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <Award className="w-5 h-5 text-brand-terracotta" />
                                    <h3 className="font-serif text-xl text-brand-charcoal">Top 5 Más Vendidos</h3>
                                </div>
                                <div className="space-y-4">
                                    {dashboardData.topProducts.map((p: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                                                <span className="text-sm font-medium text-brand-charcoal">{p.name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-brand-terracotta bg-brand-sand/20 px-2 py-1 rounded-sm">
                                                {p.count} ventas
                                            </span>
                                        </div>
                                    ))}
                                    {dashboardData.topProducts.length === 0 && (
                                        <p className="text-sm text-gray-500 italic">No hay suficientes datos de ventas aún.</p>
                                    )}
                                </div>
                            </div>

                            {/* Top Productos con Mejor Margen */}
                            <div className="bg-white border border-gray-100 rounded-sm p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <PieChart className="w-5 h-5 text-emerald-600" />
                                    <h3 className="font-serif text-xl text-brand-charcoal">Top 5 Mejor Margen</h3>
                                </div>
                                <div className="space-y-4">
                                    {dashboardData.bestMarginProducts.map((p: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                                                <span className="text-sm font-medium text-brand-charcoal">{p.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-sm">
                                                    {p.marginPct}% Margen
                                                </span>
                                                <p className="text-[10px] text-gray-400 mt-1">+${p.marginValue.toLocaleString('es-CL')} netos</p>
                                            </div>
                                        </div>
                                    ))}
                                    {dashboardData.bestMarginProducts.length === 0 && (
                                        <p className="text-sm text-gray-500 italic">No hay suficientes productos en catálogo aún.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Module Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {modules.map((m) => (
                        <Link
                            key={m.href}
                            href={m.href}
                            className="group bg-white p-8 rounded-sm border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-terracotta transition-all flex flex-col justify-between h-64"
                        >
                            <div className="space-y-6">
                                <div className={`w-12 h-12 rounded-sm ${m.color} flex items-center justify-center`}>
                                    <m.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-2xl mb-2 group-hover:text-brand-terracotta transition-colors">{m.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-brand-charcoal transition-all">
                                Ingresar al módulo <ArrowRight className="w-3 h-3" />
                            </div>
                        </Link>
                    ))}

                    {/* System Logs Card */}
                    <Link 
                        href="/admin/logs"
                        className="bg-brand-charcoal text-white p-8 rounded-sm border border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-sand transition-all flex flex-col justify-center items-center text-center h-64"
                    >
                        <Settings className="w-8 h-8 text-brand-sand mb-4" />
                        <h3 className="text-xs uppercase tracking-widest font-bold text-brand-sand">System Logs & Webhooks</h3>
                        <p className="text-[10px] mt-2 text-white/60">Monitoreo en vivo de pasarelas de pago y eventos</p>
                    </Link>
                </div>
            </main>
        </div>
    );
}
