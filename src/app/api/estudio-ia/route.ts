import { NextResponse } from 'next/server';
import Replicate from 'replicate';

// Inicializamos Replicate con la llave del env
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { imageBase64, prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Falta el prompt' }, { status: 400 });
    }

    console.log("Iniciando generación de Estudio IA...");
    console.log("Prompt:", prompt);
    const hasImage = !!imageBase64;
    
    // 1. GENERAR PRESUPUESTO Y PROMPT EN INGLÉS CON DEEPSEEK
    let quote = {
      complexity: "Alta / A Medida",
      estimatedDays: "15 - 20 días hábiles",
      estimatedPrice: 280000
    };
    let finalEnglishPrompt = prompt + ", haute couture, high fashion photography, ultra realistic, 8k, vogue";

    try {
      const deepseekKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
      if (deepseekKey) {
        const aiPrompt = `
          Eres la evaluadora técnica de Elena Atalier. Un cliente quiere hacer el siguiente rediseño/confección sobre un vestido:
          "${prompt}"
          
          Necesito que devuelvas SOLO un JSON válido con esta estructura exacta:
          {
            "complexity": "Media" o "Alta" o "Premium",
            "estimatedDays": "ej: 10 - 15 días hábiles",
            "estimatedPrice": número entero en pesos chilenos (ej: 150000),
            "englishImagePrompt": "Traducción del pedido a inglés descriptivo para IA (ej: 'A woman wearing an emerald green dress'). REGLA DE ORO: Describe SOLO el vestido, color y tela. PROHIBIDO usar adjetivos sobre la modelo (stunning, beautiful, sexy, etc.) o su cuerpo, para evitar activar filtros de contenido sensible."
          }
          Reglas de precio: Un arreglo simple (bastas) es ~15000. Un rediseño medio (mangas) es ~80000. Un vestido desde cero o alta costura es ~350000 a 800000.
          Responde EXCLUSIVAMENTE con el JSON, sin comillas invertidas ni markdown.
        `;

        const dsRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekKey}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: aiPrompt }],
            temperature: 0.1
          })
        });

        if (dsRes.ok) {
          const data = await dsRes.json();
          const textResponse = data.choices?.[0]?.message?.content;
          if (textResponse) {
            const cleanText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedQuote = JSON.parse(cleanText);
            quote = {
              complexity: parsedQuote.complexity || quote.complexity,
              estimatedDays: parsedQuote.estimatedDays || quote.estimatedDays,
              estimatedPrice: parsedQuote.estimatedPrice || quote.estimatedPrice
            };
            if (parsedQuote.englishImagePrompt) {
              finalEnglishPrompt = parsedQuote.englishImagePrompt + ", haute couture, high fashion photography, ultra realistic, 8k, vogue, studio lighting";
            }
          }
        }
      }
    } catch (aiError) {
      console.error("Error al calcular presupuesto con IA:", aiError);
    }

    // 2. GENERAR IMAGEN CON REPLICATE (Stable Diffusion XL)
    let imageUrl = null;
    
    try {
      const replicateInput: any = {
        prompt: finalEnglishPrompt,
        negative_prompt: "deforme, feo, mala calidad, caricatura, ilustración, texto, change of person, different face, bad anatomy",
        num_inference_steps: 30,
        guidance_scale: 7.5,
      };

      // Si la clienta subió una foto, la usamos como base (Image-to-Image)
      if (hasImage) {
        replicateInput.image = imageBase64;
        replicateInput.prompt_strength = 0.95; // Aumentado a 0.95 para forzar el cambio de color (sobrescribe la mayoría de los píxeles originales)
      }

      // Llamada al motor de Stable Diffusion XL en Replicate
      const output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        { input: replicateInput }
      );

      // Replicate devuelve un array de URLs o FileStreams
      if (Array.isArray(output) && output.length > 0) {
        const result = output[0];
        if (typeof result === 'string') {
          imageUrl = result;
        } else if (result && typeof result.url === 'function') {
          imageUrl = result.url().toString();
        } else {
          imageUrl = String(result);
        }
      }
    } catch (replicateError) {
      console.error("Error en Replicate:", replicateError);
      return NextResponse.json({ error: 'Falla al generar la imagen con IA' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl, 
      quote 
    });

  } catch (error: any) {
    console.error("Error en Estudio IA:", error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
