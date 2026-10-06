require('dotenv').config({ path: '.env.local' });

const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const token = process.env.WHATSAPP_API_TOKEN;

async function checkMeta() {
    console.log(`Checking Meta API with Bearer token...`);
    
    // Testing the exact way it's called in src/lib/agenda.ts
    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: '56912345678', // dummy number
                type: 'text',
                text: { body: 'Test' }
            })
        });
        
        const data = await response.json();
        console.log("Meta API Response:");
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch failed", e);
    }
}

checkMeta();
