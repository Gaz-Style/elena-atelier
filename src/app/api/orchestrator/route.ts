import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { generateDeepSeekCompletion } from '@/lib/ai/deepseek';
import { ATELIER_TOOLS, executeAtelierTool } from '@/lib/ai/tools';
import { retrieveContext, saveClientMemory } from '@/lib/ai/rag';
import { consultar_disponibilidad, agendar_visita } from '@/lib/agenda';

export const maxDuration = 60; // Max execution time for Vercel

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        // Simple security: Check a custom cron secret (you should set this in env)
        if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'antigravity-secret'}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        let body: any = {};
        try { body = await req.json(); } catch(e) {}

        // Si QStash envía un task_id programado, lo pasamos a pending para que sea procesado
        if (body.scheduled_task_id) {
            await supabase.from('ai_agent_tasks').update({ status: 'pending' }).eq('id', body.scheduled_task_id);
        }

        const results = await processAITasks(supabase);
        return NextResponse.json({ message: 'Processed tasks', results });
    } catch (error: any) {
        console.error('Orchestrator error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function processAITasks(supabase: any, specificTaskIds?: string[]) {
    // 1. Fetch pending tasks from the queue (FIFO)
    let query = supabase
        .from('ai_agent_tasks')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (specificTaskIds && specificTaskIds.length > 0) {
        query = query.in('id', specificTaskIds);
    } else {
        query = query.limit(5); // Solo limitar a 5 si es un barrido general
    }

    const { data: tasks, error: fetchError } = await query;

    if (fetchError) {
        console.error('Error fetching tasks:', fetchError);
        throw new Error(fetchError.message);
    }

    if (!tasks || tasks.length === 0) {
        return [];
    }

    // 2. Mark tasks as processing
    const taskIds = tasks.map((t: any) => t.id);
    await supabase
        .from('ai_agent_tasks')
        .update({ status: 'processing' })
        .in('id', taskIds);

    const results = [];

    // 3. Process each task based on agent_role
    for (const task of tasks) {
        try {
            let resultPayload = null;

                switch (task.agent_role) {
                    case 'whatsapp_closer':
                        const deepseekKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
                        if (!deepseekKey) throw new Error("DeepSeek API Key not found");
                        
                        const userMessage = task.payload.content || "Hola";

                        // Verificación de seguridad: comprobar si el chat sigue con el bot activo ('bot')
                        let recipientPhone = task.payload.phone_number;
                        if (task.payload.chat_id) {
                            const { data: currentChat } = await supabase
                                .from('crm_whatsapp_chats')
                                .select('session_status, phone_number')
                                .eq('id', task.payload.chat_id)
                                .single();

                            if (currentChat && currentChat.session_status !== 'bot') {
                                console.log(`Chat ${task.payload.chat_id} está en modo humano (${currentChat.session_status}). Omitiendo respuesta automática.`);
                                // Marcar tarea como completada sin responder
                                await supabase
                                    .from('ai_agent_tasks')
                                    .update({
                                        status: 'completed',
                                        result: { action: 'skipped', reason: 'human_takeover' },
                                        processed_at: new Date().toISOString()
                                    })
                                    .eq('id', task.id);
                                results.push({ id: task.id, status: 'skipped', reason: 'human_takeover' });
                                continue;
                            }
                            
                            if (currentChat?.phone_number) {
                                recipientPhone = currentChat.phone_number;
                            }
                        }

                        // Obtener catálogo para inyectar precios reales
                        const { data: catalogItems } = await supabase
                            .from('catalog')
                            .select('name, category, price, description')
                            .eq('active', true);
                            
                        let catalogContext = 'Catálogo No Disponible';
                        if (catalogItems && catalogItems.length > 0) {
                            catalogContext = catalogItems.map((item: any) => `- ${item.name} (${item.category}): desde $${item.price.toLocaleString('es-CL')}`).join('\n');
                        }

                        // Obtener historial reciente del chat (últimos 6 mensajes) para darle contexto completo a la IA
                        let conversationHistory: any[] = [];
                        if (task.payload.chat_id) {
                            const { data: pastMsgs } = await supabase
                                .from('crm_whatsapp_messages')
                                .select('sender_type, content')
                                .eq('chat_id', task.payload.chat_id)
                                .order('created_at', { ascending: false })
                                .limit(15);
                            
                            if (pastMsgs && pastMsgs.length > 0) {
                                // Invertir para orden cronológico
                                conversationHistory = pastMsgs.reverse().map((m: any) => ({
                                    role: m.sender_type === 'customer' ? 'user' : 'assistant',
                                    content: m.content || ''
                                }));
                            }
                        }

                        // Si por alguna razón el historial no trajo el último mensaje de la tarea, asegurarlo
                        if (conversationHistory.length === 0 || conversationHistory[conversationHistory.length - 1].content !== userMessage) {
                            conversationHistory.push({ role: 'user', content: userMessage });
                        }
                        
                        // Evaluar si hay foto en el mensaje original (fase Gemini)
                        const isImage = task.payload.message_type === 'image';
                        if (isImage) {
                            let geminiAnalysisLocal = task.payload.gemini_analysis || null;
                            const mediaUrl = task.payload.media_url;
                            if (!geminiAnalysisLocal && mediaUrl) {
                                // Procesar la foto aquí asíncronamente
                                const metaToken = process.env.WHATSAPP_API_TOKEN;
                                const geminiKey = process.env.GEMINI_API_KEY;
                                if (metaToken && geminiKey) {
                                    try {
                                        const mediaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaUrl}`, { headers: { 'Authorization': `Bearer ${metaToken}` }});
                                        const mediaData = await mediaRes.json();
                                        if (mediaData.url) {
                                            const imageRes = await fetch(mediaData.url, { headers: { 'Authorization': `Bearer ${metaToken}` }});
                                            if (imageRes.ok) {
                                                const arrayBuffer = await imageRes.arrayBuffer();
                                                const buffer = Buffer.from(arrayBuffer);
                                                const base64Image = buffer.toString('base64');
                                                const mimeType = mediaData.mime_type || 'image/jpeg';
                                                
                                                const payload = {
                                                    contents: [{ parts: [{ text: "Actúa como experta modista. Describe brevemente qué prenda es y qué tipo de arreglo o confección parece necesitar según la foto (máximo 2 líneas)." }, { inlineData: { mimeType, data: base64Image } }] }],
                                                    generationConfig: { maxOutputTokens: 150 }
                                                };
                                                
                                                const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
                                                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                                                });
                                                
                                                if (geminiRes.ok) {
                                                    const geminiData = await geminiRes.json();
                                                    geminiAnalysisLocal = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || null;
                                                }
                                            }
                                        }
                                    } catch (e) {
                                        console.error('Error visual:', e);
                                    }
                                }
                            }
                            
                            if (geminiAnalysisLocal) {
                               // Inyectar el análisis visual directamente en el mensaje del usuario para que el LLM lo lea como acción del usuario
                               const lastUserMsgIndex = conversationHistory.findLastIndex((msg: any) => msg.role === 'user');
                               if (lastUserMsgIndex !== -1) {
                                   conversationHistory[lastUserMsgIndex].content = `[EL USUARIO ENVIÓ UNA FOTO. Análisis de la imagen: ${geminiAnalysisLocal}] ${conversationHistory[lastUserMsgIndex].content}`;
                               }
                            } else {
                               const lastUserMsgIndex = conversationHistory.findLastIndex((msg: any) => msg.role === 'user');
                               if (lastUserMsgIndex !== -1) {
                                   conversationHistory[lastUserMsgIndex].content = `[EL USUARIO ENVIÓ UNA FOTO, pero hubo un error al leerla o descargarla. Dile que no pudiste verla bien y pídele que traiga la prenda o envíe otra foto.] ${conversationHistory[lastUserMsgIndex].content}`;
                               }
                            }
                        }

                        // Recuperar RAG context
                        let ragContext = await retrieveContext(userMessage, recipientPhone);

                        // Inyectar datos del cliente desde CRM si existe
                        let searchPhone1 = recipientPhone;
                        let searchPhone2 = recipientPhone.startsWith('56') ? recipientPhone.substring(2) : `56${recipientPhone}`;
                        const { data: customerData } = await supabase
                            .from('customers')
                            .select('full_name, email')
                            .or(`phone.eq.${searchPhone1},phone.eq.${searchPhone2}`)
                            .limit(1);
                        
                        if (customerData && customerData.length > 0) {
                            const cName = customerData[0].full_name || '';
                            const cEmail = customerData[0].email || '';
                            const [nombre, ...apellidos] = cName.split(' ');
                            const apellido = apellidos.join(' ');
                            ragContext += `\n[CRM DATA]: Este cliente ya está registrado en tu base de datos. Su celular es ${recipientPhone}. Su nombre es "${nombre}", su apellido es "${apellido}" y su correo es "${cEmail}". NO le pidas nombre ni correo para agendar, ya los tienes, úsalos automáticamente al invocar la herramienta de agendar.`;
                        } else {
                            ragContext += `\n[CRM DATA]: Este es un cliente NUEVO. Recuerda entregarle la dirección física del taller (Av Tabancura 1091 Of 319 Vitacura) en un mensaje aparte después de agendar.`;
                        }

                        // Obtener fecha actual en Santiago
                        const now = new Date();
                        const santiagoTime = new Intl.DateTimeFormat('es-CL', {
                            timeZone: 'America/Santiago',
                            dateStyle: 'full',
                            timeStyle: 'short'
                        }).format(now);
                        const currentDateISO = now.toISOString().split('T')[0];

                        // Inyectar disponibilidad real en vivo desde la base de datos
                        let liveAgendaText = "No fue posible obtener la agenda en vivo.";
                        try {
                            liveAgendaText = await consultar_disponibilidad(currentDateISO);
                        } catch (agendaErr) {
                            console.error("Error consultando disponibilidad en vivo:", agendaErr);
                        }

                        ragContext += `\n\n[CALENDARIO DE DISPONIBILIDAD REAL EN VIVO (DESDE BASE DE DATOS SUPABASE)]:
${liveAgendaText}

REGLAS ABSOLUTAS DE DISPONIBILIDAD Y AGENDA:
1. NUNCA INVENTES NINGUNA HORA. Si el cliente pregunta qué horas hay disponibles o pide una hora específica (ej. 16:00), REVISA ESTRICTAMENTE la lista real de arriba.
2. Si el cliente pide una hora que NO ESTÁ en la lista de arriba (por ejemplo pide las 16:00 y no aparece como libre), DILE EXPLÍCITAMENTE que esa hora no está disponible y entrega ÚNICAMENTE las horas que figuran como libres en la lista real superior.
3. DEFINICIÓN DE MAÑANA Y TARDE:
   - MAÑANA: Horas entre 09:00 y 12:00.
   - TARDE: Horas entre 14:00 y 19:00 (ej: 14:00, 15:00, 16:00, 17:00, 18:00).
   - Si el cliente pide hora "en la tarde", REVISA la lista real superior y dale las horas disponibles en el bloque de la tarde (>= 14:00). ¡PROHIBIDO decir que no hay en la tarde si en la lista real superior sí figuran horas como las 14:00, 15:00 o 18:00!
4. Si el cliente te pide un día distinto a los que están en la lista superior, ejecuta la herramienta 'consultar_disponibilidad' indicando la fecha deseada.`;

                        const systemPrompt = `Eres Elena, la Encargada de Atención al Cliente de "Elena La Costurera". NUNCA te presentes como "asistente virtual" ni "bot".
Tratamiento: Tuteo profesional. Dirígete SIEMPRE de "Tú", siendo natural y directa. PROHIBIDO usar emojis en los primeros 3 mensajes. NO uses palabras complicadas, exageradas ni rellenes con texto innecesario.

REGLA DE SALUDO INICIAL Y ADAPTACIÓN:
Los clientes pueden llegar con mensajes pre-cargados (de novias, arreglos, B2B). Adáptate naturally al contexto de lo que piden.
Si solo dicen "Hola", tu respuesta debe ser extremadamente simple y natural, por ejemplo: "Hola, buenas tardes." No sueltes discursos de bienvenida.

INFORMACIÓN DEL TALLER Y DIRECCIÓN:
- Dirección: "Estamos ubicados en Av Tabancura 1091 Of 319 Vitacura".
- REGLA DE DIRECCIÓN: Entrega la dirección SOLO a clientes NUEVOS. Si el cliente ya está registrado en el CRM, asume que ya la sabe y dásela solo si la pide explícitamente. Cuando entregues la dirección, siempre debe ir en un mensaje/línea aparte, no mezclada en el párrafo.

REGLA DE URGENCIA (45 DÍAS):
- Si el cliente menciona una fecha de evento que está a menos de 45 días, ES URGENTE. No digas "estamos a buen tiempo". Usa un enfoque como: "Un desafío, estamos con el tiempo en contra, busquemos una fecha para una cita en el taller y así te entrego una cotización exacta. ¿Qué día te acomoda?"

FECHA ACTUAL: Hoy es ${santiagoTime}.
¡NUNCA sugieras fechas u horas de tu propia mente! Usa los datos del CALENDARIO EN VIVO adjuntos arriba en tu contexto. Prohibido agendar a las 13:00 (hora de colación).

REGLAS DE ORO OBLIGATORIAS:
1. BREVEDAD ABSOLUTA: Responde en MÁXIMO 2 o 3 líneas por mensaje. Prohibido escribir textos largos.
2. PREGUNTA GUÍA: Termina tus respuestas con una pregunta cerrada para guiar al cliente hacia el agendamiento, EXCEPTO cuando la cita ya se haya agendado o el cliente se esté despidiendo.
3. VOCABULARIO CHILENO: Prohibido decir "bastilla" (usa "basta"), "cremallera" (usa "cierre"). Usa lenguaje natural de Chile.
4. PRECIOS Y AGENDAMIENTO: Usa el catálogo adjunto. Siempre da precios referenciales con la palabra "desde". Despacho a domicilio en sector oriente cuesta $10.000.
5. TOMA DE DATOS Y AGENDA: Revisa las horas disponibles reales arriba. Si el cliente acepta una fecha y hora disponible, revisa tu Contexto (CRM). Si ya tienes su Nombre y Correo, NO se los pidas de nuevo; avanza directo a agendar. Si no los tienes, pídeselos. SI EL CLIENTE ENVÍA NOMBRE Y APELLIDO JUNTO CON O SIN CORREO (ej: "Elena Rojas, nenitadesign@gmail.com" o "Elena Rojas"), TOMA EL PRIMER NOMBRE COMO "Elena" Y EL SEGUNDO COMO "Rojas". ¡PROHIBIDO PREGUNTAR NUEVAMENTE POR EL APELLIDO! CUANDO TENGAS EL NOMBRE, APELLIDO, CORREO Y HORA, ESTÁS OBLIGADO a ejecutar la herramienta 'agendar_visita'. Si la herramienta devuelve un error, DEBES decirle al cliente que hubo un problema y NO confirmar la cita. NUNCA confirmes una cita si no ejecutaste la herramienta EXITOSAMENTE. Tras agendar exitosamente, NUNCA entregues la dirección si es cliente antiguo (a menos que te la pida). SÓLO entrega la dirección si es cliente nuevo. NO pidas el celular.
6. DERIVACIÓN: Si el cliente muestra confusión, enojo, pide hablar con un humano o menciona la palabra "problema", usa la herramienta 'solicitar_asistencia_humana'.
7. CONTACTO POSTERIOR (RECORDATORIO): Si te piden que les hables más tarde, usa de inmediato la herramienta 'programar_seguimiento_automatico' con los minutos indicados. Si están dentro de tu horario hábil (09:00 a 21:00), diles "¡Claro! Te escribo en un ratito.". PERO si te piden hablarles a una hora que cae fuera de ese horario (ej: de madrugada), diles "¡Claro! Te escribiré mañana a primera hora para que lo veamos." (EXCEPCIÓN: Si te piden esperar 15 minutos o menos, permítelo y diles "¡Claro! Te espero").
8. FOTOS Y VISIÓN (¡MUY IMPORTANTE!): ¡TÚ SÍ PUEDES VER FOTOS! Estás conectada a un motor de visión. Si el cliente te pregunta si puede enviar fotos, dile con entusiasmo "¡Sí, claro! Envíame la foto y la reviso de inmediato.". ¡NUNCA digas que no puedes ver imágenes!
9. SERVICIO A DOMICILIO: La costurera va a domicilio SOLO a tomar medidas y probar prendas (con alfileres). ¡NUNCA COSE NI ARREGLA ROPA EN LA CASA DEL CLIENTE! Las prendas siempre se llevan de vuelta al taller para ser arregladas en las máquinas.

ACCIONES PROHIBIDAS (NUNCA LAS HAGAS):
- NUNCA escribas datos bancarios, números de cuenta ni RUT en el chat.
- NUNCA envíes links de pago. Los pagos se gestionan por correo desde el taller.
- NUNCA borres datos de clientes. Si piden borrar sus datos, di que un asesor gestionará la solicitud.
- NUNCA des un precio final exacto. Siempre usa "desde $X" y deriva al taller.
- NUNCA confirmes una cita verbalmente (ej: "Te agendé", "Listo") sin haber ejecutado la herramienta 'agendar_visita'. ESTÁ ESTRICTAMENTE PROHIBIDO.
- NUNCA respondas con bloques de código XML ni etiquetas DSML.
- ALUCINACIÓN PROHIBIDA: Tienes PROHIBIDO decir "Tengo disponible a las 09:00, 10:00 u 11:00" u ofrecer CUALQUIER hora que no esté en los datos de disponibilidad real de Supabase adjuntos arriba.

CATÁLOGO VIGENTE Y CONTEXTO RAG (USAR COMO REFERENCIA):
${catalogContext}
${ragContext}`;

                        // PRIMERA LLAMADA A DEEPSEEK (CON TOOLS)
                        let aiReply = "Disculpe, en este momento el atelier está con alta demanda. Un asesor humano le atenderá a la brevedad.";
                        let isHandoffTriggered = false;
                        let isScheduledTask = false;
                        let handoffUrgency = 'normal';
                        let handoffMotivo = 'El cliente solicitó atención personalizada.';

                        try {
                            const dsResponse = await generateDeepSeekCompletion({
                                messages: [
                                    { role: 'system', content: systemPrompt },
                                    ...conversationHistory
                                ],
                                tools: ATELIER_TOOLS,
                                temperature: 0.2
                            });

                            if (dsResponse.toolCalls && dsResponse.toolCalls.length > 0) {
                                // Ejecutar tool
                                const toolCall = dsResponse.toolCalls[0];
                                const funcName = toolCall.function.name;
                                const funcArgs = JSON.parse(toolCall.function.arguments);
                                
                                let toolResult;
                                if (funcName === 'solicitar_asistencia_humana') {
                                    isHandoffTriggered = true;
                                    handoffUrgency = funcArgs.urgencia || 'normal';
                                    handoffMotivo = funcArgs.motivo || 'Atención humana requerida.';
                                    toolResult = await executeAtelierTool(funcName, funcArgs, { celular: recipientPhone });
                                } else if (funcName === 'programar_seguimiento_automatico') {
                                    isScheduledTask = true;
                                    let delayMinutes = funcArgs.minutos || 5;
                                    const motivo = funcArgs.motivo || 'Seguimiento general';
                                    
                                    // Validar horario de respeto (09:00 a 21:00) en Chile
                                    const nowInStgo = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Santiago", hour12: false }));
                                    const targetDateObj = new Date(nowInStgo.getTime() + delayMinutes * 60000);
                                    const targetHour = targetDateObj.getHours();

                                    // Si es de madrugada, empujar a mañana a menos que sea una espera corta (<= 15 min)
                                    if ((targetHour < 9 || targetHour >= 21) && delayMinutes > 15) {
                                        const next9AM = new Date(targetDateObj);
                                        if (targetHour >= 21) {
                                            next9AM.setDate(next9AM.getDate() + 1);
                                        }
                                        next9AM.setHours(9, Math.floor(Math.random() * 30), 0, 0); // 09:00 - 09:30 random
                                        
                                        const diffMs = next9AM.getTime() - nowInStgo.getTime();
                                        delayMinutes = Math.floor(diffMs / 60000);
                                        if (delayMinutes < 1) delayMinutes = 1;
                                    }
                                    
                                    // 1. Insertar tarea dormida
                                    const { data: newTask } = await supabase.from('ai_agent_tasks').insert([{
                                        agent_role: 'whatsapp_closer',
                                        status: 'scheduled',
                                        error_log: 'Programado por IA',
                                        payload: {
                                            chat_id: task.payload.chat_id,
                                            phone_number: recipientPhone,
                                            content: `[SISTEMA - RECORDATORIO AUTOMÁTICO] Acaban de pasar los minutos que el cliente pidió esperar. Retoma la conversación amigablemente de forma proactiva. Motivo: ${motivo}`,
                                            message_type: 'text'
                                        }
                                    }]).select().single();

                                    // 2. Programar el disparador en QStash
                                    if (newTask && process.env.QSTASH_TOKEN) {
                                        const qstashUrl = process.env.QSTASH_URL || 'https://qstash.upstash.io';
                                        const baseUrl = qstashUrl.endsWith('/') ? qstashUrl.slice(0, -1) : qstashUrl;
                                        await fetch(`${baseUrl}/v2/publish/https://www.elenalacosturera.cl/api/orchestrator`, {
                                            method: 'POST',
                                            headers: {
                                                'Authorization': `Bearer ${process.env.QSTASH_TOKEN}`,
                                                'Content-Type': 'application/json',
                                                'Upstash-Forward-Authorization': `Bearer ${process.env.CRON_SECRET || 'antigravity-secret'}`,
                                                'Upstash-Delay': `${delayMinutes}m`
                                            },
                                            body: JSON.stringify({ scheduled_task_id: newTask.id })
                                        });
                                    }
                                    
                                    toolResult = JSON.stringify({ status: 'scheduled', message: `Recordatorio configurado para en ${delayMinutes} minutos.` });
                                } else {
                                    toolResult = await executeAtelierTool(funcName, funcArgs, { celular: recipientPhone });
                                }
                                
                                // SEGUNDA LLAMADA (Para que DeepSeek responda tras ejecutar)
                                const dsResponse2 = await generateDeepSeekCompletion({
                                    messages: [
                                        { role: 'system', content: systemPrompt },
                                        ...conversationHistory,
                                        { role: 'assistant', content: '', tool_calls: dsResponse.toolCalls },
                                        { role: 'tool', content: toolResult, tool_call_id: toolCall.id, name: funcName }
                                    ],
                                    temperature: 0.2
                                });
                                aiReply = dsResponse2.content || aiReply;
                            } else {
                                aiReply = dsResponse.content || aiReply;
                            }

                            // SALVAGUARDA DE SEGURIDAD PARA AGENDAMIENTO:
                            // Si el bot afirmó verbalmente agendar ("Te agendé..."), pero la herramienta agendar_visita no fue invocada:
                            const wasAgendarExecuted = dsResponse.toolCalls?.some((t: any) => t.function?.name === 'agendar_visita');
                            const isVerbalConfirmation = /te agendé|quedaste agendad|cita confirmada|te dejé agendad/i.test(aiReply);

                            if (!wasAgendarExecuted && isVerbalConfirmation) {
                                console.warn('[FAIL-SAFE AGENDA] El bot confirmó verbalmente la cita pero no ejecutó la tool. Ejecutando salvaguarda...');
                                try {
                                    const allText = conversationHistory.map((m: any) => m.content).join(' ') + ' ' + userMessage;
                                    const emailMatch = allText.match(/[\w.-]+@[\w.-]+\.\w+/);
                                    const targetEmail = emailMatch ? emailMatch[0] : (customerData?.[0]?.email || '');

                                    let targetNombre = 'Cliente';
                                    let targetApellido = 'Atelier';

                                    if (customerData?.[0]?.full_name) {
                                        const parts = customerData[0].full_name.split(' ');
                                        targetNombre = parts[0];
                                        targetApellido = parts.slice(1).join(' ') || 'Atelier';
                                    } else {
                                        const userMsgs = conversationHistory.filter((m: any) => m.role === 'user').map((m: any) => m.content);
                                        for (const msg of userMsgs.reverse()) {
                                            const clean = msg.replace(/[\w.-]+@[\w.-]+\.\w+/, '').replace(/,/g, '').trim();
                                            const words = clean.split(/\s+/).filter((w: string) => w.length > 1 && !/^(hola|si|sí|a|las|el|miércoles|jueves|viernes|sábado|mañana|tarde)$/i.test(w));
                                            if (words.length >= 2) {
                                                targetNombre = words[0];
                                                targetApellido = words.slice(1).join(' ');
                                                break;
                                            } else if (words.length === 1 && targetNombre === 'Cliente') {
                                                targetNombre = words[0];
                                            }
                                        }
                                    }

                                    let targetHora = '18:00';
                                    const horaMatch = aiReply.match(/(\d{1,2}):(\d{2})/) || userMessage.match(/(\d{1,2}):(\d{2})/);
                                    if (horaMatch) {
                                        targetHora = `${horaMatch[1].padStart(2, '0')}:${horaMatch[2]}`;
                                    } else {
                                        const horaSimple = aiReply.match(/a las (\d{1,2})/i) || userMessage.match(/a las (\d{1,2})/i);
                                        if (horaSimple) {
                                            targetHora = `${horaSimple[1].padStart(2, '0')}:00`;
                                        }
                                    }

                                    let targetFecha = currentDateISO;
                                    const diaMatch = aiReply.match(/(\d{1,2})\s+de\s+(\w+)|día\s+(\d{1,2})|miércoles\s+(\d{1,2})|jueves\s+(\d{1,2})|viernes\s+(\d{1,2})|sábado\s+(\d{1,2})/i);
                                    if (diaMatch) {
                                        const numDia = (diaMatch[1] || diaMatch[3] || diaMatch[4] || diaMatch[5] || diaMatch[6] || diaMatch[7]).padStart(2, '0');
                                        const nowObj = new Date();
                                        targetFecha = `${nowObj.getFullYear()}-${(nowObj.getMonth() + 1).toString().padStart(2, '0')}-${numDia}`;
                                    }

                                    if (targetEmail) {
                                        const fechaHoraISO = `${targetFecha}T${targetHora}:00`;
                                        console.log(`[FAIL-SAFE AGENDA] Ejecutando agendar_visita automático: ${targetNombre} ${targetApellido}, ${targetEmail}, ${fechaHoraISO}`);
                                        await agendar_visita(targetNombre, targetApellido, recipientPhone, targetEmail, fechaHoraISO, 'whatsapp');
                                    }
                                } catch (fsErr) {
                                    console.error('[FAIL-SAFE AGENDA] Error en salvaguarda:', fsErr);
                                }
                            }
                            
                            // Evaluar Handoff Automático (Backup por Regex)
                            const handoffRegexUser = /humano|asesor|reclamo|problema|inconveniente|queja|devolución|datos bancarios|transferencia/i;
                            const handoffRegexBot = /asesora humana|transferir|un momento.*por favor|inconveniente|problema/i;
                            
                            if (!isHandoffTriggered && !isScheduledTask && (handoffRegexUser.test(userMessage) || handoffRegexBot.test(aiReply))) {
                                isHandoffTriggered = true;
                                handoffUrgency = /reclamo|problema|inconveniente|queja|devolución/i.test(userMessage) ? 'alta' : 'normal';
                                handoffMotivo = 'Detectado por filtro de seguridad (Regex).';
                                aiReply = "Entendido. Para atenderte de forma más personalizada, te voy a transferir directamente con nuestro equipo. Un momento por favor.";
                            }

                        } catch (error) {
                            console.error("Error llamando a DeepSeek:", error);
                        }

                        // Guardar respuesta del bot en el historial de mensajes
                        if (task.payload.chat_id) {
                            await supabase
                                .from('crm_whatsapp_messages')
                                .insert([{
                                    chat_id: task.payload.chat_id,
                                    sender_type: 'bot',
                                    message_type: 'text',
                                    content: aiReply
                                }]);
                                
                            if (isHandoffTriggered) {
                                await supabase
                                    .from('crm_whatsapp_chats')
                                    .update({ session_status: 'human_handoff' })
                                    .eq('id', task.payload.chat_id);
                            }
                        }

                        const token = process.env.WHATSAPP_API_TOKEN;
                        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

                        // ENVIAR MENSAJE A WHATSAPP
                        if (recipientPhone && token && phoneId) {
                            try {
                                const waRes = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        messaging_product: 'whatsapp',
                                        to: recipientPhone,
                                        type: 'text',
                                        text: { body: aiReply }
                                    })
                                });

                                const waResData = await waRes.json();
                                if (!waRes.ok) {
                                    console.error('Error enviando mensaje a WhatsApp Meta API:', waResData);
                                } else {
                                    console.log('Mensaje enviado exitosamente a WhatsApp Meta API:', waResData);
                                    
                                    // Si hubo handoff, notificar al admin
                                    if (isHandoffTriggered) {
                                        const adminPhones = ['56984021940', '56937667709'];
                                        
                                        let iconoAlerta = handoffUrgency === 'alta' ? '🚨' : '⚠️';
                                        let tituloAlerta = handoffUrgency === 'alta' ? '*URGENCIA: RECLAMO O PROBLEMA*' : '*Atención Humana Requerida*';
                                        
                                        const adminMessage = `${iconoAlerta} ${tituloAlerta}\n\nEl cliente (${recipientPhone}) ha sido transferido a un humano.\n\n*Motivo de la IA:* ${handoffMotivo}\n\n👉 Responder aquí: https://elenalacosturera.cl/admin/livechat`;
                                        
                                        for (const adminPhone of adminPhones) {
                                            await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
                                                method: 'POST',
                                                headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({
                                                    messaging_product: 'whatsapp',
                                                    to: adminPhone,
                                                    type: 'text',
                                                    text: { body: adminMessage }
                                                })
                                            });
                                        }
                                    }
                                }
                            } catch (waErr) {
                                console.error('Excepción al enviar a WhatsApp Meta API:', waErr);
                            }
                        } else {
                            console.warn('Faltan credenciales o teléfono para enviar mensaje a Meta API:', {
                                hasPhone: !!recipientPhone,
                                hasToken: !!token,
                                hasPhoneId: !!phoneId
                            });
                        }

                        resultPayload = { 
                            action: 'reply', 
                            message: aiReply,
                            handoff: isHandoffTriggered,
                            original_payload: task.payload 
                        };
                        break;
                    case 'hr_manager':
                        resultPayload = { action: 'review_payroll', status: 'ok' };
                        break;
                    case 'erp_analyst':
                        resultPayload = { action: 'alert', message: 'Falta stock de seda italiana' };
                        break;
                    default:
                        throw new Error(`Unknown agent_role: ${task.agent_role}`);
                }

                // Update task as completed
                await supabase
                    .from('ai_agent_tasks')
                    .update({
                        status: 'completed',
                        result: resultPayload,
                        processed_at: new Date().toISOString()
                    })
                    .eq('id', task.id);

                results.push({ id: task.id, status: 'completed' });

            } catch (err: any) {
                console.error(`Task ${task.id} failed:`, err);
                // Mark task as failed
                await supabase
                    .from('ai_agent_tasks')
                    .update({
                        status: 'failed',
                        error_log: err.message,
                        processed_at: new Date().toISOString()
                    })
                    .eq('id', task.id);
                results.push({ id: task.id, status: 'failed', error: err.message });
            }
    }

    return results;
}
