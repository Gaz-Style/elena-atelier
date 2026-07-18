'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Trash2, Tag, StickyNote, Loader2, Image as ImageIcon, Heart } from 'lucide-react';
import { getBridalInspirations, addBridalInspiration, deleteBridalInspiration } from '@/app/admin/novias/actions';

interface InspirationItem {
    id: string;
    image_url: string;
    category: string;
    notes?: string;
    created_at: string;
}

interface InspirationMoodboardProps {
    projectId: string;
}

const CATEGORIES = [
    { id: 'vestido', label: 'El Vestido', color: 'border-rose-300 hover:text-rose-400' },
    { id: 'ramo', label: 'El Ramo', color: 'border-emerald-300 hover:text-emerald-400' },
    { id: 'iglesia', label: 'Iglesia / Altar', color: 'border-sky-300 hover:text-sky-400' },
    { id: 'otros', label: 'Detalles / Deco', color: 'border-amber-300 hover:text-amber-400' },
];

export default function InspirationMoodboard({ projectId }: InspirationMoodboardProps) {
    const [activeCategory, setActiveCategory] = useState<string>('vestido');
    const [items, setItems] = useState<InspirationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newNotes, setNewNotes] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadInspirations();
    }, [projectId]);

    async function loadInspirations() {
        setLoading(true);
        try {
            const data = await getBridalInspirations(projectId);
            setItems(data as InspirationItem[]);
        } catch (e) {
            console.error('Error loading inspirations:', e);
        } finally {
            setLoading(false);
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Max 4MB to prevent excessive Base64 length in fallback
        if (file.size > 4 * 1024 * 1024) {
            setError('La imagen es demasiado grande. El límite es de 4MB.');
            return;
        }

        setUploading(true);
        setError('');

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            try {
                const res = await addBridalInspiration(projectId, base64data, activeCategory, newNotes);
                if (res.success) {
                    setNewNotes('');
                    await loadInspirations();
                } else {
                    setError('Error al subir la inspiración.');
                }
            } catch (err: any) {
                setError(err.message || 'Error al subir.');
            } finally {
                setUploading(false);
            }
        };
        reader.onerror = () => {
            setError('Error al leer el archivo.');
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = async (itemId: string) => {
        if (!confirm('¿Segura que deseas eliminar esta imagen de tu moodboard?')) return;
        setLoading(true);
        try {
            const res = await deleteBridalInspiration(projectId, itemId);
            if (res.success) {
                await loadInspirations();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item => item.category === activeCategory);

    return (
        <div className="space-y-8 bg-[#111111]/80 border border-white/10 p-6 md:p-8 rounded-lg backdrop-blur-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                    <h2 className="font-serif text-2xl text-white italic flex items-center gap-2">
                        <Heart className="w-5 h-5 text-[#C17F5F]" /> Tablero de Inspiración
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 font-light">
                        Guarda aquí tus fotos favoritas para el vestido, ramo, altar y accesorios que te sirvan de referencia.
                    </p>
                </div>
            </div>

            {/* Category Selector Tabs */}
            <div className="flex border-b border-white/10 gap-1 overflow-x-auto">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setActiveCategory(cat.id);
                            setError('');
                        }}
                        className={`pb-3 px-4 text-xs uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeCategory === cat.id ? 'border-[#C17F5F] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <Tag className="w-3.5 h-3.5" />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Upload Area */}
            <div className="bg-[#181818] border border-white/5 rounded-lg p-6 max-w-xl mx-auto space-y-4">
                <div className="space-y-1 relative group">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Nota / Detalle de la Idea</label>
                    <input 
                        type="text" 
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        placeholder="Ej: Encaje ilusión para la espalda, ramo silvestre..."
                        className="w-full bg-transparent border-b border-white/10 focus:border-[#C17F5F] py-2 text-xs text-white outline-none transition-colors placeholder-white/10" 
                    />
                </div>

                <div className="flex justify-center">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-[#C17F5F]/50 rounded-lg p-6 w-full cursor-pointer transition-colors group">
                        {uploading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-[#C17F5F]" />
                        ) : (
                            <ImageIcon className="w-8 h-8 text-gray-500 group-hover:text-[#C17F5F] transition-colors mb-2" />
                        )}
                        <span className="text-xs text-gray-400 group-hover:text-white transition-colors font-medium">
                            {uploading ? 'Subiendo imagen...' : 'Seleccionar o arrastrar foto'}
                        </span>
                        <span className="text-[9px] text-gray-600 mt-1 uppercase tracking-widest">Formatos PNG, JPG hasta 4MB</span>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            disabled={uploading} 
                            className="hidden" 
                        />
                    </label>
                </div>

                {error && (
                    <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-400 text-[10px] uppercase tracking-widest text-center rounded">
                        {error}
                    </div>
                )}
            </div>

            {/* Gallery Grid */}
            {loading && items.length === 0 ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C17F5F]" />
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-[#181818]/60 border border-white/5 rounded-lg overflow-hidden group shadow-lg flex flex-col justify-between">
                            <div className="relative aspect-square bg-[#0C0C0C] overflow-hidden">
                                <img 
                                    src={item.image_url} 
                                    alt="Inspiración" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="absolute top-2 right-2 bg-black/60 hover:bg-red-600/80 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {item.notes && (
                                <div className="p-4 border-t border-white/5">
                                    <p className="text-xs text-gray-300 italic font-light flex items-start gap-1">
                                        <StickyNote className="w-3.5 h-3.5 shrink-0 text-[#C17F5F] mt-0.5" />
                                        "{item.notes}"
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border border-white/5 border-dashed rounded-lg">
                    <ImageIcon className="w-8 h-8 mx-auto text-gray-600 mb-3" />
                    <p className="text-xs text-gray-500 font-light">Aún no hay fotos en esta categoría.</p>
                </div>
            )}
        </div>
    );
}
