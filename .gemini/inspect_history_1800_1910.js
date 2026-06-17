const fs = require('fs');
const path = require('path');

const logsDir = "C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\49a57965-300a-4f63-b733-628097259e92\\.system_generated\\logs";
const transcriptPath = path.join(logsDir, 'transcript.jsonl');

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

console.log("Analyzing steps 1800 to 1910...");
for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const step = JSON.parse(line);
        if (step.step_index >= 1800 && step.step_index <= 1910) {
            console.log(`Step ${step.step_index}: type=${step.type} source=${step.source} created_at=${step.created_at}`);
            if (step.type === 'USER_INPUT') {
                console.log(`  USER_INPUT: ${step.content}`);
            }
            if (step.tool_calls) {
                for (const call of step.tool_calls) {
                    console.log(`  Tool: ${call.name}`);
                    if (call.args.Description) {
                        console.log(`    Description: ${call.args.Description}`);
                    }
                    if (call.args.TargetFile || call.args.Target) {
                        console.log(`    TargetFile: ${call.args.TargetFile || call.args.Target}`);
                    }
                    if (call.name === 'run_command') {
                        console.log(`    CommandLine: ${call.args.CommandLine}`);
                    }
                }
            }
        }
    } catch(e) {}
}
