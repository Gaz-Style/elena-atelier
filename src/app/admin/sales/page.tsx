import React from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { DollarSign, CheckCircle, Clock, CreditCard, Activity, ArrowRight, Wallet, Calendar } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0; // Disable caching

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('es-CL', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

export default async function SalesLedgerPage() {
    const supabase = await createClient();
    
    // Fetch sales ledger
    const { data: sales, error } = await supabase
        .from('sales_ledger')
        .select(`
            id,
            internal_id,
            created_at,
            seller_id,
            total_amount,
            status,
            payment_method,
            customer_id
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching sales:', error);
    }

    const safeSales = sales || [];

    // Calculations for metrics
    const today = new Date().toISOString().split('T')[0];
    const todaysSales = safeSales.filter(s => s.created_at.startsWith(today));
    
    const totalRevenue = safeSales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.total_amount, 0);
    const todayRevenue = todaysSales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.total_amount, 0);
    const pendingSales = safeSales.filter(s => s.status === 'pending').length;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24 space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin" className="text-[10px] uppercase tracking-widest text-gray-400 font-bold hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            ← Volver al Dashboard Central
                        </Link>
                        <h1 className="font-serif text-5xl text-brand-charcoal">Planilla de Ventas</h1>
                        <p className="text-gray-500 mt-2">Libro Mayor de Ventas y Trazabilidad Financiera</p>
                    </div>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Ingresos Totales (Histórico)</h3>
                            <DollarSign className="w-4 h-4 text-brand-terracotta" />
                        </div>
                        <p className="text-3xl font-serif text-brand-charcoal">{formatCurrency(totalRevenue)}</p>
                    </div>

                    <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Ingresos de Hoy</h3>
                            <Activity className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-3xl font-serif text-brand-charcoal">{formatCurrency(todayRevenue)}</p>
                        <p className="text-[10px] text-gray-400 mt-2">{todaysSales.length} transacciones hoy</p>
                    </div>

                    <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Ventas Pendientes</h3>
                            <Clock className="w-4 h-4 text-orange-400" />
                        </div>
                        <p className="text-3xl font-serif text-brand-charcoal">{pendingSales}</p>
                        <p className="text-[10px] text-gray-400 mt-2">Esperando confirmación de pago</p>
                    </div>

                    <div className="bg-brand-charcoal p-6 rounded-sm border border-gray-800 shadow-sm flex flex-col justify-between text-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Conciliación Bancaria</h3>
                            <Wallet className="w-4 h-4 text-brand-sand" />
                        </div>
                        <p className="text-sm font-light text-gray-300">Las transferencias deben ser conciliadas manualmente.</p>
                        <button className="mt-4 text-[10px] uppercase tracking-widest font-bold text-brand-sand hover:text-white transition-colors text-left">
                            Exportar Libro Diario →
                        </button>
                    </div>
                </div>

                {/* Sales Table */}
                <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="font-serif text-xl text-brand-charcoal">Registro de Transacciones</h2>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white border border-gray-200 rounded-sm text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:border-brand-terracotta hover:text-brand-terracotta transition-colors">
                                Filtrar
                            </button>
                            <button className="px-4 py-2 bg-brand-charcoal border border-brand-charcoal rounded-sm text-[10px] font-bold uppercase tracking-widest text-white hover:bg-brand-terracotta hover:border-brand-terracotta transition-colors">
                                Reporte Mensual
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500">
                                    <th className="p-4 font-bold">ID Transacción</th>
                                    <th className="p-4 font-bold">Fecha</th>
                                    <th className="p-4 font-bold">Cliente</th>
                                    <th className="p-4 font-bold">Monto Total</th>
                                    <th className="p-4 font-bold">Medio de Pago</th>
                                    <th className="p-4 font-bold">Estado</th>
                                    <th className="p-4 font-bold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-600">
                                {safeSales.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                                            No hay registros de ventas.
                                        </td>
                                    </tr>
                                ) : (
                                    safeSales.map((sale: any) => (
                                        <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                                            <td className="p-4">
                                                <span className="font-bold text-brand-charcoal">{sale.internal_id}</span>
                                            </td>
                                            <td className="p-4 text-xs">
                                                {formatDate(sale.created_at)}
                                            </td>
                                            <td className="p-4 font-serif text-brand-charcoal">
                                                {sale.customer_id ? `Cliente (${sale.customer_id.substring(0,6)})` : 'Cliente General'}
                                            </td>
                                            <td className="p-4 font-bold text-brand-terracotta">
                                                {formatCurrency(sale.total_amount)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-3 h-3 text-gray-400" />
                                                    <span className="capitalize">{sale.payment_method?.replace(/_/g, ' ') || 'No registrado'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {sale.status === 'completed' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[9px] font-bold uppercase tracking-wider">
                                                        <CheckCircle className="w-3 h-3" /> Pagado
                                                    </span>
                                                ) : sale.status === 'pending' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-[9px] font-bold uppercase tracking-wider">
                                                        <Clock className="w-3 h-3" /> Pendiente
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[9px] font-bold uppercase tracking-wider">
                                                        Cancelada
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="text-[10px] uppercase font-bold text-gray-400 hover:text-brand-terracotta transition-colors">
                                                    Ver Detalle
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
