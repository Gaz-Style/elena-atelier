const fs = require('fs');
let c = fs.readFileSync('src/app/admin/pos/page.tsx', 'utf8');

c = c.replace(/hcPatternPieces \* 0\.5/g, 'hcBaseHours');

// DEFAULT_HC_TEMPLATES rewrite
c = c.replace(/const DEFAULT_HC_TEMPLATES = \[\s*\{[\s\S]*?\];/m, `const DEFAULT_HC_TEMPLATES = [
    {
        id: 'vestido_gala',
        name: 'Vestido Gala',
        svg: '<img src="/assets/siluetas/vestido_gala.png" class="w-full h-full object-contain drop-shadow-sm opacity-90 mix-blend-multiply" alt="Vestido Gala" />',
        molderia: 'draping',
        baseHours: 18.0,
        pieces: 8,
        tela: 'hard',
        estructura: { canvas: false, canvasHand: false, lining: true, cups: true, bones: true, pads: false },
        acabados: { handHemMeters: 0, handButtonholes: 0, handDraping: false, handEmbroideryHours: 0, upcyclingPreparation: false, techIroning: false, finalIroning: true },
        pruebas: 2,
        toile: false
    },
    {
        id: 'chaqueta_sastre',
        name: 'Chaqueta Sastre',
        svg: '<img src="/assets/siluetas/chaqueta_sastre.png" class="w-full h-full object-contain drop-shadow-sm opacity-90 mix-blend-multiply" alt="Chaqueta Sastre" />',
        molderia: 'custom',
        baseHours: 14.0,
        pieces: 15,
        tela: 'hard',
        estructura: { canvas: false, canvasHand: true, lining: true, cups: false, bones: false, pads: true },
        acabados: { handHemMeters: 0, handButtonholes: 3, handDraping: false, handEmbroideryHours: 0, upcyclingPreparation: false, techIroning: true, finalIroning: true },
        pruebas: 3,
        toile: true
    },
    {
        id: 'vestido_novia',
        name: 'Vestido Novia',
        svg: '<img src="/assets/siluetas/vestido_novia.png" class="w-full h-full object-contain drop-shadow-sm opacity-90 mix-blend-multiply" alt="Vestido Novia" />',
        molderia: 'draping',
        baseHours: 35.0,
        pieces: 12,
        tela: 'haute',
        estructura: { canvas: false, canvasHand: false, lining: true, cups: true, bones: true, pads: false },
        acabados: { handHemMeters: 0, handButtonholes: 0, handDraping: true, handEmbroideryHours: 10, upcyclingPreparation: false, techIroning: false, finalIroning: true },
        pruebas: 4,
        toile: true
    },
    {
        id: 'pantalon_sastre',
        name: 'Pantalón Sastre',
        svg: '<img src="/assets/siluetas/pantalon_sastre.png" class="w-full h-full object-contain drop-shadow-sm opacity-90 mix-blend-multiply" alt="Pantalón Sastre" />',
        molderia: 'custom',
        baseHours: 8.0,
        pieces: 8,
        tela: 'medium',
        estructura: { canvas: false, canvasHand: false, lining: true, cups: false, bones: false, pads: false },
        acabados: { handHemMeters: 2, handButtonholes: 1, handDraping: false, handEmbroideryHours: 0, upcyclingPreparation: false, techIroning: true, finalIroning: true },
        pruebas: 2,
        toile: true
    },
    {
        id: 'abrigo_sastre',
        name: 'Abrigo Sastre',
        svg: '<img src="/assets/siluetas/abrigo_sastre.png" class="w-full h-full object-contain drop-shadow-sm opacity-90 mix-blend-multiply" alt="Abrigo Sastre" />',
        molderia: 'custom',
        baseHours: 16.0,
        pieces: 18,
        tela: 'hard',
        estructura: { canvas: false, canvasHand: true, lining: true, cups: false, bones: false, pads: true },
        acabados: { handHemMeters: 3, handButtonholes: 4, handDraping: false, handEmbroideryHours: 0, upcyclingPreparation: false, techIroning: true, finalIroning: true },
        pruebas: 3,
        toile: true
    },
    {
        id: 'falda_tubo',
        name: 'Falda Tubo',
        svg: '<img src="/assets/siluetas/falda_tubo.png" class="w-full h-full object-contain drop-shadow-sm opacity-90 mix-blend-multiply" alt="Falda Tubo" />',
        molderia: 'custom',
        baseHours: 4.0,
        pieces: 4,
        tela: 'easy',
        estructura: { canvas: false, canvasHand: false, lining: true, cups: false, bones: false, pads: false },
        acabados: { handHemMeters: 1.5, handButtonholes: 0, handDraping: false, handEmbroideryHours: 0, upcyclingPreparation: false, techIroning: false, finalIroning: true },
        pruebas: 1,
        toile: false
    },
    {
        id: 'corse_clasico',
        name: 'Corsé Clásico',
        svg: '<img src="/assets/siluetas/corse_clasico.png" class="w-full h-full object-contain drop-shadow-sm opacity-90 mix-blend-multiply" alt="Corsé Clásico" />',
        molderia: 'custom',
        baseHours: 10.0,
        pieces: 12,
        tela: 'hard',
        estructura: { canvas: false, canvasHand: false, lining: true, cups: true, bones: true, pads: false },
        acabados: { handHemMeters: 0, handButtonholes: 0, handDraping: false, handEmbroideryHours: 0, upcyclingPreparation: false, techIroning: false, finalIroning: true },
        pruebas: 2,
        toile: true
    },
    {
        id: 'chaleco_sastre',
        name: 'Chaleco Sastre',
        svg: '<img src="/assets/siluetas/chaleco_sastre.png" class="w-full h-full object-contain drop-shadow-sm opacity-90 mix-blend-multiply" alt="Chaleco Sastre" />',
        molderia: 'custom',
        baseHours: 7.0,
        pieces: 6,
        tela: 'medium',
        estructura: { canvas: true, canvasHand: false, lining: true, cups: false, bones: false, pads: false },
        acabados: { handHemMeters: 0, handButtonholes: 4, handDraping: false, handEmbroideryHours: 0, upcyclingPreparation: false, techIroning: true, finalIroning: true },
        pruebas: 2,
        toile: true
    }
];`);

// Update the imports and missing vars
c = c.replace(/import \{ sendBudgetEmailAction.*?\}/, "import { sendBudgetEmailAction, sendOrderConfirmationEmailAction, createPOSOrdersAction, checkOrderStatusAction, getDailyWorkloadAction, getEstimatedDatesAction, getOperatorsAction, getAtelierConfigAction, saveBudgetAction, wakeUpMercadoPagoTerminalAction, requestDiscountAuthorizationAction, getOperatorsDailyLoadAction, analyzeDesignWithGeminiAction, updateAtelierTemplatesAction } from './actions';\nimport TemplateManager from './TemplateManager';");

c = c.replace(/const \[isTimeSettingsModalOpen, setIsTimeSettingsModalOpen\] = useState\(false\);/, "const [isTimeSettingsModalOpen, setIsTimeSettingsModalOpen] = useState(false);\n    const [timeSettingsTab, setTimeSettingsTab] = useState('defaults');\n    const [hcBaseHours, setHcBaseHours] = useState(0);");

c = c.replace(/setHcPrendaName\(tpl.name\);/, "setHcPrendaName(tpl.name);\n        setHcBaseHours(tpl.baseHours || 0);");

c = c.replace(/setHcPrendaName\(aiAnalysisResult.name \|\| ''\);/, "setHcPrendaName(aiAnalysisResult.name || '');\n            setHcBaseHours(aiAnalysisResult.baseHours || 0);");

c = c.replace(/setTimeSettings\(timeData \|\| DEFAULT_HC_TIME_SETTINGS\);/, "setTimeSettings(timeData || DEFAULT_HC_TIME_SETTINGS);\n            if (configData?.hc_templates && Array.isArray(configData.hc_templates) && configData.hc_templates.length > 0) {\n                setHcTemplates(configData.hc_templates);\n            }");

c = c.replace(/} else \{\s*setHcPrendaName\(customOrderName \|\| ''\);\s*setIsHauteCoutureModalOpen\(true\);\s*\}/, "} else {\n                                const templateName = customOrderName || '';\n                                const match = hcTemplates.find(t => t.name.toLowerCase() === templateName.toLowerCase());\n                                if (match) {\n                                    handleApplyTemplate(match);\n                                } else {\n                                    setHcPrendaName(templateName);\n                                    setHcBaseHours(0);\n                                }\n                                setIsHauteCoutureModalOpen(true);\n                            }");

