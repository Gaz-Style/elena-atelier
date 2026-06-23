const fs = require('fs');
const lines = fs.readFileSync('src/app/admin/pos/page.tsx', 'utf8').split('\n');
let inSelect = false;
let start = 0;
let block = '';
for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('<select')) {
        inSelect = true;
        start = i + 1;
        block = '';
    }
    if (inSelect) {
        block += lines[i] + '\n';
        if (lines[i].includes('</select>')) {
            inSelect = false;
            console.log('--- START ' + start + ' ---');
            console.log(block.trim());
        }
    }
}
