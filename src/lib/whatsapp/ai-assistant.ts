import { consultar_disponibilidad, agendar_visita } from '@/lib/agenda';
import { createClient } from '@/lib/supabase/server';

const SYSTEM_PROMPT = `
Eres Elena, la asistente virtual oficial de "Elena Atelier" (Av. Tabancura 1091 Oficina 319, Vitacura, Santiago).

--- PERSONALIDAD Y TONO (ESTRICTO) ---
- Eres el primer punto de contacto de un Atelier de Alta Costura exclusivo. Tu trato debe ser EXTREMADAMENTE ELEGANTE, educado y refinado.
- Nuestro público incluye mujeres de la política, doctoras, abogadas y profesionales de alto nivel. NUNCA debes sonar deslenguada, seca, ni confianzuda.
- Reemplaza frases directas como "¿Qué hora te sirve?" o "¿Qué día te acomoda?" por fórmulas elegantes y sutiles como: "Ideal que agendemos una cita y lo revisemos en detalle. Podríamos agendar ahora, ¿te parece?".
- Usa lenguaje de género NEUTRO al iniciar, ya que también atendemos sastrería masculina y corporativa.
- Tus respuestas deben ser breves, fluidas y concisas, pero siempre manteniendo la clase y el tacto.

--- SALUDO INICIAL Y CONTEXTO ---
- Tu saludo base para mensajes nuevos debe ser similar a: "¡Hola! Bienvenid@. Soy Elena ✨. ¿En qué te puedo ayudar?"
- ATENCIÓN: Si el cliente inicia el chat con un mensaje precargado desde nuestra web, DEBES captar ese contexto inmediatamente y adaptar tu respuesta para abordarlo con elegancia, sin pedir que repitan la información.

--- REGLAS DE NEGOCIO Y PRECIOS ---
- IMPORTANTE SOBRE PRECIOS: Entrega precios referenciales SOLO si el cliente lo solicita explícitamente.
- **NO TIENES PRECIOS MEMORIZADOS.** Si preguntan por el valor de CUALQUIER servicio, DEBES usar la herramienta consultar_precio(servicio).
- Al entregar el precio, hazlo con mucha delicadeza. Ejemplo: "Como es un diseño a medida, el valor final depende de la tela y el modelo. A modo de referencia, nuestros vestidos parten desde los [Precio]. Lo ideal es verte en el taller para darte una cotización exacta."
- Pregunta de forma sutil la FECHA DEL EVENTO o plazo deseado para validar factibilidad de tiempo.

--- AGENDAMIENTO (REGLA DE ORO) ---
- **NUNCA** envíes una lista larga de todos los horarios disponibles (ej: 09:00, 10:00, 11:00...). Eso es poco elegante.
- Cuando consultes disponibilidad, **ofrece solo UNA opción en la mañana y UNA en la tarde** (ej: "Para esta semana, tengo disponibilidad el jueves a las 11:00 am o en la tarde a las 16:00 hrs. ¿Alguna de estas opciones te acomoda?").
- Si el cliente propone un horario específico, revisa si está disponible y confírmalo.
- Tras resolver las dudas básicas, debes guiar suavemente al cliente hacia el agendamiento presencial.
- Si piden hablar explícitamente con un humano, indica con amabilidad que derivarás la conversación a una asesora personal.

--- HERRAMIENTAS DISPONIBLES ---
- consultar_precio(servicio): Busca el precio en el catálogo.
- consultar_disponibilidad(fecha_yyyy_mm_dd): Devuelve los bloques de hora disponibles para esa fecha (RECUERDA FILTRAR Y OFRECER SOLO 2 OPCIONES AL CLIENTE).
- agendar_visita(nombre, email, fecha, hora, tipo_servicio, notas): Registra la cita y envía el correo de confirmación.
`;

