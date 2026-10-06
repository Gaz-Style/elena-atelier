require('dotenv').config({ path: '.env.local' });

async function testSend() {
    const metaToken = process.env.WHATSAPP_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
    console.log("Token starts with:", metaToken.substring(0, 15));
    console.log("Phone ID:", phoneId);
    
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${metaToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '56984021940', // User's phone
            type: 'text',
            text: { body: 'Test from local script' }
        })
    });
    
    const data = await res.json();
    console.log(data);
}

testSend();
