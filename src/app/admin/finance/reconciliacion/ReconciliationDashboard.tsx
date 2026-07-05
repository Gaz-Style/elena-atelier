'use client';

import React, { useState } from 'react';
import * as xlsx from 'xlsx';
import { Loader2, UploadCloud, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { getRecentPaymentsForReconciliation } from '../actions';

interface MPRecord {
    id: string;
    method: string;
    type: string;
    amount: number;
    originDate: string;
    approvalDate: string;
    netAmount: number;
    status: 'matched' | 'missing_in_db';
    matchedDbRecord?: any;
}

export default function ReconciliationDashboard() {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<MPRecord[]>([]);
    const [dbRecords, setDbRecords] = useState<any[]>([]);
    const [summary, setSummary] = useState({
        totalMp: 0,
        totalDbMatched: 0,
        missingCount: 0,
        matchedCount: 0,
        extraInDbCount: 0
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const buffer = await file.arrayBuffer();
            
            // Silence console.error temporarily to avoid Next.js overlay for known MP Excel warnings
            const originalConsoleError = console.error;
            console.error = (...args) => {
                if (args[0] && typeof args[0] === 'string' && args[0].includes('Bad uncompressed size')) {
                    return;
                }
                originalConsoleError(...args);
            };

            let workbook;
            try {
                workbook = xlsx.read(buffer, { type: 'array' });
            } finally {
                console.error = originalConsoleError;
            }

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            const data = xlsx.utils.sheet_to_json<any>(worksheet);

            // Filter approved payments
            const mpPayments = data
                .filter(row => row['TIPO DE OPERACIÓN'] === 'Pago aprobado')
                .map(row => ({
                    id: String(row['ID DE OPERACIÓN EN MERCADO PAGO']),
                    method: row['TIPO DE MEDIO DE PAGO'],
                    type: row['TIPO DE OPERACIÓN'],
                    amount: Number(row['VALOR DE LA COMPRA']),
                    originDate: row['FECHA DE ORIGEN'],
                    approvalDate: row['FECHA DE APROBACIÓN'],
                    netAmount: Number(row['MONTO NETO DE LA OPERACIÓN']),
                    status: 'missing_in_db' as const
                }));

            if (mpPayments.length === 0) {
                alert('No se encontraron pagos aprobados en el archivo.');
                setLoading(false);
                return;
            }

            // Find date range
            const dates = mpPayments.map(p => new Date(p.approvalDate).getTime()).filter(t => !isNaN(t));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));

            // Expand range slightly just in case
            minDate.setDate(minDate.getDate() - 2);
            maxDate.setDate(maxDate.getDate() + 2);

            const startDateStr = minDate.toISOString();
            const endDateStr = maxDate.toISOString();

            // Fetch DB records
            const dbSales = await getRecentPaymentsForReconciliation(startDateStr, endDateStr);
            setDbRecords(dbSales);

            // Match records
            let matchedCount = 0;
            let missingCount = 0;
            let totalMp = 0;
            let totalDbMatched = 0;

            const processedRecords = mpPayments.map(mp => {
                totalMp += mp.amount;
                // Try to find exact match by external_transaction_id
                let match = dbSales.find(db => db.external_transaction_id === mp.id);

                if (match) {
                    matchedCount++;
                    totalDbMatched += mp.amount;
                    return { ...mp, status: 'matched', matchedDbRecord: match };
                }

                // If not found by ID, maybe approximate match by Amount and Date (within same day)
                const mpDate = new Date(mp.approvalDate).toISOString().split('T')[0];
                match = dbSales.find(db => {
                    if (db.external_transaction_id) return false; // already has ID, didn't match this MP
                    const dbDate = new Date(db.created_at).toISOString().split('T')[0];
                    return dbDate === mpDate && Number(db.paid_amount) === mp.amount;
                });

                if (match) {
                    matchedCount++;
                    totalDbMatched += mp.amount;
                    return { ...mp, status: 'matched', matchedDbRecord: match };
                }

                missingCount++;
                return mp;
            });

            setRecords(processedRecords);

            // Find extra records in DB (MercadoPago payments not in the excel)
            const matchedDbIds = new Set(processedRecords.filter(r => r.matchedDbRecord).map(r => r.matchedDbRecord.id));
            const extraDb = dbSales.filter(db => 
                db.payment_method?.toLowerCase().includes('mercadopago') && 
                !matchedDbIds.has(db.id)
            );

            setSummary({
                totalMp,
                totalDbMatched,
                matchedCount,
                missingCount,
                extraInDbCount: extraDb.length
            });

        } catch (error) {
            console.error(error);
            alert('Error procesando el archivo Excel.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header / Upload */}
            <div className="bg-[#111] border border-white/10 p-8 rounded-xl text-center">
                <h2 className="text-xl font-serif text-white mb-4">Cargar Reporte de MercadoPago</h2>
                <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
                    Sube el archivo Excel (.xlsx) generado desde el panel de MercadoPago para conciliar automáticamente los pagos aprobados con las ventas registradas en Elena Atelier.
                </p>
                <label className="inline-flex items-center gap-3 bg-[#C17F5F] text-white px-6 py-3 rounded text-sm font-semibold cursor-pointer hover:bg-[#a66a4f] transition-colors">
                    <UploadCloud className="w-5 h-5" />
                    Seleccionar Archivo Excel
                    <input type="file" accept=".xlsx" onChange={handleFileUpload} className="hidden" />
                </label>
            </div>

            {loading && (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C17F5F]" />
                </div>
            )}

            {/* Results */}
            {!loading && records.length > 0 && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-[#111] border border-white/10 p-5 rounded-lg">
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total MP (Archivo)</h3>
                            <p className="text-2xl text-white font-mono">
                                ${summary.totalMp.toLocaleString('es-CL')}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">{records.length} transacciones</p>
                        </div>
                        <div className="bg-[#111] border border-green-500/20 p-5 rounded-lg">
                            <h3 className="text-green-500 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Conciliados
                            </h3>
                            <p className="text-2xl text-white font-mono">
                                ${summary.totalDbMatched.toLocaleString('es-CL')}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">{summary.matchedCount} registros coinciden</p>
                        </div>
                        <div className="bg-[#111] border border-red-500/20 p-5 rounded-lg">
                            <h3 className="text-red-500 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Faltantes en Sistema
                            </h3>
                            <p className="text-2xl text-white font-mono">
                                ${(summary.totalMp - summary.totalDbMatched).toLocaleString('es-CL')}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">{summary.missingCount} pagos no registrados</p>
                        </div>
                        <div className="bg-[#111] border border-orange-500/20 p-5 rounded-lg">
                            <h3 className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" /> Sobrantes en Sistema
                            </h3>
                            <p className="text-2xl text-white font-mono">
                                --
                            </p>
                            <p className="text-xs text-gray-500 mt-2">{summary.extraInDbCount} pagos marcados como MP no están en Excel</p>
                        </div>
                    </div>

                    {/* Faltantes Table */}
                    {summary.missingCount > 0 && (
                        <div className="bg-[#111] border border-red-500/30 rounded-xl overflow-hidden">
                            <div className="bg-red-500/10 p-4 border-b border-red-500/30">
                                <h3 className="text-red-400 font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Pagos en MercadoPago NO registrados en el Sistema
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-black/40">
                                        <tr>
                                            <th className="px-6 py-4">Fecha MP</th>
                                            <th className="px-6 py-4">ID Operación</th>
                                            <th className="px-6 py-4">Método</th>
                                            <th className="px-6 py-4 text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {records.filter(r => r.status === 'missing_in_db').map(record => (
                                            <tr key={record.id} className="hover:bg-white/5">
                                                <td className="px-6 py-4 text-gray-300">
                                                    {new Date(record.approvalDate).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{record.id}</td>
                                                <td className="px-6 py-4 text-gray-400">{record.method}</td>
                                                <td className="px-6 py-4 text-right font-mono text-white">
                                                    ${record.amount.toLocaleString('es-CL')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Coincidencias Table */}
                    {summary.matchedCount > 0 && (
                        <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden mt-8">
                            <div className="p-4 border-b border-white/10">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    Pagos Conciliados Exitosamente
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-black/40">
                                        <tr>
                                            <th className="px-6 py-4">Fecha MP</th>
                                            <th className="px-6 py-4">ID Operación MP</th>
                                            <th className="px-6 py-4">Ref. Sistema</th>
                                            <th className="px-6 py-4 text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {records.filter(r => r.status === 'matched').map(record => (
                                            <tr key={record.id} className="hover:bg-white/5">
                                                <td className="px-6 py-4 text-gray-300">
                                                    {new Date(record.approvalDate).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{record.id}</td>
                                                <td className="px-6 py-4 text-[#C17F5F] font-mono text-xs">
                                                    {record.matchedDbRecord?.internal_id || 'MATCH MANUAL'}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-white">
                                                    ${record.amount.toLocaleString('es-CL')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
