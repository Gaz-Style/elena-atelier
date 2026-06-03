'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, DollarSign, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { getOperatorsWithPayrollAction, payOperatorAction } from './actions';

export default function HRPage() {
    const [operators, setOperators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

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
                </div>

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
