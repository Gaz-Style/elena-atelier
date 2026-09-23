'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Monitor, Clock, Calendar, Package, Search, Maximize2, Minimize2,
  RefreshCw, ChevronRight, Printer, RotateCw, Volume2, VolumeX,
  Scissors, Gift, Users, AlertTriangle, CheckCircle2, CircleDot
} from 'lucide-react';
import { getMonitorDaysData, getMonitorWorkMatrix, getMonitorTimeline } from './actions';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type ViewMode = 'operations' | 'workmatrix' | 'timeline';

type DayItem = {
  dateStr: string;
  tasksByOperator: Record<string, any[]>;
  appointments: any[];
  deliveries: any[];
};

type DaysData = {
  operators: any[];
  days: DayItem[];
  workshopStart: string;
  workshopEnd: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function dateStr(d: Date) { return d.toISOString().split('T')[0]; }

function getDaysDiff(deadline: string) {
  if (!deadline) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const end = new Date(deadline); end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago'
  });
}

function formatHour(h: number) {
  return `${Math.floor(h).toString().padStart(2, '0')}:${Math.round((h % 1) * 60).toString().padStart(2, '0')}`;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  pending: 'Pendiente',
  scheduled: 'Programado',
  cutting: 'Corte',
  sewing: 'Costura',
  finishing: 'Terminación',
  ready: 'Listo',
};

