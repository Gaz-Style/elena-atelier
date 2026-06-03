'use server';

import { createClient } from '@/lib/supabase/server';

export async function getOperatorsWithPayrollAction() {
    const supabase = await createClient();
    
    // Get operators
    const { data: operators, error: opError } = await supabase
        .from('atelier_operators')
        .select('*')
        .order('name');
        
    if (opError) {
        console.error('Error fetching operators:', opError);
        return [];
    }

    // Get unpaid assignments for all operators
    const { data: assignments, error: assigError } = await supabase
        .from('hrm_garment_assignments')
        .select('*, production_orders(description, status, pos_order_id)')
        .eq('status', 'completed');
        
    if (assigError && assigError.code !== '42P01') {
        console.error('Error fetching assignments:', assigError);
    }

    // Map operators with their unpaid totals
    return operators.map(op => {
        const opAssignments = (assignments || []).filter(a => a.operator_id === op.id);
        const totalPending = opAssignments.reduce((sum, a) => sum + Number(a.calculated_amount), 0);
        return {
            ...op,
            pendingAmount: totalPending + Number(op.base_salary || 0),
            assignments: opAssignments
        };
    });
}

export async function payOperatorAction(operatorId: string) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from('hrm_garment_assignments')
        .update({ status: 'paid' })
        .eq('operator_id', operatorId)
        .eq('status', 'completed');
        
    if (error) {
        return { success: false, error: error.message };
    }
    
    return { success: true };
}
