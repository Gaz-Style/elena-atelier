const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    // try to query information_schema.tables if accessible (usually not via REST, but we can try via rpc if exists)
    // Instead, let's query a known table or we can just fetch via raw REST endpoint if we want, but RPC is needed.
    // Let's try to query 'system_logs' just in case it exists.
    const { data: logs, error: logsError } = await supabase
        .from('system_logs')
        .select('*')
        .limit(20);
        
    console.log("system_logs error:", logsError);
    if (logs) console.log("system_logs:", logs);
}

main();
