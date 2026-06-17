const fs = require('fs');
const filePath = 'c:/Users/ADMIN/Downloads/IA trabajaos/Elena Atalier/src/app/admin/pos/page.tsx';

let content = fs.readFileSync(filePath, 'utf8');
// Normalize line endings for reliable replacements
content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

let changesMade = 0;

// ===== 1. ADD analyzeDesignWithGeminiAction TO IMPORTS =====
if (!content.includes('analyzeDesignWithGeminiAction')) {
    content = content.replace(
        "getOperatorsDailyLoadAction } from './actions'",
        "getOperatorsDailyLoadAction, analyzeDesignWithGeminiAction } from './actions'"
    );
    console.log('1. Added analyzeDesignWithGeminiAction to imports');
    changesMade++;
} else {
    console.log('1. analyzeDesignWithGeminiAction already in imports');
}

// ===== 2. ADD Sparkles, Trash2 TO LUCIDE IMPORTS =====
if (!content.includes('Sparkles')) {
    content = content.replace(
        "AlertCircle, Globe } from 'lucide-react'",
        "AlertCircle, Globe, Sparkles, Trash2 } from 'lucide-react'"
    );
    console.log('2. Added Sparkles, Trash2 to lucide imports');
    changesMade++;
} else {
    console.log('2. Sparkles already in lucide imports');
}

// ===== 3. ADD DEFAULT_HC_TEMPLATES BEFORE COMPONENT =====
if (!content.includes('DEFAULT_HC_TEMPLATES')) {
    const HC_TEMPLATES = `
const DEFAULT_HC_TEMPLATES = [
  {
    id: 'vestido_gala',
    name: 'Vestido Gala',
    img: '/assets/siluetas/vestido_gala.png',
    molderia: 'draping',
    pieces: 8,
    tela: 'hard',
    estructura: { canvas: false, lining: true, cups: true, bones: true, pads: false },
    acabados: { handHem: true, handButtonholes: 0, handDraping: true, handEmbroideryHours: 6 },
    pruebas: 3,
    toile: true,
    materiales: 120000,
    extra: 40000
  },
  {
    id: 'chaqueta_sastre',
    name: 'Chaqueta Sastre',
    img: '/assets/siluetas/chaqueta_sastre.png',
    molderia: 'custom',
    pieces: 18,
    tela: 'medium',
    estructura: { canvas: true, lining: true, cups: false, bones: false, pads: true },
    acabados: { handHem: true, handButtonholes: 5, handDraping: false, handEmbroideryHours: 0 },
    pruebas: 2,
    toile: true,
    materiales: 95000,
    extra: 20000
  },
  {
    id: 'vestido_novia',
    name: 'Vestido Novia',
    img: '/assets/siluetas/vestido_novia.png',
    molderia: 'draping',
    pieces: 14,
    tela: 'haute',
    estructura: { canvas: false, lining: true, cups: true, bones: true, pads: false },
    acabados: { handHem: true, handButtonholes: 12, handDraping: true, handEmbroideryHours: 15 },
    pruebas: 4,
    toile: true,
    materiales: 250000,
    extra: 80000
  },
  {
    id: 'pantalon_vestir',
    name: 'Pantalón Sastre',
    img: '/assets/siluetas/pantalon_sastre.png',
    molderia: 'custom',
    pieces: 8,
    tela: 'medium',
    estructura: { canvas: false, lining: true, cups: false, bones: false, pads: false },
    acabados: { handHem: true, handButtonholes: 2, handDraping: false, handEmbroideryHours: 0 },
    pruebas: 2,
    toile: true,
    materiales: 45000,
    extra: 10000
  },
  {
    id: 'abrigo_sastre',
    name: 'Abrigo Sastre',
    img: '/assets/siluetas/abrigo_sastre.png',
    molderia: 'custom',
    pieces: 16,
    tela: 'hard',
    estructura: { canvas: true, lining: true, cups: false, bones: false, pads: true },
    acabados: { handHem: true, handButtonholes: 6, handDraping: false, handEmbroideryHours: 0 },
    pruebas: 2,
    toile: true,
    materiales: 110000,
    extra: 30000
  },
  {
    id: 'falda_tubo',
    name: 'Falda Tubo',
    img: '/assets/siluetas/falda_tubo.png',
    molderia: 'existing',
    pieces: 4,
    tela: 'easy',
    estructura: { canvas: false, lining: true, cups: false, bones: false, pads: false },
    acabados: { handHem: true, handButtonholes: 0, handDraping: false, handEmbroideryHours: 0 },
    pruebas: 1,
    toile: false,
    materiales: 25000,
    extra: 5000
  },
  {
    id: 'corse_clasico',
    name: 'Corsé Clásico',
    img: '/assets/siluetas/corse_clasico.png',
    molderia: 'custom',
    pieces: 10,
    tela: 'hard',
    estructura: { canvas: true, lining: true, cups: true, bones: true, pads: false },
    acabados: { handHem: false, handButtonholes: 0, handDraping: false, handEmbroideryHours: 2 },
    pruebas: 2,
    toile: true,
    materiales: 35000,
    extra: 15000
  },
  {
    id: 'chaleco_sastre',
    name: 'Chaleco Sastre',
    img: '/assets/siluetas/chaleco_sastre.png',
    molderia: 'custom',
    pieces: 12,
    tela: 'medium',
    estructura: { canvas: true, lining: true, cups: false, bones: false, pads: false },
    acabados: { handHem: true, handButtonholes: 5, handDraping: false, handEmbroideryHours: 0 },
    pruebas: 2,
    toile: true,
    materiales: 30000,
    extra: 10000
  },
  {
    id: 'falda_vuelo',
    name: 'Falda Vuelo',
    img: '/assets/siluetas/falda_vuelo.png',
    molderia: 'existing',
    pieces: 3,
    tela: 'easy',
    estructura: { canvas: false, lining: true, cups: false, bones: false, pads: false },
    acabados: { handHem: true, handButtonholes: 0, handDraping: false, handEmbroideryHours: 0 },
    pruebas: 1,
    toile: false,
    materiales: 40000,
    extra: 5000
  }
];

`;
    content = content.replace(
        'export default function POSPage() {',
        HC_TEMPLATES + 'export default function POSPage() {'
    );
    console.log('3. Added DEFAULT_HC_TEMPLATES before component');
    changesMade++;
} else {
    console.log('3. DEFAULT_HC_TEMPLATES already exists');
}

