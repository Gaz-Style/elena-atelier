require('dotenv').config({ path: '.env.local' });

async function clearIntent() {
    const token = process.env.MP_ACCESS_TOKEN;
    const deviceId = 'NCC804183989'; 

    try {
        const response = await fetch(`https://api.mercadopago.com/point/integration-api/devices/${deviceId}/payment-intents`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error('Error deleting:', response.status, errData);
        } else {
            console.log('Success deleting intent! Queue is cleared.');
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

clearIntent();
