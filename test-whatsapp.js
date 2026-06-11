import { config } from 'dotenv';
config({ path: '.env.local' });

async function sendTest() {
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
    const numeroEncargado = '56984021940';

    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_API_TOKEN) {
        console.error("Faltan variables de entorno");
        return;
    }

    try {
        const res = await fetch(`https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: numeroEncargado,
                type: 'template',
                template: {
                    name: 'alerta_descuento_pos',
                    language: {
                        code: 'es'
                    },
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                { type: 'text', text: 'Prueba Sistema' },
                                { type: 'text', text: 'Test IA' },
                                { type: 'text', text: '50' },
                                { type: 'text', text: '$1.000' },
                                { type: 'text', text: '9999' }
                            ]
                        }
                    ]
                }
            })
        });
        const data = await res.json();
        console.log("Respuesta de Meta:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}
sendTest();
