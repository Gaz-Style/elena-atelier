import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import { ArrowLeft } from 'lucide-react';
import EmailComposerClient from './EmailComposerClient';
import { getNotificationLogsAction } from '../../actions';

export const revalidate = 0;

export default async function CustomerEmailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch customer data
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (customerError || !customer) {
        return notFound();
    }

    // Fetch communication logs
    const logs = await getNotificationLogsAction(id);

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-24">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 md:px-8 pt-32 space-y-8">
                
                {/* Header */}
                <header className="border-b border-gray-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <Link href={`/admin/crm/${customer.id}`} className="text-[10px] uppercase tracking-widest text-gray-400 font-bold hover:text-brand-terracotta transition-colors flex items-center gap-2 mb-4">
                            <ArrowLeft className="w-3 h-3" /> Volver al Perfil de {customer.full_name.split(' ')[0]}
                        </Link>
                        <h1 className="font-serif text-4xl text-brand-charcoal">Redactor de Correo</h1>
                        <p className="text-gray-500 mt-2 text-sm">Envía notificaciones de la base de correo o redacta un mensaje personalizado para {customer.full_name}.</p>
                    </div>
                    <div className="bg-brand-charcoal text-white px-4 py-2.5 rounded-sm text-[10px] uppercase tracking-widest font-mono">
                        Para: {customer.email || 'Sin correo registrado'}
                    </div>
                </header>

                <EmailComposerClient customer={customer} initialLogs={logs} />

            </main>
        </div>
    );
}
