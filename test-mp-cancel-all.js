require('dotenv').config({ path: '.env.local' });

async function cancelActive() {
    const token = process.env.MP_ACCESS_TOKEN;
    
    try {
        const res = await fetch('https://api.mercadopago.com/v1/orders/search?status=created', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (!data.elements || data.elements.length === 0) {
            console.log('No active orders found.', JSON.stringify(data, null, 2));
            return;
        }
        
        console.log('Orders:', data.elements.map(o => o.id));

        for (const order of data.elements) {
            const res2 = await fetch(`https://api.mercadopago.com/v1/orders/${order.id}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            console.log('Canceled', order.id, res2.status);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

cancelActive();
