'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Printer, RefreshCw, Activity, Settings } from 'lucide-react';
import { getOperatorsAction } from '../pos/actions';
import { getProductionOrders } from '../production/actions';
import { getPlannerTasks, savePlannerTask, deletePlannerTask, getProductionOrdersWithDeadlines } from './actions';
import { createClient } from '@supabase/supabase-js';
import ProjectGanttTimeline from './components/ProjectGanttTimeline';

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

function computeTaskLayouts(tasks: Task[]): Record<string, { left: string; width: string }> {
    const layouts: Record<string, { left: string; width: string }> = {};
    
    // Sort tasks by priority (cita > entrega > costura > bloqueo) and then start hour
    const sorted = [...tasks].sort((a, b) => {
        const startA = a.startHour ?? 9;
        const startB = b.startHour ?? 9;
        if (startA !== startB) return startA - startB;
        
        const priority: Record<TaskType, number> = { costura: 1, bloqueo: 2, entrega: 3, cita: 4 };
        const pA = priority[a.type] ?? 5;
        const pB = priority[b.type] ?? 5;
        if (pA !== pB) return pA - pB;
        
        return a.label.localeCompare(b.label);
    });

    const columns: Task[][] = [];
    sorted.forEach((task: Task) => {
        let placed = false;
        const start = task.startHour ?? 9;
        const end = start + (task.durationHours ?? 1);
        
        for (let i = 0; i < columns.length; i++) {
            const hasOverlap = columns[i].some((colTask: Task) => {
                const colStart = colTask.startHour ?? 9;
                const colEnd = colStart + (colTask.durationHours ?? 1);
                return start < colEnd && colStart < end;
            });
            if (!hasOverlap) {
                columns[i].push(task);
                placed = true;
                break;
            }
        }
        if (!placed) {
            columns.push([task]);
        }
    });

    const numCols = columns.length;
    columns.forEach((colTasks: Task[], colIdx: number) => {
        colTasks.forEach((task: Task) => {
            if (numCols === 1) {
                layouts[task.id] = { left: '4px', width: 'calc(100% - 8px)' };
            } else {
                const widthPct = 100 / numCols;
                const leftPct = colIdx * widthPct;
                layouts[task.id] = {
                    left: `calc(${leftPct}% + 2px)`,
                    width: `calc(${widthPct}% - 4px)`
                };
            }
        });
    });

    return layouts;
}

