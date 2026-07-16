'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProjectGanttTimeline from '../components/ProjectGanttTimeline';

export default function TimelinePage() {
    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-800 p-4 md:p-6 w-full">
            {/* Header */}
            <div className="w-full mb-6">
                <Link 
                    href="/admin/planificador" 
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 font-bold hover:text-zinc-700 transition-colors mb-3"
                >
                    <ArrowLeft className="w-3 h-3" /> Volver al Planificador Semanal
                </Link>
                <h1 className="font-serif text-2xl md:text-3xl text-zinc-900 font-bold">
                    Seguimiento de Trabajos y Entregas
                </h1>
                <p className="text-zinc-500 text-xs md:text-sm mt-0.5">
                    Vista unificada de programación y estado de confecciones del taller.
                </p>
            </div>

            {/* Gantt Timeline - Edge to edge */}
            <div className="w-full">
                <ProjectGanttTimeline />
            </div>
        </div>
    );
}
