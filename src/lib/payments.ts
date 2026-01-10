export const MERCADO_PAGO_CONFIG = {
    publicKey: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
    accessToken: process.env.MP_ACCESS_TOKEN,
};

export async function createPaymentPreference(items: any[]) {
    // Logic to call Mercado Pago API and create a preference
    console.log('Creating MP preference for items:', items);
    return { id: 'pref_simulated_123', init_point: 'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=123' };
}
