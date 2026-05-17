'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getInventoryItems() {
    try {
        const { data, error } = await supabase
            .from('fabric_inventory')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) throw error;
        return data || [];
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
            .from('fabric_inventory')
            .insert([{
                name: item.name,
                category: item.category,
                stock_meters: item.category === 'telas' ? item.stock : 0,
                stock: item.stock,
                unit: item.unit,
                price_per_meter: item.category === 'telas' ? item.price : 0,
                price: item.price,
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
            .from('fabric_inventory')
            .select('category')
            .eq('id', id)
            .single();

        const updates: any = { stock: newStock };
        if (currentItem && currentItem.category === 'telas') {
            updates.stock_meters = newStock;
        }

        const { error } = await supabase
            .from('fabric_inventory')
            .update(updates)
            .eq('id', id);
        
        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        console.error('Error updating stock:', e);
        return { success: false, error: e.message };
    }
}
