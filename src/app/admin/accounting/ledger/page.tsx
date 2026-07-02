'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Search, Calendar, Landmark, Receipt, Filter, RefreshCw, Calculator } from 'lucide-react';
import { getJournalEntries, getChartOfAccounts } from '../actions';
import Navbar from '@/components/Navbar';

export default function GeneralLedgerPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters State
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

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
        setAccounts(accountsData.filter((a: any) => a.is_selectable));
        setLoading(false);
    }

    // Flatten journal entries into individual line items
    const allLines: any[] = [];
    entries.forEach(entry => {
        if (entry.journal_items) {
            entry.journal_items.forEach((item: any) => {
                allLines.push({
                    id: item.id,
                    date: entry.date,
                    description: entry.description,
                    state: entry.state,
                    account_id: item.account_id,
                    account_code: item.account?.code || '',
                    account_name: item.account?.name || '',
                    debit: Number(item.debit || 0),
                    credit: Number(item.credit || 0),
                    analytic_name: item.analytic?.name || ''
                });
            });
        }
    });

    // Sort lines by date (descending by default, or ascending for chronological running balance)
    const sortedLines = [...allLines].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Apply Filters
    const filteredLines = sortedLines.filter(line => {
        if (selectedAccountId && line.account_id !== selectedAccountId) return false;
        if (startDate && new Date(line.date) < new Date(startDate)) return false;
        if (endDate && new Date(line.date) > new Date(endDate)) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesDesc = line.description.toLowerCase().includes(query);
            const matchesAcc = line.account_name.toLowerCase().includes(query) || line.account_code.includes(query);
            if (!matchesDesc && !matchesAcc) return false;
        }
        return true;
    });

    // Calculate totals
    const totalDebit = filteredLines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = filteredLines.reduce((sum, l) => sum + l.credit, 0);

    // Compute running balance (only make sense if a single account is selected)
    let runningBalance = 0;
    const selectedAccount = accounts.find(a => a.id === selectedAccountId);
    const accountType = selectedAccount?.account_type || '';

    const linesWithBalance = filteredLines.map(line => {
        // Assets (Activo) and Expenses (Gasto) increase with Debit, decrease with Credit
        // Liabilities (Pasivo), Equity (Patrimonio), and Revenue (Ingreso) increase with Credit, decrease with Debit
        if (
            accountType === 'Asset' || 
            accountType === 'Expense' || 
            accountType === 'Activo' || 
            accountType === 'Gasto' || 
            accountType === 'Costo'
        ) {
            runningBalance += (line.debit - line.credit);
        } else {
            runningBalance += (line.credit - line.debit);
        }
        return {
            ...line,
            balance: runningBalance
        };
    });

    // Format CLP helper
    const formatCLP = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24 space-y-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin/accounting" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Panel Contable
                        </Link>
                        <h1 className="font-serif text-5xl text-brand-charcoal">Libro Mayor Contable</h1>
                        <p className="text-gray-500 mt-2 italic text-sm">Registro cronológico de asientos y movimientos de partida doble.</p>
                    </div>

                    <button 
                        onClick={loadData}
                        className="bg-white border border-gray-200 text-brand-charcoal px-5 py-3 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Recargar Datos
                    </button>
                </header>

                {/* Filters Board */}
                <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5" /> Cuenta Contable</label>
                        <select 
                            value={selectedAccountId}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            className="w-full bg-gray-50 p-3 text-xs outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm"
                        >
                            <option value="">-- Todas las Cuentas --</option>
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.code} - {acc.name} ({acc.account_type})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Fecha Desde</label>
                        <input 
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-gray-50 p-3 text-xs outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Fecha Hasta</label>
                        <input 
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-gray-50 p-3 text-xs outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5"><Search className="w-3.5 h-3.5" /> Buscar Concepto</label>
                        <input 
                            type="text"
                            placeholder="Ej: Pago arriendo, Telas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 p-3 text-xs outline-none focus:ring-1 focus:ring-brand-terracotta rounded-sm"
                        />
                    </div>
                </div>

                {/* Ledger Sheet */}
                <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="text-xs uppercase font-bold tracking-widest text-gray-500 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-brand-terracotta" />
                            Líneas de Detalle Contable ({filteredLines.length})
                        </h3>

                        {selectedAccountId && selectedAccount && (
                            <div className="bg-brand-sand/20 px-4 py-2 border border-brand-sand/50 rounded-sm text-xs">
                                <span className="font-bold uppercase tracking-wider text-brand-charcoal text-[9px] block">Tipo Cuenta: {selectedAccount.account_type}</span>
                                <span className="text-brand-charcoal font-serif">Saldo Actual: <strong className="text-brand-terracotta font-sans text-sm">{formatCLP(runningBalance)}</strong></span>
                            </div>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-brand-terracotta" />
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Cargando Libro Contable...</p>
                            </div>
                        ) : filteredLines.length === 0 ? (
                            <div className="p-20 text-center text-gray-400 italic text-sm font-serif">No se encontraron movimientos contables para los filtros seleccionados.</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-[9px] uppercase tracking-widest text-gray-400">
                                        <th className="p-4 font-bold">Fecha</th>
                                        <th className="p-4 font-bold">Cuenta Afectada</th>
                                        <th className="p-4 font-bold">Descripción / Glosa</th>
                                        <th className="p-4 font-bold text-right">Debe (Débito)</th>
                                        <th className="p-4 font-bold text-right">Haber (Crédito)</th>
                                        {selectedAccountId && <th className="p-4 font-bold text-right bg-brand-sand/10">Saldo</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(selectedAccountId ? linesWithBalance : filteredLines).map((line, idx) => (
                                        <tr key={line.id || idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 text-xs font-mono text-gray-500 whitespace-nowrap">
                                                {new Date(line.date).toLocaleDateString('es-CL', { timeZone: 'UTC' })}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded-sm mr-2">{line.account_code}</span>
                                                <span className="text-xs font-bold text-brand-charcoal">{line.account_name}</span>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-xs text-gray-600 max-w-[300px] truncate" title={line.description}>{line.description}</p>
                                                {line.analytic_name && (
                                                    <span className="text-[8px] uppercase font-bold bg-emerald-50 text-emerald-600 px-1">{line.analytic_name}</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right text-xs font-mono text-brand-charcoal">
                                                {line.debit > 0 ? formatCLP(line.debit) : '-'}
                                            </td>
                                            <td className="p-4 text-right text-xs font-mono text-brand-charcoal">
                                                {line.credit > 0 ? formatCLP(line.credit) : '-'}
                                            </td>
                                            {selectedAccountId && (
                                                <td className={`p-4 text-right text-xs font-mono font-bold bg-brand-sand/5 ${line.balance >= 0 ? 'text-brand-charcoal' : 'text-red-500'}`}>
                                                    {formatCLP(line.balance)}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50/80 border-t-2 border-gray-200 text-xs font-bold text-brand-charcoal">
                                        <td colSpan={3} className="p-4 text-right uppercase tracking-widest text-[10px]">Totales del Período:</td>
                                        <td className="p-4 text-right font-mono text-sm text-brand-charcoal">{formatCLP(totalDebit)}</td>
                                        <td className="p-4 text-right font-mono text-sm text-brand-charcoal">{formatCLP(totalCredit)}</td>
                                        {selectedAccountId && <td className="p-4 bg-brand-sand/10"></td>}
                                    </tr>
                                </tfoot>
                            </table>
                        )}
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
