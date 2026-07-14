'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { analyzeDesignWithGeminiAction } from '@/app/admin/pos/actions';
import { getCostSettings, getHcTimeSettings } from '@/app/admin/finance/actions';
import { X, Upload, Sparkles, Loader2, Save, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(event.target?.result as string);
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = () => resolve(event.target?.result as string);
        };
        reader.onerror = () => resolve('');
    });
};

const DEFAULT_HC_TEMPLATES = [
  {
    id: 'vestido_gala',
    name: 'Vestido Gala',
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
    molderia: 'draping',
    pieces: 14,
    tela: 'haute',
    estructura: { canvas: false, lining: true, cups: true, bones: true, pads: false },
    acabados: { handHem: true, handButtonholes: 12, handDraping: true, handEmbroideryHours: 15 },
    pruebas: 4,
    toile: true,
    materiales: 250000,
    extra: 80000
  }
];

export function HauteCoutureModal({ isOpen, onClose, onAddToCart }: { isOpen: boolean, onClose: () => void, onAddToCart: (item: any) => void }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [hourlyRate, setHourlyRate] = useState<number>(25000);
    const [fixedCost, setFixedCost] = useState<number>(349000);
    const [marginPercentage, setMarginPercentage] = useState<number>(15);

    const [hcPrendaName, setHcPrendaName] = useState('Diseño Exclusivo');
    const [hcPatternType, setHcPatternType] = useState('custom');
    const [hcPatternPieces, setHcPatternPieces] = useState(10);
    const [hcTextileDifficulty, setHcTextileDifficulty] = useState('medium');
    const [hcInternalArchitecture, setHcInternalArchitecture] = useState({ canvas: false, lining: false, cups: false, bones: false, pads: false });
    const [hcHandcraft, setHcHandcraft] = useState({ handHem: false, handButtonholes: 0, handDraping: false, handEmbroideryHours: 0 });
    const [hcFittingsCount, setHcFittingsCount] = useState(2);
    const [hcToileNeeded, setHcToileNeeded] = useState(false);
    const [hcMaterialsCost, setHcMaterialsCost] = useState(50000);
    const [hcExtraCost, setHcExtraCost] = useState(0);

    const [customPriceInput, setCustomPriceInput] = useState<string>('');
    const [hcTimeSettings, setHcTimeSettings] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            getCostSettings().then((costData: any) => {
                if (costData) {
                    setHourlyRate(costData.labor_hourly_rate);
                    setFixedCost(costData.operational_fixed_cost);
                    setMarginPercentage(costData.default_margin_percentage);
                }
            });
            getHcTimeSettings().then((timeData: any) => {
                if (timeData) setHcTimeSettings(timeData);
            });
        }
    }, [isOpen]);

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

    const hcComputedHours = useMemo(() => {
        const settings = hcTimeSettings || {
            MOLD_H: { existing: 4, custom: 12, draping: 18 },
            TELA_MULT: { easy: 1.0, medium: 1.15, hard: 1.35, haute: 1.6 },
            PIECE_MULT: 0.75,
            STRUCT: { canvas: 6, lining: 3, cups: 2, bones: 4, pads: 1.5 },
            HAND: { draping: 4, buttonhole: 0.5, hemPerMeter: 1, embroideryHour: 1 },
            FITTING_H: 1.5,
            TOILE_H: 6
        };
        
        let h = settings.MOLD_H[hcPatternType] || 12;
        h += hcPatternPieces * settings.PIECE_MULT;
        h *= settings.TELA_MULT[hcTextileDifficulty] || 1.0;
        
        if (hcInternalArchitecture.canvas) h += settings.STRUCT.canvas;
        if (hcInternalArchitecture.lining) h += settings.STRUCT.lining;
        if (hcInternalArchitecture.cups) h += settings.STRUCT.cups;
        if (hcInternalArchitecture.bones) h += settings.STRUCT.bones;
        if (hcInternalArchitecture.pads) h += settings.STRUCT.pads;
        
        if (hcHandcraft.handHem) h += settings.HAND.hemPerMeter * 2;
        h += hcHandcraft.handButtonholes * settings.HAND.buttonhole;
        if (hcHandcraft.handDraping) h += settings.HAND.draping;
        h += hcHandcraft.handEmbroideryHours * settings.HAND.embroideryHour;
        
        h += hcFittingsCount * settings.FITTING_H;
        if (hcToileNeeded) h += settings.TOILE_H;
        
        return Math.round(h * 10) / 10;
    }, [hcPatternType, hcPatternPieces, hcTextileDifficulty, hcInternalArchitecture, hcHandcraft, hcFittingsCount, hcToileNeeded, hcTimeSettings]);

    const laborCost = hcComputedHours * hourlyRate;
    const productionCost = laborCost + hcMaterialsCost + hcExtraCost;
    const totalCost = productionCost + fixedCost;
    const calculatedPrice = marginPercentage > 0 ? totalCost / (1 - (marginPercentage / 100)) : totalCost;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setIsAnalyzing(true);
        try {
            const base64 = await compressImage(e.target.files[0]);
            setImagePreview(base64);
            const res = await analyzeDesignWithGeminiAction(base64);
            if (res.success && res.data) {
                const ai = res.data;
                setHcPatternType(ai.molderia || 'custom');
                setHcPatternPieces(ai.pieces || 10);
                setHcTextileDifficulty(ai.tela || 'medium');
                setHcInternalArchitecture({
                    canvas: !!ai.estructura?.canvas,
                    lining: !!ai.estructura?.lining,
                    cups: !!ai.estructura?.cups,
                    bones: !!ai.estructura?.bones,
                    pads: !!ai.estructura?.pads,
                });
                setHcHandcraft({
                    handHem: !!ai.acabados?.handHem,
                    handButtonholes: ai.acabados?.handButtonholes || 0,
                    handDraping: !!ai.acabados?.handDraping,
                    handEmbroideryHours: ai.acabados?.handEmbroideryHours || 0,
                });
                setHcFittingsCount(ai.pruebas || 2);
                setHcToileNeeded(!!ai.toile);
                setHcMaterialsCost(ai.materiales || 50000);
            } else {
                alert('Error al analizar diseño: ' + res.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error subiendo imagen.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddOrder = () => {
        const finalPrice = customPriceInput ? Math.round(Number(customPriceInput.replace(/\D/g, ''))) : Math.round(calculatedPrice);
        
        onAddToCart({
            id: crypto.randomUUID(),
            name: hcPrendaName,
            price: finalPrice,
            category: 'Alta Costura',
            isCustom: true,
            details: {
                hours: hcComputedHours,
                materials: hcMaterialsCost,
                extra: hcExtraCost,
                image: imagePreview
            },
            costBreakdown: {
                labor: laborCost,
                materials: hcMaterialsCost + hcExtraCost,
                fixed: fixedCost,
                margin: marginPercentage
            }
        });
        
        // Reset state
        setImagePreview(null);
        setCustomPriceInput('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-900">
                    <h2 className="text-lg font-serif text-white flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-emerald-400" /> Calculadora Alta Costura
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-zinc-50 flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:w-1/3 space-y-6">
                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Inteligencia Artificial</h3>
                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                            
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-40 border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors relative overflow-hidden"
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                ) : null}
                                
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center relative z-10">
                                        <Loader2 className="w-6 h-6 animate-spin mb-2 text-emerald-600" />
                                        <span className="text-xs font-medium text-emerald-700">Analizando diseño...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center relative z-10 bg-white/80 p-2 rounded-lg backdrop-blur-sm">
                                        <Sparkles className="w-6 h-6 mb-2 text-emerald-600" />
                                        <span className="text-xs font-medium text-zinc-900">Sube boceto o referencia</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Plantillas Rápidas</h3>
                            <div className="flex flex-wrap gap-2">
                                {DEFAULT_HC_TEMPLATES.map(tpl => (
                                    <button 
                                        key={tpl.id}
                                        onClick={() => handleApplyTemplate(tpl)}
                                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-xs font-medium text-zinc-700 rounded-full transition-colors"
                                    >
                                        {tpl.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-zinc-900 p-4 rounded-xl shadow-sm text-white">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Resumen de Costos</h3>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Horas de Trabajo</span>
                                    <span className="font-mono">{hcComputedHours} hrs</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Mano de Obra</span>
                                    <span className="font-mono">${laborCost.toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Materiales + Extra</span>
                                    <span className="font-mono">${(hcMaterialsCost + hcExtraCost).toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t border-zinc-800">
                                    <span className="text-emerald-400 font-medium">Costo Producción</span>
                                    <span className="font-mono font-bold">${productionCost.toLocaleString('es-CL')}</span>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-zinc-800">
                                <label className="block text-xs font-medium text-zinc-400 mb-1">Precio Sugerido (con {marginPercentage}% Margen)</label>
                                <p className="text-2xl font-bold text-white mb-3">${Math.round(calculatedPrice).toLocaleString('es-CL')}</p>
                                
                                <label className="block text-xs font-medium text-zinc-400 mb-1">Ajuste Manual (Opcional)</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="Dejar vacío para usar sugerido"
                                    value={customPriceInput}
                                    onChange={(e) => setCustomPriceInput(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-2/3 space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                            <div className="mb-6">
                                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Nombre del Diseño</label>
                                <input 
                                    type="text"
                                    value={hcPrendaName}
                                    onChange={e => setHcPrendaName(e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 border-b border-zinc-100 pb-2">Patronaje</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[11px] text-zinc-500 mb-1">Moldería</label>
                                            <select value={hcPatternType} onChange={e => setHcPatternType(e.target.value)} className="w-full px-2 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-md">
                                                <option value="existing">Base Existente</option>
                                                <option value="custom">A Medida</option>
                                                <option value="draping">Draping (Maniquí)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-zinc-500 mb-1">Cantidad Piezas</label>
                                            <input type="number" value={hcPatternPieces} onChange={e => setHcPatternPieces(Number(e.target.value))} className="w-full px-2 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-md" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 border-b border-zinc-100 pb-2">Materiales</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[11px] text-zinc-500 mb-1">Dificultad Tela</label>
                                            <select value={hcTextileDifficulty} onChange={e => setHcTextileDifficulty(e.target.value)} className="w-full px-2 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-md">
                                                <option value="easy">Fácil (Algodón, Lino)</option>
                                                <option value="medium">Media (Crepe, Lana)</option>
                                                <option value="hard">Difícil (Seda, Gasa)</option>
                                                <option value="haute">Alta Costura (Encaje, Pedrería)</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="block text-[11px] text-zinc-500 mb-1">Costo Materiales</label>
                                                <input type="number" value={hcMaterialsCost} onChange={e => setHcMaterialsCost(Number(e.target.value))} className="w-full px-2 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-md" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[11px] text-zinc-500 mb-1">Extras (Avíos)</label>
                                                <input type="number" value={hcExtraCost} onChange={e => setHcExtraCost(Number(e.target.value))} className="w-full px-2 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-md" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 border-b border-zinc-100 pb-2">Arquitectura Interna</h3>
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                                        <input type="checkbox" checked={hcInternalArchitecture.canvas} onChange={e => setHcInternalArchitecture({...hcInternalArchitecture, canvas: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500" />
                                        Entretelado Completo
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                                        <input type="checkbox" checked={hcInternalArchitecture.lining} onChange={e => setHcInternalArchitecture({...hcInternalArchitecture, lining: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500" />
                                        Forrería
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                                        <input type="checkbox" checked={hcInternalArchitecture.cups} onChange={e => setHcInternalArchitecture({...hcInternalArchitecture, cups: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500" />
                                        Copas Armadas
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                                        <input type="checkbox" checked={hcInternalArchitecture.bones} onChange={e => setHcInternalArchitecture({...hcInternalArchitecture, bones: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500" />
                                        Ballenas / Corsetería
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 border-b border-zinc-100 pb-2">Acabados y Pruebas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                                            <input type="checkbox" checked={hcHandcraft.handHem} onChange={e => setHcHandcraft({...hcHandcraft, handHem: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500" />
                                            Basta a Mano
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                                            <input type="checkbox" checked={hcHandcraft.handDraping} onChange={e => setHcHandcraft({...hcHandcraft, handDraping: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500" />
                                            Drapeado a Mano
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                                            <input type="checkbox" checked={hcToileNeeded} onChange={e => setHcToileNeeded(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                                            Toile (Prueba en Crea)
                                        </label>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm text-zinc-700">Cant. Ojales a Mano</label>
                                            <input type="number" value={hcHandcraft.handButtonholes} onChange={e => setHcHandcraft({...hcHandcraft, handButtonholes: Number(e.target.value)})} className="w-16 px-2 py-1 text-sm bg-zinc-50 border border-zinc-200 rounded-md text-right" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm text-zinc-700">Horas Bordado Mano</label>
                                            <input type="number" value={hcHandcraft.handEmbroideryHours} onChange={e => setHcHandcraft({...hcHandcraft, handEmbroideryHours: Number(e.target.value)})} className="w-16 px-2 py-1 text-sm bg-zinc-50 border border-zinc-200 rounded-md text-right" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm text-zinc-700">Cantidad Pruebas</label>
                                            <input type="number" value={hcFittingsCount} onChange={e => setHcFittingsCount(Number(e.target.value))} className="w-16 px-2 py-1 text-sm bg-zinc-50 border border-zinc-200 rounded-md text-right" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-zinc-200 bg-white flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAddOrder}>
                        Añadir a la Orden
                    </Button>
                </div>
            </div>
        </div>
    );
}
