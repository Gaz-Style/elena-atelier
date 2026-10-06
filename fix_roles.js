const fs = require('fs');

let lines = fs.readFileSync('src/app/api/orchestrator/route.ts', 'utf8').split(/\r?\n/);

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const geminiContents = conversationHistory.map(msg => ({')) {
        startIdx = i;
    }
    if (startIdx !== -1 && lines[i].includes('parts: [{ text: msg.content }]')) {
        endIdx = i + 1; // Include the closing '}));'
        break;
    }
}

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find bounds");
    process.exit(1);
}

const newLogic = `                            const rawContents = conversationHistory.map((msg: any) => ({
                                role: msg.role === 'assistant' ? 'model' : 'user',
                                parts: [{ text: msg.content }]
                            }));

                            // Gemini REST API REQUIRES alternating roles. Merge adjacent identical roles.
                            const geminiContents: any[] = [];
                            for (const msg of rawContents) {
                                if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role === msg.role) {
                                    geminiContents[geminiContents.length - 1].parts[0].text += "\\n" + msg.parts[0].text;
                                } else {
                                    geminiContents.push(msg);
                                }
                            }`;

lines.splice(startIdx, endIdx - startIdx + 1, newLogic);
fs.writeFileSync('src/app/api/orchestrator/route.ts', lines.join('\n'));
console.log("Success");
