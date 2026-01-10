export const BUK_CONFIG = {
    token: process.env.BUK_API_TOKEN,
    baseUrl: 'https://api.buk.cl/api/v1',
};

export async function syncEmployees() {
    // Logic to fetch employee data from Buk and sync with Supabase
    console.log('Syncing employees from Buk...');
    return [{ id: 'buk_001', name: 'Elena Sastre', role: 'Head Tailor' }];
}
