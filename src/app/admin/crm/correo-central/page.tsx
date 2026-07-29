import { createClient } from '@/lib/supabase/server';
import CorreoCentralClient from './CorreoCentralClient';
import { getUnreadCountsPerCustomer } from '../actions';

export const metadata = {
    title: 'Central de Correos — Elena Atelier',
    description: 'Bandeja de conversaciones con clientas, hilos de correo y campañas de marketing masivas.'
};

export default async function CorreoCentralPage() {
    const supabase = await createClient();

    // Customers with email addresses
    const { data: customers } = await supabase
        .from('customers')
        .select('id, full_name, email, phone')
        .not('email', 'is', null)
        .order('full_name', { ascending: true });

    // Marketing campaigns history
    const { data: campaigns } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

    // Fetch all crm_email_threads messages with customer names joined
    const { data: allMessages } = await supabase
        .from('crm_email_threads')
        .select(`
            id,
            customer_id,
            subject,
            direction,
            sender,
            recipient,
            body_text,
            body_html,
            created_at,
            read_at,
            customers (
                id,
                full_name,
                email
            )
        `)
        .order('created_at', { ascending: false });

    // Calculate total unread (inbound messages where read_at is null)
    const totalUnread = (allMessages || []).filter(m => m.direction === 'inbound' && m.read_at === null).length;

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-gray-200">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-brand-charcoal font-serif">Central de Correos</h1>
                        {totalUnread > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                                {totalUnread} nuevo{totalUnread > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">Conversaciones por hilo, redactor de plantillas y campañas masivas.</p>
                </div>
            </div>

            <CorreoCentralClient
                initialCustomers={customers || []}
                initialCampaigns={campaigns || []}
                initialMessages={allMessages || []}
            />
        </div>
    );
}
