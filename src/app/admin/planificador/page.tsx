'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Printer, RefreshCw } from 'lucide-react';
import { getOperatorsAction } from '../pos/actions';
import { getProductionOrders } from '../production/actions';
import { getPlannerTasks, savePlannerTask, deletePlannerTask } from './actions';
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
    sortValue?: number;
    startHour?: number;
    durationHours?: number;
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
    const [activeBridalMilestones, setActiveBridalMilestones] = useState<any[]>([]);
    const [activeBridalProjects, setActiveBridalProjects] = useState<any[]>([]);
    const [activeProductionOrders, setActiveProductionOrders] = useState<any[]>([]);
    const [previewMode, setPreviewMode] = useState(false);
    const [viewMode, setViewMode]     = useState<'day'|'week'|'month'|'year'>('week');
    const [anchor, setAnchor]         = useState(new Date());
    const [workshopStart, setWorkshopStart] = useState('09:00');
    const [workshopEnd, setWorkshopEnd] = useState('18:00');
    const todayStr = dateStr(new Date());

    const hoursArray = useMemo(() => {
        const [startH] = workshopStart.split(':').map(Number);
        const [endH] = workshopEnd.split(':').map(Number);
        const arr = [];
        for (let h = startH; h < endH; h++) {
            arr.push(h);
        }
        return arr;
    }, [workshopStart, workshopEnd]);

    // Generate days based on viewMode
    const activeDays = useMemo(() => {
        const dow = anchor.getDay();
        const y = anchor.getFullYear();
        const m = anchor.getMonth();
        const d = anchor.getDate();

        if (viewMode === 'day') {
            return [new Date(anchor)];
        } 
        else if (viewMode === 'week') {
            const diff = dow === 0 ? -6 : 1 - dow;
            const mon = new Date(y, m, d + diff);
            return Array.from({ length: 6 }, (_, i) => new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i));
        } 
        else if (viewMode === 'month') {
            const daysInMonth = new Date(y, m + 1, 0).getDate();
            return Array.from({ length: daysInMonth }, (_, i) => new Date(y, m, i + 1));
        }
        else if (viewMode === 'year') {
            // For year view, we might need all days of the year to count tasks, but let's just use the start and end of the year.
            // Returning an array with first and last day is enough to set the range for the query.
            return [new Date(y, 0, 1), new Date(y, 11, 31)];
        }
        return [];
    }, [anchor, viewMode]);

    // Modal
    const [modal, setModal]   = useState<{ opId: string; day: string; task?: Task } | null>(null);
    const [mType, setMType]   = useState<TaskType>('costura');
    const [mTime, setMTime]   = useState('');
    const [mLabel, setMLabel] = useState('');
    const [mStartHour, setMStartHour] = useState(10);
    const [mOpId, setMOpId]   = useState('');
    const [mDay, setMDay]     = useState('');

    // ── Load ─────────────────────────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        const [ops, ords] = await Promise.all([getOperatorsAction(), getProductionOrders()]);
        const activeOps: Operator[] = (ops || []).filter((o: Operator) => o.status === 'active');
        const activeOrds = (ords || []).filter((o: any) => o.status !== 'delivered');
        setOperators(activeOps);
        setOrders(activeOrds);

        // Fetch workshop configuration
        const { data: configData } = await supabase
            .from('atelier_config')
            .select('workshop_working_hour_start, workshop_working_hour_end')
            .limit(1);
        if (configData && configData[0]) {
            setWorkshopStart(configData[0].workshop_working_hour_start?.slice(0, 5) || '09:00');
            setWorkshopEnd(configData[0].workshop_working_hour_end?.slice(0, 5) || '18:00');
        }

        if (activeDays.length === 0 || activeOps.length === 0) {
            setPlanner({});
            setLoading(false);
            return;
        }

        const startStr = dateStr(activeDays[0]);
        const endStr   = dateStr(activeDays[activeDays.length - 1]);
        
        const [agendaRes, customTasks] = await Promise.all([
            supabase.from('agendamientos').select('*')
                .gte('fecha_hora', `${startStr}T00:00:00`)
                .lte('fecha_hora', `${endStr}T23:59:59`)
                .neq('estado', 'cancelado'),
            getPlannerTasks(startStr, endStr)
        ]);

        const agenda = agendaRes.data || [];

        // Fetch active bridal projects & milestones
        const { data: bProjData } = await supabase
            .from('bridal_projects')
            .select('*, customers(full_name, phone, email)')
            .neq('status', 'cancelado')
            .neq('status', 'entregado')
            .order('event_date', { ascending: true });

        const { data: bMilestones } = await supabase
            .from('bridal_milestones')
            .select('*')
            .neq('status', 'completed')
            .order('scheduled_date', { ascending: true });

        setActiveBridalProjects(bProjData || []);

        const mappedMilestones = (bMilestones || []).map((m: any) => {
            const proj = (bProjData || []).find((p: any) => p.id === m.project_id);
            return {
                ...m,
                customer: proj?.customers,
                projectType: proj?.project_type,
                serviceType: proj?.service_type,
                eventDate: proj?.event_date
            };
        });
        setActiveBridalMilestones(mappedMilestones);

        const activeProd = (ords || []).filter((o: any) => 
            ['scheduled', 'draft', 'sewing', 'finishing', 'ready'].includes(o.status)
        );
        setActiveProductionOrders(activeProd);

        // Build planner
        const p: PlannerData = {};
        activeOps.forEach((op: Operator) => {
            p[op.id] = {};
            if (viewMode !== 'year') {
                activeDays.forEach(d => {
                    const ds  = dateStr(d);
                    const dow = d.getDay();
                    const works = op.working_days?.includes(dow === 0 ? 7 : dow);
                    p[op.id][ds] = { tasks: [], blocked: !works };
                });
            }
        });

        if (viewMode !== 'year') {
            // Inject production orders
            activeOrds.forEach((order: any) => {
                const ds   = order.production_start_date?.split('T')[0] ?? null;
                const opId = order.assigned_operator_id;
                if (!ds || !opId || !p[opId]?.[ds] || p[opId][ds].blocked) return;
                const hours = order.estimated_hours;
                const duration = hours
                    ? hours >= 1 ? `${hours}h` : `${Math.round(hours * 60)}min`
                    : '';
                
                const startDate = new Date(order.production_start_date);
                const startHour = startDate.getHours();
                const durationHours = Math.max(1, Math.round(hours || 1));

                p[opId][ds].tasks.push({
                    id: `order-${order.id}`,
                    time: duration,
                    label: order.description || 'Orden sin nombre',
                    type: 'costura',
                    orderId: order.id,
                    sortValue: startHour * 60,
                    startHour,
                    durationHours
                });
            });

            // Inject agendamientos → first operator
            const firstOpId = activeOps[0]?.id;
            (agenda || []).forEach((ag: any) => {
                const agDate = new Date(ag.fecha_hora);
                const ds     = dateStr(agDate);
                if (!firstOpId || !p[firstOpId]?.[ds] || p[firstOpId][ds].blocked) return;
                const durMin = ag.duracion_minutos || 60;
                const duration = durMin >= 60 
                    ? `${Math.floor(durMin/60)}${durMin%60 > 0 ? `.${Math.round(durMin%60/6*10)/10}` : ''}h`
                    : `${durMin}min`;
                
                const startTimeStr = agDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                const sortValue = agDate.getHours() * 60 + agDate.getMinutes();
                const startHour = agDate.getHours();
                const durationHours = Math.max(1, Math.round(durMin / 60));

                p[firstOpId][ds].tasks.push({
                    id: `agenda-${ag.id}`,
                    time: `${startTimeStr} (${duration})`,
                    label: ag.tipo_evento === 'tarea_interna'
                        ? (ag.notas || 'Bloqueo')
                        : `Cita: ${ag.nombre} ${ag.apellido||''}`.trim(),
                    type: ag.tipo_evento === 'tarea_interna' ? 'bloqueo' : 'cita',
                    sortValue,
                    startHour,
                    durationHours
                });
            });

            // Inject manual planner tasks from DB
            (customTasks || []).forEach((ct: any) => {
                const ds = ct.task_date;
                const opId = ct.operator_id;
                if (!p[opId]?.[ds]) return;

                p[opId][ds].tasks.push({
                    id: ct.id,
                    time: ct.time_label || `${ct.duration_hours}h`,
                    label: ct.description,
                    type: ct.task_type as any,
                    orderId: ct.order_id,
                    sortValue: ct.start_hour * 60,
                    startHour: ct.start_hour,
                    durationHours: ct.duration_hours
                });
            });

            // Sort tasks chronologically
            Object.values(p).forEach(opDays =>
                Object.values(opDays).forEach(cell =>
                    cell.tasks.sort((a,b) => {
                        const valA = a.sortValue ?? 9999;
                        const valB = b.sortValue ?? 9999;
                        if (valA !== valB) return valA - valB;
                        return a.label.localeCompare(b.label);
                    })
                )
            );
        }

        setPlanner(p);
        setLoading(false);
    }, [activeDays, viewMode]);

    useEffect(() => { load(); }, [load]);

    // ── Modal helpers ─────────────────────────────────────────────────────────
    function openAdd(opId: string, day: string) {
        setMType('costura'); setMTime(''); setMLabel('');
        setMStartHour(hoursArray[0] || 10);
        setMOpId(opId); setMDay(day);
        setModal({ opId, day });
    }
    function openEdit(opId: string, day: string, task: Task) {
        setMType(task.type); setMTime(task.time); setMLabel(task.label);
        setMStartHour(task.startHour || hoursArray[0] || 10);
        setMOpId(opId); setMDay(day);
        setModal({ opId, day, task });
    }
    async function saveTask() {
        if (!modal || !mLabel.trim()) return;
        
        const parseDuration = (t: string) => {
            const lower = t.toLowerCase();
            if (lower.includes('min')) {
                const val = parseFloat(lower.replace('min','').trim());
                return val ? val / 60 : 1;
            }
            if (lower.includes('h')) {
                const val = parseFloat(lower.replace('h','').trim());
                return val || 1;
            }
            return parseFloat(t) || 1;
        };

        const taskData = {
            id: modal.task?.id && modal.task.id.includes('-') ? modal.task.id : undefined,
            type: mType,
            date: mDay,
            startHour: mStartHour,
            durationHours: parseDuration(mTime),
            operatorId: mOpId,
            orderId: modal.task?.orderId || (orders.find(o => o.description === mLabel)?.id),
            label: mLabel,
            time: mTime
        };

        try {
            const res = await savePlannerTask(taskData);
            if (!res.success) {
                alert(res.error || 'Asegúrate de haber creado la tabla planner_tasks en Supabase primero.');
            } else {
                load();
                setModal(null);
            }
        } catch (e: any) {
            console.error("Error saving task:", e);
            alert("Hubo un error inesperado al guardar la tarea. " + e.message);
            setModal(null);
        }
    }
    
    async function deleteTask(opId: string, day: string, taskId: string) {
        if (taskId.includes('-') && !taskId.startsWith('order-') && !taskId.startsWith('ag-')) {
            try {
                await deletePlannerTask(taskId);
                load();
            } catch (e) {
                console.error("Error deleting task:", e);
                alert("Hubo un error al eliminar.");
            }
        } else {
            // Tareas automáticas no se borran desde aquí
            alert("Las tareas automáticas de Novias/Citas no se pueden eliminar desde el planificador. Elimínalas desde sus respectivos módulos.");
        }
    }
    function toggleBlock(opId: string, day: string) {
        setPlanner(prev => {
            const cell = prev[opId]?.[day];
            if (!cell) return prev;
            return { ...prev, [opId]: { ...prev[opId], [day]: { ...cell, blocked: !cell.blocked } } };
        });
    }

    // Nav helpers
    function prevRange() { 
        const d = new Date(anchor); 
        if (viewMode === 'day') d.setDate(d.getDate()-1);
        if (viewMode === 'week') d.setDate(d.getDate()-7);
        if (viewMode === 'month') d.setMonth(d.getMonth()-1);
        if (viewMode === 'year') d.setFullYear(d.getFullYear()-1);
        setAnchor(d); 
    }
    function nextRange() { 
        const d = new Date(anchor); 
        if (viewMode === 'day') d.setDate(d.getDate()+1);
        if (viewMode === 'week') d.setDate(d.getDate()+7);
        if (viewMode === 'month') d.setMonth(d.getMonth()+1);
        if (viewMode === 'year') d.setFullYear(d.getFullYear()+1);
        setAnchor(d); 
    }

    const rangeLabel = useMemo(() => {
        if (viewMode === 'day') {
            return `${DAY_NAMES[anchor.getDay()]} ${anchor.getDate()} ${anchor.toLocaleDateString('es-CL',{month:'long'})}`;
        }
        if (viewMode === 'week') {
            const start = activeDays[0];
            const end = activeDays[5];
            if (!start || !end) return '';
            return `${start.getDate()} ${start.toLocaleDateString('es-CL',{month:'short'})} — ${end.getDate()} ${end.toLocaleDateString('es-CL',{month:'short',year:'numeric'})}`;
        }
        if (viewMode === 'month') {
            return anchor.toLocaleDateString('es-CL',{month:'long',year:'numeric'});
        }
        return anchor.getFullYear().toString();
    }, [anchor, viewMode, activeDays]);

    const modalOp   = operators.find(o => o.id === modal?.opId);
    const modalDay  = activeDays.find(d => dateStr(d) === modal?.day);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">

            {/* ── NAV ───────────────────────────────────────────────────────── */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5 text-sm font-semibold">
                        <ArrowLeft className="w-4 h-4" /> Volver
                    </Link>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <h1 className="m-0 text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        Planificación Semanal <span className="hidden sm:inline text-slate-400 font-medium">| Taller</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <button onClick={prevRange} className="p-1.5 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm transition-all"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-sm font-bold px-2 capitalize text-slate-700 min-w-[140px] text-center">{rangeLabel}</span>
                    <button onClick={nextRange} className="p-1.5 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm transition-all"><ChevronRight className="w-4 h-4" /></button>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {['day', 'week', 'month', 'year'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode as any)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${viewMode === mode ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : mode === 'month' ? 'Mes' : 'Año'}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button 
                        className={`px-4 py-2 border rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm ${previewMode ? 'bg-[#0f172a] text-white border-[#0f172a] hover:bg-slate-800' : 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'}`}
                        onClick={() => setPreviewMode(!previewMode)}
                    >
                        {previewMode ? '✓ Vista Previa' : '✎ Código / Editar'}
                    </button>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm" onClick={load} title="Recargar">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
                        <span className="hidden sm:inline">{loading ? 'Cargando...' : 'Resetear'}</span>
                    </button>
                    <button className="px-4 py-2 bg-[#0f172a] border border-[#0f172a] rounded-lg text-sm font-bold text-white hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm" onClick={() => window.print()}>
                        <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Imprimir en A4 / PDF</span>
                    </button>
                </div>
            </nav>

            {/* ── PRINT HEADER ─────────────────────────────────────────────── */}
            <div className="hidden print:block text-center mb-6 pt-4">
                <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">Planificación de Taller</h1>
                <p className="text-sm text-slate-500 capitalize">{rangeLabel}</p>
            </div>

            {/* ── TABLE ─────────────────────────────────────────────────────── */}
            <div className="pt-[85px] p-6 max-w-[1600px] mx-auto print:p-0">
                {loading ? (
                    <div className="text-center py-24 text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">
                        Cargando planificación...
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-[#0f172a] text-white">
                                        <th colSpan={operators.length + 1} className="p-5 border-b border-[#1e293b]">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-serif uppercase tracking-widest flex items-center gap-2">
                                                    Planificación Semanal de Taller
                                                </h2>
                                                <span className="bg-[#1e293b] text-slate-300 text-xs px-3 py-1.5 rounded-md border border-slate-700 flex items-center gap-1.5">
                                                    📅 Vista Semanal Actualizable
                                                </span>
                                            </div>
                                        </th>
                                    </tr>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="w-16 p-4 text-center border-r border-slate-200 font-extrabold text-slate-400 uppercase text-[10px] tracking-widest">
                                            Hora
                                        </th>
                                        {operators.map(op => (
                                            <th key={op.id} className="p-4 border-r border-slate-200 last:border-0 min-w-[280px]">
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-slate-800 text-sm">{op.name}</span>
                                                    <span className="text-[11px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                        {op.daily_hours_capacity || 8}h disponibles / día
                                                    </span>
                                                </div>
                                            </th>
                                        ))}
                                        {operators.length === 0 && (
                                            <th className="p-4 text-slate-400 italic font-medium text-sm">
                                                Sin costureras activas
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(viewMode === 'day' || viewMode === 'week') && activeDays.map((day, idx) => {
                                        const ds      = dateStr(day);
                                        const dow     = day.getDay();
                                        const isToday = ds === todayStr;
                                        return (
                                            <React.Fragment key={ds}>
                                                {/* Day Header Row */}
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <td colSpan={operators.length + 1} className="p-3 border-r border-slate-100">
                                                        <div className="flex items-center gap-4 pl-2">
                                                            <div className="flex items-baseline gap-2">
                                                                <span className={`text-sm font-extrabold uppercase tracking-widest ${isToday ? 'text-amber-600' : 'text-slate-700'}`}>
                                                                    {DAY_NAMES[dow]}
                                                                </span>
                                                                <span className={`text-lg font-light ${isToday ? 'text-amber-600' : 'text-slate-600'}`}>
                                                                    {day.getDate()} {day.toLocaleDateString('es-CL',{month:'short'})}
                                                                </span>
                                                            </div>
                                                            {isToday && (
                                                                <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                                                                    Hoy
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                                
                                                <tr className="border-b border-slate-100 last:border-0 group">
                                                    
                                                    {/* TIMELINE CELL */}
                                                <td className="w-16 align-top border-r border-slate-100 bg-slate-50/30">
                                                    <div className="relative w-full" style={{ height: `${hoursArray.length * 60}px` }}>
                                                        {hoursArray.map((hour, i) => (
                                                            <div 
                                                                key={hour} 
                                                                className="absolute w-full text-right pr-2 text-[10px] font-bold text-slate-400"
                                                                style={{ top: `${i * 60 - 7}px` }}
                                                            >
                                                                {hour.toString().padStart(2, '0')}:00
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>

                                                {/* Operator cells */}
                                                {operators.map(op => {
                                                    const cell = planner[op.id]?.[ds];
                                                    if (!cell) return <td key={op.id} className="border-r border-slate-100" />;

                                                    if (cell.blocked) {
                                                        return (
                                                            <td
                                                                key={op.id}
                                                                className="p-3 align-top border-r border-slate-100 bg-slate-100/50 relative cursor-pointer hover:bg-slate-200/50 transition-colors group/cell"
                                                                onClick={() => toggleBlock(op.id, ds)}
                                                                title="Clic para desbloquear"
                                                            >
                                                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAiPjwvcmVjdD4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiNlMmU4ZjAiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')] opacity-50"></div>
                                                                <div className="relative h-full min-h-[100px] flex items-center justify-center">
                                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm group-hover/cell:text-slate-600 transition-colors">
                                                                        🔒 Sin atención / Bloqueado
                                                                    </span>
                                                                    {!previewMode && (
                                                                        <button className="absolute top-2 right-2 bg-white text-slate-500 border border-slate-200 px-2.5 py-1 rounded-md text-[10px] font-bold hover:bg-slate-50 hover:text-slate-800 transition-colors opacity-0 group-hover/cell:opacity-100 shadow-sm" onClick={(e) => { e.stopPropagation(); toggleBlock(op.id, ds); }}>
                                                                            Activar
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        );
                                                    }

                                                    return (
                                                        <td key={op.id} className="p-3 align-top border-r border-slate-100 hover:bg-slate-50/50 transition-colors min-h-[120px] relative">
                                                            
                                                            <div className="relative w-full" style={{ height: `${hoursArray.length * 60}px` }}>
                                                                {/* Grid Lines */}
                                                                {hoursArray.map((hour, i) => (
                                                                    <div 
                                                                        key={hour} 
                                                                        className="absolute w-full border-t border-slate-100/70"
                                                                        style={{ top: `${i * 60}px`, left: 0, right: 0 }}
                                                                    />
                                                                ))}
                                                                
                                                                {/* Tasks */}
                                                                {cell.tasks.map((task, taskIdx) => {
                                                                    const startIdx = task.startHour - (hoursArray[0] || 9);
                                                                    const top = Math.max(0, startIdx * 60);
                                                                    const height = (task.durationHours || 1) * 60;
                                                                    const style = TASK_ROW_STYLE[task.type];
                                                                    return (
                                                                        <div
                                                                            key={task.id}
                                                                            className={`absolute left-1 right-1 rounded-lg border shadow-sm flex flex-col p-2 overflow-hidden bg-opacity-90 ${!previewMode ? 'cursor-pointer hover:shadow-md hover:z-20 transition-all group/task' : ''}`}
                                                                            style={{ 
                                                                                top: `${top + 1}px`,
                                                                                height: `${height - 2}px`,
                                                                                backgroundColor: style.background, 
                                                                                borderLeft: style.borderLeft,
                                                                                borderColor: style.borderLeft,
                                                                                zIndex: 10 + taskIdx
                                                                            }}
                                                                            onClick={() => !previewMode && openEdit(op.id, ds, task)}
                                                                        >
                                                                            <div className="text-[11px] font-bold leading-tight text-slate-700 truncate">
                                                                                {task.label}
                                                                            </div>
                                                                            {task.time && (
                                                                                <div className="text-[9px] font-medium text-slate-500 mt-0.5 truncate">
                                                                                    ⏱ {task.time}
                                                                                </div>
                                                                            )}
                                                                            {!previewMode && (
                                                                                <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover/task:opacity-100 transition-opacity bg-white/80 rounded backdrop-blur-sm p-0.5">
                                                                                    <button className="p-1 text-slate-400 hover:text-slate-600 rounded" onClick={e => { e.stopPropagation(); openEdit(op.id, ds, task); }}><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>
                                                                                    <button className="p-1 text-red-400 hover:text-red-600 rounded" onClick={e => { e.stopPropagation(); deleteTask(op.id, ds, task.id); }}><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            
                                                            {/* Actions */}
                                                            {!previewMode && (
                                                                <div className="mt-3 flex flex-col gap-1.5 relative z-10">
                                                                    <button 
                                                                        className="w-full py-2 border border-dashed border-slate-300 rounded-xl text-[10px] font-bold text-slate-400 hover:border-slate-400 hover:bg-slate-50 transition-all"
                                                                        onClick={() => openAdd(op.id, ds)}
                                                                    >
                                                                        ＋ Añadir tarea
                                                                    </button>
                                                                    <button 
                                                                        className="w-full text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest hover:text-red-400 transition-colors"
                                                                        onClick={() => toggleBlock(op.id, ds)}
                                                                    >
                                                                        Bloquear día
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })}

                                    {/* ── MONTH VIEW ── */}
                                    {viewMode === 'month' && (
                                        <tr>
                                            <td colSpan={operators.length + 2} className="p-0">
                                                <div className="grid grid-cols-7 border-b border-slate-200">
                                                    {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
                                                        <div key={d} className="p-3 text-center border-r border-slate-200 last:border-0 font-extrabold text-slate-400 uppercase text-[11px] tracking-wider bg-slate-50">
                                                            {d}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-7 grid-rows-5 bg-white">
                                                    {activeDays.map(day => {
                                                        const ds = dateStr(day);
                                                        const isToday = ds === todayStr;
                                                        const dow = day.getDay();
                                                        // Convert Sunday (0) to 7, so Monday is 1, Sunday is 7
                                                        const gridColumn = dow === 0 ? 7 : dow;
                                                        
                                                        // Collect all tasks for this day across all operators
                                                        const dayTasks: {op: Operator, task: Task}[] = [];
                                                        operators.forEach(op => {
                                                            const cell = planner[op.id]?.[ds];
                                                            if (cell && cell.tasks) {
                                                                cell.tasks.forEach(t => dayTasks.push({op, task: t}));
                                                            }
                                                        });
                                                        
                                                        return (
                                                            <div 
                                                                key={ds} 
                                                                className={`min-h-[140px] p-2 border-r border-b border-slate-100 relative group/day cursor-pointer hover:bg-slate-50 transition-colors ${isToday ? 'bg-amber-50/30' : ''}`} 
                                                                style={day.getDate() === 1 ? { gridColumnStart: gridColumn } : {}}
                                                                onClick={() => { setAnchor(day); setViewMode('day'); }}
                                                            >
                                                                <div className={`text-sm font-bold mb-2 flex items-center justify-between ${isToday ? 'text-amber-600' : 'text-slate-400'}`}>
                                                                    <span>{day.getDate()}</span>
                                                                    {isToday && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                                                                </div>
                                                                <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] custom-scrollbar">
                                                                    {dayTasks.map(({op, task}) => {
                                                                        const style = TASK_ROW_STYLE[task.type];
                                                                        return (
                                                                            <div 
                                                                                key={`${op.id}-${task.id}`} 
                                                                                className="text-[10px] p-1.5 rounded-md border border-slate-100 flex items-center gap-1.5 truncate cursor-pointer hover:shadow-sm" 
                                                                                style={{ backgroundColor: style.background, borderLeft: style.borderLeft }} 
                                                                                onClick={(e) => { 
                                                                                    e.stopPropagation(); 
                                                                                    if (!previewMode) openEdit(op.id, ds, task); 
                                                                                }}
                                                                            >
                                                                                <span className="font-extrabold truncate w-12 shrink-0">{op.name.split(' ')[0]}</span>
                                                                                <span className="truncate text-slate-600">{task.label}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                {!previewMode && (
                                                                    <div className="absolute top-2 right-2 opacity-0 group-hover/day:opacity-100 transition-opacity">
                                                                        <button 
                                                                            className="p-1 bg-white border border-slate-200 rounded text-slate-400 hover:text-slate-600 shadow-sm" 
                                                                            onClick={(e) => { 
                                                                                e.stopPropagation(); 
                                                                                openAdd(operators[0]?.id, ds); 
                                                                            }} 
                                                                            title="Añadir a la primera operaria"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {/* ── YEAR VIEW ── */}
                                    {viewMode === 'year' && (
                                        <tr>
                                            <td colSpan={operators.length + 1} className="p-6 bg-slate-50">
                                                <div className="grid grid-cols-3 gap-6">
                                                    {Array.from({ length: 12 }).map((_, m) => {
                                                        const monthDate = new Date(anchor.getFullYear(), m, 1);
                                                        const monthName = monthDate.toLocaleDateString('es-CL', { month: 'long' });
                                                        return (
                                                            <div key={m} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setAnchor(monthDate); setViewMode('month'); }}>
                                                                <h3 className="font-bold text-slate-800 capitalize mb-3 text-center text-sm">{monthName}</h3>
                                                                <div className="grid grid-cols-7 gap-1 text-center">
                                                                    {['L','M','X','J','V','S','D'].map(d => <div key={d} className="text-[9px] font-extrabold text-slate-400">{d}</div>)}
                                                                    {/* Simple mini grid */}
                                                                    {Array.from({ length: new Date(anchor.getFullYear(), m + 1, 0).getDate() }).map((_, d) => {
                                                                        const dayDow = new Date(anchor.getFullYear(), m, d + 1).getDay();
                                                                        const gridCol = d === 0 ? (dayDow === 0 ? 7 : dayDow) : 'auto';
                                                                        return <div key={d} className="text-[10px] text-slate-500 py-1 hover:bg-slate-100 rounded" style={d === 0 ? { gridColumnStart: gridCol } : {}}>{d + 1}</div>
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── PANEL DE TRABAJOS Y ENTREGAS EN TIEMPO REAL ───────────────────── */}
                {!loading && (
                    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
                                    📋 Seguimiento de Trabajos y Entregas (Tiempo Real)
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Vista unificada de pruebas programadas de alta costura y estado de confecciones del taller.
                                </p>
                            </div>
                            <span className="text-[10px] bg-slate-100 font-bold uppercase tracking-widest px-3 py-1 rounded-full text-slate-600">
                                {activeBridalMilestones.length + activeProductionOrders.length} trabajos activos
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Columna 1: Pruebas y Entregas de Alta Costura */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 pb-2 border-b border-slate-100">
                                    👗 Agenda de Pruebas y Vestidos (Alta Costura)
                                </h3>
                                {activeBridalMilestones.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic py-4">No hay pruebas o entregas pendientes programadas.</p>
                                ) : (
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                        {activeBridalMilestones.map((m: any) => {
                                            const daysDiff = m.scheduled_date 
                                                ? Math.ceil((new Date(m.scheduled_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                                : null;
                                            const urgencyText = daysDiff !== null 
                                                ? daysDiff < 0 ? 'Atrasado' : daysDiff === 0 ? 'Hoy' : `En ${daysDiff} días`
                                                : '';
                                            const urgencyColor = daysDiff !== null
                                                ? daysDiff < 0 ? 'bg-red-100 text-red-700' : daysDiff <= 7 ? 'bg-amber-100 text-amber-700 font-bold' : 'bg-slate-100 text-slate-600'
                                                : 'bg-slate-100 text-slate-600';

                                            return (
                                                <div key={m.id} className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-start gap-4 transition-all">
                                                    <div>
                                                        <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${m.projectType === 'novia' ? 'bg-rose-50 text-rose-600 border border-rose-100' : m.projectType === 'madrina' ? 'bg-violet-50 text-violet-600 border border-violet-100' : 'bg-sky-50 text-sky-600 border border-sky-100'}`}>
                                                            {m.projectType || 'Novia'}
                                                        </span>
                                                        <h4 className="font-bold text-[14px] text-slate-800 mt-2">
                                                            {m.customer?.full_name || 'Cliente sin nombre'}
                                                        </h4>
                                                        <p className="text-xs text-slate-600 font-medium mt-1">
                                                            {m.title}
                                                        </p>
                                                        {m.eventDate && (
                                                            <p className="text-[10px] text-slate-400 mt-1">
                                                                Matrimonio/Evento: {new Date(m.eventDate).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                                                        <span className="text-[11px] font-mono font-bold text-slate-700">
                                                            {m.scheduled_date ? new Date(m.scheduled_date).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Sin fecha'}
                                                        </span>
                                                        {urgencyText && (
                                                            <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm ${urgencyColor}`}>
                                                                {urgencyText}
                                                            </span>
                                                        )}
                                                        <Link 
                                                            href={`/admin/novias/${m.project_id}`}
                                                            className="text-[10px] uppercase font-bold tracking-wider text-rose-500 hover:text-rose-700 mt-2 block"
                                                        >
                                                            Ver Ficha →
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Columna 2: Órdenes de Confección del Taller */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 pb-2 border-b border-slate-100">
                                    ✂️ Órdenes de Producción Activas (Taller)
                                </h3>
                                {activeProductionOrders.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic py-4">No hay órdenes de confección activas.</p>
                                ) : (
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                        {activeProductionOrders.map((o: any) => {
                                            let statusLabel = '';
                                            let statusColor = '';
                                            if (o.status === 'draft') { statusLabel = 'Ingresado'; statusColor = 'bg-slate-100 text-slate-700'; }
                                            else if (o.status === 'sewing') { statusLabel = 'Confección'; statusColor = 'bg-blue-50 text-blue-700 border border-blue-100'; }
                                            else if (o.status === 'finishing') { statusLabel = 'Prueba / Fitting'; statusColor = 'bg-indigo-50 text-indigo-700 border border-indigo-100'; }
                                            else if (o.status === 'ready') { statusLabel = 'Listo QC'; statusColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100'; }
                                            else { statusLabel = o.status; statusColor = 'bg-gray-100 text-gray-700'; }

                                            return (
                                                <div key={o.id} className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-start gap-4 transition-all">
                                                    <div>
                                                        <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                                                            {statusLabel}
                                                        </span>
                                                        <h4 className="font-bold text-[14px] text-slate-800 mt-2">
                                                            {o.customers?.full_name || 'Sin cliente'}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                                            {o.description}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {o.atelier_operators && (
                                                                <span className="text-[10px] bg-white border border-slate-200/80 px-2 py-0.5 rounded text-slate-600 font-medium">
                                                                    👤 {o.atelier_operators.name}
                                                                </span>
                                                            )}
                                                            {o.estimated_hours > 0 && (
                                                                <span className="text-[10px] bg-white border border-slate-200/80 px-2 py-0.5 rounded text-slate-600 font-medium">
                                                                    ⏱ {o.estimated_hours}h
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                                                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Entrega</span>
                                                        <span className="text-[11px] font-mono font-bold text-slate-700">
                                                            {o.deadline ? new Date(o.deadline).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Sin fecha'}
                                                        </span>
                                                        <Link 
                                                            href={`/admin/production`}
                                                            className="text-[10px] uppercase font-bold tracking-wider text-slate-600 hover:text-slate-900 mt-4 block"
                                                        >
                                                            Ver Tablero →
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── MODAL (Tailwind) ─────────────────────────────────────────────────── */}
            {modal && (
                <div className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="bg-[#0f172a] text-white px-6 py-5 flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-3 m-0">
                                <span className="text-orange-400">📅</span>
                                {modal.task ? 'Editar Tarea' : 'Nueva Tarea / Cita'}
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="p-6 flex flex-col gap-5">
                            
                            {/* Type */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                                    Tipo de Actividad
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {TASK_TYPES.map(t => {
                                        const isActive = mType === t.key;
                                        let activeClasses = '';
                                        if (isActive) {
                                            if (t.key === 'costura') activeClasses = 'bg-[#0f172a] border-[#0f172a] text-white';
                                            else if (t.key === 'cita') activeClasses = 'bg-blue-600 border-blue-600 text-white';
                                            else if (t.key === 'entrega') activeClasses = 'bg-amber-500 border-amber-500 text-white';
                                            else if (t.key === 'bloqueo') activeClasses = 'bg-red-500 border-red-500 text-white';
                                        } else {
                                            activeClasses = 'bg-white border-slate-200 text-slate-600 hover:border-slate-300';
                                        }

                                        return (
                                            <button
                                                key={t.key}
                                                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${activeClasses}`}
                                                onClick={() => setMType(t.key)}
                                            >
                                                <span>{t.emoji}</span> <span className="hidden sm:inline">{t.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Operator and Day Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        👩‍💼 Operaria
                                    </label>
                                    <select
                                        value={mOpId}
                                        onChange={e => setMOpId(e.target.value)}
                                        className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#0f172a] transition-colors appearance-none bg-white cursor-pointer"
                                    >
                                        {operators.map(op => (
                                            <option key={op.id} value={op.id}>{op.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        📅 Día
                                    </label>
                                    <input
                                        type="date"
                                        value={mDay}
                                        onChange={e => setMDay(e.target.value)}
                                        className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#0f172a] transition-colors bg-white cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Duration and Start Hour */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <span className="text-slate-400">⏱</span> Tiempo (Ej: 2h, 45min)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 3h o 45min"
                                        value={mTime}
                                        onChange={e => setMTime(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && mLabel.trim() && saveTask()}
                                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#0f172a] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <span className="text-slate-400">⏰</span> Hora de Inicio
                                    </label>
                                    <select
                                        value={mStartHour}
                                        onChange={e => setMStartHour(Number(e.target.value))}
                                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-[#0f172a] transition-colors appearance-none bg-white cursor-pointer"
                                    >
                                        {hoursArray.map(h => (
                                            <option key={h} value={h}>
                                                {h.toString().padStart(2, '0')}:00
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Label */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Descripción del Trabajo / Cliente
                                </label>
                                <textarea
                                    placeholder="Ej: Blusa Amanda o Margarita: Vestido Negro, Bastas"
                                    value={mLabel}
                                    onChange={e => setMLabel(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && e.ctrlKey && saveTask()}
                                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#0f172a] transition-colors resize-y min-h-[90px]"
                                />
                            </div>

                            {/* Link Order */}
                            {mType === 'costura' && orders.length > 0 && (
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        🔗 Vincular a Orden del Sistema (opcional)
                                    </label>
                                    <select
                                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-[#0f172a] transition-colors appearance-none bg-white cursor-pointer"
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
                        <div className="px-6 pb-6 flex gap-3 mt-auto">
                            {modal.task && (
                                <button
                                    className="flex-1 py-3.5 rounded-xl bg-red-50 text-red-600 border-2 border-red-100 font-bold hover:bg-red-100 transition-colors text-sm"
                                    onClick={() => { deleteTask(modal.opId, modal.day, modal.task!.id); setModal(null); }}
                                >
                                    Eliminar
                                </button>
                            )}
                            <button
                                className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors text-sm"
                                onClick={() => setModal(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="flex-1 py-3.5 rounded-xl bg-[#0f172a] text-white font-bold hover:bg-slate-800 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={saveTask}
                                disabled={!mLabel.trim()}
                            >
                                {modal.task ? 'Guardar' : 'Añadir'}
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
