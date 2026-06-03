'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, Clock, CheckCircle2, AlertCircle, Scissors, Search, 
    Loader2, Plus, X, User, Calendar, ChevronLeft, ChevronRight, 
    History, BarChart2, CheckCircle, Flame
} from 'lucide-react';
import { getProductionOrders, updateOrderStatus } from './actions';
import { getOperatorsAction } from '../pos/actions';
import { supabase } from '@/lib/supabase';

export default function ProductionPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [operators, setOperators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    
    // Navigation Tabs: kanban, calendar, history
    const [activeTab, setActiveTab] = useState<'kanban' | 'calendar' | 'history'>('kanban');
    
    // Calendar Navigation States
    const [calendarDate, setCalendarDate] = useState<Date>(new Date());
    const [calendarView, setCalendarView] = useState<'monthly' | 'weekly' | 'daily'>('monthly');

    const stages = [
        { id: 'draft', label: 'Ingresado' },
        { id: 'cutting', label: 'Corte' },
        { id: 'sewing', label: 'Confección' },
        { id: 'finishing', label: 'Fitting / Prueba' },
        { id: 'ready', label: 'Final QC / Listo' }
    ];

    useEffect(() => {
        fetchOrders();
        fetchOperators();
        setIsDesktop(window.innerWidth >= 768);
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        
        // Suscripción Realtime a cambios en las órdenes de producción
        const channel = supabase
            .channel('production_orders_live')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'production_orders' },
                () => {
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            window.removeEventListener('resize', handleResize);
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchOrders() {
        setLoading(true);
        const data = await getProductionOrders();
        setOrders(data || []);
        setLoading(false);
    }

    async function fetchOperators() {
        const data = await getOperatorsAction();
        setOperators(data || []);
    }

    const getDailyCapacity = (date: Date) => {
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // 1=Mon, 7=Sun
        let total = 0;
        operators.forEach(op => {
            if (op.status === 'active' && op.working_days && op.working_days.includes(dayOfWeek)) {
                total += Number(op.daily_hours_capacity || 0);
            }
        });
        return total > 0 ? total : 8; // fallback to 8 if no operators configured for that day
    };

    async function handleStatusChange(id: string, newStatus: string) {
        const result = await updateOrderStatus(id, newStatus);
        if (result.success) {
            fetchOrders();
        } else {
            alert(result.error || "Ocurrió un error al cambiar el estado");
            fetchOrders();
        }
    }

    // Active orders are anything not fully delivered yet
    const activeOrders = orders.filter(o => o.status !== 'delivered');
    const completedOrders = orders.filter(o => o.status === 'delivered');

    const filteredActiveOrders = activeOrders.filter(o => 
        o.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customers?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCompletedOrders = completedOrders.filter(o => 
        o.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customers?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- CALENDAR HELPER FUNCTIONS ---
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const days = [];
        
        let startDay = firstDay.getDay();
        let prevMonthPadding = startDay === 0 ? 6 : startDay - 1; // Mon is 1, Sun is 0
        
        // Prev month padding
        for (let i = prevMonthPadding; i > 0; i--) {
            const d = new Date(year, month, 1 - i);
            days.push({ date: d, isCurrentMonth: false });
        }
        
        // Current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const d = new Date(year, month, i);
            days.push({ date: d, isCurrentMonth: true });
        }
        
        // Next month padding
        const totalDays = days.length;
        const remaining = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
        for (let i = 1; i <= remaining; i++) {
            const d = new Date(year, month + 1, i);
            days.push({ date: d, isCurrentMonth: false });
        }
        
        return days;
    };

    const getDaysInWeek = (date: Date) => {
        const temp = new Date(date);
        const day = temp.getDay();
        const diff = temp.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Mon
        const monday = new Date(temp.setDate(diff));
        
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const getOrdersForDate = (d: Date) => {
        return activeOrders.filter(o => {
            if (!o.deadline) return false;
            const deadDate = new Date(o.deadline);
            return deadDate.getFullYear() === d.getFullYear() &&
                   deadDate.getMonth() === d.getMonth() &&
                   deadDate.getDate() === d.getDate();
        });
    };

    const getHoursForDate = (d: Date) => {
        const dateOrders = getOrdersForDate(d);
        return dateOrders.reduce((sum, o) => sum + Number(o.estimated_hours || 0), 0);
    };

    const handlePrevMonth = () => {
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
    };

    const handlePrevWeek = () => {
        const prev = new Date(calendarDate);
        prev.setDate(prev.getDate() - 7);
        setCalendarDate(prev);
    };

    const handleNextWeek = () => {
        const next = new Date(calendarDate);
        next.setDate(next.getDate() + 7);
        setCalendarDate(next);
    };

    const handlePrevDay = () => {
        const prev = new Date(calendarDate);
        prev.setDate(prev.getDate() - 1);
        setCalendarDate(prev);
    };

    const handleNextDay = () => {
        const next = new Date(calendarDate);
        next.setDate(next.getDate() + 1);
        setCalendarDate(next);
    };

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const weekDaysShort = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    // --- LIVE BOARD FILTER HELPERS ---
    const isProductionActive = (order: any) => {
        if (order.status === 'delivered') return false;
        if (order.status === 'sewing') return true;
        if (!order.production_start_date || !order.production_end_date) return false;
        const now = new Date();
        const start = new Date(order.production_start_date);
        const end = new Date(order.production_end_date);
        return start <= now && end > now;
    };

    const isDelayed = (order: any) => {
        if (order.status === 'ready' || order.status === 'delivered') return false;
        if (!order.production_end_date) return false;
        return new Date() > new Date(order.production_end_date);
    };

    const isJobOk = (order: any) => {
        if (order.status === 'delivered') return false;
        const hasEnded = order.production_end_date ? new Date() >= new Date(order.production_end_date) : false;
        const isBeforeDelivery = order.final_delivery_date ? new Date() < new Date(order.final_delivery_date) : true;
        return (order.status === 'ready' || order.status === 'finishing' || hasEnded) && isBeforeDelivery;
    };

    const isReadyForDelivery = (order: any) => {
        if (order.status === 'delivered') return false;
        if (!order.final_delivery_date) return false;
        const finalDate = new Date(order.final_delivery_date);
        const today = new Date();
        return finalDate.getFullYear() === today.getFullYear() &&
               finalDate.getMonth() === today.getMonth() &&
               finalDate.getDate() === today.getDate();
    };

    return (
        <div className="min-h-screen bg-brand-sand/10 p-4 md:p-8 pt-20 font-sans text-brand-charcoal">
            <div className="max-w-screen-2xl mx-auto space-y-8">
                
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-6">
                    <div>
                        <h1 className="font-serif text-3xl md:text-5xl">Gobernanza de Producción</h1>
                        <p className="text-text-secondary mt-1 text-sm">Organización de costura, control de carga diaria de 8 horas e historial del taller.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-grow sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder={activeTab === 'history' ? "Buscar en historial..." : "Buscar órden o cliente..."} 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-brand-terracotta outline-none bg-white" 
                            />
                        </div>
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="bg-brand-charcoal text-white px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all whitespace-nowrap flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Nueva Órden
                        </button>
                    </div>
                </header>

                {/* Subpage / Navigation Tabs */}
                <div className="flex border-b border-gray-200 gap-6">
                    <button 
                        onClick={() => { setActiveTab('kanban'); setSearchTerm(''); }}
                        className={`pb-4 text-xs uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'kanban' ? 'border-brand-terracotta text-brand-charcoal' : 'border-transparent text-gray-400 hover:text-brand-charcoal'}`}
                    >
                        <Scissors className="w-4 h-4" />
                        Tablero Kanban
                    </button>
                    <button 
                        onClick={() => { setActiveTab('calendar'); setSearchTerm(''); }}
                        className={`pb-4 text-xs uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'calendar' ? 'border-brand-terracotta text-brand-charcoal' : 'border-transparent text-gray-400 hover:text-brand-charcoal'}`}
                    >
                        <Calendar className="w-4 h-4" />
                        Calendario de Producción
                    </button>
                    <button 
                        onClick={() => { setActiveTab('history'); setSearchTerm(''); }}
                        className={`pb-4 text-xs uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'history' ? 'border-brand-terracotta text-brand-charcoal' : 'border-transparent text-gray-400 hover:text-brand-charcoal'}`}
                    >
                        <History className="w-4 h-4" />
                        Historial de Confecciones
                    </button>
                </div>

                {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-terracotta" />
                    </div>
                ) : (
                    <>
                        {/* TAB 1: KANBAN BOARD */}
                        {activeTab === 'kanban' && (
                            <div className="flex overflow-x-auto snap-x md:grid md:grid-cols-5 gap-6 h-[700px] pb-4">
                                {stages.map(stage => {
                                    const stageOrders = filteredActiveOrders.filter(o => o.status === stage.id);
                                    return (
                                        <div key={stage.id} className="min-w-[300px] md:min-w-0 snap-center bg-white/40 p-4 border border-gray-100 flex flex-col rounded-sm">
                                            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
                                                <h3 className="font-serif text-lg">{stage.label}</h3>
                                                <span className="text-[10px] bg-white px-2 py-1 border border-gray-100 rounded-full font-bold">
                                                    {stageOrders.length}
                                                </span>
                                            </div>

                                            <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                                {stageOrders.map(order => (
                                                    <div key={order.id} className="bg-white p-6 shadow-sm border border-gray-100 hover:border-brand-terracotta transition-all group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">#{order.id.slice(0, 8)}</span>
                                                            <select 
                                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                                className="text-[8px] uppercase tracking-widest font-bold bg-gray-50 border-none outline-none focus:ring-0 cursor-pointer p-1"
                                                                value={order.status}
                                                            >
                                                                {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                                                <option value="delivered">Entregado ✔</option>
                                                            </select>
                                                        </div>
                                                        <h4 className="font-serif text-sm mb-1">{order.description}</h4>
                                                        <p className="text-xs text-text-secondary mb-2 flex items-center gap-1">
                                                            <User className="w-3.5 h-3.5 text-gray-400" /> {order.customers?.full_name || 'Sin cliente'}
                                                        </p>

                                                        <div className="mb-3 text-[10px] flex items-center gap-1">
                                                            {order.atelier_operators ? (
                                                                <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-sm font-semibold inline-flex items-center gap-1">
                                                                    👤 {order.atelier_operators.name}
                                                                </span>
                                                            ) : (
                                                                <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-sm font-semibold inline-flex items-center gap-1 animate-pulse">
                                                                    ⚠ Sin Costurera
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Hour / Workload Indicator in Card */}
                                                        {order.estimated_hours > 0 && (
                                                            <div className="bg-brand-sand/30 text-[9px] font-bold uppercase tracking-wider text-brand-charcoal py-1 px-2.5 rounded-full inline-flex items-center gap-1 mb-4">
                                                                <Clock className="w-3 h-3" />
                                                                Tiempo: {order.estimated_hours} {Number(order.estimated_hours) === 1 ? 'hora' : 'horas'}
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                                <Calendar className="w-3 h-3" />
                                                                {order.deadline ? new Date(order.deadline).toLocaleDateString('es-CL') : 'Sin fecha'}
                                                            </div>
                                                            <div className="w-6 h-6 rounded-full bg-brand-sand border border-white flex items-center justify-center text-[8px] font-bold text-brand-terracotta">
                                                                {order.customers?.full_name ? order.customers.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'EC'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <button 
                                                    onClick={() => setIsAdding(true)}
                                                    className="w-full border-2 border-dashed border-gray-200 py-6 text-gray-300 hover:border-brand-terracotta hover:text-brand-terracotta transition-all text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded-sm mt-4"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Mover / Añadir
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* TAB 2: SCHEDULING CALENDAR */}
                        {activeTab === 'calendar' && (
                            <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-sm space-y-6">
                                
                                {/* Calendar Header Navigation */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100 pb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex border border-gray-200 rounded-sm overflow-hidden">
                                            <button 
                                                onClick={() => {
                                                    if (calendarView === 'monthly') handlePrevMonth();
                                                    else if (calendarView === 'weekly') handlePrevWeek();
                                                    else handlePrevDay();
                                                }}
                                                className="p-2.5 hover:bg-gray-50 border-r border-gray-200 transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if (calendarView === 'monthly') handleNextMonth();
                                                    else if (calendarView === 'weekly') handleNextWeek();
                                                    else handleNextDay();
                                                }}
                                                className="p-2.5 hover:bg-gray-50 transition-colors"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <h2 className="font-serif text-2xl">
                                            {calendarView === 'monthly' && `${monthNames[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`}
                                            {calendarView === 'weekly' && `Semana del ${getDaysInWeek(calendarDate)[0].getDate()} de ${monthNames[getDaysInWeek(calendarDate)[0].getMonth()]}`}
                                            {calendarView === 'daily' && `${calendarDate.getDate()} de ${monthNames[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`}
                                        </h2>
                                    </div>

                                    {/* Toggle Calendar View */}
                                    <div className="flex border border-gray-200 rounded-sm overflow-hidden text-[9px] uppercase tracking-widest font-bold">
                                        <button 
                                            onClick={() => setCalendarView('monthly')}
                                            className={`px-4 py-2 border-r border-gray-200 transition-colors ${calendarView === 'monthly' ? 'bg-brand-charcoal text-white' : 'hover:bg-gray-50'}`}
                                        >
                                            Mes
                                        </button>
                                        <button 
                                            onClick={() => setCalendarView('weekly')}
                                            className={`px-4 py-2 border-r border-gray-200 transition-colors ${calendarView === 'weekly' ? 'bg-brand-charcoal text-white' : 'hover:bg-gray-50'}`}
                                        >
                                            Semana
                                        </button>
                                        <button 
                                            onClick={() => setCalendarView('daily')}
                                            className={`px-4 py-2 transition-colors ${calendarView === 'daily' ? 'bg-brand-charcoal text-white' : 'hover:bg-gray-50'}`}
                                        >
                                            Día
                                        </button>
                                    </div>
                                </div>

                                {/* VIEW A: MONTHLY GRID */}
                                {calendarView === 'monthly' && (
                                    <div className="space-y-2">
                                        <div 
                                            className="text-center text-[10px] uppercase tracking-widest font-bold text-gray-400 py-2 border-b border-gray-50"
                                            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px' }}
                                        >
                                            {weekDaysShort.map(d => <span key={d}>{d}</span>)}
                                        </div>
                                        <div 
                                            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px' }}
                                        >
                                            {getDaysInMonth(calendarDate).map(({ date, isCurrentMonth }, idx) => {
                                                const dateOrders = getOrdersForDate(date);
                                                const totalHours = getHoursForDate(date);
                                                const dailyCapacity = getDailyCapacity(date);
                                                const isToday = new Date().toDateString() === date.toDateString();
                                                
                                                return (
                                                    <div 
                                                        key={idx}
                                                        onClick={() => {
                                                            setCalendarDate(date);
                                                            setCalendarView('daily');
                                                        }}
                                                        className={`min-h-[100px] border p-2 flex flex-col rounded-sm transition-all cursor-pointer ${
                                                            isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50/50 border-gray-100 text-gray-400'
                                                        } ${isToday ? 'ring-1 ring-brand-terracotta' : ''} hover:border-brand-terracotta hover:shadow-sm`}
                                                    >
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className={`text-[10px] font-bold ${isToday ? 'bg-brand-terracotta text-white px-1.5 py-0.5 rounded-full' : ''}`}>
                                                                {date.getDate()}
                                                            </span>
                                                            
                                                            {/* Hour/Limit indicator */}
                                                            {totalHours > 0 && (
                                                                <span className={`text-[8px] px-1.5 py-0.5 font-bold rounded-sm ${
                                                                    totalHours <= dailyCapacity * 0.6 ? 'bg-green-50 text-green-700 border border-green-150' :
                                                                    totalHours <= dailyCapacity ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                                                                    'bg-rose-50 text-rose-700 border border-rose-150 animate-pulse'
                                                                }`}>
                                                                    {totalHours}h/{dailyCapacity}h
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Preview of orders */}
                                                        <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1 select-none pointer-events-none">
                                                            {dateOrders.slice(0, 2).map(order => (
                                                                <div key={order.id} className="text-[8px] bg-brand-sand/20 border-l border-brand-charcoal/30 px-1 py-0.5 truncate text-brand-charcoal">
                                                                    {order.description}
                                                                </div>
                                                            ))}
                                                            {dateOrders.length > 2 && (
                                                                <div className="text-[7px] font-bold uppercase text-gray-400 tracking-wider">
                                                                    + {dateOrders.length - 2} más
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* VIEW B: WEEKLY SCHEDULE */}
                                {calendarView === 'weekly' && (
                                    <div 
                                        style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: isDesktop ? 'repeat(7, minmax(0, 1fr))' : 'repeat(1, minmax(0, 1fr))', 
                                            gap: '16px' 
                                        }}
                                    >
                                        {getDaysInWeek(calendarDate).map((date, idx) => {
                                            const dateOrders = getOrdersForDate(date);
                                            const totalHours = getHoursForDate(date);
                                            const dailyCapacity = getDailyCapacity(date);
                                            const isToday = new Date().toDateString() === date.toDateString();
                                            
                                            return (
                                                <div 
                                                    key={idx}
                                                    className={`border p-4 rounded-sm flex flex-col space-y-4 min-h-[400px] ${
                                                        isToday ? 'bg-brand-sand/5 border-brand-terracotta' : 'bg-white border-gray-150'
                                                    }`}
                                                >
                                                    <div className="border-b border-gray-100 pb-2">
                                                        <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400">{weekDaysShort[idx]}</span>
                                                        <span className={`text-xl font-serif ${isToday ? 'text-brand-terracotta font-bold' : ''}`}>{date.getDate()}</span>
                                                    </div>
                                                    
                                                    {/* Total hours check */}
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider">
                                                            <span className="text-gray-400">Carga del Día</span>
                                                            <span className={totalHours > dailyCapacity ? 'text-rose-600' : 'text-brand-charcoal'}>
                                                                {totalHours} / {dailyCapacity} horas
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full transition-all duration-300 ${
                                                                    totalHours <= dailyCapacity * 0.6 ? 'bg-green-600' :
                                                                    totalHours <= dailyCapacity ? 'bg-amber-500' : 'bg-rose-600'
                                                                }`}
                                                                style={{ width: `${Math.min((totalHours / dailyCapacity) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Work list */}
                                                    <div className="flex-1 overflow-y-auto space-y-3">
                                                        {dateOrders.length === 0 ? (
                                                            <p className="text-[10px] italic text-gray-300 py-6 text-center">Sin trabajos</p>
                                                        ) : (
                                                            dateOrders.map(order => (
                                                                <div 
                                                                    key={order.id} 
                                                                    onClick={() => {
                                                                        setCalendarDate(date);
                                                                        setCalendarView('daily');
                                                                    }}
                                                                    className="bg-gray-50 hover:bg-brand-sand/10 border border-gray-200/60 p-2.5 cursor-pointer rounded-sm space-y-1 transition-all"
                                                                >
                                                                    <div className="flex justify-between text-[8px] font-bold text-gray-400">
                                                                        <span>#{order.id.slice(0, 6)}</span>
                                                                        <span className="text-brand-terracotta">{order.estimated_hours}h</span>
                                                                    </div>
                                                                    <h5 className="font-serif text-[11px] leading-tight text-brand-charcoal">{order.description}</h5>
                                                                    <p className="text-[9px] text-gray-500 truncate">{order.customers?.full_name || 'Sin cliente'}</p>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* VIEW C: DAILY DETAIL */}
                                {calendarView === 'daily' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        
                                        {/* Left panel: Daily Hour Capacity Gauge */}
                                        <div className="bg-brand-sand/5 border border-brand-sand/20 p-6 md:p-8 rounded-sm space-y-6 flex flex-col justify-between">
                                            <div className="space-y-4">
                                                <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400">Resumen del Día</h3>
                                                <p className="text-sm text-text-secondary leading-relaxed">
                                                    Elena Atelier calcula la capacidad laboral diaria basándose en el <strong>perfil de cada costurera asignada</strong> para hoy.
                                                </p>
                                            </div>

                                            {/* Large Progress Bar & Status */}
                                            {(() => {
                                                const totalHours = getHoursForDate(calendarDate);
                                                const dailyCapacity = getDailyCapacity(calendarDate);
                                                return (
                                                    <div className="space-y-6 py-6 border-y border-brand-sand/20">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-end">
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Carga Asignada</span>
                                                                <span className="text-3xl font-serif">{totalHours} <span className="text-xs font-sans uppercase text-gray-400">/ {dailyCapacity} hrs</span></span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full transition-all duration-500 ${
                                                                        totalHours <= dailyCapacity * 0.6 ? 'bg-green-600' :
                                                                        totalHours <= dailyCapacity ? 'bg-amber-500' : 'bg-rose-600'
                                                                    }`}
                                                                    style={{ width: `${Math.min((totalHours / dailyCapacity) * 100, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-3 items-start">
                                                            {totalHours <= dailyCapacity * 0.6 ? (
                                                                <div className="p-2 bg-green-50 rounded-full text-green-700 border border-green-150">
                                                                    <CheckCircle2 className="w-5 h-5" />
                                                                </div>
                                                            ) : totalHours <= dailyCapacity ? (
                                                                <div className="p-2 bg-amber-50 rounded-full text-amber-700 border border-amber-150">
                                                                    <Clock className="w-5 h-5" />
                                                                </div>
                                                            ) : (
                                                                <div className="p-2 bg-rose-50 rounded-full text-rose-700 border border-rose-150 animate-bounce">
                                                                    <Flame className="w-5 h-5" />
                                                                </div>
                                                            )}

                                                            <div>
                                                                <h4 className="text-[10px] font-bold uppercase tracking-widest">
                                                                    {totalHours <= dailyCapacity * 0.6 ? 'Capacidad Óptima' :
                                                                     totalHours <= dailyCapacity ? 'Capacidad Intermedia' :
                                                                     'Capacidad Sobrecargada'}
                                                                </h4>
                                                                <p className="text-xs text-text-secondary mt-1">
                                                                    {totalHours <= dailyCapacity * 0.6 ? 'El taller cuenta con suficiente tiempo libre para recibir más bastas o costuras en esta fecha.' :
                                                                     totalHours <= dailyCapacity ? 'La jornada laboral de hoy está balanceada. Carga laboral óptima.' :
                                                                     `¡Cuidado! Se ha excedido la capacidad operativa de ${dailyCapacity} horas. Considera re-agendar algunas órdenes.`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            <button 
                                                onClick={() => setCalendarView('monthly')}
                                                className="text-[10px] uppercase tracking-widest font-bold text-brand-terracotta hover:underline text-left"
                                            >
                                                ← Volver al Calendario Completo
                                            </button>
                                        </div>

                                        {/* Right panel: Active Work List */}
                                        <div className="lg:col-span-2 space-y-4">
                                            <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400">Trabajos Agendados ({getOrdersForDate(calendarDate).length})</h3>
                                            
                                            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                                                {getOrdersForDate(calendarDate).length === 0 ? (
                                                    <div className="text-center py-20 border-2 border-dashed border-gray-150 rounded-sm">
                                                        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                                        <p className="text-sm text-gray-400">No hay ninguna costura o basta programada para este día.</p>
                                                    </div>
                                                ) : (
                                                    getOrdersForDate(calendarDate).map(order => (
                                                        <div key={order.id} className="bg-gray-50 border border-gray-200/60 p-6 rounded-sm space-y-4 hover:border-brand-terracotta transition-all">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">#{order.id.slice(0, 8)}</span>
                                                                    <h4 className="font-serif text-lg leading-tight mt-1">{order.description}</h4>
                                                                </div>
                                                                <div className="flex gap-2 items-center">
                                                                    {order.estimated_hours > 0 && (
                                                                        <span className="bg-brand-sand py-1 px-2.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-brand-charcoal inline-flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" /> {order.estimated_hours}h
                                                                        </span>
                                                                    )}
                                                                    <select 
                                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                                        className="text-[8px] uppercase tracking-widest font-bold bg-white border border-gray-200 outline-none focus:ring-0 cursor-pointer p-1.5 rounded-sm"
                                                                        value={order.status}
                                                                    >
                                                                        {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                                                        <option value="delivered">Entregado ✔</option>
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200/60 text-xs text-text-secondary">
                                                                <div>
                                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 block">Cliente</span>
                                                                    <span className="font-medium text-brand-charcoal inline-flex items-center gap-1 mt-1">
                                                                        <User className="w-3.5 h-3.5" />
                                                                        {order.customers?.full_name || 'Sin cliente'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 block">Costurera</span>
                                                                    <span className="font-medium text-brand-charcoal inline-flex items-center gap-1 mt-1">
                                                                        {order.atelier_operators ? (
                                                                            <span className="text-green-700 font-semibold">
                                                                                👤 {order.atelier_operators.name}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-red-600 font-semibold animate-pulse">
                                                                                ⚠ Sin asignar
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                {order.notes && (
                                                                    <div className="col-span-1">
                                                                        <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 block">Notas de Confección</span>
                                                                        <span className="mt-1 block italic">{order.notes}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                )}

                            </div>
                        )}

                        {/* TAB 3: COMPLETED ORDERS HISTORY */}
                        {activeTab === 'history' && (
                            <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-sm space-y-6">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                    <h2 className="font-serif text-2xl">Historial de Trabajos Realizados</h2>
                                    <span className="text-xs bg-brand-sand text-brand-charcoal px-3 py-1 font-bold uppercase tracking-wider rounded-full">
                                        Total: {filteredCompletedOrders.length} entregas exitosas
                                    </span>
                                </div>

                                {filteredCompletedOrders.length === 0 ? (
                                    <div className="text-center py-20 border-2 border-dashed border-gray-150 rounded-sm">
                                        <History className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                                        <p className="text-sm text-gray-400">No se encontraron trabajos completados e historial.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-200 text-[9px] uppercase tracking-widest font-bold text-gray-400">
                                                    <th className="py-4 px-2">ID</th>
                                                    <th className="py-4 px-2">Servicio / Costura</th>
                                                    <th className="py-4 px-2">Cliente</th>
                                                    <th className="py-4 px-2">Fecha Entrega</th>
                                                    <th className="py-4 px-2 text-right">Horas Dedicadas</th>
                                                    <th className="py-4 px-2 text-right">Estado Final</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-brand-charcoal">
                                                {filteredCompletedOrders.map(order => (
                                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-4 px-2 font-mono text-[9px] text-gray-400 font-bold">#{order.id.slice(0, 8)}</td>
                                                        <td className="py-4 px-2 font-serif text-sm font-medium">{order.description}</td>
                                                        <td className="py-4 px-2 inline-flex items-center gap-1.5 mt-2">
                                                            <User className="w-3.5 h-3.5 text-gray-400" />
                                                            {order.customers?.full_name || 'Sin cliente'}
                                                        </td>
                                                        <td className="py-4 px-2 text-gray-500">
                                                            {order.deadline ? new Date(order.deadline).toLocaleDateString('es-CL') : 'Sin fecha'}
                                                        </td>
                                                        <td className="py-4 px-2 text-right font-bold">
                                                            {order.estimated_hours || 0} hrs
                                                        </td>
                                                        <td className="py-4 px-2 text-right">
                                                            <span className="inline-flex items-center gap-1 bg-green-50 border border-green-150 text-green-700 py-1 px-2.5 rounded-full font-bold uppercase tracking-wider text-[8px]">
                                                                <CheckCircle className="w-3 h-3" /> Entregado
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Order Modal (Simplified for now) */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="font-serif text-xl">Nueva Órden de Trabajo</h2>
                            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-brand-terracotta">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 text-center">
                            <AlertCircle className="w-12 h-12 text-brand-terracotta mx-auto mb-4" />
                            <p className="text-sm text-gray-500 italic">Las órdenes de producción profesionales se generan automáticamente desde el **Punto de Venta (POS)** al concretar un presupuesto.</p>
                            <div className="flex flex-col gap-3">
                                <Link href="/admin/pos" className="bg-brand-charcoal text-white py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all">Ir al POS para crear órden</Link>
                                <button onClick={() => setIsAdding(false)} className="py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
