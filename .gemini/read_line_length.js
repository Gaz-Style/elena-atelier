const fs = require('fs');
const path = require('path');

const logsDir = "C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\49a57965-300a-4f63-b733-628097259e92\\.system_generated\\logs";
const transcriptPath = path.join(logsDir, 'transcript.jsonl');

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const step = JSON.parse(line);
        if (step.step_index === 1812) {
            console.log("Step 1812 raw line length: " + line.length);
        }
    } catch(e) {}
}
