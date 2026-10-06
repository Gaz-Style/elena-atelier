'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Scissors, Clock, Calendar, CheckCircle2,
    AlertTriangle, Loader2, ImageIcon, ChevronLeft, ChevronRight,
    Ruler, Layers, Sparkles, StickyNote, X
} from 'lucide-react';
import { getOrderTechSheet } from '../../../actions';

const STATUS_LABELS: Record<string, string> = {
    draft: 'Ingresado',
    cutting: 'Corte',
    sewing: 'Costura',
    finishing: 'Terminaciones',
    ready: 'Listo para Entrega',
};

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    cutting: 'bg-amber-50 text-amber-700 border-amber-200',
    sewing: 'bg-blue-50 text-blue-700 border-blue-200',
    finishing: 'bg-violet-50 text-violet-700 border-violet-200',
    ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const MILESTONE_STATUS: Record<string, { icon: any; color: string }> = {
    completed: { icon: CheckCircle2, color: 'text-emerald-600' },
    scheduled: { icon: Calendar, color: 'text-blue-600' },
    pending: { icon: Clock, color: 'text-amber-600' },
};

export default function TechSheetPage() {
    const params = useParams();
    const router = useRouter();
    const operatorId = params.operatorId as string;
    const orderId = params.orderId as string;

    const [techSheet, setTechSheet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activePhotoIdx, setActivePhotoIdx] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    useEffect(() => {
        getOrderTechSheet(orderId).then(data => {
            setTechSheet(data);
            setLoading(false);
        });
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-7 h-7 text-[#C17F5F] animate-spin" />
                <p className="text-xs text-[#737373] uppercase tracking-widest font-semibold">Cargando ficha técnica...</p>
            </div>
        );
    }

    if (!techSheet) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
                <AlertTriangle className="w-8 h-8 text-[#C17F5F]" />
                <p className="text-sm text-[#4A4A4A]">Orden no encontrada.</p>
                <button onClick={() => router.back()} className="text-xs text-[#C17F5F] underline">Volver</button>
            </div>
        );
    }

    const photos = techSheet.referencePhotos || [];
    const milestones = techSheet.milestones || [];

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Sin fecha';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatShortDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // Parse notas técnicas (buscar patrones de estructura)
    const notesLines = techSheet.notes ? techSheet.notes.split('\n').filter((l: string) => l.trim()) : [];

    const progressPercent = techSheet.estimatedHours > 0
        ? Math.min(100, Math.round((techSheet.scheduledHours / techSheet.estimatedHours) * 100))
        : 0;

    return (
        <div className="min-h-screen pb-16">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] px-4 md:px-6 py-4 shadow-sm">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-[#737373] hover:text-[#1A1A1A] transition-colors p-1.5 -ml-1.5 rounded-full hover:bg-[#F5F5F0]">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <Scissors className="w-3.5 h-3.5 text-[#C17F5F] shrink-0" />
                            <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-[#737373]">Ficha Técnica</span>
                        </div>
                        <h1 className="font-serif text-lg font-bold text-[#1A1A1A] leading-tight truncate">
                            {techSheet.description}
                        </h1>
                    </div>
                    <span className={`text-[8px] uppercase font-bold tracking-widest px-2.5 py-1.5 rounded-full border shrink-0 ${STATUS_COLORS[techSheet.status] || 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                        {STATUS_LABELS[techSheet.status] || techSheet.status}
                    </span>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-6">

                {/* ═══════════════ FOTOS DE REFERENCIA ═══════════════ */}
                {photos.length > 0 && (
                    <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-5 py-3 border-b border-[#F5F5F0] flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-[#C17F5F]" />
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#737373]">
                                Fotos de Referencia ({photos.length})
                            </span>
                        </div>

                        {/* Photo carousel */}
                        <div className="relative bg-[#1A1A1A]">
                            <div
                                className="aspect-[4/3] flex items-center justify-center cursor-pointer"
                                onClick={() => setLightboxOpen(true)}
                            >
                                <img
                                    src={photos[activePhotoIdx]?.url}
                                    alt={`Referencia ${activePhotoIdx + 1}`}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>

                            {/* Nav arrows */}
                            {photos.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setActivePhotoIdx((activePhotoIdx - 1 + photos.length) % photos.length)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white/80 p-2 rounded-full hover:bg-black/60 transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setActivePhotoIdx((activePhotoIdx + 1) % photos.length)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white/80 p-2 rounded-full hover:bg-black/60 transition-all"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </>
                            )}

                            {/* Dots indicator */}
                            {photos.length > 1 && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {photos.map((_: any, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setActivePhotoIdx(i)}
                                            className={`w-2 h-2 rounded-full transition-all ${
                                                i === activePhotoIdx ? 'bg-white scale-125' : 'bg-white/40'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {photos.length > 1 && (
                            <div className="p-3 flex gap-2 overflow-x-auto">
                                {photos.map((photo: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActivePhotoIdx(i)}
                                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                                            i === activePhotoIdx ? 'border-[#C17F5F] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Photo notes */}
                        {photos[activePhotoIdx]?.notes && (
                            <div className="px-5 py-3 border-t border-[#F5F5F0] text-xs text-[#4A4A4A] italic">
                                &quot;{photos[activePhotoIdx].notes}&quot;
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════ DETALLES GENERALES ═══════════════ */}
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#F5F5F0] pb-3">
                        <Layers className="w-4 h-4 text-[#C17F5F]" />
                        <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#737373]">Detalles del Trabajo</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-[9px] uppercase tracking-widest font-bold text-[#737373] block mb-1">Cliente</span>
                            <span className="text-sm font-medium text-[#1A1A1A]">{techSheet.customerName}</span>
                        </div>
                        <div>
                            <span className="text-[9px] uppercase tracking-widest font-bold text-[#737373] block mb-1">Tipo</span>
                            <span className="text-sm font-medium text-[#1A1A1A] capitalize">{techSheet.orderType || 'General'}</span>
                        </div>
                        <div>
                            <span className="text-[9px] uppercase tracking-widest font-bold text-[#737373] block mb-1">Horas Estimadas</span>
                            <span className="text-sm font-bold text-[#C17F5F]">{techSheet.estimatedHours}h</span>
                        </div>
                        <div>
                            <span className="text-[9px] uppercase tracking-widest font-bold text-[#737373] block mb-1">Horas Planificadas</span>
                            <span className="text-sm font-bold text-[#1A1A1A]">{techSheet.scheduledHours}h</span>
                        </div>
                    </div>

                    {/* Progress */}
                    {techSheet.estimatedHours > 0 && (
                        <div className="pt-3 border-t border-[#F5F5F0]">
                            <div className="flex items-center justify-between text-[9px] text-[#737373] mb-1.5">
                                <span className="uppercase tracking-widest font-bold">Progreso de Planificación</span>
                                <span className="font-bold">{progressPercent}%</span>
                            </div>
                            <div className="w-full bg-[#F5F5F0] h-2.5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#C17F5F] rounded-full transition-all duration-700"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Deadline */}
                    {techSheet.deadline && (
                        <div className="pt-3 border-t border-[#F5F5F0] flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#C17F5F]" />
                            <div>
                                <span className="text-[9px] uppercase tracking-widest font-bold text-[#737373] block">Fecha de Entrega</span>
                                <span className="text-sm font-semibold text-[#1A1A1A]">{formatDate(techSheet.deadline)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══════════════ MEDIDAS DEL CLIENTE ═══════════════ */}
                {techSheet.customerMeasurements && (
                    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-[#F5F5F0] pb-3 mb-4">
                            <Ruler className="w-4 h-4 text-[#C17F5F]" />
                            <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#737373]">Medidas del Cliente</h2>
                        </div>
                        <div className="bg-[#FDFCF8] border border-[#F5F5F0] rounded-xl p-4">
                            {techSheet.customerMeasurements.split('\n').map((line: string, i: number) => (
                                <p key={i} className="text-sm text-[#4A4A4A] leading-relaxed font-medium mb-1.5 last:mb-0">
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══════════════ NOTAS DEL DISEÑADOR ═══════════════ */}
                {notesLines.length > 0 && (
                    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-[#F5F5F0] pb-3 mb-4">
                            <StickyNote className="w-4 h-4 text-[#C17F5F]" />
                            <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#737373]">Notas del Diseñador</h2>
                        </div>
                        <div className="bg-[#FDFCF8] border border-[#F5F5F0] rounded-xl p-4">
                            {notesLines.map((line: string, i: number) => (
                                <p key={i} className="text-sm text-[#4A4A4A] leading-relaxed font-light mb-2 last:mb-0">
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══════════════ CITAS / PRUEBAS ═══════════════ */}
                {milestones.length > 0 && (
                    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-[#F5F5F0] pb-3 mb-4">
                            <Sparkles className="w-4 h-4 text-[#C17F5F]" />
                            <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#737373]">
                                Citas y Pruebas ({milestones.length})
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {milestones.map((m: any) => {
                                const statusInfo = MILESTONE_STATUS[m.status] || MILESTONE_STATUS.pending;
                                const Icon = statusInfo.icon;
                                return (
                                    <div key={m.id} className="flex items-start gap-3 py-2">
                                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${statusInfo.color}`} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-[#1A1A1A]">{m.title}</p>
                                            {m.scheduled_date && (
                                                <p className="text-[10px] text-[#737373] mt-0.5">
                                                    {formatShortDate(m.scheduled_date)} · {formatTime(m.scheduled_date)}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`text-[8px] uppercase font-bold tracking-widest px-2 py-1 rounded-full ${
                                            m.status === 'completed'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                                        }`}>
                                            {m.status === 'completed' ? 'Realizada' : 'Programada'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* ═══════════════ LIGHTBOX ═══════════════ */}
            {lightboxOpen && photos.length > 0 && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
                    <button className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10" onClick={() => setLightboxOpen(false)}>
                        <X className="w-6 h-6" />
                    </button>
                    <img
                        src={photos[activePhotoIdx]?.url}
                        alt={`Referencia ${activePhotoIdx + 1}`}
                        className="max-w-[95vw] max-h-[90vh] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setActivePhotoIdx((activePhotoIdx - 1 + photos.length) % photos.length); }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 text-white/80 p-3 rounded-full hover:bg-white/20 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setActivePhotoIdx((activePhotoIdx + 1) % photos.length); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 text-white/80 p-3 rounded-full hover:bg-white/20 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
