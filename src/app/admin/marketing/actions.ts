'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMarketingTasks() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('marketing_tasks').select('*').order('created_at', { ascending: true });
    if (error) {
        console.error('Error fetching marketing tasks:', error);
        return [];
    }
    return data || [];
}

export async function updateMarketingTaskStatus(id: string, newStatus: string, newDate: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('marketing_tasks').update({ status: newStatus, target_date: newDate }).eq('id', id);
    if (error) return { success: false, error: error.message };
    
    revalidatePath('/admin/marketing');
    return { success: true };
}

export async function getMarketingMetrics() {
    const supabase = await createClient();
    
    // Calculate WhatsApp Conversion Rate
    const { count: chatsCount } = await supabase.from('crm_whatsapp_chats').select('*', { count: 'exact', head: true });
    
    // Get unique sales from POS where total_amount > 0 to see real conversions
    const { count: salesCount } = await supabase.from('sales_ledger').select('*', { count: 'exact', head: true }).gt('total_amount', 0);
    
    let conversionRate = 0;
    if (chatsCount && salesCount && chatsCount > 0) {
        // Just an illustrative mathematical conversion rate for the dashboard
        // If there are 10 chats and 2 sales, rate = 20%
        conversionRate = Math.round((salesCount / chatsCount) * 100);
    }
    
    return {
        whatsappConversion: conversionRate > 100 ? 100 : conversionRate,
        chatsTotal: chatsCount || 0
    };
}
