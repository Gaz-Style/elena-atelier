'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, Clock, CheckCircle2, AlertCircle, Settings, X, 
    User, Calendar, RefreshCw, Sparkles, Save, Check, Flame, ChevronRight, Activity, Scissors, Plus, UserCheck, BarChart2, Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { updateOrderStatus, getProductionOrders, assignOperatorToOrder, updateEstimatedHours } from '../production/actions';
import { updateAtelierConfigAction, getEstimatedDatesAction, getOperatorsAction, updateOperatorAction } from '../pos/actions';

// Días de la semana para mapear números [1..0] a strings
const DAYS_OF_WEEK = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' }
];

export default function LiveProductionBoard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [operators, setOperators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [configTab, setConfigTab] = useState<'general' | 'operators'>('general');
    
    // Configuración local del Atelier
    const [config, setConfig] = useState({
        laborCapacity: 7,
        activeOperators: 3,
        bufferDays: 2,
        windowStart: '15:00:00',
        windowEnd: '18:00:00',
        allowedDays: [2, 4], // Martes, Jueves
        workingDays: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
        workshopHourStart: '09:00:00',
        workshopHourEnd: '18:00:00'
    });

    // Formulario de edición/creación de costureras
    const [editingOperator, setEditingOperator] = useState<any | null>(null); // null significa formulario cerrado, {} significa crear nuevo
    const [operatorForm, setOperatorForm] = useState({
        id: '',
        name: '',
        dailyCapacity: 7,
        workingDays: [1, 2, 3, 4, 5, 6],
        status: 'active'
    });
    
    const [savingConfig, setSavingConfig] = useState(false);
    const [savingOperator, setSavingOperator] = useState(false);
    const [configMessage, setConfigMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');

    // Cargar órdenes, costureras y configuración inicial
    useEffect(() => {
        fetchBoardData();
        
        // Suscripción en vivo Supabase Realtime a cambios en la tabla de órdenes de producción
        const ordersChannel = supabase
            .channel('live_board_orders_channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'production_orders' },
                () => {
                    fetchOrdersOnly();
                }
            )
            .subscribe();

        // Suscripción Realtime a cambios en la configuración global de gobernanza
        const configChannel = supabase
            .channel('live_board_config_channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'atelier_config' },
                () => {
                    fetchConfigOnly();
                }
            )
            .subscribe();

        // Suscripción Realtime a cambios en la tabla de costureras
        const operatorsChannel = supabase
            .channel('live_board_operators_channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'atelier_operators' },
                () => {
                    fetchOperatorsOnly();
                    fetchOrdersOnly();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(configChannel);
            supabase.removeChannel(operatorsChannel);
        };
    }, []);

    async function fetchBoardData() {
        setLoading(true);
        await Promise.all([fetchConfigOnly(), fetchOrdersOnly(), fetchOperatorsOnly()]);
        setLoading(false);
    }

    async function fetchOrdersOnly() {
        const ordersData = await getProductionOrders();
        setOrders(ordersData || []);
    }

    async function fetchOperatorsOnly() {
        const ops = await getOperatorsAction();
        setOperators(ops || []);
    }

    async function fetchConfigOnly() {
        const { data, error } = await supabase
            .from('atelier_config')
            .select('*')
            .limit(1);

        if (!error && data && data.length > 0) {
            const c = data[0];
            setConfig({
                laborCapacity: Number(c.labor_capacity_per_operator_daily ?? 7),
                activeOperators: Number(c.total_active_operators ?? 3),
                bufferDays: Number(c.logistic_buffer_days ?? 2),
                windowStart: c.delivery_window_start ?? '15:00:00',
                windowEnd: c.delivery_window_end ?? '18:00:00',
                allowedDays: c.delivery_allowed_days ?? [2, 4],
                workingDays: c.workshop_working_days ?? [1, 2, 3, 4, 5, 6],
                workshopHourStart: c.workshop_working_hour_start ?? '09:00:00',
                workshopHourEnd: c.workshop_working_hour_end ?? '18:00:00'
            });
        }
    }

    async function handleCompleteDelivery(id: string) {
        const order = orders.find(o => o.id === id);
        if (order && !order.assigned_operator_id) {
            alert("No se puede completar la entrega de una orden sin costurera asignada.");
            return;
        }
        const res = await updateOrderStatus(id, 'delivered');
        if (res.success) {
            fetchOrdersOnly();
        } else {
            alert(res.error || "Ocurrió un error al completar la entrega.");
        }
    }

    async function handleAssignOperator(id: string, operatorId: string) {
        const res = await assignOperatorToOrder(id, operatorId === 'unassigned' ? null : operatorId);
        if (res.success) {
            fetchOrdersOnly();
        } else {
            alert(res.error || "Ocurrió un error al asignar costurera.");
        }
    }

    async function handleUpdateHours(id: string, hours: number) {
        if (hours < 0.5 || hours > 200) return;
        const res = await updateEstimatedHours(id, hours);
        if (res.success) {
            fetchOrdersOnly();
        }
    }

    async function handleAdvanceStatus(id: string, currentStatus: string) {
        const order = orders.find(o => o.id === id);
        if (order && !order.assigned_operator_id) {
            alert("No se puede avanzar el estado de una orden sin costurera asignada.");
            return;
        }
        let nextStatus = 'delivered';
        if (currentStatus === 'draft' || currentStatus === 'cutting' || currentStatus === 'sewing') nextStatus = 'finishing';
        else if (currentStatus === 'finishing') nextStatus = 'ready';

        const res = await updateOrderStatus(id, nextStatus);
        if (res.success) {
            fetchOrdersOnly();
        } else {
            alert(res.error || "Ocurrió un error al avanzar el estado.");
        }
    }

    async function handleSaveConfig(e: React.FormEvent) {
        e.preventDefault();
        setSavingConfig(true);
        setConfigMessage(null);

        const res = await updateAtelierConfigAction({
            laborCapacity: config.laborCapacity,
            activeOperators: config.activeOperators,
            bufferDays: config.bufferDays,
            windowStart: config.windowStart,
            windowEnd: config.windowEnd,
            allowedDays: config.allowedDays,
            workingDays: config.workingDays,
            workshopHourStart: config.workshopHourStart,
            workshopHourEnd: config.workshopHourEnd
        });

        setSavingConfig(false);
        if (res.success) {
            setConfigMessage({ type: 'success', text: 'Gobernanza guardada con éxito en base de datos' });
            setTimeout(() => setConfigMessage(null), 4000);
            fetchConfigOnly();
        } else {
            setConfigMessage({ type: 'error', text: 'Error al actualizar: ' + res.error });
        }
    }

    // Guardar o Crear Costurera
    async function handleSaveOperator(e: React.FormEvent) {
        e.preventDefault();
        setSavingOperator(true);
        setConfigMessage(null);

        const res = await updateOperatorAction({
            id: operatorForm.id || undefined,
            name: operatorForm.name,
            dailyCapacity: operatorForm.dailyCapacity,
            workingDays: operatorForm.workingDays,
            status: operatorForm.status
        });

        setSavingOperator(false);
        if (res.success) {
            setConfigMessage({ type: 'success', text: `Costurera '${operatorForm.name}' guardada correctamente` });
            setTimeout(() => setConfigMessage(null), 4000);
            setEditingOperator(null);
            fetchOperatorsOnly();
            fetchOrdersOnly(); // Recalculate workloads
        } else {
            setConfigMessage({ type: 'error', text: 'Error al guardar costurera: ' + res.error });
        }
    }

    // Toggle de días en los arreglos de configuración
    const toggleWorkingDay = (day: number) => {
        const isSelected = config.workingDays.includes(day);
        const newDays = isSelected
            ? config.workingDays.filter(d => d !== day)
            : [...config.workingDays, day].sort();
        setConfig({ ...config, workingDays: newDays });
    };

    const toggleAllowedDay = (day: number) => {
        const isSelected = config.allowedDays.includes(day);
        const newDays = isSelected
            ? config.allowedDays.filter(d => d !== day)
            : [...config.allowedDays, day].sort();
        setConfig({ ...config, allowedDays: newDays });
    };

    // Toggle de días para el formulario de costureras
    const toggleOperatorFormDay = (day: number) => {
        const isSelected = operatorForm.workingDays.includes(day);
        const newDays = isSelected
            ? operatorForm.workingDays.filter(d => d !== day)
            : [...operatorForm.workingDays, day].sort();
        setOperatorForm({ ...operatorForm, workingDays: newDays });
    };

    const openEditOperator = (op: any) => {
        setOperatorForm({
            id: op.id,
            name: op.name,
            dailyCapacity: op.daily_hours_capacity,
            workingDays: op.working_days || [1,2,3,4,5,6],
            status: op.status
        });
        setEditingOperator(op);
    };

    const openNewOperator = () => {
        setOperatorForm({
            id: '',
            name: '',
            dailyCapacity: 7,
            workingDays: [1, 2, 3, 4, 5, 6],
            status: 'active'
        });
        setEditingOperator({});
    };

    // --- CÁLCULOS DE CARGA DE TRABAJO INDIVIDUAL (OPERATORS) ---
    const activeStatuses = ['draft', 'cutting', 'sewing', 'finishing'];

    const getOperatorBacklog = (opId: string) => {
        const todayStr = new Date().toDateString();
        return orders
            .filter(o => {
                if (o.assigned_operator_id !== opId) return false;
                if (!activeStatuses.includes(o.status)) return false;
                const targetDateStr = o.production_start_date || o.deadline;
                if (!targetDateStr) return true; // Si no tiene fecha asignada, la asumimos como carga actual/hoy
                return new Date(targetDateStr).toDateString() === todayStr;
            })
            .reduce((sum, o) => sum + Number(o.estimated_hours || 0), 0);
    };

    // --- CLASIFICACIÓN DE COLUMNAS DE PRODUCCIÓN EN TIEMPO REAL ---
    const now = new Date();

    // Helper: Determinar si una orden cae dentro del filtro de tiempo seleccionado
    const isWithinTimeFilter = (order: any) => {
        if (timeFilter === 'all') return true;
        const targetDate = order.production_start_date || order.deadline;
        if (!targetDate) return true; // Sin fecha = mostrar siempre (urgente)
        const d = new Date(targetDate);
        
        if (timeFilter === 'week') {
            const endOfWeek = new Date(now);
            endOfWeek.setDate(now.getDate() + (7 - now.getDay())); // Domingo de esta semana
            endOfWeek.setHours(23, 59, 59, 999);
            return d <= endOfWeek;
        }
        if (timeFilter === 'month') {
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            return d <= endOfMonth;
        }
        return true;
    };

    // Contador de órdenes futuras ocultas
    const allActiveCount = orders.filter(o => 
        o.status === 'draft' || o.status === 'cutting' || o.status === 'sewing'
    ).length;

    // 1. Confección Activa: Órdenes en borrador, corte o costura
    const activeProduction = orders.filter(o => 
        (o.status === 'draft' || o.status === 'cutting' || o.status === 'sewing') && isWithinTimeFilter(o)
    ).sort((a, b) => {
        const dateA = new Date(a.production_end_date || a.deadline || '2099-01-01').getTime();
        const dateB = new Date(b.production_end_date || b.deadline || '2099-01-01').getTime();
        return dateA - dateB;
    });

    const hiddenCount = allActiveCount - activeProduction.length;

    // 2. Control de Calidad / Pruebas: Órdenes en Fitting/QC (finishing)
    const qcAndFitting = orders.filter(o => o.status === 'finishing' && isWithinTimeFilter(o)).sort((a, b) => {
        const dateA = new Date(a.production_end_date || a.deadline || '2099-01-01').getTime();
        const dateB = new Date(b.production_end_date || b.deadline || '2099-01-01').getTime();
        return dateA - dateB;
    });

    // 3. Despacho / Listos Hoy: Órdenes en estado 'ready' (listo) o cuya entrega es hoy y siguen pendientes
    const readyForDispatch = orders.filter(o => {
        if (o.status === 'delivered') return false;
        if (o.status === 'ready') return true;
        
        // Evitar duplicados en columna 1 y 3. Si está en confección activa, pertenece a columna 1.
        if (['draft', 'cutting', 'sewing', 'finishing'].includes(o.status)) return false;
        
        if (o.final_delivery_date) {
            const delDate = new Date(o.final_delivery_date);
            return delDate.toDateString() === now.toDateString();
        }
        return false;
    }).sort((a, b) => {
        const dateA = new Date(a.final_delivery_date || a.deadline || '2099-01-01').getTime();
        const dateB = new Date(b.final_delivery_date || b.deadline || '2099-01-01').getTime();
        return dateA - dateB;
    });

    return (
        <div className="min-h-screen bg-[#0B0C10] text-[#EAEAEA] font-sans antialiased selection:bg-brand-sand selection:text-brand-charcoal relative overflow-hidden">
            {/* Background elements for premium aesthetic */}
            <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[60%] rounded-full bg-brand-terracotta/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[50%] rounded-full bg-brand-sand/5 blur-[120px] pointer-events-none" />

            {/* Header section */}
            <header className="border-b border-gray-800 bg-[#0B0C10]/95 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-xl">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-gray-400 hover:text-brand-sand transition-all p-2 rounded-full hover:bg-white/5">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-brand-terracotta animate-pulse" />
                            <span className="text-[9px] uppercase tracking-widest font-bold text-brand-sand/80">Monitor en Vivo</span>
                        </div>
                        <h1 className="font-serif text-2xl font-light text-white tracking-wide">Live Production Board</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Operating status indicator */}
                    <div className="hidden md:flex flex-col text-right">
                        <p className="text-[9px] uppercase text-gray-500 font-bold tracking-widest">Fuerza Laboral Activa</p>
                        <p className="text-xs text-[#C5A880] font-bold">
                            {operators.filter(o => o.status === 'active').length} Costureras Registradas
                        </p>
                    </div>
                    
                    {/* Action button to open settings drawer */}
                    <Link 
                        href="/admin/production"
                        className="bg-transparent border border-gray-700 hover:border-gray-500 text-gray-300 px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                        <Calendar className="w-4 h-4" />
                        Ver Calendario
                    </Link>
                    <button 
                        onClick={() => { setConfigTab('general'); setIsConfigOpen(true); }}
                        className="bg-brand-sand/10 border border-brand-sand/30 hover:border-brand-sand hover:bg-brand-sand/20 text-[#C5A880] px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                        <Settings className="w-4 h-4 text-brand-sand" />
                        Gobernanza del Taller
                    </button>
                </div>
            </header>

            {/* Main content grid */}
            <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
                
                {/* 🕒 FILTRO DE HORIZONTE TEMPORAL */}
                {!loading && (
                    <div className="flex items-center gap-3 bg-[#12131C] border border-gray-800 p-3 rounded-sm shadow-lg">
                        <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                        <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500 hidden md:inline">Horizonte:</span>
                        <div className="flex gap-2">
                            {[
                                { key: 'week' as const, label: 'Esta Semana' },
                                { key: 'month' as const, label: 'Este Mes' },
                                { key: 'all' as const, label: 'Todo' }
                            ].map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setTimeFilter(f.key)}
                                    className={`px-4 py-1.5 text-[9px] uppercase tracking-widest font-bold rounded-sm border transition-all ${
                                        timeFilter === f.key
                                            ? 'bg-[#C5A880] text-[#0B0C10] border-[#C5A880] shadow-[0_0_12px_rgba(197,168,128,0.3)]'
                                            : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-300'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        {hiddenCount > 0 && timeFilter !== 'all' && (
                            <span className="text-[9px] text-gray-500 ml-auto hidden md:inline">
                                {hiddenCount} trabajo{hiddenCount !== 1 ? 's' : ''} futuro{hiddenCount !== 1 ? 's' : ''} oculto{hiddenCount !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                )}
                
                {/* 📊 SECCIÓN DE CARGA DE TRABAJO POR COSTURERA (MONITOREO) */}
                {!loading && operators.length > 0 && (
                    <div className="bg-[#12131C] border border-gray-800 p-5 rounded-sm shadow-xl space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-800/80 pb-3">
                            <BarChart2 className="w-4 h-4 text-[#C5A880]" />
                            <h2 className="font-serif text-sm tracking-wide text-white uppercase font-bold">Balance de Carga y Cola de Trabajo del Personal</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {operators.map(op => {
                                const backlog = getOperatorBacklog(op.id);
                                const dailyCap = op.daily_hours_capacity || 7;
                                const workloadPercentage = Math.round((backlog / dailyCap) * 100);
                                const loadDays = (backlog / dailyCap).toFixed(1);
                                
                                // Color de la barra
                                let barColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
                                let textColor = 'text-emerald-400';
                                if (workloadPercentage > 100 && workloadPercentage <= 150) {
                                    barColor = 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]';
                                    textColor = 'text-orange-400';
                                } else if (workloadPercentage > 150) {
                                    barColor = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse';
                                    textColor = 'text-red-400';
                                }

                                return (
                                    <div key={op.id} className="bg-[#1A1C28] border border-gray-800/80 p-4 rounded-sm space-y-3 relative group overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${op.status === 'active' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                                                <span className="font-medium text-white">{op.name}</span>
                                            </div>
                                            <span className="text-[9px] font-mono text-gray-500 font-bold">
                                                {op.status === 'active' ? 'Activa' : 'Vacaciones'}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-gray-400">
                                                <span>Carga de hoy: <strong>{backlog}h</strong></span>
                                                <span className={`${textColor} font-bold`}>{workloadPercentage}% cap. ({loadDays} días)</span>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="w-full bg-[#11121B] h-2 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${barColor} transition-all duration-500`}
                                                    style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-[8px] text-gray-500 uppercase tracking-wider pt-1">
                                            <span>Capacidad: {dailyCap}h/día</span>
                                            <span>Jornada: {op.working_days ? `${op.working_days.length} días` : '0 días'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-48 text-gray-400 space-y-4">
                        <RefreshCw className="w-8 h-8 animate-spin text-brand-sand" />
                        <p className="text-sm font-light uppercase tracking-widest">Cargando Tablero en Vivo...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        
                        {/* COLUMN 1: ACTIVE PRODUCTION */}
                        <div className="bg-[#12131C] border border-gray-800 rounded-sm overflow-hidden shadow-2xl flex flex-col min-h-[700px]">
                            <div className="p-5 border-b border-gray-800 bg-[#161722]/80 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-brand-terracotta animate-pulse" />
                                    <h3 className="font-serif text-lg text-white">1. Confección Activa</h3>
                                </div>
                                <span className="text-[10px] bg-brand-terracotta/20 text-brand-terracotta border border-brand-terracotta/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">
                                    {activeProduction.length} tareas
                                </span>
                            </div>

                            <div className="p-6 space-y-5 overflow-y-auto max-h-[680px]">
                                {activeProduction.length === 0 ? (
                                    <div className="text-center py-24 text-gray-500 border border-dashed border-gray-800 rounded-sm">
                                        <Scissors className="w-8 h-8 mx-auto text-gray-600 mb-3" />
                                        <p className="text-xs font-light">Sin costuras activas en taller.</p>
                                    </div>
                                ) : (
                                    activeProduction.map(order => {
                                        // Detect if production end date is breached
                                        const isDelayed = order.production_end_date && new Date(order.production_end_date) < now;
                                        const assignedOp = operators.find(op => op.id === order.assigned_operator_id);
                                        
                                        return (
                                            <div 
                                                key={order.id} 
                                                className={`relative bg-[#1A1C28] border rounded-sm p-5 space-y-4 transition-all duration-300 hover:border-brand-sand/50 shadow-md ${
                                                    isDelayed 
                                                        ? 'border-red-950/80 shadow-[inset_0_0_10px_rgba(239,68,68,0.15)] bg-red-950/5' 
                                                        : 'border-gray-800'
                                                }`}
                                            >
                                                {/* Delay red badge */}
                                                {isDelayed && (
                                                    <div className="absolute top-0 right-0 transform translate-y-[-50%] mr-4 bg-red-600 text-white font-bold text-[8px] uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse flex items-center gap-1 border border-red-500">
                                                        <Flame className="w-3 h-3" /> Retraso Detectado
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[9px] font-mono text-gray-500 font-bold block">
                                                            #{order.id.slice(0, 8).toUpperCase()}
                                                        </span>
                                                        <h4 className="font-serif text-lg leading-snug mt-1 text-white">{order.description}</h4>
                                                    </div>
                                                    
                                                    <div className="flex flex-col items-end gap-1">
                                                        {/* Badge displaying status */}
                                                        <span className="text-[8px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-[#202334] text-gray-400 border border-gray-700">
                                                            {order.status === 'draft' ? 'Ingresado' : order.status === 'cutting' ? 'Corte' : 'Costura'}
                                                        </span>
                                                        {/* Badge displaying agenda si es futura */}
                                                        {order.production_start_date && new Date(order.production_start_date).toDateString() !== now.toDateString() && new Date(order.production_start_date) > now && (
                                                            <span className="text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-900/40 text-blue-400 border border-blue-800/50 flex items-center gap-1">
                                                                📅 Agendado
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-gray-800/80 text-gray-400">
                                                    <div>
                                                        <span className="text-[8px] uppercase font-bold text-gray-500 tracking-wider block">Cliente</span>
                                                        <span className="font-medium text-gray-300 mt-0.5 inline-flex items-center gap-1">
                                                            <User className="w-3.5 h-3.5 text-[#C5A880]" />
                                                            {order.customers?.full_name || 'Sin Cliente'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[8px] uppercase font-bold text-gray-500 tracking-wider block">Carga Estimada</span>
                                                        <span className="font-bold text-[#C5A880] mt-0.5 inline-flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                                                            <input
                                                                type="number"
                                                                min="0.5"
                                                                max="200"
                                                                step="0.5"
                                                                defaultValue={order.estimated_hours || 1}
                                                                onBlur={(e) => handleUpdateHours(order.id, parseFloat(e.target.value))}
                                                                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                                                className="w-10 bg-transparent border-b border-[#C5A880]/40 text-center font-bold outline-none focus:border-[#C5A880] text-[#C5A880]"
                                                            />
                                                            horas
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="pt-2 text-xs text-gray-400">
                                                    <span className="text-[8px] uppercase font-bold text-gray-500 tracking-wider block">Término de Costura Estimado</span>
                                                    <span className="font-medium text-gray-300 flex items-center gap-1 mt-0.5">
                                                        <Calendar className="w-3.5 h-3.5 text-brand-terracotta" />
                                                        {order.production_end_date 
                                                            ? new Date(order.production_end_date).toLocaleDateString('es-CL', {
                                                                weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                              }) 
                                                            : 'No asignada'}
                                                    </span>
                                                </div>

                                                {/* Visual assigned operator badge */}
                                                <div className="flex justify-between items-center pt-2 border-t border-gray-850">
                                                    <div className="flex items-center gap-1.5 w-full text-[10px] text-gray-400 bg-[#151723] border border-gray-800 px-2 py-1 rounded-sm">
                                                        <UserCheck className="w-3.5 h-3.5 text-brand-sand shrink-0" />
                                                        <select 
                                                            value={order.assigned_operator_id || 'unassigned'}
                                                            onChange={(e) => handleAssignOperator(order.id, e.target.value)}
                                                            className="w-full bg-transparent border-none outline-none focus:ring-0 cursor-pointer appearance-none text-gray-300"
                                                        >
                                                            <option value="unassigned">Sin asignar (Taller)</option>
                                                            {operators.filter(op => op.status === 'active').map(op => (
                                                                <option key={op.id} value={op.id}>Asignada: {op.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Action to advance stage */}
                                                <button 
                                                    onClick={() => {
                                                        if (!order.assigned_operator_id) {
                                                            alert("No se puede avanzar de etapa sin asignar una costurera.");
                                                            return;
                                                        }
                                                        handleAdvanceStatus(order.id, order.status);
                                                    }}
                                                    className={`w-full mt-2 py-2 rounded-sm text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all border ${
                                                        !order.assigned_operator_id
                                                            ? 'bg-gray-800/40 text-gray-550 border-gray-850 cursor-not-allowed opacity-50'
                                                            : 'bg-[#202334] hover:bg-[#C5A880] hover:text-brand-charcoal text-[#C5A880] border-gray-700/60 cursor-pointer'
                                                    }`}
                                                >
                                                    {!order.assigned_operator_id ? '⚠ Falta Asignar Costurera' : 'Avanzar Etapa'}
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* COLUMN 2: QC / FITTING */}
                        <div className="bg-[#12131C] border border-gray-800 rounded-sm overflow-hidden shadow-2xl flex flex-col min-h-[700px]">
                            <div className="p-5 border-b border-gray-800 bg-[#161722]/80 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-brand-sand animate-pulse" />
                                    <h3 className="font-serif text-lg text-white">2. Control de Calidad</h3>
                                </div>
                                <span className="text-[10px] bg-brand-sand/20 text-[#C5A880] border border-brand-sand/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">
                                    {qcAndFitting.length} en QC
                                </span>
                            </div>

                            <div className="p-6 space-y-5 overflow-y-auto max-h-[680px]">
                                {qcAndFitting.length === 0 ? (
                                    <div className="text-center py-24 text-gray-500 border border-dashed border-gray-800 rounded-sm">
                                        <CheckCircle2 className="w-8 h-8 mx-auto text-gray-600 mb-3" />
                                        <p className="text-xs font-light">Sin prendas en control de calidad.</p>
                                    </div>
                                ) : (
                                    qcAndFitting.map(order => {
                                        const assignedOp = operators.find(op => op.id === order.assigned_operator_id);
                                        return (
                                            <div 
                                                key={order.id} 
                                                className="bg-[#1A1C28] border border-gray-800 rounded-sm p-5 space-y-4 transition-all duration-300 hover:border-brand-sand/50 shadow-md"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[9px] font-mono text-gray-500 font-bold block">
                                                            #{order.id.slice(0, 8).toUpperCase()}
                                                        </span>
                                                        <h4 className="font-serif text-lg leading-snug mt-1 text-white">{order.description}</h4>
                                                    </div>
                                                    <span className="text-[8px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-brand-sand/20 text-brand-sand border border-brand-sand/30">
                                                        Fitting / QC
                                                    </span>
                                                </div>

                                                {order.notes && (
                                                    <div className="bg-[#13141F] p-3 rounded border border-gray-800 text-xs italic text-gray-400">
                                                        <span className="text-[8px] uppercase font-bold text-gray-500 tracking-wider block not-italic mb-1">Notas de Taller</span>
                                                        "{order.notes}"
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-gray-800/80 text-gray-400">
                                                    <div>
                                                        <span className="text-[8px] uppercase font-bold text-gray-500 tracking-wider block">Cliente</span>
                                                        <span className="font-medium text-gray-300 mt-0.5 inline-flex items-center gap-1">
                                                            <User className="w-3.5 h-3.5 text-[#C5A880]" />
                                                            {order.customers?.full_name || 'Sin Cliente'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[8px] uppercase font-bold text-gray-500 tracking-wider block">Despacho Showroom</span>
                                                        <span className="font-bold text-[#C5A880] mt-0.5 inline-flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                                                            {order.final_delivery_date 
                                                                ? new Date(order.final_delivery_date).toLocaleDateString('es-CL', {
                                                                    day: '2-digit', month: 'short'
                                                                  }) 
                                                                : 'Sin fecha'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center pt-2 border-t border-gray-850">
                                                    <div className="flex items-center gap-1.5 w-full text-[10px] text-gray-400 bg-[#151723] border border-gray-800 px-2 py-1 rounded-sm">
                                                        <UserCheck className="w-3.5 h-3.5 text-brand-sand shrink-0" />
                                                        <select 
                                                            value={order.assigned_operator_id || 'unassigned'}
                                                            onChange={(e) => handleAssignOperator(order.id, e.target.value)}
                                                            className="w-full bg-transparent border-none outline-none focus:ring-0 cursor-pointer appearance-none text-gray-300"
                                                        >
                                                            <option value="unassigned">Sin asignar (Taller)</option>
                                                            {operators.filter(op => op.status === 'active').map(op => (
                                                                <option key={op.id} value={op.id}>Asignada: {op.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Action to advance stage */}
                                                <button 
                                                    onClick={() => {
                                                        if (!order.assigned_operator_id) {
                                                            alert("No se puede avanzar de etapa sin asignar una costurera.");
                                                            return;
                                                        }
                                                        handleAdvanceStatus(order.id, order.status);
                                                    }}
                                                    className={`w-full py-2 rounded-sm text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all border ${
                                                        !order.assigned_operator_id
                                                            ? 'bg-gray-800/40 text-gray-550 border-gray-855 cursor-not-allowed opacity-50'
                                                            : 'bg-[#202334] hover:bg-brand-sand hover:text-brand-charcoal text-[#C5A880] border-gray-700/60 cursor-pointer'
                                                    }`}
                                                >
                                                    {!order.assigned_operator_id ? '⚠ Falta Asignar Costurera' : 'Marcar como Listo'}
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* COLUMN 3: TODAY'S DISPATCH / READY */}
                        <div className="bg-[#12131C] border border-gray-800 rounded-sm overflow-hidden shadow-2xl flex flex-col min-h-[700px]">
                            <div className="p-5 border-b border-gray-800 bg-[#161722]/80 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <h3 className="font-serif text-lg text-white">3. Listos para Despacho</h3>
                                </div>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">
                                    {readyForDispatch.length} listos
                                </span>
                            </div>

                            <div className="p-6 space-y-5 overflow-y-auto max-h-[680px]">
                                {readyForDispatch.length === 0 ? (
                                    <div className="text-center py-24 text-gray-500 border border-dashed border-gray-800 rounded-sm">
                                        <CheckCircle2 className="w-8 h-8 mx-auto text-gray-600 mb-3" />
                                        <p className="text-xs font-light">Sin despachos programados para hoy.</p>
                                    </div>
                                ) : (
                                    readyForDispatch.map(order => {
                                        const isToday = order.final_delivery_date && new Date(order.final_delivery_date).toDateString() === now.toDateString();
                                        const assignedOp = operators.find(op => op.id === order.assigned_operator_id);
                                        
                                        return (
                                            <div 
                                                key={order.id} 
                                                className={`bg-[#1A1C28] border rounded-sm p-5 space-y-4 transition-all duration-300 hover:border-brand-sand/50 shadow-md ${
                                                    isToday 
                                                        ? 'border-emerald-950/80 bg-emerald-950/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                                                        : 'border-gray-800'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[9px] font-mono text-gray-500 font-bold block">
                                                            #{order.id.slice(0, 8).toUpperCase()}
                                                        </span>
                                                        <h4 className="font-serif text-lg leading-snug mt-1 text-white">{order.description}</h4>
                                                    </div>
                                                    <span className="text-[8px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                        {isToday ? 'DESPACHO HOY' : 'LISTO'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-gray-800/80 text-gray-400">
                                                    <div>
                                                        <span className="text-[8px] uppercase font-bold text-gray-500 tracking-wider block">Cliente</span>
                                                        <span className="font-medium text-gray-300 mt-0.5 inline-flex items-center gap-1">
                                                            <User className="w-3.5 h-3.5 text-[#C5A880]" />
                                                            {order.customers?.full_name || 'Sin Cliente'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[8px] uppercase font-bold text-gray-500 tracking-wider block">Bloque de Despacho</span>
                                                        <span className="font-bold text-emerald-400 mt-0.5 inline-flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {config.windowStart.slice(0, 5)} - {config.windowEnd.slice(0, 5)} hrs
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="pt-2 text-xs text-gray-400">
                                                    <span className="text-[8px] uppercase font-bold text-gray-500 tracking-wider block">Entrega Acordada</span>
                                                    <span className="font-medium text-gray-300 flex items-center gap-1 mt-0.5">
                                                        <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                                                        {order.final_delivery_date 
                                                            ? new Date(order.final_delivery_date).toLocaleDateString('es-CL', {
                                                                weekday: 'long', day: '2-digit', month: 'long'
                                                              }) 
                                                            : 'Retiro Showroom'}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center pt-2 border-t border-gray-850">
                                                    <div className="flex items-center gap-1.5 w-full text-[10px] text-gray-400 bg-[#151723] border border-gray-800 px-2 py-1 rounded-sm">
                                                        <UserCheck className="w-3.5 h-3.5 text-brand-sand shrink-0" />
                                                        <select 
                                                            value={order.assigned_operator_id || 'unassigned'}
                                                            onChange={(e) => handleAssignOperator(order.id, e.target.value)}
                                                            className="w-full bg-transparent border-none outline-none focus:ring-0 cursor-pointer appearance-none text-gray-300"
                                                        >
                                                            <option value="unassigned">Sin asignar (Taller)</option>
                                                            {operators.filter(op => op.status === 'active').map(op => (
                                                                <option key={op.id} value={op.id}>Asignada: {op.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Action: Complete delivery and archive */}
                                                <button 
                                                    onClick={() => {
                                                        if (!order.assigned_operator_id) {
                                                            alert("No se puede completar la entrega sin asignar una costurera.");
                                                            return;
                                                        }
                                                        handleCompleteDelivery(order.id);
                                                    }}
                                                    className={`w-full py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] ${
                                                        !order.assigned_operator_id
                                                            ? 'bg-gray-800/40 text-gray-550 cursor-not-allowed opacity-50 border border-gray-850'
                                                            : 'bg-[#10B981] hover:bg-[#059669] text-white cursor-pointer'
                                                    }`}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    {!order.assigned_operator_id ? '⚠ Falta Asignar Costurera' : 'Entrega Completada ✔'}
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </main>

            {/* SETTINGS DRAWER / CONFIGURATION MODAL */}
            {isConfigOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity duration-300">
                    {/* Backdrop closer */}
                    <div className="absolute inset-0" onClick={() => setIsConfigOpen(false)} />
                    
                    {/* Drawer Content */}
                    <div className="relative w-full max-w-2xl h-full bg-[#12131C] border-l border-gray-800 shadow-2xl p-8 overflow-y-auto flex flex-col justify-between z-10 animate-[slideIn_0.3s_ease-out]">
                        
                        <div className="space-y-6">
                            {/* Drawer Header */}
                            <div className="flex justify-between items-start border-b border-gray-800 pb-5">
                                <div>
                                    <div className="flex items-center gap-2 text-brand-sand">
                                        <Settings className="w-4 h-4" />
                                        <span className="text-[10px] uppercase tracking-widest font-bold">Consola de Gobernanza</span>
                                    </div>
                                    <h2 className="font-serif text-2xl text-white mt-1">Configuración del Atelier</h2>
                                </div>
                                <button 
                                    onClick={() => setIsConfigOpen(false)}
                                    className="p-2 text-gray-400 hover:text-brand-terracotta hover:bg-white/5 rounded-full transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* TABS SELECTOR IN DRAWER */}
                            <div className="flex border-b border-gray-800 gap-4">
                                <button
                                    onClick={() => { setConfigTab('general'); setEditingOperator(null); }}
                                    className={`pb-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
                                        configTab === 'general'
                                            ? 'border-[#C5A880] text-white'
                                            : 'border-transparent text-gray-500 hover:text-gray-300'
                                    }`}
                                >
                                    Gobernanza General
                                </button>
                                <button
                                    onClick={() => setConfigTab('operators')}
                                    className={`pb-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
                                        configTab === 'operators'
                                            ? 'border-[#C5A880] text-white'
                                            : 'border-transparent text-gray-500 hover:text-gray-300'
                                    }`}
                                >
                                    Fuerza Laboral (Costureras)
                                </button>
                            </div>

                            {/* Notification banner */}
                            {configMessage && (
                                <div className={`p-4 rounded-sm text-xs font-medium border flex items-center gap-2 ${
                                    configMessage.type === 'success' 
                                        ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/50' 
                                        : 'bg-red-950/20 text-red-400 border-red-800/50'
                                }`}>
                                    {configMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                                    {configMessage.text}
                                </div>
                            )}

                            {/* TAB 1: GENERAL GOVERNANCE FORM */}
                            {configTab === 'general' && (
                                <form onSubmit={handleSaveConfig} className="space-y-6 pt-2">
                                    
                                    {/* 1. JORNADA LABORAL DEL TALLER (CUSTOMIZABLE) */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider border-b border-gray-800/60 pb-1">
                                            📆 Jornada Laboral del Taller
                                        </h3>
                                        <p className="text-[10px] text-gray-500">
                                            Selecciona los días laborables del taller para la confección. Los días no marcados serán completamente omitidos en el cálculo progresivo de la fecha estimada.
                                        </p>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {DAYS_OF_WEEK.map(day => {
                                                const isSelected = config.workingDays.includes(day.value);
                                                return (
                                                    <button
                                                        key={day.value}
                                                        type="button"
                                                        onClick={() => toggleWorkingDay(day.value)}
                                                        className={`py-2 px-3 text-[10px] font-bold uppercase tracking-widest border transition-all rounded-sm flex items-center justify-between ${
                                                            isSelected
                                                                ? 'bg-brand-sand/15 border-brand-sand text-[#C5A880]'
                                                                : 'bg-[#1A1C28] border-gray-800 text-gray-500 hover:border-gray-700'
                                                        }`}
                                                    >
                                                        {day.label}
                                                        {isSelected && <Check className="w-3.5 h-3.5" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Horarios Laborales de Taller */}
                                    <div className="space-y-3 pt-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wide block">
                                            ⏰ Horario Laboral del Taller (Inicio / Fin)
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <span className="text-[8px] uppercase font-bold text-gray-400 block font-sans">Hora de Entrada</span>
                                                <input 
                                                    type="text"
                                                    placeholder="09:00:00"
                                                    value={config.workshopHourStart || '09:00:00'}
                                                    onChange={(e) => setConfig({ ...config, workshopHourStart: e.target.value })}
                                                    className="w-full bg-[#1A1C28] border border-gray-800 focus:border-[#C5A880] outline-none text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <span className="text-[8px] uppercase font-bold text-gray-400 block font-sans">Hora de Salida</span>
                                                <input 
                                                    type="text"
                                                    placeholder="18:00:00"
                                                    value={config.workshopHourEnd || '18:00:00'}
                                                    onChange={(e) => setConfig({ ...config, workshopHourEnd: e.target.value })}
                                                    className="w-full bg-[#1A1C28] border border-gray-800 focus:border-[#C5A880] outline-none text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-gray-500 leading-normal">
                                            Define la ventana de operación del taller. Los cálculos cronológicos del backlog de costureras se iniciarán a la Hora de Entrada establecida.
                                        </p>
                                    </div>

                                    {/* 2. DÍAS DE DESPACHO EN SHOWROOM (CUSTOMIZABLE) */}
                                    <div className="space-y-4 pt-2">
                                        <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider border-b border-gray-800/60 pb-1">
                                            🛍️ Días de Despacho en Showroom
                                        </h3>
                                        <p className="text-[10px] text-gray-500">
                                            Define qué días de la semana la clienta puede realizar el retiro exclusivo en showroom. Las fechas estimadas se alinearían al próximo día disponible seleccionado.
                                        </p>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {DAYS_OF_WEEK.map(day => {
                                                const isSelected = config.allowedDays.includes(day.value);
                                                return (
                                                    <button
                                                        key={day.value}
                                                        type="button"
                                                        onClick={() => toggleAllowedDay(day.value)}
                                                        className={`py-2 px-3 text-[10px] font-bold uppercase tracking-widest border transition-all rounded-sm flex items-center justify-between ${
                                                            isSelected
                                                                ? 'bg-brand-terracotta/15 border-brand-terracotta text-brand-terracotta'
                                                                : 'bg-[#1A1C28] border-gray-800 text-gray-500 hover:border-gray-700'
                                                        }`}
                                                    >
                                                        {day.label}
                                                        {isSelected && <Check className="w-3.5 h-3.5" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 3. BUFFER LOGÍSTICO Y HORARIOS */}
                                    <div className="space-y-4 pt-2">
                                        <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider border-b border-gray-800/60 pb-1">
                                            Logística y Bloques Horarios de Showroom
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wide block">
                                                    Buffer Logístico (Días Hábiles)
                                                </label>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    max="15"
                                                    value={config.bufferDays}
                                                    onChange={(e) => setConfig({ ...config, bufferDays: Number(e.target.value) })}
                                                    className="w-full bg-[#1A1C28] border border-gray-800 focus:border-[#C5A880] outline-none text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-all"
                                                    required
                                                />
                                                <span className="text-[9px] text-gray-500 block">Días hábiles añadidos como holgura tras costura antes de la entrega en showroom.</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wide block">
                                                        Horario de Despacho (Inicio)
                                                    </label>
                                                    <input 
                                                        type="text"
                                                        placeholder="15:00:00"
                                                        value={config.windowStart}
                                                        onChange={(e) => setConfig({ ...config, windowStart: e.target.value })}
                                                        className="w-full bg-[#1A1C28] border border-gray-800 focus:border-[#C5A880] outline-none text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-all"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wide block">
                                                        Horario de Despacho (Fin)
                                                    </label>
                                                    <input 
                                                        type="text"
                                                        placeholder="18:00:00"
                                                        value={config.windowEnd}
                                                        onChange={(e) => setConfig({ ...config, windowEnd: e.target.value })}
                                                        className="w-full bg-[#1A1C28] border border-gray-800 focus:border-[#C5A880] outline-none text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-all"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Guardar Button */}
                                    <button
                                        type="submit"
                                        disabled={savingConfig}
                                        className="w-full bg-[#C5A880] hover:bg-[#B3966E] disabled:bg-[#C5A880]/50 text-brand-charcoal py-3.5 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_4px_12px_rgba(197,168,128,0.25)] mt-8"
                                    >
                                        {savingConfig ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" /> Guardando Cambios...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" /> Guardar Reglas de Operación
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* TAB 2: WORKFORCE / OPERATORS FORM */}
                            {configTab === 'operators' && (
                                <div className="space-y-6 pt-2">
                                    
                                    {/* Active Operators list */}
                                    {editingOperator === null ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                                                    Costureras Registradas ({operators.length})
                                                </h3>
                                                <button
                                                    onClick={openNewOperator}
                                                    className="bg-brand-sand/10 border border-brand-sand/30 hover:border-brand-sand text-[#C5A880] px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-all"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Agregar Costurera
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {operators.map(op => (
                                                    <div key={op.id} className="bg-[#1A1C28] border border-gray-800 p-4 rounded-sm flex justify-between items-center">
                                                        <div>
                                                            <h4 className="font-semibold text-white text-sm">{op.name}</h4>
                                                            <p className="text-[10px] text-gray-400 mt-1">
                                                                Capacidad: <strong className="text-brand-sand">{op.daily_hours_capacity}h/día</strong> • Jornada: {op.working_days ? `${op.working_days.length} días` : '0 días'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded ${
                                                                op.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-800/30' : 'bg-orange-500/10 text-orange-400 border border-orange-800/30'
                                                            }`}>
                                                                {op.status === 'active' ? 'Activa' : 'Vacaciones'}
                                                            </span>
                                                            <button
                                                                onClick={() => openEditOperator(op)}
                                                                className="text-xs font-bold uppercase tracking-widest text-[#C5A880] hover:underline"
                                                            >
                                                                Editar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        // CREATE / EDIT OPERATOR FORM
                                        <form onSubmit={handleSaveOperator} className="space-y-5 bg-[#171822] p-5 border border-gray-850 rounded-sm">
                                            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-2">
                                                <h4 className="text-sm font-serif text-white">
                                                    {operatorForm.id ? `Editar Costurera: ${operatorForm.name}` : 'Registrar Nueva Costurera'}
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingOperator(null)}
                                                    className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Operator Name */}
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wide block">Nombre Completo</label>
                                                    <input
                                                        type="text"
                                                        value={operatorForm.name}
                                                        onChange={(e) => setOperatorForm({ ...operatorForm, name: e.target.value })}
                                                        className="w-full bg-[#1A1C28] border border-gray-800 focus:border-[#C5A880] outline-none text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-all"
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    {/* Daily hours */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wide block">Horas de Costura (por día)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="24"
                                                            value={operatorForm.dailyCapacity}
                                                            onChange={(e) => setOperatorForm({ ...operatorForm, dailyCapacity: Number(e.target.value) })}
                                                            className="w-full bg-[#1A1C28] border border-gray-800 focus:border-[#C5A880] outline-none text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-all"
                                                            required
                                                        />
                                                    </div>

                                                    {/* Status */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wide block">Estado del Perfil</label>
                                                        <select
                                                            value={operatorForm.status}
                                                            onChange={(e) => setOperatorForm({ ...operatorForm, status: e.target.value })}
                                                            className="w-full bg-[#1A1C28] border border-gray-800 focus:border-[#C5A880] outline-none text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-all cursor-pointer"
                                                        >
                                                            <option value="active">Activa (Disponible)</option>
                                                            <option value="vacation">Vacaciones</option>
                                                            <option value="inactive">Inactiva / Omitir de cálculos</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Operator Custom Working Days */}
                                                <div className="space-y-3.5 pt-2">
                                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wide block">📆 Jornada Laboral Propia de la Costurera</label>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                        {DAYS_OF_WEEK.map(day => {
                                                            const isSelected = operatorForm.workingDays.includes(day.value);
                                                            return (
                                                                <button
                                                                    key={day.value}
                                                                    type="button"
                                                                    onClick={() => toggleOperatorFormDay(day.value)}
                                                                    className={`py-1.5 px-2 text-[9px] font-bold uppercase tracking-widest border transition-all rounded-sm flex items-center justify-between ${
                                                                        isSelected
                                                                            ? 'bg-brand-sand/15 border-brand-sand text-[#C5A880]'
                                                                            : 'bg-[#1A1C28] border-gray-800 text-gray-500 hover:border-gray-700'
                                                                    }`}
                                                                >
                                                                    {day.label.slice(0, 3)}
                                                                    {isSelected && <Check className="w-3 h-3" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action save operator */}
                                            <button
                                                type="submit"
                                                disabled={savingOperator}
                                                className="w-full bg-[#C5A880] hover:bg-[#B3966E] disabled:bg-[#C5A880]/50 text-brand-charcoal py-3 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-4"
                                            >
                                                {savingOperator ? (
                                                    <>
                                                        <RefreshCw className="w-4 h-4 animate-spin" /> Guardando Costurera...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4" /> Guardar Perfil de Costurera
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
            
            {/* Custom keyframe animation style injection */}
            <style jsx global>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
