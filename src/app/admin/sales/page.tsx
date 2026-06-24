import React from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { DollarSign, Activity, Clock, Wallet } from 'lucide-react';
import Link from 'next/link';
import SalesLedgerTable from './SalesLedgerTable';

export const revalidate = 0; // Disable caching

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
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
        .not('internal_id', 'like', '%_balance_%')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching sales:', error);
    }

    const safeSales = sales || [];

    // Calculations for metrics
    const today = new Date().toISOString().split('T')[0];
    const todaysSales = safeSales.filter(s => s.created_at.startsWith(today));
    
    const totalRevenue = safeSales.reduce((sum, s) => sum + s.total_amount, 0);
    const todayRevenue = todaysSales.reduce((sum, s) => sum + s.total_amount, 0);
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
                <SalesLedgerTable sales={safeSales} />
            </main>
        </div>
    );
}
