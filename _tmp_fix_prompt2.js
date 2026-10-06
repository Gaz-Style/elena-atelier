const fs = require('fs');
let code = fs.readFileSync('src/app/api/orchestrator/route.ts', 'utf8');

// Fix contradictions in the prompt where it accidentally uses the forbidden phrase "¿te acomoda?"
code = code.replace('¿Qué día te acomoda?"', '¿Cuándo podríamos agendar?"');
code = code.replace('¿Alguna te acomoda?"', '¿Alguna de estas opciones te parece bien?"');

// Fix the duplicated numbering (1,2,3,4,3,4,5,6)
const oldRules = `3. BREVEDAD ABSOLUTA: Responde en MÁXIMO 2 o 3 líneas por mensaje. Prohibido escribir textos largos.
4. PREGUNTA GUÍA: Termina tus respuestas con una pregunta suave para guiar al cliente hacia el agendamiento, EXCEPTO cuando la cita ya se haya agendado.
3. VOCABULARIO CHILENO: Prohibido decir "bastilla" (usa "basta"), "cremallera" (usa "cierre"). Usa lenguaje natural de Chile.
4. PRECIOS Y AGENDAMIENTO:`;

const newRules = `3. BREVEDAD ABSOLUTA: Responde en MÁXIMO 2 líneas por mensaje. ¡VE PASO A PASO! Es decir, NO combines dar el precio y ofrecer horario en el mismo mensaje. Prohibido escribir textos largos.
4. PREGUNTA GUÍA: Termina tus respuestas con UNA SOLA pregunta suave para guiar al cliente, EXCEPTO cuando la cita ya se haya agendado.
5. VOCABULARIO CHILENO: Prohibido decir "bastilla" (usa "basta"), "cremallera" (usa "cierre"). Usa lenguaje natural de Chile.
6. PRECIOS Y AGENDAMIENTO:`;

code = code.replace(oldRules, newRules);

code = code.replace('5. TOMA DE DATOS Y AGENDA:', '7. TOMA DE DATOS Y AGENDA:');
code = code.replace('6. DERIVACIÓN:', '8. DERIVACIÓN:');
code = code.replace('7. CONTACTO POSTERIOR (RECORDATORIO):', '9. CONTACTO POSTERIOR (RECORDATORIO):');
code = code.replace('8. FOTOS Y VISIÓN (¡MUY IMPORTANTE!):', '10. FOTOS Y VISIÓN (¡MUY IMPORTANTE!):');
code = code.replace('9. SERVICIO A DOMICILIO:', '11. SERVICIO A DOMICILIO:');

fs.writeFileSync('src/app/api/orchestrator/route.ts', code, 'utf8');
console.log('Fixed numbering and contradictions.');
