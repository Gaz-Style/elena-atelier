'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCurrentCashRegisterAction() {
    const supabase = await createClient();
    
    // Buscar la última caja abierta
    const { data: register, error } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('status', 'open')
        .order('opened_at', { ascending: false })
        .limit(1)
        .single();
        
    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
        console.error('Error fetching current cash register:', error);
        return { success: false, error: error.message };
    }
    
    if (!register) {
        return { success: true, register: null };
    }
    
    // Si hay una caja abierta, necesitamos sumar las ventas del día desde que se abrió
    // Solo tomamos en cuenta las órdenes pagadas de la planilla de ventas.
    const { data: sales, error: salesError } = await supabase
        .from('sales_ledger')
        .select('payment_method, total_amount')
        .gte('created_at', register.opened_at)
        .eq('status', 'completed');
        
    if (salesError) {
        console.error('Error fetching sales for register:', salesError);
    }
    
    // Obtener movimientos manuales
    const { data: movements, error: movementsError } = await supabase
        .from('cash_movements')
        .select('*')
        .eq('register_id', register.id)
        .order('created_at', { ascending: true });
        
    if (movementsError) {
        console.error('Error fetching movements for register:', movementsError);
    }
    
    let expectedCash = Number(register.opening_amount);
    let expectedCard = 0;
    
    // Sumar ventas
    if (sales) {
        sales.forEach(sale => {
            const method = sale.payment_method?.toLowerCase() || '';
            if (method.includes('efectivo') || method.includes('transferencia')) {
                // Asumimos que "Efectivo / Transferencia" entra a la cuenta del día físicamente o en banco
                // Nota: Si quieres separar transferencia de efectivo real, habría que ajustar esto.
                expectedCash += Number(sale.total_amount);
            } else if (method.includes('mixto')) {
                // Parsear formato mixto: "Mixto (Máquina: $X, Efectivo: $Y)"
                const cardMatch = method.match(/m\u00e1quina:\s*\$(\d+)/i) || method.match(/maquina:\s*\$(\d+)/i);
                const cashMatch = method.match(/efectivo:\s*\$(\d+)/i);
                
                if (cardMatch) expectedCard += Number(cardMatch[1]);
                if (cashMatch) expectedCash += Number(cashMatch[1]);
            } else {
                expectedCard += Number(sale.total_amount);
            }
        });
    }
    
    // Sumar/restar movimientos manuales
    if (movements) {
        movements.forEach(mov => {
            if (mov.type === 'in') {
                expectedCash += Number(mov.amount);
            } else if (mov.type === 'out') {
                expectedCash -= Number(mov.amount);
            }
        });
    }
    
    return { 
        success: true, 
        register, 
        calculated: {
            expectedCash,
            expectedCard,
            salesCount: sales?.length || 0,
            movementsCount: movements?.length || 0
        },
        movements: movements || []
    };
}

export async function openCashRegisterAction(openingAmount: number, userName: string = 'Admin') {
    const supabase = await createClient();
    
    // Verificar que no haya una caja abierta
    const { data: existing } = await supabase
        .from('cash_registers')
        .select('id')
        .eq('status', 'open')
        .single();
        
    if (existing) {
        return { success: false, error: 'Ya existe una caja abierta actualmente.' };
    }
    
    const { data, error } = await supabase
        .from('cash_registers')
        .insert([{
            opening_amount: openingAmount,
            opened_by: userName,
            status: 'open'
        }])
        .select()
        .single();
        
    if (error) {
        console.error('Error opening cash register:', error);
        return { success: false, error: error.message };
    }
    
    revalidatePath('/admin/caja');
    revalidatePath('/admin/pos');
    return { success: true, register: data };
}

export async function closeCashRegisterAction(registerId: string, closingAmount: number, userName: string = 'Admin', notes: string = '') {
    const supabase = await createClient();
    
    // Primero, recalculamos los totales esperados para guardarlos
    const { register, calculated } = await getCurrentCashRegisterAction();
    
    if (!register || register.id !== registerId) {
        return { success: false, error: 'Caja no encontrada o ya cerrada.' };
    }
    
    const difference = closingAmount - (calculated?.expectedCash || 0);
    
    const { error } = await supabase
        .from('cash_registers')
        .update({
            status: 'closed',
            closed_at: new Date().toISOString(),
            closed_by: userName,
            closing_amount: closingAmount,
            expected_cash: calculated?.expectedCash || 0,
            expected_card: calculated?.expectedCard || 0,
            difference: difference,
            notes: notes
        })
        .eq('id', registerId);
        
    if (error) {
        console.error('Error closing cash register:', error);
        return { success: false, error: error.message };
    }
    
    revalidatePath('/admin/caja');
    revalidatePath('/admin/pos');
    return { success: true };
}

export async function addCashMovementAction(registerId: string, type: 'in' | 'out', amount: number, reason: string, userName: string = 'Admin') {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from('cash_movements')
        .insert([{
            register_id: registerId,
            type,
            amount,
            reason,
            created_by: userName
        }]);
        
    if (error) {
        console.error('Error adding cash movement:', error);
        return { success: false, error: error.message };
    }
    
    revalidatePath('/admin/caja');
    return { success: true };
}

