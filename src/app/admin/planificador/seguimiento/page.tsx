'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProjectGanttTimeline from '../components/ProjectGanttTimeline';

export default function TimelinePage() {
    return (
        <div className="h-screen bg-zinc-50 font-sans text-zinc-800 p-4 md:p-6 w-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="w-full mb-4 shrink-0">
                <Link 
                    href="/admin/planificador" 
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 font-bold hover:text-zinc-700 transition-colors mb-2"
                >
                    <ArrowLeft className="w-3 h-3" /> Volver al Planificador Semanal
                </Link>
                <h1 className="font-serif text-2xl md:text-3xl text-zinc-900 font-bold leading-tight">
                    Seguimiento de Trabajos y Entregas
                </h1>
                <p className="text-zinc-500 text-xs md:text-sm mt-0.5">
                    Vista unificada de programación y estado de confecciones del taller.
                </p>
            </div>

            {/* Gantt Timeline - Fits screen dynamically, scroll internally */}
            <div className="w-full flex-1 min-h-0 flex flex-col">
                <ProjectGanttTimeline 
                    className="flex-grow min-h-0" 
                    bodyHeightStyle={{ flex: '1 1 0%', minHeight: 0 }} 
                />
            </div>
        </div>
    );
}
