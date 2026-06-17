const fs = require('fs');
const path = 'c:/Users/ADMIN/Downloads/IA trabajaos/Elena Atalier/src/app/admin/pos/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldTemplates = fs.readFileSync('c:/Users/ADMIN/Downloads/IA trabajaos/Elena Atalier/.gemini/scratch/old_templates.js', 'utf8');

const startIdx = content.indexOf('const DEFAULT_HC_TEMPLATES = [');
const endIdx = content.indexOf('];', startIdx);

if (startIdx > -1 && endIdx > -1) {
    content = content.substring(0, startIdx) + oldTemplates + content.substring(endIdx + 2);
}

const currentCarousel = \                                    <div
                                        key={tpl.id}
                                        onClick={() => handleApplyTemplate(tpl)}
                                        className={\\\elative bg-white border rounded-md p-3 min-w-[120px] w-[120px] text-center cursor-pointer transition-all group flex flex-col items-center justify-between shadow-sm min-h-[110px] \\\\\\}\n                                    >\n                                        <div className="h-14 w-full flex items-center justify-center mb-1.5 overflow-hidden rounded">\n                                            {tpl.img ? (\n                                                <img src={tpl.img} alt={tpl.name} className="h-full w-auto object-contain" />\n                                            ) : (\n                                                <div className="w-10 h-10 bg-neutral-200 rounded flex items-center justify-center text-neutral-400">\n                                                    <Package className="w-5 h-5" />\n                                                </div>\n                                            )}\n                                        </div>\n                                        <p className="text-[10px] md:text-xs text-brand-charcoal font-bold truncate w-full">{tpl.name}</p>\;

const newCarousel = \                                    <div
                                        key={tpl.id}
                                        onClick={() => handleApplyTemplate(tpl)}
                                        className={\\\elative bg-white border rounded-md p-3 min-w-[120px] w-[120px] text-center cursor-pointer transition-all group flex flex-col items-center justify-between shadow-sm min-h-[110px] \\\\\\}\n                                    >\n                                        <div \n                                            className="h-16 w-full flex items-center justify-center mb-1.5 text-brand-charcoal hover:text-brand-terracotta transition-colors"\n                                            dangerouslySetInnerHTML={{ __html: tpl.svg || tpl.img }}\n                                        />\n                                        <p className="text-[10px] md:text-xs text-brand-charcoal font-bold truncate w-full">{tpl.name}</p>\;

if (content.indexOf(currentCarousel) > -1) {
    content = content.replace(currentCarousel, newCarousel);
    console.log("Carousel restored!");
} else {
    console.log("Carousel match not found, proceeding with fallback regex");
    content = content.replace(/<div className="h-14 w-full flex items-center justify-center mb-1\.5 overflow-hidden rounded">[\s\S]*?<\/div>\s*<\/div>\s*<p className="text-\[10px\] md:text-xs text-brand-charcoal font-bold truncate w-full">\{tpl\.name\}<\/p>/, \<div className="h-16 w-full flex items-center justify-center mb-1.5 text-brand-charcoal hover:text-brand-terracotta transition-colors" dangerouslySetInnerHTML={{ __html: tpl.svg || tpl.img }} />\\n                                        <p className="text-[10px] md:text-xs text-brand-charcoal font-bold truncate w-full">{tpl.name}</p>\);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Restoration complete!');
