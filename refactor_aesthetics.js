const fs = require('fs');
let content = fs.readFileSync('src/app/admin/pos/page.tsx', 'utf8');

// 1. Aesthetics: Soft borders
content = content.replace(/border-gray-200/g, 'border-zinc-100');
content = content.replace(/border-zinc-200(\/80|\/50)?/g, 'border-zinc-100');

// 2. Geometry: More rounded corners on major cards
// It's safer to target specific cards like "bg-white border border-zinc-100 shadow-sm rounded-xl p-6"
// Let's globally replace rounded-xl with rounded-2xl to give a softer look to cards and big buttons
content = content.replace(/rounded-xl/g, 'rounded-2xl');

// 3. Elevation: Soft premium shadow on cards
// Replace standard shadow-sm or shadow-md on white cards with the requested shadow
content = content.replace(/shadow-sm/g, 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]');

// 4. Air and Spacing
// Change padding on cards from p-6 to p-8
content = content.replace(/p-6/g, 'p-8');
// Change vertical spacing from space-y-6 to space-y-8
content = content.replace(/space-y-6/g, 'space-y-8');

// 5. Typography: Titles (font-semibold -> font-medium)
content = content.replace(/font-semibold text-zinc-900/g, 'font-medium text-zinc-900 tracking-tight');
// Sometimes it's just font-semibold
content = content.replace(/font-semibold/g, 'font-medium');

// 6. Typography: Descriptions (remove uppercase, tracking-widest, etc.)
// Replace specific messy styles like "text-[10px] uppercase text-zinc-400 font-bold tracking-widest"
// or "text-[10px] uppercase tracking-widest text-zinc-400 font-medium"
content = content.replace(/text-\[10px\] uppercase[^"]*tracking-widest/g, 'text-xs font-normal text-zinc-400 tracking-normal');
content = content.replace(/text-\[10px\] font-bold uppercase tracking-widest/g, 'text-xs font-medium text-zinc-600 tracking-normal');
content = content.replace(/uppercase text-xs font-bold tracking-wider/g, 'text-xs font-medium tracking-normal');

// 7. Touch classes we added might have been "text-[10px]" on buttons, let's clean them.
content = content.replace(/text-\[10px\]/g, 'text-xs');

fs.writeFileSync('src/app/admin/pos/page.tsx', content, 'utf8');
console.log('Aesthetic refactor script completed successfully.');