function adjustOverlappingProductionTasks(tasks: Task[]): Task[] {
    const appointments = tasks.filter(t => t.type === 'cita');
    const productionTasks = tasks.filter(t => t.type === 'costura');
    const otherTasks = tasks.filter(t => t.type !== 'cita' && t.type !== 'costura');
    
    // 1. Sort production tasks by their initial start hour
    productionTasks.sort((a, b) => (a.startHour ?? 9) - (b.startHour ?? 9));
    
    // 2. Identify which production tasks overlap with appointments (these MUST be shifted to overtime)
    const overlappingProduction: Task[] = [];
    const nonOverlappingProduction: Task[] = [];
    
    productionTasks.forEach(pt => {
        const ptStart = pt.startHour ?? 9;
        const ptEnd = ptStart + (pt.durationHours ?? 1);
        
        const overlapsWithApp = appointments.some(app => {
            const appStart = app.startHour ?? 9;
            const appEnd = appStart + (app.durationHours ?? 1);
            return ptStart < appEnd && appStart < ptEnd;
        });
        
        if (overlapsWithApp) {
            overlappingProduction.push(pt);
        } else {
            nonOverlappingProduction.push(pt);
        }
    });

    // 3. Stack the non-overlapping production tasks sequentially to resolve any overlaps among themselves
    let currentProdTime = 9;
    const resolvedNonOverlappingProduction: Task[] = [];
    
    nonOverlappingProduction.forEach(pt => {
        let start = pt.startHour ?? 9;
        if (start < currentProdTime) {
            start = currentProdTime;
            pt.startHour = start;
            pt.sortValue = start * 60;
            
            const duration = pt.durationHours ?? 1;
            const formatTime = (h: number) => {
                const hours = Math.floor(h);
                const mins = Math.round((h - hours) * 60);
                return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
            };
            const newEnd = start + duration;
            pt.time = `${formatTime(start)} - ${formatTime(newEnd)} (${duration}h)`;
        }
        resolvedNonOverlappingProduction.push(pt);
        currentProdTime = start + (pt.durationHours ?? 1);
    });

    // 4. Now calculate overtimeStart.
    // It should start at 18:00 OR after the end of ALL resolved non-overlapping tasks, appointments, and other tasks.
    let overtimeStart = 18;
    
    [...appointments, ...otherTasks, ...resolvedNonOverlappingProduction].forEach(t => {
        const start = t.startHour ?? 9;
        const end = start + (t.durationHours ?? 1);
        if (end > overtimeStart) {
            overtimeStart = end;
        }
    });
    
    // 5. Shift the overlapping production tasks to start at overtimeStart and stack them sequentially
    const shiftedProduction = overlappingProduction.map(pt => {
        const duration = pt.durationHours ?? 1;
        const newStart = overtimeStart;
        overtimeStart += duration; // Stack sequentially in overtime
        
        const formatTime = (h: number) => {
            const hours = Math.floor(h);
            const mins = Math.round((h - hours) * 60);
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        };
        const newEnd = newStart + duration;
        
        return {
            ...pt,
            startHour: newStart,
            time: `${formatTime(newStart)} - ${formatTime(newEnd)} (${duration}h)`,
            sortValue: newStart * 60
        };
    });
    
    return [...appointments, ...otherTasks, ...resolvedNonOverlappingProduction, ...shiftedProduction];
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
function groupProductionOrdersForDeliveries(orders: any[]) {
    const grouped: Record<string, {
        pos_order_id: string | null;
        deadline: string;
        customer_name: string;
        customer_phone: string;
        customer_email: string;
        descriptions: string[];
        ids: string[];
    }> = {};

    orders.forEach(order => {
        const key = order.pos_order_id || `single-${order.id}`;
        const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
        const name = customer?.full_name || 'Cliente';
        const phone = customer?.phone || '';
        const email = customer?.email || '';
        
        if (!grouped[key]) {
            grouped[key] = {
                pos_order_id: order.pos_order_id,
                deadline: order.deadline,
                customer_name: name,
                customer_phone: phone,
                customer_email: email,
                descriptions: [],
                ids: []
            };
        }
        if (order.description) {
            grouped[key].descriptions.push(order.description);
        }
        grouped[key].ids.push(order.id);
    });

    return Object.values(grouped);
}

export default function PlanificadorPage() {
    const [operators, setOperators]   = useState<Operator[]>([]);
    const [orders, setOrders]         = useState<any[]>([]);
    const [planner, setPlanner]       = useState<PlannerData>({});
    const [loading, setLoading]       = useState(true);
    const [activeBridalMilestones, setActiveBridalMilestones] = useState<any[]>([]);
    const [activeBridalProjects, setActiveBridalProjects] = useState<any[]>([]);
    const [activeProductionOrders, setActiveProductionOrders] = useState<any[]>([]);
    const [previewMode, setPreviewMode] = useState(true);
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
    const [mOrderId, setMOrderId] = useState('');

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<'pending' | 'all'>('pending');

    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    const sortedAndFilteredOrders = useMemo(() => {
        let list = orders.map(o => {
            const remaining = Math.max(0, (o.estimated_hours || 0) - (o.scheduled_hours || 0));
            return { ...o, remaining };
        });

        // Sort by entry order to the system (created_at) - newest first
        list.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
        });

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            list = list.filter(o => 
                (o.customers?.full_name || '').toLowerCase().includes(query) ||
                (o.description || '').toLowerCase().includes(query)
            );
        }

        // Filter by mode
        if (filterMode === 'pending') {
            list = list.filter(o => o.remaining > 0);
        }

        return list;
    }, [orders, searchQuery, filterMode]);


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
        
        const [agendaRes, customTasks, pOrders] = await Promise.all([
            supabase.from('agendamientos').select('*')
                .gte('fecha_hora', `${startStr}T00:00:00`)
                .lte('fecha_hora', `${endStr}T23:59:59`)
                .neq('estado', 'cancelado'),
            getPlannerTasks(startStr, endStr),
            getProductionOrdersWithDeadlines(startStr, endStr)
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
            // Note: We no longer auto-inject production orders into the planner.
            // The planner is now the source of truth, and hours are distributed manually via planner_tasks.

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

            // Inject bridal milestones → first operator as 'cita' tasks
            (mappedMilestones || []).forEach((m: any) => {
                if (!m.scheduled_date) return;
                const mDate = new Date(m.scheduled_date);
                const ds     = dateStr(mDate);
                if (!firstOpId || !p[firstOpId]?.[ds] || p[firstOpId][ds].blocked) return;
                
                const startTimeStr = mDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                const sortValue = mDate.getHours() * 60 + mDate.getMinutes();
                const startHour = mDate.getHours();
                const custName = m.customer ? (Array.isArray(m.customer) ? m.customer[0]?.full_name : m.customer.full_name) : 'Clienta';

                p[firstOpId][ds].tasks.push({
                    id: `milestone-${m.id}`,
                    time: `${startTimeStr} (1h)`,
                    label: `Prueba Alta Costura: ${custName} - ${m.title}`,
                    type: 'cita',
                    sortValue,
                    startHour,
                    durationHours: 1
                });
            });

            // Inject production order deadlines → first operator as 'entrega' tasks
            const firstOpIdForDeliveries = activeOps[0]?.id;
            const groupedDeliveries = groupProductionOrdersForDeliveries(pOrders || []);

            groupedDeliveries.forEach((group: any) => {
                const deadlineDate = new Date(group.deadline);
                const ds = dateStr(deadlineDate);
                if (!firstOpIdForDeliveries || !p[firstOpIdForDeliveries]?.[ds] || p[firstOpIdForDeliveries][ds].blocked) return;
                
                const startTimeStr = deadlineDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                const sortValue = deadlineDate.getHours() * 60 + deadlineDate.getMinutes();
                const startHour = deadlineDate.getHours();
                
                p[firstOpIdForDeliveries][ds].tasks.push({
                    id: `delivery-${group.ids[0]}`,
                    time: `${startTimeStr} (Entrega)`,
                    label: `Entrega: ${group.customer_name} - ${group.descriptions.join(', ') || 'Prenda'} (${group.pos_order_id || 'S/N'})`,
                    type: 'entrega',
                    sortValue,
                    startHour,
                    durationHours: 1
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

            // Adjust overlapping production tasks to overtime and then sort chronologically
            Object.values(p).forEach(opDays =>
                Object.values(opDays).forEach(cell => {
                    cell.tasks = adjustOverlappingProductionTasks(cell.tasks);
                    cell.tasks.sort((a,b) => {
                        const valA = a.sortValue ?? 9999;
                        const valB = b.sortValue ?? 9999;
                        if (valA !== valB) return valA - valB;
                        
                        const priority: Record<TaskType, number> = { costura: 1, bloqueo: 2, entrega: 3, cita: 4 };
                        const pA = priority[a.type] ?? 5;
                        const pB = priority[b.type] ?? 5;
                        if (pA !== pB) return pA - pB;
                        
                        return a.label.localeCompare(b.label);
                    });
                })
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
        setMOpId(opId); setMDay(day); setMOrderId('');
        setDropdownOpen(false); setSearchQuery(''); setFilterMode('pending');
        setModal({ opId, day });
    }
    function openEdit(opId: string, day: string, task: Task) {
        setMType(task.type); setMTime(task.time); setMLabel(task.label);
        setMStartHour(task.startHour || hoursArray[0] || 10);
        setMOpId(opId); setMDay(day); setMOrderId(task.orderId || '');
        setDropdownOpen(false); setSearchQuery(''); setFilterMode('all');
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
            orderId: mOrderId || undefined,
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
        if (!taskId.toString().startsWith('order-') && !taskId.toString().startsWith('ag-')) {
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
        <div className="h-[calc(100vh-64px)] lg:h-screen bg-slate-50 text-slate-800 font-sans flex flex-col overflow-hidden">

            {/* ── NAV ───────────────────────────────────────────────────────── */}
            <nav className="relative w-full bg-white border-b border-slate-200 shadow-sm px-4 py-2.5 md:px-6 md:py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 md:gap-4 shrink-0">
                <div className="hidden md:flex items-center justify-between md:justify-start gap-4">
                    <div className="flex items-center gap-2.5">
                        <Link href="/admin" className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5 text-xs md:text-sm font-semibold">
                            <ArrowLeft className="w-4 h-4" /> Volver
                        </Link>
                        <div className="h-5 w-px bg-slate-200"></div>
                        <h1 className="m-0 text-base md:text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                            Planificación Semanal <span className="hidden sm:inline text-slate-400 font-medium">| Taller</span>
                        </h1>
                    </div>
                </div>

                <div className="hidden md:flex items-center justify-between sm:justify-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <button onClick={prevRange} className="p-1 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm transition-all"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-xs md:text-sm font-bold px-2 capitalize text-slate-700 min-w-[120px] md:min-w-[140px] text-center">{rangeLabel}</span>
                    <button onClick={nextRange} className="p-1 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm transition-all"><ChevronRight className="w-4 h-4" /></button>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg justify-between sm:justify-start">
                    {['day', 'week', 'month', 'year'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode as any)}
                            className={`flex-1 sm:flex-none px-3 py-1.5 md:px-4 md:py-1.5 text-[10px] md:text-xs font-bold rounded-md capitalize transition-all ${viewMode === mode ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : mode === 'month' ? 'Mes' : 'Año'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 shrink-0 w-full md:w-auto justify-between md:justify-start">
                    {/* Mobile Calendar (hidden on desktop) */}
                    <div className="flex md:hidden items-center gap-1 bg-slate-100 p-0.5 rounded-lg shrink-0">
                        <button onClick={prevRange} className="p-1 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 transition-all"><ChevronLeft className="w-3.5 h-3.5" /></button>
                        <span className="text-[10px] font-bold px-1 capitalize text-slate-750 max-w-[95px] overflow-hidden text-ellipsis whitespace-nowrap text-center">{rangeLabel}</span>
                        <button onClick={nextRange} className="p-1 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 transition-all"><ChevronRight className="w-3.5 h-3.5" /></button>
                    </div>

                    <div className="flex gap-1.5 items-center">
                        <button 
                            className={`px-2.5 py-1.5 md:px-4 md:py-2 border rounded-lg text-[10px] md:text-sm font-bold transition-all flex items-center gap-1 shadow-sm whitespace-nowrap ${previewMode ? 'bg-[#0f172a] text-white border-[#0f172a] hover:bg-slate-800' : 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'}`}
                            onClick={() => setPreviewMode(!previewMode)}
                        >
                            {previewMode ? <><span className="hidden md:inline">✓ Vista Previa</span><span className="md:hidden">✓ Vista</span></> : '✎ Editar'}
                        </button>
                        <Link 
                            href="/admin/planificador/seguimiento"
                            className="px-2.5 py-1.5 md:px-4 md:py-2 bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100 rounded-lg text-[10px] md:text-sm font-bold transition-all flex items-center gap-1 shadow-sm whitespace-nowrap"
                        >
                            <Activity className="w-3.5 h-3.5" /> <span className="text-[10px] md:text-sm"><span className="hidden md:inline">Seguimiento </span>Gantt</span>
                        </Link>
                        <Link 
                            href="/admin/production"
                            className="px-2.5 py-1.5 md:px-4 md:py-2 bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100 rounded-lg text-[10px] md:text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                            title="Gobernanza del Taller"
                        >
                            <Settings className="w-3.5 h-3.5" /> <span className="hidden md:inline">Gobernanza del Taller</span>
                        </Link>
                        <button className="hidden md:flex px-2.5 py-1.5 md:px-4 md:py-2 bg-white border border-slate-200 rounded-lg text-[10px] md:text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all items-center gap-1.5 shadow-sm whitespace-nowrap" onClick={load} title="Recargar">
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
                            <span>Resetear</span>
                        </button>
                        <button className="hidden md:flex px-2.5 py-1.5 md:px-4 md:py-2 bg-[#0f172a] border border-[#0f172a] rounded-lg text-[10px] md:text-sm font-bold text-white hover:bg-slate-800 transition-all items-center gap-1.5 shadow-sm whitespace-nowrap" onClick={() => window.print()}>
                            <Printer className="w-3.5 h-3.5" /> <span>Imprimir</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── PRINT HEADER ─────────────────────────────────────────────── */}
            <div className="hidden print:block text-center mb-6 pt-4">
                <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">Planificación de Taller</h1>
                <p className="text-sm text-slate-500 capitalize">{rangeLabel}</p>
            </div>

            {/* ── TABLE ─────────────────────────────────────────────────────── */}
            <div className="flex-grow overflow-auto w-full print:overflow-visible px-0 pt-0 pb-4">
                {loading ? (
                    <div className="text-center py-24 text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">
                        Cargando planificación...
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="w-10 md:w-12 p-1.5 md:p-2.5 text-center border-r border-slate-200 font-extrabold text-slate-400 uppercase text-[9px] md:text-[10px] tracking-widest">
                                            Hora
                                        </th>
                                        {operators.map(op => (
                                            <th key={op.id} className="p-2 md:p-4 border-r border-slate-200 last:border-0 min-w-[220px] md:min-w-[280px]">
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-slate-800 text-xs md:text-sm">{op.name}</span>
                                                    <span className="text-[9px] md:text-[11px] font-bold text-slate-400 md:mt-0.5 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                        {op.daily_hours_capacity || 8}h disponibles / día
                                                    </span>
                                                </div>
                                            </th>
                                        ))}
                                        {operators.length === 0 && (
                                            <th className="p-2 md:p-4 text-slate-400 italic font-medium text-xs md:text-sm">
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
                                        
                                        // Calculate dynamic max end hour for the day
                                        let dayMaxEndHour = workshopEnd ? Number(workshopEnd.split(':')[0]) : 18;
                                        operators.forEach(op => {
                                            const cell = planner[op.id]?.[ds];
                                            if (cell && cell.tasks) {
                                                cell.tasks.forEach(t => {
                                                    const taskEnd = (t.startHour || 9) + (t.durationHours || 1);
                                                    if (taskEnd > dayMaxEndHour) dayMaxEndHour = taskEnd;
                                                });
                                            }
                                        });
                                        const startH = workshopStart ? Number(workshopStart.split(':')[0]) : 9;
                                        const dayHoursArray: number[] = [];
                                        for (let h = startH; h < dayMaxEndHour; h++) {
                                            dayHoursArray.push(h);
                                        }

                                        return (
                                            <React.Fragment key={ds}>
                                                {/* Day Header Row */}
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <td colSpan={operators.length + 1} className="py-1.5 px-2 md:p-3 border-r border-slate-100">
                                                        <div className="flex items-center gap-2 md:gap-4 pl-1 md:pl-2">
                                                            <div className="flex items-baseline gap-1.5 md:gap-2">
                                                                <span className={`text-xs md:text-sm font-extrabold uppercase tracking-widest ${isToday ? 'text-amber-600' : 'text-slate-700'}`}>
                                                                    {DAY_NAMES[dow]}
                                                                </span>
                                                                <span className={`text-sm md:text-lg font-light ${isToday ? 'text-amber-600' : 'text-slate-600'}`}>
                                                                    {day.getDate()} {day.toLocaleDateString('es-CL',{month:'short'})}
                                                                </span>
                                                            </div>
                                                            {isToday && (
                                                                <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-amber-500 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                                                                    Hoy
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                                
                                                <tr className="border-b border-slate-100 last:border-0 group">
                                                    
                                                    {/* TIMELINE CELL */}
                                                <td className="w-12 align-top border-r border-slate-100 bg-slate-50/30">
                                                    <div className="relative w-full" style={{ height: `${dayHoursArray.length * 40}px` }}>
                                                        {dayHoursArray.map((hour, i) => {
                                                            const isOvertime = hour > 18;
                                                            return (
                                                                <div 
                                                                    key={hour} 
                                                                    className={`absolute w-full h-[40px] flex items-center justify-center text-[10px] font-bold ${isOvertime ? 'bg-rose-50/50 text-rose-400 border-b border-rose-100/50' : 'text-slate-400'}`}
                                                                    style={{ top: `${i * 40}px` }}
                                                                >
                                                                    {hour.toString().padStart(2, '0')}:00
                                                                </div>
                                                            );
                                                        })}
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
                                                            
                                                            <div className="relative w-full" style={{ height: `${dayHoursArray.length * 40}px` }}>
                                                                {/* Grid Lines */}
                                                                {dayHoursArray.map((hour, i) => {
                                                                    const isOvertime = hour > 18;
                                                                    return (
                                                                        <div 
                                                                            key={hour} 
                                                                            className={`absolute w-full border-t border-slate-100/70 ${isOvertime ? 'bg-rose-50/30' : ''}`}
                                                                            style={{ top: `${i * 40}px`, height: '40px', left: 0, right: 0 }}
                                                                        />
                                                                    );
                                                                })}
                                                                
                                                                {/* Tasks */}
                                                                {(() => {
                                                                    const layouts = computeTaskLayouts(cell.tasks);
                                                                    return cell.tasks.map((task, taskIdx) => {
                                                                        const layout = layouts[task.id] || { left: '4px', width: 'calc(100% - 8px)' };
                                                                    const startIdx = (task.startHour || 9) - (dayHoursArray[0] || 9);
                                                                    const top = Math.max(0, startIdx * 40);
                                                                    const height = (task.durationHours || 1) * 40;
                                                                    const style = TASK_ROW_STYLE[task.type];
                                                                    const isShort = (task.durationHours || 1) <= 1;
                                                                    const isLong = (task.durationHours || 1) >= 4;
                                                                    return (
                                                                        <div
                                                                            key={task.id}
                                                                            className={`absolute rounded-lg border shadow-sm flex overflow-hidden bg-opacity-90 ${!previewMode ? 'cursor-pointer hover:shadow-md hover:z-20 transition-all group/task' : ''} ${isShort ? 'flex-row items-center px-2 py-1 gap-1.5' : 'flex-col p-2.5'}`}
                                                                            style={{ 
                                                                                top: `${top + 1}px`,
                                                                                height: `${height - 2}px`,
                                                                                backgroundColor: style.background, 
                                                                                borderLeft: style.borderLeft,
                                                                                borderColor: style.borderLeft,
                                                                                left: layout.left,
                                                                                    width: layout.width,
                                                                                    zIndex: 10 + taskIdx
                                                                            }}
                                                                            onClick={() => !previewMode && openEdit(op.id, ds, task)}
                                                                        >
                                                                            <div className={`font-bold leading-tight text-slate-800 ${isShort ? 'text-[10.5px] truncate max-w-[50%]' : isLong ? 'text-sm mb-1' : 'text-xs mb-0.5'}`}>
                                                                                {task.label}
                                                                            </div>
                                                                            <div className={`font-semibold text-slate-500/90 flex flex-wrap gap-x-1 ${isShort ? 'text-[9px] truncate flex-1' : 'text-[10px]'}`}>
                                                                                {(() => {
                                                                                    const sH = task.startHour || 9;
                                                                                    const eH = sH + (task.durationHours || 1);
                                                                                    let text = `⏱ ${sH.toString().padStart(2, '0')}:00 - ${eH.toString().padStart(2, '0')}:00`;
                                                                                    if (!isShort) {
                                                                                        text += ` (${task.durationHours || 1}h`;
                                                                                        if (task.orderId) {
                                                                                            const o = orders.find(ord => ord.id === task.orderId);
                                                                                            if (o && o.estimated_hours) {
                                                                                                text += ` / ${o.estimated_hours}h est.`;
                                                                                            }
                                                                                        }
                                                                                        text += ')';
                                                                                    }
                                                                                    return text;
                                                                                })()}
                                                                            </div>
                                                                            {isLong && (
                                                                                <div className="mt-auto pt-2 border-t border-slate-200/50 text-[10px] text-slate-400 font-medium opacity-60">
                                                                                    Bloque extendido de {task.durationHours} horas
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
                                                                })})()}
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
                    <div className="mt-8">
                        <ProjectGanttTimeline />
                    </div>
                )}
            </div>

            {/* ── MODAL (Tailwind) ─────────────────────────────────────────────────── */}
            {modal && (
                <div className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[680px] overflow-visible flex flex-col font-sans animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="bg-[#0f172a] text-white px-6 py-5 flex items-center justify-between rounded-t-2xl">
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
                                <div className="relative" ref={dropdownRef}>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        🔗 Vincular a Orden del Sistema (opcional)
                                    </label>
                                    
                                    {/* Trigger Button */}
                                    <button
                                        type="button"
                                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-left text-slate-700 bg-white hover:border-[#0f172a] focus:outline-none transition-colors flex items-center justify-between"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                    >
                                        <span className="truncate">
                                            {(() => {
                                                if (!mOrderId) return '— Sin vincular (entrada manual) —';
                                                const o = orders.find(ord => ord.id === mOrderId);
                                                if (!o) return '— Sin vincular (entrada manual) —';
                                                const cust = o.customers?.full_name || 'Sin Cliente';
                                                const remaining = Math.max(0, (o.estimated_hours || 0) - (o.scheduled_hours || 0));
                                                return `${cust} — ${o.description} (${remaining}h por agendar)`;
                                            })()}
                                        </span>
                                        <span className="text-slate-400 text-xs ml-2">▼</span>
                                    </button>

                                    {/* Custom Dropdown Content */}
                                    {dropdownOpen && (
                                        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[1002] flex flex-col overflow-hidden max-h-[500px] animate-in fade-in duration-100">
                                            {/* Search Bar & Tabs Header */}
                                            <div className="p-3 border-b border-slate-100 bg-slate-50 flex flex-col gap-2 shrink-0">
                                                <input
                                                    type="text"
                                                    placeholder="🔍 Buscar por cliente o prenda..."
                                                    value={searchQuery}
                                                    onChange={e => setSearchQuery(e.target.value)}
                                                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#0f172a]"
                                                />
                                                <div className="flex gap-1.5">
                                                    <button
                                                        type="button"
                                                        className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-all ${filterMode === 'pending' ? 'bg-[#0f172a] border-[#0f172a] text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-750'}`}
                                                        onClick={() => setFilterMode('pending')}
                                                    >
                                                        ⚠️ Por Planificar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-all ${filterMode === 'all' ? 'bg-[#0f172a] border-[#0f172a] text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-750'}`}
                                                        onClick={() => setFilterMode('all')}
                                                    >
                                                        ✓ Ver Todos
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Scrollable list grid */}
                                            <div className="overflow-y-auto flex-1 py-1">
                                                {/* Reset option */}
                                                <div
                                                    className="px-4 py-2 text-xs text-slate-500 font-bold hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                                                    onClick={() => {
                                                        setMOrderId('');
                                                        setDropdownOpen(false);
                                                    }}
                                                >
                                                    — Sin vincular (entrada manual) —
                                                </div>

                                                {sortedAndFilteredOrders.map(o => {
                                                    const cust = o.customers?.full_name || 'Sin Cliente';
                                                    const desc = o.description || 'Prenda';
                                                    const est = o.estimated_hours || 0;
                                                    const rem = o.remaining;
                                                    const sched = Math.max(0, est - rem);
                                                    const progress = est > 0 ? (sched / est) * 100 : 0;
                                                    const isSelected = mOrderId === o.id;

                                                    // Color coding based on status
                                                    const progressColorClass = rem === 0 
                                                        ? 'bg-emerald-500' 
                                                        : rem === est 
                                                            ? 'bg-slate-300' 
                                                            : 'bg-amber-500';

                                                    return (
                                                        <div
                                                            key={o.id}
                                                            className={`px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors flex flex-col sm:grid sm:grid-cols-12 sm:gap-3 sm:items-center ${isSelected ? 'bg-slate-50 font-semibold' : ''}`}
                                                            onClick={() => {
                                                                setMOrderId(o.id);
                                                                const customer = o.customers?.full_name ? `${o.customers.full_name} - ` : '';
                                                                setMLabel(`${customer}${o.description || ''}`);
                                                                if (rem > 0) {
                                                                    setMTime(`${Math.min(rem, 8)}h`);
                                                                }
                                                                setDropdownOpen(false);
                                                            }}
                                                        >
                                                            {/* Desktop Columns Grid */}
                                                            <div className="sm:col-span-4 font-bold text-slate-800 text-[11px] sm:text-xs truncate" title={cust}>
                                                                {cust}
                                                            </div>
                                                            <div className="sm:col-span-4 text-slate-500 text-[10px] sm:text-[11px] truncate" title={desc}>
                                                                {desc}
                                                            </div>
                                                            <div className="sm:col-span-2 text-right text-slate-500 text-[10.5px] sm:text-xs font-mono whitespace-nowrap mt-0.5 sm:mt-0">
                                                                {rem}h de {est}h
                                                            </div>
                                                            <div className="sm:col-span-2 flex items-center justify-end gap-1.5 mt-1 sm:mt-0">
                                                                <div className="h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden shrink-0 hidden sm:block">
                                                                    <div 
                                                                        className={`h-full rounded-full ${progressColorClass}`}
                                                                        style={{ width: `${progress}%` }}
                                                                    />
                                                                </div>
                                                                <span className={`text-[8.5px] font-bold px-1 py-0.5 rounded leading-none shrink-0 text-white ${progressColorClass}`}>
                                                                    {Math.round(progress)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {sortedAndFilteredOrders.length === 0 && (
                                                    <div className="p-4 text-center text-xs text-slate-400 italic">
                                                        No se encontraron órdenes
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
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