// tabs in modal
c = c.replace(/<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">/, `<div className="flex border-b border-gray-100 px-4 md:px-6">
                            <button 
                                onClick={() => setTimeSettingsTab('defaults')}
                                className={\`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors \${timeSettingsTab === 'defaults' ? 'border-brand-terracotta text-brand-terracotta' : 'border-transparent text-gray-400 hover:text-brand-charcoal'}\`}
                            >
                                Multiplicadores y Ajustes
                            </button>
                            <button 
                                onClick={() => setTimeSettingsTab('templates')}
                                className={\`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors \${timeSettingsTab === 'templates' ? 'border-brand-terracotta text-brand-terracotta' : 'border-transparent text-gray-400 hover:text-brand-charcoal'}\`}
                            >
                                Siluetas Base
                            </button>
                        </div>
                        
                        {timeSettingsTab === 'defaults' ? (
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">`);

c = c.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<div className="p-4 md:p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">/, `</div>
                            </div>
                        </div>
                        ) : (
                            <div className="flex-1 overflow-hidden p-4 md:p-6 bg-gray-50/50">
                                <TemplateManager 
                                    templates={hcTemplates} 
                                    defaultTemplates={DEFAULT_HC_TEMPLATES}
                                    onUpdateTemplates={async (newTemplates) => {
                                        setHcTemplates(newTemplates);
                                        const customTpls = newTemplates.filter(t => t.id.startsWith('custom_'));
                                        localStorage.setItem('elena_hc_custom_templates', JSON.stringify(customTpls));
                                        try {
                                            await updateAtelierTemplatesAction(newTemplates);
                                        } catch (e) { console.error(e); }
                                    }}
                                />
                            </div>
                        )}
                        <div className="p-4 md:p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">`);

c = c.replace(/value=\{timeSettings(.*?)\|\|(.*?)\}/g, 'value={timeSettings$1??$2}');

fs.writeFileSync('src/app/admin/pos/page.tsx', c);
