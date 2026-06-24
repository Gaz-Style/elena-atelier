'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Plus, Search, Calendar, Heart, Crown, GraduationCap,
    Clock, AlertCircle, CheckCircle2, Filter, Loader2, ChevronRight, Sparkles
} from 'lucide-react';
import { getBridalProjects } from './actions';

const projectTypeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    novia: { label: 'Novia', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    madrina: { label: 'Madrina', icon: Crown, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
    graduacion: { label: 'Graduación', icon: GraduationCap, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    consulta: { label: 'Consulta', color: 'text-gray-600', bg: 'bg-gray-100' },
    contrato_pendiente: { label: 'Contrato Pendiente', color: 'text-amber-700', bg: 'bg-amber-50' },
    en_proceso: { label: 'En Proceso', color: 'text-blue-700', bg: 'bg-blue-50' },
    prueba_1: { label: 'Prueba 1', color: 'text-indigo-700', bg: 'bg-indigo-50' },
    prueba_2: { label: 'Prueba 2', color: 'text-indigo-700', bg: 'bg-indigo-50' },
    prueba_final: { label: 'Prueba Final', color: 'text-purple-700', bg: 'bg-purple-50' },
    entregado: { label: 'Entregado', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    cancelado: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50' },
};

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

function getDaysUntilEvent(eventDate: string | null): { days: number; label: string; color: string } {
    if (!eventDate) return { days: -1, label: 'Sin fecha', color: 'text-gray-400' };
    const diff = Math.ceil((new Date(eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { days: diff, label: 'Evento pasado', color: 'text-gray-400' };
    if (diff <= 7) return { days: diff, label: `${diff} días`, color: 'text-red-600' };
    if (diff <= 30) return { days: diff, label: `${diff} días`, color: 'text-amber-600' };
    return { days: diff, label: `${diff} días`, color: 'text-emerald-600' };
}

function getPaymentProgress(p: any) {
    let paid = 0;
    if (p.payment_1_status === 'paid') paid++;
    if (p.payment_2_status === 'paid') paid++;
    if (p.payment_3_status === 'paid') paid++;
    return paid;
}

export default function NoviasPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        loadProjects();
    }, [filterType, filterStatus]);

    async function loadProjects() {
        setLoading(true);
        const data = await getBridalProjects({
            projectType: filterType,
            status: filterStatus,
        });
        setProjects(data);
        setLoading(false);
    }

    const filteredProjects = projects.filter(p =>
        (p.customers?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeProjects = filteredProjects.filter(p => !['entregado', 'cancelado'].includes(p.status));
    const completedProjects = filteredProjects.filter(p => ['entregado', 'cancelado'].includes(p.status));

    // Stats
    const totalActive = activeProjects.length;
    const urgentCount = activeProjects.filter(p => {
        const d = getDaysUntilEvent(p.event_date);
        return d.days >= 0 && d.days <= 14;
    }).length;
    const pendingPayments = activeProjects.filter(p => getPaymentProgress(p) < 3).length;

    return (
        <div className="min-h-screen bg-zinc-50/30 font-sans text-zinc-800 selection:bg-zinc-200/60">
            <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-zinc-200/80">
                    <div>
                        <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 font-bold hover:text-zinc-700 transition-colors mb-3">
                            <ArrowLeft className="w-3 h-3" /> Consola Principal
                        </Link>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-violet-100 border border-rose-200/50 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <h1 className="font-serif text-3xl tracking-tight text-zinc-900">Novias & Eventos Especiales</h1>
                                <p className="text-zinc-500 text-xs">Proyectos de alta costura · Novias, Madrinas y Graduaciones</p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/admin/novias/nuevo"
                        className="bg-zinc-900 hover:bg-rose-700 text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 rounded-lg shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Proyecto
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-zinc-200/80 p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold">Proyectos Activos</p>
                        <p className="text-2xl font-semibold text-zinc-800 mt-1">{totalActive}</p>
                    </div>
                    <div className="bg-white border border-zinc-200/80 p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-red-400" /> Urgentes (&lt;14 días)
                        </p>
                        <p className={`text-2xl font-semibold mt-1 ${urgentCount > 0 ? 'text-red-600' : 'text-zinc-800'}`}>{urgentCount}</p>
                    </div>
                    <div className="bg-white border border-zinc-200/80 p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold">Pagos Pendientes</p>
                        <p className="text-2xl font-semibold text-zinc-800 mt-1">{pendingPayments}</p>
                    </div>
                    <div className="bg-white border border-zinc-200/80 p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                        <p className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold">Completados</p>
                        <p className="text-2xl font-semibold text-emerald-600 mt-1">{completedProjects.length}</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Buscar por clienta o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-rose-300 outline-none bg-white"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-rose-300 outline-none"
                        >
                            <option value="all">Todos los tipos</option>
                            <option value="novia">🤍 Novias</option>
                            <option value="madrina">👑 Madrinas</option>
                            <option value="graduacion">🎓 Graduaciones</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-rose-300 outline-none"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="consulta">Consulta</option>
                            <option value="contrato_pendiente">Contrato Pendiente</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="entregado">Entregado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                </div>

                {/* Projects List */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100 border-dashed">
                        <Sparkles className="w-10 h-10 mx-auto text-zinc-300 mb-3" />
                        <p className="text-zinc-500 text-sm mb-4">No hay proyectos registrados aún.</p>
                        <Link
                            href="/admin/novias/nuevo"
                            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-rose-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Crear Primer Proyecto
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Active projects */}
                        {activeProjects.length > 0 && (
                            <>
                                <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2">
                                    <span className="w-1.5 h-3 bg-rose-400 rounded-full" /> Proyectos Activos
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {activeProjects.map(project => {
                                        const typeConfig = projectTypeConfig[project.project_type] || projectTypeConfig.novia;
                                        const status = statusConfig[project.status] || statusConfig.consulta;
                                        const countdown = getDaysUntilEvent(project.event_date);
                                        const paidCount = getPaymentProgress(project);
                                        const TypeIcon = typeConfig.icon;

                                        return (
                                            <Link
                                                key={project.id}
                                                href={`/admin/novias/${project.id}`}
                                                className="bg-white border border-zinc-200/80 rounded-xl p-5 hover:shadow-md hover:border-rose-200 transition-all group"
                                            >
                                                {/* Type badge & status */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${typeConfig.bg}`}>
                                                        <TypeIcon className={`w-3 h-3 ${typeConfig.color}`} />
                                                        <span className={typeConfig.color}>{typeConfig.label}</span>
                                                    </div>
                                                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>

                                                {/* Client name */}
                                                <h3 className="font-serif text-lg text-zinc-900 group-hover:text-rose-700 transition-colors">
                                                    {project.customers?.full_name || 'Sin asignar'}
                                                </h3>
                                                <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{project.description || 'Sin descripción'}</p>

                                                {/* Event countdown */}
                                                <div className="flex items-center gap-2 mt-4 text-xs">
                                                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span className="text-zinc-500">
                                                        {project.event_date
                                                            ? new Date(project.event_date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
                                                            : 'Sin fecha de evento'}
                                                    </span>
                                                    {countdown.days >= 0 && (
                                                        <span className={`font-bold ${countdown.color}`}>
                                                            ({countdown.label})
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Payment progress */}
                                                <div className="mt-4 pt-3 border-t border-zinc-100">
                                                    <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-2">
                                                        <span>Pagos</span>
                                                        <span>{paidCount}/3</span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3].map(i => (
                                                            <div
                                                                key={i}
                                                                className={`h-1.5 rounded-full flex-1 transition-colors ${
                                                                    (project as any)[`payment_${i}_status`] === 'paid'
                                                                        ? 'bg-emerald-400'
                                                                        : 'bg-zinc-200'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between mt-2">
                                                        <span className="text-xs text-zinc-500">{formatCurrency(project.total_amount)}</span>
                                                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-rose-400 transition-colors" />
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Completed projects */}
                        {completedProjects.length > 0 && (
                            <>
                                <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 flex items-center gap-2 mt-8">
                                    <span className="w-1.5 h-3 bg-emerald-400 rounded-full" /> Finalizados
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {completedProjects.map(project => {
                                        const typeConfig = projectTypeConfig[project.project_type] || projectTypeConfig.novia;
                                        const status = statusConfig[project.status] || statusConfig.consulta;
                                        const TypeIcon = typeConfig.icon;

                                        return (
                                            <Link
                                                key={project.id}
                                                href={`/admin/novias/${project.id}`}
                                                className="bg-white/60 border border-zinc-100 rounded-xl p-5 hover:shadow-sm transition-all opacity-70 hover:opacity-100"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                                                        <TypeIcon className="w-3 h-3" />
                                                        {typeConfig.label}
                                                    </div>
                                                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <h3 className="font-medium text-zinc-700">{project.customers?.full_name || 'Sin asignar'}</h3>
                                                <p className="text-xs text-zinc-400 mt-1">{formatCurrency(project.total_amount)}</p>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
}
