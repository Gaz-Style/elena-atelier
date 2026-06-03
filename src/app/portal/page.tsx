import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Passport from '@/components/Passport';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function ClientPortalPage() {
    const supabase = await createClient();
    
    // 1. Get current authenticated user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        redirect('/portal/login');
    }

    // 2. Fetch customer profile associated with this email
    const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('email', user.email)
        .single();

    if (!customer) {
        // Handle case where user is logged in but has no customer profile
        return (
            <div className="min-h-screen bg-[#F0EDE8] flex flex-col items-center justify-center p-6">
                <div className="bg-white p-8 rounded-sm shadow-sm max-w-md w-full text-center">
                    <h2 className="font-serif text-2xl text-brand-charcoal mb-4">Perfil no encontrado</h2>
                    <p className="text-gray-500 text-sm mb-6">No encontramos un perfil de clienta asociado al correo {user.email}. Por favor, contacta a tu asesora.</p>
                    <form action="/auth/signout" method="post">
                        <button className="text-brand-terracotta text-xs uppercase tracking-widest font-bold hover:underline">
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // 3. Fetch active or recent production orders for this customer
    const { data: orders } = await supabase
        .from('production_orders')
        .select('*, catalog(name)')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-[#F0EDE8] font-sans pb-24">
            {/* Minimal Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="font-serif text-xl text-brand-charcoal">Elena Atelier</div>
                    <div className="flex items-center gap-6">
                        <span className="text-xs uppercase tracking-widest text-gray-500 font-bold hidden md:inline">
                            Bienvenida, {customer.full_name?.split(' ')[0] || 'Clienta'}
                        </span>
                        <form action="/auth/signout" method="post">
                            <button className="text-gray-400 hover:text-brand-terracotta transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                                <LogOut className="w-4 h-4" /> Salir
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 space-y-12">
                <div className="text-center mb-12">
                    <h1 className="font-serif text-3xl md:text-4xl text-brand-charcoal mb-4">Tu Pasaporte de Costura</h1>
                    <p className="text-gray-500 text-sm">Aquí puedes hacer seguimiento a todas tus prendas en confección.</p>
                </div>

                {!orders || orders.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-sm border border-gray-100 shadow-sm">
                        <p className="text-gray-400 text-sm uppercase tracking-widest">Aún no tienes prendas en el taller.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {orders.map(order => {
                            const validStatuses = ['cutting', 'sewing', 'finishing', 'ready'] as const;
                            type ValidStatus = typeof validStatuses[number];
                            const rawStatus = order.status === 'completed' ? 'ready' : 'sewing';
                            const mappedStatus: ValidStatus = validStatuses.includes(rawStatus as ValidStatus) ? rawStatus as ValidStatus : 'sewing';

                            const passportData = {
                                id: order.id.split('-')[0],
                                garmentName: order.catalog?.name || 'Prenda a Medida',
                                artisan: order.assigned_operator || 'Pendiente de asignación',
                                fabricOrigin: order.notes?.includes('Telas') ? order.notes : 'Seda Italiana Premium',
                                confectionDate: new Date(order.estimated_completion).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }),
                                status: mappedStatus
                            };

                            return (
                                <div key={order.id} className="relative">
                                    <Passport data={passportData} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
