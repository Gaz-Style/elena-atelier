const fs = require('fs');
const file = 'src/app/admin/pos/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add TemplateManager import
content = content.replace(
  "import { sendBudgetEmailAction, sendOrderConfirmationEmailAction, createPOSOrdersAction, checkOrderStatusAction, getDailyWorkloadAction, getEstimatedDatesAction, getOperatorsAction, getAtelierConfigAction, saveBudgetAction, wakeUpMercadoPagoTerminalAction, requestDiscountAuthorizationAction, getOperatorsDailyLoadAction, analyzeDesignWithGeminiAction } from './actions';",
  "import { sendBudgetEmailAction, sendOrderConfirmationEmailAction, createPOSOrdersAction, checkOrderStatusAction, getDailyWorkloadAction, getEstimatedDatesAction, getOperatorsAction, getAtelierConfigAction, saveBudgetAction, wakeUpMercadoPagoTerminalAction, requestDiscountAuthorizationAction, getOperatorsDailyLoadAction, analyzeDesignWithGeminiAction, updateAtelierTemplatesAction } from './actions';\nimport TemplateManager from './TemplateManager';"
);

// 2. Add timeSettingsTab state
content = content.replace(
  "const [isTimeSettingsModalOpen, setIsTimeSettingsModalOpen] = useState(false);",
  "const [isTimeSettingsModalOpen, setIsTimeSettingsModalOpen] = useState(false);\n    const [timeSettingsTab, setTimeSettingsTab] = useState('defaults');"
);

// 3. Fix the AI auto-load bug
content = content.replace(
  "} else {\n                                setHcPrendaName(customOrderName || '');\n                                setIsHauteCoutureModalOpen(true);\n                            }",
  "} else {\n                                const templateName = customOrderName || '';\n                                const match = hcTemplates.find(t => t.name.toLowerCase() === templateName.toLowerCase());\n                                if (match) {\n                                    handleApplyTemplate(match);\n                                } else {\n                                    setHcPrendaName(templateName);\n                                    setHcBaseHours(0);\n                                }\n                                setIsHauteCoutureModalOpen(true);\n                            }"
);

// 4. Update the DB sync in useEffect
content = content.replace(
  "setTimeSettings(timeData || DEFAULT_HC_TIME_SETTINGS);\n            setLoading(false);",
  "setTimeSettings(timeData || DEFAULT_HC_TIME_SETTINGS);\n            if (configData?.hc_templates && Array.isArray(configData.hc_templates) && configData.hc_templates.length > 0) {\n                setHcTemplates(configData.hc_templates);\n            }\n            setLoading(false);"
);

// 5. Replace the modal body for tabs
const modalStartRegex = /<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">/;
content = content.replace(
  modalStartRegex,
  `<div className="flex border-b border-gray-100 px-4 md:px-6">
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
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">`
);

// 6. Close the tabs and add TemplateManager rendering
const modalEndRegex = /<\/div>\s*<\/div>\s*<\/div>\s*<div className="p-4 md:p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">/;
content = content.replace(
  modalEndRegex,
  `</div>
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
                        <div className="p-4 md:p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">`
);

// 7. Fix the fallback logic: replace || with ??
// But ONLY inside the TimeSettings inputs
content = content.replace(/value=\{timeSettings(.*?)\|\|(.*?)\}/g, 'value={timeSettings$1??$2}');

fs.writeFileSync(file, content);
console.log("Done");
