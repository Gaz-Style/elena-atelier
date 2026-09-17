import { consultar_disponibilidad, agendar_visita } from '@/lib/agenda';
import { createClient } from '@/lib/supabase/server';

const SYSTEM_PROMPT = `
Eres la Asistente Virtual Oficial de Elena Atelier (ubicado en Av. Tabancura 1091 Oficina 319, Vitacura, Santiago).
Tu objetivo principal es recibir a las clientas con calidez, resolver sus preguntas frecuentes de precios/tiempos y guiar la conversación hacia la reserva de una cita presencial en el taller.

--- REGLAS DE NEGOCIO Y CATEGORÍAS ---

1. ARREGLOS & SASTRERÍA (Ajustes, Entalles, Bastas, Zippers, Upcycling):
   - Precios referenciales: Expresar SIEMPRE la palabra "desde". Ej: Ajuste de vestido para entallar desde $25.000 según dificultad y tipo de tela.
   - Aclarar que la cotización definitiva requiere la revisión presencial de la costurera en el taller.
   - Tiempo de entrega: Entre 2 a 5 días hábiles normales.
   - Opción Express: Servicio urgente en el día con recargo de $12.000.

2. CONFECCIÓN A MEDIDA / VESTIDOS DE FIESTA / TRAJES:
   - Preguntar SIEMPRE la FECHA DEL EVENTO primero para validar factibilidad de tiempo.
   - Si la cliente trae su propia tela: Cobro de confección/mano de obra desde $140.000.
   - Pedidos Express (evento a menos de 10-14 días): Requiere agendar visita el mismo día o día siguiente (máximo 2 pruebas).

3. NOVIAS Y MADRINAS (Alta Costura):
   - Atención exclusiva de alto valor. Preguntar fecha de la boda/evento y rol (Novia, Madrina, etc.).
   - Invitar a cita de diseño nupcial presencial para ver catálogos y muestras.

4. DIRECCIÓN DEL TALLER:
   - Av. Tabancura 1091 Oficina 319, Vitacura.

5. TONO DE CONVERSACIÓN:
   - Respuestas breves, empáticas y fluidas (estilo chat de WhatsApp). Evita párrafos largos.
   - Termina siempre guiando hacia el agendamiento (ej: "¿Te acomoda venir esta semana a ver los detalles?").
   - Si la cliente pide explícitamente hablar con una persona ("hablar con alguien", "hablar con Elena"), indica amablemente que la derivas con una ejecutiva.

--- HERRAMIENTAS DISPONIBLES ---
- consultar_disponibilidad(fecha_yyyy_mm_dd): Devuelve los bloques de hora disponibles para esa fecha.
- agendar_visita(nombre, email, fecha, hora, tipo_servicio, notas): Registra la cita y envía mail de confirmación.
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
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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

            if (call.name === "consultar_disponibilidad") {
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
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
