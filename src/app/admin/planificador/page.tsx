'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Printer, RefreshCw } from 'lucide-react';
import { getOperatorsAction } from '../pos/actions';
import { getProductionOrders } from '../production/actions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type TaskType = 'costura' | 'cita' | 'entrega' | 'bloqueo';

type Task = {
    id: string;
    time: string;
    label: string;
    type: TaskType;
    orderId?: string;
};

type DayCell = {
    tasks: Task[];
    blocked: boolean;
};

type PlannerData = Record<string, Record<string, DayCell>>; // opId → dateStr → DayCell

type Operator = {
    id: string;
    name: string;
    status: string;
    daily_hours_capacity: number;
    working_days: number[];
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const TASK_TYPES: { key: TaskType; label: string; emoji: string; color: string; bg: string; border: string }[] = [
    { key: 'costura',  label: 'Costura',  emoji: '✂️',  color: '#1e293b', bg: '#1e293b', border: '#1e293b' },
    { key: 'cita',     label: 'Cita',     emoji: '📅',  color: '#2563eb', bg: '#dbeafe', border: '#93c5fd' },
    { key: 'entrega',  label: 'Entrega',  emoji: '🎁',  color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
    { key: 'bloqueo',  label: 'Bloqueo',  emoji: '🚫',  color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
];

const TASK_ROW_STYLE: Record<TaskType, { background: string; borderLeft: string; timeColor: string }> = {
    costura:  { background: '#f8fafc', borderLeft: '3px solid #334155', timeColor: '#000' },
    cita:     { background: '#eff6ff', borderLeft: '3px solid #3b82f6', timeColor: '#1d4ed8' },
    entrega:  { background: '#fffbeb', borderLeft: '3px solid #f59e0b', timeColor: '#b45309' },
    bloqueo:  { background: '#fef2f2', borderLeft: '3px solid #ef4444', timeColor: '#991b1b' },
};

const DAY_NAMES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

function dateStr(d: Date) { return d.toISOString().split('T')[0]; }
function uid() { return `t${Date.now()}${Math.random().toString(36).slice(2,6)}`; }

function getWeekDays(anchor: Date): Date[] {
    const dow = anchor.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    const mon = new Date(anchor);
    mon.setDate(anchor.getDate() + diff);
    return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        return d;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function PlanificadorPage() {
    const [operators, setOperators]   = useState<Operator[]>([]);
    const [orders, setOrders]         = useState<any[]>([]);
    const [planner, setPlanner]       = useState<PlannerData>({});
    const [loading, setLoading]       = useState(true);
    const [anchor, setAnchor]         = useState(new Date());
    const weekDays = getWeekDays(anchor);
    const todayStr = dateStr(new Date());

    // Modal
    const [modal, setModal]   = useState<{ opId: string; day: string; task?: Task } | null>(null);
    const [mType, setMType]   = useState<TaskType>('costura');
    const [mTime, setMTime]   = useState('');
    const [mLabel, setMLabel] = useState('');

    // ── Load ─────────────────────────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        const [ops, ords] = await Promise.all([getOperatorsAction(), getProductionOrders()]);
        const activeOps: Operator[] = (ops || []).filter((o: Operator) => o.status === 'active');
        const activeOrds = (ords || []).filter((o: any) => !['delivered','scheduled'].includes(o.status));
        setOperators(activeOps);
        setOrders(activeOrds);

        const startStr = dateStr(weekDays[0]);
        const endStr   = dateStr(weekDays[5]);
        const { data: agenda } = await supabase
            .from('agendamientos').select('*')
            .gte('fecha_hora', `${startStr}T00:00:00`)
            .lte('fecha_hora', `${endStr}T23:59:59`)
            .neq('estado', 'cancelado');

        // Build planner
        const p: PlannerData = {};
        activeOps.forEach((op: Operator) => {
            p[op.id] = {};
            weekDays.forEach(d => {
                const ds  = dateStr(d);
                const dow = d.getDay();
                const works = op.working_days?.includes(dow === 0 ? 7 : dow);
                p[op.id][ds] = { tasks: [], blocked: !works };
            });
        });

        // Inject production orders
        activeOrds.forEach((order: any) => {
            const ds   = order.production_start_date?.split('T')[0] ?? null;
            const opId = order.assigned_operator_id;
            if (!ds || !opId || !p[opId]?.[ds] || p[opId][ds].blocked) return;
            const n = p[opId][ds].tasks.length;
            p[opId][ds].tasks.push({
                id: `order-${order.id}`,
                time: `${String(9 + n).padStart(2,'0')}:00`,
                label: order.description || 'Orden sin nombre',
                type: 'costura',
                orderId: order.id,
            });
        });

        // Inject agendamientos → first operator
        const firstOpId = activeOps[0]?.id;
        (agenda || []).forEach((ag: any) => {
            const agDate = new Date(ag.fecha_hora);
            const ds     = dateStr(agDate);
            if (!firstOpId || !p[firstOpId]?.[ds] || p[firstOpId][ds].blocked) return;
            const h = agDate.getHours(), m = agDate.getMinutes();
            p[firstOpId][ds].tasks.push({
                id: `agenda-${ag.id}`,
                time: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,
                label: ag.tipo_evento === 'tarea_interna'
                    ? (ag.notas || 'Bloqueo')
                    : `Cita: ${ag.nombre} ${ag.apellido||''}`.trim(),
                type: ag.tipo_evento === 'tarea_interna' ? 'bloqueo' : 'cita',
            });
        });

        // Sort by time
        Object.values(p).forEach(opDays =>
            Object.values(opDays).forEach(cell =>
                cell.tasks.sort((a,b) => a.time.localeCompare(b.time))
            )
        );

        setPlanner(p);
        setLoading(false);
    }, [anchor]);

    useEffect(() => { load(); }, [load]);

    // ── Modal helpers ─────────────────────────────────────────────────────────
    function openAdd(opId: string, day: string) {
        setMType('costura'); setMTime(''); setMLabel('');
        setModal({ opId, day });
    }
    function openEdit(opId: string, day: string, task: Task) {
        setMType(task.type); setMTime(task.time); setMLabel(task.label);
        setModal({ opId, day, task });
    }
    function saveTask() {
        if (!modal || !mLabel.trim()) return;
        const { opId, day, task } = modal;
        setPlanner(prev => {
            const cell = prev[opId]?.[day];
            if (!cell) return prev;
            let tasks: Task[];
            if (task) {
                tasks = cell.tasks.map(t => t.id === task.id ? { ...t, type: mType, time: mTime, label: mLabel } : t);
            } else {
                tasks = [...cell.tasks, { id: uid(), type: mType, time: mTime, label: mLabel }];
            }
            tasks.sort((a,b) => a.time.localeCompare(b.time));
            return { ...prev, [opId]: { ...prev[opId], [day]: { ...cell, tasks } } };
        });
        setModal(null);
    }
    function deleteTask(opId: string, day: string, taskId: string) {
        setPlanner(prev => {
            const cell = prev[opId]?.[day];
            if (!cell) return prev;
            return { ...prev, [opId]: { ...prev[opId], [day]: { ...cell, tasks: cell.tasks.filter(t => t.id !== taskId) } } };
        });
    }
    function toggleBlock(opId: string, day: string) {
        setPlanner(prev => {
            const cell = prev[opId]?.[day];
            if (!cell) return prev;
            return { ...prev, [opId]: { ...prev[opId], [day]: { ...cell, blocked: !cell.blocked } } };
        });
    }

    // Week nav
    function prevWeek() { const d = new Date(anchor); d.setDate(d.getDate()-7); setAnchor(d); }
    function nextWeek() { const d = new Date(anchor); d.setDate(d.getDate()+7); setAnchor(d); }

    const weekLabel = `${weekDays[0].getDate()} ${weekDays[0].toLocaleDateString('es-CL',{month:'long'})} — ${weekDays[5].getDate()} ${weekDays[5].toLocaleDateString('es-CL',{month:'long',year:'numeric'})}`;

    const modalOp   = operators.find(o => o.id === modal?.opId);
    const modalDay  = weekDays.find(d => dateStr(d) === modal?.day);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
        {/* ─── GLOBAL STYLES (matching your original HTML exactly) ──────────── */}
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600;700&display=swap');

            .planner-root {
                font-family: 'Segoe UI', Arial, sans-serif;
                margin: 0; padding: 0;
                color: #333;
                background: #fff;
                min-height: 100vh;
            }

            /* ── NAV BAR ── */
            .planner-nav {
                background: #fff;
                border-bottom: 2px solid #111;
                padding: 12px 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                position: sticky;
                top: 0;
                z-index: 40;
            }
            .planner-nav h1 {
                margin: 0;
                font-size: 20px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #111;
                font-weight: 700;
            }
            .planner-nav .week-nav {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                font-weight: 600;
                color: #111;
            }
            .planner-nav .week-nav button {
                border: 1px solid #ccc;
                background: #f9f9f9;
                cursor: pointer;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 14px;
                line-height: 1;
            }
            .planner-nav .week-nav button:hover { background: #e5e5e5; }
            .planner-nav .nav-actions { display: flex; gap: 8px; }
            .planner-nav .nav-btn {
                border: 1px solid #ccc;
                background: #f9f9f9;
                cursor: pointer;
                border-radius: 4px;
                padding: 6px 14px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                display: flex; align-items: center; gap: 6px;
            }
            .planner-nav .nav-btn:hover { background: #e5e5e5; }
            .planner-nav .nav-btn.back { color: #555; }

            /* ── TABLE ── */
            .planner-wrap { padding: 20px 24px; }
            .planner-table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
            }
            .planner-table th, .planner-table td {
                border: 2px solid #111;
                padding: 10px;
                vertical-align: top;
                font-size: 13px;
                line-height: 1.4;
            }
            .planner-table th {
                background: #f2f2f2;
                text-align: center;
                font-size: 15px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .col-day {
                width: 110px;
                font-weight: 700;
                background: #f9f9f9;
                text-align: center;
                vertical-align: middle;
                font-size: 13px;
                text-transform: uppercase;
            }
            .col-day .day-name { font-size: 14px; font-weight: 800; color: #111; letter-spacing: 1px; }
            .col-day .day-num  { font-size: 22px; font-weight: 300; color: #555; line-height: 1.2; }
            .col-day .day-month{ font-size: 10px; color: #999; text-transform: uppercase; font-weight: 600; }
            .col-day.is-today  { background: #fffbe6; }
            .col-day.is-today .day-name { color: #b45309; }
            .col-day.is-today .day-num  { color: #b45309; }
            .col-day .today-badge {
                display: inline-block;
                margin-top: 4px;
                font-size: 8px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                background: #f59e0b;
                color: #fff;
                padding: 2px 6px;
                border-radius: 3px;
            }

            /* ── BLOCKED CELL ── */
            .cell-blocked {
                background-color: #e0e0e0;
                background-image: repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(0,0,0,0.05) 10px,rgba(0,0,0,0.05) 20px);
                color: #777;
                text-align: center;
                vertical-align: middle;
                font-style: italic;
                font-size: 12px;
                cursor: pointer;
                user-select: none;
            }
            .cell-blocked:hover { background-color: #d0d0d0; }

            /* ── TASK SLOT ── */
            .time-slot {
                margin-bottom: 6px;
                padding-bottom: 5px;
                border-bottom: 1px dashed #ccc;
                display: flex;
                align-items: flex-start;
                gap: 6px;
                border-radius: 3px;
                padding: 4px 6px 5px 6px;
                cursor: pointer;
                transition: opacity .15s;
                position: relative;
            }
            .time-slot:last-child { border-bottom: none; }
            .time-slot:hover { opacity: .85; }
            .time-slot:hover .slot-del { opacity: 1; }

            .slot-time {
                font-weight: 700;
                font-size: 11px;
                font-family: monospace;
                white-space: nowrap;
                min-width: 38px;
                padding-top: 1px;
            }
            .slot-label { font-size: 12px; line-height: 1.45; flex: 1; }
            .slot-del {
                opacity: 0;
                cursor: pointer;
                font-size: 14px;
                color: #dc2626;
                line-height: 1;
                padding: 0 2px;
                transition: opacity .15s;
                position: absolute;
                right: 4px;
                top: 4px;
            }
            .slot-del:hover { color: #7f1d1d; }

            /* Add button inside cell */
            .add-slot-btn {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 11px;
                color: #aaa;
                cursor: pointer;
                padding: 4px 6px;
                border: 1px dashed #ddd;
                border-radius: 4px;
                margin-top: 4px;
                background: transparent;
                width: 100%;
                text-align: left;
                transition: all .15s;
                font-family: inherit;
            }
            .add-slot-btn:hover { border-color: #999; color: #555; background: #fafafa; }

            /* Block toggle btn */
            .block-btn {
                display: block;
                font-size: 10px;
                color: #bbb;
                cursor: pointer;
                margin-top: 3px;
                padding: 2px 6px;
                background: transparent;
                border: none;
                width: 100%;
                text-align: center;
                font-family: inherit;
                transition: color .15s;
            }
            .block-btn:hover { color: #ef4444; }

            /* ── MODAL OVERLAY ── */
            .modal-overlay {
                position: fixed; inset: 0; z-index: 999;
                background: rgba(0,0,0,.45);
                display: flex; align-items: center; justify-content: center;
                padding: 16px;
                backdrop-filter: blur(3px);
            }
            .modal-box {
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0,0,0,.3);
                width: 100%;
                max-width: 500px;
                overflow: hidden;
                font-family: 'Segoe UI', Arial, sans-serif;
            }
            .modal-header {
                background: #1e293b;
                color: #fff;
                padding: 16px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .modal-header h3 { margin: 0; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
            .modal-header .day-badge {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                background: rgba(255,255,255,.15);
                padding: 3px 10px;
                border-radius: 20px;
            }
            .modal-body { padding: 20px; }

            /* Type pills */
            .type-group { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
            .type-pill {
                display: flex; align-items: center; gap: 6px;
                padding: 7px 14px;
                border-radius: 20px;
                border: 2px solid #e5e7eb;
                background: #fff;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                transition: all .15s;
                font-family: inherit;
            }
            .type-pill:hover { border-color: #9ca3af; }
            .type-pill.active-costura { background: #1e293b; color: #fff; border-color: #1e293b; }
            .type-pill.active-cita    { background: #3b82f6; color: #fff; border-color: #3b82f6; }
            .type-pill.active-entrega { background: #f59e0b; color: #fff; border-color: #f59e0b; }
            .type-pill.active-bloqueo { background: #ef4444; color: #fff; border-color: #ef4444; }

            .modal-label {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: #6b7280;
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .modal-input, .modal-textarea {
                width: 100%;
                border: 1.5px solid #e5e7eb;
                border-radius: 6px;
                padding: 10px 12px;
                font-size: 13px;
                font-family: inherit;
                outline: none;
                transition: border-color .15s;
                color: #111;
                box-sizing: border-box;
            }
            .modal-input:focus, .modal-textarea:focus { border-color: #1e293b; }
            .modal-textarea { resize: vertical; min-height: 80px; }
            .modal-field { margin-bottom: 16px; }

            /* Order selector */
            .order-select {
                width: 100%;
                border: 1.5px solid #e5e7eb;
                border-radius: 6px;
                padding: 10px 12px;
                font-size: 13px;
                font-family: inherit;
                outline: none;
                color: #111;
                box-sizing: border-box;
                cursor: pointer;
            }
            .order-select:focus { border-color: #1e293b; }

            /* Modal footer */
            .modal-footer {
                border-top: 1px solid #f3f4f6;
                padding: 14px 20px;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                align-items: center;
            }
            .btn-cancel {
                padding: 10px 22px;
                border: 1.5px solid #e5e7eb;
                border-radius: 8px;
                background: #fff;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                font-family: inherit;
                color: #374151;
                transition: all .15s;
            }
            .btn-cancel:hover { background: #f9fafb; border-color: #9ca3af; }
            .btn-add {
                padding: 10px 28px;
                border: none;
                border-radius: 8px;
                background: #1e293b;
                color: #fff;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                font-family: inherit;
                transition: background .15s;
            }
            .btn-add:hover { background: #334155; }
            .btn-add:disabled { opacity: .4; cursor: not-allowed; }
            .btn-delete {
                padding: 10px 18px;
                border: 1.5px solid #fecaca;
                border-radius: 8px;
                background: #fff5f5;
                color: #dc2626;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                font-family: inherit;
                margin-right: auto;
                transition: all .15s;
            }
            .btn-delete:hover { background: #fee2e2; }

            /* ── PRINT ── */
            @media print {
                @page { size: A4 landscape; margin: 10mm; }
                .planner-nav, .add-slot-btn, .block-btn, .slot-del { display: none !important; }
                .planner-wrap { padding: 0; }
                .planner-table th, .planner-table td { font-size: 11px; padding: 7px; }
            }
        `}</style>

        <div className="planner-root">

            {/* ── NAV ───────────────────────────────────────────────────────── */}
            <nav className="planner-nav">
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <Link href="/admin" style={{ color:'#555', display:'flex', alignItems:'center', gap:4, textDecoration:'none', fontSize:12 }}>
                        <ArrowLeft style={{ width:14, height:14 }} /> Volver
                    </Link>
                    <h1>Planificación Semanal de Taller</h1>
                </div>

                <div className="week-nav">
                    <button onClick={prevWeek}><ChevronLeft style={{width:14,height:14}} /></button>
                    <span style={{ textTransform:'capitalize' }}>{weekLabel}</span>
                    <button onClick={nextWeek}><ChevronRight style={{width:14,height:14}} /></button>
                </div>

                <div className="nav-actions">
                    <button className="nav-btn" onClick={load} title="Recargar">
                        <RefreshCw style={{ width:13, height:13, ...(loading ? { animation:'spin 1s linear infinite' } : {}) }} />
                        {loading ? 'Cargando...' : 'Recargar'}
                    </button>
                    <button className="nav-btn" onClick={() => window.print()}>
                        <Printer style={{ width:13, height:13 }} /> Imprimir
                    </button>
                </div>
            </nav>

            {/* ── PRINT HEADER ─────────────────────────────────────────────── */}
            <div style={{ display:'none' }} className="print-header">
                <h1 style={{ textAlign:'center', fontSize:20, textTransform:'uppercase', letterSpacing:2, margin:'0 0 4px' }}>Planificación Semanal de Taller</h1>
                <p style={{ textAlign:'center', fontSize:12, color:'#666', marginBottom:16, textTransform:'capitalize' }}>{weekLabel}</p>
            </div>

            {/* ── TABLE ─────────────────────────────────────────────────────── */}
            <div className="planner-wrap">
                {loading ? (
                    <div style={{ textAlign:'center', padding:'60px 0', color:'#aaa', fontSize:13, textTransform:'uppercase', letterSpacing:2 }}>
                        Cargando planificación...
                    </div>
                ) : (
                    <table className="planner-table">
                        <thead>
                            <tr>
                                <th style={{ width:'110px' }}>Día</th>
                                {operators.map(op => (
                                    <th key={op.id}>
                                        {op.name}
                                        <span style={{ display:'block', fontSize:9, fontWeight:400, textTransform:'none', letterSpacing:0, color:'#888', marginTop:2 }}>
                                            {op.daily_hours_capacity || 8}h/día
                                        </span>
                                    </th>
                                ))}
                                {operators.length === 0 && (
                                    <th style={{ color:'#aaa', fontStyle:'italic', fontWeight:400 }}>
                                        Sin costureras activas
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {weekDays.map(day => {
                                const ds      = dateStr(day);
                                const dow     = day.getDay();
                                const isToday = ds === todayStr;
                                return (
                                    <tr key={ds}>
                                        {/* Day cell */}
                                        <td className={`col-day${isToday ? ' is-today' : ''}`}>
                                            <div className="day-name">{DAY_NAMES[dow]}</div>
                                            <div className="day-num">{day.getDate()}</div>
                                            <div className="day-month">{day.toLocaleDateString('es-CL',{month:'short'})}</div>
                                            {isToday && <div className="today-badge">Hoy</div>}
                                        </td>

                                        {/* Operator cells */}
                                        {operators.map(op => {
                                            const cell = planner[op.id]?.[ds];
                                            if (!cell) return <td key={op.id} />;

                                            if (cell.blocked) {
                                                return (
                                                    <td
                                                        key={op.id}
                                                        className="cell-blocked"
                                                        onClick={() => toggleBlock(op.id, ds)}
                                                        title="Clic para desbloquear"
                                                    >
                                                        🔒 Sin atención / Bloqueado
                                                    </td>
                                                );
                                            }

                                            const taskStyle = (t: Task) => TASK_ROW_STYLE[t.type];

                                            return (
                                                <td key={op.id}>
                                                    {/* Task slots */}
                                                    {cell.tasks.map(task => (
                                                        <div
                                                            key={task.id}
                                                            className="time-slot"
                                                            style={{ ...taskStyle(task) }}
                                                            onClick={() => openEdit(op.id, ds, task)}
                                                        >
                                                            <span className="slot-time" style={{ color: taskStyle(task).timeColor }}>
                                                                {task.time}
                                                            </span>
                                                            <span className="slot-label">{task.label}</span>
                                                            <span
                                                                className="slot-del"
                                                                onClick={e => { e.stopPropagation(); deleteTask(op.id, ds, task.id); }}
                                                                title="Eliminar"
                                                            >×</span>
                                                        </div>
                                                    ))}

                                                    {/* Add button */}
                                                    <button className="add-slot-btn" onClick={() => openAdd(op.id, ds)}>
                                                        ＋ Añadir tarea / cita
                                                    </button>
                                                    <button className="block-btn" onClick={() => toggleBlock(op.id, ds)}>
                                                        🔒 Bloquear día
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── MODAL ─────────────────────────────────────────────────────── */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="modal-header">
                            <h3>
                                📅 {modal.task ? 'Editar Tarea' : 'Nueva Tarea / Cita'}
                            </h3>
                            {modalDay && modalOp && (
                                <span className="day-badge">
                                    {DAY_NAMES[modalDay.getDay()].toUpperCase()} · {modalOp.name.toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div className="modal-body">

                            {/* Type pills */}
                            <div className="modal-label">Tipo de Actividad</div>
                            <div className="type-group">
                                {TASK_TYPES.map(t => (
                                    <button
                                        key={t.key}
                                        className={`type-pill${mType === t.key ? ` active-${t.key}` : ''}`}
                                        onClick={() => setMType(t.key)}
                                    >
                                        <span>{t.emoji}</span> {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Time */}
                            <div className="modal-field">
                                <div className="modal-label">🕐 Hora / Bloque Horario</div>
                                <input
                                    className="modal-input"
                                    type="text"
                                    placeholder="Ej: 10:00, Tarde, 12:30"
                                    value={mTime}
                                    onChange={e => setMTime(e.target.value)}
                                />
                            </div>

                            {/* Label / description */}
                            <div className="modal-field">
                                <div className="modal-label">📋 Descripción del Trabajo / Cliente</div>
                                <textarea
                                    className="modal-textarea"
                                    placeholder="Ej: Blusa Amanda o Margarita: Vestido Negro, Bastas"
                                    value={mLabel}
                                    onChange={e => setMLabel(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && e.ctrlKey && saveTask()}
                                />
                            </div>

                            {/* Link to order (only for costura) */}
                            {mType === 'costura' && orders.length > 0 && (
                                <div className="modal-field">
                                    <div className="modal-label">🔗 Vincular a Orden del Sistema (opcional)</div>
                                    <select
                                        className="order-select"
                                        onChange={e => {
                                            const o = orders.find(o => o.id === e.target.value);
                                            if (o) setMLabel(o.description || '');
                                        }}
                                    >
                                        <option value="">— Sin vincular (entrada manual) —</option>
                                        {orders.map(o => (
                                            <option key={o.id} value={o.id}>
                                                {o.description}{o.customers?.full_name ? ` — ${o.customers.full_name}` : ''}{o.estimated_hours ? ` (${o.estimated_hours}h)` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            {modal.task && (
                                <button
                                    className="btn-delete"
                                    onClick={() => { deleteTask(modal.opId, modal.day, modal.task!.id); setModal(null); }}
                                >
                                    🗑 Eliminar
                                </button>
                            )}
                            <button className="btn-cancel" onClick={() => setModal(null)}>Cancelar</button>
                            <button
                                className="btn-add"
                                onClick={saveTask}
                                disabled={!mLabel.trim()}
                            >
                                {modal.task ? 'Guardar cambios' : 'Añadir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
        </>
    );
}
