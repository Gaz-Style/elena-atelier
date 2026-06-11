require('dotenv').config({ path: '.env.local' });

async function setModePDV() {
    const token = process.env.MP_ACCESS_TOKEN;
    
    const payload = {
        terminals: [
            {
                id: "NEWLAND_N950__N950NCC804183989",
                operating_mode: "PDV"
            }
        ]
    };

    try {
        const response = await fetch(`https://api.mercadopago.com/terminals/v1/setup`, {
            method: 'PATCH',
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
            console.log('Success setting mode to PDV:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

setModePDV();
