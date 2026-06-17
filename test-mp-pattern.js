require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

async function testPattern() {
    const token = process.env.MP_ACCESS_TOKEN;
    const terminalId = 'NEWLAND_N950__N950NCC804183989'; 

    const payload = {
        type: "point",
        external_reference: "order_test_pattern",
        transactions: {
            payments: [
                {
                    amount: "1000.00"
                }
            ]
        },
        config: {
            point: {
                terminal_id: terminalId
            }
        },
        description: "Payment for order 1234"
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

        const errData = await response.text();
        console.log('Response:', response.status, errData);
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testPattern();
