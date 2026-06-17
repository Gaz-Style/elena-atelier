const fs = require('fs');
const path = require('path');

const logsDir = "C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\49a57965-300a-4f63-b733-628097259e92\\.system_generated\\logs";
const transcriptPath = path.join(logsDir, 'transcript.jsonl');

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

console.log("Analyzing steps after 1812...");
for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const step = JSON.parse(line);
        if (step.step_index > 1812) {
            if (step.tool_calls) {
                for (const call of step.tool_calls) {
                    if (call.name === 'run_command') {
                        console.log(`Step ${step.step_index} (${step.created_at}): RUN_COMMAND - ${call.args.CommandLine}`);
                    }
                    if (call.name === 'write_to_file' || call.name === 'replace_file_content' || call.name === 'multi_replace_file_content') {
                        const file = call.args.TargetFile || call.args.Target;
                        if (file && file.includes('pos/page.tsx')) {
                            console.log(`Step ${step.step_index} (${step.created_at}): Edit on ${file} (desc: ${call.args.Description})`);
                        }
                    }
                }
            }
        }
    } catch(e) {}
}
