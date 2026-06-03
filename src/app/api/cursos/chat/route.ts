import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const COURSES_INFO = {
    iniciacion: { name: 'Iniciación a la Costura', price: 52500, originalPrice: 70000, level: 'Principiante', duration: '2 sesiones de 2 horas', includes: 'Materiales incluidos' },
    confeccion: { name: 'Costura & Confección', price: 75000, originalPrice: 90000, level: 'Intermedio', duration: '3 sesiones de 2 horas', includes: 'Materiales incluidos' },
    arreglos: { name: 'Arreglos & Sastrería', price: 65000, originalPrice: 80000, level: 'Intermedio', duration: '2 sesiones de 2 horas', includes: 'Materiales incluidos' },
    patronaje: { name: 'Patronaje & Diseño', price: 120000, originalPrice: null, level: 'Avanzado', duration: '4 sesiones de 2 horas', includes: 'Materiales incluidos' },
    pack: { name: 'Pack Formación Completa', price: 699999, originalPrice: 1146000, level: 'Todos los niveles', duration: '12 meses de acceso', includes: 'Todos los cursos + materiales' },
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { messages, leadId, leadName, courseId, courseName, currentLevel } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Mensajes inválidos.' }, { status: 400 });
        }

        const courseInfo = COURSES_INFO[courseId as keyof typeof COURSES_INFO] || { name: courseName, price: 'a consultar' };
        const formatCLP = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

        const systemPrompt = `Eres Elena IA, la asistente virtual de Elena Atelier, un exclusivo atelier de costura y alta costura en Vitacura, Santiago.
Estás hablando con ${leadName}, quien está interesada en el "${courseInfo.name}".
Su nivel de experiencia actual: ${currentLevel || 'no especificado'}.

INFORMACIÓN DEL CURSO QUE LE INTERESA:
- Nombre: ${courseInfo.name}
- Nivel: ${courseInfo.level}
- Duración: ${courseInfo.duration}
- Precio: ${typeof courseInfo.price === 'number' ? formatCLP(courseInfo.price) : courseInfo.price}${courseInfo.originalPrice ? ` (antes ${formatCLP(courseInfo.originalPrice)})` : ''}
- Incluye: ${courseInfo.includes}
- Horarios: Lunes a Sábado · AM (10:30-12:30) · PM (15:00-17:00) · Intensivos disponibles
- Lugar: Tabancura 1091, Of. 319, Vitacura

TU OBJETIVO:
1. Responde sus dudas sobre el curso con calidez y precisión
2. Genera entusiasmo genuino, no presión agresiva
3. Si muestra intención de inscribirse → guíala con un CTA claro ("te puedo reservar un lugar ahora mismo")
4. Si tiene una duda muy específica que no puedes resolver, o pide hablar con una persona → dile que la conectarás con Elena directamente

ESTILO: Amable, cálida, experta, sofisticada. Usa "tú" informal. Respuestas concisas (máx 3 párrafos). No uses asteriscos ni markdown.

NUNCA inventes precios que no están arriba. NUNCA prometas descuentos adicionales sin confirmar.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            max_tokens: 400,
            temperature: 0.7,
        });

        const reply = completion.choices[0].message.content || '';

        // Detect if AI is handing off to human
        const isHandoff = /elena directamente|conectar.*elena|hablar.*persona|asesora humana|transferir/i.test(reply);

        // Update chat transcript in Supabase if we have a leadId
        if (leadId) {
            const updatedTranscript = [...messages, { role: 'assistant', content: reply }];
            await supabase
                .from('course_leads')
                .update({
                    chat_transcript: updatedTranscript,
                    status: isHandoff ? 'handoff' : 'chatting',
                    updated_at: new Date().toISOString()
                })
                .eq('id', leadId);
        }

        return NextResponse.json({ reply, isHandoff });
    } catch (err) {
        console.error('Chat API error:', err);
        return NextResponse.json({ error: 'Error al conectar con el asistente. Por favor intenta de nuevo.' }, { status: 500 });
    }
}
