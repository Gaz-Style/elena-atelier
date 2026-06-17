const fs = require('fs');
const path = require('path');

const logsDir = "C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\49a57965-300a-4f63-b733-628097259e92\\.system_generated\\logs";
const transcriptPath = path.join(logsDir, 'transcript.jsonl');

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

console.log("Searching for hours computation in logs...");
for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const step = JSON.parse(line);
        const text = JSON.stringify(step);
        if (text.includes('hours') && (text.includes('molderia') || text.includes('tela')) && (text.includes('canvas') || text.includes('lining'))) {
            if (step.tool_calls) {
                for (const call of step.tool_calls) {
                    if (call.name === 'replace_file_content' || call.name === 'multi_replace_file_content') {
                        const repl = call.args.ReplacementContent || '';
                        if (repl.includes('hours') || repl.includes('horas') || repl.includes('const ')) {
                            console.log(`Step ${step.step_index}:`);
                            // Print occurrences of hours/price calculations
                            const matches = repl.split('\n').filter(l => l.includes('Hours') || l.includes('Cost') || l.includes('Price') || l.includes('horas') || l.includes('horasTotales'));
                            matches.forEach(m => console.log('  ' + m.trim()));
                        }
                    }
                }
            }
        }
    } catch(e) {}
}
