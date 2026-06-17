require('dotenv').config({ path: '.env.local' });

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function cycleMode() {
    const token = process.env.MP_ACCESS_TOKEN;
    const terminalId = "NEWLAND_N950__N950NCC804183989";
    
    // Switch to STANDALONE
    let payload = { terminals: [{ id: terminalId, operating_mode: "STANDALONE" }] };
    console.log("Switching to STANDALONE...");
    let res = await fetch(`https://api.mercadopago.com/terminals/v1/setup`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    console.log("STANDALONE response:", res.status);
    
    console.log("Waiting 10 seconds to flush queue...");
    await wait(10000);
    
    // Switch to PDV
    payload = { terminals: [{ id: terminalId, operating_mode: "PDV" }] };
    console.log("Switching to PDV...");
    res = await fetch(`https://api.mercadopago.com/terminals/v1/setup`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    console.log("PDV response:", res.status);
    
    console.log("Cycle complete!");
}

cycleMode();
