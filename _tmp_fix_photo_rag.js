const fs = require('fs');
let code = fs.readFileSync('src/app/api/orchestrator/route.ts', 'utf8');

const targetUserMessage = `const userMessage = task.payload.content || "Hola";`;
const repUserMessage = `let userMessage = task.payload.content || "Hola";`;
code = code.replace(targetUserMessage, repUserMessage);

const targetPhotoInsert = `                               const lastUserMsgIndex = conversationHistory.findLastIndex((msg: any) => msg.role === 'user');
                               if (lastUserMsgIndex !== -1) {
                                   conversationHistory[lastUserMsgIndex].content = \`[EL USUARIO ENVIÓ UNA FOTO. Análisis de la imagen: \${geminiAnalysisLocal}] \${conversationHistory[lastUserMsgIndex].content}\`;
                               }`;
const repPhotoInsert = `                               const lastUserMsgIndex = conversationHistory.findLastIndex((msg: any) => msg.role === 'user');
                               if (lastUserMsgIndex !== -1) {
                                   conversationHistory[lastUserMsgIndex].content = \`[EL USUARIO ENVIÓ UNA FOTO. Análisis de la imagen: \${geminiAnalysisLocal}] \${conversationHistory[lastUserMsgIndex].content}\`;
                               }
                               userMessage = \`FOTO ENVIADA. Análisis visual: \${geminiAnalysisLocal}. \` + userMessage; // Actualizar para que RAG se entere de la foto
`;
code = code.replace(targetPhotoInsert, repPhotoInsert);

// También revertiré a gemini-1.5-flash porque gemini-3.5-flash-lite no existe/es tonto y se salta las reglas largas
code = code.replaceAll('gemini-3.5-flash-lite', 'gemini-1.5-flash');

fs.writeFileSync('src/app/api/orchestrator/route.ts', code, 'utf8');
console.log('Success!');
