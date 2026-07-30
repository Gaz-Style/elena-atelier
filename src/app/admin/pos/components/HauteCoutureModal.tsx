'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { analyzeDesignWithGeminiAction } from '@/app/admin/pos/actions';
import { getCostSettings, getHcTimeSettings } from '@/app/admin/finance/actions';
import { X, Upload, Sparkles, Loader2, Scissors, Info, Play } from 'lucide-react';
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
    const [marginPercentage, setMarginPercentage] = useState<number>(20);

    const [hcPrendaName, setHcPrendaName] = useState('Diseño Exclusivo');
    const [hcPatternType, setHcPatternType] = useState('custom');
    const [hcPatternPieces, setHcPatternPieces] = useState(10);
    const [hcTextileDifficulty, setHcTextileDifficulty] = useState('medium');
    const [hcInternalArchitecture, setHcInternalArchitecture] = useState({ canvas: false, lining: false, cups: false, bones: false, pads: false });
    const [hcHandcraft, setHcHandcraft] = useState({ handHem: false, handButtonholes: 0, handDraping: false, handEmbroideryHours: 0 });
    const [hcFittingsCount, setHcFittingsCount] = useState(2);
    const [hcToileNeeded, setHcToileNeeded] = useState(false);

    // New parameters integrated from the feedback
    const [fabricProvidedBy, setFabricProvidedBy] = useState<'Cliente' | 'Taller'>('Cliente');
    const [totalFabricCost, setTotalFabricCost] = useState<number>(100000);
    const [insumosCost, setInsumosCost] = useState<number>(15000);
    const [fittingCost, setFittingCost] = useState<number>(25000);

    const [customPriceInput, setCustomPriceInput] = useState<string>('');
    const [hcTimeSettings, setHcTimeSettings] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            getCostSettings().then((costData: any) => {
                if (costData) {
                    setHourlyRate(costData.labor_hourly_rate);
                    setFixedCost(costData.operational_fixed_cost);
                    setMarginPercentage(costData.default_margin_percentage || 20);
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
        setTotalFabricCost(tpl.materiales || 100000);
        setInsumosCost(tpl.extra || 15000);
    };

    // Calculate labor hours
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
    }, [hcPatternType, hcPatternPieces, hcInternalArchitecture, hcHandcraft, hcFittingsCount, hcToileNeeded, hcTimeSettings]);

    // Financial calculations
    const laborBase = hcComputedHours * hourlyRate;

    // Difficulty multiplier surcharges
    const difficultyMultiplier = useMemo(() => {
        const settings = hcTimeSettings || {
            TELA_MULT: { easy: 1.0, medium: 1.15, hard: 1.35, haute: 1.6 }
        };
        const mult = settings.TELA_MULT[hcTextileDifficulty] || 1.0;
        return mult;
    }, [hcTextileDifficulty, hcTimeSettings]);

    const difficultySurcharge = (laborBase * difficultyMultiplier) - laborBase;

    // Risk and Fabric calculation
    const { fabricRisk, fabricCostCharged } = useMemo(() => {
        let risk = 0;
        let charged = 0;
        if (fabricProvidedBy === 'Cliente') {
            // Client brings fabric costing $100.000+ (10% manipulation risk fee)
            risk = totalFabricCost >= 100000 ? totalFabricCost * 0.10 : 0;
        } else {
            // Workshop buys fabric: charge fabric cost + 5% handling risk
            charged = totalFabricCost;
            risk = totalFabricCost * 0.05;
        }
        return { fabricRisk: Math.round(risk), fabricCostCharged: Math.round(charged) };
    }, [fabricProvidedBy, totalFabricCost]);

    // Insumos and tests
    const extrasTotal = insumosCost + fittingCost;

    // Subtotal Técnico
    const subtotal = laborBase + difficultySurcharge + fabricRisk + fabricCostCharged + extrasTotal;

    // Real Profit Margin: total = subtotal / (1 - marginPercentage/100)
    const calculatedPrice = useMemo(() => {
        if (marginPercentage >= 100) return subtotal;
        return Math.round(subtotal / (1 - (marginPercentage / 100)));
    }, [subtotal, marginPercentage]);

    const marginAmount = calculatedPrice - subtotal;
    const effectiveHourlyRate = hcComputedHours > 0 ? (calculatedPrice - fabricCostCharged) / hcComputedHours : 0;

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
                setTotalFabricCost(ai.materiales || 100000);
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
                materials: totalFabricCost,
                extra: insumosCost + fittingCost,
                image: imagePreview
            },
            costBreakdown: {
                labor: laborBase + difficultySurcharge,
                materials: fabricCostCharged + insumosCost + fittingCost,
                fixed: fixedCost,
                margin: marginPercentage,
                risk: fabricRisk
            }
        });
        
        // Reset state
        setImagePreview(null);
        setCustomPriceInput('');
        onClose();
    };

    if (!isOpen) return null;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            {/* Elegant Luxury Container with Glassmorphism */}
            <div 
                className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border"
                style={{
                    background: 'rgba(26, 26, 26, 0.95)',
                    borderColor: 'rgba(193, 127, 95, 0.3)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b flex justify-between items-center bg-[#1A1A1A]" style={{ borderColor: 'rgba(193, 127, 95, 0.15)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(193, 127, 95, 0.15)', border: '1px solid rgba(193, 127, 95, 0.3)' }}>
                            <Scissors className="w-5 h-5 text-[#C17F5F]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-serif font-black tracking-widest text-white uppercase">Calculadora</h2>
                            <p className="text-[10px] text-[#C17F5F] uppercase tracking-widest font-semibold mt-0.5">Alta Costura & Confección Fina</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full border border-white/5 hover:border-white/10">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#161616] flex flex-col lg:flex-row gap-6">
                    
                    {/* Left panel: Preview, quick templates, and summaries */}
                    <div className="w-full lg:w-[35%] space-y-6">
                        
                        {/* IA Sketch upload */}
                        <div className="p-4 rounded-xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(193, 127, 95, 0.15)' }}>
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C17F5F] mb-3">Inteligencia Artificial</h3>
                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                            
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-zinc-500 cursor-pointer transition-all relative overflow-hidden group"
                                style={{ borderColor: 'rgba(193, 127, 95, 0.2)', background: 'rgba(0, 0, 0, 0.3)' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(193, 127, 95, 0.6)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(193, 127, 95, 0.2)'}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity group-hover:opacity-60" />
                                ) : null}
                                
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center relative z-10 p-3 text-center bg-black/60 rounded-lg">
                                        <Loader2 className="w-6 h-6 animate-spin mb-2 text-[#C17F5F]" />
                                        <span className="text-xs font-medium text-[#C17F5F]">Analizando diseño...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center relative z-10 bg-black/60 p-3 rounded-lg backdrop-blur-sm">
                                        <Sparkles className="w-5 h-5 mb-2 text-[#C17F5F]" />
                                        <span className="text-[10px] uppercase font-bold text-white tracking-widest">Sube boceto o referencia</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Templates */}
                        <div className="p-4 rounded-xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(193, 127, 95, 0.15)' }}>
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C17F5F] mb-3">Plantillas Rápidas</h3>
                            <div className="flex flex-wrap gap-2">
                                {DEFAULT_HC_TEMPLATES.map(tpl => (
                                    <button 
                                        key={tpl.id}
                                        onClick={() => handleApplyTemplate(tpl)}
                                        className="px-3.5 py-2 text-xs font-semibold rounded-full transition-all border border-white/5 text-white/80 bg-white/5 hover:bg-[#C17F5F] hover:text-white"
                                    >
                                        {tpl.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cost summary card */}
                        <div className="p-5 rounded-xl border text-white" style={{ background: 'linear-gradient(135deg, rgba(193,127,95,0.12) 0%, rgba(26,26,26,0.3) 100%)', borderColor: 'rgba(193, 127, 95, 0.25)' }}>
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C17F5F] mb-4 border-b border-white/5 pb-2">Resumen de Cotización</h3>
                            
                            <div className="space-y-3 mb-5 text-xs text-white/70">
                                <div className="flex justify-between">
                                    <span>Horas de Trabajo</span>
                                    <span className="font-mono text-white">{hcComputedHours} hrs</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Mano de Obra Base</span>
                                    <span className="font-mono text-white">{formatCurrency(laborBase)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Suma Dificultad Textil</span>
                                    <span className="font-mono text-[#C17F5F]">{formatCurrency(difficultySurcharge)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Seguro Riesgo Manipulación</span>
                                    <span className="font-mono text-white">{formatCurrency(fabricRisk)}</span>
                                </div>
                                {fabricProvidedBy === 'Taller' && (
                                    <div className="flex justify-between">
                                        <span>Tela (Costo Taller)</span>
                                        <span className="font-mono text-white">{formatCurrency(fabricCostCharged)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Insumos y Pruebas</span>
                                    <span className="font-mono text-white">{formatCurrency(extrasTotal)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-white/5 font-semibold text-white">
                                    <span>Subtotal Técnico</span>
                                    <span className="font-mono">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-[#e8b99a]">
                                    <span>Margen Taller ({marginPercentage}%)</span>
                                    <span className="font-mono">{formatCurrency(marginAmount)}</span>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-white/10">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#C17F5F] mb-1">Precio Total Sugerido</label>
                                <p className="text-3xl font-serif font-black text-white mb-4">{formatCurrency(calculatedPrice)}</p>
                                
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Ajuste Manual de Precio (Opcional)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="w-full px-3.5 py-2.5 bg-black/40 border rounded-lg text-sm text-white focus:outline-none focus:border-[#C17F5F] transition"
                                        style={{ borderColor: 'rgba(193,127,95,0.3)' }}
                                        placeholder="Dejar vacío para usar precio sugerido"
                                        value={customPriceInput}
                                        onChange={(e) => setCustomPriceInput(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right panel: Details and inputs parameters */}
                    <div className="w-full lg:w-[65%] space-y-6">
                        <div className="bg-[#1C1C1C] p-6 rounded-xl border border-white/5 space-y-6">
                            
                            {/* Design title */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#C17F5F] mb-2">Nombre del Diseño / Prenda</label>
                                <input 
                                    type="text"
                                    value={hcPrendaName}
                                    onChange={e => setHcPrendaName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#C17F5F] transition"
                                />
                            </div>

                            {/* Section: Pattern and materials */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Pattern settings */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C17F5F] border-b border-white/5 pb-2">Patronaje y Moldería</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[11px] text-zinc-400 mb-1">Moldería base</label>
                                            <select value={hcPatternType} onChange={e => setHcPatternType(e.target.value)} className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#C17F5F]">
                                                <option value="existing">Base Existente</option>
                                                <option value="custom">A Medida</option>
                                                <option value="draping">Draping (Maniquí)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-zinc-400 mb-1">Cantidad de piezas de moldería</label>
                                            <input type="number" value={hcPatternPieces} onChange={e => setHcPatternPieces(Number(e.target.value))} className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#C17F5F]" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Textile and materials settings */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C17F5F] border-b border-white/5 pb-2">Textil y Materiales</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[11px] text-zinc-400 mb-1">Dificultad Textil (Tela)</label>
                                            <select value={hcTextileDifficulty} onChange={e => setHcTextileDifficulty(e.target.value)} className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#C17F5F]">
                                                <option value="easy">Fácil (Algodón, Lino)</option>
                                                <option value="medium">Media (Crepe, Lana)</option>
                                                <option value="hard">Difícil (Seda, Gasa)</option>
                                                <option value="haute">Alta Costura (Encaje, Pedrería)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-zinc-400 mb-1">¿Quién aporta la tela?</label>
                                            <select value={fabricProvidedBy} onChange={e => setFabricProvidedBy(e.target.value as any)} className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#C17F5F]">
                                                <option value="Cliente">El Cliente (Aplica seguro de corte)</option>
                                                <option value="Taller">El Taller (Compra por el taller)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-zinc-400 mb-1">Costo estimado de la tela ($)</label>
                                            <input type="number" value={totalFabricCost} onChange={e => setTotalFabricCost(Number(e.target.value))} className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#C17F5F]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Extras and fittings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C17F5F] mb-3">Insumos y Avíos</h3>
                                    <div>
                                        <label className="block text-[11px] text-zinc-400 mb-1">Insumos Extras (Hilos, cierres, botones) ($)</label>
                                        <input type="number" value={insumosCost} onChange={e => setInsumosCost(Number(e.target.value))} className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#C17F5F]" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C17F5F] mb-3">Pruebas de Calce</h3>
                                    <div>
                                        <label className="block text-[11px] text-zinc-400 mb-1">Costo por pruebas y muestra (Toile) ($)</label>
                                        <input type="number" value={fittingCost} onChange={e => setFittingCost(Number(e.target.value))} className="w-full px-3 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#C17F5F]" />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Internal architecture */}
                            <div className="pt-4 border-t border-white/5">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C17F5F] mb-3">Arquitectura Interna</h3>
                                <div className="flex flex-wrap gap-x-6 gap-y-3">
                                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer select-none">
                                        <input type="checkbox" checked={hcInternalArchitecture.canvas} onChange={e => setHcInternalArchitecture({...hcInternalArchitecture, canvas: e.target.checked})} className="rounded bg-black border-white/10 text-[#C17F5F] focus:ring-[#C17F5F]" />
                                        Entretelado Completo
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer select-none">
                                        <input type="checkbox" checked={hcInternalArchitecture.lining} onChange={e => setHcInternalArchitecture({...hcInternalArchitecture, lining: e.target.checked})} className="rounded bg-black border-white/10 text-[#C17F5F] focus:ring-[#C17F5F]" />
                                        Forrería Fina
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer select-none">
                                        <input type="checkbox" checked={hcInternalArchitecture.cups} onChange={e => setHcInternalArchitecture({...hcInternalArchitecture, cups: e.target.checked})} className="rounded bg-black border-white/10 text-[#C17F5F] focus:ring-[#C17F5F]" />
                                        Copas Armadas
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer select-none">
                                        <input type="checkbox" checked={hcInternalArchitecture.bones} onChange={e => setHcInternalArchitecture({...hcInternalArchitecture, bones: e.target.checked})} className="rounded bg-black border-white/10 text-[#C17F5F] focus:ring-[#C17F5F]" />
                                        Ballenas / Corsetería
                                    </label>
                                </div>
                            </div>

                            {/* Section: Handcraft work */}
                            <div className="pt-4 border-t border-white/5">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#C17F5F] mb-3">Acabados y Pruebas a Mano</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer select-none">
                                            <input type="checkbox" checked={hcHandcraft.handHem} onChange={e => setHcHandcraft({...hcHandcraft, handHem: e.target.checked})} className="rounded bg-black border-white/10 text-[#C17F5F] focus:ring-[#C17F5F]" />
                                            Basta / Ruedo a Mano
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer select-none">
                                            <input type="checkbox" checked={hcHandcraft.handDraping} onChange={e => setHcHandcraft({...hcHandcraft, handDraping: e.target.checked})} className="rounded bg-black border-white/10 text-[#C17F5F] focus:ring-[#C17F5F]" />
                                            Drapeado a Mano
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer select-none">
                                            <input type="checkbox" checked={hcToileNeeded} onChange={e => setHcToileNeeded(e.target.checked)} className="rounded bg-black border-white/10 text-[#C17F5F] focus:ring-[#C17F5F]" />
                                            Toile (Prueba en Crea)
                                        </label>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs text-zinc-300">Ojales hechos a mano (unid)</label>
                                            <input type="number" value={hcHandcraft.handButtonholes} onChange={e => setHcHandcraft({...hcHandcraft, handButtonholes: Number(e.target.value)})} className="w-16 px-2 py-1 text-sm bg-black/40 border border-white/10 rounded-md text-right text-white" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs text-zinc-300">Horas de Bordado a mano (hrs)</label>
                                            <input type="number" value={hcHandcraft.handEmbroideryHours} onChange={e => setHcHandcraft({...hcHandcraft, handEmbroideryHours: Number(e.target.value)})} className="w-16 px-2 py-1 text-sm bg-black/40 border border-white/10 rounded-md text-right text-white" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs text-zinc-300">Cantidad de Pruebas fijadas</label>
                                            <input type="number" value={hcFittingsCount} onChange={e => setHcFittingsCount(Number(e.target.value))} className="w-16 px-2 py-1 text-sm bg-black/40 border border-white/10 rounded-md text-right text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Margin controls */}
                            <div className="pt-4 border-t border-white/5 space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#C17F5F]">Margen de Ganancia del Taller</label>
                                    <span className="text-white font-semibold text-sm font-mono">{marginPercentage}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="60" 
                                    value={marginPercentage} 
                                    onChange={e => setMarginPercentage(Number(e.target.value))}
                                    className="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-[#C17F5F]" 
                                />
                                <p className="text-[10px] text-zinc-500">Ajusta el porcentaje de margen para el cálculo del precio de venta sugerido.</p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="px-6 py-4 border-t bg-[#1A1A1A] flex justify-end gap-3" style={{ borderColor: 'rgba(193, 127, 95, 0.15)' }}>
                    <Button variant="outline" onClick={onClose} className="border-white/10 text-white bg-transparent hover:bg-white/5">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleAddOrder} 
                        style={{
                            background: 'linear-gradient(135deg, rgba(193,127,95,0.9) 0%, rgba(168,100,68,0.95) 100%)',
                            border: '1px solid rgba(232,185,154,0.3)',
                            color: '#fff',
                        }}
                        className="hover:opacity-90 font-bold transition-all shadow-lg shadow-[#C17F5F]/10"
                    >
                        Añadir a la Orden
                    </Button>
                </div>
            </div>
        </div>
    );
}
