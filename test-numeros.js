import { config } from 'dotenv';
config({ path: '.env.local' });

// Usaremos el token de Vercel directamente para este test.
// Si el token local es diferente, ajusta manualmente aquí.
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function testNumber(phone) {
    console.log(`\n=== Probando envío a ${phone} ===`);
    const res = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: { body: 'Prueba de diagnóstico desde Live Chat' }
        })
    });
    const data = await res.json();
    console.log(`Respuesta para ${phone}:`, JSON.stringify(data, null, 2));
}

async function main() {
    console.log('PHONE_NUMBER_ID:', PHONE_NUMBER_ID);
    console.log('TOKEN ok:', WHATSAPP_API_TOKEN ? 'SI' : 'NO');
    
    await testNumber('56984021940');
    await testNumber('56937667709');
}

main().catch(console.error);
