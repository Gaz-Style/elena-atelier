'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDynamicCategoryPrices() {
    try {
        const supabase = await createClient();
        const { data: items, error } = await supabase.from('catalog').select('name, category, price, active').eq('active', true);
        
        if (error || !items || items.length === 0) {
            return null;
        }

        const categoryMins: Record<string, number> = {};

        for (const item of items) {
            const cat = (item.category || '').toLowerCase();
            if (!categoryMins[cat] || item.price < categoryMins[cat]) {
                categoryMins[cat] = item.price;
            }
        }

        return categoryMins;
    } catch (e) {
        console.error('Error fetching dynamic category prices:', e);
        return null;
    }
}
