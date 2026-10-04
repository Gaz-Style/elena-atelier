'use client';

import React, { useState } from 'react';

// Reusing the date parser from the parent
const getChileDateParts = (dateInput: string | Date) => {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
    const parts = formatter.formatToParts(d);
    const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
    return {
        year: parseInt(map.year),
        month: parseInt(map.month),
        day: map.day.padStart(2, '0'),
        dateStr: `${map.year}-${map.month.padStart(2, '0')}-${map.day.padStart(2, '0')}`
    };
};

export default function AccountingBreakdownModal({ 
    salesList, 
    selectedYear, 
    selectedMonth 
}: { 
    salesList: any[], 
    selectedYear: number, 
    selectedMonth: number 
}) {
    const [isOpen, setIsOpen] = useState(false);

    // -- Cálculos Contables (Modo Lectura) --
    
    // 1. Filtrar ventas creadas ESTE MES
    const thisMonthSales = salesList.filter(s => {
        if (s.status === 'cancelled') return false;
        const sParts = getChileDateParts(s.created_at);
        if (selectedYear && sParts.year !== selectedYear) return false;
        if (selectedMonth && sParts.month !== selectedMonth) return false;
        return true;
    });

    // 1.1 Proyectos principales de este mes (sin _balance_)
    const thisMonthMainSales = thisMonthSales.filter(s => !s.internal_id.includes('_balance_'));
    const thisMonthMainSalesIds = new Set(thisMonthMainSales.map(s => s.internal_id));

    const calculateCategory = (keyword: string, isRegex = false) => {
        let items = thisMonthMainSales;
        if (isRegex) {
            const rx = new RegExp(keyword, 'i');
            items = thisMonthMainSales.filter(s => rx.test(s.internal_id));
        } else {
            items = thisMonthMainSales.filter(s => s.internal_id.includes(keyword));
        }
        
        const totalVendido = items.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
        
        // Dinero efectivamente ingresado por estos items este mes
        const abonosRecibidos = items.reduce((sum, s) => {
            if (['completed', 'paid', 'partial'].includes(s.status)) {
                return sum + (Number(s.paid_amount) || 0);
            }
            return sum;
        }, 0);

        return { totalVendido, abonosRecibidos };
    };

    const novias = calculateCategory('bridal');
    const arreglos = calculateCategory('arreglo', true);
    // Confecciones son las que no son novias ni arreglos
    const confeccionesItems = thisMonthMainSales.filter(s => !s.internal_id.includes('bridal') && !/arreglo/i.test(s.internal_id));
    const confecciones = {
        totalVendido: confeccionesItems.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0),
        abonosRecibidos: confeccionesItems.reduce((sum, s) => {
            if (['completed', 'paid', 'partial'].includes(s.status)) {
                return sum + (Number(s.paid_amount) || 0);
            }
            return sum;
        }, 0)
    };

    // 2. Pagos de Meses Anteriores (Recaudados ESTE MES)
    const oldPaymentsReceived = thisMonthSales.reduce((sum, s) => {
        if (!['completed', 'paid', 'partial'].includes(s.status)) return sum;
        
        const baseId = s.internal_id.split('_balance_')[0];
        
        if (!thisMonthMainSalesIds.has(baseId)) {
            return sum + (Number(s.paid_amount) || 0);
        }
        return sum;
    }, 0);

    // 3. Pendientes Históricos por Cobrar
    const allHistoricalMainSales = salesList.filter(s => {
        if (s.status === 'cancelled') return false;
        if (s.internal_id.includes('_balance_')) return false;
        const sParts = getChileDateParts(s.created_at);
        if (sParts.year > selectedYear) return false;
        if (sParts.year === selectedYear && sParts.month > selectedMonth) return false;
        return true;
    });

    let pendingPastMonths = 0;
    let pendingThisMonth = 0;

    allHistoricalMainSales.forEach(s => {
        const debt = Math.max(0, (Number(s.total_amount) || 0) - (Number(s.paid_amount) || 0));
        if (debt > 0) {
            const sParts = getChileDateParts(s.created_at);
            if (sParts.year === selectedYear && sParts.month === selectedMonth) {
                pendingThisMonth += debt;
            } else {
                pendingPastMonths += debt;
            }
        }
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-sm text-[10px] font-bold uppercase tracking-widest text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Desglose Contable
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-sm bg-white p-8 text-left align-middle shadow-2xl transition-all border-t-4 border-brand-terracotta">
                            <h3 className="text-2xl font-serif text-brand-charcoal mb-6 border-b border-gray-100 pb-4">
                                Estado de Resultados: Devengado vs Percibido
                                <div className="text-sm font-sans text-gray-500 mt-2 font-normal">
                                    Período Contable: {selectedMonth}/{selectedYear}
                                </div>
                            </h3>

                            <div className="space-y-8">
                                {/* Bloque 1: Ventas del Mes */}
                                <section>
                                    <h4 className="text-[11px] uppercase tracking-widest text-brand-terracotta font-bold mb-4 flex items-center gap-2">
                                        <span>1. Generación del Mes (Ventas Nuevas)</span>
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-gray-500 border-b border-gray-200">
                                                    <th className="text-left pb-2 font-medium">Línea de Negocio</th>
                                                    <th className="text-right pb-2 font-medium">Total Vendido</th>
                                                    <th className="text-right pb-2 font-medium">Abonado (Caja)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                <tr>
                                                    <td className="py-3 text-gray-800">Alta Costura / Novias</td>
                                                    <td className="py-3 text-right font-medium">{formatCurrency(novias.totalVendido)}</td>
                                                    <td className="py-3 text-right text-emerald-600 font-medium">{formatCurrency(novias.abonosRecibidos)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-3 text-gray-800">Confección a Medida</td>
                                                    <td className="py-3 text-right font-medium">{formatCurrency(confecciones.totalVendido)}</td>
                                                    <td className="py-3 text-right text-emerald-600 font-medium">{formatCurrency(confecciones.abonosRecibidos)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-3 text-gray-800">Arreglos y Modificaciones</td>
                                                    <td className="py-3 text-right font-medium">{formatCurrency(arreglos.totalVendido)}</td>
                                                    <td className="py-3 text-right text-emerald-600 font-medium">{formatCurrency(arreglos.abonosRecibidos)}</td>
                                                </tr>
                                            </tbody>
                                            <tfoot className="border-t-2 border-gray-200">
                                                <tr>
                                                    <td className="pt-3 font-bold text-brand-charcoal">Totales del Mes</td>
                                                    <td className="pt-3 text-right font-bold text-brand-charcoal">{formatCurrency(novias.totalVendido + confecciones.totalVendido + arreglos.totalVendido)}</td>
                                                    <td className="pt-3 text-right font-bold text-emerald-600">{formatCurrency(novias.abonosRecibidos + confecciones.abonosRecibidos + arreglos.abonosRecibidos)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </section>

                                {/* Bloque 2: Flujo Extra */}
                                <section>
                                    <h4 className="text-[11px] uppercase tracking-widest text-brand-terracotta font-bold mb-4">
                                        2. Recaudación Histórica (Ingresos Extra)
                                    </h4>
                                    <div className="bg-emerald-50/50 p-4 rounded-sm border border-emerald-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Pagos recibidos de meses anteriores</p>
                                            <p className="text-xs text-gray-500 mt-1">Saldos de proyectos antiguos cobrados este mes</p>
                                        </div>
                                        <div className="text-lg font-bold text-emerald-700">
                                            +{formatCurrency(oldPaymentsReceived)}
                                        </div>
                                    </div>
                                </section>

                                {/* Bloque 3: Resumen Final de Liquidez */}
                                <section>
                                    <div className="bg-brand-charcoal p-5 rounded-sm text-white flex justify-between items-center shadow-md">
                                        <div>
                                            <h4 className="text-[10px] uppercase tracking-widest text-brand-beige font-bold mb-1">Caja Real Entrante (Liquidez Total)</h4>
                                            <p className="text-xs text-gray-400">Abonos Nuevos + Recaudación Histórica</p>
                                        </div>
                                        <div className="text-2xl font-serif text-white">
                                            {formatCurrency((novias.abonosRecibidos + confecciones.abonosRecibidos + arreglos.abonosRecibidos) + oldPaymentsReceived)}
                                        </div>
                                    </div>
                                </section>

                                {/* Bloque 4: Cuentas por Cobrar */}
                                <section>
                                    <h4 className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-4">
                                        3. Cuentas por Cobrar (Deuda a favor del Atelier)
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border border-red-100 bg-red-50/30 p-4 rounded-sm">
                                            <p className="text-xs text-gray-500 font-medium mb-1">Pendientes de Meses Pasados</p>
                                            <p className="text-lg font-bold text-red-600">{formatCurrency(pendingPastMonths)}</p>
                                        </div>
                                        <div className="border border-orange-100 bg-orange-50/30 p-4 rounded-sm">
                                            <p className="text-xs text-gray-500 font-medium mb-1">Pendientes Creados Este Mes</p>
                                            <p className="text-lg font-bold text-orange-600">{formatCurrency(pendingThisMonth)}</p>
                                        </div>
                                    </div>
                                </section>

                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    type="button"
                                    className="px-6 py-2 bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-gray-200 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cerrar Reporte
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
