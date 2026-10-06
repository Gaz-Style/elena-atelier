const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getChileDateParts = (dateInput) => {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
    const parts = formatter.formatToParts(d);
    const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
    return {
        year: parseInt(map.year),
        month: parseInt(map.month),
    };
};

async function testUI() {
    const { data: salesList, error } = await supabase
        .from('sales_ledger')
        .select('*');
        
    const filteredSales = salesList.filter(s => {
        if (s.status === 'cancelled') return false;
        const sParts = getChileDateParts(s.created_at);
        if (sParts.year !== 2026) return false;
        if (sParts.month !== 9) return false;
        return true;
    });
    
    const mainSales = filteredSales.filter(s => !s.internal_id.includes('_balance_'));
    const totalSalesVolume = mainSales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
    
    const mainSalesIds = new Set(mainSales.map(s => s.internal_id));
    
    const cashCollected = salesList.reduce((sum, s) => {
        if (s.status === 'cancelled') return sum;
        const baseId = s.internal_id.split('_balance_')[0];
        if (mainSalesIds.has(baseId)) {
            if (s.status === 'completed' || s.status === 'paid' || s.status === 'partial') {
                return sum + (Number(s.paid_amount) || 0);
            }
        }
        return sum;
    }, 0);
    
    console.log(`UI Ventas del Mes: ${totalSalesVolume}`);
    console.log(`UI Caja Real: ${cashCollected}`);
    
    // Find what makes up cashCollected
    let cashLog = [];
    salesList.forEach(s => {
        if (s.status === 'cancelled') return;
        const baseId = s.internal_id.split('_balance_')[0];
        if (mainSalesIds.has(baseId) && ['completed', 'paid', 'partial'].includes(s.status)) {
            cashLog.push({ id: s.internal_id, amt: s.paid_amount });
        }
    });
    
    const totalLog = cashLog.reduce((s, x) => s + x.amt, 0);
    console.log(`Total Logged: ${totalLog}`);
    // console.log(cashLog);
}

testUI();
