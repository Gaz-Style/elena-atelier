const fs = require('fs');
const path = require('path');

const logsDir = "C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\49a57965-300a-4f63-b733-628097259e92\\.system_generated\\logs";
const transcriptPath = path.join(logsDir, 'transcript.jsonl');

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

const stepsToExtract = [1794, 1808, 1812];

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const step = JSON.parse(line);
        if (stepsToExtract.includes(step.step_index)) {
            console.log(`=== STEP ${step.step_index} ===`);
            if (step.tool_calls) {
                for (const call of step.tool_calls) {
                    console.log(`Tool: ${call.name}`);
                    const args = call.args;
                    fs.writeFileSync(`C:\\Users\\ADMIN\\Downloads\\IA trabajaos\\Elena Atalier\\.gemini\\step_${step.step_index}_call.json`, JSON.stringify(call, null, 2));
                    console.log(`  Saved to step_${step.step_index}_call.json`);
                }
            }
        }
    } catch(e) {}
}
