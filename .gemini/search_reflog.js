const { execSync } = require('child_process');

try {
    const reflog = execSync('git reflog show --date=relative -n 150', { encoding: 'utf8', cwd: 'c:/Users/ADMIN/Downloads/IA trabajaos/Elena Atalier' });
    const lines = reflog.split('\n');
    for (const line of lines) {
        if (!line.trim()) continue;
        const commitHash = line.split(' ')[0];
        try {
            const showOutput = execSync(`git show ${commitHash}:src/app/admin/pos/page.tsx`, { encoding: 'utf8', cwd: 'c:/Users/ADMIN/Downloads/IA trabajaos/Elena Atalier', stdio: [] });
            if (showOutput.includes('DEFAULT_HC_TEMPLATES')) {
                console.log(`Commit ${commitHash} HAS DEFAULT_HC_TEMPLATES! Line: ${line}`);
            }
        } catch(e) {}
    }
    console.log("Reflog search complete.");
} catch(e) {
    console.error(e);
}
