'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, DollarSign, Calendar, RefreshCw, BarChart3, ArrowUpRight, ArrowDownRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getJournalEntries, getChartOfAccounts } from '../actions';
import Navbar from '@/components/Navbar';

export default function IncomeStatementPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Period Filters
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString()); // 1-12 or '' for all year

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [entriesData, accountsData] = await Promise.all([
            getJournalEntries(),
            getChartOfAccounts()
        ]);
        setEntries(entriesData);
        setAccounts(accountsData);
        setLoading(false);
    }

    // Filter journal entries by period
    const filteredEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        const entryYear = entryDate.getFullYear().toString();
        const entryMonth = (entryDate.getMonth() + 1).toString();

        if (selectedYear && entryYear !== selectedYear) return false;
        if (selectedMonth && entryMonth !== selectedMonth) return false;
        return true;
    });

    // Sum debits and credits per account for the filtered entries
    const accountBalances: { [accountId: string]: { debit: number; credit: number; balance: number } } = {};
    
    // Initialize selectable accounts
    accounts.forEach(acc => {
        accountBalances[acc.id] = { debit: 0, credit: 0, balance: 0 };
    });

    filteredEntries.forEach(entry => {
        if (entry.journal_items) {
            entry.journal_items.forEach((item: any) => {
                if (accountBalances[item.account_id]) {
                    accountBalances[item.account_id].debit += Number(item.debit || 0);
                    accountBalances[item.account_id].credit += Number(item.credit || 0);
                }
            });
        }
    });

    // Compute balances based on account type
    accounts.forEach(acc => {
        const amt = accountBalances[acc.id];
        if (!amt) return;
        if (acc.account_type === 'Asset' || acc.account_type === 'Expense') {
            amt.balance = amt.debit - amt.credit;
        } else {
            amt.balance = amt.credit - amt.debit;
        }
    });

    // Grouping by standard Chilean and International P&L structure
    // 1. Revenues (Ingresos): code starting with '4'
    const revenueAccounts = accounts.filter(acc => acc.code.startsWith('4') && acc.is_selectable);
    const revenueLines = revenueAccounts.map(acc => ({
        code: acc.code,
        name: acc.name,
        amount: accountBalances[acc.id]?.balance || 0
    })).filter(line => line.amount !== 0);
    const totalRevenues = revenueLines.reduce((sum, line) => sum + line.amount, 0);

    // 2. Direct Costs (Costos de Producción/Venta): code starting with '5.1'
    const costAccounts = accounts.filter(acc => acc.code.startsWith('5.1') && acc.is_selectable);
    const costLines = costAccounts.map(acc => ({
        code: acc.code,
        name: acc.name,
        amount: accountBalances[acc.id]?.balance || 0
    })).filter(line => line.amount !== 0);
    const totalCosts = costLines.reduce((sum, line) => sum + line.amount, 0);

    // Margin = Revenues - Costs
    const grossMargin = totalRevenues - totalCosts;

    // 3. Operating Expenses (Gastos de Administración y Ventas - GAV): code starting with '5.2' or '5.3' (essentially starts with '5' but not '5.1')
    const expenseAccounts = accounts.filter(acc => acc.code.startsWith('5') && !acc.code.startsWith('5.1') && acc.is_selectable);
    const expenseLines = expenseAccounts.map(acc => ({
        code: acc.code,
        name: acc.name,
        amount: accountBalances[acc.id]?.balance || 0
    })).filter(line => line.amount !== 0);
    const totalExpenses = expenseLines.reduce((sum, line) => sum + line.amount, 0);

    // Net Result = Gross Margin - Expenses
    const netResult = grossMargin - totalExpenses;

    // CLP Formatter helper
    const formatCLP = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const monthNames = [
        { val: '1', label: 'Enero' },
        { val: '2', label: 'Febrero' },
        { val: '3', label: 'Marzo' },
        { val: '4', label: 'Abril' },
        { val: '5', label: 'Mayo' },
        { val: '6', label: 'Junio' },
        { val: '7', label: 'Julio' },
        { val: '8', label: 'Agosto' },
        { val: '9', label: 'Septiembre' },
        { val: '10', label: 'Octubre' },
        { val: '11', label: 'Noviembre' },
        { val: '12', label: 'Diciembre' }
    ];

    const years = ['2024', '2025', '2026', '2027'];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            
            <main className="max-w-4xl mx-auto px-4 pt-32 pb-24 space-y-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin/accounting" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Panel Contable
                        </Link>
                        <h1 className="font-serif text-5xl text-brand-charcoal">Estado de Resultados</h1>
                        <p className="text-gray-500 mt-2 italic text-sm">Resumen de ingresos, costos y gastos acumulados (P&L).</p>
                    </div>

                    <button 
                        onClick={loadData}
                        className="bg-white border border-gray-200 text-brand-charcoal px-5 py-3 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Recargar Datos
                    </button>
                </header>

                {/* Filters Board */}
                <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Año Fiscal</label>
                        <select 
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full bg-gray-50 p-3 text-xs outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Mes Contable</label>
                        <select 
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full bg-gray-50 p-3 text-xs outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm font-bold"
                        >
                            <option value="">-- Año Completo --</option>
                            {monthNames.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                        </select>
                    </div>

                    <div className="bg-brand-sand/15 p-4 rounded-sm border border-brand-sand/30 flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                            Cálculo automatizado bajo el principio de devengado con integridad de doble partida ERP.
                        </p>
                    </div>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Ingresos Operativos</p>
                            <h3 className="text-xl font-bold text-emerald-600">{formatCLP(totalRevenues)}</h3>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-sm text-emerald-600"><ArrowUpRight className="w-5 h-5" /></div>
                    </div>

                    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Costos y Gastos</p>
                            <h3 className="text-xl font-bold text-red-500">{formatCLP(totalCosts + totalExpenses)}</h3>
                        </div>
                        <div className="bg-red-50 p-2 rounded-sm text-red-500"><ArrowDownRight className="w-5 h-5" /></div>
                    </div>

                    <div className={`p-6 rounded-sm shadow-sm border flex justify-between items-center ${netResult >= 0 ? 'bg-emerald-50/20 border-emerald-100' : 'bg-red-50/20 border-red-100'}`}>
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Resultado Neto</p>
                            <h3 className={`text-2xl font-serif font-bold ${netResult >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCLP(netResult)}</h3>
                        </div>
                        <div className={`p-2 rounded-sm ${netResult >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Statement Sheet */}
                <div className="bg-white p-4 md:p-12 rounded-sm border border-gray-100 shadow-sm space-y-10">
                    <div className="text-center pb-6 border-b border-gray-100">
                        <h2 className="font-serif text-3xl text-brand-charcoal">ELENA ATELIER LTDA.</h2>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-2">
                            Estado de Resultados Contable - {selectedMonth ? monthNames.find(m => m.val === selectedMonth)?.label : 'Período Anual'} {selectedYear}
                        </p>
                        <p className="text-[9px] text-gray-400 italic mt-1">Expresado en Pesos Chilenos (CLP)</p>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-terracotta" />
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Calculando Ejercicio...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 font-sans">
                            {/* 1. REVENUES */}
                            <div className="space-y-3">
                                <h3 className="text-xs uppercase font-bold tracking-wider text-brand-charcoal flex justify-between border-b border-gray-200 pb-2">
                                    <span>(+) INGRESOS OPERACIONALES</span>
                                    <span className="text-emerald-700">{formatCLP(totalRevenues)}</span>
                                </h3>
                                <div className="space-y-2 pl-4">
                                    {revenueLines.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">Sin ingresos en este período</p>
                                    ) : (
                                        revenueLines.map(line => (
                                            <div key={line.code} className="flex justify-between text-xs text-gray-500">
                                                <span>{line.code} - {line.name}</span>
                                                <span className="font-mono">{formatCLP(line.amount)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* 2. COST OF SALES */}
                            <div className="space-y-3">
                                <h3 className="text-xs uppercase font-bold tracking-wider text-brand-charcoal flex justify-between border-b border-gray-200 pb-2">
                                    <span>(-) COSTOS DE PRODUCCIÓN Y TEXTILES</span>
                                    <span className="text-red-600">{formatCLP(totalCosts)}</span>
                                </h3>
                                <div className="space-y-2 pl-4">
                                    {costLines.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">Sin costos de explotación directos</p>
                                    ) : (
                                        costLines.map(line => (
                                            <div key={line.code} className="flex justify-between text-xs text-gray-500">
                                                <span>{line.code} - {line.name}</span>
                                                <span className="font-mono">{formatCLP(line.amount)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* BRUTO MARGIN */}
                            <div className="bg-brand-sand/10 p-4 border-y border-brand-sand/30 flex justify-between items-center text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                                <span>(=) MARGEN DE EXPLOTACIÓN CONTABLE</span>
                                <span className="font-mono text-sm">{formatCLP(grossMargin)}</span>
                            </div>

                            {/* 3. ADMINISTRATIVE EXPENSES */}
                            <div className="space-y-3">
                                <h3 className="text-xs uppercase font-bold tracking-wider text-brand-charcoal flex justify-between border-b border-gray-200 pb-2">
                                    <span>(-) GASTOS DE ADMINISTRACIÓN Y VENTAS (GAV)</span>
                                    <span className="text-red-600">{formatCLP(totalExpenses)}</span>
                                </h3>
                                <div className="space-y-2 pl-4 max-h-[300px] overflow-y-auto divide-y divide-gray-50/50">
                                    {expenseLines.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">Sin gastos operativos registrados</p>
                                    ) : (
                                        expenseLines.map(line => (
                                            <div key={line.code} className="flex justify-between text-xs text-gray-500 py-1">
                                                <span>{line.code} - {line.name}</span>
                                                <span className="font-mono">{formatCLP(line.amount)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* NET RESULT RESULT */}
                            <div className={`p-6 border rounded-sm flex justify-between items-center uppercase tracking-widest text-xs font-bold ${netResult >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                <span>(=) RESULTADO EJERCICIO (UTILIDAD / PÉRDIDA NETA):</span>
                                <span className="font-mono text-lg">{formatCLP(netResult)}</span>
                            </div>
                        </div>
                    )}
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
