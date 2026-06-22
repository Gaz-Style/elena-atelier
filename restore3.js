const fs = require('fs');
let c = fs.readFileSync('src/app/admin/pos/page.tsx', 'utf8');
let backup = fs.readFileSync('modal_backup.txt', 'utf8');

const parts = backup.split('\n\n').filter(p => p.trim() !== '');

if (parts.length >= 2) {
    let part1 = JSON.parse(parts[0]); 
    let part2 = JSON.parse(parts[1]); 
    
    if (!c.includes('isTimeSettingsModalOpen')) {
        c = c.replace(/const \[hcBaseHours, setHcBaseHours\] = useState\(0\);/, 'const [hcBaseHours, setHcBaseHours] = useState(0);\n    const [isTimeSettingsModalOpen, setIsTimeSettingsModalOpen] = useState(false);\n    const [timeSettingsTab, setTimeSettingsTab] = useState(\'defaults\');');
    }

    if (!c.includes('Ajustar Tiempos de Taller')) {
        c = c.replace(/<button onClick=\{\(\) => setIsHauteCoutureModalOpen\(false\)\} className="text-gray-400 hover:text-brand-charcoal bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-all">\s*<X className="w-5 h-5" \/>\s*<\/button>/, part1);
    }
    
    if (!c.includes('Tiempos de Taller')) {
        c = c.replace(/\{\/\* Modal de Calculadora de Alta Costura \*\/\}/, part2 + '\n\n            {/* Modal de Calculadora de Alta Costura */}');
    }
    
    // Convert || to ?? inside value={timeSettings...} in the modal string
    c = c.replace(/value=\{([^\}]+)\}/g, (match, p1) => {
        if (p1.includes('timeSettings')) {
            return `value={${p1.replace(/\|\|/g, '??')}}`;
        }
        return match;
    });

    fs.writeFileSync('src/app/admin/pos/page.tsx', c);
    console.log('Restored modal!');
} else {
    console.log('Not enough parts found.');
}
