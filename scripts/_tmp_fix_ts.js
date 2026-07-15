const fs = require('fs');
const path = 'src/app/admin/planificador/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    'const dayHoursArray = [];',
    'const dayHoursArray: number[] = [];'
);

fs.writeFileSync(path, content, 'utf8');
console.log("TS fixed.");
