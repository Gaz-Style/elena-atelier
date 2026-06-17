const fs = require('fs');
const path = require('path');

const logsDir = "C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\49a57965-300a-4f63-b733-628097259e92\\.system_generated\\logs";
const transcriptPath = path.join(logsDir, 'transcript.jsonl');

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

const stepIndices = [788, 792, 835, 841, 883, 938, 942, 946, 980, 984, 986, 1155, 1371, 1547, 1551, 1561, 1794, 1808, 1812, 2187];

console.log("Details of matches:");
for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const step = JSON.parse(line);
        if (stepIndices.includes(step.step_index)) {
            console.log(`Step ${step.step_index}: type=${step.type} created_at=${step.created_at}`);
            if (step.tool_calls) {
                for (const call of step.tool_calls) {
                    console.log(`  Tool: ${call.name} (desc: ${call.args.Description || ''})`);
                }
            }
        }
    } catch(e) {}
}
