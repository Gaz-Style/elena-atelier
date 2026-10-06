require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testTaskLocally() {
    console.log("Iniciando prueba local de la descarga de imagen...");
    
    // Obtener las credenciales
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const metaToken = process.env.WHATSAPP_API_TOKEN;
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (!supabaseUrl || !supabaseKey || !metaToken || !geminiKey) {
        console.error("Faltan credenciales en .env.local");
        return;
    }
    
    console.log("Token de Meta actual (primeros 15 chars):", metaToken.substring(0, 15));
    
    // Vamos a buscar la última tarea de imagen
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: tasks } = await supabase
        .from('ai_agent_tasks')
        .select('*')
        .eq('agent_role', 'whatsapp_closer')
        .eq('payload->>message_type', 'image')
        .order('created_at', { ascending: false })
        .limit(1);
        
    if (!tasks || tasks.length === 0) {
        console.log("No se encontraron tareas de imagen.");
        return;
    }
    
    const task = tasks[0];
    console.log("Probando con la tarea:", task.id, "Media URL:", task.payload.media_url);
    
    const mediaUrl = task.payload.media_url;
    
    if (!mediaUrl) {
        console.log("La tarea no tiene media_url");
        return;
    }
    
    try {
        console.log("1. Contactando a Meta API para obtener URL temporal...");
        const mediaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaUrl}`, {
            headers: { 'Authorization': `Bearer ${metaToken}` }
        });
        
        const mediaData = await mediaRes.json();
        console.log("Respuesta de Meta (mediaData):", JSON.stringify(mediaData));
        
        if (mediaData.error) {
            console.error("META API ERROR RECHAZÓ EL TOKEN.");
            return;
        }
        
        if (mediaData.url) {
            console.log("2. URL temporal obtenida. Descargando bytes...");
            const imageRes = await fetch(mediaData.url, { headers: { 'Authorization': `Bearer ${metaToken}` }});
            
            if (imageRes.ok) {
                console.log("¡Bytes descargados exitosamente!");
                const arrayBuffer = await imageRes.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64Image = buffer.toString('base64');
                const mimeType = mediaData.mime_type || 'image/jpeg';
                
                console.log("3. Enviando imagen a Gemini Vision...");
                const payload = {
                    contents: [{ role: 'user', parts: [{ text: "Actúa como experta modista. Describe brevemente qué prenda es y qué tipo de arreglo o confección parece necesitar según la foto (máximo 2 líneas)." }, { inlineData: { mimeType, data: base64Image } }] }],
                    generationConfig: { maxOutputTokens: 150 }
                };
                
                const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                
                if (geminiRes.ok) {
                    const geminiData = await geminiRes.json();
                    const analysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || null;
                    console.log("GEMINI VISION RESPONDIÓ CON ÉXITO:", analysis);
                } else {
                    console.error("Error en Gemini Vision:", await geminiRes.text());
                }
            } else {
                console.error("Error al descargar los bytes:", await imageRes.text());
            }
        }
    } catch (e) {
        console.error("EXCEPCIÓN EN EL CÓDIGO:", e);
    }
}

testTaskLocally();
