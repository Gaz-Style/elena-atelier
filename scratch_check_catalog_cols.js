const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCatalogSales() {
    const { data: catalogItems, error } = await supabase.from('catalog').select('*');
    console.log('Total catalog items:', catalogItems ? catalogItems.length : 0);
    
    // Check if sales_count column exists
    if (catalogItems && catalogItems[0]) {
        console.log('Has sales_count column?:', 'sales_count' in catalogItems[0]);
    }
}

checkCatalogSales();
