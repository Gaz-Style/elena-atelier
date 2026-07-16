'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, Calendar as CalendarIcon, AlertTriangle, ZoomIn, ZoomOut } from 'lucide-react';
import { getProductionTimeline } from '../actions';

// ── Helpers ──────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDateKey(date: Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getDaysDiff(deadline: string) {
    if (!deadline) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(deadline);
    end.setHours(0, 0, 0, 0);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Zoom levels ───────────────────────────────────────────────────────────────

const ZOOM_LEVELS = [
    { key: 'detail',  label: 'Detalle',  colWidth: 48 },
    { key: 'medium',  label: 'Medio',    colWidth: 24 },
    { key: 'compact', label: 'Compacto', colWidth: 14 },
] as const;

// ── Main component ────────────────────────────────────────────────────────────

interface ProjectGanttTimelineProps {
    className?: string;
    bodyHeightStyle?: React.CSSProperties;
}

export default function ProjectGanttTimeline({ 
    className = "", 
    bodyHeightStyle = { maxHeight: '500px' } 
}: ProjectGanttTimelineProps) {
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [colWidth, setColWidth] = useState(32); 
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const DAYS_PAST = 30;
    const DAYS_TOTAL = 365;
    
    const calendarDays = useMemo(() => {
        const days: Date[] = [];
        const start = addDays(new Date(), -DAYS_PAST);
        for (let i = 0; i < DAYS_TOTAL; i++) {
            days.push(addDays(start, i));
        }
        return days;
    }, []);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await getProductionTimeline();
            setProjects(data || []);
            setLoading(false);
        }
        load();
    }, []);

    const jumpToToday = () => {
        if (scrollContainerRef.current) {
            const scrollX = (DAYS_PAST * colWidth) - (scrollContainerRef.current.clientWidth / 2) + (colWidth / 2);
            scrollContainerRef.current.scrollTo({ left: Math.max(0, scrollX), behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(jumpToToday, 50);
            return () => clearTimeout(timer);
        }
    }, [colWidth, loading]);

    const months = useMemo(() => {
        if (!calendarDays.length) return [];
        const result: { label: string; count: number; isEven: boolean }[] = [];
        let curMonth = calendarDays[0].getMonth();
        let curYear = calendarDays[0].getFullYear();
        let curLabel = calendarDays[0].toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
        let count = 0;
        let idx = 0;
        
        calendarDays.forEach(date => {
            if (date.getMonth() === curMonth && date.getFullYear() === curYear) {
                count++;
            } else {
                result.push({ label: curLabel, count, isEven: idx % 2 === 0 });
                curMonth = date.getMonth();
                curYear = date.getFullYear();
                curLabel = date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
                count = 1;
                idx++;
            }
        });
        result.push({ label: curLabel, count, isEven: idx % 2 === 0 });
        return result;
    }, [calendarDays]);

    const isEvenMonthAt = (dayIndex: number) => {
        let acc = 0;
        for (const m of months) {
            acc += m.count;
            if (dayIndex < acc) return m.isEven;
        }
        return true;
    };

    const todayKey = formatDateKey(new Date());

    const applyPreset = (type: 'year' | 'month' | 'week' | 'day') => {
        if (type === 'year') setColWidth(4);
        if (type === 'month') setColWidth(16);
        if (type === 'week') setColWidth(48);
        if (type === 'day') setColWidth(100);
    };

    if (loading) {
        return (
            <div className="min-h-[300px] bg-slate-50/50 flex flex-col items-center justify-center rounded-2xl border border-slate-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-4"></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Cargando Gantt...</p>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col ${className}`}>

            {/* ── Header Controls (Always Fixed at the Top of the Component) ── */}
            <div className="border-b border-slate-100 px-4 py-3 md:px-5 md:py-4 flex items-center justify-between gap-4 flex-wrap bg-white z-30 relative shrink-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-base md:text-lg font-serif font-bold text-slate-800 flex items-center gap-2 shrink-0">
                        📋 Seguimiento Gantt
                    </h2>
                    <button
                        onClick={jumpToToday}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-[#0f172a] text-white rounded-lg hover:bg-slate-700 transition-all shadow-sm"
                    >
                        Hoy
                    </button>
                </div>

                {/* Dynamic Zoom Panel */}
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                            onClick={() => applyPreset('year')}
                            className={`px-2 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${colWidth <= 6 ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            1 Año
                        </button>
                        <button
                            onClick={() => applyPreset('month')}
                            className={`px-2 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${(colWidth > 6 && colWidth <= 24) ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Trimestre
                        </button>
                        <button
                            onClick={() => applyPreset('week')}
                            className={`px-2 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${(colWidth > 24 && colWidth <= 64) ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Mes
                        </button>
                        <button
                            onClick={() => applyPreset('day')}
                            className={`px-2 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${colWidth > 64 ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Día/Detalle
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shrink-0">
                        <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
                        <input 
                            type="range" 
                            min="4" 
                            max="120" 
                            value={colWidth} 
                            onChange={(e) => setColWidth(Number(e.target.value))}
                            className="w-24 md:w-36 accent-amber-500 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
                            title="Desliza para zoom dinámico"
                        />
                        <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* ── Scrollable Gantt Area ──────────────────────────────── */}
            <div 
                ref={scrollContainerRef}
                className="overflow-auto gantt-scroll relative w-full flex-1"
                style={bodyHeightStyle}
            >
                <div className="inline-block min-w-full">
                    {/* Calendar Header Row (Sticky to top of scrolling viewport) */}
                    <div className="sticky top-0 z-20 flex bg-slate-50 border-b border-slate-200 shadow-sm w-fit">
                        {/* Top-Left Corner (Sticky Left & Top) */}
                        <div className="sticky left-0 z-30 w-52 md:w-64 shrink-0 bg-slate-50 border-r border-slate-200 p-2.5 md:p-3 flex flex-col justify-end shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Cliente y Proyecto</span>
                        </div>

                        {/* Timeline Header (Months + Days) */}
                        <div className="flex flex-col" style={{ width: calendarDays.length * colWidth }}>
                            {/* Months row */}
                            <div className="flex border-b border-slate-200">
                                {months.map((m, i) => {
                                    const width = m.count * colWidth;
                                    const showText = width > 50;
                                    return (
                                        <div
                                            key={i}
                                            style={{ width }}
                                            className={`px-1.5 py-1 text-[8px] md:text-[9px] font-bold uppercase tracking-widest border-r border-slate-200 truncate ${m.isEven ? 'bg-slate-100 text-slate-500' : 'bg-amber-50/60 text-amber-600'}`}
                                        >
                                            {showText ? m.label : ''}
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Days row */}
                            <div className="flex">
                                {calendarDays.map((date, i) => {
                                    const isToday = formatDateKey(date) === todayKey;
                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                    const baseBg = isEvenMonthAt(i) ? 'bg-slate-50/30' : 'bg-transparent';

                                    return (
                                        <div
                                            key={i}
                                            style={{ width: colWidth, minWidth: colWidth }}
                                            className={`shrink-0 border-r border-slate-100 flex flex-col items-center justify-center py-1 ${isToday ? 'bg-amber-50/85' : isWeekend ? 'bg-slate-100/50' : baseBg}`}
                                        >
                                            {colWidth >= 24 && (
                                                <span className={`text-[7px] uppercase font-bold leading-none ${isToday ? 'text-amber-500' : 'text-slate-400'}`}>
                                                    {date.toLocaleDateString('es-CL', { weekday: 'narrow' })}
                                                </span>
                                            )}
                                            {colWidth >= 12 && (
                                                <span className={`text-[8px] font-bold leading-none mt-0.5 ${isToday ? 'text-amber-600' : 'text-slate-600'}`}>
                                                    {date.getDate()}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Gantt Body */}
                    <div className="flex flex-col relative z-0 w-fit pb-4">
                        {projects.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs sticky left-0 w-full">
                                No hay proyectos de producción activos.
                            </div>
                        ) : (
                            projects.map((project, index) => {
                                const daysDiff = getDaysDiff(project.deadline);
                                const progressPercent = project.estimatedHours > 0
                                    ? Math.min(100, Math.round((project.scheduledHours / project.estimatedHours) * 100))
                                    : 0;
                                const isOverbooked = project.scheduledHours > project.estimatedHours;
                                const isLast = index === projects.length - 1;

                                return (
                                    <div key={project.id} className={`flex ${!isLast ? 'border-b border-slate-100' : ''} hover:bg-slate-50/50 transition-colors group`}>
                                        
                                        {/* Left Info Panel (Sticky Left) */}
                                        <div className="sticky left-0 z-10 w-52 md:w-64 shrink-0 bg-white group-hover:bg-slate-50 transition-colors border-r border-slate-200 p-2.5 md:p-3 flex flex-col justify-center gap-1.5 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                            <div>
                                                <h3 className="font-extrabold text-[11px] md:text-xs text-slate-800 truncate" title={project.customerName}>
                                                    {project.customerName}
                                                </h3>
                                                <p className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold tracking-widest truncate">
                                                    {project.description}
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center text-[8px] md:text-[9px] font-bold">
                                                    <span className="text-slate-500 flex items-center gap-1 uppercase tracking-widest">
                                                        <Clock className="w-2.5 h-2.5" /> Horas
                                                    </span>
                                                    <span className={isOverbooked ? 'text-rose-600' : 'text-emerald-600'}>
                                                        {project.scheduledHours} / {project.estimatedHours}h
                                                    </span>
                                                </div>
                                                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${isOverbooked ? 'bg-rose-500' : progressPercent === 100 ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {project.deadline && (
                                                <span className={`text-[8px] font-bold flex items-center gap-1 ${daysDiff !== null && daysDiff < 7 ? 'text-rose-500' : 'text-slate-400'}`}>
                                                    <CalendarIcon className="w-2.5 h-2.5" />
                                                    {new Date(project.deadline).toLocaleDateString('es-CL')}
                                                    {daysDiff !== null && ` (${daysDiff > 0 ? `${daysDiff}d` : 'HOY'})`}
                                                </span>
                                            )}
                                        </div>

                                        {/* Gantt Bars Layer */}
                                        <div className="flex items-stretch bg-white group-hover:bg-slate-50/50 transition-colors" style={{ width: calendarDays.length * colWidth }}>
                                            {calendarDays.map((date, i) => {
                                                const dateKey = formatDateKey(date);
                                                const tasksOnDay = project.tasks.filter((t: any) => t.task_date === dateKey);
                                                const hoursOnDay = tasksOnDay.reduce((sum: number, t: any) => sum + (Number(t.duration_hours) || 0), 0);
                                                
                                                const milestonesOnDay = project.milestones?.filter((m: any) => {
                                                    if (!m.scheduled_date) return false;
                                                    const mDate = new Date(m.scheduled_date);
                                                    return formatDateKey(mDate) === dateKey;
                                                }) || [];

                                                const isToday = dateKey === todayKey;
                                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                                const baseBg = isEvenMonthAt(i) ? 'bg-slate-50/30' : 'bg-transparent';

                                                const isDeadline = project.deadline && dateKey === formatDateKey(new Date(project.deadline));

                                                return (
                                                    <div
                                                        key={i}
                                                        style={{ width: colWidth, minWidth: colWidth }}
                                                        className={`shrink-0 border-r border-slate-100/80 flex flex-col items-center justify-center gap-0.5 relative ${isToday ? 'bg-amber-50/40' : isWeekend ? 'bg-slate-100/40' : baseBg}`}
                                                    >
                                                        {hoursOnDay > 0 && (
                                                            <div
                                                                className="bg-[#0f172a] hover:bg-slate-700 transition-colors text-white rounded-sm flex items-center justify-center cursor-help shadow-sm"
                                                                style={{ 
                                                                    width: colWidth >= 8 ? '85%' : '100%', 
                                                                    height: Math.max(12, Math.min(28, colWidth - 2)) 
                                                                }}
                                                                title={`${project.customerName} (Trabajo): ${hoursOnDay}h`}
                                                            >
                                                                {colWidth >= 28 && (
                                                                    <span className="text-[8px] font-bold leading-none">{hoursOnDay}h</span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {milestonesOnDay.map((m: any) => {
                                                            const isConfirmed = m.status === 'completed' || m.agenda_event_id !== null;
                                                            
                                                            const getAbbr = (title: string) => {
                                                                if (title.includes('Prueba 1')) return 'P1 📏';
                                                                if (title.includes('Prueba 2')) return 'P2 🧵';
                                                                if (title.includes('Prueba 3')) return 'P3 🪡';
                                                                if (title.includes('Prueba 4')) return 'P4 👗';
                                                                if (title.includes('Entrega')) return 'EF 🎁';
                                                                return 'Cita 📅';
                                                            };

                                                            return (
                                                                <div
                                                                    key={m.id}
                                                                    className={`rounded-sm flex items-center justify-center cursor-help shadow-sm text-white text-[8px] font-bold transition-all ${
                                                                        isConfirmed ? 'bg-rose-500 hover:bg-rose-600' : 'bg-slate-400 hover:bg-slate-500'
                                                                    }`}
                                                                    style={{
                                                                        width: colWidth >= 8 ? '85%' : '100%',
                                                                        height: Math.max(12, Math.min(28, colWidth - 2))
                                                                    }}
                                                                    title={`${project.customerName} - ${m.title} (${m.status === 'completed' ? 'Realizada' : isConfirmed ? 'Confirmada en Agenda' : 'Sugerida/Pendiente'})`}
                                                                >
                                                                    {colWidth >= 28 ? getAbbr(m.title) : '📅'}
                                                                </div>
                                                            );
                                                        })}

                                                        {isDeadline && (
                                                            <>
                                                                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-rose-500 z-10" title="Fecha de entrega" />
                                                                {colWidth >= 20 && daysDiff !== null && (
                                                                    <div className="absolute top-1 right-0 transform translate-x-1/2 z-20 bg-rose-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none select-none">
                                                                        Entrega {daysDiff > 0 ? `(Faltan ${daysDiff}d)` : daysDiff === 0 ? '(Hoy)' : `(Hace ${Math.abs(daysDiff)}d)`}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .gantt-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
                .gantt-scroll::-webkit-scrollbar-track { background: transparent; }
                .gantt-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
                .gantt-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
            `}</style>
        </div>
    );
}
