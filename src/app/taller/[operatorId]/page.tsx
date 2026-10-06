'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Loader2, ArrowLeft, Scissors, CalendarDays, Eye, ChevronRight, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getOperatorInfo, getOperatorWeekTasks } from '../actions';

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-zinc-100 text-zinc-600',
    cutting: 'bg-amber-50 text-amber-700',
    sewing: 'bg-blue-50 text-blue-700',
    finishing: 'bg-violet-50 text-violet-700',
    ready: 'bg-emerald-50 text-emerald-700',
};

export default function TallerDashboard() {
    const params = useParams();
    const router = useRouter();
    const operatorId = params.operatorId as string;

    const [operator, setOperator] = useState<any>(null);
    const [weekTasks, setWeekTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fechas
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Lunes
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Domingo
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    async function fetchAllData() {
        setLoading(true);
        const [opInfo, week] = await Promise.all([
            getOperatorInfo(operatorId),
            getOperatorWeekTasks(operatorId, weekStartStr, weekEndStr),
        ]);
        setOperator(opInfo);
        setWeekTasks(week);
        setLoading(false);
    }

    useEffect(() => {
        fetchAllData();

        const channel = supabase
            .channel(`taller-portal-${operatorId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'planner_tasks' }, () => fetchAllData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'production_orders' }, () => fetchAllData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [operatorId]);

    // Agrupar tareas por día de la semana
    const tasksByDay = useMemo(() => {
        const grouped: Record<string, any[]> = {};
        weekTasks.forEach(t => {
            const d = t.task_date;
            if (!grouped[d]) grouped[d] = [];
            grouped[d].push(t);
        });
        return grouped;
    }, [weekTasks]);

    // Generar días de la semana
    const weekDays = useMemo(() => {
        const days = [];
        const start = new Date(weekStart);
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d.toISOString().split('T')[0]);
        }
        return days;
    }, [weekStartStr]);

    const formatDateShort = (dateStr: string) => {
        const d = new Date(dateStr + 'T12:00:00');
        return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-7 h-7 text-[#C17F5F] animate-spin" />
                <p className="text-xs text-[#737373] uppercase tracking-widest font-semibold">Cargando tu semana...</p>
            </div>
        );
    }

    if (!operator) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
                <AlertTriangle className="w-8 h-8 text-[#C17F5F]" />
                <p className="text-sm text-[#4A4A4A]">Costurera no encontrada.</p>
                <button onClick={() => router.push('/taller')} className="text-xs text-[#C17F5F] underline">Volver</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 bg-[#FDFCF8]">
            {/* Header Fijo */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] px-4 md:px-6 py-4 shadow-sm">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/taller')} className="text-[#737373] hover:text-[#1A1A1A] transition-colors p-2 -ml-2 rounded-full hover:bg-[#F5F5F0]">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <Scissors className="w-3.5 h-3.5 text-[#C17F5F]" />
                                <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-[#737373]">Portal Taller</span>
                            </div>
                            <h1 className="font-serif text-lg font-bold text-[#1A1A1A] leading-tight">
                                {operator.name}
                            </h1>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-[#C17F5F] block">
                            {today.toLocaleDateString('es-CL', { weekday: 'long' })}
                        </span>
                        <span className="text-xs text-[#4A4A4A] font-medium">
                            {today.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}
                        </span>
                    </div>
                </div>
            </header>

            {/* Content Único (Semana) */}
            <main className="max-w-2xl mx-auto px-4 md:px-6 py-6">
                <div className="flex items-center gap-2 mb-4">
                    <CalendarDays className="w-4 h-4 text-[#C17F5F]" />
                    <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#737373]">
                        Semana del {formatDateShort(weekStartStr)} al {formatDateShort(weekEndStr)}
                    </h2>
                </div>

                <div className="space-y-4">
                    {weekDays.map(dayStr => {
                        const dayTasks = tasksByDay[dayStr] || [];
                        const isToday = dayStr === todayStr;
                        const isPast = dayStr < todayStr;
                        const dayHours = dayTasks.reduce((s: number, t: any) => s + Number(t.duration_hours || 0), 0);

                        return (
                            <div
                                key={dayStr}
                                className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                                    isToday
                                        ? 'border-[#C17F5F] ring-1 ring-[#C17F5F]/20'
                                        : isPast
                                            ? 'border-[#E5E5E5] opacity-75'
                                            : 'border-[#E5E5E5]'
                                }`}
                            >
                                {/* Cabecera del Día */}
                                <div className={`px-4 py-3 flex items-center justify-between border-b border-[#F5F5F0] ${
                                    isToday ? 'bg-[#C17F5F]/5' : 'bg-[#FDFCF8]'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        {isToday && <div className="w-2 h-2 rounded-full bg-[#C17F5F] animate-pulse" />}
                                        <span className={`text-xs font-bold uppercase tracking-wider ${
                                            isToday ? 'text-[#C17F5F]' : 'text-[#4A4A4A]'
                                        }`}>
                                            {formatDateShort(dayStr)}
                                        </span>
                                        {isToday && <span className="text-[8px] bg-[#C17F5F] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Hoy</span>}
                                    </div>
                                    {dayTasks.length > 0 && (
                                        <span className="text-[10px] text-[#737373] font-bold">{dayHours}h · {dayTasks.length} tarea{dayTasks.length > 1 ? 's' : ''}</span>
                                    )}
                                </div>

                                {/* Lista de Tareas */}
                                {dayTasks.length === 0 ? (
                                    <div className="px-5 py-5 text-center">
                                        <p className="text-[11px] text-[#737373]/60 italic font-light">Día sin tareas planificadas</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[#F5F5F0]">
                                        {dayTasks.map((task: any, i: number) => {
                                            const hasOrder = !!task.order_id;
                                            
                                            // Contenido de la fila de tarea
                                            const taskContent = (
                                                <div className="flex items-center gap-3 w-full">
                                                    <span className="text-xs font-mono text-[#C17F5F] font-bold shrink-0 w-10">
                                                        {task.time_label || `${String(task.start_hour || 9).padStart(2, '0')}:00`}
                                                    </span>
                                                    
                                                    <div className="min-w-0 flex-1 py-1">
                                                        <p className="text-sm text-[#1A1A1A] font-medium truncate leading-tight">
                                                            {task.description || task.order?.description || 'Tarea'}
                                                        </p>
                                                        {task.order && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <p className="text-[10px] text-[#737373] truncate">{task.order.customerName}</p>
                                                                {task.order.status && (
                                                                    <span className={`text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm ${STATUS_COLORS[task.order.status] || 'bg-zinc-100 text-zinc-500'}`}>
                                                                        {task.order.status}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-[10px] bg-[#F5F5F0] text-[#4A4A4A] px-2 py-1 rounded-full font-bold uppercase tracking-widest">
                                                            {task.duration_hours}h
                                                        </span>
                                                        {hasOrder && (
                                                            <ChevronRight className="w-4 h-4 text-[#C17F5F]" />
                                                        )}
                                                    </div>
                                                </div>
                                            );

                                            // Renderizar como Link (si hay orden) o como div estático
                                            return hasOrder ? (
                                                <Link 
                                                    key={task.id || i}
                                                    href={`/taller/${operatorId}/orden/${task.order_id}`} 
                                                    className="px-4 py-3.5 flex items-center justify-between hover:bg-[#FDFCF8] active:bg-[#F5F5F0] transition-colors block w-full"
                                                >
                                                    {taskContent}
                                                </Link>
                                            ) : (
                                                <div key={task.id || i} className="px-4 py-3.5 flex items-center justify-between w-full">
                                                    {taskContent}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
