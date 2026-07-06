const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'graduacion-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('imagenesExtra?: string[];', 'imagenesExtra?: string[];\n  precio: number;');

// Regex to find each object and add `precio: 450000,` just before the closing brace `  },`
content = content.replace(/(\n  \},)/g, '\n    precio: 450000,$1');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated prices successfully.');
