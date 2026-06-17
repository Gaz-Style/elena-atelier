const { execSync } = require('child_process');
try {
    const output = execSync('git show HEAD:src/app/admin/pos/page.tsx', { encoding: 'utf8', cwd: 'c:/Users/ADMIN/Downloads/IA trabajaos/Elena Atalier' });
    console.log("HEAD has DEFAULT_HC_TEMPLATES: " + output.includes('DEFAULT_HC_TEMPLATES'));
    console.log("HEAD has isAiCalculatorModalOpen: " + output.includes('isAiCalculatorModalOpen'));
} catch (e) {
    console.error(e);
}
