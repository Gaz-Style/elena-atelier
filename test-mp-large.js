require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

async function createIntentLarge() {
    const token = process.env.MP_ACCESS_TOKEN;
    const terminalId = 'NEWLAND_N950__N950NCC804183989'; 

    const payload = {
        type: "point",
        external_reference: "3915200", // purely numeric, no underscores
        transactions: {
            payments: [
                {
                    amount: "15000" // 15000 CLP
                }
            ]
        },
        config: {
            point: {
                terminal_id: terminalId
            }
        },
        description: "Venta de prueba"
    };

    try {
        const response = await fetch(`https://api.mercadopago.com/v1/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': crypto.randomUUID()
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error('Error:', response.status, errData);
        } else {
            const data = await response.json();
            console.log('Success large:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

createIntentLarge();
