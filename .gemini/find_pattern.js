const fs = require('fs');
const content = fs.readFileSync('c:/Users/ADMIN/Downloads/IA trabajaos/Elena Atalier/src/app/admin/pos/page.tsx', 'utf8');
const lines = content.split('\n');
console.log("Searching for customOrderCategory:");
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('customOrderCategory')) {
        console.log(`Line ${i+1}: ${lines[i].trim()}`);
    }
}
