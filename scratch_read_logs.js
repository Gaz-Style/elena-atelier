const fs = require('fs');
const path = 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\8cbb6dd2-9963-4d1d-a8c0-86ae0db10172\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(path, 'utf-8').split('\n');
console.log(`Total lines in log: ${lines.length}`);

lines.forEach((line, index) => {
    if (!line.trim()) return;
    try {
        const obj = JSON.parse(line);
        if (obj.type === 'USER_INPUT' || obj.source === 'USER_EXPLICIT') {
            console.log(`\n--- STEP ${obj.step_index} ---`);
            console.log(obj.content || (obj.tool_calls ? JSON.stringify(obj.tool_calls) : ''));
        }
    } catch (e) {}
});
