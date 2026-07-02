import React from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import SalesLedgerTable from './SalesLedgerTable';

export const revalidate = 0; // Disable caching

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
            paid_amount,
            status,
            payment_method,
            customer_id
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching sales:', error);
    }

    const safeSales = sales || [];

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

                {/* Sales Table and KPIs (client-side) */}
                <SalesLedgerTable sales={safeSales} />
            </main>
        </div>
    );
}
