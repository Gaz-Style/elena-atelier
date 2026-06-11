require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

async function cancelOrder() {
    const token = process.env.MP_ACCESS_TOKEN;
    const orderId = 'ORD01KTTCYKEXDKAVKPAZBKWJAMTY'; // the test order

    try {
        const response = await fetch(`https://api.mercadopago.com/v1/orders/${orderId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': crypto.randomUUID()
            }
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error('Error cancelling:', response.status, errData);
        } else {
            console.log('Success cancelling test order!');
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

cancelOrder();
