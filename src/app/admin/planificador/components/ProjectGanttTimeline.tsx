'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar as CalendarIcon, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function ProjectGanttTimeline() {
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
            <div className="min-h-[400px] bg-slate-50/50 flex flex-col items-center justify-center rounded-2xl border border-slate-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-4"></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Cargando seguimiento Gantt...</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-100 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
                        📋 Seguimiento Gantt de Órdenes (Tiempo Real)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Vista unificada a 4 semanas del progreso de proyectos y carga en el taller.
                    </p>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1 shadow-sm shrink-0">
                    <button onClick={handlePrevWeeks} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-500 transition-all">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={handleToday} className="px-4 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-white hover:shadow-sm rounded transition-all">
                        Hoy
                    </button>
                    <button onClick={handleNextWeeks} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-500 transition-all">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Table Header */}
            <div className="flex border-b border-slate-200 bg-slate-50/50">
                <div className="w-64 md:w-80 shrink-0 border-r border-slate-200 p-3 md:p-4 flex flex-col justify-end">
                    <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-slate-400">Cliente y Proyecto</span>
                </div>
                
                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    <div className="flex flex-col min-w-max">
                        {/* Months Header Row */}
                        <div className="flex border-b border-slate-200">
                            {months.map((m, i) => (
                                <div 
                                    key={i} 
                                    style={{ width: m.count * 48 }} 
                                    className={`px-2 py-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-r border-slate-200 ${m.isEven ? 'bg-slate-100 text-slate-500' : 'bg-amber-50/60 text-amber-600'}`}
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
                                
                                let isEvenMonth = true;
                                let countAcc = 0;
                                for (let m of months) {
                                    countAcc += m.count;
                                    if (i < countAcc) {
                                        isEvenMonth = m.isEven;
                                        break;
                                    }
                                }

                                const baseBg = isEvenMonth ? 'bg-slate-50/30' : 'bg-white';

                                return (
                                    <div key={i} className={`w-12 shrink-0 border-r border-slate-100 flex flex-col items-center justify-center py-2 ${isToday ? 'bg-amber-50/80' : isWeekend ? 'bg-slate-100/60' : baseBg}`}>
                                        <span className={`text-[9px] md:text-[10px] uppercase font-bold ${isToday ? 'text-amber-500' : 'text-slate-400'}`}>
                                            {date.toLocaleDateString('es-CL', { weekday: 'short' })}
                                        </span>
                                        <span className={`text-xs md:text-sm font-bold ${isToday ? 'text-amber-600' : 'text-slate-700'}`}>
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
            <div className="flex-1 overflow-y-auto max-h-[600px]">
                {projects.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest">No hay proyectos de producción activos.</div>
                ) : (
                    projects.map((project) => {
                        const daysDiff = getDaysDiff(project.deadline);
                        const progressPercent = project.estimatedHours > 0 
                            ? Math.min(100, Math.round((project.scheduledHours / project.estimatedHours) * 100))
                            : 0;
                        const isOverbooked = project.scheduledHours > project.estimatedHours;

                        return (
                            <div key={project.id} className="flex border-b border-slate-100 hover:bg-slate-50/30 transition-colors group">
                                
                                {/* Left Panel: Project Info */}
                                <div className="w-64 md:w-80 shrink-0 border-r border-slate-100 p-3 md:p-4 flex flex-col justify-center gap-2.5 bg-white">
                                    <div>
                                        <h3 className="font-extrabold text-xs md:text-sm text-slate-800 truncate" title={project.customerName}>
                                            {project.customerName}
                                        </h3>
                                        <p className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold tracking-widest truncate mt-0.5">
                                            {project.description}
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[9px] md:text-[10px] font-bold">
                                            <span className="text-slate-500 flex items-center gap-1 uppercase tracking-widest">
                                                <Clock className="w-3 h-3" /> Horas
                                            </span>
                                            <span className={isOverbooked ? 'text-rose-600' : 'text-emerald-600'}>
                                                {project.scheduledHours} / {project.estimatedHours}h
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${isOverbooked ? 'bg-rose-500' : progressPercent === 100 ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                                                style={{ width: `${progressPercent}%` }}
                                            ></div>
                                        </div>
                                        {isOverbooked && (
                                            <p className="text-[9px] text-rose-500 font-bold flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Excede {project.scheduledHours - project.estimatedHours}h
                                            </p>
                                        )}
                                    </div>

                                    {project.deadline && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                                            <span className={`text-[9px] md:text-[10px] font-bold ${daysDiff !== null && daysDiff < 7 ? 'text-rose-500' : 'text-slate-500'}`}>
                                                Entrega: {new Date(project.deadline).toLocaleDateString('es-CL')} 
                                                {daysDiff !== null && ` (${daysDiff > 0 ? `faltan ${daysDiff} d` : 'HOY'})`}
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

                                            let isEvenMonth = true;
                                            let countAcc = 0;
                                            for (let m of months) {
                                                countAcc += m.count;
                                                if (i < countAcc) {
                                                    isEvenMonth = m.isEven;
                                                    break;
                                                }
                                            }
                                            const baseBg = isEvenMonth ? 'bg-slate-50/30' : 'bg-white';

                                            return (
                                                <div key={i} className={`w-12 shrink-0 border-r border-slate-100 flex items-center justify-center relative p-1 ${isToday ? 'bg-amber-50/40' : isWeekend ? 'bg-slate-100/60' : baseBg}`}>
                                                    {hoursOnDay > 0 && (
                                                        <div 
                                                            className="w-full bg-[#0f172a] hover:bg-slate-800 transition-colors text-white rounded-md py-1.5 flex flex-col items-center justify-center shadow-sm cursor-help relative"
                                                            title={`Agendado: ${hoursOnDay}h`}
                                                        >
                                                            <span className="text-[10px] md:text-xs font-bold">{hoursOnDay}h</span>
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
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}</style>
        </div>
    );
}
