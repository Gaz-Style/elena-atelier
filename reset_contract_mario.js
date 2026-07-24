require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const projectId = '8f1caa02-f197-4745-b28b-a71eb4276341'; // Mario Cruz

async function main() {
  const { data, error } = await supabase
    .from('bridal_projects')
    .update({ contract_accepted: false, contract_accepted_at: null })
    .eq('id', projectId);
  if (error) {
    console.error('Error updating project:', error);
    process.exit(1);
  }
  console.log('Project updated:', data);
}

main();
