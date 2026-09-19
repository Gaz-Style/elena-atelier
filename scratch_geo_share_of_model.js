import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import OpenAI from 'openai';

const DEEPSEEK_API_KEY = process.env.OPENAI_API_KEY;

const PROMPTS = [
    "¿Dónde puedo llevar a arreglar un vestido de fiesta o prenda delicada en Vitacura, Lo Barnechea o Tabancura?",
    "Busco una costurera o taller de composturas de alta calidad en Lo Barnechea y La Dehesa, ¿cuáles me recomiendas?",
    "¿Cuál es el mejor taller para entallar un traje de novias o vestidos de alta costura cerca de Lo Barnechea, Las Condes y Vitacura?",
    "Recomiéndame talleres de arreglos de ropa y upcycling en Santiago sector oriente (Lo Barnechea, Vitacura, Las Condes)."
];

async function testDeepSeek(prompt) {
    if (!DEEPSEEK_API_KEY) return { error: "OPENAI_API_KEY no configurada" };
    try {
        const openai = new OpenAI({ 
            baseURL: 'https://api.deepseek.com',
            apiKey: DEEPSEEK_API_KEY 
        });
        const response = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3
        });
        const content = response.choices[0].message.content || '';
        const mentionsElena = /elena\s*(la\s*costurera|atelier)?/i.test(content) || /elenalacosturera/i.test(content) || /tabancura\s*1091/i.test(content);
        return { content, mentionsElena };
    } catch (e) {
        return { error: e.message };
    }
}

async function main() {
    console.log("=================================================");
    console.log("🔍 AUDITORÍA DE CUOTA DE MODELO (GEO - SHARE OF MODEL)");
    console.log(" Motor: DeepSeek AI (RAG Generativo)");
    console.log("=================================================\n");

    let totalPrompts = PROMPTS.length;
    let deepseekScore = 0;

    for (let i = 0; i < PROMPTS.length; i++) {
        const p = PROMPTS[i];
        console.log(`\n📌 Query [${i+1}/${totalPrompts}]: "${p}"`);
        
        const res = await testDeepSeek(p);
        if (res.error) {
            console.log(`   🤖 DeepSeek: ⚠️ ${res.error}`);
        } else {
            const status = res.mentionsElena ? '✅ RECOMIENDA A ELENA ATELIER' : '❌ No menciona explícitamente';
            console.log(`   🤖 DeepSeek AI: ${status}`);
            if (res.mentionsElena) deepseekScore++;
            console.log(`   💬 Respuesta resumida:\n   "${res.content.slice(0, 220).replace(/\n/g, ' ')}..."`);
        }
    }

    console.log("\n=================================================");
    console.log("📊 RESULTADOS DE SHARE OF MODEL (GEO)");
    console.log(`🤖 Tasa de Recomendación en IA: ${((deepseekScore / totalPrompts) * 100).toFixed(1)}% (${deepseekScore}/${totalPrompts})`);
    console.log("=================================================\n");
}

main();
