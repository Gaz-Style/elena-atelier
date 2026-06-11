require('dotenv').config({ path: '.env.local' });

async function testWsp() {
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
    const numeroEncargado = '56984021940';
    const mensajeWsp = '🔔 *Test de API*\n\nSi ves esto, el bot de WhatsApp tiene permisos para enviarte mensajes.';
    
    console.log('Sending to', numeroEncargado, 'using ID', WHATSAPP_PHONE_NUMBER_ID);

    try {
        const resp = await fetch(`https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: numeroEncargado,
                type: 'text',
                text: { body: mensajeWsp }
            })
        });
        const data = await resp.json();
        console.log('WhatsApp Encargado Response:', data);
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testWsp();
