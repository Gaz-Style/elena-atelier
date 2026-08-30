const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Recent 50 logs...");
    const { data: logs, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
    if (error) {
        console.error("Logs error:", error);
    } else {
        console.log(logs.map(l => ({
            id: l.id,
            created_at: l.created_at,
            service: l.service,
            level: l.level,
            message: l.message
        })));
    }
}
main();