const PAYMENT_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  paid: { label: 'Pagado', bg: 'bg-emerald-500/20', text: 'text-emerald-600' },
  completed: { label: 'Pagado', bg: 'bg-emerald-500/20', text: 'text-emerald-600' },
  partial: { label: 'Abono Parcial', bg: 'bg-amber-500/20', text: 'text-amber-600' },
  pending: { label: 'Pendiente', bg: 'bg-rose-500/20', text: 'text-rose-600' },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function TallerMonitorPage() {
  const [view, setView] = useState<ViewMode>('operations');
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState<Date | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Data states
  const [dayData, setDayData] = useState<DaysData | null>(null);
  const [workMatrix, setWorkMatrix] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [workFilter, setWorkFilter] = useState<'all' | 'pending' | 'active' | 'ready'>('all');

  const todayStr = dateStr(new Date());

  // ── Clock (client-only to avoid hydration mismatch) ────────────────────────
  useEffect(() => {
    setClock(new Date());
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Load Data ──────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      const [day, matrix, tl] = await Promise.all([
        getMonitorDaysData(todayStr, dateStr(endDate)),
        getMonitorWorkMatrix(),
        getMonitorTimeline(),
      ]);
      setDayData(day);
      setWorkMatrix(matrix);
      setTimeline(tl);
    } catch (e) {
      console.error('Error loading monitor data:', e);
    }
    setLoading(false);
  }, [todayStr]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Auto-refresh every 60s ─────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  // ── Auto-rotate views ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoRotate) return;
    const views: ViewMode[] = ['operations', 'workmatrix', 'timeline'];
    const interval = setInterval(() => {
      setView(prev => {
        const idx = views.indexOf(prev);
        return views[(idx + 1) % views.length];
      });
    }, 45000);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Proximity alert chime ──────────────────────────────────────────────────
  useEffect(() => {
    if (!soundEnabled || !dayData?.days) return;
    const checkInterval = setInterval(() => {
      const now = new Date();
      const today = dateStr(now);
      const todayData = dayData.days.find(d => d.dateStr === today);
      if (!todayData) return;
      todayData.appointments.forEach((apt: any) => {
        const aptTime = new Date(apt.fecha_hora);
        const diffMin = (aptTime.getTime() - now.getTime()) / 60000;
        if (diffMin > 14 && diffMin < 16) {
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.value = 0.1;
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          } catch(e) { /* no audio context */ }
        }
      });
    }, 60000);
    return () => clearInterval(checkInterval);
  }, [soundEnabled, dayData]);

  // ── Counters ───────────────────────────────────────────────────────────────
  const taskCount = dayData?.days?.reduce((sum, d) => sum + Object.values(d.tasksByOperator).reduce((s, tasks) => s + tasks.length, 0), 0) || 0;
  const appointmentCount = dayData?.days?.reduce((sum, d) => sum + d.appointments.length, 0) || 0;
  const deliveryCount = dayData?.days?.reduce((sum, d) => sum + d.deliveries.length, 0) || 0;

  // ── Filtered work matrix ───────────────────────────────────────────────────
  const filteredMatrix = useMemo(() => {
    let list = workMatrix;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(o =>
        o.customerName.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
      );
    }
    if (workFilter === 'pending') list = list.filter(o => o.status === 'draft');
    if (workFilter === 'active') list = list.filter(o => ['cutting', 'sewing', 'finishing'].includes(o.status));
    if (workFilter === 'ready') list = list.filter(o => o.status === 'ready');
    return list;
  }, [workMatrix, searchQuery, workFilter]);

  // ── Filtered timeline ──────────────────────────────────────────────────────
  const [timelineFilter, setTimelineFilter] = useState<'upcoming' | 'pruebas' | 'entregas' | 'all'>('upcoming');

  const filteredTimeline = useMemo(() => {
    let list = timeline;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.customerName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (timelineFilter === 'pruebas') {
      list = list.filter(p => p.events.some((e: any) => e.type === 'prueba'));
    }
    if (timelineFilter === 'entregas') {
      list = list.filter(p => p.events.some((e: any) => e.type === 'entrega'));
    }
    // For 'upcoming', we sort by next event date (already sorted in server action)
    return list;
  }, [timeline, searchQuery, timelineFilter]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-gray-50 text-gray-800 font-sans flex flex-col overflow-hidden select-none">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header className="shrink-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">

        {/* Left: Clock + Date */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-2xl font-mono font-bold text-gray-900 tracking-wider tabular-nums">
              {clock ? clock.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {clock ? clock.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">EN VIVO</span>
          </div>
        </div>

        {/* Center: Summary badges */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white shadow-sm px-3 py-1.5 rounded-lg border border-gray-200">
            <Scissors className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-bold text-gray-900">{taskCount}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Tareas</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white shadow-sm px-3 py-1.5 rounded-lg border border-gray-200">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-bold text-gray-900">{appointmentCount}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Citas</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white shadow-sm px-3 py-1.5 rounded-lg border border-gray-200">
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-bold text-gray-900">{deliveryCount}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Retiros</span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* View Tabs */}
          <div className="flex bg-white shadow-sm p-0.5 rounded-lg border border-gray-200">
            {([
              { key: 'operations', icon: Monitor, label: 'Operación Hoy' },
              { key: 'workmatrix', icon: Package, label: 'Trabajos y Pagos' },
              { key: 'timeline', icon: Calendar, label: 'Citas y Entregas' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                  view === tab.key
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center bg-white shadow-sm border border-gray-200 rounded-lg px-2.5 py-1.5 gap-1.5">
            <Search className="w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none w-28"
            />
          </div>

          {/* Auto-rotate */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg border transition-all ${autoRotate ? 'bg-amber-500/20 border-amber-500/50 text-amber-600' : 'bg-white shadow-sm border-gray-200 text-gray-500 hover:text-gray-900'}`}
            title="Auto-rotación de vistas"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={autoRotate ? { animationDuration: '3s' } : {}} />
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition-all ${soundEnabled ? 'bg-blue-500/20 border-blue-500/50 text-blue-600' : 'bg-white shadow-sm border-gray-200 text-gray-500 hover:text-gray-900'}`}
            title="Alerta sonora para citas"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Refresh */}
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 transition-all"
            title="Recargar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="hidden md:block p-1.5 rounded-lg bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 transition-all"
            title="Imprimir hoja de ruta"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 transition-all"
            title="Pantalla completa"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* ── BODY ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden">
        {loading && !dayData ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Cargando Monitor del Taller...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── VISTA 1: OPERACIÓN DIARIA ──────────────────────── */}
            {view === 'operations' && dayData && (
              <div className="h-full overflow-auto bg-gray-100 flex flex-col gap-6 p-4">
                {dayData.days.map((day: any) => {
                  const dObj = new Date(day.dateStr + 'T12:00:00');
                  const dayName = dObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
                  const isToday = day.dateStr === todayStr;

                  return (
                    <div key={day.dateStr} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col shrink-0 min-h-[60vh] max-h-[80vh]">
                      <div className={`shrink-0 px-4 py-2 border-b font-bold uppercase tracking-widest text-xs flex items-center justify-between ${isToday ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        <span>{dayName}</span>
                        {isToday && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[10px]">HOY</span>}
                      </div>
                      <div className="flex-1 flex overflow-hidden">
                        {/* Left: Seamstress columns (70%) */}
                        <div className="flex-1 overflow-auto p-4 flex gap-4">
                          {dayData.operators.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Sin costureras activas</p>
                            </div>
                          ) : (
                            dayData.operators.map((op: any) => {
                              const tasks = day.tasksByOperator[op.id] || [];
                              const totalHours = tasks.reduce((sum: number, t: any) => sum + Number(t.duration_hours || 0), 0);
        
                              return (
                                <div key={op.id} className="flex-1 min-w-[240px] max-w-[400px] flex flex-col">
                                  {/* Operator Header */}
                                  <div className="bg-white shadow-sm rounded-t-xl border border-gray-200 border-b-0 px-4 py-3">
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-bold text-base text-gray-900">{op.name}</h3>
                                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {totalHours}h / {op.daily_hours_capacity || 8}h
                                      </span>
                                    </div>
                                    {/* Mini progress bar */}
                                    <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${totalHours > (op.daily_hours_capacity || 8) ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(100, (totalHours / (op.daily_hours_capacity || 8)) * 100)}%` }}
                                      />
                                    </div>
                                  </div>
        
                                  {/* Tasks list */}
                                  <div className="flex-1 bg-white rounded-b-xl border border-gray-200 border-t-0 overflow-auto p-3 space-y-2">
                                    {tasks.length === 0 ? (
                                      <div className="h-full flex items-center justify-center">
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Sin tareas este día</p>
                                      </div>
                                    ) : (
                                      tasks.map((task: any) => {
                                        const startH = task.start_hour || 9;
                                        const endH = startH + (Number(task.duration_hours) || 1);
                                        const isCostura = task.task_type === 'costura';
                                        const isCita = task.task_type === 'cita';
                                        const isEntrega = task.task_type === 'entrega';
        
                                        return (
                                          <div
                                            key={task.id}
                                            className={`rounded-lg p-3 border transition-all ${
                                              isCita
                                                ? 'bg-blue-500/10 border-blue-500/30'
                                                : isEntrega
                                                  ? 'bg-amber-500/10 border-amber-500/30'
                                                  : 'bg-gray-50 border-gray-200'
                                            }`}
                                          >
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex-1 min-w-0">
                                                <p className={`font-bold text-sm truncate ${isCita ? 'text-blue-700' : isEntrega ? 'text-amber-700' : 'text-gray-900'}`}>
                                                  {task.description}
                                                </p>
                                                <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                                                  ⏱ {formatHour(startH)} — {formatHour(endH)} ({task.duration_hours || 1}h)
                                                </p>
                                              </div>
                                              <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                                isCita ? 'bg-blue-500/20 text-blue-600' : isEntrega ? 'bg-amber-500/20 text-amber-600' : 'bg-gray-100 text-gray-500'
                                              }`}>
                                                {isCita ? '📅 Cita' : isEntrega ? '🎁 Entrega' : '✂️ Costura'}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Right: Appointments + Deliveries (30%) */}
                        <aside className="w-[340px] shrink-0 border-l border-gray-200 flex flex-col overflow-hidden">
                          {/* Appointments section */}
                          <div className="flex-1 overflow-auto border-b border-gray-200">
                            <div className="sticky top-0 bg-gray-50 z-10 px-4 py-3 border-b border-gray-200">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Citas y Pruebas
                                <span className="ml-auto bg-blue-500/20 px-2 py-0.5 rounded-full text-[10px]">{day.appointments.length}</span>
                              </h3>
                            </div>
                            <div className="p-3 space-y-2">
                              {day.appointments.length === 0 ? (
                                <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest py-8">Sin citas este día</p>
                              ) : (
                                day.appointments.map((apt: any) => {
                                  const aptTime = new Date(apt.fecha_hora);
                                  const now = new Date();
                                  const diffMin = (aptTime.getTime() - now.getTime()) / 60000;
                                  const isImminent = isToday && diffMin > 0 && diffMin < 30;
                                  const isPast = isToday && diffMin < 0;
        
                                  return (
                                    <div
                                      key={apt.id}
                                      className={`rounded-lg p-3 border transition-all ${
                                        isImminent
                                          ? 'bg-blue-500/15 border-blue-400/50 animate-pulse'
                                          : isPast
                                            ? 'bg-white border-gray-200 opacity-60'
                                            : 'bg-blue-500/5 border-blue-500/20'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono font-bold text-blue-600">
                                          {formatTime(apt.fecha_hora)}
                                        </span>
                                        {isImminent && (
                                          <span className="text-[8px] bg-blue-500 text-gray-900 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full animate-bounce">
                                            Próxima
                                          </span>
                                        )}
                                        {isPast && (
                                          <span className="text-[8px] bg-gray-300 text-gray-700 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                                            Pasada
                                          </span>
                                        )}
                                      </div>
                                      <p className="font-bold text-sm text-gray-900 truncate">{apt.nombre}</p>
                                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                        {apt.tipo === 'prueba' ? '👗 ' : '📅 '}{apt.notas}
                                      </p>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
        
                          {/* Deliveries section */}
                          <div className="flex-1 overflow-auto">
                            <div className="sticky top-0 bg-gray-50 z-10 px-4 py-3 border-b border-gray-200">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
                                <Gift className="w-3.5 h-3.5" /> Retiros del Taller
                                <span className="ml-auto bg-amber-500/20 px-2 py-0.5 rounded-full text-[10px]">{day.deliveries.length}</span>
                              </h3>
                            </div>
                            <div className="p-3 space-y-2">
                              {day.deliveries.length === 0 ? (
                                <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest py-8">Sin retiros este día</p>
                              ) : (
                                day.deliveries.map((del: any) => {
                                  const allReady = del.statuses.every((s: string) => s === 'ready');
                                  return (
                                    <div
                                      key={del.id}
                                      className={`rounded-lg p-3 border ${allReady ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono font-bold text-amber-600">
                                          {formatTime(del.deadline)}
                                        </span>
                                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                          allReady ? 'bg-emerald-500 text-gray-900' : 'bg-amber-500/30 text-amber-600'
                                        }`}>
                                          {allReady ? '✓ Listo' : '⏳ En Proceso'}
                                        </span>
                                      </div>
                                      <p className="font-bold text-sm text-gray-900 truncate">{del.customer_name}</p>
                                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                        📦 {del.descriptions.join(', ') || 'Prenda'}
                                      </p>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </aside>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── VISTA 2: MATRIZ DE TRABAJOS Y PAGOS ────────────────── */}
            {view === 'workmatrix' && (
              <div className="h-full flex flex-col overflow-hidden">
                {/* Filter tabs */}
                <div className="shrink-0 px-4 py-3 border-b border-gray-200 flex items-center gap-2 flex-wrap">
                  {([
                    { key: 'all', label: '✓ Todos', count: workMatrix.length },
                    { key: 'pending', label: '⚠️ Por Planificar', count: workMatrix.filter(o => o.status === 'draft').length },
                    { key: 'active', label: '✂️ En Desarrollo', count: workMatrix.filter(o => ['cutting', 'sewing', 'finishing'].includes(o.status)).length },
                    { key: 'ready', label: '📦 Listos', count: workMatrix.filter(o => o.status === 'ready').length },
                  ] as const).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setWorkFilter(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        workFilter === tab.key
                          ? 'bg-white border-gray-300 text-gray-900 shadow-sm ring-1 ring-gray-200/50'
                          : 'bg-gray-50 shadow-sm border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${workFilter === tab.key ? 'bg-gray-200 text-gray-900' : 'bg-gray-200 text-gray-500'}`}>{tab.count}</span>
                    </button>
                  ))}
                </div>

                {/* Table header */}
                <div className="shrink-0 grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <div className="col-span-3">Cliente y Prenda</div>
                  <div className="col-span-2">Estado</div>
                  <div className="col-span-3">Avance Costura</div>
                  <div className="col-span-2">Estado Pago</div>
                  <div className="col-span-2 text-right">Fecha Entrega</div>
                </div>

                {/* Rows */}
                <div className="flex-1 overflow-auto">
                  {filteredMatrix.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No se encontraron trabajos</p>
                    </div>
                  ) : (
                    filteredMatrix.map((order: any) => {
                      const daysDiff = getDaysDiff(order.deadline);
                      const payment = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.pending;
                      const isUrgent = daysDiff !== null && daysDiff <= 2;
                      const isWarning = daysDiff !== null && daysDiff <= 7 && daysDiff > 2;

                      return (
                        <div
                          key={order.id}
                          className={`grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-200 hover:bg-white transition-colors items-center ${
                            isUrgent ? 'bg-rose-50' : ''
                          }`}
                        >
                          {/* Client + Description */}
                          <div className="col-span-3">
                            <p className="font-bold text-sm text-gray-900 truncate">{order.customerName}</p>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">{order.description}</p>
                          </div>

                          {/* Status */}
                          <div className="col-span-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                              order.status === 'ready' ? 'bg-emerald-500/20 text-emerald-600' :
                              order.status === 'draft' ? 'bg-gray-100 text-gray-500' :
                              'bg-blue-500/20 text-blue-600'
                            }`}>
                              {STATUS_LABELS[order.status] || order.status}
                            </span>
                          </div>

                          {/* Progress */}
                          <div className="col-span-3 flex items-center gap-3">
                            <div className="flex-1">
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    order.progressPercent === 100 ? 'bg-emerald-500' :
                                    order.progressPercent > 0 ? 'bg-amber-500' : 'bg-gray-300'
                                  }`}
                                  style={{ width: `${order.progressPercent}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1 font-mono">
                                {order.scheduledHours}h / {order.estimatedHours}h
                              </p>
                            </div>
                            <span className={`text-xs font-bold shrink-0 ${
                              order.progressPercent === 100 ? 'text-emerald-600' :
                              order.progressPercent > 0 ? 'text-amber-600' : 'text-gray-400'
                            }`}>
                              {order.progressPercent}%
                            </span>
                          </div>

                          {/* Payment */}
                          <div className="col-span-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${payment.bg} ${payment.text}`}>
                              {payment.label}
                            </span>
                            {order.totalAmount > 0 && order.paymentStatus !== 'paid' && order.paymentStatus !== 'completed' && (
                              <p className="text-[9px] text-gray-500 mt-1 font-mono">
                                ${(order.totalAmount - order.paidAmount).toLocaleString('es-CL')} pendiente
                              </p>
                            )}
                          </div>

                          {/* Deadline */}
                          <div className="col-span-2 text-right">
                            {order.deadline ? (
                              <>
                                <p className={`text-xs font-bold ${
                                  isUrgent ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-gray-700'
                                }`}>
                                  {new Date(order.deadline).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                                </p>
                                <p className={`text-[10px] font-bold mt-0.5 ${
                                  isUrgent ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-gray-500'
                                }`}>
                                  {daysDiff !== null && (
                                    daysDiff === 0 ? '¡HOY!' :
                                    daysDiff < 0 ? `¡Hace ${Math.abs(daysDiff)}d!` :
                                    `En ${daysDiff} días`
                                  )}
                                </p>
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-400">Sin fecha</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ── VISTA 3: CRONOGRAMA DE CITAS Y ENTREGAS ────────────── */}
            {view === 'timeline' && (
              <div className="h-full flex flex-col overflow-hidden">
                {/* Filter tabs */}
                <div className="shrink-0 px-4 py-3 border-b border-gray-200 flex items-center gap-2 flex-wrap">
                  {([
                    { key: 'upcoming', label: '📌 Próximos' },
                    { key: 'pruebas', label: '👗 Solo Pruebas' },
                    { key: 'entregas', label: '🎁 Solo Entregas' },
                    { key: 'all', label: '📜 Todo' },
                  ] as const).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setTimelineFilter(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        timelineFilter === tab.key
                          ? 'bg-white border-gray-300 text-gray-900 shadow-sm ring-1 ring-gray-200/50'
                          : 'bg-gray-50 shadow-sm border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Timeline list */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {filteredTimeline.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Sin proyectos con citas o entregas programadas</p>
                    </div>
                  ) : (
                    filteredTimeline.map((project: any) => (
                      <div key={project.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Project header */}
                        <div className="px-4 py-3 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-gray-900 truncate">{project.customerName}</h3>
                              {project.nextEvent && (
                                <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600">
                                  Próx: {new Date(project.nextEvent.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">{project.description}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-3">
                            {project.deadline && (
                              <div className="text-right">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Entrega</p>
                                <p className={`text-xs font-bold ${
                                  getDaysDiff(project.deadline) !== null && getDaysDiff(project.deadline)! <= 7 ? 'text-rose-600' : 'text-gray-700'
                                }`}>
                                  {new Date(project.deadline).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Events timeline */}
                        <div className="px-4 py-3">
                          {project.events.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic">Sin eventos programados</p>
                          ) : (
                            <div className="relative pl-6">
                              {/* Vertical line */}
                              <div className="absolute left-2 top-1 bottom-1 w-px bg-gray-100" />

                              {project.events.map((event: any, idx: number) => {
                                const isCompleted = event.status === 'completed';
                                const isReady = event.status === 'ready';
                                const isPast = new Date(event.date) < new Date();
                                const daysDiff = getDaysDiff(event.date);

                                return (
                                  <div key={`${event.id}-${idx}`} className="relative mb-3 last:mb-0">
                                    {/* Dot on the line */}
                                    <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full flex items-center justify-center ${
                                      isCompleted || isReady
                                        ? 'bg-emerald-500'
                                        : event.type === 'entrega'
                                          ? 'bg-amber-500'
                                          : event.type === 'prueba'
                                            ? 'bg-blue-500'
                                            : 'bg-gray-300'
                                    }`}>
                                      {isCompleted || isReady ? (
                                        <CheckCircle2 className="w-2.5 h-2.5 text-gray-900" />
                                      ) : (
                                        <CircleDot className="w-2.5 h-2.5 text-gray-900" />
                                      )}
                                    </div>

                                    {/* Event content */}
                                    <div className={`rounded-lg px-3 py-2 border ${
                                      isCompleted || isReady
                                        ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70'
                                        : event.type === 'entrega'
                                          ? 'bg-amber-500/5 border-amber-500/20'
                                          : event.type === 'prueba'
                                            ? 'bg-blue-500/5 border-blue-500/20'
                                            : 'bg-white border-gray-200'
                                    }`}>
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                            event.type === 'entrega' ? 'bg-amber-500/20 text-amber-600' :
                                            event.type === 'prueba' ? 'bg-blue-500/20 text-blue-600' :
                                            'bg-gray-100 text-gray-500'
                                          }`}>
                                            {event.type === 'entrega' ? '🎁 Entrega' : event.type === 'prueba' ? '👗 Prueba' : '📅 Cita'}
                                          </span>
                                          <p className="text-xs font-bold text-gray-900 truncate">{event.title}</p>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-2">
                                          {isCompleted ? (
                                            <span className="text-[9px] font-bold text-emerald-600">✓ Realizada</span>
                                          ) : (
                                            <>
                                              <span className={`text-[11px] font-mono font-bold ${
                                                daysDiff !== null && daysDiff <= 2 ? 'text-rose-600' :
                                                daysDiff !== null && daysDiff <= 7 ? 'text-amber-600' : 'text-gray-500'
                                              }`}>
                                                {new Date(event.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                                              </span>
                                              {event.date && (
                                                <span className="text-[10px] font-mono text-gray-500">
                                                  {formatTime(event.date)}
                                                </span>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── PRINT STYLES ──────────────────────────────────────────── */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          header, aside, button { display: none !important; }
          main { overflow: visible !important; height: auto !important; }
          .bg-\\[\\#0f172a\\] { background: white !important; color: black !important; }
          .bg-slate-800\\/30, .bg-slate-800\\/60, .bg-slate-800\\/50 { background: #f8fafc !important; }
          .text-gray-900, .text-gray-800, .text-gray-700 { color: #1e293b !important; }
          .text-gray-500, .text-gray-500 { color: #64748b !important; }
          .border-slate-700\\/50, .border-slate-700\\/30 { border-color: #e2e8f0 !important; }
        }
      `}</style>
    </div>
  );
}
