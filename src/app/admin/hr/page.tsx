'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Calendar, CreditCard, FileText, ChevronRight } from 'lucide-react';

export default function HRDashboard() {
    const [employees] = useState([
        { id: '001', name: 'Elena Sastre', role: 'Master Tailor', status: 'Activo', salary: '$2.500.000' },
        { id: '002', name: 'Marco Costura', role: 'Cortador Experto', status: 'Activo', salary: '$1.800.000' },
        { id: '003', name: 'Sofía Textil', role: 'Asistente de Diseño', status: 'Vacaciones', salary: '$1.200.000' },
    ]);

    const stats = [
        { title: 'Total Colaboradores', value: '12', icon: Users, color: 'text-brand-charcoal' },
        { title: 'Solicitudes Vacaciones', value: '3 Pendientes', icon: Calendar, color: 'text-brand-terracotta' },
        { title: 'Próxima Nómina', value: '25 Ene', icon: CreditCard, color: 'text-green-600' },
    ];

    return (
        <div className="min-h-screen bg-brand-sand/20 p-8 pt-24 font-sans">
            <div className="max-w-7xl mx-auto space-y-12">
                <header className="flex justify-between items-end border-b border-gray-200 pb-8">
                    <div>
                        <h1 className="font-serif text-5xl">Gestión de Talento (Buk)</h1>
                        <p className="text-text-secondary mt-2">Administración de RRHH, Contratos y Bienestar - elenalacosturera</p>
                    </div>
                    <button className="flex items-center gap-2 bg-brand-charcoal text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-brand-terracotta transition-all rounded-sm">
                        <UserPlus className="w-4 h-4" />
                        Nueva Contratación
                    </button>
                </header>

                {/* HR Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((s) => (
                        <div key={s.title} className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 flex items-center gap-6">
                            <div className={`p-4 bg-brand-sand/30 rounded-full ${s.color}`}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">{s.title}</p>
                                <p className="text-2xl font-serif">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {/* Employee List */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="font-serif text-2xl mb-4">Plantilla del Atelier</h2>
                        <div className="bg-white border border-gray-100 overflow-hidden rounded-sm">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-brand-sand/10 text-[10px] uppercase tracking-widest text-text-secondary">
                                        <th className="p-4 font-medium">Nombre</th>
                                        <th className="p-4 font-medium">Cargo</th>
                                        <th className="p-4 font-medium">Estado</th>
                                        <th className="p-4 font-medium">Salario</th>
                                        <th className="p-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {employees.map((emp) => (
                                        <tr key={emp.id} className="text-sm hover:bg-brand-sand/5 transition-colors group">
                                            <td className="p-4 font-medium">{emp.name}</td>
                                            <td className="p-4 text-text-secondary">{emp.role}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${emp.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {emp.status}
                                                </span>
                                            </td>
                                            <td className="p-4 font-serif">{emp.salary}</td>
                                            <td className="p-4 text-right">
                                                <button className="text-gray-300 group-hover:text-brand-terracotta transition-colors">
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* HR Actions & Buk Sync */}
                    <div className="space-y-8">
                        <div className="bg-brand-charcoal text-white p-8">
                            <h3 className="font-serif text-xl mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-brand-terracotta" />
                                Acciones Rápidas
                            </h3>
                            <div className="space-y-4">
                                <button className="w-full border border-white/20 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-brand-charcoal transition-all">
                                    Emitir Finiquito
                                </button>
                                <button className="w-full border border-white/20 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-brand-charcoal transition-all">
                                    Cargar Liquidaciones
                                </button>
                                <button className="w-full border border-white/20 py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-brand-charcoal transition-all">
                                    Aprobar Vacaciones
                                </button>
                            </div>
                        </div>

                        <div className="p-8 border border-gray-100 bg-white shadow-sm">
                            <h3 className="font-serif text-xl mb-4">Estado Buk API</h3>
                            <div className="flex items-center gap-2 mb-6 text-green-600">
                                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold uppercase tracking-widest">Sincronizado</span>
                            </div>
                            <p className="text-xs text-text-secondary leading-relaxed mb-6">
                                Última sincronización completa: hoy, 10:45 AM. Los datos de payroll están actualizados con la base central.
                            </p>
                            <button className="text-xs text-brand-terracotta font-bold uppercase tracking-widest border-b border-brand-terracotta/20 hover:border-brand-terracotta transition-all">
                                Forzar Sincronización Manual
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
