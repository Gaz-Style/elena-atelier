const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log("Fixing bridal sales_ledger entries...");
    
    // Fetch all bridal sales from sales_ledger
    const { data: sales, error } = await supabase
        .from('sales_ledger')
        .select('*')
        .like('internal_id', 'bridal_%')
        .not('internal_id', 'like', '%_balance_%');
        
    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${sales.length} bridal ledger entries.`);
    
    // Fetch all bridal projects to get true total_amount
    const { data: projects } = await supabase.from('bridal_projects').select('id, total_amount');
    const projectMap = new Map();
    projects.forEach(p => projectMap.set(p.id, p.total_amount));

    let fixedCount = 0;

    for (const sale of sales) {
        // internal_id is like: bridal_1d18a6f8-2071-4098-97e9-47bfc9e89235_custom_p1
        // or bridal_UUID_p1
        
        let projectId = null;
        let pIndex = null;
        
        const match = sale.internal_id.match(/bridal_([a-f0-9\-]+)_(custom_p|p)(\d+)/);
        if (match) {
            projectId = match[1];
            pIndex = parseInt(match[3]);
        }
        
        if (projectId && projectMap.has(projectId)) {
            const realTotal = projectMap.get(projectId);
            
            if (pIndex === 1) {
                // If it's the first payment, the total_amount in sales_ledger should be the REAL total
                if (sale.total_amount !== realTotal) {
                    console.log(`Fixing ${sale.internal_id}: total_amount ${sale.total_amount} -> ${realTotal}`);
                    await supabase
                        .from('sales_ledger')
                        .update({ 
                            total_amount: realTotal,
                            status: sale.paid_amount >= realTotal ? 'completed' : 'partial'
                        })
                        .eq('id', sale.id);
                    fixedCount++;
                }
            } else if (pIndex > 1) {
                // If it's p2, p3, etc, it should be renamed to _balance_ so it doesn't count as a new sale
                // We rename it to bridal_{uuid}_custom_p1_balance_p{index}
                const isCustom = sale.internal_id.includes('_custom_');
                const baseId = `bridal_${projectId}${isCustom ? '_custom_p1' : '_p1'}`;
                const newId = `${baseId}_balance_p${pIndex}`;
                
                console.log(`Renaming balance ${sale.internal_id} -> ${newId}`);
                await supabase
                    .from('sales_ledger')
                    .update({ internal_id: newId })
                    .eq('id', sale.id);
                fixedCount++;
            }
        }
    }
    
    console.log(`Done. Fixed ${fixedCount} entries.`);
}

fix();
