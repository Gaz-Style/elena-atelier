require('dotenv').config({ path: '.env.local' });

async function checkTerminal() {
    const token = process.env.MP_ACCESS_TOKEN;
    
    try {
        const response = await fetch('https://api.mercadopago.com/terminals/v1/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log("Terminals:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

checkTerminal();
