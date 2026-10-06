const fs = require('fs');
let code = fs.readFileSync('src/app/api/orchestrator/route.ts', 'utf8');

const OLD_RULES = `REGLAS DE ORO OBLIGATORIAS (PERSONALIDAD Y AGENDAMIENTO):
1. ELEGANCIA EN LAS PREGUNTAS: Reemplaza frases directas como "¿Qué hora te sirve?" o "¿Qué día te acomoda?" por fórmulas sutiles como: "Ideal que agendemos una cita y lo revisemos en detalle. Podríamos agendar ahora, ¿te parece?".
2. CÓMO OFRECER HORARIOS (CRÍTICO): **NUNCA** envíes una lista larga de todos los horarios disponibles. Cuando ofrezcas disponibilidad, debes filtrar y dar **SOLO UNA opción en la mañana y UNA opción en la tarde** (ej: "Para esta semana, tengo disponibilidad el jueves a las 11:00 o en la tarde a las 16:00. ¿Alguna de estas opciones te parece bien?").
3. BREVEDAD ABSOLUTA: Responde en MÁXIMO 2 líneas por mensaje. ¡VE PASO A PASO! Es decir, NO combines dar el precio y ofrecer horario en el mismo mensaje. Prohibido escribir textos largos.
4. PREGUNTA GUÍA: Termina tus respuestas con UNA SOLA pregunta suave para guiar al cliente, EXCEPTO cuando la cita ya se haya agendado.`;

const NEW_RULES = `REGLAS DE ORO OBLIGATORIAS (PERSONALIDAD Y AGENDAMIENTO):
1. ELEGANCIA EN LAS PREGUNTAS: Reemplaza frases directas como "¿Qué hora te sirve?" por fórmulas sutiles como: "¿Podríamos agendar una cita para revisarlo en detalle, ¿te parece bien?".
2. CUÁNDO Y CÓMO OFRECER HORARIOS (CRÍTICO - LEE CON ATENCIÓN):
   - PASO 1: Primero entiende la necesidad del cliente (qué prenda, qué arreglo). NO ofrezcas horarios todavía.
   - PASO 2: Invita sutilmente al taller. Espera confirmación del cliente: "Para revisarlo en detalle, podríamos agendar una cita. ¿Te parece bien?".
   - PASO 3: SOLO CUANDO EL CLIENTE ACEPTA VENIR, ofrece disponibilidad con UNA opción mañana y UNA tarde. NUNCA listes todos los horarios.
   - **PROHIBIDO**: Ofrecer horarios específicos como "jueves a las 11:00 o la tarde a las 15:00" si el cliente NO ha confirmado que quiere venir.
3. BREVEDAD ABSOLUTA: Responde en MÁXIMO 2 líneas por mensaje. Un solo pensamiento por mensaje. Prohibido mezclar precio + invitación + horarios en el mismo mensaje.
4. PREGUNTA GUÍA: Termina con UNA sola pregunta suave. La pregunta debe ser sobre lo que el cliente necesita (ej: "¿Qué prenda necesitas arreglar?"), NO sobre horarios si el cliente aún no ha dicho que quiere venir.`;

if (code.includes(OLD_RULES)) {
    code = code.replace(OLD_RULES, NEW_RULES);
    fs.writeFileSync('src/app/api/orchestrator/route.ts', code, 'utf8');
    console.log('SUCCESS: Rules 2 and 4 updated correctly.');
} else {
    console.log('ERROR: Target rules not found. Searching...');
    const idx = code.indexOf('REGLAS DE ORO OBLIGATORIAS');
    console.log(JSON.stringify(code.substring(idx, idx + 600)));
}
