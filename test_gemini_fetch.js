const fs = require('fs');

async function testGemini() {
    require('dotenv').config({ path: '.env.local' });
    const geminiKey = process.env.GEMINI_API_KEY;
    
    // Simulate conversation history exactly as in route.ts
    const conversationHistory = [
        { role: 'user', content: 'Hola! Mira tengo este arreglo te puedo enviar una foto?' },
        { role: 'assistant', content: '¡Sí, claro! Envíame la foto y la reviso de inmediato.' },
        { role: 'user', content: '[El usuario envió una imagen]' },
        { role: 'assistant', content: 'Hola, Julieta. Recibí tu foto, pero no logro distinguir bien el arreglo. ¿Me cuentas qué prenda es y qué necesitas hacerle?' },
        { role: 'user', content: 'Es una chaqueta de pluma' },
        { role: 'assistant', content: '¡Perfecto! Para una chaqueta de pluma, el cambio de cierre sellado tiene un valor desde $22.000. ¿Es eso lo que necesitas, o es otro tipo de arreglo?' },
        { role: 'user', content: 'Hola' }
    ];
    
    const geminiContents = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    const geminiTools = [{
        functionDeclarations: [
            {
                name: "solicitar_asistencia_humana",
                description: "Utilizar INMEDIATAMENTE si el cliente tiene un reclamo, pide hablar con un humano o pide que le contactemos.",
                parameters: { type: "OBJECT", properties: { motivo: { type: "STRING" }, urgencia: { type: "STRING" } }, required: ["motivo", "urgencia"] }
            },
            {
                name: "programar_seguimiento_automatico",
                description: "Utilizar cuando el cliente te pida que le hables o contactes más tarde.",
                parameters: { type: "OBJECT", properties: { minutos: { type: "NUMBER" }, motivo: { type: "STRING" } }, required: ["minutos", "motivo"] }
            },
            {
                name: "agendar_visita",
                description: "Registra una cita presencial.",
                parameters: { type: "OBJECT", properties: { nombre: { type: "STRING" }, apellido: { type: "STRING" }, correo: { type: "STRING" }, fecha: { type: "STRING", description: "YYYY-MM-DD" }, hora: { type: "STRING", description: "HH:MM" }, tipo_servicio: { type: "STRING" } }, required: ["nombre", "apellido", "correo", "fecha", "hora", "tipo_servicio"] }
            },
            {
                name: "consultar_disponibilidad",
                description: "Consulta horarios disponibles (YYYY-MM-DD)",
                parameters: { type: "OBJECT", properties: { fecha: { type: "STRING" } }, required: ["fecha"] }
            }
        ]
    }];

    const systemPrompt = "Eres un asistente de moda y alta costura.";

    let payload = {
        contents: geminiContents,
        tools: geminiTools,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { temperature: 0.2 }
    };

    try {
        let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });

        if (!res.ok) {
            console.error("FAILED HTTP", res.status, await res.text());
            return;
        }

        let data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("CATCH ERROR", e);
    }
}
testGemini();
