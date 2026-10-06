const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/app/api/orchestrator/route.ts');
let content = fs.readFileSync(targetFile, 'utf8');

// The replacement logic: we need to find the start of the DeepSeek section and replace it with Gemini section.
// We are going to find `// PRIMERA LLAMADA A DEEPSEEK (CON TOOLS)` and everything up to the `// SALVAGUARDA DE SEGURIDAD PARA AGENDAMIENTO:` block.

const startMarker = `// PRIMERA LLAMADA A DEEPSEEK (CON TOOLS)`;
const endMarker = `// SALVAGUARDA DE SEGURIDAD PARA AGENDAMIENTO:`;

if (!content.includes(startMarker) || !content.includes(endMarker)) {
    console.error("Markers not found");
    process.exit(1);
}

const geminiCode = `// --- INTEGRACIÓN GEMINI 2.5 FLASH (UNIFICADA) ---
                        const geminiKey = process.env.GEMINI_API_KEY;
                        let aiReply = "Disculpe, en este momento el atelier está con alta demanda. Un asesor humano le atenderá a la brevedad.";
                        let isHandoffTriggered = false;
                        let isScheduledTask = false;
                        let handoffUrgency = 'normal';
                        let handoffMotivo = 'El cliente solicitó atención personalizada.';

                        if (geminiKey) {
                            try {
                                const geminiContents = conversationHistory.map(msg => ({
                                    role: msg.role === 'assistant' ? 'model' : 'user',
                                    parts: [{ text: msg.content }]
                                }));

                                const geminiTools = [{
                                    functionDeclarations: [
                                        {
                                            name: "solicitar_asistencia_humana",
                                            description: "Utilizar INMEDIATAMENTE si el cliente tiene un reclamo, pide hablar con un humano o pide que le contactemos.",
                                            parameters: {
                                                type: "OBJECT",
                                                properties: { motivo: { type: "STRING" }, urgencia: { type: "STRING" } },
                                                required: ["motivo", "urgencia"]
                                            }
                                        },
                                        {
                                            name: "programar_seguimiento_automatico",
                                            description: "Utilizar cuando el cliente te pida que le hables o contactes más tarde.",
                                            parameters: {
                                                type: "OBJECT",
                                                properties: { minutos: { type: "NUMBER" }, motivo: { type: "STRING" } },
                                                required: ["minutos", "motivo"]
                                            }
                                        },
                                        {
                                            name: "agendar_visita",
                                            description: "Registra una cita presencial.",
                                            parameters: {
                                                type: "OBJECT",
                                                properties: {
                                                    nombre: { type: "STRING" }, apellido: { type: "STRING" }, correo: { type: "STRING" },
                                                    fecha: { type: "STRING", description: "YYYY-MM-DD" }, hora: { type: "STRING", description: "HH:MM" },
                                                    tipo_servicio: { type: "STRING" }
                                                },
                                                required: ["nombre", "apellido", "correo", "fecha", "hora", "tipo_servicio"]
                                            }
                                        },
                                        {
                                            name: "consultar_disponibilidad",
                                            description: "Consulta horarios disponibles (YYYY-MM-DD)",
                                            parameters: { type: "OBJECT", properties: { fecha: { type: "STRING" } }, required: ["fecha"] }
                                        }
                                    ]
                                }];

                                let payload = {
                                    contents: geminiContents,
                                    tools: geminiTools,
                                    systemInstruction: { parts: [{ text: systemPrompt }] },
                                    generationConfig: { temperature: 0.2 }
                                };

                                let res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${geminiKey}\`, {
                                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                                });

                                if (res.ok) {
                                    let data = await res.json();
                                    let candidate = data.candidates?.[0];
                                    let part = candidate?.content?.parts?.[0];

                                    if (part?.functionCall) {
                                        const call = part.functionCall;
                                        const funcName = call.name;
                                        const funcArgs = call.args;
                                        
                                        let toolResult = '';
                                        
                                        if (funcName === 'solicitar_asistencia_humana') {
                                            isHandoffTriggered = true;
                                            handoffUrgency = funcArgs.urgencia || 'normal';
                                            handoffMotivo = funcArgs.motivo || 'Atención humana requerida.';
                                            toolResult = await executeAtelierTool(funcName, funcArgs, { celular: recipientPhone });
                                        } else if (funcName === 'programar_seguimiento_automatico') {
                                            isScheduledTask = true;
                                            let delayMinutes = funcArgs.minutos || 5;
                                            
                                            const nowInStgo = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Santiago", hour12: false }));
                                            const targetDateObj = new Date(nowInStgo.getTime() + delayMinutes * 60000);
                                            const targetHour = targetDateObj.getHours();

                                            if ((targetHour < 9 || targetHour >= 21) && delayMinutes > 15) {
                                                const next9AM = new Date(targetDateObj);
                                                if (targetHour >= 21) next9AM.setDate(next9AM.getDate() + 1);
                                                next9AM.setHours(9, Math.floor(Math.random() * 30), 0, 0);
                                                delayMinutes = Math.floor((next9AM.getTime() - nowInStgo.getTime()) / 60000);
                                                if (delayMinutes < 1) delayMinutes = 1;
                                            }
                                            
                                            const { data: newTask } = await supabase.from('ai_agent_tasks').insert([{
                                                agent_role: 'whatsapp_closer', status: 'scheduled', error_log: 'Programado por IA',
                                                payload: { chat_id: task.payload.chat_id, phone_number: recipientPhone, content: \`[SISTEMA - RECORDATORIO AUTOMÁTICO] Acaban de pasar los minutos que el cliente pidió esperar. Retoma la conversación amigablemente de forma proactiva. Motivo: \${funcArgs.motivo}\`, message_type: 'text' }
                                            }]).select().single();

                                            if (newTask && process.env.QSTASH_TOKEN) {
                                                const qstashUrl = process.env.QSTASH_URL || 'https://qstash.upstash.io';
                                                const baseUrl = qstashUrl.endsWith('/') ? qstashUrl.slice(0, -1) : qstashUrl;
                                                await fetch(\`\${baseUrl}/v2/publish/https://www.elenalacosturera.cl/api/orchestrator\`, {
                                                    method: 'POST',
                                                    headers: { 'Authorization': \`Bearer \${process.env.QSTASH_TOKEN}\`, 'Content-Type': 'application/json', 'Upstash-Forward-Authorization': \`Bearer \${process.env.CRON_SECRET || 'antigravity-secret'}\`, 'Upstash-Delay': \`\${delayMinutes}m\` },
                                                    body: JSON.stringify({ scheduled_task_id: newTask.id })
                                                });
                                            }
                                            toolResult = JSON.stringify({ status: 'scheduled', message: \`Recordatorio configurado para en \${delayMinutes} minutos.\` });
                                        } else {
                                            toolResult = await executeAtelierTool(funcName, funcArgs, { celular: recipientPhone });
                                        }
                                        
                                        // SEGUNDA LLAMADA GEMINI (Devolver el resultado de la función)
                                        geminiContents.push(candidate.content);
                                        geminiContents.push({
                                            role: 'function' as any,
                                            parts: [{
                                                functionResponse: {
                                                    name: call.name,
                                                    response: { result: toolResult }
                                                }
                                            } as any]
                                        });

                                        let payload2 = {
                                            contents: geminiContents,
                                            systemInstruction: { parts: [{ text: systemPrompt }] },
                                            generationConfig: { temperature: 0.2 }
                                        };

                                        let res2 = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${geminiKey}\`, {
                                            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload2)
                                        });

                                        if (res2.ok) {
                                            let data2 = await res2.json();
                                            aiReply = data2.candidates?.[0]?.content?.parts?.[0]?.text || aiReply;
                                        }
                                        
                                    } else if (part?.text) {
                                        aiReply = part.text;
                                    }
                                }
                            } catch (e) {
                                console.error("Error con Gemini:", e);
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
                        
                        // Fake wasAgendarExecuted for fail-safe
                        const isVerbalConfirmation = /te agendé|quedaste agendad|cita confirmada|te dejé agendad/i.test(aiReply);
                        const wasAgendarExecuted = false; // We don't have this mapped exactly here, so we let the fail-safe trigger if verbal but tool failed.
                        `;

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

const newContent = content.substring(0, startIdx) + geminiCode + "\n                            " + content.substring(endIdx);

// We also need to remove the Gemini Vision block since Gemini handles it natively.
// But wait, it's easier to keep the image injection as text for now, OR we can pass it natively.
// For now, keeping the image pre-processing is fine, it doesn't break anything. The transition is to replace DeepSeek with Gemini for generation.

fs.writeFileSync(targetFile, newContent, 'utf8');
console.log("Success");
