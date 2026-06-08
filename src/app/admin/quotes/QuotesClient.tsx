'use client';

import React, { useState, useTransition } from 'react';
import { updateBudgetStatusAction } from '@/app/admin/pos/actions';
import { Clock, CheckCircle2, XCircle, Copy, ExternalLink, RefreshCw, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Budget = {
    id: string;
    status: string;
    customer_name: string | null;
    customer_email: string | null;
    total_amount: number;
    created_at: string;
    updated_at: string | null;
    payload: any;
};

type TabFilter = 'all' | 'pending' | 'accepted' | 'expired';

const STATUS_CONFIG = {
    pending: {
        label: 'Pendiente',
        icon: Clock,
        pill: 'bg-amber-50 text-amber-700 border border-amber-200',
        dot: 'bg-amber-400',
    },
    accepted: {
        label: 'Aceptado',
        icon: CheckCircle2,
        pill: 'bg-green-50 text-green-700 border border-green-200',
        dot: 'bg-green-500',
    },
    expired: {
        label: 'Expirado',
        icon: XCircle,
        pill: 'bg-gray-100 text-gray-500 border border-gray-200',
        dot: 'bg-gray-400',
    },
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-CL', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function daysSince(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function QuotesClient({ budgets }: { budgets: Budget[] }) {
    const [activeTab, setActiveTab] = useState<TabFilter>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const router = useRouter();

    const filtered = activeTab === 'all' ? budgets : budgets.filter(b => b.status === activeTab);

    const counts = {
        all: budgets.length,
        pending: budgets.filter(b => b.status === 'pending').length,
        accepted: budgets.filter(b => b.status === 'accepted').length,
        expired: budgets.filter(b => b.status === 'expired').length,
    };

    const totalPendingValue = budgets
        .filter(b => b.status === 'pending')
        .reduce((acc, b) => acc + (b.total_amount || 0), 0);
    const totalAcceptedValue = budgets
        .filter(b => b.status === 'accepted')
        .reduce((acc, b) => acc + (b.total_amount || 0), 0);

    const copyLink = (id: string) => {
        const baseUrl = window.location.origin.includes('localhost') ? 'https://elenalacosturera.cl' : window.location.origin;
        const link = `${baseUrl}/presupuesto?id=${id}`;
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const updateStatus = async (id: string, status: 'pending' | 'accepted' | 'expired') => {
        setActionLoading(id + status);
        startTransition(async () => {
            const res = await updateBudgetStatusAction(id, status);
            if (res && !res.success) {
                alert("Error al actualizar el estado: " + res.error);
            }
            setActionLoading(null);
            router.refresh();
        });
    };

    const tabs: { key: TabFilter; label: string }[] = [
        { key: 'all', label: 'Todos' },
        { key: 'pending', label: 'Pendientes' },
        { key: 'accepted', label: 'Aceptados' },
        { key: 'expired', label: 'Expirados' },
    ];

    return (
        <div className="space-y-8">
            {/* KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">En Espera</p>
                        <p className="font-serif text-2xl text-brand-charcoal">{formatCurrency(totalPendingValue)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{counts.pending} presupuesto{counts.pending !== 1 ? 's' : ''} activos</p>
                    </div>
                </div>
                <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Convertidos</p>
                        <p className="font-serif text-2xl text-brand-charcoal">{formatCurrency(totalAcceptedValue)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{counts.accepted} presupuesto{counts.accepted !== 1 ? 's' : ''} aceptados</p>
                    </div>
                </div>
                <div className="bg-brand-charcoal rounded-sm border border-gray-800 shadow-sm p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-brand-sand" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-brand-sand/60 font-bold">Total Emitido</p>
                        <p className="font-serif text-2xl text-white">{formatCurrency(budgets.reduce((s, b) => s + (b.total_amount || 0), 0))}</p>
                        <p className="text-xs text-brand-sand/50 mt-0.5">{budgets.length} cotizaciones totales</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-shrink-0 px-6 py-4 text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-2 border-b-2 ${
                                activeTab === tab.key
                                    ? 'border-brand-terracotta text-brand-terracotta'
                                    : 'border-transparent text-gray-400 hover:text-brand-charcoal'
                            }`}
                        >
                            {tab.label}
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                activeTab === tab.key ? 'bg-brand-terracotta text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {counts[tab.key]}
                            </span>
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="py-24 text-center text-gray-400">
                        <FileText className="w-10 h-10 mx-auto mb-4 opacity-30" />
                        <p className="text-sm uppercase tracking-widest font-bold">Sin presupuestos en esta categoría</p>
                        <Link href="/admin/pos" className="inline-flex items-center gap-2 mt-6 text-[10px] uppercase tracking-widest font-bold text-brand-terracotta hover:text-brand-charcoal transition-colors">
                            Crear Nuevo Presupuesto <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[720px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                                    <th className="p-4">ID / Código</th>
                                    <th className="p-4">Clienta</th>
                                    <th className="p-4">Servicios</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Fecha / Antigüedad</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((budget) => {
                                    const cfg = STATUS_CONFIG[budget.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                                    const StatusIcon = cfg.icon;
                                    const days = daysSince(budget.created_at);
                                    const items: any[] = budget.payload?.cart || [];

                                    return (
                                        <tr key={budget.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <span className="font-mono text-sm font-bold text-brand-charcoal tracking-widest">
                                                    #{budget.id}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-serif text-base text-brand-charcoal">
                                                    {budget.customer_name || 'Sin nombre'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {budget.customer_email || '—'}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-0.5">
                                                    {items.slice(0, 2).map((item: any, i: number) => (
                                                        <p key={i} className="text-xs text-gray-600 truncate max-w-[180px]">
                                                            · {item.name}
                                                        </p>
                                                    ))}
                                                    {items.length > 2 && (
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                                                            +{items.length - 2} más
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-serif text-lg font-bold text-brand-charcoal">
                                                    {formatCurrency(budget.total_amount)}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-gray-600">{formatDate(budget.created_at)}</p>
                                                <p className={`text-[10px] font-bold mt-0.5 ${days > 15 ? 'text-red-500' : days > 7 ? 'text-amber-500' : 'text-green-600'}`}>
                                                    hace {days} día{days !== 1 ? 's' : ''}
                                                    {days > 15 && budget.status === 'pending' && ' · ¡Expirado!'}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${cfg.pill}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                                    {/* Copy Link */}
                                                    <button
                                                        onClick={() => copyLink(budget.id)}
                                                        title="Copiar link del presupuesto"
                                                        className={`p-2 rounded-sm border transition-colors text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider ${
                                                            copiedId === budget.id
                                                                ? 'bg-green-50 border-green-200 text-green-600'
                                                                : 'bg-white border-gray-200 text-gray-500 hover:border-brand-terracotta hover:text-brand-terracotta'
                                                        }`}
                                                    >
                                                        {copiedId === budget.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                        <span className="hidden md:inline">{copiedId === budget.id ? '¡Copiado!' : 'Copiar Link'}</span>
                                                    </button>

                                                    {/* View in new tab */}
                                                    <a
                                                        href={`/presupuesto?id=${budget.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Ver presupuesto como la clienta"
                                                        className="p-2 rounded-sm border border-gray-200 bg-white text-gray-500 hover:border-brand-charcoal hover:text-brand-charcoal transition-colors"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>

                                                    {/* Mark as accepted (if still pending) */}
                                                    {budget.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateStatus(budget.id, 'accepted')}
                                                            disabled={actionLoading === budget.id + 'accepted'}
                                                            className="p-2 rounded-sm border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                                                            title="Marcar como aceptado (cliente pagó presencialmente)"
                                                        >
                                                            {actionLoading === budget.id + 'accepted'
                                                                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                                : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                            <span className="hidden md:inline">Aceptar</span>
                                                        </button>
                                                    )}

                                                    {/* Mark as expired (if pending) */}
                                                    {budget.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateStatus(budget.id, 'expired')}
                                                            disabled={actionLoading === budget.id + 'expired'}
                                                            className="p-2 rounded-sm border border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:text-red-500 transition-colors text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                                                            title="Marcar como expirado"
                                                        >
                                                            {actionLoading === budget.id + 'expired'
                                                                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                                : <XCircle className="w-3.5 h-3.5" />}
                                                        </button>
                                                    )}

                                                    {/* Reactivate if expired */}
                                                    {budget.status === 'expired' && (
                                                        <button
                                                            onClick={() => updateStatus(budget.id, 'pending')}
                                                            disabled={actionLoading === budget.id + 'pending'}
                                                            className="p-2 rounded-sm border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                                                            title="Reactivar presupuesto"
                                                        >
                                                            {actionLoading === budget.id + 'pending'
                                                                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                                : <RefreshCw className="w-3.5 h-3.5" />}
                                                            <span className="hidden md:inline">Reactivar</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
