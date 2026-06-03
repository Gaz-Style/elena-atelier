import React from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle, Clock, CreditCard, ArrowLeft, Download, FileText, User } from 'lucide-react';

export const revalidate = 0; // Disable caching

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('es-CL', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Fetch sale
    const { data: sale, error: saleError } = await supabase
        .from('sales_ledger')
        .select(`*`)
        .eq('id', id)
        .single();

    if (saleError || !sale) {
        return notFound();
    }

    // 2. Fetch customer if any
    let customer = null;
    if (sale.customer_id) {
        const { data: customerData } = await supabase
            .from('customers')
            .select('*')
            .eq('id', sale.customer_id)
            .single();
        customer = customerData;
    }

    // 3. Fetch production orders (items)
    const { data: items } = await supabase
        .from('production_orders')
        .select('*')
        .eq('sale_id', sale.id);

    const safeItems = items || [];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 md:px-8 pt-32 pb-24 space-y-8">
                
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <Link href="/admin/sales" className="text-[10px] uppercase tracking-widest text-gray-400 font-bold hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Volver a Planilla de Ventas
                        </Link>
                        <h1 className="font-serif text-4xl text-brand-charcoal">Detalle de Venta</h1>
                        <p className="text-gray-500 mt-2 font-mono text-sm">{sale.internal_id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {sale.status === 'completed' ? (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest">
                                <CheckCircle className="w-4 h-4" /> Pagado
                            </span>
                        ) : sale.status === 'pending' ? (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest">
                                <Clock className="w-4 h-4" /> Pendiente
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest">
                                Cancelada
                            </span>
                        )}
                        <span className="text-xs text-gray-400">{formatDate(sale.created_at)}</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column - Main Details */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Items Section */}
                        <section className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="font-serif text-xl text-brand-charcoal">Artículos de la Orden</h2>
                            </div>
                            <div className="p-6">
                                {safeItems.length === 0 ? (
                                    <p className="text-gray-400 italic text-sm text-center py-4">No hay artículos vinculados a esta venta.</p>
                                ) : (
                                    <ul className="space-y-4">
                                        {safeItems.map((item) => (
                                            <li key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-medium text-brand-charcoal">{item.description}</p>
                                                    <p className="text-[10px] uppercase tracking-widest text-brand-terracotta mt-1">{item.order_type === 'bespoke' ? 'Confección a Medida' : 'Producto Batch'}</p>
                                                    {item.notes && <p className="text-xs text-gray-500 mt-2 italic">"{item.notes}"</p>}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>

                        {/* Customer Section */}
                        <section className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
                            <h2 className="font-serif text-xl text-brand-charcoal mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" /> Información del Cliente
                            </h2>
                            {customer ? (
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p><strong className="text-brand-charcoal font-medium w-24 inline-block">Nombre:</strong> {customer.name || 'Sin nombre'}</p>
                                    <p><strong className="text-brand-charcoal font-medium w-24 inline-block">Teléfono:</strong> {customer.phone || 'No registrado'}</p>
                                    <p><strong className="text-brand-charcoal font-medium w-24 inline-block">Email:</strong> {customer.email || 'No registrado'}</p>
                                    <p><strong className="text-brand-charcoal font-medium w-24 inline-block">RUT:</strong> {customer.rut || 'No registrado'}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic text-sm">Cliente general o no asignado.</p>
                            )}
                        </section>
                    </div>

                    {/* Right Column - Financial Summary */}
                    <div className="space-y-8">
                        <section className="bg-brand-charcoal text-white rounded-sm shadow-sm p-6">
                            <h2 className="text-[10px] uppercase tracking-widest text-brand-sand font-bold mb-6">Resumen Financiero</h2>
                            
                            <div className="space-y-4 text-sm font-light text-gray-300">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(sale.net_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Impuestos</span>
                                    <span>{formatCurrency(sale.tax_amount)}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-700 flex justify-between font-bold text-white text-lg">
                                    <span>Total pagado</span>
                                    <span className="text-brand-sand">{formatCurrency(sale.total_amount)}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-700">
                                <p className="text-[10px] uppercase tracking-widest text-brand-sand font-bold mb-2">Método de Pago</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                    <span className="capitalize">{sale.payment_method?.replace(/_/g, ' ') || 'No registrado'}</span>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 space-y-4">
                            <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">Acciones de Venta</h2>
                            
                            <button disabled className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-400 border border-gray-200 rounded-sm text-[10px] uppercase tracking-widest font-bold cursor-not-allowed transition-all">
                                <Download className="w-3 h-3" /> Descargar Recibo
                            </button>
                            
                            <button disabled className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-400 border border-gray-200 rounded-sm text-[10px] uppercase tracking-widest font-bold cursor-not-allowed transition-all">
                                <FileText className="w-3 h-3" /> Emitir Boleta (SII)
                            </button>

                            <p className="text-[10px] text-gray-400 text-center italic pt-2">Funciones documentales en construcción</p>
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
}
