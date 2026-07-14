import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Tipos para Work Orders
export type WorkOrderType = 'bespoke' | 'modificacion' | 'reparacion' | 'graduacion' | 'novia' | 'madrina' | 'b2b_batch' | 'upcycling';
export type WorkOrderCategory = 'alta_costura' | 'sastreria' | 'reparacion' | 'confeccion';
export type WorkOrderStatus = 'consulta' | 'presupuesto' | 'contrato_pendiente' | 'draft' | 'cutting' | 'sewing' | 'finishing' | 'ready' | 'entregado' | 'cancelled';
export type WorkOrderPriority = 'urgente' | 'alta' | 'normal' | 'baja';

export interface CreateWorkOrderDTO {
    customer_id?: string;
    sale_id?: string;
    pos_order_id?: string;
    order_type: WorkOrderType;
    order_category: WorkOrderCategory;
    source?: string;
    status?: WorkOrderStatus;
    priority?: WorkOrderPriority;
    description: string;
    notes?: string;
    total_amount?: number;
    paid_amount?: number;
    payment_status?: string;
    payment_method?: string;
    payment_plan?: any;
    deadline?: string | null;
    estimated_hours?: number;
    assigned_operator_id?: string;
    // Alta costura fields
    event_date?: string | null;
    event_venue?: string;
    project_type?: string;
    service_type?: string;
    legacy_bridal_project_id?: string;
    legacy_production_order_id?: string;
}

export async function createWorkOrder(data: CreateWorkOrderDTO) {
    const supabase = await createClient();
    
    const { data: order, error } = await supabase
        .from('work_orders')
        .insert([data])
        .select()
        .single();
        
    if (error) {
        console.error('Error creating work order:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, order };
}

export async function updateWorkOrder(id: string, updates: Partial<CreateWorkOrderDTO>) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from('work_orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
        
    if (error) {
        console.error('Error updating work order:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true };
}

export async function getWorkOrder(id: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('work_orders')
        .select(`
            *,
            customers(full_name, email, phone),
            work_order_items(*),
            work_order_milestones(*)
        `)
        .eq('id', id)
        .single();
        
    if (error) return null;
    return data;
}

export async function getWorkOrdersByCategory(category: WorkOrderCategory) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('work_orders')
        .select('*, customers(full_name)')
        .eq('order_category', category)
        .order('created_at', { ascending: false });
        
    if (error) return [];
    return data;
}

// Para Novias y Alta Costura específicamente
export async function getHauteCoutureOrders() {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('work_orders')
        .select('*, customers(full_name)')
        .eq('order_category', 'alta_costura')
        .order('created_at', { ascending: false });
        
    if (error) return [];
    return data;
}

export async function createWorkOrderMilestone(workOrderId: string, type: string, title: string, scheduledDate?: string, agendaEventId?: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('work_order_milestones')
        .insert([{
            work_order_id: workOrderId,
            milestone_type: type,
            title,
            scheduled_date: scheduledDate,
            agenda_event_id: agendaEventId
        }])
        .select()
        .single();
        
    if (error) return { success: false, error: error.message };
    return { success: true, milestone: data };
}
