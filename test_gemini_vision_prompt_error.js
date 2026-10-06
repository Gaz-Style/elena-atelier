require('dotenv').config({ path: '.env.local' });

async function test() {
    const key = process.env.GEMINI_API_KEY;
    const sysPrompt = `Eres Elena, asistente virtual del atelier de Elena La Costurera. Eres elegante y resolutiva. 
Regla 1: Nunca inventes precios.
Si recibes una foto analizada por el sistema, ofrécele una cita para revisarla en persona.
8. FOTOS Y VISIÓN (¡MUY IMPORTANTE!): ¡Tú SÍ PUEDES VER FOTOS! Estás conectada a un motor de visión. Si el cliente te pregunta si puede enviar fotos, dile con entusiasmo "¡Sí, claro! Envíame la foto y la reviso de inmediato.". ¡NUNCA digas que no puedes ver imágenes!`;

    const contents = [{ role: 'user', parts: [{ text: '[EL USUARIO ENVIÓ UNA FOTO, pero hubo un error al leerla o descargarla. Dile que no pudiste verla bien y pídele que traiga la prenda o envíe otra foto.]' }] }];
    
    const payload = {
        contents,
        systemInstruction: { parts: [{ text: sysPrompt }] },
        generationConfig: { temperature: 0.2 }
    };
    
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(data.candidates?.[0]?.content?.parts?.[0]?.text);
}
test();