// ===== 4. ADD AI CALCULATOR STATE VARIABLES =====
if (!content.includes('isAiCalculatorModalOpen')) {
    const AI_STATES = `
    // AI Haute Couture Calculator states
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
    const [isAiCalculatorModalOpen, setIsAiCalculatorModalOpen] = useState(false);

    // Haute Couture Modal states
    const [isHauteCoutureModalOpen, setIsHauteCoutureModalOpen] = useState(false);
    const [hcTemplates, setHcTemplates] = useState<any[]>([]);
    const [hcPrendaName, setHcPrendaName] = useState('');
    const [hcPatternType, setHcPatternType] = useState('custom');
    const [hcPatternPieces, setHcPatternPieces] = useState(10);
    const [hcTextileDifficulty, setHcTextileDifficulty] = useState('medium');
    const [hcInternalArchitecture, setHcInternalArchitecture] = useState({ canvas: false, lining: false, cups: false, bones: false, pads: false });
    const [hcHandcraft, setHcHandcraft] = useState({ handHem: false, handButtonholes: 0, handDraping: false, handEmbroideryHours: 0 });
    const [hcFittingsCount, setHcFittingsCount] = useState(2);
    const [hcToileNeeded, setHcToileNeeded] = useState(false);
    const [hcMaterialsCost, setHcMaterialsCost] = useState(50000);
    const [hcExtraCost, setHcExtraCost] = useState(0);
    const [hcNeckline, setHcNeckline] = useState('redondo');
    const [hcSleeve, setHcSleeve] = useState('sin manga');
    const [hcLength, setHcLength] = useState('largo');
    const [newTemplateName, setNewTemplateName] = useState('');

    // Load HC templates from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('elena_hc_custom_templates');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setHcTemplates([...DEFAULT_HC_TEMPLATES, ...parsed]);
                    return;
                } catch (e) { console.error(e); }
            }
        }
        setHcTemplates(DEFAULT_HC_TEMPLATES);
    }, [isHauteCoutureModalOpen]);

    const handleApplyTemplate = (tpl: any) => {
        setHcPrendaName(tpl.name);
        setHcPatternType(tpl.molderia);
        setHcPatternPieces(tpl.pieces);
        setHcTextileDifficulty(tpl.tela);
        setHcInternalArchitecture({ ...tpl.estructura });
        setHcHandcraft({ ...tpl.acabados });
        setHcFittingsCount(tpl.pruebas);
        setHcToileNeeded(tpl.toile);
        setHcMaterialsCost(tpl.materiales || 0);
        setHcExtraCost(tpl.extra || 0);
    };

    const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("¿Seguro que deseas eliminar esta plantilla personalizada?")) return;
        const customOnly = hcTemplates.filter(t => t.id.startsWith('custom_') && t.id !== id);
        localStorage.setItem('elena_hc_custom_templates', JSON.stringify(customOnly));
        setHcTemplates([...DEFAULT_HC_TEMPLATES, ...customOnly]);
    };

    const handleSaveAsTemplateInline = (nameToUse?: string) => {
        const tplName = nameToUse || newTemplateName || hcPrendaName || "Diseño Especial";
        const newTpl = {
            id: \`custom_\${Date.now()}\`,
            name: tplName,
            img: '/assets/siluetas/vestido_gala.png',
            molderia: hcPatternType,
            pieces: hcPatternPieces,
            tela: hcTextileDifficulty,
            estructura: hcInternalArchitecture,
            acabados: hcHandcraft,
            pruebas: hcFittingsCount,
            toile: hcToileNeeded,
            materiales: hcMaterialsCost,
            extra: hcExtraCost
        };
        const customOnly = hcTemplates.filter(t => t.id.startsWith('custom_'));
        const updated = [...customOnly, newTpl];
        localStorage.setItem('elena_hc_custom_templates', JSON.stringify(updated));
        setHcTemplates([...DEFAULT_HC_TEMPLATES, ...updated]);
        setNewTemplateName('');
        alert(\`¡Plantilla "\${tplName}" guardada con éxito!\`);
    };

    // Haute Couture hours computation
    const hcComputedHours = React.useMemo(() => {
        const MOLD_H: any = { existing: 4, custom: 12, draping: 18 };
        const TELA_MULT: any = { easy: 1.0, medium: 1.15, hard: 1.35, haute: 1.6 };
        let h = MOLD_H[hcPatternType] || 12;
        h += hcPatternPieces * 0.75;
        h *= TELA_MULT[hcTextileDifficulty] || 1.0;
        if (hcInternalArchitecture.canvas) h += 6;
        if (hcInternalArchitecture.lining) h += 3;
        if (hcInternalArchitecture.cups) h += 2;
        if (hcInternalArchitecture.bones) h += 4;
        if (hcInternalArchitecture.pads) h += 1.5;
        if (hcHandcraft.handHem) h += 2;
        h += hcHandcraft.handButtonholes * 0.5;
        if (hcHandcraft.handDraping) h += 4;
        h += hcHandcraft.handEmbroideryHours;
        h += hcFittingsCount * 1.5;
        if (hcToileNeeded) h += 6;
        return Math.round(h * 10) / 10;
    }, [hcPatternType, hcPatternPieces, hcTextileDifficulty, hcInternalArchitecture, hcHandcraft, hcFittingsCount, hcToileNeeded]);

    const hcTotalCost = React.useMemo(() => {
        const laborCost = hcComputedHours * hourlyRate;
        return Math.round(laborCost + hcMaterialsCost + hcExtraCost);
    }, [hcComputedHours, hourlyRate, hcMaterialsCost, hcExtraCost]);

    // Populate AI calculator when analysis result arrives
    useEffect(() => {
        if (aiAnalysisResult) {
            setHcPatternType(aiAnalysisResult.molderia || 'custom');
            setHcPatternPieces(aiAnalysisResult.pieces || 10);
            setHcTextileDifficulty(aiAnalysisResult.tela || 'medium');
            setHcInternalArchitecture({
                canvas: !!aiAnalysisResult.estructura?.canvas,
                lining: !!aiAnalysisResult.estructura?.lining,
                cups: !!aiAnalysisResult.estructura?.cups,
                bones: !!aiAnalysisResult.estructura?.bones,
                pads: !!aiAnalysisResult.estructura?.pads,
            });
            setHcHandcraft({
                handHem: !!aiAnalysisResult.acabados?.handHem,
                handButtonholes: aiAnalysisResult.acabados?.handButtonholes || 0,
                handDraping: !!aiAnalysisResult.acabados?.handDraping,
                handEmbroideryHours: aiAnalysisResult.acabados?.handEmbroideryHours || 0,
            });
            setHcFittingsCount(aiAnalysisResult.pruebas || 2);
            setHcToileNeeded(!!aiAnalysisResult.toile);
            setHcMaterialsCost(aiAnalysisResult.materiales || 50000);
            setIsHauteCoutureModalOpen(true);
        }
    }, [aiAnalysisResult]);

`;
    content = content.replace(
        '    const [isAuthorizing, setIsAuthorizing] = useState(false);\n',
        '    const [isAuthorizing, setIsAuthorizing] = useState(false);\n' + AI_STATES
    );
    console.log('4. Added AI calculator state variables and handlers');
    changesMade++;
} else {
    console.log('4. isAiCalculatorModalOpen already exists');
}

