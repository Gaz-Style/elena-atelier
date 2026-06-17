const fs = require('fs');
const path = require('path');

const logsDir = "C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\49a57965-300a-4f63-b733-628097259e92\\.system_generated\\logs";
const transcriptPath = path.join(logsDir, 'transcript.jsonl');

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const step = JSON.parse(line);
        if (step.step_index === 792) {
            console.log("Found step 792 content length: " + (step.content ? step.content.length : 'undefined'));
            if (step.tool_calls) {
                for (const call of step.tool_calls) {
                    console.log(`Tool: ${call.name}`);
                    const repl = call.args.ReplacementContent || '';
                    fs.writeFileSync(`C:\\Users\\ADMIN\\Downloads\\IA trabajaos\\Elena Atalier\\.gemini\\step_792_replacement.txt`, repl);
                    console.log("Saved replacement content to step_792_replacement.txt");
                }
            }
        }
    } catch(e) {}
}
