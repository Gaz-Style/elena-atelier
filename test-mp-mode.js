require('dotenv').config({ path: '.env.local' });

async function changeMode() {
    const token = process.env.MP_ACCESS_TOKEN;
    const deviceId = 'NEWLAND_N950__N950NCC804183989'; 

    try {
        const response = await fetch(`https://api.mercadopago.com/point/integration-api/devices/${deviceId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ operating_mode: 'PDV' })
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error('Error changing mode:', response.status, errData);
        } else {
            const data = await response.json();
            console.log('Success changing mode:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

changeMode();