// ===== 5. UPDATE THE CTA BUTTON TO OPEN HC MODAL DIRECTLY =====
// The current CTA calls setIsAiCalculatorModalOpen(true) but let's also add AI analysis trigger
const oldCTA = "onClick={() => setIsAiCalculatorModalOpen(true)}";
if (content.includes(oldCTA)) {
    content = content.replace(
        oldCTA,
        `onClick={async () => {
                                            if (orderImages.length > 0) {
                                                setIsAnalyzing(true);
                                                try {
                                                    const res = await analyzeDesignWithGeminiAction(orderImages[0].url);
                                                    if (res.success && res.data) {
                                                        setAiAnalysisResult(res.data);
                                                        setHcPrendaName(customOrderName || 'Diseño Personalizado');
                                                    } else {
                                                        alert('Error analizando diseño: ' + (res.error || 'Intente nuevamente'));
                                                        setIsHauteCoutureModalOpen(true);
                                                    }
                                                } catch (err: any) {
                                                    alert('Error en el análisis: ' + err.message);
                                                    setIsHauteCoutureModalOpen(true);
                                                } finally {
                                                    setIsAnalyzing(false);
                                                }
                                            } else {
                                                setHcPrendaName(customOrderName || '');
                                                setIsHauteCoutureModalOpen(true);
                                            }
                                        }}`
    );
    console.log('5. Updated CTA button onClick handler');
    changesMade++;
} else {
    console.log('5. CTA button onClick not found (may already be updated)');
}

