require('dotenv').config({ path: '.env.local' });

async function cycleMode() {
    const token = process.env.MP_ACCESS_TOKEN;
    const terminalId = "NEWLAND_N950__N950NCC804183989";
    
    // Switch to STANDALONE
    let payload = { terminals: [{ id: terminalId, operating_mode: "STANDALONE" }] };
    console.log("Switching to STANDALONE...");
    await fetch(`https://api.mercadopago.com/terminals/v1/setup`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    // Switch to PDV
    payload = { terminals: [{ id: terminalId, operating_mode: "PDV" }] };
    console.log("Switching to PDV...");
    await fetch(`https://api.mercadopago.com/terminals/v1/setup`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    console.log("Cycle complete! Terminal should be reset.");
}

cycleMode();
