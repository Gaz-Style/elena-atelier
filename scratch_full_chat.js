const fs = require('fs');
const path = 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\8cbb6dd2-9963-4d1d-a8c0-86ae0db10172\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(path, 'utf-8').split('\n');
console.log(`=== FULL CHAT REVISION (LAST 10 HOURS) ===\n`);

lines.forEach((line) => {
    if (!line.trim()) return;
    try {
        const obj = JSON.parse(line);
        if (obj.type === 'USER_INPUT' || obj.source === 'USER_EXPLICIT') {
            const content = obj.content || '';
            if (content.length > 0) {
                console.log(`[STEP ${obj.step_index}] USER: ${content.substring(0, 300)}`);
            }
        }
    } catch (e) {}
});
