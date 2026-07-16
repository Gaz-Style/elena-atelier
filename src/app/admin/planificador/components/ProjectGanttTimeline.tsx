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
    return date.toISOString().split('T')[0];
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
    { key: '4w',  label: '4 Sem',   days: 28,  colWidth: 48 },
    { key: '3m',  label: '3 Mes',   days: 90,  colWidth: 24 },
    { key: '6m',  label: '6 Mes',   days: 180, colWidth: 14 },
] as const;

// ── Main component ────────────────────────────────────────────────────────────

export default function ProjectGanttTimeline() {
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [zoomIndex, setZoomIndex] = useState(0);
    const zoom = ZOOM_LEVELS[zoomIndex];

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await getProductionTimeline();
            setProjects(data || []);
            setLoading(false);
        }
        load();
    }, []);

    // Calendar days based on zoom
    const calendarDays = useMemo(() => {
        const days: Date[] = [];
        for (let i = 0; i < zoom.days; i++) {
            days.push(addDays(startDate, i));
        }
        return days;
    }, [startDate, zoom.days]);

    // Month grouping for header
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

    // Navigation: jump by the visible range
    const jumpPrev = () => setStartDate(prev => addDays(prev, -Math.round(zoom.days / 2)));
    const jumpNext = () => setStartDate(prev => addDays(prev, Math.round(zoom.days / 2)));
    const jumpToToday = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        setStartDate(d);
    };

    // Range label
    const rangeLabel = useMemo(() => {
        const first = calendarDays[0];
        const last = calendarDays[calendarDays.length - 1];
        if (!first || !last) return '';
        const fMonth = first.toLocaleDateString('es-CL', { month: 'short' });
        const lMonth = last.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' });
        return `${first.getDate()} ${fMonth} — ${last.getDate()} ${lMonth}`;
    }, [calendarDays]);

    if (loading) {
        return (
            <div className="min-h-[300px] bg-slate-50/50 flex flex-col items-center justify-center rounded-2xl border border-slate-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-4"></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Cargando Gantt...</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">

            {/* ── Compact Header ─────────────────────────────────────── */}
            <div className="border-b border-slate-100 px-4 py-3 md:px-5 md:py-4 flex items-center justify-between gap-3 flex-wrap">
                {/* Left: Title */}
                <h2 className="text-base md:text-lg font-serif font-bold text-slate-800 flex items-center gap-2 shrink-0">
                    📋 Seguimiento Gantt
                </h2>

                {/* Center: Navigation */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5 order-last md:order-none w-full md:w-auto justify-center">
                    <button onClick={jumpPrev} className="px-2.5 py-1.5 text-slate-500 hover:bg-white hover:shadow-sm rounded-lg transition-all text-xs font-bold">
                        ‹
                    </button>
                    <button
                        onClick={jumpToToday}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#0f172a] text-white rounded-lg hover:bg-slate-700 transition-all"
                    >
                        Hoy
                    </button>
                    <span className="text-[10px] md:text-xs font-bold text-slate-600 px-2 capitalize min-w-[140px] md:min-w-[180px] text-center truncate">
                        {rangeLabel}
                    </span>
                    <button onClick={jumpNext} className="px-2.5 py-1.5 text-slate-500 hover:bg-white hover:shadow-sm rounded-lg transition-all text-xs font-bold">
                        ›
                    </button>
                </div>

                {/* Right: Zoom */}
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => setZoomIndex(prev => Math.max(0, prev - 1))}
                        disabled={zoomIndex === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Acercar"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <div className="flex gap-0.5">
                        {ZOOM_LEVELS.map((z, i) => (
                            <button
                                key={z.key}
                                onClick={() => setZoomIndex(i)}
                                className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all ${
                                    i === zoomIndex
                                        ? 'bg-slate-800 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {z.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setZoomIndex(prev => Math.min(ZOOM_LEVELS.length - 1, prev + 1))}
                        disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Alejar"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Gantt Table Header ────────────────────────────────── */}
            <div className="flex border-b border-slate-200 bg-slate-50/50">
                {/* Fixed left */}
                <div className="w-52 md:w-64 shrink-0 border-r border-slate-200 p-2.5 md:p-3 flex flex-col justify-end">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Cliente y Proyecto</span>
                </div>

                {/* Scrollable columns */}
                <div className="flex-1 overflow-x-auto gantt-scroll">
                    <div className="flex flex-col" style={{ minWidth: calendarDays.length * zoom.colWidth }}>
                        {/* Months row */}
                        <div className="flex border-b border-slate-200">
                            {months.map((m, i) => (
                                <div
                                    key={i}
                                    style={{ width: m.count * zoom.colWidth }}
                                    className={`px-1.5 py-1 text-[8px] md:text-[9px] font-bold uppercase tracking-widest border-r border-slate-200 truncate ${m.isEven ? 'bg-slate-100 text-slate-500' : 'bg-amber-50/60 text-amber-600'}`}
                                >
                                    {m.label}
                                </div>
                            ))}
                        </div>
                        {/* Days row */}
                        <div className="flex">
                            {calendarDays.map((date, i) => {
                                const isToday = formatDateKey(date) === todayKey;
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                const baseBg = isEvenMonthAt(i) ? 'bg-slate-50/30' : 'bg-white';

                                return (
                                    <div
                                        key={i}
                                        style={{ width: zoom.colWidth, minWidth: zoom.colWidth }}
                                        className={`shrink-0 border-r border-slate-100 flex flex-col items-center justify-center py-1 ${isToday ? 'bg-amber-50/80' : isWeekend ? 'bg-slate-100/50' : baseBg}`}
                                    >
                                        {zoom.colWidth >= 24 && (
                                            <span className={`text-[7px] uppercase font-bold leading-none ${isToday ? 'text-amber-500' : 'text-slate-400'}`}>
                                                {date.toLocaleDateString('es-CL', { weekday: 'narrow' })}
                                            </span>
                                        )}
                                        {zoom.colWidth >= 14 && (
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
            </div>

            {/* ── Gantt Table Body ──────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto max-h-[500px]">
                {projects.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                        No hay proyectos de producción activos.
                    </div>
                ) : (
                    projects.map(project => {
                        const daysDiff = getDaysDiff(project.deadline);
                        const progressPercent = project.estimatedHours > 0
                            ? Math.min(100, Math.round((project.scheduledHours / project.estimatedHours) * 100))
                            : 0;
                        const isOverbooked = project.scheduledHours > project.estimatedHours;

                        return (
                            <div key={project.id} className="flex border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                                {/* Left info */}
                                <div className="w-52 md:w-64 shrink-0 border-r border-slate-100 p-2.5 md:p-3 flex flex-col justify-center gap-1.5 bg-white">
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

                                {/* Gantt bars */}
                                <div className="flex-1 overflow-x-auto gantt-scroll">
                                    <div className="flex items-stretch" style={{ minWidth: calendarDays.length * zoom.colWidth }}>
                                        {calendarDays.map((date, i) => {
                                            const dateKey = formatDateKey(date);
                                            const tasksOnDay = project.tasks.filter((t: any) => t.task_date === dateKey);
                                            const hoursOnDay = tasksOnDay.reduce((sum: number, t: any) => sum + (Number(t.duration_hours) || 0), 0);
                                            const isToday = dateKey === todayKey;
                                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                            const baseBg = isEvenMonthAt(i) ? 'bg-slate-50/30' : 'bg-white';

                                            // Deadline marker
                                            const isDeadline = project.deadline && dateKey === formatDateKey(new Date(project.deadline));

                                            return (
                                                <div
                                                    key={i}
                                                    style={{ width: zoom.colWidth, minWidth: zoom.colWidth }}
                                                    className={`shrink-0 border-r border-slate-100/80 flex items-center justify-center relative ${isToday ? 'bg-amber-50/40' : isWeekend ? 'bg-slate-100/40' : baseBg}`}
                                                >
                                                    {hoursOnDay > 0 && (
                                                        <div
                                                            className="w-[85%] bg-[#0f172a] hover:bg-slate-700 transition-colors text-white rounded-sm flex items-center justify-center cursor-help"
                                                            style={{ height: Math.max(16, Math.min(28, zoom.colWidth - 4)) }}
                                                            title={`${project.customerName}: ${hoursOnDay}h`}
                                                        >
                                                            {zoom.colWidth >= 28 && (
                                                                <span className="text-[8px] font-bold leading-none">{hoursOnDay}h</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {isDeadline && (
                                                        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-rose-500 z-10" title="Fecha de entrega" />
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
                .gantt-scroll::-webkit-scrollbar { height: 6px; }
                .gantt-scroll::-webkit-scrollbar-track { background: transparent; }
                .gantt-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
                .gantt-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
            `}</style>
        </div>
    );
}
