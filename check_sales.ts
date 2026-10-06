import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
import { createClient } from '@supabase/supabase-js';

async function main() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const projectId = '194f071a-61b6-4ee2-a8cb-1b6a799b1403';
    const { data: sales } = await supabase.from('sales_ledger').select('*').like('internal_id', `%${projectId}%`);
    console.log(sales);
}
main();
