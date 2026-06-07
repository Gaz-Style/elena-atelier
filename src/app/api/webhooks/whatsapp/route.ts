import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { consultar_disponibilidad, agendar_visita } from '@/lib/agenda';

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'elena_atelier_secret';

// Handle webhook verification (GET request from Meta)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
        console.log('WhatsApp Webhook verified!');
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse('Forbidden', { status: 403 });
}

// Handle incoming messages (POST request from Meta)
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Check if this is a WhatsApp API message event
        if (body.object !== 'whatsapp_business_account') {
            return new NextResponse('Not a WhatsApp event', { status: 404 });
        }

        const supabase = await createClient();

        for (const entry of body.entry) {
            for (const change of entry.changes) {
                const value = change.value;
                if (value && value.messages && value.messages.length > 0) {
                    const message = value.messages[0];
                    const contact = value.contacts?.[0];
                    const phoneNumber = message.from; // Sender's phone number
                    const messageId = message.id;

                    // 1. Find or create the chat session
                    let { data: chatData, error: chatError } = await supabase
                        .from('crm_whatsapp_chats')
                        .select('id, session_status')
                        .eq('phone_number', phoneNumber)
                        .single();

                    if (!chatData) {
                        // Create a new chat session
                        const { data: newChat, error: newChatError } = await supabase
                            .from('crm_whatsapp_chats')
                            .insert([{ phone_number: phoneNumber, session_status: 'bot' }])
                            .select('id, session_status')
                            .single();

                        if (newChatError) {
                            console.error('Error creating chat:', newChatError);
                            continue;
                        }
                        chatData = newChat;
                    }

                    // 2. Parse message content
                    let content = '';
                    let messageType = 'text';
                    let mediaUrl = null;

                    if (message.type === 'text') {
                        content = message.text.body;
                    } else if (message.type === 'image') {
                        messageType = 'image';
                        mediaUrl = message.image.id; // Just storing media ID for now
                        content = message.image.caption || '';
                    } else if (message.type === 'audio') {
                        messageType = 'audio';
                        mediaUrl = message.audio.id;
                    }

                    // 3. Save user message to database
                    const { error: msgError } = await supabase
                        .from('crm_whatsapp_messages')
                        .insert([{
                            chat_id: chatData.id,
                            sender_type: 'customer',
                            message_type: messageType,
                            content: content,
                            media_url: mediaUrl
                        }]);

                    if (msgError) {
                        console.error('Error saving message:', msgError);
                        continue;
                    }

                    // 4. Trigger AI if session is 'bot' and content is text
                    if (chatData.session_status === 'bot' && content) {
                        try {
                            const { OpenAI } = await import('openai');
                            const openai = new OpenAI({ 
                                apiKey: process.env.OPENAI_API_KEY,
                                baseURL: 'https://api.deepseek.com/v1'
                            });
                            
                            // Get recent conversation context
                            const { data: recentMsgs } = await supabase
                                .from('crm_whatsapp_messages')
                                .select('*')
                                .eq('chat_id', chatData.id)
                                .order('created_at', { ascending: true })
                                .limit(10);
                                
                            const conversation = recentMsgs?.map(msg => ({
                                role: msg.sender_type === 'customer' ? 'user' : 'assistant',
                                content: msg.content || ''
                            })) || [];
                            
                            // 4.1. Fetch dynamic context from Supabase (RAG)
                            const { data: catalogData } = await supabase
                                .from('catalog')
                                .select('name, price, category')
                                .eq('active', true)
                                .order('price', { ascending: true });

                            let catalogText = 'Precios base de referencia del Catálogo Oficial:\n';
                            if (catalogData && catalogData.length > 0) {
                                const categories = Array.from(new Set(catalogData.map(c => c.category)));
                                categories.forEach(cat => {
                                    const items = catalogData.filter(c => c.category === cat).slice(0, 3); // Take top 3 cheapest
                                    catalogText += `- ${cat}:\n`;
                                    items.forEach(item => {
                                        catalogText += `  * ${item.name}: desde $${item.price.toLocaleString('es-CL')} CLP.\n`;
                                    });
                                });
                            } else {
                                catalogText += `- Ajustes simples: desde $15.000 CLP.\n- Vestidos a medida: desde $350.000 CLP.\n`;
                            }

                            const { count: activeOrders } = await supabase
                                .from('production_orders')
                                .select('*', { count: 'exact', head: true })
                                .in('status', ['pending', 'in_progress', 'fitting']);

                            let timingText = 'Tiempos de costura estimados actuales en el Atelier:\n';
                            if (activeOrders !== null && activeOrders > 20) {
                                timingText += `- Alta demanda (Taller Ocupado). Vestidos a medida: 5 a 8 semanas.\n`;
                            } else {
                                timingText += `- Capacidad Normal. Vestidos a medida: 3 a 5 semanas.\n`;
                            }
                            timingText += `- Ajustes menores: 3 a 7 días.\n`;
                            
                            const systemPrompt = {
                                role: 'system',
                                content: `Eres Elena, una Inteligencia Artificial que encarna la personalidad del canal de atención de Elena La Costurera, diseñadora de vestuario chilena, sastre y experta en alta costura, confección a medida y upcycling de autor. No eres un robot pretencioso ni usas palabras rebuscadas. Tienes un bagaje real: has trabajado con marcas internacionales de vanguardia como SEVALI y has presentado colecciones en pasarelas de los Fashion Weeks de Chile, Argentina, Nueva York y París.
Tu propósito en el chat es interactuar con el cliente, contestar de forma corta, hacer las preguntas clave y guiar la conversación para que agenden una visita a tu taller. No cuentas tu historia a menos que te lo pregunten directamente.
Tu estrategia comercial inteligente es usar el upcycling para sustituir el concepto de "arreglos de ropa", agrupando tus servicios bajo dos pilares:
Premium Custom Upcycling: Transformación total de prendas, rescate de materiales nobles y creación de piezas de alta costura o diseño único desde ropa antigua.
Upcycling Fit & Repair: El arte de reparar y adaptar la ropa a tu cuerpo para que no muera en el clóset (entalles, bastas, cambios de cierres, visible o invisible mending).
Esto convive perfectamente con tu servicio de Alta Costura Social (confección a medida de vestidos de novia, madrinas, gala) y Sastrería de Autor para profesionales. Tu lema es: "Pierde el miedo, sé tú misma".

Reglas de Oro del Chat:
- Saludo Inicial Extremadamente Natural y Abierto: Si el cliente solo dice "Hola" o saluda sin dar detalles, DEBES incluir siempre tu nombre ("Elena") y hacer una pregunta 100% abierta que sirva tanto para arreglos de ropa como para confección de vestidos de novia desde cero. TU ÚNICA RESPUESTA debe seguir esta estructura exacta: "¡Hola! Aquí Elena. Qué gusto. Cuéntame, ¿en qué te puedo ayudar o qué proyecto tienes en mente?". NO asumas que el cliente trae ropa para arreglar. NO des un menú de opciones. Actúa 100% como una persona real. Si el cliente ya especificó lo que quiere, pasa directo a validar su problema. NUNCA pidas perdón ni reinicies el saludo.
- Cero acotaciones teatrales: NUNCA uses paréntesis, corchetes o asteriscos para describir tu tono de voz, tus acciones o tu estado de ánimo (ej. prohibido usar "(Con tono sereno)"). Escribe solo las palabras que dirías en voz alta.
- Manejo de Emojis: Prohibidos en la primera conversación. El saludo y primer contacto es limpio, respetuoso y profesional. Los emojis se guardan para cuando ya conoces al cliente, vuelve al taller o hay confianza.
- Respuestas Cortas: Máximo 2 o 3 líneas por mensaje. No aburras con textos largos ni hables de desfiles de París o SEVALI a menos que pregunten por tu trayectoria o duden de tu experiencia.
- Preguntas clave de inmediato: Pregunta directamente los detalles lógicos (tipo de tela, si tiene la prenda a mano, etc.) para avanzar rápido.
- Llamado a la acción: Invita a agendar una visita en tu taller. Explica que medir en persona frente al espejo es clave para dar con el calce perfecto.
- Vocabulario prohibido: "remiendo", "resistencia", "modista de barrio vieja", "costura express", "arreglos de ropa barata", "ajuste sastrero de alta calidad".
- Vocabulario permitido: "Elena La Costurera", "Premium Custom Upcycling", "Upcycling Fit & Repair", "bastas", "ajustes de pretina", "cambios de cierre", "ajustar el calce", "novias", "gala", "madrinas" y "calidad".
- Tu meta en el chat es: SALUDAR (simple y corto) -> ESPERAR QUE EL CLIENTE DIGA QUÉ NECESITA -> INVITAR AL TALLER.

CONTEXTO EN TIEMPO REAL DEL ATELIER:
${catalogText}
${timingText}

REGLAS DE ATENCIÓN Y CONTACTO HUMANO:
Si el cliente muestra una intención clara de agendar una cita en el Atelier, dejar prendas para arreglos, o pide expresamente hablar con un humano, despídete amablemente y proporciónale este enlace directo de WhatsApp para que coordine su visita con el equipo: https://wa.me/56934373844`
                            };

                            const tools = [
                                {
                                    type: "function",
                                    function: {
                                        name: "consultar_disponibilidad",
                                        description: "Consulta los bloques horarios disponibles en la agenda para una fecha específica. Úsalo cuando el cliente pregunte por horas libres. Hoy es " + new Date().toLocaleDateString('es-CL', { timeZone: 'America/Santiago' }),
                                        parameters: {
                                            type: "object",
                                            properties: {
                                                fecha: {
                                                    type: "string",
                                                    description: "La fecha a consultar en formato YYYY-MM-DD"
                                                }
                                            },
                                            required: ["fecha"]
                                        }
                                    }
                                },
                                {
                                    type: "function",
                                    function: {
                                        name: "agendar_visita",
                                        description: "Agenda una cita en el taller de Elena. SOLO ejecútalo cuando el cliente haya confirmado la fecha/hora Y haya proporcionado su nombre, apellido, celular y correo.",
                                        parameters: {
                                            type: "object",
                                            properties: {
                                                nombre: { type: "string" },
                                                apellido: { type: "string" },
                                                celular: { type: "string", description: "Debe incluir código de país, ej: +569..." },
                                                correo: { type: "string" },
                                                fecha_hora: { type: "string", description: "Fecha y hora exacta en formato ISO 8601, ej: 2026-06-15T16:00:00-04:00" }
                                            },
                                            required: ["nombre", "apellido", "celular", "correo", "fecha_hora"]
                                        }
                                    }
                                }
                            ];

                            let completion = await openai.chat.completions.create({
                                model: 'deepseek-chat',
                                messages: [systemPrompt, ...conversation] as any,
                                tools: tools as any,
                                tool_choice: "auto",
                            });
                            
                            let botMessage = completion.choices[0].message;

                            if (botMessage.tool_calls) {
                                const toolCall = botMessage.tool_calls[0];
                                const funcName = toolCall.function.name;
                                const args = JSON.parse(toolCall.function.arguments);
                                
                                let toolResult = "";
                                if (funcName === "consultar_disponibilidad") {
                                    toolResult = await consultar_disponibilidad(args.fecha);
                                } else if (funcName === "agendar_visita") {
                                    toolResult = await agendar_visita(args.nombre, args.apellido, args.celular, args.correo, args.fecha_hora);
                                }
                                
                                completion = await openai.chat.completions.create({
                                    model: 'deepseek-chat',
                                    messages: [
                                        systemPrompt, 
                                        ...conversation, 
                                        botMessage, 
                                        { role: "tool", tool_call_id: toolCall.id, name: funcName, content: toolResult }
                                    ] as any,
                                });
                                
                                botMessage = completion.choices[0].message;
                            }
                            
                            const botReply = botMessage.content;
                            
                            if (botReply) {
                                // Save bot reply to DB
                                await supabase.from('crm_whatsapp_messages').insert([{
                                    chat_id: chatData.id,
                                    sender_type: 'bot',
                                    message_type: 'text',
                                    content: botReply
                                }]);
                                
                                // 5. Call WhatsApp Cloud API to send botReply back to the user
                                const token = process.env.WHATSAPP_API_TOKEN;
                                const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
                                
                                if (token && phoneId) {
                                    const fbResponse = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            messaging_product: 'whatsapp',
                                            to: phoneNumber,
                                            type: 'text',
                                            text: { body: botReply }
                                        })
                                    });
                                    
                                    if (!fbResponse.ok) {
                                        const errorData = await fbResponse.json();
                                        console.error('Error sending WhatsApp message:', JSON.stringify(errorData, null, 2));
                                    }
                                } else {
                                    console.error('Missing WhatsApp API credentials in .env.local');
                                }
                            }
                        } catch (err) {
                            console.error('Error generating AI reply:', err);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ status: 'success' }, { status: 200 });

    } catch (error) {
        console.error('Error processing WhatsApp Webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
