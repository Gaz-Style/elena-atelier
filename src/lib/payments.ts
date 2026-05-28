'use server';

const MERCADO_PAGO_CONFIG = {
    publicKey: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
    accessToken: process.env.MP_ACCESS_TOKEN,
};

export async function createPaymentPreference(items: any[]) {
    const mpAccessToken = process.env.MP_ACCESS_TOKEN || '';
    if (!mpAccessToken) {
        console.error('Missing MP_ACCESS_TOKEN in env');
        return { id: 'simulated', init_point: 'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=simulated' };
    }
    
    try {
        const formattedItems = items.map(item => ({
            title: item.name,
            quantity: 1,
            unit_price: Math.round(item.price),
            currency_id: 'CLP'
        }));

        console.log('Creating Mercado Pago production preference for items:', formattedItems);

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${mpAccessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: formattedItems,
                back_urls: {
                    success: 'https://elenalacosturera.com/pago-exitoso',
                    failure: 'https://elenalacosturera.com/pago-fallido',
                    pending: 'https://elenalacosturera.com/pago-pendiente'
                },
                auto_return: 'approved'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return { id: data.id, init_point: data.init_point };
        } else {
            const errText = await response.text();
            console.error('Failed to create Mercado Pago preference:', errText);
            return { id: 'error', init_point: 'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=error' };
        }
    } catch (err) {
        console.error('Error in createPaymentPreference:', err);
        return { id: 'error', init_point: 'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=error' };
    }
}
