'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, ChevronLeft, ChevronRight, Plus, X,
    Printer, RefreshCw, Lock, Trash2, Scissors, User, Coffee, CalendarDays
} from 'lucide-react';
import { getOperatorsAction } from '../pos/actions';
import { getProductionOrders } from '../production/actions';
import { supabase } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type TaskType = 'orden' | 'cita' | 'bloqueado' | 'pausa';

type Task = {
    id: string;
    time: string;        // "10:00"
    label: string;
    type: TaskType;
    orderId?: string;
};

type DayOperatorData = {
    tasks: Task[];
    blocked: boolean;
    blockedReason?: string;
};

// operatorId → { 'YYYY-MM-DD' → DayOperatorData }
type PlannerData = Record<string, Record<string, DayOperatorData>>;

type Operator = {
    id: string;
    name: string;
    status: string;
    daily_hours_capacity: number;
    working_days: number[]; // 0=Dom,1=Lun...
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const TYPE_LABELS: Record<TaskType, string> = {
    orden: 'Confección',
    cita: 'Cita Cliente',
    bloqueado: 'Bloqueado',
    pausa: 'Pausa / Colación',
};

const TYPE_COLORS: Record<TaskType, string> = {
    orden:     '#B56240',  // terracotta
    cita:      '#2563EB',  // blue
    bloqueado: '#6B7280',  // gray
    pausa:     '#D97706',  // amber
};

function dateStr(d: Date): string {
    return d.toISOString().split('T')[0];
}

function getWeekDays(anchor: Date): Date[] {
    const day = anchor.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(anchor);
    monday.setDate(anchor.getDate() + diff);
    // Lunes a Sábado (6 días)
    return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function generateId(): string {
    return `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function PlanificadorPage() {
    const [operators, setOperators] = useState<Operator[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [planner, setPlanner] = useState<PlannerData>({});
    const [loading, setLoading] = useState(true);
    const [anchor, setAnchor] = useState<Date>(new Date());
    const weekDays = getWeekDays(anchor);
    const today = dateStr(new Date());

    // Modal state
    const [modal, setModal] = useState<{
        opId: string;
        day: string;
        task?: Task; // if editing
    } | null>(null);
    const [form, setForm] = useState({ time: '10:00', label: '', type: 'orden' as TaskType, orderId: '' });

    // ── Load ──────────────────────────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        const [ops, ords] = await Promise.all([
            getOperatorsAction(),
            getProductionOrders(),
        ]);
        const activeOps: Operator[] = (ops || []).filter((o: Operator) => o.status === 'active');
        const activeOrds = (ords || []).filter((o: any) => !['delivered', 'scheduled'].includes(o.status));
        setOperators(activeOps);
        setOrders(activeOrds);

        // Fetch agendamientos for this week
        const startStr = dateStr(weekDays[0]);
        const endStr = dateStr(weekDays[weekDays.length - 1]);
        const { data: agenda } = await supabase
            .from('agendamientos')
            .select('*')
            .gte('fecha_hora', `${startStr}T00:00:00`)
            .lte('fecha_hora', `${endStr}T23:59:59`)
            .neq('estado', 'cancelado');

        // Build initial planner state
        const newPlanner: PlannerData = {};

        activeOps.forEach((op: Operator) => {
            newPlanner[op.id] = {};
            weekDays.forEach(d => {
                const ds = dateStr(d);
                const dow = d.getDay(); // 0=Dom
                // Check if operator works this day
                const worksThisDay = op.working_days?.includes(dow === 0 ? 7 : dow);
                newPlanner[op.id][ds] = {
                    tasks: [],
                    blocked: !worksThisDay,
                    blockedReason: !worksThisDay ? 'Sin atención' : undefined,
                };
            });
        });

        // Inject production orders
        activeOrds.forEach((order: any) => {
            const targetDs = order.production_start_date
                ? order.production_start_date.split('T')[0]
                : null;
            if (!targetDs) return;
            const opId = order.assigned_operator_id;
            if (!opId || !newPlanner[opId]?.[targetDs]) return;
            if (newPlanner[opId][targetDs].blocked) return;

            // Estimate hour based on existing tasks
            const existing = newPlanner[opId][targetDs].tasks.length;
            const startH = 9 + existing;
            const timeLabel = `${String(startH).padStart(2, '0')}:00`;

            newPlanner[opId][targetDs].tasks.push({
                id: `order-${order.id}`,
                time: timeLabel,
                label: order.description || 'Orden sin nombre',
                type: 'orden',
                orderId: order.id,
            });
        });

        // Inject agendamientos → assign to first operator (Elena)
        const firstOpId = activeOps[0]?.id;
        (agenda || []).forEach((ag: any) => {
            const agDate = new Date(ag.fecha_hora);
            const ds = dateStr(agDate);
            const hour = agDate.getHours();
            const mins = agDate.getMinutes();
            const timeLabel = `${String(hour).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
            if (!firstOpId || !newPlanner[firstOpId]?.[ds]) return;
            if (newPlanner[firstOpId][ds].blocked) return;

            newPlanner[firstOpId][ds].tasks.push({
                id: `agenda-${ag.id}`,
                time: timeLabel,
                label: ag.tipo_evento === 'tarea_interna'
                    ? (ag.notas || 'Bloqueo')
                    : `Cita: ${ag.nombre} ${ag.apellido || ''}`.trim(),
                type: ag.tipo_evento === 'tarea_interna' ? 'bloqueado' : 'cita',
            });
        });

        // Sort tasks by time
        Object.values(newPlanner).forEach(opDays => {
            Object.values(opDays).forEach(dayData => {
                dayData.tasks.sort((a, b) => a.time.localeCompare(b.time));
            });
        });

        setPlanner(newPlanner);
        setLoading(false);
    }, [anchor]);

    useEffect(() => { load(); }, [load]);

    // ── Toggle block ──────────────────────────────────────────────────────────
    function toggleBlock(opId: string, day: string) {
        setPlanner(prev => {
            const cell = prev[opId]?.[day];
            if (!cell) return prev;
            return {
                ...prev,
                [opId]: {
                    ...prev[opId],
                    [day]: { ...cell, blocked: !cell.blocked, blockedReason: !cell.blocked ? 'Sin atención / Bloqueado' : undefined }
                }
            };
        });
    }

    // ── Open modal ─────────────────────────────────────────────────────────────
    function openAdd(opId: string, day: string) {
        setForm({ time: '10:00', label: '', type: 'orden', orderId: '' });
        setModal({ opId, day });
    }

    function openEdit(opId: string, day: string, task: Task) {
        setForm({ time: task.time, label: task.label, type: task.type, orderId: task.orderId || '' });
        setModal({ opId, day, task });
    }

    // ── Save task ─────────────────────────────────────────────────────────────
    function saveTask() {
        if (!modal || !form.label.trim()) return;
        const { opId, day, task } = modal;
        setPlanner(prev => {
            const cell = prev[opId]?.[day];
            if (!cell) return prev;
            let tasks: Task[];
            if (task) {
                // Edit existing
                tasks = cell.tasks.map(t =>
                    t.id === task.id
                        ? { ...t, time: form.time, label: form.label, type: form.type, orderId: form.orderId || undefined }
                        : t
                );
            } else {
                // Add new
                tasks = [...cell.tasks, {
                    id: generateId(),
                    time: form.time,
                    label: form.label,
                    type: form.type,
                    orderId: form.orderId || undefined,
                }];
            }
            tasks.sort((a, b) => a.time.localeCompare(b.time));
            return { ...prev, [opId]: { ...prev[opId], [day]: { ...cell, tasks } } };
        });
        setModal(null);
    }

    // ── Delete task ───────────────────────────────────────────────────────────
    function deleteTask(opId: string, day: string, taskId: string) {
        setPlanner(prev => {
            const cell = prev[opId]?.[day];
            if (!cell) return prev;
            return {
                ...prev,
                [opId]: {
                    ...prev[opId],
                    [day]: { ...cell, tasks: cell.tasks.filter(t => t.id !== taskId) }
                }
            };
        });
    }

    // ── Week nav ──────────────────────────────────────────────────────────────
    function prevWeek() { const d = new Date(anchor); d.setDate(d.getDate() - 7); setAnchor(d); }
    function nextWeek() { const d = new Date(anchor); d.setDate(d.getDate() + 7); setAnchor(d); }

    const weekLabel = `${weekDays[0].getDate()} ${weekDays[0].toLocaleDateString('es-CL', { month: 'long' })} — ${weekDays[5].getDate()} ${weekDays[5].toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-white text-gray-800 font-sans print:bg-white">

            {/* ── HEADER ─────────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 bg-white border-b-2 border-gray-800 print:hidden">
                <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">Elena Atelier · Taller Tabancura</p>
                            <h1 className="text-xl font-bold tracking-wide uppercase">Planificación Semanal de Taller</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Week nav */}
                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                            <button onClick={prevWeek} className="p-1 hover:text-gray-900 text-gray-400 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold px-2 whitespace-nowrap capitalize">{weekLabel}</span>
                            <button onClick={nextWeek} className="p-1 hover:text-gray-900 text-gray-400 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <button onClick={load} className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors" title="Recargar">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => window.print()} className="px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium text-sm flex items-center gap-2 transition-colors">
                            <Printer className="w-4 h-4" />
                            Imprimir
                        </button>
                    </div>
                </div>
            </header>

            {/* ── PRINT HEADER ───────────────────────────────────────────────── */}
            <div className="hidden print:block text-center py-4 mb-2">
                <h1 className="text-2xl font-bold uppercase tracking-widest">Planificación Semanal de Taller</h1>
                <p className="text-sm text-gray-500 mt-1 capitalize">{weekLabel}</p>
            </div>

            {/* ── LOADING ────────────────────────────────────────────────────── */}
            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                        <RefreshCw className="w-7 h-7 animate-spin" />
                        <span className="text-sm uppercase tracking-widest">Cargando...</span>
                    </div>
                </div>
            )}

            {/* ── LEGEND (above table) ────────────────────────────────────────── */}
            {!loading && (
                <div className="max-w-[1400px] mx-auto px-6 pt-4 pb-2 flex flex-wrap items-center gap-4 print:px-0">
                    {(Object.keys(TYPE_LABELS) as TaskType[]).map(t => (
                        <div key={t} className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: TYPE_COLORS[t] + '33', border: `2px solid ${TYPE_COLORS[t]}` }} />
                            {TYPE_LABELS[t]}
                        </div>
                    ))}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-2">
                        <span className="inline-block w-3 h-3 rounded-sm bg-gray-200 border-2 border-gray-400" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 6px)' }} />
                        Bloqueado / Descanso
                    </div>
                    <span className="text-[11px] text-gray-400 ml-auto print:hidden">Haz clic en una celda para añadir · Haz clic en una tarea para editar</span>
                </div>
            )}

            {/* ── MAIN TABLE ─────────────────────────────────────────────────── */}
            {!loading && operators.length > 0 && (
                <div className="max-w-[1400px] mx-auto px-6 pb-16 print:px-0 print:pb-0">
                    <table className="w-full border-collapse border-2 border-gray-900 text-sm mt-2">
                        <thead>
                            <tr>
                                <th
                                    className="border-2 border-gray-900 bg-gray-100 px-4 py-3 text-center text-base font-bold uppercase tracking-wide"
                                    style={{ width: '10%' }}
                                >
                                    Día
                                </th>
                                {operators.map(op => (
                                    <th
                                        key={op.id}
                                        className="border-2 border-gray-900 bg-gray-100 px-4 py-3 text-center text-base font-bold uppercase tracking-wide"
                                        style={{ width: `${90 / operators.length}%` }}
                                    >
                                        {op.name}
                                        <span className="block text-[9px] font-normal text-gray-500 normal-case tracking-normal mt-0.5">
                                            {op.daily_hours_capacity || 8}h/día
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {weekDays.map(day => {
                                const ds = dateStr(day);
                                const dow = day.getDay();
                                const isToday = ds === today;
                                const dayName = DAY_NAMES[dow];

                                return (
                                    <tr key={ds}>
                                        {/* Day column */}
                                        <td
                                            className={`border-2 border-gray-900 text-center font-bold text-sm uppercase tracking-wide align-middle px-2 py-4 ${isToday ? 'bg-amber-50' : 'bg-gray-50'}`}
                                        >
                                            <div className={`font-black text-base ${isToday ? 'text-amber-700' : 'text-gray-800'}`}>
                                                {dayName}
                                            </div>
                                            <div className={`text-lg font-serif ${isToday ? 'text-amber-700' : 'text-gray-600'}`}>
                                                {day.getDate()}
                                            </div>
                                            <div className="text-[9px] text-gray-400 font-normal normal-case tracking-normal">
                                                {day.toLocaleDateString('es-CL', { month: 'short' })}
                                            </div>
                                            {isToday && (
                                                <div className="mt-1 text-[8px] font-bold uppercase tracking-widest text-amber-600 bg-amber-100 rounded px-1 py-0.5 inline-block">
                                                    Hoy
                                                </div>
                                            )}
                                        </td>

                                        {/* Operator columns */}
                                        {operators.map(op => {
                                            const cell = planner[op.id]?.[ds];
                                            if (!cell) return <td key={op.id} className="border-2 border-gray-900 p-3" />;

                                            if (cell.blocked) {
                                                return (
                                                    <td
                                                        key={op.id}
                                                        className="border-2 border-gray-900 px-4 py-6 text-center text-gray-500 italic text-sm align-middle cursor-pointer group"
                                                        style={{
                                                            backgroundColor: '#e5e7eb',
                                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.04) 10px, rgba(0,0,0,0.04) 20px)'
                                                        }}
                                                        onClick={() => toggleBlock(op.id, ds)}
                                                        title="Clic para desbloquear"
                                                    >
                                                        <Lock className="w-4 h-4 mx-auto mb-1 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                                        <span className="text-xs">{cell.blockedReason || 'Sin atención'}</span>
                                                    </td>
                                                );
                                            }

                                            return (
                                                <td
                                                    key={op.id}
                                                    className="border-2 border-gray-900 px-3 py-2 align-top"
                                                >
                                                    {/* Tasks list */}
                                                    {cell.tasks.length > 0 && (
                                                        <div className="space-y-1.5 mb-2">
                                                            {cell.tasks.map(task => (
                                                                <div
                                                                    key={task.id}
                                                                    className="group flex items-start gap-2 cursor-pointer rounded px-2 py-1.5 transition-all hover:shadow-sm"
                                                                    style={{
                                                                        backgroundColor: TYPE_COLORS[task.type] + '18',
                                                                        borderLeft: `3px solid ${TYPE_COLORS[task.type]}`
                                                                    }}
                                                                    onClick={() => openEdit(op.id, ds, task)}
                                                                >
                                                                    <span
                                                                        className="font-bold text-gray-900 whitespace-nowrap text-[11px] leading-5 shrink-0 font-mono"
                                                                    >
                                                                        {task.time}
                                                                    </span>
                                                                    <span className="text-[12px] leading-5 flex-1 text-gray-800">
                                                                        {task.label}
                                                                    </span>
                                                                    <button
                                                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all shrink-0 print:hidden"
                                                                        onClick={e => { e.stopPropagation(); deleteTask(op.id, ds, task.id); }}
                                                                        title="Eliminar"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Add task button */}
                                                    <button
                                                        onClick={() => openAdd(op.id, ds)}
                                                        className="w-full flex items-center justify-center gap-1 text-[11px] text-gray-300 hover:text-gray-500 py-1.5 border border-dashed border-gray-200 hover:border-gray-400 rounded transition-all group print:hidden"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                        <span>Añadir</span>
                                                    </button>

                                                    {/* Block day button */}
                                                    <button
                                                        onClick={() => toggleBlock(op.id, ds)}
                                                        className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-200 hover:text-gray-400 py-1 mt-0.5 transition-all print:hidden"
                                                        title="Bloquear día"
                                                    >
                                                        <Lock className="w-2.5 h-2.5" />
                                                        <span>Bloquear</span>
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Footer note for print */}
                    <div className="hidden print:block text-center text-[9px] text-gray-400 mt-4 border-t border-gray-300 pt-2">
                        Generado por Elena Atelier OS · {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            )}

            {operators.length === 0 && !loading && (
                <div className="max-w-[1400px] mx-auto px-6 py-24 text-center text-gray-400">
                    <User className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p>No hay costureras activas. Añade operarias desde el{' '}
                        <Link href="/admin/production-board" className="underline text-blue-500">Live Board</Link>.
                    </p>
                </div>
            )}

            {/* ── ADD / EDIT MODAL ────────────────────────────────────────────── */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
                        {/* Modal header */}
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900">{modal.task ? 'Editar tarea' : 'Agregar tarea'}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    <strong>{operators.find(o => o.id === modal.opId)?.name}</strong>
                                    {' · '}
                                    {DAY_NAMES[weekDays.find(d => dateStr(d) === modal.day)?.getDay() || 1]}
                                    {' '}
                                    {weekDays.find(d => dateStr(d) === modal.day)?.getDate()}
                                </p>
                            </div>
                            <button onClick={() => setModal(null)} className="p-2 rounded-full hover:bg-gray-200 text-gray-400 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Type selector */}
                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 block mb-2">Tipo de bloque</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.entries(TYPE_LABELS) as [TaskType, string][]).map(([t, label]) => (
                                        <button
                                            key={t}
                                            onClick={() => setForm(p => ({ ...p, type: t }))}
                                            className={`px-3 py-2.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all ${form.type === t ? 'text-white border-transparent' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                            style={form.type === t ? { backgroundColor: TYPE_COLORS[t], borderColor: TYPE_COLORS[t] } : {}}
                                        >
                                            {t === 'orden' && <Scissors className="w-3.5 h-3.5" />}
                                            {t === 'cita' && <User className="w-3.5 h-3.5" />}
                                            {t === 'bloqueado' && <Lock className="w-3.5 h-3.5" />}
                                            {t === 'pausa' && <Coffee className="w-3.5 h-3.5" />}
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time + Label */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 block mb-1">Hora</label>
                                    <input
                                        type="time"
                                        value={form.time}
                                        onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700/20 font-mono"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 block mb-1">Descripción</label>
                                    <input
                                        type="text"
                                        value={form.label}
                                        onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                                        placeholder="Ej: Vestido Amanda, Cita Clarita..."
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700/20"
                                        onKeyDown={e => e.key === 'Enter' && saveTask()}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Link to order */}
                            {form.type === 'orden' && (
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 block mb-1">Vincular a orden del sistema</label>
                                    <select
                                        value={form.orderId}
                                        onChange={e => {
                                            const order = orders.find(o => o.id === e.target.value);
                                            setForm(p => ({
                                                ...p,
                                                orderId: e.target.value,
                                                label: order ? (order.description || p.label) : p.label,
                                            }));
                                        }}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-700"
                                    >
                                        <option value="">Sin vincular (entrada manual)</option>
                                        {orders.map(o => (
                                            <option key={o.id} value={o.id}>
                                                {o.description}
                                                {o.customers?.full_name ? ` — ${o.customers.full_name}` : ''}
                                                {o.estimated_hours ? ` (${o.estimated_hours}h)` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3 bg-gray-50">
                            {modal.task && (
                                <button
                                    onClick={() => { deleteTask(modal.opId, modal.day, modal.task!.id); setModal(null); }}
                                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Eliminar
                                </button>
                            )}
                            <div className="flex gap-3 ml-auto">
                                <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                                    Cancelar
                                </button>
                                <button
                                    onClick={saveTask}
                                    disabled={!form.label.trim()}
                                    className="px-6 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {modal.task ? 'Guardar cambios' : 'Añadir'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Print styles */}
            <style jsx global>{`
                @media print {
                    @page { size: A4 landscape; margin: 10mm; }
                    body { font-size: 11px; color: #111; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 2px solid #111 !important; }
                }
            `}</style>
        </div>
    );
}
