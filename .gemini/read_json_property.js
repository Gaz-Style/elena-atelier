const fs = require('fs');
const json = JSON.parse(fs.readFileSync('C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\49a57965-300a-4f63-b733-628097259e92\\scratch\\step_1860_call.json', 'utf8'));
const call = json.tool_calls[0];
console.log("--- REPLACEMENT CONTENT ---");
console.log(call.args.ReplacementContent);
console.log("--- TARGET CONTENT ---");
console.log(call.args.TargetContent);
