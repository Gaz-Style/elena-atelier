'use client';

import React from 'react';
import Link from 'next/link';
import {
    DollarSign,
    Users,
    TrendingUp,
    ShoppingBag,
    Settings,
    Scissors,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AdminDashboard() {
    const modules = [
        {
            title: 'Finanzas & Contabilidad',
            desc: 'Libro mayor, P&L, impuestos SII y conciliación bancaria.',
            href: '/admin/finance',
            icon: DollarSign,
            color: 'bg-green-100 text-green-700'
        },
        {
            title: 'Recursos Humanos (Buk)',
            desc: 'Gestión de personal, nómina, vacaciones y contratos.',
            href: '/admin/hr',
            icon: Users,
            color: 'bg-blue-100 text-blue-700'
        },
        {
            title: 'Crecimiento & Marketing',
            desc: 'Métricas de ROAS, SEO/GEO Authority e influencia.',
            href: '/admin/marketing',
            icon: TrendingUp,
            color: 'bg-purple-100 text-purple-700'
        },
        {
            title: 'CRM & Clienteling',
            desc: 'Gestión de clientas, historial y medidas corporales.',
            href: '/admin/crm',
            icon: Users, // Using Users icon here since it's imported
            color: 'bg-rose-100 text-rose-700'
        },
        {
            title: 'Punto de Venta (POS)',
            desc: 'Terminal de ventas showroom y emisión de boletas.',
            href: '/admin/pos',
            icon: ShoppingBag,
            color: 'bg-orange-100 text-orange-700'
        },
        {
            title: 'Gobernanza de Producción',
            desc: 'Control Kanban del taller y tiempos de entrega.',
            href: '/admin/production',
            icon: Scissors,
            color: 'bg-brand-sand/50 text-brand-charcoal'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-8 pt-32 pb-24 space-y-12">
                <header className="flex justify-between items-end border-b border-gray-200 pb-8">
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

                    {/* Settings Placeholder Card */}
                    <div className="bg-gray-100/50 p-8 rounded-sm border border-dashed border-gray-200 flex flex-col items-center justify-center text-center opacity-60">
                        <Settings className="w-8 h-8 text-gray-400 mb-4" />
                        <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400">Configuración Global</h3>
                        <p className="text-[10px] mt-2 text-gray-400">Logs de sistema y seguridad</p>
                    </div>
                </div>

                {/* Global Overview Section */}
                <footer className="grid md:grid-cols-4 gap-8 pt-12">
                    {[
                        { label: 'Ventas Hoy', value: '$450.000', trend: '+5%' },
                        { label: 'Órdenes Activas', value: '18', trend: 'Capacidad 80%' },
                        { label: 'Visitantes VIP', value: '4', trend: 'Hoy' },
                        { label: 'Tickets Soporte', value: '0', trend: 'Limpio' },
                    ].map(stat => (
                        <div key={stat.label} className="p-6 border-l border-gray-200">
                            <p className="text-[10px] uppercase text-gray-400 tracking-widest mb-1">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-serif">{stat.value}</p>
                                <span className="text-[8px] font-bold text-green-600">{stat.trend}</span>
                            </div>
                        </div>
                    ))}
                </footer>
            </main>
        </div>
    );
}
