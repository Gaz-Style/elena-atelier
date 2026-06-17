const fs = require('fs');
const path = require('path');

const logsDir = "C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\49a57965-300a-4f63-b733-628097259e92\\.system_generated\\logs";
const transcriptPath = path.join(logsDir, 'transcript.jsonl');

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const step = JSON.parse(line);
        if (step.step_index === 1972) {
            console.log("Found step 1972 content length: " + (step.content ? step.content.length : 'undefined'));
            console.log("Is content truncated?: " + (step.content && step.content.includes('truncated') ? 'yes' : 'no'));
            if (step.content) {
                fs.writeFileSync(`C:\\Users\\ADMIN\\Downloads\\IA trabajaos\\Elena Atalier\\.gemini\\step_1972_content.txt`, step.content);
            }
        }
    } catch(e) {}
}