// Also update the CTA button text and disabled state
const oldCTAButton = `                                        className="w-full py-3.5 bg-brand-terracotta hover:bg-white hover:text-brand-terracotta text-white font-bold rounded-sm text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all select-none shadow-md border border-brand-terracotta cursor-pointer active:scale-[0.98]"
                                    >
                                        <span>\u2728 Abrir Calculadora Alta Costura</span>`;
if (content.includes(oldCTAButton)) {
    content = content.replace(
        oldCTAButton,
        `                                        disabled={isAnalyzing}
                                        className="w-full py-3.5 bg-brand-terracotta hover:bg-white hover:text-brand-terracotta text-white font-bold rounded-sm text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all select-none shadow-md border border-brand-terracotta cursor-pointer active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isAnalyzing ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Analizando con IA...</>
                                        ) : (
                                            <span>\u2728 {orderImages.length > 0 ? 'Analizar con IA y Calcular' : 'Abrir Calculadora Alta Costura'}</span>
                                        )}`
    );
    console.log('5b. Updated CTA button text and disabled state');
    changesMade++;
}

// ===== 6. ADD THE HAUTE COUTURE CALCULATOR MODAL =====
if (!content.includes('isHauteCoutureModalOpen')) {
    console.log('6. ERROR: isHauteCoutureModalOpen not found after state injection!');
} else if (!content.includes('{isHauteCoutureModalOpen && (')) {
    const HC_MODAL = `
            {/* Haute Couture Calculator Modal */}
            {isHauteCoutureModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto animate-in fade-in duration-300">
                    <div className="bg-white text-brand-charcoal rounded-sm border border-gray-200 shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden max-h-[95vh]">
                        {/* Header */}
                        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-brand-sand/10 shrink-0">
                            <div>
                                <h2 className="font-serif text-xl md:text-2xl text-brand-charcoal tracking-wide">Calculadora Alta Costura</h2>
                                <p className="text-xs text-gray-500 mt-1">Desglose técnico de costos y tiempos{customOrderName ? \`: \${customOrderName}\` : ''}</p>
                            </div>
                            <button onClick={() => setIsHauteCoutureModalOpen(false)} className="text-gray-400 hover:text-brand-charcoal bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Templates Carousel */}
                        <div className="bg-brand-sand/5 border-b border-gray-100 p-4 shrink-0">
                            <span className="block text-[10px] uppercase tracking-wider text-brand-terracotta mb-3 font-semibold">Siluetas Base del Taller</span>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                                {hcTemplates.map((tpl) => (
                                    <div
                                        key={tpl.id}
                                        onClick={() => handleApplyTemplate(tpl)}
                                        className={\`relative bg-white border rounded-md p-3 min-w-[120px] w-[120px] text-center cursor-pointer transition-all group flex flex-col items-center justify-between shadow-sm min-h-[110px] \${
                                            hcPrendaName === tpl.name
                                                ? 'border-brand-terracotta bg-brand-sand/25 ring-1 ring-brand-terracotta/40'
                                                : 'border-gray-200 hover:border-brand-charcoal hover:bg-neutral-50'
                                        }\`}
                                    >
                                        <div className="h-14 w-full flex items-center justify-center mb-1.5 overflow-hidden rounded">
                                            {tpl.img ? (
                                                <img src={tpl.img} alt={tpl.name} className="h-full w-auto object-contain" />
                                            ) : (
                                                <div className="w-10 h-10 bg-neutral-200 rounded flex items-center justify-center text-neutral-400">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] md:text-xs text-brand-charcoal font-bold truncate w-full">{tpl.name}</p>
                                        {tpl.id.startsWith('custom_') && (
                                            <button onClick={(e) => handleDeleteTemplate(tpl.id, e)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                            {/* Garment Name */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Nombre de la Prenda</label>
                                <input type="text" value={hcPrendaName} onChange={(e) => setHcPrendaName(e.target.value)} placeholder="Ej: Vestido de noche con pedrería" className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                            </div>

                            {/* Technical Parameters Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Moldería */}
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Tipo de Moldería</label>
                                    <select value={hcPatternType} onChange={(e) => setHcPatternType(e.target.value)} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta">
                                        <option value="existing">Base existente (más rápido)</option>
                                        <option value="custom">Desde cero (patronaje propio)</option>
                                        <option value="draping">Drapeado sobre maniquí</option>
                                    </select>
                                </div>
                                {/* Piezas */}
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Piezas del Patrón: {hcPatternPieces}</label>
                                    <input type="range" min="2" max="40" value={hcPatternPieces} onChange={(e) => setHcPatternPieces(Number(e.target.value))} className="w-full accent-brand-terracotta" />
                                </div>
                                {/* Tela */}
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Dificultad de Tela</label>
                                    <select value={hcTextileDifficulty} onChange={(e) => setHcTextileDifficulty(e.target.value)} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta">
                                        <option value="easy">Fácil (algodón, lino)</option>
                                        <option value="medium">Media (seda sintética, jersey)</option>
                                        <option value="hard">Difícil (terciopelo, seda natural)</option>
                                        <option value="haute">Haute (pedrería, encaje complejo)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Estructura Interna */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Estructura Interna</label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    {[
                                        { key: 'canvas', label: 'Entretela' },
                                        { key: 'lining', label: 'Forro' },
                                        { key: 'cups', label: 'Copas' },
                                        { key: 'bones', label: 'Ballenas' },
                                        { key: 'pads', label: 'Hombreras' }
                                    ].map(item => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => setHcInternalArchitecture(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }))}
                                            className={\`py-3 px-2 text-xs font-bold rounded-sm border transition-all \${
                                                (hcInternalArchitecture as any)[item.key]
                                                    ? 'bg-brand-charcoal text-white border-brand-charcoal'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-charcoal'
                                            }\`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Acabados Artesanales */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Acabados Artesanales</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <button type="button" onClick={() => setHcHandcraft(prev => ({ ...prev, handHem: !prev.handHem }))} className={\`py-3 px-2 text-xs font-bold rounded-sm border transition-all \${hcHandcraft.handHem ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-gray-50 text-gray-600 border-gray-200'}\`}>Dobladillo a mano</button>
                                    <button type="button" onClick={() => setHcHandcraft(prev => ({ ...prev, handDraping: !prev.handDraping }))} className={\`py-3 px-2 text-xs font-bold rounded-sm border transition-all \${hcHandcraft.handDraping ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-gray-50 text-gray-600 border-gray-200'}\`}>Drapeado</button>
                                    <div>
                                        <label className="block text-[9px] text-gray-400 mb-1">Ojales a mano</label>
                                        <input type="number" min="0" max="20" value={hcHandcraft.handButtonholes} onChange={(e) => setHcHandcraft(prev => ({ ...prev, handButtonholes: Number(e.target.value) }))} className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-gray-400 mb-1">Horas de bordado</label>
                                        <input type="number" min="0" max="100" value={hcHandcraft.handEmbroideryHours} onChange={(e) => setHcHandcraft(prev => ({ ...prev, handEmbroideryHours: Number(e.target.value) }))} className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                    </div>
                                </div>
                            </div>

                            {/* Pruebas y Toile */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Sesiones de Calce: {hcFittingsCount}</label>
                                    <input type="range" min="1" max="4" value={hcFittingsCount} onChange={(e) => setHcFittingsCount(Number(e.target.value))} className="w-full accent-brand-terracotta" />
                                </div>
                                <div className="flex items-end">
                                    <button type="button" onClick={() => setHcToileNeeded(!hcToileNeeded)} className={\`w-full py-3 text-xs font-bold rounded-sm border transition-all \${hcToileNeeded ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'bg-gray-50 text-gray-600 border-gray-200'}\`}>
                                        {hcToileNeeded ? '✓ Toile/Prueba Requerida' : 'Sin Toile'}
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Costo Materiales (CLP)</label>
                                    <input type="number" min="0" step="5000" value={hcMaterialsCost} onChange={(e) => setHcMaterialsCost(Number(e.target.value))} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                </div>
                            </div>

                            {/* Extra Cost */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Costos Extra (aviamentos, etc.)</label>
                                    <input type="number" min="0" step="1000" value={hcExtraCost} onChange={(e) => setHcExtraCost(Number(e.target.value))} className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                </div>
                                {/* Save as template */}
                                <div className="flex items-end gap-2">
                                    <input type="text" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder="Nombre para guardar como plantilla..." className="flex-1 p-3 text-sm bg-gray-50 border border-gray-200 rounded-sm outline-none focus:border-brand-terracotta" />
                                    <button type="button" onClick={() => handleSaveAsTemplateInline()} className="px-4 py-3 bg-brand-charcoal text-white text-xs font-bold rounded-sm hover:bg-brand-terracotta transition-colors whitespace-nowrap">
                                        <Sparkles className="w-4 h-4 inline mr-1" /> Guardar
                                    </button>
                                </div>
                            </div>

                            {/* AI Justification */}
                            {aiAnalysisResult?.justificacion && (
                                <div className="bg-brand-sand/10 border border-brand-sand/30 rounded-sm p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-brand-terracotta font-bold mb-1">Justificación IA</p>
                                    <p className="text-xs text-gray-700 leading-relaxed">{aiAnalysisResult.justificacion}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer - Fixed with totals */}
                        <div className="p-4 md:p-6 border-t border-gray-100 bg-brand-sand/5 shrink-0">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex gap-6 text-center md:text-left">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-400">Horas Estimadas</p>
                                        <p className="text-2xl font-bold text-brand-charcoal">{hcComputedHours}h</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-400">Mano de Obra</p>
                                        <p className="text-2xl font-bold text-brand-charcoal">\${(hcComputedHours * hourlyRate).toLocaleString('es-CL')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-400">Total Estimado</p>
                                        <p className="text-2xl font-bold text-brand-terracotta">\${hcTotalCost.toLocaleString('es-CL')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button type="button" onClick={() => setIsHauteCoutureModalOpen(false)} className="flex-1 md:flex-none px-6 py-3 border border-gray-200 text-gray-600 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-all rounded-sm">
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHoursEstimated(hcComputedHours);
                                            setMaterialsCost(hcMaterialsCost);
                                            setExtraCost(hcExtraCost);
                                            if (hcPrendaName && !customOrderName) setCustomOrderName(hcPrendaName);
                                            setIsHauteCoutureModalOpen(false);
                                        }}
                                        className="flex-1 md:flex-none px-6 py-3 bg-brand-terracotta text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-charcoal transition-all rounded-sm shadow-md"
                                    >
                                        Aplicar al Pedido
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
`;

    // Insert the modal right before the closing </div></> of the return
    content = content.replace(
        '        </div>\n        </>\n    );\n}',
        HC_MODAL + '        </div>\n        </>\n    );\n}'
    );
    console.log('6. Added Haute Couture Calculator Modal');
    changesMade++;
} else {
    console.log('6. HC Modal already exists');
}

// Write the file back with CRLF line endings (Windows)
content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nDone! ${changesMade} changes applied to page.tsx`);
console.log(`New file size: ${content.length} bytes`);
