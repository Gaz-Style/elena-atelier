require('dotenv').config({ path: '.env.local' });

async function createLegacyIntent() {
    const token = process.env.MP_ACCESS_TOKEN;
    const deviceId = 'NEWLAND_N950__N950NCC804183989'; 

    const payload = {
        amount: 1000,
        description: "Test legacy",
        payment: {
            installments: 1,
            type: "credit_card",
            installments_cost: "merchant"
        },
        additional_info: {
            external_reference: "order_legacy_test",
            print_on_terminal: true
        }
    };

    try {
        const response = await fetch(`https://api.mercadopago.com/point/integration-api/devices/${deviceId}/payment-intents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error('Error:', response.status, errData);
        } else {
            const data = await response.json();
            console.log('Success legacy:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

createLegacyIntent();
