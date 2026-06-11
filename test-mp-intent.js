require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

async function createIntent() {
    const token = process.env.MP_ACCESS_TOKEN;
    const terminalId = 'NEWLAND_N950__N950NCC804183989'; 

    const payload = {
        type: "point",
        external_reference: "order_12345",
        transactions: {
            payments: [
                {
                    amount: 100 // wait... let's try just 100 but wrap it properly if needed. Actually let's try amount: 100 or amount: "100"
                }
            ]
        },
        config: {
            point: {
                terminal_id: terminalId,
                print_on_terminal: "no_ticket"
            }
        },
        description: "Payment for order 1234"
    };
    
    // I will try setting amount to 100 without decimals, or "100" string, let's try integer first. But wait, it said "expected string but got number".
    // I will set amount: "100".
    payload.transactions.payments[0].amount = "100";

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
            console.log('Success:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

createIntent();
