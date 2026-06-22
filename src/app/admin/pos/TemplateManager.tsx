"use client";

import React, { useState } from 'react';
import { Trash2, Plus, Image as ImageIcon, Check } from 'lucide-react';

interface TemplateManagerProps {
    templates: any[];
    onUpdateTemplates: (newTemplates: any[]) => void;
    defaultTemplates: any[];
}

export default function TemplateManager({ templates, onUpdateTemplates, defaultTemplates }: TemplateManagerProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>(null);

    const handleSelectTemplate = (tpl: any) => {
        setEditingId(tpl.id);
        setFormData(JSON.parse(JSON.stringify(tpl)));
    };

    const handleCreateNew = () => {
        const newId = `custom_${Date.now()}`;
        const newTpl = {
            id: newId,
            name: 'Nueva Plantilla',
            baseHours: 10,
            molderia: 'custom',
            pieces: 10,
            tela: 'medium',
            estructura: { canvas: false, canvasHand: false, lining: false, cups: false, bones: false, pads: false },
            acabados: { handHemMeters: 0, handButtonholes: 0, handDraping: false, handEmbroideryHours: 0, upcyclingPreparation: false, techIroning: false, finalIroning: false },
            pruebas: 1,
            toile: false,
            img: ''
        };
        setEditingId(newId);
        setFormData(newTpl);
    };

    const handleSave = () => {
        if (!formData) return;
        
        let updatedList = [...templates];
        const existingIndex = updatedList.findIndex(t => t.id === formData.id);
        
        if (existingIndex >= 0) {
            updatedList[existingIndex] = formData;
        } else {
            updatedList.push(formData);
        }
        
        onUpdateTemplates(updatedList);
        setEditingId(null);
        setFormData(null);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("¿Seguro que deseas eliminar esta plantilla?")) return;
        const updatedList = templates.filter(t => t.id !== id);
        onUpdateTemplates(updatedList);
        if (editingId === id) {
            setEditingId(null);
            setFormData(null);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, img: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-sm border border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-brand-charcoal text-sm uppercase tracking-widest">Gestor de Siluetas Base</h3>
                <button 
                    onClick={handleCreateNew}
                    className="flex items-center gap-1 bg-brand-charcoal text-white px-3 py-1.5 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-colors"
                >
                    <Plus className="w-3 h-3" /> Nueva Silueta
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* List */}
                <div className="w-1/3 border-r border-gray-100 overflow-y-auto p-2 space-y-1 bg-gray-50/50">
                    {templates.map(tpl => (
                        <div 
                            key={tpl.id}
                            onClick={() => handleSelectTemplate(tpl)}
                            className={`p-3 rounded-sm cursor-pointer flex justify-between items-center group transition-colors ${editingId === tpl.id ? 'bg-brand-sand/30 border border-brand-terracotta/40' : 'bg-white border border-transparent hover:border-gray-200'}`}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-8 h-8 shrink-0 bg-gray-100 rounded-sm flex items-center justify-center overflow-hidden border border-gray-200">
                                    {(tpl.img || tpl.svg) ? (
                                        <div dangerouslySetInnerHTML={{ __html: (tpl.svg?.startsWith('<') || tpl.img?.startsWith('<')) ? (tpl.svg || tpl.img) : `<img src="${tpl.img || tpl.svg}" class="w-full h-full object-contain mix-blend-multiply" />` }} />
                                    ) : (
                                        <ImageIcon className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                                <div className="truncate">
                                    <p className="text-xs font-bold text-brand-charcoal truncate">{tpl.name}</p>
                                    <p className="text-[10px] text-gray-500">{tpl.baseHours} hrs base</p>
                                </div>
                            </div>
                            
                            {tpl.id.startsWith('custom_') && (
                                <button 
                                    onClick={(e) => handleDelete(tpl.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Editor */}
                <div className="w-2/3 overflow-y-auto p-4 md:p-6 bg-white">
                    {formData ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-lg font-serif text-brand-charcoal">Editar Silueta</h4>
                                    <p className="text-[10px] text-gray-400">ID: {formData.id}</p>
                                </div>
                                <button 
                                    onClick={handleSave}
                                    className="flex items-center gap-1 bg-brand-terracotta text-white px-4 py-2 rounded-sm text-xs uppercase tracking-widest font-bold hover:bg-brand-charcoal transition-colors shadow-sm"
                                >
                                    <Check className="w-3 h-3" /> Guardar Cambios
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Nombre de la Silueta</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-200 p-2 text-sm rounded-sm focus:ring-1 focus:ring-brand-terracotta outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-brand-terracotta">Horas Base de Confección</label>
                                    <input 
                                        type="number" step="0.5"
                                        className="w-full border border-brand-terracotta/30 bg-brand-sand/10 p-2 text-sm rounded-sm focus:ring-1 focus:ring-brand-terracotta outline-none"
                                        value={formData.baseHours}
                                        onChange={e => setFormData({...formData, baseHours: Number(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 p-4 border border-gray-100 rounded-sm bg-gray-50">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Imagen de Referencia</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-white border border-gray-200 rounded-sm overflow-hidden flex items-center justify-center">
                                        {(formData.img || formData.svg) ? (
                                            <div dangerouslySetInnerHTML={{ __html: (formData.svg?.startsWith('<') || formData.img?.startsWith('<')) ? (formData.svg || formData.img) : `<img src="${formData.img || formData.svg}" class="w-full h-full object-contain mix-blend-multiply" />` }} />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-brand-charcoal file:text-white hover:file:bg-brand-terracotta cursor-pointer transition-colors"
                                        />
                                        <p className="text-[9px] text-gray-400 mt-1">Recomendado: PNG con fondo transparente (max 1MB).</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pre-ajustes */}
                            <div>
                                <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-800 mb-3 border-b border-gray-100 pb-1">Pre-ajustes al seleccionar</h5>
                                
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase tracking-widest text-gray-500">Tipo de Moldería</label>
                                        <select 
                                            className="w-full border border-gray-200 p-2 text-xs rounded-sm focus:ring-1 focus:ring-brand-terracotta outline-none"
                                            value={formData.molderia}
                                            onChange={e => setFormData({...formData, molderia: e.target.value})}
                                        >
                                            <option value="existing">Base Existente</option>
                                            <option value="custom">Patronaje sobre Medidas</option>
                                            <option value="draping">Drapeado / Moulage</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase tracking-widest text-gray-500">N° Pruebas Predeterminadas</label>
                                        <input 
                                            type="number" min="0" max="10"
                                            className="w-full border border-gray-200 p-2 text-xs rounded-sm focus:ring-1 focus:ring-brand-terracotta outline-none"
                                            value={formData.pruebas}
                                            onChange={e => setFormData({...formData, pruebas: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h6 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">Estructura Interna</h6>
                                    <div className="space-y-2">
                                        {['canvas', 'canvasHand', 'lining', 'cups', 'bones', 'pads'].map((key) => (
                                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-3 h-3 text-brand-terracotta border-gray-300 rounded-sm focus:ring-brand-terracotta"
                                                    checked={formData.estructura?.[key] || false}
                                                    onChange={e => setFormData({
                                                        ...formData, 
                                                        estructura: { ...formData.estructura, [key]: e.target.checked }
                                                    })}
                                                />
                                                <span className="text-[10px] text-gray-700 capitalize">
                                                    {key === 'canvas' ? 'Entretela Fusión' :
                                                     key === 'canvasHand' ? 'Entretela Picada' :
                                                     key === 'lining' ? 'Forro' :
                                                     key === 'cups' ? 'Copas' :
                                                     key === 'bones' ? 'Barbas' :
                                                     key === 'pads' ? 'Hombreras' : key}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <h6 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">Acabados y Otros</h6>
                                    <div className="space-y-2">
                                        {['handDraping', 'techIroning', 'finalIroning', 'toile'].map((key) => (
                                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-3 h-3 text-brand-terracotta border-gray-300 rounded-sm focus:ring-brand-terracotta"
                                                    checked={key === 'toile' ? formData.toile : (formData.acabados?.[key] || false)}
                                                    onChange={e => {
                                                        if (key === 'toile') {
                                                            setFormData({...formData, toile: e.target.checked});
                                                        } else {
                                                            setFormData({
                                                                ...formData, 
                                                                acabados: { ...formData.acabados, [key]: e.target.checked }
                                                            });
                                                        }
                                                    }}
                                                />
                                                <span className="text-[10px] text-gray-700">
                                                    {key === 'handDraping' ? 'Drapeado a mano' :
                                                     key === 'techIroning' ? 'Planchado Técnico' :
                                                     key === 'finalIroning' ? 'Planchado Final' :
                                                     key === 'toile' ? 'Crea de Prueba' : key}
                                                </span>
                                            </label>
                                        ))}
                                        
                                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number" step="0.5" className="w-12 border border-gray-200 p-1 text-[10px] rounded-sm text-center"
                                                    value={formData.acabados?.handHemMeters || 0}
                                                    onChange={e => setFormData({...formData, acabados: {...formData.acabados, handHemMeters: Number(e.target.value)}})}
                                                />
                                                <span className="text-[10px] text-gray-700">Metros Basta Mano</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number" className="w-12 border border-gray-200 p-1 text-[10px] rounded-sm text-center"
                                                    value={formData.acabados?.handButtonholes || 0}
                                                    onChange={e => setFormData({...formData, acabados: {...formData.acabados, handButtonholes: Number(e.target.value)}})}
                                                />
                                                <span className="text-[10px] text-gray-700">Ojalillos a Mano</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                            <ImageIcon className="w-12 h-12 opacity-20" />
                            <p className="text-xs uppercase tracking-widest font-bold">Selecciona una plantilla para editar</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
