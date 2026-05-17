'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calculator, Landmark, PieChart, Search, ChevronRight, ChevronDown, ListFilter, Receipt, ShieldCheck } from 'lucide-react';
import { getChartOfAccounts } from './actions';
import Navbar from '@/components/Navbar';

export default function AccountingDashboard() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAccounts();
    }, []);

    async function fetchAccounts() {
        setLoading(true);
        const data = await getChartOfAccounts();
        setAccounts(data);
        setLoading(false);
    }

    const filteredAccounts = accounts.filter(acc => 
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        acc.code.includes(searchQuery)
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24 space-y-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Panel Principal
                        </Link>
                        <h1 className="font-serif text-5xl text-brand-charcoal">Contabilidad Corporativa</h1>
                        <p className="text-gray-500 mt-2 italic text-sm">Escalabilidad, Inmutabilidad y Partida Doble.</p>
                    </div>
                    
                    <div className="flex gap-4">
                        <Link href="/admin/accounting/ledger" className="bg-brand-charcoal text-white px-6 py-3 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all flex items-center gap-2">
                            <BookOpen className="w-4 h-4" /> Libro Mayor
                        </Link>
                        <Link href="/admin/accounting/results" className="bg-white border border-gray-200 text-brand-charcoal px-6 py-3 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
                            <PieChart className="w-4 h-4" /> Estado de Resultados
                        </Link>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Stats Sidebar */}
                    <div className="w-full lg:w-1/4 space-y-6">
                        <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm">
                            <ShieldCheck className="w-6 h-6 text-emerald-600 mb-4" />
                            <h3 className="font-serif text-lg mb-2">Normativa Fiscal</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">Plan de cuentas estructurado bajo estándar de 6 niveles con integridad de partida doble.</p>
                        </div>
                        
                        <div className="bg-brand-sand/20 p-6 rounded-sm border border-brand-sand/50">
                            <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/40 mb-2">Resumen Operativo</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-brand-sand/30 pb-2">
                                    <span className="text-xs">Cuentas Activas</span>
                                    <span className="text-sm font-bold">{accounts.length}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-brand-sand/30 pb-2">
                                    <span className="text-xs">Centros de Costo</span>
                                    <span className="text-sm font-bold">2</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart of Accounts List */}
                    <div className="w-full lg:w-3/4 space-y-6">
                        <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h2 className="font-serif text-xl">Plan de Cuentas (Chart of Accounts)</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar código o nombre..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-sm outline-none focus:ring-1 focus:ring-brand-terracotta text-sm w-64"
                                    />
                                </div>
                            </div>

                            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                                {loading ? (
                                    <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-brand-terracotta mx-auto" /></div>
                                ) : filteredAccounts.length === 0 ? (
                                    <div className="p-20 text-center text-gray-400">No se encontraron cuentas.</div>
                                ) : (
                                    filteredAccounts.map((acc) => (
                                        <div 
                                            key={acc.id} 
                                            className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group ${acc.level === 1 ? 'bg-gray-50/50' : ''}`}
                                            style={{ paddingLeft: `${acc.level * 1.5}rem` }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className={`text-[10px] font-mono px-2 py-1 rounded-sm ${acc.level === 1 ? 'bg-brand-charcoal text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                    {acc.code}
                                                </span>
                                                <span className={`text-sm ${acc.level === 1 ? 'font-bold uppercase tracking-widest' : 'text-brand-charcoal'}`}>
                                                    {acc.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">{acc.account_type}</span>
                                                {acc.is_selectable && (
                                                    <span className="text-[9px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-sm">Operativa</span>
                                                )}
                                                <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand-terracotta transition-colors" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
