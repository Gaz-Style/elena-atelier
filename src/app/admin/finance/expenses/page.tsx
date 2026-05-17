'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Tag, Receipt, X, AlertCircle, Save, Eraser, CheckCircle } from 'lucide-react';
import { getExpenses, addExpense, deleteExpense, initializeMonthlyCosts, updateExpense, clearMonthlyExpenses, deleteExpensesBulk } from '../actions';

export default function ExpensesManager() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [savePulse, setSavePulse] = useState(false);
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const now = new Date();
    const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(now.getFullYear());

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    useEffect(() => {
        fetchExpenses();
        setSelectedIds([]);
    }, [currentMonth, currentYear]);

    async function fetchExpenses() {
        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await getExpenses(currentMonth, currentYear);
            setExpenses(data);
        } catch (e: any) {
            setErrorMsg("Error al conectar con la base de datos.");
        }
        setLoading(false);
    }

    async function handleInitialize() {
        if (expenses.length > 0) {
            if (!confirm('Ya hay datos en este mes. ¿Desea cargar la plantilla de todas formas?')) return;
        }
        setIsInitializing(true);
        const result = await initializeMonthlyCosts(currentMonth, currentYear, 'variable');
        if (result.error) setErrorMsg(`Error: ${result.error}`);
        else fetchExpenses();
        setIsInitializing(false);
    }

    async function handleUpdateAmount(id: string, amount: number) {
        setEditingId(id);
        const result = await updateExpense(id, amount);
        if ('error' in result) {
            setErrorMsg(`No se pudo actualizar: ${(result as any).error}`);
        } else {
            setSavePulse(true);
            setTimeout(() => setSavePulse(false), 2000);
            setExpenses(prev => prev.map(e => e.id === id ? { ...e, amount } : e));
        }
        setEditingId(null);
    }

    async function handleAddManual(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMsg(null);
        const formData = new FormData(e.currentTarget);
        const date = new Date(currentYear, currentMonth - 1, 15).toISOString().split('T')[0];
        formData.append('date', date);
        
        const result = await addExpense(formData);
        if (result.success) {
            setIsAdding(false);
            fetchExpenses();
        } else {
            setErrorMsg(`Error: ${result.error}`);
        }
    }

    async function handleDeleteBulk() {
        if (!confirm(`¿Desea eliminar los ${selectedIds.length} ítems seleccionados?`)) return;
        setLoading(true);
        setErrorMsg(null);
        const result = await deleteExpensesBulk(selectedIds);
        if (result.error) {
            setErrorMsg(`Error al borrar: ${result.error}`);
        } else {
            setSelectedIds([]);
            fetchExpenses();
        }
        setLoading(false);
    }

    function toggleSelect(id: string) {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }

    function toggleSelectAll() {
        if (selectedIds.length === expenses.length && expenses.length > 0) setSelectedIds([]);
        else setSelectedIds(expenses.map(e => e.id));
    }

    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const formatCurrency = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat('es-CL').format(val);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin/finance" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Volver a Finanzas
                        </Link>
                        <div className="flex items-center gap-4">
                            <h1 className="font-serif text-5xl text-brand-charcoal">Gastos Variables</h1>
                            {savePulse && (
                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-bounce">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase">Sincronizado</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white p-2 border border-gray-100 shadow-sm rounded-sm">
                        <button onClick={() => { let m = currentMonth - 1; let y = currentYear; if(m<1){m=12;y--} setCurrentMonth(m); setCurrentYear(y); }} className="p-2 hover:text-brand-terracotta transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                        <span className="text-sm font-bold uppercase tracking-widest min-w-[140px] text-center">{monthNames[currentMonth - 1]} {currentYear}</span>
                        <button onClick={() => { let m = currentMonth + 1; let y = currentYear; if(m>12){m=1;y++} setCurrentMonth(m); setCurrentYear(y); }} className="p-2 hover:text-brand-terracotta transition-colors"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </header>

                {errorMsg && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-500 w-5 h-5" />
                        <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-8 rounded-sm border border-gray-100 shadow-sm border-l-4 border-l-brand-terracotta h-32 flex flex-col justify-center">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total {monthNames[currentMonth-1]}</p>
                        <p className="text-3xl font-serif text-brand-charcoal">{formatCurrency(total)}</p>
                    </div>
                    
                    <div className="md:col-span-3 bg-brand-charcoal text-white p-8 rounded-sm flex items-center justify-between h-32">
                        <div className="flex flex-col gap-1">
                            <span className="text-brand-sand text-[10px] font-bold uppercase tracking-widest">Gestión Operativa</span>
                            <div className="flex gap-4 mt-2">
                                <button onClick={handleInitialize} disabled={isInitializing} className="bg-brand-sand text-brand-charcoal px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2">
                                    <Tag className="w-3 h-3" /> Cargar Insumos Base
                                </button>
                                <button onClick={() => setIsAdding(true)} className="bg-white/10 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                                    <Plus className="w-3 h-3" /> Nuevo Gasto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden relative">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Registro de Egresos Operativos</p>
                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-brand-charcoal text-white px-4 py-2 hover:bg-brand-terracotta transition-all">
                            <Save className="w-3 h-3" /> Finalizar y Guardar
                        </button>
                    </div>

                    {/* BULK DELETE BAR */}
                    {selectedIds.length > 0 && (
                        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white p-4 flex justify-between items-center z-20 animate-in slide-in-from-top duration-300 shadow-xl">
                            <div className="flex items-center gap-4">
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Seleccionados: {selectedIds.length}</span>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setSelectedIds([])} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest border border-white/30 hover:bg-white/10 transition-all">Cancelar</button>
                                <button onClick={handleDeleteBulk} className="bg-white text-red-600 px-6 py-2 text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-gray-100 transition-all">Borrar</button>
                            </div>
                        </div>
                    )}

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-100">
                                <th className="p-6 w-12 text-center">
                                    <input type="checkbox" checked={selectedIds.length === expenses.length && expenses.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-brand-terracotta focus:ring-brand-terracotta cursor-pointer" />
                                </th>
                                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">Categoría / Ítem</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-gray-500 text-right">Monto (CLP)</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-gray-500 text-center">Trazabilidad</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-gray-500 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-terracotta" /></td></tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center space-y-4">
                                        <Receipt className="w-12 h-12 text-gray-200 mx-auto" />
                                        <p className="text-gray-400 italic">No hay registros.</p>
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((exp) => (
                                    <tr key={exp.id} className={`hover:bg-brand-sand/5 transition-colors group ${selectedIds.includes(exp.id) ? 'bg-red-50/30' : ''}`}>
                                        <td className="p-6 text-center">
                                            <input type="checkbox" checked={selectedIds.includes(exp.id)} onChange={() => toggleSelect(exp.id)} className="w-4 h-4 rounded border-gray-300 text-brand-terracotta cursor-pointer" />
                                        </td>
                                        <td className="p-6 font-serif text-lg text-brand-charcoal">{exp.category}</td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {editingId === exp.id && <Loader2 className="w-3 h-3 animate-spin text-brand-terracotta" />}
                                                {focusedId === exp.id ? (
                                                    <input 
                                                        autoFocus
                                                        type="number" defaultValue={exp.amount} 
                                                        onBlur={(e) => {
                                                            setFocusedId(null);
                                                            const val = Number(e.target.value);
                                                            if (val !== exp.amount) handleUpdateAmount(exp.id, val);
                                                        }}
                                                        className="w-40 bg-white text-right font-medium text-brand-charcoal ring-2 ring-brand-terracotta/20 p-3 outline-none transition-all rounded-sm border border-transparent"
                                                    />
                                                ) : (
                                                    <div 
                                                        onClick={() => setFocusedId(exp.id)}
                                                        className="w-40 bg-gray-50/50 text-right font-medium text-brand-charcoal p-3 rounded-sm border border-transparent hover:border-gray-200 cursor-text"
                                                    >
                                                        {formatNumber(exp.amount)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="inline-flex items-center gap-2 px-2 py-1 bg-brand-sand/20 text-brand-terracotta rounded-sm">
                                                <span className="text-[8px] uppercase font-bold tracking-tighter">Asiento ERP OK</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <button onClick={() => { if(confirm('¿Borrar?')) deleteExpense(exp.id).then(() => fetchExpenses()) }} className="text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
