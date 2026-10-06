const fs = require('fs');

let lines = fs.readFileSync('src/app/api/orchestrator/route.ts', 'utf8').split(/\r?\n/);

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const dsResponse = await generateDeepSeekCompletion({')) {
        startIdx = i - 1; 
    }
    if (startIdx !== -1 && lines[i].includes('} catch (error) {')) {
        endIdx = i + 2; // INCLUDE the catch block and closing bracket!
        break;
    }
}

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find bounds");
    process.exit(1);
}

const geminiLogic = `                        try {
                            const geminiKey = process.env.GEMINI_API_KEY;
                            if (!geminiKey) throw new Error("Gemini API Key missing");

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

                            let payload = {
                                contents: geminiContents,
                                tools: geminiTools,
                                systemInstruction: { parts: [{ text: systemPrompt }] },
                                generationConfig: { temperature: 0.2 }
                            };

                            let res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${geminiKey}\`, {
                                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                            });

                            if (!res.ok) throw new Error("Gemini fetch failed");

                            let data = await res.json();
                            let candidate = data.candidates?.[0];
                            let part = candidate?.content?.parts?.[0];
                            let wasAgendarExecuted = false;

                            if (part?.functionCall) {
                                const call = part.functionCall;
                                const funcName = call.name;
                                const funcArgs = call.args;
                                
                                if (funcName === 'agendar_visita') {
                                    wasAgendarExecuted = true;
                                }
                                
                                let toolResult: any = undefined;
                                
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
                                        next9AM.setHours(9, 0, 0, 0);
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
                                
                                geminiContents.push(candidate.content);
                                geminiContents.push({
                                    role: 'function' as any,
                                    parts: [{
                                        functionResponse: {
                                            name: call.name,
                                            response: { result: toolResult || "" }
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

                            // SALVAGUARDA DE SEGURIDAD PARA AGENDAMIENTO:
                            const isVerbalConfirmation = /te agendé|quedaste agendad|cita confirmada|te dejé agendad/i.test(aiReply);

                            if (!wasAgendarExecuted && isVerbalConfirmation) {
                                console.warn('[FAIL-SAFE AGENDA] El bot confirmó verbalmente la cita pero no ejecutó la tool. Ejecutando salvaguarda...');
                                try {
                                    const allText = conversationHistory.map((m: any) => m.content).join(' ') + ' ' + userMessage;
                                    const emailMatch = allText.match(/[\\w.-]+@[\\w.-]+\\.\\w+/);
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
                                            const clean = msg.replace(/[\\w.-]+@[\\w.-]+\\.\\w+/, '').replace(/,/g, '').trim();
                                            const words = clean.split(/\\s+/).filter((w: string) => w.length > 1 && !/^(hola|si|sí|a|las|el|miércoles|jueves|viernes|sábado|mañana|tarde)$/i.test(w));
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
                                    const horaMatch = aiReply.match(/(\\d{1,2}):(\\d{2})/) || userMessage.match(/(\\d{1,2}):(\\d{2})/);
                                    if (horaMatch) {
                                        targetHora = \`\${horaMatch[1].padStart(2, '0')}:\${horaMatch[2]}\`;
                                    } else {
                                        const horaSimple = aiReply.match(/a las (\\d{1,2})/i) || userMessage.match(/a las (\\d{1,2})/i);
                                        if (horaSimple) {
                                            targetHora = \`\${horaSimple[1].padStart(2, '0')}:00\`;
                                        }
                                    }

                                    let targetFecha = currentDateISO;
                                    const diaMatch = aiReply.match(/(\\d{1,2})\\s+de\\s+(\\w+)|día\\s+(\\d{1,2})|miércoles\\s+(\\d{1,2})|jueves\\s+(\\d{1,2})|viernes\\s+(\\d{1,2})|sábado\\s+(\\d{1,2})/i);
                                    if (diaMatch) {
                                        const numDia = (diaMatch[1] || diaMatch[3] || diaMatch[4] || diaMatch[5] || diaMatch[6] || diaMatch[7]).padStart(2, '0');
                                        const nowObj = new Date();
                                        targetFecha = \`\${nowObj.getFullYear()}-\${(nowObj.getMonth() + 1).toString().padStart(2, '0')}-\${numDia}\`;
                                    }

                                    if (targetEmail) {
                                        const fechaHoraISO = \`\${targetFecha}T\${targetHora}:00\`;
                                        console.log(\`[FAIL-SAFE AGENDA] Ejecutando agendar_visita automático: \${targetNombre} \${targetApellido}, \${targetEmail}, \${fechaHoraISO}\`);
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
                            console.error("Error llamando a Gemini:", error);
                        }`;

lines.splice(startIdx, endIdx - startIdx + 1, geminiLogic);
fs.writeFileSync('src/app/api/orchestrator/route.ts', lines.join('\n'));
console.log("Success");
