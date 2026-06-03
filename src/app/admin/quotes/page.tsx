import React from 'react';
import Navbar from '@/components/Navbar';
import { getAllBudgetsAction } from '@/app/admin/pos/actions';
import QuotesClient from './QuotesClient';
import Link from 'next/link';

export const revalidate = 0;

export default async function QuotesPage() {
    const budgets = await getAllBudgetsAction();

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24 space-y-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin" className="text-[10px] uppercase tracking-widest text-gray-400 font-bold hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            ← Volver al Dashboard
                        </Link>
                        <h1 className="font-serif text-5xl text-brand-charcoal">Presupuestos</h1>
                        <p className="text-gray-500 mt-2">Seguimiento de todas las cotizaciones emitidas</p>
                    </div>
                    <Link
                        href="/admin/pos"
                        className="px-6 py-3 bg-brand-charcoal text-white text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-brand-terracotta transition-colors"
                    >
                        + Nuevo Presupuesto
                    </Link>
                </header>

                <QuotesClient budgets={budgets} />
            </main>
        </div>
    );
}
