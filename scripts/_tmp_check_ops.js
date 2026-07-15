const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDB() {
    const { data, error } = await supabase
        .from('atelier_operators')
        .select('*');
    
    if (error) {
        console.error("DB Error:", error.message);
    } else {
        console.log(`Operators found:`);
        data.forEach(op => console.log(op.id, op.name));
    }
}
testDB();
