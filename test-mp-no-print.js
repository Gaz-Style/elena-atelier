require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

async function createIntent() {
    const token = process.env.MP_ACCESS_TOKEN;
    const terminalId = 'NEWLAND_N950__N950NCC804183989'; 

    const payload = {
        type: "point",
        external_reference: "order_test_no_config",
        transactions: {
            payments: [
                {
                    amount: "1500" // 1500 CLP to be safe
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

        if (!response.ok) {
            const errData = await response.text();
            console.error('Error:', response.status, errData);
        } else {
            const data = await response.json();
            console.log('Success without print_on_terminal:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

createIntent();
