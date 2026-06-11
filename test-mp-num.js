require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

async function createIntent() {
    const token = process.env.MP_ACCESS_TOKEN;
    const terminalId = 'NEWLAND_N950__N950NCC804183989'; 

    const payload = {
        type: "point",
        external_reference: "order_test_float",
        transactions: {
            payments: [
                {
                    amount: 100 // sending as integer number
                }
            ]
        },
        config: {
            point: {
                terminal_id: terminalId,
                print_on_terminal: "no_ticket"
            }
        },
        description: "Payment for test"
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
            console.error('Error (100):', response.status, errData);
        } else {
            console.log('Success (100)!');
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

createIntent();
