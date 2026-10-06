require('dotenv').config({ path: '.env.local' });

const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const token = process.env.WHATSAPP_API_TOKEN;

async function checkMeta() {
    console.log(`Checking Meta API for Phone ID: ${phoneId}`);
    
    // Check business profile or just send a dummy request to see if token is valid
    const url = `https://graph.facebook.com/v21.0/${phoneId}?access_token=${token}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        console.log("Meta API Response:");
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch failed", e);
    }
}

checkMeta();
