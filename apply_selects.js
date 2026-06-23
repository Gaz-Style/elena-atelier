const fs = require('fs');
let content = fs.readFileSync('src/app/admin/pos/page.tsx', 'utf8');

// Normalize CRLF to LF for reliable string matching
content = content.replace(/\r\n/g, '\n');

const replacements = [
{
target: `<select className="bg-transparent border-r border-zinc-100 p-2 text-xs uppercase font-bold outline-none cursor-pointer text-gray-600 text-base min-h-[44px]">
                                                    <option value="56">🇨🇱 +56</option>
                                                    <option value="54">🇦🇷 +54</option>
                                                    <option value="55">🇧🇷 +55</option>
                                                    <option value="51">🇵🇪 +51</option>
                                                    <option value="1">🇺🇸 +1</option>
                                                </select>`,
replacement: `<Select defaultValue="56">
                                                    <SelectTrigger className="w-auto border-none bg-transparent shadow-none focus:ring-0 px-2 text-xs font-medium min-h-[44px] border-r border-zinc-100 rounded-none">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="56">🇨🇱 +56</SelectItem>
                                                        <SelectItem value="54">🇦🇷 +54</SelectItem>
                                                        <SelectItem value="55">🇧🇷 +55</SelectItem>
                                                        <SelectItem value="51">🇵🇪 +51</SelectItem>
                                                        <SelectItem value="1">🇺🇸 +1</SelectItem>
                                                    </SelectContent>
                                                </Select>`
},
{
target: `<select
                                        value={assignedOperatorId}
                                        onChange={(e) => handleOperatorSelection(e.target.value, null, selectedCatalogProduct ? Number(selectedCatalogProduct.estimated_hours || 2) : (Number(hoursEstimated) || 2))}
                                        className="w-full p-3 text-sm font-medium bg-gray-50 border border-zinc-100 rounded-sm outline-none focus:border-brand-terracotta transition-colors"
                                    >
                                        <option value="" disabled>-- Selecciona Costurera o Taller General --</option>
                                        {operators.map((op: any) => (
                                            <option key={op.id} value={op.id}>
                                                {op.name} ({op.daily_hours_capacity}h por día)
                                            </option>
                                        ))}
                                    </select>`,
replacement: `<Select value={assignedOperatorId || "unassigned"} onValueChange={(val) => handleOperatorSelection(val === "unassigned" ? "" : val, null, selectedCatalogProduct ? Number(selectedCatalogProduct.estimated_hours || 2) : (Number(hoursEstimated) || 2))}>
                                        <SelectTrigger className="w-full h-11 px-4 text-base font-medium bg-white border border-zinc-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-100 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                                            <SelectValue placeholder="-- Selecciona Costurera o Taller --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">-- Selecciona Costurera o Taller --</SelectItem>
                                            {operators.map((op: any) => (
                                                <SelectItem key={op.id} value={op.id}>
                                                    {op.name} ({op.daily_hours_capacity}h por día)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>`
},
{
target: `<select value={customOrderCategory} onChange={(e) => setCustomOrderCategory(e.target.value)} className="w-full p-3 text-sm bg-gray-50 border border-zinc-100 rounded-sm outline-none focus:border-brand-terracotta">
                                        <option value="Diseño y confección">Diseño y confección</option>
                                        <option value="Arreglos especializados">Arreglos especializados</option>
                                        <option value="Catálogo de servicios">Catálogo de servicios</option>
                                    </select>`,
replacement: `<Select value={customOrderCategory} onValueChange={setCustomOrderCategory}>
                                        <SelectTrigger className="w-full h-11 px-4 text-base font-medium bg-white border border-zinc-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-100 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Diseño y confección">Diseño y confección</SelectItem>
                                            <SelectItem value="Arreglos especializados">Arreglos especializados</SelectItem>
                                            <SelectItem value="Catálogo de servicios">Catálogo de servicios</SelectItem>
                                        </SelectContent>
                                    </Select>`
},
{
target: `<select 
                                                value={selectedCatalogCategory} 
                                                onChange={(e) => {
                                                    setSelectedCatalogCategory(e.target.value);
                                                    setSelectedCatalogProduct(null);
                                                }} 
                                                className="w-full p-3 text-sm bg-gray-50 border border-zinc-100 rounded-sm outline-none focus:border-brand-terracotta cursor-pointer font-medium transition-all"
                                            >
                                                <option value="">-- Seleccionar Subcategoría --</option>
                                                {Array.from(new Set(products.map(p => p.category))).sort().map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>`,
replacement: `<Select value={selectedCatalogCategory || "none"} onValueChange={(val) => {
                                                    setSelectedCatalogCategory(val === "none" ? "" : val);
                                                    setSelectedCatalogProduct(null);
                                                }}>
                                                <SelectTrigger className="w-full h-11 px-4 text-base font-medium bg-white border border-zinc-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-100 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                                                    <SelectValue placeholder="-- Seleccionar Subcategoría --" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">-- Seleccionar Subcategoría --</SelectItem>
                                                    {Array.from(new Set(products.map(p => p.category))).sort().map(cat => (
                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>`
},
{
target: `<select 
                                                disabled={!selectedCatalogCategory}
                                                value={selectedCatalogProduct ? selectedCatalogProduct.id : ''} 
                                                onChange={(e) => {
                                                    const prodId = e.target.value;
                                                    const found = products.find(p => p.id.toString() === prodId.toString() || p.id === Number(prodId));
                                                    setSelectedCatalogProduct(found || null);
                                                }} 
                                                className="w-full p-3 text-sm bg-gray-50 border border-zinc-100 rounded-sm outline-none focus:border-brand-terracotta disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium transition-all"
                                            >
                                                <option value="">
                                                    {!selectedCatalogCategory 
                                                        ? 'Primero seleccione una subcategoría...' 
                                                        : '-- Seleccionar Servicio --'}
                                                </option>
                                                {products
                                                    .filter(p => p.category === selectedCatalogCategory)
                                                    .sort((a, b) => a.name.localeCompare(b.name))
                                                    .map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name} ({formatCurrency(p.price)})
                                                        </option>
                                                    ))
                                                }
                                            </select>`,
replacement: `<Select disabled={!selectedCatalogCategory} value={selectedCatalogProduct ? selectedCatalogProduct.id.toString() : "none"} onValueChange={(val) => {
                                                    const found = products.find(p => p.id.toString() === val || p.id === Number(val));
                                                    setSelectedCatalogProduct(found || null);
                                                }}>
                                                <SelectTrigger className="w-full h-11 px-4 text-base font-medium bg-white border border-zinc-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-100 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)] disabled:opacity-50">
                                                    <SelectValue placeholder={!selectedCatalogCategory ? 'Primero seleccione una subcategoría...' : '-- Seleccionar Servicio --'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">{!selectedCatalogCategory ? 'Primero seleccione una subcategoría...' : '-- Seleccionar Servicio --'}</SelectItem>
                                                    {products
                                                        .filter(p => p.category === selectedCatalogCategory)
                                                        .sort((a, b) => a.name.localeCompare(b.name))
                                                        .map(p => (
                                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                                {p.name} ({formatCurrency(p.price)})
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>`
},
{
target: `<select
                                                value={item.assignedOperatorId || 'unassigned'}
                                                onChange={(e) => handleOperatorSelection(e.target.value, i, Number(item.estimatedHours || 2))}
                                                className="flex-1 text-xs uppercase font-medium text-brand-charcoal bg-white border border-zinc-100 outline-none p-2 rounded-sm focus:border-brand-sand cursor-pointer"
                                            >
                                                <option value="unassigned">Sin asignar (Taller)</option>
                                                {operators.map((op: any) => (
                                                    <option key={op.id} value={op.id}>
                                                        {op.name} ({op.daily_hours_capacity}h/d)
                                                    </option>
                                                ))}
                                            </select>`,
replacement: `<Select value={item.assignedOperatorId || 'unassigned'} onValueChange={(val) => handleOperatorSelection(val, i, Number(item.estimatedHours || 2))}>
                                                <SelectTrigger className="flex-1 h-9 px-3 text-xs font-medium bg-white border border-zinc-200/50 rounded-xl outline-none focus:ring-2 focus:ring-zinc-100 shadow-sm transition-all">
                                                    <SelectValue placeholder="Sin asignar (Taller)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">Sin asignar (Taller)</SelectItem>
                                                    {operators.map((op: any) => (
                                                        <SelectItem key={op.id} value={op.id}>
                                                            {op.name} ({op.daily_hours_capacity}h/d)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>`
},
{
target: `<select value={hcPatternType} onChange={(e) => setHcPatternType(e.target.value)} className="w-full p-3 text-sm bg-gray-50 border border-zinc-100 rounded-sm outline-none focus:border-brand-terracotta">
                                        <option value="existing">Base existente (más rápido)</option>
                                        <option value="custom">Desde cero (patronaje propio)</option>
                                        <option value="draping">Drapeado sobre maniquí</option>
                                    </select>`,
replacement: `<Select value={hcPatternType} onValueChange={setHcPatternType}>
                                        <SelectTrigger className="w-full h-11 px-4 text-base font-medium bg-white border border-zinc-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-100 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="existing">Base existente (más rápido)</SelectItem>
                                            <SelectItem value="custom">Desde cero (patronaje propio)</SelectItem>
                                            <SelectItem value="draping">Drapeado sobre maniquí</SelectItem>
                                        </SelectContent>
                                    </Select>`
},
{
target: `<select value={hcTextileDifficulty} onChange={(e) => setHcTextileDifficulty(e.target.value)} className="w-full p-3 text-sm bg-gray-50 border border-zinc-100 rounded-sm outline-none focus:border-brand-terracotta">
                                        <option value="easy">Fácil (algodón, lino)</option>
                                        <option value="medium">Media (seda sintética, jersey)</option>
                                        <option value="hard">Difícil (terciopelo, seda natural)</option>
                                        <option value="haute">Haute (pedrería, encaje complejo)</option>
                                    </select>`,
replacement: `<Select value={hcTextileDifficulty} onValueChange={setHcTextileDifficulty}>
                                        <SelectTrigger className="w-full h-11 px-4 text-base font-medium bg-white border border-zinc-200/50 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-100 transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="easy">Fácil (algodón, lino)</SelectItem>
                                            <SelectItem value="medium">Media (seda sintética, jersey)</SelectItem>
                                            <SelectItem value="hard">Difícil (terciopelo, seda natural)</SelectItem>
                                            <SelectItem value="haute">Haute (pedrería, encaje complejo)</SelectItem>
                                        </SelectContent>
                                    </Select>`
}
];

let replaced = 0;
replacements.forEach(r => {
    // Both target and content are LF separated now
    if (content.includes(r.target)) {
        content = content.replace(r.target, r.replacement);
        replaced++;
    } else {
        console.log("Could not find target:\n" + r.target.substring(0, 50) + "...");
    }
});

if (replaced > 0 && !content.includes('SelectContent')) {
    content = content.replace('import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";', 'import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";\nimport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";');
}

fs.writeFileSync('src/app/admin/pos/page.tsx', content, 'utf8');
console.log('Replaced ' + replaced + ' selects');
