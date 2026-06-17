const fs = require('fs');

const steps = [1794, 1808, 1812];

for (const stepIndex of steps) {
    try {
        const fileContent = fs.readFileSync(`C:\\Users\\ADMIN\\Downloads\\IA trabajaos\\Elena Atalier\\.gemini\\step_${stepIndex}_call.json`, 'utf8');
        const parsed = JSON.parse(fileContent);
        const args = parsed.args;
        console.log(`\n===================== STEP ${stepIndex} =====================`);
        console.log(`Description: ${args.Description}`);
        console.log(`StartLine: ${args.StartLine}, EndLine: ${args.EndLine}`);
        
        // Let's check if the TargetContent or ReplacementContent contains "truncated" or if they are complete
        const targetTrunc = args.TargetContent.includes('truncated');
        const replaceTrunc = args.ReplacementContent.includes('truncated');
        console.log(`TargetContent length: ${args.TargetContent.length} (Truncated in log?: ${targetTrunc})`);
        console.log(`ReplacementContent length: ${args.ReplacementContent.length} (Truncated in log?: ${replaceTrunc})`);
        
        // Write the contents to separate files so we can review them
        fs.writeFileSync(`C:\\Users\\ADMIN\\Downloads\\IA trabajaos\\Elena Atalier\\.gemini\\step_${stepIndex}_target.txt`, args.TargetContent);
        fs.writeFileSync(`C:\\Users\\ADMIN\\Downloads\\IA trabajaos\\Elena Atalier\\.gemini\\step_${stepIndex}_replacement.txt`, args.ReplacementContent);
    } catch(e) {
        console.error(`Error processing step ${stepIndex}:`, e);
    }
}
