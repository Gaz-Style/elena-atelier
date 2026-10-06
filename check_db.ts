import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
import { createClient } from '@supabase/supabase-js';

async function main() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const projectId = '194f071a-61b6-4ee2-a8cb-1b6a799b1403';
    
    console.log('--- BRIDAL PROJECT ---');
    const { data: project } = await supabase.from('bridal_projects').select('*').eq('id', projectId).single();
    console.log(project);
    
    console.log('\n--- WORK ORDER ---');
    const { data: wo } = await supabase.from('work_orders').select('*').eq('legacy_bridal_project_id', projectId).single();
    console.log(wo);
}

main();
