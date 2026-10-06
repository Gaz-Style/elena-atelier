const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log("Fetching user elenaatalier@gmail.com...");
    const { data: { users }, error: fetchError } = await supabase.auth.admin.listUsers();
    
    if (fetchError) {
        console.error("Error fetching users:", fetchError.message);
        return;
    }

    const adminUser = users.find(u => u.email === 'elenaatalier@gmail.com');
    if (!adminUser) {
        console.error("Admin user not found.");
        return;
    }

    console.log(`Found admin user: ${adminUser.id}. Updating password...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
        password: 'Mcruz1232'
    });

    if (updateError) {
        console.error("Error updating password:", updateError.message);
    } else {
        console.log("Successfully updated password. All previous sessions are now invalidated.");
    }
}

main();
