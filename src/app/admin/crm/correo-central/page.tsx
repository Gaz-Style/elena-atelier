import { createClient } from '@/lib/supabase/server';
import CorreoCentralClient from './CorreoCentralClient';

export const metadata = {
    title: 'Central de Correos - Elena Atelier',
    description: 'Bandeja de entrada conversacional, hilos de correo y campañas de marketing masivas.'
};

export default async function CorreoCentralPage() {
    const supabase = await createClient();

    // Fetch customers with email addresses
    const { data: customers } = await supabase
        .from('customers')
        .select('id, full_name, email, phone')
        .neq('email', null)
        .order('full_name', { ascending: true });

    // Fetch marketing campaigns
    const { data: campaigns } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white font-serif">Central de Correos</h1>
                    <p className="text-white/60 text-sm mt-1">Administra conversaciones en hilo y dispara boletines a tus clientas.</p>
                </div>
            </div>
            
            <CorreoCentralClient 
                initialCustomers={customers || []} 
                initialCampaigns={campaigns || []} 
            />
        </div>
    );
}
