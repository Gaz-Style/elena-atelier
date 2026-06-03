'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getInventoryItems() {
    try {
        const { data, error } = await supabase
            .from('erp_inventory')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) throw error;
        // Map stock_qty to stock, and cost_per_unit to price for the UI
        return (data || []).map(item => ({
            ...item,
            stock: Number(item.stock_qty),
            price: Number(item.cost_per_unit)
        }));
    } catch (e: any) {
        console.error('Error fetching inventory:', e);
        return [];
    }
}

export async function addInventoryItem(item: {
    name: string;
    category: string;
    stock: number;
    unit: string;
    price: number;
    color: string;
    composition: string;
}) {
    try {
        const { data, error } = await supabase
            .from('erp_inventory')
            .insert([{
                name: item.name,
                category: item.category,
                stock_qty: item.stock,
                unit: item.unit,
                cost_per_unit: item.price,
                color: item.color,
                composition: item.composition
            }])
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (e: any) {
        console.error('Error adding inventory item:', e);
        return { success: false, error: e.message };
    }
}

export async function updateInventoryStock(id: string, newStock: number) {
    try {
        const { data: currentItem } = await supabase
            .from('erp_inventory')
            .select('category')
            .eq('id', id)
            .single();

        const updates: any = { stock_qty: newStock };

        const { error } = await supabase
            .from('erp_inventory')
            .update(updates)
            .eq('id', id);
        
        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        console.error('Error updating stock:', e);
        return { success: false, error: e.message };
    }
}
