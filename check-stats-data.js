const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log('--- REVIEW LOGS COUNT ---');
    const { data: logs, error: logsError } = await supabase
        .from('system_logs')
        .select('id, service, level, created_at');
    
    console.log("Total logs in system_logs:", logs?.length || 0);
    if (logs) {
        const services = {};
        logs.forEach(l => {
            services[l.service] = (services[l.service] || 0) + 1;
        });
        console.log("Logs by service:", services);
    }
    if (logsError) console.error("Logs error:", logsError);

    console.log('\n--- FIXED COSTS FOR AUG 2026 ---');
    const { data: fixed, error: fixedError } = await supabase
        .from('fixed_costs')
        .select('*')
        .eq('month', 8)
        .eq('year', 2026);
    
    console.log("Fixed costs count for Aug 2026:", fixed?.length || 0);
    console.log("Data:", fixed);
    if (fixedError) console.error("Fixed error:", fixedError);
}

main();