export async function processWhatsAppAIMessage(chatId: string, userMessage: string, phoneNumber: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY no configurada.");
        return null;
    }

    const supabase = await createClient();

    // 1. Obtener historial reciente del chat para mantener contexto
    const { data: messages } = await supabase
        .from('crm_whatsapp_messages')
        .select('sender_type, content')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .limit(10);

    const contents = (messages || []).map(m => ({
        role: m.sender_type === 'customer' ? 'user' : 'model',
        parts: [{ text: m.content || '' }]
    }));

    // Si el último mensaje del usuario no está en contents, agregarlo
    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });
    }

    // Definición de Herramientas (Function Calling para Gemini)
    const tools = [{
        functionDeclarations: [
            {
                name: "consultar_precio",
                description: "Busca el precio de un servicio o prenda en la base de datos del Atelier.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        servicio: { type: "STRING", description: "Nombre o palabra clave del servicio (ej: vestido, basta, chaqueta, novia)" }
                    },
                    required: ["servicio"]
                }
            },
            {
                name: "consultar_disponibilidad",
                description: "Consulta los horarios de atención disponibles para una fecha específica (formato YYYY-MM-DD).",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        fecha: { type: "STRING", description: "Fecha a consultar en formato YYYY-MM-DD" }
                    },
                    required: ["fecha"]
                }
            },
            {
                name: "agendar_visita",
                description: "Registra una cita o visita presencial en el taller y envía el correo de confirmación a la cliente.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        nombre: { type: "STRING", description: "Nombre y apellido del cliente" },
                        email: { type: "STRING", description: "Correo electrónico del cliente" },
                        fecha: { type: "STRING", description: "Fecha de la cita (YYYY-MM-DD)" },
                        hora: { type: "STRING", description: "Hora de la cita (HH:MM)" },
                        tipo_servicio: { type: "STRING", description: "Arreglos, Novias, Graduación, Confección a medida" },
                        notas: { type: "STRING", description: "Detalles adicionales (ej: 2 vestidos, urgente)" }
                    },
                    required: ["nombre", "email", "fecha", "hora", "tipo_servicio"]
                }
            }
        ]
    }];

    try {
        let response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: contents,
                    tools: tools,
                    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error en API de Gemini:", errorText);
            return null;
        }

        let resData = await response.json();
        let candidate = resData.candidates?.[0];
        let part = candidate?.content?.parts?.[0];

        // Manejo de Function Calling (Llamadas a funciones del sistema)
        if (part?.functionCall) {
            const call = part.functionCall;
            let functionResult: any = null;

            if (call.name === "consultar_precio") {
                const { servicio } = call.args;
                // Buscar en la tabla catalog
                const { data: catalogData } = await supabase
                    .from('catalog')
                    .select('name, price, category')
                    .ilike('name', `%${servicio}%`)
                    .eq('active', true)
                    .limit(5);

                if (!catalogData || catalogData.length === 0) {
                    functionResult = `No se encontraron precios exactos para "${servicio}". Indica al cliente que la confección/arreglo debe evaluarse presencialmente.`;
                } else {
                    const results = catalogData.map(item => `- ${item.name}: $${item.price.toLocaleString('es-CL')}`).join('\n');
                    functionResult = `Precios encontrados (usa esto como referencia):\n${results}`;
                }
            } else if (call.name === "consultar_disponibilidad") {
                const fecha = call.args?.fecha;
                functionResult = await consultar_disponibilidad(fecha);
            } else if (call.name === "agendar_visita") {
                const { nombre, email, fecha, hora, tipo_servicio, notas } = call.args;
                const partesNombre = (nombre || '').trim().split(' ');
                const primerNombre = partesNombre[0] || 'Cliente';
                const apellido = partesNombre.slice(1).join(' ') || 'Atelier';
                const fechaHoraIso = `${fecha}T${hora}:00`;

                functionResult = await agendar_visita(
                    primerNombre,
                    apellido,
                    phoneNumber,
                    email,
                    fechaHoraIso,
                    `whatsapp_${tipo_servicio || 'cita'}`
                );
            }

            // Segunda llamada a Gemini enviando la respuesta de la función realizada
            contents.push(candidate.content);
            contents.push({
                role: 'function' as any,
                parts: [{
                    functionResponse: {
                        name: call.name,
                        response: { result: functionResult }
                    }
                } as any]
            });

            response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: contents,
                        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
                    })
                }
            );

            if (response.ok) {
                resData = await response.json();
                candidate = resData.candidates?.[0];
                part = candidate?.content?.parts?.[0];
            }
        }

        return part?.text || null;
    } catch (err) {
        console.error("Error procesando IA para WhatsApp:", err);
        return null;
    }
}
