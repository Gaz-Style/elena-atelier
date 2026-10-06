const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
        console.error("Error fetching users:", error);
        return;
    }
    
    console.log("Users:", JSON.stringify(users, null, 2));
}

main();
