require('dotenv').config({ path: '.env.local' });

async function checkUser() {
    const token = process.env.MP_ACCESS_TOKEN;
    try {
        const response = await fetch('https://api.mercadopago.com/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log("User Site:", data.site_id);
        console.log("Full User Data:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

checkUser();
