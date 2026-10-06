const fs = require('fs');
async function testGemini() {
    require('dotenv').config({ path: '.env.local' });
    const geminiKey = process.env.GEMINI_API_KEY;
    const conversationHistory = [
        { role: 'user', content: 'Hola!' },
        { role: 'user', content: 'Hay alguien?' }
    ];
    
    const geminiContents = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));
    
    let payload = {
        contents: geminiContents,
        generationConfig: { temperature: 0.2 }
    };
    try {
        let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (!res.ok) {
            console.error('FAILED HTTP', res.status, await res.text());
            return;
        }
        console.log('SUCCESS');
    } catch (e) {
        console.error(e);
    }
}
testGemini();
