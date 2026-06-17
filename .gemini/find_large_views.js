const fs = require('fs');
const path = require('path');

const logsDir = "C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\49a57965-300a-4f63-b733-628097259e92\\.system_generated\\logs";
const transcriptPath = path.join(logsDir, 'transcript.jsonl');

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

let maxLen = 0;
let maxStep = null;

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const step = JSON.parse(line);
        if (step.content && step.content.length > maxLen && step.content.includes('DEFAULT_HC_TEMPLATES')) {
            maxLen = step.content.length;
            maxStep = step;
        }
    } catch(e) {}
}

if (maxStep) {
    console.log(`Max Step: ${maxStep.step_index} with length ${maxLen}`);
    fs.writeFileSync(`C:\\Users\\ADMIN\\Downloads\\IA trabajaos\\Elena Atalier\\.gemini\\max_step_content.txt`, maxStep.content);
} else {
    console.log("No step found containing DEFAULT_HC_TEMPLATES in content.");
}
