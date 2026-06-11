require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

async function createIntentRoot() {
    const token = process.env.MP_ACCESS_TOKEN;
    const terminalId = 'NEWLAND_N950__N950NCC804183989'; 

    const payload = {
        type: "point",
        external_reference: "order_test_root",
        total_amount: 100, // root amount!
        config: {
            point: {
                terminal_id: terminalId,
                print_on_terminal: "no_ticket"
            }
        },
        description: "Payment test root"
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
            console.error('Error root:', response.status, errData);
        } else {
            const data = await response.json();
            console.log('Success root:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

createIntentRoot();
