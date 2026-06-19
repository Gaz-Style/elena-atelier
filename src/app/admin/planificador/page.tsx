'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, ChevronLeft, ChevronRight, Clock, Lock, Plus, X,
    Printer, RefreshCw, User, CalendarDays, AlertTriangle, Check,
    GripVertical, Scissors, Zap, Coffee
} from 'lucide-react';
import { getOperatorsAction } from '../pos/actions';
import { getProductionOrders } from '../production/actions';
import { supabase } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type TimeBlock = {
    id: string;
    operatorId: string;
    day: string; // 'YYYY-MM-DD'
    startHour: number;
    durationHours: number;
    label: string;
    type: 'order' | 'appointment' | 'blocked' | 'break';
    orderId?: string;
    color?: string;
};

type Operator = {
    id: string;
    name: string;
    status: string;
    daily_hours_capacity: number;
    working_days: number[];
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const HOURS = Array.from({ length: 13 }, (_, i) => i + 9); // 9:00 to 21:00
const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const BLOCK_COLORS: Record<string, string> = {
    order:       'bg-brand-terracotta/20 border-brand-terracotta/50 text-brand-charcoal',
    appointment: 'bg-blue-500/15 border-blue-400/50 text-blue-900',
    blocked:     'bg-gray-300/40 border-gray-400/60 text-gray-600',
    break:       'bg-amber-400/20 border-amber-400/50 text-amber-900',
};

const BLOCK_ICONS: Record<string, React.ReactNode> = {
    order:       <Scissors className="w-3 h-3" />,
    appointment: <User className="w-3 h-3" />,
    blocked:     <Lock className="w-3 h-3" />,
    break:       <Coffee className="w-3 h-3" />,
};

function getWeekDays(anchor: Date): Date[] {
    const day = anchor.getDay(); // 0 = Sun
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(anchor);
    monday.setDate(anchor.getDate() + diff);
    return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function dateStr(d: Date): string {
    return d.toISOString().split('T')[0];
}

function formatHour(h: number): string {
    return `${h.toString().padStart(2, '0')}:00`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function PlanificadorPage() {
    const [operators, setOperators] = useState<Operator[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [agendamientos, setAgendamientos] = useState<any[]>([]);
    const [blocks, setBlocks] = useState<TimeBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [anchor, setAnchor] = useState<Date>(new Date());
    const [isAddingBlock, setIsAddingBlock] = useState(false);
    const [selectedCell, setSelectedCell] = useState<{ opId: string; day: string; hour: number } | null>(null);
    const [newBlock, setNewBlock] = useState({ label: '', type: 'order' as TimeBlock['type'], durationHours: 1, orderId: '' });

    const weekDays = getWeekDays(anchor);
    const today = dateStr(new Date());

    // ── Load data ─────────────────────────────────────────────────────────────
    const loadData = useCallback(async () => {
        setLoading(true);
        const [ops, ords] = await Promise.all([
            getOperatorsAction(),
            getProductionOrders(),
        ]);
        setOperators(ops.filter((o: Operator) => o.status === 'active'));
        setOrders(ords?.filter((o: any) => !['delivered', 'scheduled'].includes(o.status)) || []);

        // Fetch agendamientos for this week
        const startStr = dateStr(weekDays[0]);
        const endStr = dateStr(weekDays[weekDays.length - 1]);
        const { data: agenda } = await supabase
            .from('agendamientos')
            .select('*')
            .gte('fecha_hora', `${startStr}T00:00:00`)
            .lte('fecha_hora', `${endStr}T23:59:59`)
            .neq('estado', 'cancelado');
        setAgendamientos(agenda || []);

        setLoading(false);
    }, [anchor]);

    useEffect(() => { loadData(); }, [loadData]);

    // ── Auto-generate blocks from orders and agendamientos ────────────────────
    useEffect(() => {
        const generated: TimeBlock[] = [];

        // From production orders - place them on their production_start_date
        orders.forEach(order => {
            const targetDateStr = order.production_start_date || order.deadline;
            if (!targetDateStr) return;
            const targetDate = new Date(targetDateStr);
            const ds = dateStr(targetDate);
            if (!weekDays.find(d => dateStr(d) === ds)) return;

            const opId = order.assigned_operator_id || 'unassigned';
            const existingForOp = generated.filter(b => b.operatorId === opId && b.day === ds && b.type === 'order');
            const startH = 9 + existingForOp.reduce((sum, b) => sum + b.durationHours, 0);

            generated.push({
                id: `order-${order.id}`,
                operatorId: opId,
                day: ds,
                startHour: Math.min(startH, 19),
                durationHours: Math.min(Number(order.estimated_hours) || 2, 4),
                label: order.description || 'Orden sin nombre',
                type: 'order',
                orderId: order.id,
            });
        });

        // From agendamientos - assign to Elena (first operator) by default
        agendamientos.forEach(ag => {
            const agDate = new Date(ag.fecha_hora);
            const ds = dateStr(agDate);
            const hour = agDate.getHours();
            const opId = operators[0]?.id || 'unassigned';
            generated.push({
                id: `agenda-${ag.id}`,
                operatorId: opId,
                day: ds,
                startHour: hour,
                durationHours: 1,
                label: ag.tipo_evento === 'tarea_interna' ? (ag.notas || 'Bloqueo') : `Cita: ${ag.nombre}`,
                type: ag.tipo_evento === 'tarea_interna' ? 'blocked' : 'appointment',
            });
        });

        setBlocks(prev => {
            // Keep manually-added blocks (not from orders/agenda)
            const manual = prev.filter(b => !b.id.startsWith('order-') && !b.id.startsWith('agenda-'));
            return [...manual, ...generated];
        });
    }, [orders, agendamientos, operators, anchor]);

    // ── Add manual block ───────────────────────────────────────────────────────
    function handleAddBlock() {
        if (!selectedCell || !newBlock.label.trim()) return;
        const block: TimeBlock = {
            id: `manual-${Date.now()}`,
            operatorId: selectedCell.opId,
            day: selectedCell.day,
            startHour: selectedCell.hour,
            durationHours: newBlock.durationHours,
            label: newBlock.label,
            type: newBlock.type,
            orderId: newBlock.orderId || undefined,
        };
        setBlocks(prev => [...prev, block]);
        setIsAddingBlock(false);
        setSelectedCell(null);
        setNewBlock({ label: '', type: 'order', durationHours: 1, orderId: '' });
    }

    function handleRemoveBlock(id: string) {
        setBlocks(prev => prev.filter(b => b.id !== id));
    }

    function openAddBlock(opId: string, day: string, hour: number) {
        setSelectedCell({ opId, day, hour });
        setIsAddingBlock(true);
    }

    // ── Navigation ─────────────────────────────────────────────────────────────
    function prevWeek() {
        const d = new Date(anchor);
        d.setDate(d.getDate() - 7);
        setAnchor(d);
    }
    function nextWeek() {
        const d = new Date(anchor);
        d.setDate(d.getDate() + 7);
        setAnchor(d);
    }
    function goToday() {
        setAnchor(new Date());
    }

    // ── Compute daily load ─────────────────────────────────────────────────────
    function getDayLoad(opId: string, day: string) {
        return blocks
            .filter(b => b.operatorId === opId && b.day === day && b.type === 'order')
            .reduce((sum, b) => sum + b.durationHours, 0);
    }

    const opDailyCapacity = (op: Operator) => op.daily_hours_capacity || 8;

    // ── Unassigned orders sidebar ──────────────────────────────────────────────
    const unassignedOrders = orders.filter(o => !o.assigned_operator_id);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#FAFAF9] font-sans text-brand-charcoal">

            {/* ── HEADER ──────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm px-4 md:px-8 py-3 flex items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Taller Elena Atelier</p>
                        <h1 className="font-serif text-xl leading-tight">Planificación Semanal</h1>
                    </div>
                </div>

                {/* Week navigator */}
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                    <button onClick={prevWeek} className="p-1 hover:text-brand-terracotta transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={goToday} className="text-xs font-bold text-brand-charcoal hover:text-brand-terracotta transition-colors px-2">
                        {weekDays[0].getDate()} {weekDays[0].toLocaleDateString('es-CL', { month: 'short' })} — {weekDays[weekDays.length - 1].getDate()} {weekDays[weekDays.length - 1].toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })}
                    </button>
                    <button onClick={nextWeek} className="p-1 hover:text-brand-terracotta transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={loadData} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-brand-charcoal transition-colors" title="Recargar">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => window.print()} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-brand-charcoal transition-colors" title="Imprimir">
                        <Printer className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* ── PRINT HEADER ────────────────────────────────────────────── */}
            <div className="hidden print:block text-center py-4 border-b border-gray-300 mb-4">
                <h1 className="text-2xl font-bold uppercase tracking-widest">Elena Atelier — Planificación Semanal de Taller</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Semana del {weekDays[0].toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })} al {weekDays[weekDays.length - 1].toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            <div className="flex h-[calc(100vh-65px)] overflow-hidden print:block print:h-auto">

                {/* ── LEFT SIDEBAR: Unassigned + Legend ─────────────────────── */}
                <aside className="w-64 shrink-0 border-r border-gray-100 bg-white flex flex-col overflow-hidden print:hidden">
                    <div className="p-4 border-b border-gray-100">
                        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-3">Sin asignar ({unassignedOrders.length})</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {unassignedOrders.length === 0 ? (
                                <div className="text-center py-4 text-gray-300">
                                    <Check className="w-5 h-5 mx-auto mb-1" />
                                    <p className="text-[10px]">Todo asignado</p>
                                </div>
                            ) : (
                                unassignedOrders.map(order => (
                                    <div key={order.id} className="bg-red-50 border border-red-200 rounded-md p-2.5 text-[11px] animate-pulse-once">
                                        <p className="font-bold text-red-800 truncate">{order.description}</p>
                                        <p className="text-red-500 flex items-center gap-1 mt-0.5">
                                            <AlertTriangle className="w-2.5 h-2.5" />
                                            Sin costurera
                                        </p>
                                        {order.estimated_hours > 0 && (
                                            <p className="text-red-400 text-[9px] mt-0.5">{order.estimated_hours}h estimadas</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Operators summary */}
                    <div className="p-4 border-b border-gray-100">
                        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-3">Equipo Activo</p>
                        <div className="space-y-3">
                            {operators.map(op => {
                                const totalThisWeek = weekDays.reduce((sum, d) => sum + getDayLoad(op.id, dateStr(d)), 0);
                                const capacity = opDailyCapacity(op) * weekDays.filter(d => {
                                    const dow = d.getDay();
                                    return op.working_days?.includes(dow === 0 ? 7 : dow);
                                }).length;
                                const pct = capacity > 0 ? Math.round((totalThisWeek / capacity) * 100) : 0;
                                return (
                                    <div key={op.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[11px] font-bold text-brand-charcoal">{op.name}</span>
                                            <span className={`text-[9px] font-bold ${pct > 90 ? 'text-red-500' : pct > 60 ? 'text-amber-600' : 'text-emerald-600'}`}>{pct}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${pct > 90 ? 'bg-red-400' : pct > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                                style={{ width: `${Math.min(100, pct)}%` }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-gray-400 mt-0.5">{totalThisWeek}h / {capacity}h semana</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="p-4">
                        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-3">Leyenda</p>
                        <div className="space-y-2">
                            {(['order', 'appointment', 'blocked', 'break'] as const).map(type => (
                                <div key={type} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-sm border ${BLOCK_COLORS[type].split(' ').slice(0, 2).join(' ')}`} />
                                    <span className="text-[10px] text-gray-600 capitalize">
                                        {type === 'order' ? 'Confección' : type === 'appointment' ? 'Cita cliente' : type === 'blocked' ? 'Bloqueado' : 'Pausa'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ── MAIN GRID ───────────────────────────────────────────── */}
                <main className="flex-1 overflow-auto bg-[#FAFAF9]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center space-y-3">
                                <RefreshCw className="w-8 h-8 animate-spin text-brand-terracotta mx-auto" />
                                <p className="text-sm text-gray-400 uppercase tracking-widest">Cargando planificador...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="min-w-[900px]">

                            {/* Day headers */}
                            <div className={`grid sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm print:static`}
                                style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}>
                                <div className="p-3 border-r border-gray-100" /> {/* hour gutter */}
                                {weekDays.map(day => {
                                    const ds = dateStr(day);
                                    const isToday = ds === today;
                                    const dow = day.getDay();
                                    const isWorking = operators.some(op => op.working_days?.includes(dow === 0 ? 7 : dow));
                                    return (
                                        <div key={ds} className={`p-3 text-center border-r border-gray-100 last:border-r-0 transition-colors ${isToday ? 'bg-brand-terracotta/5' : isWorking ? 'bg-white' : 'bg-gray-50'}`}>
                                            <p className={`text-[9px] uppercase tracking-widest font-bold ${isToday ? 'text-brand-terracotta' : 'text-gray-400'}`}>
                                                {DAY_NAMES_SHORT[dow]}
                                            </p>
                                            <p className={`text-xl font-serif mt-0.5 ${isToday ? 'text-brand-terracotta' : 'text-brand-charcoal'}`}>
                                                {day.getDate()}
                                            </p>
                                            {isToday && <div className="w-1.5 h-1.5 bg-brand-terracotta rounded-full mx-auto mt-1" />}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Operator rows */}
                            {operators.map((op, opIdx) => (
                                <div key={op.id}>
                                    {/* Operator label row */}
                                    <div className={`grid border-b border-brand-terracotta/30 ${opIdx > 0 ? 'border-t-2 border-t-gray-200 mt-4' : ''}`}
                                        style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}>
                                        <div className="bg-brand-charcoal/5 border-r border-gray-200 flex items-center justify-center py-3">
                                            <div className="rotate-[-90deg] whitespace-nowrap">
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal">{op.name}</span>
                                            </div>
                                        </div>
                                        {weekDays.map(day => {
                                            const ds = dateStr(day);
                                            const dow = day.getDay();
                                            const worksToday = op.working_days?.includes(dow === 0 ? 7 : dow);
                                            const dayLoad = getDayLoad(op.id, ds);
                                            const cap = opDailyCapacity(op);
                                            const pct = cap > 0 ? Math.round((dayLoad / cap) * 100) : 0;
                                            return (
                                                <div key={ds} className={`border-r border-gray-100 last:border-r-0 p-2 flex items-center justify-between ${!worksToday ? 'bg-gray-100/60' : ''}`}>
                                                    {worksToday ? (
                                                        <>
                                                            <div className="flex items-center gap-1.5">
                                                                <Zap className={`w-3 h-3 ${pct > 90 ? 'text-red-400' : pct > 60 ? 'text-amber-400' : 'text-emerald-400'}`} />
                                                                <span className="text-[9px] font-bold text-gray-500">{dayLoad}h / {cap}h</span>
                                                            </div>
                                                            <div className="w-12 bg-gray-200 rounded-full h-1 overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${pct > 90 ? 'bg-red-400' : pct > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                                                    style={{ width: `${Math.min(100, pct)}%` }}
                                                                />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-[9px] text-gray-400 italic mx-auto">Descanso</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Hour rows for this operator */}
                                    {HOURS.map(hour => (
                                        <div key={hour} className="grid border-b border-gray-100"
                                            style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}>
                                            {/* Hour gutter */}
                                            <div className="border-r border-gray-100 bg-white flex items-center justify-center py-2">
                                                <span className="text-[9px] text-gray-300 font-mono">{formatHour(hour)}</span>
                                            </div>

                                            {weekDays.map(day => {
                                                const ds = dateStr(day);
                                                const dow = day.getDay();
                                                const worksToday = op.working_days?.includes(dow === 0 ? 7 : dow);
                                                const cellBlocks = blocks.filter(b =>
                                                    b.operatorId === op.id && b.day === ds && b.startHour === hour
                                                );
                                                const isToday = ds === today;

                                                return (
                                                    <div
                                                        key={ds}
                                                        className={`border-r border-gray-100 last:border-r-0 relative min-h-[48px] group ${
                                                            isToday ? 'bg-brand-terracotta/[0.02]' : ''
                                                        } ${!worksToday ? 'bg-gray-50/60 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(0,0,0,0.02)_8px,rgba(0,0,0,0.02)_16px)]' : 'hover:bg-gray-50/50 cursor-pointer'}`}
                                                        onClick={() => worksToday && openAddBlock(op.id, ds, hour)}
                                                    >
                                                        {/* Blocks */}
                                                        {cellBlocks.map(block => (
                                                            <div
                                                                key={block.id}
                                                                className={`absolute inset-x-1 top-0.5 rounded border text-[9px] px-2 py-1 flex items-start gap-1 shadow-sm ${BLOCK_COLORS[block.type]} z-10 overflow-hidden`}
                                                                style={{ minHeight: `${block.durationHours * 46 - 4}px` }}
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                <span className="mt-0.5 shrink-0">{BLOCK_ICONS[block.type]}</span>
                                                                <span className="font-medium leading-tight truncate flex-1">{block.label}</span>
                                                                <button
                                                                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 ml-auto"
                                                                    onClick={() => handleRemoveBlock(block.id)}
                                                                    title="Eliminar"
                                                                >
                                                                    <X className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>
                                                        ))}

                                                        {/* Add hint */}
                                                        {worksToday && cellBlocks.length === 0 && (
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Plus className="w-3.5 h-3.5 text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {operators.length === 0 && !loading && (
                                <div className="text-center py-24 text-gray-400">
                                    <User className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                                    <p className="text-sm">No hay operarias activas. Añade costureras desde el <Link href="/admin/production-board" className="underline text-brand-terracotta">Live Board</Link>.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* ── ADD BLOCK MODAL ─────────────────────────────────────────── */}
            {isAddingBlock && selectedCell && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-serif text-lg">Añadir Bloque</h3>
                            <button onClick={() => setIsAddingBlock(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-5 flex items-center gap-2">
                            <CalendarDays className="w-3.5 h-3.5 text-brand-terracotta" />
                            <span>
                                <strong>{operators.find(o => o.id === selectedCell.opId)?.name}</strong>
                                {' · '}
                                {DAY_NAMES_FULL[weekDays.find(d => dateStr(d) === selectedCell.day)?.getDay() || 1]}
                                {' · '}
                                {formatHour(selectedCell.hour)}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 block mb-1">Tipo</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['order', 'appointment', 'blocked', 'break'] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setNewBlock(p => ({ ...p, type: t }))}
                                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                                                newBlock.type === t
                                                    ? 'border-brand-charcoal bg-brand-charcoal text-white'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            {BLOCK_ICONS[t]}
                                            {t === 'order' ? 'Confección' : t === 'appointment' ? 'Cita' : t === 'blocked' ? 'Bloqueo' : 'Pausa'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 block mb-1">Descripción</label>
                                <input
                                    type="text"
                                    value={newBlock.label}
                                    onChange={e => setNewBlock(p => ({ ...p, label: e.target.value }))}
                                    placeholder="Ej: Vestido Amanda, Cita Clarita..."
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta/20"
                                    onKeyDown={e => e.key === 'Enter' && handleAddBlock()}
                                    autoFocus
                                />
                            </div>

                            {newBlock.type === 'order' && (
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 block mb-1">Vincular a orden (opcional)</label>
                                    <select
                                        value={newBlock.orderId}
                                        onChange={e => {
                                            const order = orders.find(o => o.id === e.target.value);
                                            setNewBlock(p => ({
                                                ...p,
                                                orderId: e.target.value,
                                                label: order ? order.description : p.label,
                                                durationHours: order ? Math.min(Number(order.estimated_hours) || 2, 8) : p.durationHours
                                            }));
                                        }}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-terracotta"
                                    >
                                        <option value="">Sin vincular</option>
                                        {orders.map(o => (
                                            <option key={o.id} value={o.id}>
                                                {o.description} ({o.estimated_hours}h)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 block mb-1">Duración</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range" min={0.5} max={8} step={0.5}
                                        value={newBlock.durationHours}
                                        onChange={e => setNewBlock(p => ({ ...p, durationHours: Number(e.target.value) }))}
                                        className="flex-1 accent-brand-terracotta"
                                    />
                                    <span className="text-sm font-bold text-brand-charcoal w-10 text-right">{newBlock.durationHours}h</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setIsAddingBlock(false)} className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddBlock}
                                disabled={!newBlock.label.trim()}
                                className="flex-1 bg-brand-charcoal text-white rounded-lg py-2.5 text-sm font-bold hover:bg-brand-terracotta transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print styles */}
            <style jsx global>{`
                @media print {
                    @page { size: A4 landscape; margin: 10mm; }
                    body { font-size: 11px; }
                    .print\\:hidden { display: none !important; }
                    .print\\:block { display: block !important; }
                    .print\\:static { position: static !important; }
                }
            `}</style>
        </div>
    );
}