export async function getCashRegisterHistoryAction() {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('status', 'closed')
        .order('closed_at', { ascending: false })
        .limit(30);
        
    if (error) {
        console.error('Error fetching cash history:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, history: data || [] };
}

export async function getAllPendingOrdersAction() {
    const supabase = await createClient();
    
    // Instead of querying production_orders only, we need to ensure the sale is pending.
    // However, the UI relies on production_order structure, so we query production_orders
    // and join sales_ledger.
    let query = supabase
        .from('production_orders')
        .select(`
            *,
            customers:customer_id(full_name, phone, email),
            sales_ledger:sale_id(total_amount, paid_amount, status)
        `)
        .not('pos_order_id', 'is', null);
        
    const { data, error } = await query;
    
    if (error) {
        console.error('Error fetching pending orders:', error);
        return { success: false, error: error.message };
    }
    
    const uniqueOrders = new Map();
    
    (data || []).forEach(order => {
        if (!order.sales_ledger || !order.pos_order_id) return;
        
        // Exclude if already completed, cancelled, refunded or annulled in sales ledger
        if (order.sales_ledger.status === 'completed' || order.sales_ledger.status === 'paid' || order.sales_ledger.status === 'cancelled' || order.sales_ledger.status === 'refunded' || order.sales_ledger.status === 'anulado') return;
        
        const total = order.sales_ledger.total_amount || 0;
        const paid = order.sales_ledger.paid_amount || 0;
        
        if (total > paid) {
            // Override the local paid_amount with the accurate sales_ledger paid_amount
            order.paid_amount = paid;
            if (!uniqueOrders.has(order.pos_order_id)) {
                uniqueOrders.set(order.pos_order_id, order);
            }
        }
    });
    
    return { success: true, orders: Array.from(uniqueOrders.values()) };
}

export async function payOrderBalanceAction(posOrderId: string, amountToPay: number, method: string, isPendingTerminal: boolean = false) {
    const supabase = await createClient();
    
    // Always read the balance from sales_ledger since it is the single source of truth for payments
    const { data: sale, error: saleError } = await supabase
        .from('sales_ledger')
        .select('*')
        .eq('internal_id', posOrderId)
        .single();
        
    if (saleError || !sale) {
        return { success: false, error: saleError?.message || 'Venta no encontrada en registros' };
    }
    
    let cashImmediate = 0;
    if (isPendingTerminal && method.toLowerCase().includes('mixto')) {
        const cashMatch = method.match(/efectivo:\s*\$(\d+)/i);
        if (cashMatch) {
            cashImmediate = Number(cashMatch[1]);
        }
    }

    const newPaidAmount = isPendingTerminal 
        ? (Number(sale.paid_amount || 0) + cashImmediate) 
        : (Number(sale.paid_amount || 0) + amountToPay);
    const isFullyPaid = isPendingTerminal ? false : (newPaidAmount >= Number(sale.total_amount));
    
    // Update Production Orders (all items belonging to this order)
    const { error: updateError } = await supabase
        .from('production_orders')
        .update({
            paid_amount: newPaidAmount,
            payment_status: isPendingTerminal ? 'pending' : (isFullyPaid ? 'paid' : 'partial')
        })
        .eq('pos_order_id', posOrderId);
        
    if (updateError) return { success: false, error: updateError.message };
    
    // Update Sales Ledger (the main transaction)
    const { error: salesError } = await supabase
        .from('sales_ledger')
        .update({
            paid_amount: newPaidAmount,
            status: isPendingTerminal ? 'pending' : (isFullyPaid ? 'completed' : 'partial')
        })
        .eq('internal_id', posOrderId);
        
    if (salesError) console.error('Error updating sales ledger:', salesError);
    
    // Insert new record in Sales Ledger for the balance payment to track cash properly for today
    const { error: newSaleError } = await supabase
        .from('sales_ledger')
        .insert([{
            internal_id: `${posOrderId}_balance_${Date.now()}`,
            type: 'pos',
            status: isPendingTerminal ? 'pending' : 'completed',
            total_amount: amountToPay,
            paid_amount: isPendingTerminal ? 0 : amountToPay,
            payment_method: method,
            description: `Pago de Saldo - ${posOrderId}`
        }]);
        
    if (newSaleError) console.error('Error inserting balance payment in sales ledger:', newSaleError);
    
    revalidatePath('/admin/caja');
    revalidatePath('/admin/pos');

    if (isFullyPaid) {
        try {
            const { sendOrderConfirmationEmailByOrderIdAction } = await import('../pos/actions');
            await sendOrderConfirmationEmailByOrderIdAction(posOrderId);
        } catch (emailErr) {
            console.error('Error al enviar correo de confirmación de saldo saldado:', emailErr);
        }
    }

    // Enviar notificaciones de WhatsApp para la porción de pago inmediata
    // OJO: Si es un pago Mixto y está pendiente la maquinita, NO enviar la notificación aún (lo hará el webhook).
    const isMixedPending = isPendingTerminal && method.toLowerCase().includes('mixto');
    const actualPaidNow = isPendingTerminal ? cashImmediate : amountToPay;
    
    if (actualPaidNow > 0 && !isMixedPending) {
        try {
            const { sendWhatsAppPaymentConfirmationAction } = await import('../pos/actions');
            await sendWhatsAppPaymentConfirmationAction(posOrderId, actualPaidNow, method);
        } catch (wspErr) {
            console.error('Error al enviar WhatsApp de confirmación de saldo saldado:', wspErr);
        }
    }

    return { success: true, isFullyPaid, newPaidAmount };
}
