'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getCostSettings } from '@/app/admin/finance/actions';
import { X, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HauteCoutureModal({ isOpen, onClose, onAddToCart }: { isOpen: boolean, onClose: () => void, onAddToCart: (item: any) => void }) {
    const [hourlyRate, setHourlyRate] = useState<number>(25000);
    const [marginPercentage, setMarginPercentage] = useState<number>(20);

    // Form inputs matching the requested simple calculator structure
    const [hcPrendaName, setHcPrendaName] = useState('Diseño de Alta Costura');
    const [hours, setHours] = useState<number>(15);
    const [fabricMultiplier, setFabricMultiplier] = useState<number>(1.3); // Default to Silk/Organza
    const [fabricCost, setFabricCost] = useState<number>(120000);
    const [fabricProvidedBy, setFabricProvidedBy] = useState<'Cliente' | 'Taller'>('Cliente');
    const [insumosCost, setInsumosCost] = useState<number>(20000);
    const [fittingCost, setFittingCost] = useState<number>(30000);

    const [customPriceInput, setCustomPriceInput] = useState<string>('');

    // Fetch defaults from settings
    useEffect(() => {
        if (isOpen) {
            getCostSettings().then((costData: any) => {
                if (costData) {
                    setHourlyRate(costData.labor_hourly_rate || 25000);
                    setMarginPercentage(costData.default_margin_percentage || 20);
                }
            });
        }
    }, [isOpen]);

    // Financial Calculations (Real margin calculation)
    const { laborBase, difficultySurcharge, fabricRisk, fabricCostCharged, extrasTotal, subtotal, calculatedPrice, marginAmount, effectiveHourlyRate } = useMemo(() => {
        const lBase = hours * hourlyRate;
        const diffSurcharge = (lBase * fabricMultiplier) - lBase;

        let risk = 0;
        let charged = 0;

        if (fabricProvidedBy === 'Cliente') {
            // Client fabric: charge 10% risk fee for manipulation if value is >= 100,000 CLP
            risk = fabricCost >= 100000 ? fabricCost * 0.10 : 0;
        } else {
            // Workshop fabric: charge fabric cost + 5% handling risk
            charged = fabricCost;
            risk = fabricCost * 0.05;
        }

        const extTotal = insumosCost + fittingCost;
        const sub = lBase + diffSurcharge + risk + charged + extTotal;

        // True margin formula: total = subtotal / (1 - margin%)
        const total = marginPercentage < 100 ? Math.round(sub / (1 - (marginPercentage / 100))) : sub;
        const mAmount = total - sub;

        const effRate = hours > 0 ? (total - charged) / hours : 0;

        return {
            laborBase: Math.round(lBase),
            difficultySurcharge: Math.round(diffSurcharge),
            fabricRisk: Math.round(risk),
            fabricCostCharged: Math.round(charged),
            extrasTotal: Math.round(extTotal),
            subtotal: Math.round(sub),
            calculatedPrice: Math.round(total),
            marginAmount: Math.round(mAmount),
            effectiveHourlyRate: Math.round(effRate)
        };
    }, [hours, hourlyRate, fabricMultiplier, fabricCost, fabricProvidedBy, insumosCost, fittingCost, marginPercentage]);

    const handleAddOrder = () => {
        const finalPrice = customPriceInput ? Math.round(Number(customPriceInput.replace(/\D/g, ''))) : calculatedPrice;
        
        onAddToCart({
            id: crypto.randomUUID(),
            name: hcPrendaName,
            price: finalPrice,
            category: 'Alta Costura',
            isCustom: true,
            details: {
                hours: hours,
                materials: fabricCost,
                extra: insumosCost + fittingCost,
                image: null
            },
            costBreakdown: {
                labor: laborBase + difficultySurcharge,
                materials: fabricCostCharged + insumosCost + fittingCost,
                margin: marginPercentage,
                risk: fabricRisk
            }
        });
        
        // Reset custom input
        setCustomPriceInput('');
        onClose();
    };

    if (!isOpen) return null;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Elegant Light Cream-White Modal */}
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-zinc-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-[#FCFAF7]">
                    <div className="flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-[#C17F5F]" />
                        <h2 className="text-md font-serif font-bold text-[#1A1A1A] uppercase tracking-wider">
                            Cotización Alta Costura
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-[#1A1A1A] transition-colors p-1.5 hover:bg-zinc-100 rounded-full">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                {/* Scrollable container with two columns */}
                <div className="flex-1 overflow-y-auto p-6 bg-white flex flex-col md:flex-row gap-6">
                    
                    {/* Left Column: Form Fields */}
                    <div className="w-full md:w-[60%] space-y-5">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C17F5F] border-b border-zinc-100 pb-2">
                            Parámetros del Proyecto
                        </h3>

                        {/* Name */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-600 mb-1">Nombre del Diseño / Prenda</label>
                            <input 
                                type="text"
                                value={hcPrendaName}
                                onChange={e => setHcPrendaName(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C17F5F] transition"
                            />
                        </div>

                        {/* Hours & Hourly Rate */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Horas Estimadas</label>
                                <input 
                                    type="number"
                                    min="1"
                                    value={hours}
                                    onChange={e => setHours(Math.max(1, Number(e.target.value)))}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C17F5F] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Tarifa Base por Hora</label>
                                <input 
                                    type="number"
                                    min="1"
                                    value={hourlyRate}
                                    onChange={e => setHourlyRate(Math.max(1, Number(e.target.value)))}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C17F5F] transition"
                                />
                            </div>
                        </div>

                        {/* Fabric Type Selection */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-600 mb-1">Tipo de Tela / Complejidad Textil</label>
                            <select 
                                value={fabricMultiplier} 
                                onChange={e => setFabricMultiplier(Number(e.target.value))} 
                                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C17F5F] transition"
                            >
                                <option value="1.0">Estándar / Algodón / Mezclas (+0% tiempo extra)</option>
                                <option value="1.15">Delicada / Elástica / Licra (+15% tiempo extra)</option>
                                <option value="1.25">Terciopelo / Pelo / Estampados (+25% tiempo extra)</option>
                                <option value="1.35">Seda / Satén / Chifón / Organza (+35% tiempo extra)</option>
                                <option value="1.6">Alta Costura / Encaje Fino / Pedrería (+60% tiempo extra)</option>
                            </select>
                        </div>

                        {/* Fabric Cost & Provider */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Costo Estimado de la Tela ($)</label>
                                <input 
                                    type="number"
                                    min="0"
                                    value={fabricCost}
                                    onChange={e => setFabricCost(Math.max(0, Number(e.target.value)))}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C17F5F] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">¿Quién Aporta la Tela?</label>
                                <select 
                                    value={fabricProvidedBy} 
                                    onChange={e => setFabricProvidedBy(e.target.value as any)} 
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C17F5F] transition"
                                >
                                    <option value="Cliente">El Cliente (Aplica seguro de corte)</option>
                                    <option value="Taller">El Taller (Se incluye en precio final)</option>
                                </select>
                            </div>
                        </div>

                        {/* Insumos & Fittings */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Insumos Extras ($)</label>
                                <input 
                                    type="number"
                                    min="0"
                                    value={insumosCost}
                                    onChange={e => setInsumosCost(Math.max(0, Number(e.target.value)))}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C17F5F] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-600 mb-1">Pruebas de Calce / Muestra ($)</label>
                                <input 
                                    type="number"
                                    min="0"
                                    value={fittingCost}
                                    onChange={e => setFittingCost(Math.max(0, Number(e.target.value)))}
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C17F5F] transition"
                                />
                            </div>
                        </div>

                        {/* Margin Slider */}
                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between items-center text-xs text-zinc-700">
                                <label className="font-medium">Margen de Ganancia Comercial</label>
                                <span className="font-semibold text-[#C17F5F]">{marginPercentage}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="60" 
                                value={marginPercentage} 
                                onChange={e => setMarginPercentage(Number(e.target.value))}
                                className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#C17F5F]" 
                            />
                        </div>
                    </div>

                    {/* Right Column: Calculations & Total Price */}
                    <div className="w-full md:w-[40%] space-y-6">
                        
                        {/* Final Total Display */}
                        <div className="p-6 rounded-xl border border-zinc-150 shadow-sm text-center space-y-2 bg-[#FCFAF7]">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C17F5F] block">Total a Cobrar</span>
                            <div className="text-3xl font-serif font-black text-[#1A1A1A]">
                                {formatCurrency(customPriceInput ? Number(customPriceInput.replace(/\D/g, '')) : calculatedPrice)}
                            </div>
                            <div className="pt-2 border-t border-zinc-200 flex justify-between text-xs text-zinc-500">
                                <span>Tarifa Real / Hora:</span>
                                <span className="font-semibold text-zinc-700">{formatCurrency(effectiveHourlyRate)} / hr</span>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-2">
                                Desglose de Costos
                            </h4>

                            <div className="space-y-2 text-xs text-zinc-600">
                                <div className="flex justify-between py-1 border-b border-zinc-50">
                                    <span>Mano de Obra Base:</span>
                                    <span className="font-medium text-zinc-800">{formatCurrency(laborBase)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-zinc-50">
                                    <span>Surcharge Dificultad:</span>
                                    <span className="font-medium text-[#C17F5F]">{formatCurrency(difficultySurcharge)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-zinc-50">
                                    <span>Seguro de Manipulación:</span>
                                    <span className="font-medium text-zinc-800">{formatCurrency(fabricRisk)}</span>
                                </div>
                                {fabricProvidedBy === 'Taller' && (
                                    <div className="flex justify-between py-1 border-b border-zinc-50">
                                        <span>Tela (Costo Taller):</span>
                                        <span className="font-medium text-zinc-800">{formatCurrency(fabricCostCharged)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-1 border-b border-zinc-50">
                                    <span>Insumos y Pruebas:</span>
                                    <span className="font-medium text-zinc-800">{formatCurrency(extrasTotal)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-zinc-50 font-semibold text-zinc-700">
                                    <span>Subtotal Técnico:</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-[#C17F5F]">
                                    <span>Margen Taller ({marginPercentage}%):</span>
                                    <span>{formatCurrency(marginAmount)}</span>
                                </div>
                            </div>

                            {/* Adjustment field */}
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

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-zinc-100 bg-[#FCFAF7] flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="border-zinc-200 hover:bg-zinc-100 text-zinc-600 bg-white">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleAddOrder}
                        className="bg-[#C17F5F] hover:bg-[#a96e51] text-white font-bold transition-all shadow-md shadow-[#C17F5F]/15"
                    >
                        Añadir a la Orden
                    </Button>
                </div>
            </div>
        </div>
    );
}
