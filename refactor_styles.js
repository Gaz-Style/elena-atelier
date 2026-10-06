const fs = require('fs');
let c = fs.readFileSync('src/app/admin/taller-monitor/page.tsx', 'utf8');

const replacements = {
  'bg-[#0f172a]': 'bg-gray-50',
  'bg-[#0c1322]': 'bg-white',
  'bg-slate-800/60': 'bg-white shadow-sm',
  'bg-slate-800/50': 'bg-white shadow-sm',
  'bg-slate-800/40': 'bg-gray-50 shadow-sm',
  'bg-slate-800/30': 'bg-white',
  'border-slate-700/50': 'border-gray-200',
  'border-slate-700/30': 'border-gray-200',
  'border-slate-800/50': 'border-gray-200',
  'text-slate-200': 'text-gray-800',
  'text-white': 'text-gray-900',
  'text-slate-300': 'text-gray-700',
  'text-slate-400': 'text-gray-500',
  'text-slate-500': 'text-gray-500',
  'text-slate-600': 'text-gray-400',
  'bg-slate-700/30': 'bg-gray-50',
  'border-slate-600/30': 'border-gray-200',
  'hover:bg-slate-700/50': 'hover:bg-gray-100',
  'hover:bg-slate-800/30': 'hover:bg-gray-50',
  'hover:text-white': 'hover:text-gray-900',
  'bg-slate-700/50': 'bg-gray-100',
  'bg-slate-700': 'bg-gray-200',
  'bg-white/10': 'bg-gray-900',
  'border-white/20': 'border-gray-900',
  'bg-slate-600/30': 'bg-gray-100',
  'bg-slate-600/50': 'bg-gray-100',
  'bg-slate-600': 'bg-gray-300',
  'text-amber-300': 'text-amber-700',
  'text-blue-300': 'text-blue-700',
  'text-amber-400': 'text-amber-600',
  'text-blue-400': 'text-blue-600',
  'text-emerald-400': 'text-emerald-600',
  'text-rose-400': 'text-rose-600'
};

for (const [key, value] of Object.entries(replacements)) {
  c = c.split(key).join(value);
}

// Fix buttons that need white text on colored backgrounds
c = c.split('text-gray-900 bg-emerald-500').join('text-white bg-emerald-500');
c = c.split('text-gray-900 bg-amber-500').join('text-white bg-amber-500');
c = c.split('text-gray-900 bg-blue-500').join('text-white bg-blue-500');

fs.writeFileSync('src/app/admin/taller-monitor/page.tsx', c);
console.log('Styles updated to light mode successfully.');
