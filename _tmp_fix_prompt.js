const fs = require('fs');
let code = fs.readFileSync('src/app/api/orchestrator/route.ts', 'utf8');

const targetRule = `4. PRECIOS Y AGENDAMIENTO: Usa el catálogo adjunto. Siempre da precios referenciales con la palabra "desde". Despacho a domicilio en sector oriente cuesta $10.000.`;
const newRule = `4. PRECIOS Y AGENDAMIENTO: ¡NO TIENES PRECIOS MEMORIZADOS! Si el cliente pregunta por el valor de CUALQUIER servicio (bastas, vestidos, despacho a domicilio), ESTÁS OBLIGADA a usar la herramienta 'consultar_precio'. Al entregar un precio devuelto por la herramienta, usa siempre la palabra "desde".`;

if (code.includes(targetRule)) {
    code = code.replace(targetRule, newRule);
    fs.writeFileSync('src/app/api/orchestrator/route.ts', code, 'utf8');
    console.log('Success! Rule updated.');
} else {
    console.log('Error: targetRule not found in code.');
}
