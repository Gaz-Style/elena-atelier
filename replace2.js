const fs = require('fs');
let code = fs.readFileSync('src/app/api/orchestrator/route.ts', 'utf8');

const dsBlock = `                        // PRIMERA LLAMADA A DEEPSEEK (CON TOOLS)
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
                                            content: \`[SISTEMA - RECORDATORIO AUTOMÁTICO] Acaban de pasar los minutos que el cliente pidió esperar. Retoma la conversación amigablemente de forma proactiva. Motivo: \${motivo}\`,
                                            message_type: 'text'
                                        }
                                    }]).select().single();

                                    // 2. Programar el disparador en QStash
                                    if (newTask && process.env.QSTASH_TOKEN) {
                                        const qstashUrl = process.env.QSTASH_URL || 'https://qstash.upstash.io';
                                        const baseUrl = qstashUrl.endsWith('/') ? qstashUrl.slice(0, -1) : qstashUrl;
                                        await fetch(\`\${baseUrl}/v2/publish/https://www.elenalacosturera.cl/api/orchestrator\`, {
                                            method: 'POST',
                                            headers: {
                                                'Authorization': \`Bearer \${process.env.QSTASH_TOKEN}\`,
                                                'Content-Type': 'application/json',
                                                'Upstash-Forward-Authorization': \`Bearer \${process.env.CRON_SECRET || 'antigravity-secret'}\`,
                                                'Upstash-Delay': \`\${delayMinutes}m\`
                                            },
                                            body: JSON.stringify({ scheduled_task_id: newTask.id })
                                        });
                                    }
                                    
                                    toolResult = JSON.stringify({ status: 'scheduled', message: \`Recordatorio configurado para en \${delayMinutes} minutos.\` });
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
                        } catch (error) {
                            console.error("Error llamando a DeepSeek:", error);
                        }`;

const geminiBlock = `                        // --- INTEGRACION GEMINI 2.5 FLASH UNIFICADA ---
                        let aiReply = "Disculpe, en este momento el atelier está con alta demanda. Un asesor humano le atenderá a la brevedad.";
                        let isHandoffTriggered = false;
                        let isScheduledTask = false;
                        let handoffUrgency = 'normal';
                        let handoffMotivo = 'El cliente solicitó atención personalizada.';

                        try {
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

                            if (part?.functionCall) {
                                const call = part.functionCall;
                                const funcName = call.name;
                                const funcArgs = call.args;
                                
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
                        } catch (aiErr: any) {
                            console.error("Error en Gemini generation:", aiErr);
                        }`;

code = code.replace(dsBlock, geminiBlock);
fs.writeFileSync('src/app/api/orchestrator/route.ts', code);
