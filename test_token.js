require('dotenv').config({ path: '.env.local' });

async function debugToken() {
    const token = process.env.WHATSAPP_API_TOKEN;
    const url = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

debugToken();
