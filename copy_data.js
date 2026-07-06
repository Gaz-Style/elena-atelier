const fs = require('fs');
const path = require('path');

const gradPath = path.join(__dirname, 'src', 'lib', 'graduacion-data.ts');
const fiestaPath = path.join(__dirname, 'src', 'lib', 'fiesta-data.ts');

let content = fs.readFileSync(gradPath, 'utf8');

// Replace BASE
content = content.replace(/const BASE = ['"].*?['"];/g, "const BASE = '/trabajos/fiesta';");

// Replace array export name
content = content.replace(/export const vestidos: Vestido\[\] =/g, 'export const vestidosFiesta: Vestido[] =');

fs.writeFileSync(fiestaPath, content);
console.log('Successfully copied real descriptions to fiesta-data.ts');
