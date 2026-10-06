require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function testImage() {
    const mediaUrl = '1137998841897265'; // From the db tasks log
    const metaToken = process.env.WHATSAPP_API_TOKEN;
    const geminiKey = process.env.GEMINI_API_KEY;

    try {
        console.log("Fetching media data for ID:", mediaUrl);
        const mediaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaUrl}`, { headers: { 'Authorization': `Bearer ${metaToken}` }});
        const mediaData = await mediaRes.json();
        console.log("Media Data:", mediaData);

        if (mediaData.url) {
            console.log("Fetching binary from:", mediaData.url);
            const imageRes = await fetch(mediaData.url, { headers: { 'Authorization': `Bearer ${metaToken}` }});
            console.log("Image Fetch Status:", imageRes.status);
            
            if (imageRes.ok) {
                const arrayBuffer = await imageRes.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64Image = buffer.toString('base64');
                const mimeType = mediaData.mime_type || 'image/jpeg';
                
                console.log(`Image downloaded. Size: ${buffer.length} bytes, Mime: ${mimeType}`);

                const payload = {
                    contents: [{ parts: [{ text: "Actúa como experta modista. Describe brevemente qué prenda es y qué tipo de arreglo o confección parece necesitar según la foto (máximo 2 líneas)." }, { inlineData: { mimeType, data: base64Image } }] }],
                    generationConfig: { maxOutputTokens: 150 }
                };
                
                console.log("Calling Gemini Vision...");
                const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                
                if (geminiRes.ok) {
                    const geminiData = await geminiRes.json();
                    console.log("Gemini Output:", geminiData.candidates?.[0]?.content?.parts?.[0]?.text);
                } else {
                    console.error("Gemini Error:", await geminiRes.text());
                }
            } else {
                console.error("Failed to download image binary. Response:", await imageRes.text());
            }
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

testImage();
