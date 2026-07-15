'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar as CalendarIcon, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductionTimeline } from '../actions';

// Helpers
function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDateKey(date: Date) {
    return date.toISOString().split('T')[0];
}

function getDaysDiff(deadline: string) {
    if (!deadline) return null;
    const now = new Date();
    now.setHours(0,0,0,0);
    const end = new Date(deadline);
    end.setHours(0,0,0,0);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function TimelinePage() {
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [startDate, setStartDate] = useState(new Date());

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await getProductionTimeline();
            setProjects(data || []);
            setLoading(false);
        }
        load();
    }, []);

    // Generate 28 days array for Gantt header
    const calendarDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 28; i++) {
            days.push(addDays(startDate, i));
        }
        return days;
    }, [startDate]);

    const months = useMemo(() => {
        if (!calendarDays || calendarDays.length === 0) return [];
        const result: { label: string, count: number, isEven: boolean }[] = [];
        let currentMonth = calendarDays[0].getMonth();
        let currentLabel = calendarDays[0].toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
        let count = 0;
        let monthIndex = 0;
        
        calendarDays.forEach((date) => {
            if (date.getMonth() === currentMonth) {
                count++;
            } else {
                result.push({ label: currentLabel, count, isEven: monthIndex % 2 === 0 });
                currentMonth = date.getMonth();
                currentLabel = date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
                count = 1;
                monthIndex++;
            }
        });
        result.push({ label: currentLabel, count, isEven: monthIndex % 2 === 0 });
        return result;
    }, [calendarDays]);

    const handlePrevWeeks = () => setStartDate(prev => addDays(prev, -7));
    const handleNextWeeks = () => setStartDate(prev => addDays(prev, 7));
    const handleToday = () => setStartDate(new Date());

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50/30 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-400"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-800 p-6 md:p-8 lg:pt-28">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/admin/planificador" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 font-bold hover:text-zinc-700 transition-colors mb-4">
                        <ArrowLeft className="w-3 h-3" /> Volver al Planificador Semanal
                    </Link>
                    <h1 className="font-serif text-3xl text-zinc-900 flex items-center gap-3">
                        Seguimiento de Trabajos y Entregas
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">Vista unificada de programación y estado de confecciones del taller.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg p-1 shadow-sm">
                    <button onClick={handlePrevWeeks} className="p-2 hover:bg-zinc-100 rounded-md text-zinc-600 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={handleToday} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors">
                        Hoy
                    </button>
                    <button onClick={handleNextWeeks} className="p-2 hover:bg-zinc-100 rounded-md text-zinc-600 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                
                {/* Table Header */}
                <div className="flex border-b border-zinc-200 bg-zinc-50/50">
                    <div className="w-80 shrink-0 border-r border-zinc-200 p-4 flex flex-col justify-end">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Cliente y Proyecto</span>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto custom-scrollbar">
                        <div className="flex flex-col min-w-max">
                            {/* Months Header Row */}
                            <div className="flex border-b border-zinc-200">
                                {months.map((m, i) => (
                                    <div 
                                        key={i} 
                                        style={{ width: m.count * 48 }} 
                                        className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border-r border-zinc-200 ${m.isEven ? 'bg-zinc-100 text-zinc-500' : 'bg-rose-50/60 text-rose-600'}`}
                                    >
                                        {m.label}
                                    </div>
                                ))}
                            </div>
                            {/* Days Row */}
                            <div className="flex">
                                {calendarDays.map((date, i) => {
                                    const isToday = formatDateKey(date) === formatDateKey(new Date());
                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                    
                                    // Determine if this date belongs to an 'even' month index to alternate background
                                    let isEvenMonth = true;
                                    let countAcc = 0;
                                    for (let m of months) {
                                        countAcc += m.count;
                                        if (i < countAcc) {
                                            isEvenMonth = m.isEven;
                                            break;
                                        }
                                    }

                                    const baseBg = isEvenMonth ? 'bg-zinc-50/30' : 'bg-white';

                                    return (
                                        <div key={i} className={`w-12 shrink-0 border-r border-zinc-100 flex flex-col items-center justify-center py-2 ${isToday ? 'bg-rose-50' : isWeekend ? 'bg-zinc-100/60' : baseBg}`}>
                                            <span className={`text-[10px] uppercase font-bold ${isToday ? 'text-rose-500' : 'text-zinc-400'}`}>
                                                {date.toLocaleDateString('es-CL', { weekday: 'short' })}
                                            </span>
                                            <span className={`text-sm font-medium ${isToday ? 'text-rose-600' : 'text-zinc-700'}`}>
                                                {date.getDate()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-y-auto">
                    {projects.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500 italic">No hay proyectos de producción activos.</div>
                    ) : (
                        projects.map((project) => {
                            const daysDiff = getDaysDiff(project.deadline);
                            const progressPercent = project.estimatedHours > 0 
                                ? Math.min(100, Math.round((project.scheduledHours / project.estimatedHours) * 100))
                                : 0;
                            const isOverbooked = project.scheduledHours > project.estimatedHours;

                            return (
                                <div key={project.id} className="flex border-b border-zinc-100 hover:bg-zinc-50/30 transition-colors group">
                                    
                                    {/* Left Panel: Project Info */}
                                    <div className="w-80 shrink-0 border-r border-zinc-100 p-4 flex flex-col justify-center gap-3 bg-white">
                                        <div>
                                            <h3 className="font-bold text-sm text-zinc-900 truncate" title={project.customerName}>
                                                {project.customerName}
                                            </h3>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wide truncate mt-0.5">
                                                {project.description}
                                            </p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[10px] font-medium">
                                                <span className="text-zinc-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Horas Agendadas
                                                </span>
                                                <span className={isOverbooked ? 'text-rose-600 font-bold' : 'text-zinc-700'}>
                                                    {project.scheduledHours} / {project.estimatedHours}h
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden flex">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${isOverbooked ? 'bg-rose-500' : progressPercent === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`}
                                                    style={{ width: `${progressPercent}%` }}
                                                ></div>
                                            </div>
                                            {isOverbooked && (
                                                <p className="text-[9px] text-rose-500 flex items-center gap-1 mt-1">
                                                    <AlertTriangle className="w-3 h-3" /> Excede {project.scheduledHours - project.estimatedHours}h
                                                </p>
                                            )}
                                        </div>

                                        {project.deadline && (
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
                                                <span className={`text-[10px] font-bold ${daysDiff !== null && daysDiff < 7 ? 'text-rose-600' : 'text-zinc-500'}`}>
                                                    Entrega: {new Date(project.deadline).toLocaleDateString('es-CL')} 
                                                    {daysDiff !== null && ` (${daysDiff > 0 ? `faltan ${daysDiff} días` : 'HOY'})`}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Panel: Gantt / Timeline */}
                                    <div className="flex-1 overflow-x-auto custom-scrollbar flex">
                                        <div className="flex min-w-max items-stretch relative">
                                            {calendarDays.map((date, i) => {
                                                const dateKey = formatDateKey(date);
                                                const tasksOnDay = project.tasks.filter((t: any) => t.task_date === dateKey);
                                                const hoursOnDay = tasksOnDay.reduce((sum: number, t: any) => sum + (Number(t.duration_hours) || 0), 0);
                                                
                                                const isToday = dateKey === formatDateKey(new Date());
                                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                                                // Determine if this date belongs to an 'even' month index to alternate background
                                                let isEvenMonth = true;
                                                let countAcc = 0;
                                                for (let m of months) {
                                                    countAcc += m.count;
                                                    if (i < countAcc) {
                                                        isEvenMonth = m.isEven;
                                                        break;
                                                    }
                                                }
                                                const baseBg = isEvenMonth ? 'bg-zinc-50/30' : 'bg-white';

                                                return (
                                                    <div key={i} className={`w-12 shrink-0 border-r border-zinc-100 flex items-center justify-center relative p-1 ${isToday ? 'bg-rose-50/40' : isWeekend ? 'bg-zinc-100/60' : baseBg}`}>
                                                        {hoursOnDay > 0 && (
                                                            <div 
                                                                className="w-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-white rounded-[4px] py-1.5 flex flex-col items-center justify-center shadow-sm cursor-help group/block relative"
                                                                title={`Agendado: ${hoursOnDay}h`}
                                                            >
                                                                <span className="text-xs font-bold">{hoursOnDay}h</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e4e4e7;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
}
