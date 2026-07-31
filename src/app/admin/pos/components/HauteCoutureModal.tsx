'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getCostSettings, getHcTimeSettings, saveCostSettings, saveHcTimeSettings } from '@/app/admin/finance/actions';
import { X, Scissors, Settings, Calculator, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HauteCoutureModal({ isOpen, onClose, onAddToCart }: { isOpen: boolean, onClose: () => void, onAddToCart: (item: any) => void }) {
    const [activeTab, setActiveTab] = useState<'calculator' | 'settings'>('calculator');
    const [isSaving, setIsSaving] = useState(false);

    // Cost structure state
    const [hourlyRate, setHourlyRate] = useState<number>(25000);
    const [marginPercentage, setMarginPercentage] = useState<number>(20);

    // Calculator inputs
    const [hcPrendaName, setHcPrendaName] = useState('Diseño de Alta Costura');
    const [hours, setHours] = useState<number>(15);
    const [fabricCost, setFabricCost] = useState<number>(120000);
    const [fabricProvidedBy, setFabricProvidedBy] = useState<'Cliente' | 'Taller'>('Cliente');
    const [fabricMultiplier, setFabricMultiplier] = useState<number>(1.0);

    // Advanced Structure & Handcraft states (Front-end toggle checkboxes)
    const [hcInternalArchitecture, setHcInternalArchitecture] = useState({ canvas: false, lining: false, cups: false, bones: false, pads: false });
    const [hcHandcraft, setHcHandcraft] = useState({ handHem: false, handButtonholes: 0, handDraping: false, handEmbroideryHours: 0 });
    const [hcToileNeeded, setHcToileNeeded] = useState(false);

    const [customPriceInput, setCustomPriceInput] = useState<string>('');
    const [hcTimeSettings, setHcTimeSettings] = useState<any>(null);

    // Advanced Settings Editor values (for backend params setup)
    const [settingsHourlyRate, setSettingsHourlyRate] = useState<number>(25000);
    const [settingsMargin, setSettingsMargin] = useState<number>(20);
    const [settingsStructCanvas, setSettingsStructCanvas] = useState<number>(6);
    const [settingsStructLining, setSettingsStructLining] = useState<number>(3);
    const [settingsStructCups, setSettingsStructCups] = useState<number>(2);
    const [settingsStructBones, setSettingsStructBones] = useState<number>(4);
    const [settingsStructPads, setSettingsStructPads] = useState<number>(1.5);
    const [settingsToileH, setSettingsToileH] = useState<number>(6);
    
    const [settingsHandHem, setSettingsHandHem] = useState<number>(2);
    const [settingsHandDraping, setSettingsHandDraping] = useState<number>(4);
    const [settingsHandButtonhole, setSettingsHandButtonhole] = useState<number>(0.5);
    const [settingsHandEmbroidery, setSettingsHandEmbroidery] = useState<number>(1);
    const [settingsFabricMultiplier, setSettingsFabricMultiplier] = useState<number>(1.3);

    // Fetch parameters from settings on mount/open
    useEffect(() => {
        if (isOpen) {
            getCostSettings().then((costData: any) => {
                if (costData) {
                    setHourlyRate(costData.labor_hourly_rate || 25000);
                    setSettingsHourlyRate(costData.labor_hourly_rate || 25000);
                    setMarginPercentage(costData.default_margin_percentage || 20);
                    setSettingsMargin(costData.default_margin_percentage || 20);
                }
            });
            getHcTimeSettings().then((timeData: any) => {
                if (timeData) {
                    setHcTimeSettings(timeData);
                    setSettingsStructCanvas(timeData.STRUCT?.canvas ?? 6);
                    setSettingsStructLining(timeData.STRUCT?.lining ?? 3);
                    setSettingsStructCups(timeData.STRUCT?.cups ?? 2);
                    setSettingsStructBones(timeData.STRUCT?.bones ?? 4);
                    setSettingsStructPads(timeData.STRUCT?.pads ?? 1.5);
                    setSettingsToileH(timeData.TOILE_H ?? 6);
                    setSettingsHandHem(timeData.HAND?.hemPerMeter ?? 2);
                    setSettingsHandDraping(timeData.HAND?.draping ?? 4);
                    setSettingsHandButtonhole(timeData.HAND?.buttonhole ?? 0.5);
                    setSettingsHandEmbroidery(timeData.HAND?.embroideryHour ?? 1);
                    setSettingsFabricMultiplier(timeData.TELA_MULT?.haute ?? 1.3);
                }
            });
        }
    }, [isOpen]);

    // Calculate labor hours dynamically based on current configurations
    const calculatedHours = useMemo(() => {
        const settings = hcTimeSettings || {
            STRUCT: { canvas: 6, lining: 3, cups: 2, bones: 4, pads: 1.5 },
            HAND: { draping: 4, buttonhole: 0.5, hemPerMeter: 1, embroideryHour: 1 },
            TOILE_H: 6
        };

        // Start with base input hours
        let h = hours;
        
        // Add structure complexity hours
        if (hcInternalArchitecture.canvas) h += (settings.STRUCT?.canvas ?? 6);
        if (hcInternalArchitecture.lining) h += (settings.STRUCT?.lining ?? 3);
        if (hcInternalArchitecture.cups) h += (settings.STRUCT?.cups ?? 2);
        if (hcInternalArchitecture.bones) h += (settings.STRUCT?.bones ?? 4);
        if (hcInternalArchitecture.pads) h += (settings.STRUCT?.pads ?? 1.5);
        
        // Add handcraft hours
        if (hcHandcraft.handHem) h += (settings.HAND?.hemPerMeter ?? 2);
        h += hcHandcraft.handButtonholes * (settings.HAND?.buttonhole ?? 0.5);
        if (hcHandcraft.handDraping) h += (settings.HAND?.draping ?? 4);
        h += hcHandcraft.handEmbroideryHours * (settings.HAND?.embroideryHour ?? 1);
        
        if (hcToileNeeded) h += (settings.TOILE_H ?? 6);

        return Math.round(h * 10) / 10;
    }, [hours, hcInternalArchitecture, hcHandcraft, hcToileNeeded, hcTimeSettings]);

    // Financial Calculations (Real margin calculation, rounded to nearest 1000 CLP)
    const { laborBase, difficultySurcharge, fabricRisk, fabricCostCharged, subtotal, calculatedPrice, marginAmount, effectiveHourlyRate } = useMemo(() => {
        const roundToThousand = (val: number) => Math.round(val / 1000) * 1000;

        const lBase = roundToThousand(calculatedHours * hourlyRate);
        
        // Surcharges (using multiplier from front selection)
        const diffSurcharge = roundToThousand((calculatedHours * hourlyRate * fabricMultiplier) - (calculatedHours * hourlyRate));

        let risk = 0;
        let charged = 0;

        if (fabricProvidedBy === 'Cliente') {
            risk = fabricCost >= 100000 ? fabricCost * 0.10 : 0;
        } else {
            charged = fabricCost;
            risk = fabricCost * 0.05;
        }

        risk = roundToThousand(risk);
        charged = roundToThousand(charged);

        const sub = roundToThousand(lBase + diffSurcharge + risk + charged);

        // True margin formula: total = subtotal / (1 - margin%)
        const rawTotal = marginPercentage < 100 ? sub / (1 - (marginPercentage / 100)) : sub;
        const total = roundToThousand(rawTotal);
        const mAmount = roundToThousand(total - sub);

        // Selling labor rate per hour with margin: (baseRate * multiplier) / (1 - margin%)
        const rawEffRate = marginPercentage < 100 ? (hourlyRate * fabricMultiplier) / (1 - (marginPercentage / 100)) : (hourlyRate * fabricMultiplier);
        const effRate = roundToThousand(rawEffRate);

        return {
            laborBase: lBase,
            difficultySurcharge: diffSurcharge,
            fabricRisk: risk,
            fabricCostCharged: charged,
            subtotal: sub,
            calculatedPrice: total,
            marginAmount: mAmount,
            effectiveHourlyRate: effRate
        };
    }, [calculatedHours, hourlyRate, fabricMultiplier, fabricCost, fabricProvidedBy, marginPercentage]);

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            // 1. Save cost parameters
            const costForm = new FormData();
            costForm.append('labor_hourly_rate', String(settingsHourlyRate));
            costForm.append('operational_fixed_cost', '0');
            costForm.append('default_margin_percentage', String(settingsMargin));
            await saveCostSettings(costForm);

            // 2. Save time parameters
            const timeSettings = {
                MOLD_H: hcTimeSettings?.MOLD_H || { existing: 4, custom: 12, draping: 18 },
                TELA_MULT: {
                    easy: 1.0,
                    medium: 1.15,
                    hard: 1.35,
                    haute: settingsFabricMultiplier
                },
                PIECE_MULT: hcTimeSettings?.PIECE_MULT || 0.75,
                STRUCT: {
                    canvas: settingsStructCanvas,
                    lining: settingsStructLining,
                    cups: settingsStructCups,
                    bones: settingsStructBones,
                    pads: settingsStructPads
                },
                HAND: {
                    draping: settingsHandDraping,
                    buttonhole: settingsHandButtonhole,
                    hemPerMeter: settingsHandHem,
                    embroideryHour: settingsHandEmbroidery
                },
                FITTING_H: hcTimeSettings?.FITTING_H || 1.5,
                TOILE_H: settingsToileH
            };
            await saveHcTimeSettings(timeSettings);

            // Update active states
            setHourlyRate(settingsHourlyRate);
            setMarginPercentage(settingsMargin);
            setHcTimeSettings(timeSettings);
            
            alert('Configuración de parámetros guardada exitosamente.');
            setActiveTab('calculator');
        } catch (e: any) {
            console.error(e);
            alert('Error al guardar configuración: ' + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddOrder = () => {
        const finalPrice = customPriceInput ? Math.round(Number(customPriceInput.replace(/\D/g, ''))) : calculatedPrice;
        
        onAddToCart({
            id: crypto.randomUUID(),
            name: hcPrendaName,
            price: finalPrice,
            category: 'Alta Costura',
            isCustom: true,
            details: {
                hours: calculatedHours,
                materials: fabricCost,
                extra: 0,
                image: null
            },
            costBreakdown: {
                labor: laborBase + difficultySurcharge,
                materials: fabricCostCharged,
                margin: marginPercentage,
                risk: fabricRisk
            }
        });
        
        setCustomPriceInput('');
        onClose();
    };

    if (!isOpen) return null;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Main Modal container */}
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-zinc-200">
                
                {/* Header with Navigation tabs */}
                <div className="px-6 py-4 border-b border-zinc-150 flex justify-between items-center bg-[#FCFAF7]">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Scissors className="w-5 h-5 text-[#C17F5F]" />
                            <h2 className="text-md font-sans font-bold text-[#1A1A1A] uppercase tracking-wider">
                                Alta Costura
                            </h2>
                        </div>
                        {/* Tab switcher */}
                        <div className="flex border-l border-zinc-200 pl-6 gap-2">
                            <button
                                onClick={() => setActiveTab('calculator')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                    activeTab === 'calculator'
                                        ? 'bg-[#C17F5F] text-white shadow-sm'
                                        : 'text-zinc-600 hover:bg-zinc-100'
                                }`}
                            >
                                <Calculator className="w-3.5 h-3.5" /> Cotizador
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                    activeTab === 'settings'
                                        ? 'bg-[#C17F5F] text-white shadow-sm'
                                        : 'text-zinc-600 hover:bg-zinc-100'
                                }`}
                            >
                                <Settings className="w-3.5 h-3.5" /> Parámetros Backend
                            </button>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-[#1A1A1A] transition-colors p-1.5 hover:bg-zinc-100 rounded-full">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                {/* Active Tab Screen */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {activeTab === 'calculator' ? (
                        /* CALCULATOR VIEW: Simple Front-Facing interface */
                        <div className="flex flex-col md:flex-row gap-6">
                            
                            {/* Left: Inputs */}
                            <div className="w-full md:w-[60%] space-y-5">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C17F5F] border-b border-zinc-100 pb-2">
                                    Parámetros de la Prenda
                                </h3>

                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-medium text-zinc-600 mb-1">Nombre del Diseño / Prenda</label>
                                    <input 
                                        type="text"
                                        value={hcPrendaName}
                                        onChange={e => setHcPrendaName(e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C17F5F]"
                                    />
                                </div>                                {/* Base Hours & Fabric Cost */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-600 mb-1">Horas Estimadas Base</label>
                                        <input 
                                            type="number"
                                            min="1"
                                            value={hours}
                                            onChange={e => setHours(Math.max(1, Number(e.target.value)))}
                                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-[#1A1A1A] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-600 mb-1">Costo Estimado de la Tela ($)</label>
                                        <input 
                                            type="number"
                                            min="0"
                                            value={fabricCost}
                                            onChange={e => setFabricCost(Math.max(0, Number(e.target.value)))}
                                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-[#1A1A1A] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Who brings fabric? & Fabric type complexity */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-600 mb-1">¿Quién Aporta la Tela?</label>
                                        <select 
                                            value={fabricProvidedBy} 
                                            onChange={e => setFabricProvidedBy(e.target.value as any)} 
                                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-[#1A1A1A] focus:outline-none"
                                        >
                                            <option value="Cliente">El Cliente (Aplica seguro de corte)</option>
                                            <option value="Taller">El Taller (Se incluye en el costo)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-600 mb-1">Tipo de Tela / Complejidad Textil</label>
                                        <select 
                                            value={fabricMultiplier} 
                                            onChange={e => setFabricMultiplier(Number(e.target.value))} 
                                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-[#1A1A1A] focus:outline-none"
                                        >
                                            <option value="1.0">Estándar / Algodón / Mezclas (+0% tiempo)</option>
                                            <option value="1.15">Delicada / Elástica / Licra (+15% tiempo)</option>
                                            <option value="1.25">Terciopelo / Pelo / Estampados (+25% tiempo)</option>
                                            <option value="1.35">Seda / Satén / Chifón / Organza (+35% tiempo)</option>
                                            <option value="1.6">Alta Costura / Encaje Fino / Pedrería (+60% tiempo)</option>
                                        </select>
                                    </div>
                                </div>
                                {/* Simple Checkboxes (Corsetería / Estructuras) */}
                                <div className="pt-2 border-t border-zinc-100">
                                    <h4 className="text-xs font-bold text-zinc-700 mb-3 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#C17F5F]" /> Corsetería y Estructura Interna
                                    </h4>
                                    <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                                        <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer select-none">
                                            <input type="checkbox" checked={hcInternalArchitecture.canvas} onChange={e => setHcInternalArchitecture({...hcInternalArchitecture, canvas: e.target.checked})} className="rounded border-zinc-300 text-[#C17F5F] focus:ring-[#C17F5F]" />
                                            Entretelado Sastre
                                        </label>
                                        <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer select-none">
                                            <input type="checkbox" checked={hcInternalArchitecture.lining} onChange={e => setHcInternalArchitecture({...hcInternalArchitecture, lining: e.target.checked})} className="rounded border-zinc-300 text-[#C17F5F] focus:ring-[#C17F5F]" />
                                            Forro Fino
                                        </label>
                                        <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer select-none">
                                            <input type="checkbox" checked={hcInternalArchitecture.cups} onChange={e => setHcInternalArchitecture({...hcInternalArchitecture, cups: e.target.checked})} className="rounded border-zinc-300 text-[#C17F5F] focus:ring-[#C17F5F]" />
                                            Copas Armadas
                                        </label>
                                        <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer select-none">
                                            <input type="checkbox" checked={hcInternalArchitecture.bones} onChange={e => setHcInternalArchitecture({...hcInternalArchitecture, bones: e.target.checked})} className="rounded border-zinc-300 text-[#C17F5F] focus:ring-[#C17F5F]" />
                                            Ballenas / Corsé
                                        </label>
                                    </div>
                                </div>

                                {/* Simple Checkboxes (Acabados a Mano) */}
                                <div className="pt-2 border-t border-zinc-100 space-y-3">
                                    <h4 className="text-xs font-bold text-zinc-700 mb-2 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#C17F5F]" /> Acabados & Pruebas a Mano
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer select-none">
                                                <input type="checkbox" checked={hcHandcraft.handHem} onChange={e => setHcHandcraft({...hcHandcraft, handHem: e.target.checked})} className="rounded border-zinc-300 text-[#C17F5F] focus:ring-[#C17F5F]" />
                                                Ruedo/Basta a Mano
                                            </label>
                                            <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer select-none">
                                                <input type="checkbox" checked={hcHandcraft.handDraping} onChange={e => setHcHandcraft({...hcHandcraft, handDraping: e.target.checked})} className="rounded border-zinc-300 text-[#C17F5F] focus:ring-[#C17F5F]" />
                                                Drapeado a Mano
                                            </label>
                                            <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer select-none">
                                                <input type="checkbox" checked={hcToileNeeded} onChange={e => setHcToileNeeded(e.target.checked)} className="rounded border-zinc-300 text-[#C17F5F] focus:ring-[#C17F5F]" />
                                                Toile (Modelo Base)
                                            </label>
                                        </div>
                                        <div className="space-y-2 text-xs text-zinc-600">
                                            <div className="flex items-center justify-between">
                                                <span>Cant. Ojales Mano</span>
                                                <input type="number" value={hcHandcraft.handButtonholes} onChange={e => setHcHandcraft({...hcHandcraft, handButtonholes: Number(e.target.value)})} className="w-10 px-1 border border-zinc-200 rounded text-right bg-white" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Bordados Mano (hrs)</span>
                                                <input type="number" value={hcHandcraft.handEmbroideryHours} onChange={e => setHcHandcraft({...hcHandcraft, handEmbroideryHours: Number(e.target.value)})} className="w-10 px-1 border border-zinc-200 rounded text-right bg-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Pricing results display */}
                            <div className="w-full md:w-[40%] space-y-6">
                                {/* Total card */}
                                <div className="p-6 rounded-xl border border-zinc-150 shadow-sm text-center space-y-2 bg-[#FCFAF7]">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#C17F5F] block">Total a Cobrar</span>
                                    <div className="text-3xl font-sans font-black text-[#1A1A1A] tracking-tight">
                                        {formatCurrency(customPriceInput ? Number(customPriceInput.replace(/\D/g, '')) : calculatedPrice)}
                                    </div>
                                    <div className="pt-2 border-t border-zinc-200 flex justify-between text-xs text-zinc-500">
                                        <span>Tarifa Real / Hora:</span>
                                        <span className="font-semibold text-zinc-700">{formatCurrency(effectiveHourlyRate)} / hr</span>
                                    </div>
                                </div>

                                {/* Technical Cost Breakdown */}
                                <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-3">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2">
                                        Desglose Técnico
                                    </h4>
                                    <div className="space-y-2 text-xs text-zinc-600">
                                        <div className="flex justify-between py-1 border-b border-zinc-50">
                                            <span>Horas Computadas:</span>
                                            <span className="font-medium text-zinc-800">{calculatedHours} hrs</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-zinc-50">
                                            <span>Mano de Obra Base:</span>
                                            <span className="font-medium text-zinc-800">{formatCurrency(laborBase)}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-zinc-50">
                                            <span>Recargo Dificultad:</span>
                                            <span className="font-medium text-[#C17F5F]">{formatCurrency(difficultySurcharge)}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-zinc-50">
                                            <span>Seguro Manipulación:</span>
                                            <span className="font-medium text-zinc-800">{formatCurrency(fabricRisk)}</span>
                                        </div>
                                        {fabricProvidedBy === 'Taller' && (
                                            <div className="flex justify-between py-1 border-b border-zinc-50 font-medium">
                                                <span>Tela (Costo Taller):</span>
                                                <span>{formatCurrency(fabricCostCharged)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between py-1 border-b border-zinc-50 font-semibold text-zinc-700">
                                            <span>Subtotal Técnico:</span>
                                            <span>{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-[#C17F5F]">
                                            <span>Margen Taller ({marginPercentage}%):</span>
                                            <span>{formatCurrency(marginAmount)}</span>
                                        </div>
                                    </div>

                                    {/* Override price input */}
                                    <div className="pt-3 border-t border-zinc-100">
                                        <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Ajustar Precio Final</label>
                                        <input 
                                            type="text" 
                                            placeholder="Usar precio sugerido"
                                            value={customPriceInput}
                                            onChange={e => setCustomPriceInput(e.target.value)}
                                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-[#C17F5F]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* BACKEND SETTINGS VIEW: Configuration parameters editor */
                        <div className="space-y-6 max-w-2xl mx-auto">
                            <div className="border-b pb-3">
                                <h3 className="text-sm font-bold text-[#1A1A1A]">Configuración de Reglas y Parámetros</h3>
                                <p className="text-xs text-zinc-500">Ajusta los tiempos en horas y las tarifas que alimentan la fórmula automática del calculador.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Base Cost Setup */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-[#C17F5F] uppercase tracking-wider">Tarifas Base</h4>
                                    <div>
                                        <label className="block text-xs text-zinc-600 mb-1">Tarifa Base por Hora ($)</label>
                                        <input 
                                            type="number" 
                                            value={settingsHourlyRate} 
                                            onChange={e => setSettingsHourlyRate(Number(e.target.value))}
                                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-600 mb-1">Margen Comercial Sugerido (%)</label>
                                        <input 
                                            type="number" 
                                            value={settingsMargin} 
                                            onChange={e => setSettingsMargin(Number(e.target.value))}
                                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-600 mb-1">Multiplicador Dificultad Seda/Satén</label>
                                        <input 
                                            type="number" 
                                            step="0.05"
                                            value={settingsFabricMultiplier} 
                                            onChange={e => setSettingsFabricMultiplier(Number(e.target.value))}
                                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Structure Hours Setup */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-[#C17F5F] uppercase tracking-wider">Tiempos de Corsetería (Hrs)</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] text-zinc-500">Entretelado</label>
                                            <input type="number" value={settingsStructCanvas} onChange={e => setSettingsStructCanvas(Number(e.target.value))} className="w-full px-2 py-1 border border-zinc-200 rounded" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-zinc-500">Forro</label>
                                            <input type="number" value={settingsStructLining} onChange={e => setSettingsStructLining(Number(e.target.value))} className="w-full px-2 py-1 border border-zinc-200 rounded" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-zinc-500">Copas</label>
                                            <input type="number" value={settingsStructCups} onChange={e => setSettingsStructCups(Number(e.target.value))} className="w-full px-2 py-1 border border-zinc-200 rounded" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-zinc-500">Ballenas/Corsé</label>
                                            <input type="number" value={settingsStructBones} onChange={e => setSettingsStructBones(Number(e.target.value))} className="w-full px-2 py-1 border border-zinc-200 rounded" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-600 mb-1">Toile (Prueba en Crea) (Hrs)</label>
                                        <input type="number" value={settingsToileH} onChange={e => setSettingsToileH(Number(e.target.value))} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Handcraft Hours Setup */}
                            <div className="pt-4 border-t border-zinc-150 space-y-3">
                                <h4 className="text-xs font-bold text-[#C17F5F] uppercase tracking-wider">Tiempos de Acabados a Mano (Hrs)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-zinc-600 mb-1">Basta/Ruedo a Mano (Hrs)</label>
                                        <input type="number" value={settingsHandHem} onChange={e => setSettingsHandHem(Number(e.target.value))} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-600 mb-1">Drapeado a Mano (Hrs)</label>
                                        <input type="number" value={settingsHandDraping} onChange={e => setSettingsHandDraping(Number(e.target.value))} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-600 mb-1">Ojales a Mano (Hrs c/u)</label>
                                        <input type="number" step="0.1" value={settingsHandButtonhole} onChange={e => setSettingsHandButtonhole(Number(e.target.value))} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-600 mb-1">Bordado a Mano (Hrs por Hora cargada)</label>
                                        <input type="number" value={settingsHandEmbroidery} onChange={e => setSettingsHandEmbroidery(Number(e.target.value))} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="pt-4 border-t border-zinc-150 flex justify-end">
                                <Button 
                                    onClick={handleSaveSettings}
                                    disabled={isSaving}
                                    className="bg-[#C17F5F] hover:bg-[#a96e51] text-white font-bold flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    Guardar Configuración
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-zinc-100 bg-[#FCFAF7] flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="border-zinc-200 hover:bg-zinc-100 text-zinc-600 bg-white">
                        Cancelar
                    </Button>
                    {activeTab === 'calculator' && (
                        <Button 
                            onClick={handleAddOrder}
                            className="bg-[#C17F5F] hover:bg-[#a96e51] text-white font-bold transition-all shadow-md shadow-[#C17F5F]/15"
                        >
                            Añadir a la Orden
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
