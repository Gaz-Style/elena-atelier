const fs = require('fs');
let content = fs.readFileSync('src/app/admin/pos/page.tsx', 'utf8');

// Find all literal classNames for input/select/textarea
content = content.replace(/<(input|select|textarea)([^>]+)className=(["'])([^"']+)["']/g, (match, tag, before, q, cls) => {
    let newCls = cls;
    newCls = newCls.replace(/\btext-sm\b/g, 'text-base');
    newCls = newCls.replace(/\btext-xs\b/g, 'text-base');
    if (!newCls.includes('text-base') && !newCls.includes('text-lg') && !newCls.includes('text-xl')) {
        newCls += ' text-base';
    }
    if (!newCls.includes('h-11') && !newCls.includes('h-12') && !newCls.includes('h-14') && !newCls.includes('p-3') && !newCls.includes('p-4') && !newCls.includes('min-h-')) {
        newCls += ' min-h-[44px]';
    }
    return `<${tag}${before}className="${newCls}"`;
});

// Also find common template literal classNames like className={`w-full ... ${expr}`}
content = content.replace(/<(input|select|textarea)([^>]+)className=\{`([^`]+)`\}/g, (match, tag, before, cls) => {
    let newCls = cls;
    newCls = newCls.replace(/\btext-sm\b/g, 'text-base');
    newCls = newCls.replace(/\btext-xs\b/g, 'text-base');
    if (!newCls.includes('text-base') && !newCls.includes('text-lg') && !newCls.includes('text-xl')) {
        newCls += ' text-base';
    }
    if (!newCls.includes('h-11') && !newCls.includes('h-12') && !newCls.includes('h-14') && !newCls.includes('p-3') && !newCls.includes('p-4') && !newCls.includes('min-h-')) {
        newCls += ' min-h-[44px]';
    }
    return `<${tag}${before}className={\`${newCls}\`}`;
});

fs.writeFileSync('src/app/admin/pos/page.tsx', content, 'utf8');
console.log('Replaced touch classes on inputs');
