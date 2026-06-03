'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOperatorsWithPayrollAction, payOperatorAction, updateOperatorContractAction } from './actions';
import { Save, Settings, X } from 'lucide-react';

export default function HRPage() {
    const [operators, setOperators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [savingOpId, setSavingOpId] = useState<string | null>(null);

    const handleSaveContract = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const opId = formData.get('id') as string;
        setSavingOpId(opId);
        const res = await updateOperatorContractAction(formData);
        if (res.success) {
            loadData();
        } else {
            alert("Error: " + res.error);
        }
        setSavingOpId(null);
    };

    const loadData = () => {
        setLoading(true);
        getOperatorsWithPayrollAction().then(data => {
            setOperators(data || []);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    const handlePay = async (id: string, amount: number) => {
        if (!confirm(`¿Confirmas el pago de $${amount.toLocaleString('es-CL')} a este operador?`)) return;
        setProcessingId(id);
        const res = await payOperatorAction(id);
        if (res.success) {
            loadData();
        } else {
            alert('Error al liquidar: ' + res.error);
        }
        setProcessingId(null);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="min-h-screen bg-[#F0EDE8] p-6 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/admin/dashboard" className="text-gray-500 hover:text-brand-charcoal text-sm flex items-center gap-2 transition-colors mb-2">
                            <ArrowLeft className="w-4 h-4" />
                            Volver al Panel
                        </Link>
                        <h1 className="text-3xl font-serif text-brand-charcoal">Recursos Humanos y Liquidaciones</h1>
                        <p className="text-gray-500 mt-1">Gestión de Billeteras Digitales y Pago a Destajo (RRHH)</p>
                    </div>
                    <button onClick={() => setIsConfigOpen(!isConfigOpen)} className="mt-4 md:mt-0 flex items-center gap-2 bg-white border border-gray-200 text-brand-charcoal px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm">
                        <Settings className="w-4 h-4" />
                        Condiciones Comerciales
                    </button>
                </div>

                {isConfigOpen && (
                    <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-sm animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-2xl text-brand-charcoal">Configuración de Contratos y Comisiones</h2>
                            <button onClick={() => setIsConfigOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="space-y-6">
                            {operators.map(op => (
                                <form key={op.id} onSubmit={handleSaveContract} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 p-4 border border-gray-100 rounded-sm">
                                    <input type="hidden" name="id" value={op.id} />
                                    
                                    <div className="md:col-span-3">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Operaria(o)</label>
                                        <p className="font-bold text-brand-charcoal py-2">{op.name}</p>
                                    </div>
                                    
                                    <div className="md:col-span-3">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Tipo de Contrato</label>
                                        <select name="contract_type" defaultValue={op.contract_type || 'fixed'} className="w-full text-sm p-2 border border-gray-200 rounded-sm focus:ring-brand-terracotta bg-white outline-none">
                                            <option value="fixed">Sueldo Fijo Mensual</option>
                                            <option value="percentage">Comisión por Prenda (%)</option>
                                            <option value="piecework">Destajo Fijo por Prenda ($)</option>
                                        </select>
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Sueldo Base ($)</label>
                                        <input type="number" name="base_salary" defaultValue={op.base_salary || 0} className="w-full text-sm p-2 border border-gray-200 rounded-sm focus:ring-brand-terracotta outline-none" />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Comisión (%)</label>
                                        <input type="number" step="0.1" name="commission_percentage" defaultValue={op.commission_percentage || 0} className="w-full text-sm p-2 border border-gray-200 rounded-sm focus:ring-brand-terracotta outline-none" />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <button disabled={savingOpId === op.id} type="submit" className="w-full bg-brand-charcoal text-white flex justify-center items-center gap-2 py-2 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-brand-terracotta transition-colors shadow-sm">
                                            {savingOpId === op.id ? '...' : <><Save className="w-3.5 h-3.5" /> Guardar</>}
                                        </button>
                                    </div>
                                </form>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Cargando datos del equipo...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {operators.map(op => (
                            <div key={op.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-brand-sand rounded-full flex items-center justify-center text-brand-charcoal font-bold text-xl uppercase">
                                        {op.name.substring(0, 2)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-brand-charcoal">{op.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                                                {op.contract_type === 'percentage' ? 'Comisión %' : op.contract_type === 'piecework' ? 'Destajo Fijo' : 'Sueldo Fijo'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-grow bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Sueldo Base</span>
                                        <span className="font-medium text-gray-700">{formatCurrency(op.base_salary || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Comisiones Pendientes</span>
                                        <span className="font-medium text-brand-terracotta">
                                            {formatCurrency(op.pendingAmount - (op.base_salary || 0))}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase tracking-widest text-brand-charcoal">Total a Pagar</span>
                                        <span className="text-xl font-bold text-green-600">{formatCurrency(op.pendingAmount)}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                        ({op.assignments?.length || 0} prendas completadas sin liquidar)
                                    </div>
                                </div>

                                <button
                                    onClick={() => handlePay(op.id, op.pendingAmount)}
                                    disabled={op.pendingAmount === 0 || processingId === op.id}
                                    className={`w-full py-3 rounded-md text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                        op.pendingAmount === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-brand-charcoal text-white hover:bg-brand-terracotta hover:shadow-lg'
                                    }`}
                                >
                                    {processingId === op.id ? (
                                        'Procesando...'
                                    ) : (
                                        <>
                                            <DollarSign className="w-4 h-4" />
                                            Liquidar Pago
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
