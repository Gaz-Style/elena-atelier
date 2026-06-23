const fs = require('fs');
let content = fs.readFileSync('src/app/admin/pos/page.tsx', 'utf8');

// The replacements we applied earlier, swapped so we revert back
const replacements = [
{
replacement: `<select className="w-auto border-none bg-transparent shadow-none focus:ring-0 px-2 text-xs font-medium min-h-[44px] border-r border-zinc-100 rounded-none cursor-pointer outline-none" value="56" onChange={() => {}}>
                                                    <option value="56">🇨🇱 +56</option>
                                                    <option value="54">🇦🇷 +54</option>
                                                    <option value="55">🇧🇷 +55</option>
                                                    <option value="51">🇵🇪 +51</option>
                                                    <option value="1">🇺🇸 +1</option>
                                                </select>`,
targetRegex: /<Select defaultValue="56">[\s\S]*?<\/Select>/
},
{
replacement: `<select
                                        value={assignedOperatorId || "unassigned"}
                                        onChange={(e) => handleOperatorSelection(e.target.value === "unassigned" ? "" : e.target.value, null, selectedCatalogProduct ? Number(selectedCatalogProduct.estimated_hours || 2) : (Number(hoursEstimated) || 2))}
                                        className="w-full h-11 px-4 text-sm font-medium bg-white border border-zinc-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-100 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)] cursor-pointer"
                                    >
                                        <option value="unassigned" disabled>-- Selecciona Costurera o Taller --</option>
                                        {operators.map((op: any) => (
                                            <option key={op.id} value={op.id}>
                                                {op.name} ({op.daily_hours_capacity}h por día)
                                            </option>
                                        ))}
                                    </select>`,
targetRegex: /<Select key={`op-\${operators\.length}`} value={assignedOperatorId \|\| "unassigned"}[\s\S]*?<\/Select>/
},
{
replacement: `<select value={customOrderCategory} onChange={(e) => setCustomOrderCategory(e.target.value)} className="w-full h-11 px-4 text-sm font-medium bg-white border border-zinc-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-100 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)] cursor-pointer">
                                        <option value="" disabled>Seleccionar...</option>
                                        <option value="Diseño y confección">Diseño y confección</option>
                                        <option value="Arreglos especializados">Arreglos especializados</option>
                                        <option value="Catálogo de servicios">Catálogo de servicios</option>
                                    </select>`,
targetRegex: /<Select value={customOrderCategory} onValueChange={setCustomOrderCategory}>[\s\S]*?<\/Select>/
},
{
replacement: `<select 
                                                value={selectedCatalogCategory || "none"} 
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setSelectedCatalogCategory(val === "none" ? "" : val);
                                                    setSelectedCatalogProduct(null);
                                                }} 
                                                className="w-full h-11 px-4 text-sm font-medium bg-white border border-zinc-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-100 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)] cursor-pointer"
                                            >
                                                <option value="none">-- Seleccionar Subcategoría --</option>
                                                {Array.from(new Set(products.map(p => p.category))).sort().map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>`,
targetRegex: /<Select key={`cat-\${products\.length}`} value={selectedCatalogCategory \|\| "none"}[\s\S]*?<\/Select>/
},
{
replacement: `<select 
                                                disabled={!selectedCatalogCategory}
                                                value={selectedCatalogProduct ? selectedCatalogProduct.id.toString() : "none"} 
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const found = products.find(p => p.id.toString() === val || p.id === Number(val));
                                                    setSelectedCatalogProduct(found || null);
                                                }} 
                                                className="w-full h-11 px-4 text-sm font-medium bg-white border border-zinc-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-100 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                <option value="none">
                                                    {!selectedCatalogCategory 
                                                        ? 'Primero seleccione una subcategoría...' 
                                                        : '-- Seleccionar Servicio --'}
                                                </option>
                                                {products
                                                    .filter(p => p.category === selectedCatalogCategory)
                                                    .sort((a, b) => a.name.localeCompare(b.name))
                                                    .map(p => (
                                                        <option key={p.id} value={p.id.toString()}>
                                                            {p.name} ({formatCurrency(p.price)})
                                                        </option>
                                                    ))
                                                }
                                            </select>`,
targetRegex: /<Select key={`prod-\${products\.length}`} disabled={!selectedCatalogCategory} value={selectedCatalogProduct \? selectedCatalogProduct\.id\.toString\(\) : "none"}[\s\S]*?<\/Select>/
},
{
replacement: `<select
                                                value={item.assignedOperatorId || 'unassigned'}
                                                onChange={(e) => handleOperatorSelection(e.target.value, i, Number(item.estimatedHours || 2))}
                                                className="flex-1 h-9 px-3 text-xs font-medium bg-white border border-zinc-200/50 rounded-xl outline-none focus:ring-2 focus:ring-zinc-100 shadow-sm transition-all cursor-pointer"
                                            >
                                                <option value="unassigned">Sin asignar (Taller)</option>
                                                {operators.map((op: any) => (
                                                    <option key={op.id} value={op.id}>
                                                        {op.name} ({op.daily_hours_capacity}h/d)
                                                    </option>
                                                ))}
                                            </select>`,
targetRegex: /<Select value={item\.assignedOperatorId \|\| 'unassigned'} onValueChange={\(val\) => handleOperatorSelection\(val, i, Number\(item\.estimatedHours \|\| 2\)\)}>[\s\S]*?<\/Select>/
},
{
replacement: `<select value={hcPatternType} onChange={(e) => setHcPatternType(e.target.value)} className="w-full h-11 px-4 text-sm font-medium bg-white border border-zinc-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-100 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)] cursor-pointer">
                                        <option value="existing">Base existente (más rápido)</option>
                                        <option value="custom">Desde cero (patronaje propio)</option>
                                        <option value="draping">Drapeado sobre maniquí</option>
                                    </select>`,
targetRegex: /<Select value={hcPatternType} onValueChange={setHcPatternType}>[\s\S]*?<\/Select>/
},
{
replacement: `<select value={hcTextileDifficulty} onChange={(e) => setHcTextileDifficulty(e.target.value)} className="w-full h-11 px-4 text-sm font-medium bg-white border border-zinc-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-100 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)] cursor-pointer">
                                        <option value="easy">Fácil (algodón, lino)</option>
                                        <option value="medium">Media (seda sintética, jersey)</option>
                                        <option value="hard">Difícil (terciopelo, seda natural)</option>
                                        <option value="haute">Haute (pedrería, encaje complejo)</option>
                                    </select>`,
targetRegex: /<Select value={hcTextileDifficulty} onValueChange={setHcTextileDifficulty}>[\s\S]*?<\/Select>/
}
];

let replaced = 0;
replacements.forEach(r => {
    if (r.targetRegex.test(content)) {
        content = content.replace(r.targetRegex, r.replacement);
        replaced++;
    } else {
        console.log("Could not find match for: " + String(r.targetRegex));
    }
});

fs.writeFileSync('src/app/admin/pos/page.tsx', content, 'utf8');
console.log('Reverted ' + replaced + ' selects');
