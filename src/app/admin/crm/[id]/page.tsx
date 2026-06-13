import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, Phone, Mail, FileText, Calendar, CheckCircle, Clock, Edit } from 'lucide-react';

export const revalidate = 0;

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('es-CL', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch customer data
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (customerError || !customer) {
        return notFound();
    }

    // Fetch sales history
    const { data: salesData } = await supabase
        .from('sales_ledger')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: false });

    const sales = salesData || [];
    
    // Calculate total spent (only completed sales)
    const totalSpent = sales.reduce((acc, sale) => {
        if (sale.status === 'completed') return acc + (sale.total_amount || 0);
        return acc;
    }, 0);

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-24">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 md:px-8 pt-32 space-y-8">
                
                {/* Header */}
                <header className="border-b border-gray-200 pb-8">
                    <div className="flex justify-between items-center mb-4">
                        <Link href="/admin/crm" className="text-[10px] uppercase tracking-widest text-gray-400 font-bold hover:text-brand-terracotta transition-colors flex items-center gap-2">
                            <ArrowLeft className="w-3 h-3" /> Volver al Directorio
                        </Link>
                        <Link 
                            href={`/admin/crm/${customer.id}/editar`} 
                            className="bg-brand-charcoal hover:bg-brand-terracotta text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-2"
                        >
                            <Edit className="w-3.5 h-3.5" />
                            Editar Perfil
                        </Link>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="font-serif text-4xl text-brand-charcoal">{customer.full_name}</h1>
                            <p className="text-gray-500 mt-2 font-mono text-sm">ID: {customer.id}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Total Comprado (Histórico)</p>
                            <p className="font-serif text-3xl text-brand-charcoal">{formatCurrency(totalSpent)}</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column - Profile Details */}
                    <div className="space-y-8">
                        <section className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
                            <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" /> Datos Personales
                            </h2>
                            <div className="space-y-4 text-sm text-gray-600">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">RUT</p>
                                    <p className="font-medium text-brand-charcoal">{customer.rut || 'No registrado'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Teléfono</p>
                                    <p className="font-medium text-brand-charcoal flex items-center gap-2">
                                        <Phone className="w-3 h-3 text-gray-400" />
                                        {customer.phone || 'No registrado'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Email</p>
                                    <p className="font-medium text-brand-charcoal flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-gray-400" />
                                        {customer.email || 'No registrado'}
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 mb-1">Estilo / Ocasión</p>
                                    <div className="mt-1">
                                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-[10px] uppercase tracking-widest rounded-sm mb-1 mr-2">
                                            {customer.style_preference || 'Sin definir'}
                                        </span>
                                        <p className="text-xs mt-1 italic">"{customer.typical_occasion || 'Sin detalle'}"</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-brand-charcoal text-white rounded-sm shadow-sm p-6">
                            <h2 className="text-[10px] uppercase tracking-widest text-brand-sand font-bold mb-4">Medidas y Ficha Técnica</h2>
                            {customer.measurements ? (
                                <div className="text-sm font-light text-gray-300 whitespace-pre-wrap">
                                    {customer.measurements}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No hay medidas registradas para esta clienta.</p>
                            )}
                        </section>
                    </div>

                    {/* Right Column - Purchase History */}
                    <div className="md:col-span-2">
                        <section className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="font-serif text-xl text-brand-charcoal">Historial de Compras</h2>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                    {sales.length} transacciones
                                </span>
                            </div>
                            
                            <div className="p-0">
                                {sales.length === 0 ? (
                                    <p className="p-8 text-center text-gray-400 italic text-sm">Esta clienta aún no tiene compras registradas.</p>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                                                <th className="py-3 px-6">ID Venta</th>
                                                <th className="py-3 px-6">Fecha</th>
                                                <th className="py-3 px-6">Monto</th>
                                                <th className="py-3 px-6">Estado</th>
                                                <th className="py-3 px-6 text-right">Detalle</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {sales.map(sale => (
                                                <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-6 font-mono text-xs text-gray-500">{sale.internal_id}</td>
                                                    <td className="py-4 px-6 text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3 text-gray-400" /> {formatDate(sale.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 font-bold text-brand-charcoal">{formatCurrency(sale.total_amount)}</td>
                                                    <td className="py-4 px-6">
                                                        {sale.status === 'completed' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-600">
                                                                <CheckCircle className="w-3 h-3" /> Pagado
                                                            </span>
                                                        ) : sale.status === 'pending' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-500">
                                                                <Clock className="w-3 h-3" /> Pendiente
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cancelada</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <Link href={`/admin/sales/${sale.id}`} className="text-[10px] font-bold uppercase tracking-widest text-brand-terracotta hover:text-brand-charcoal transition-colors">
                                                            Ver 
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
}
