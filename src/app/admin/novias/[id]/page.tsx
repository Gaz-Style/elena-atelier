'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Heart, Crown, GraduationCap, Calendar, DollarSign, CheckCircle2,
    Clock, AlertCircle, FileText, Ruler, Camera, StickyNote, Loader2, Printer,
    ChevronDown, ChevronUp, X, Save, Trash2
} from 'lucide-react';
import { getBridalProjectById, registerPayment, completeMilestone, acceptContract, saveMeasurements, updateBridalProject, cancelProject, sendBridalWelcomeEmailAction, deleteBridalProjectAction } from '../actions';
import ContractTemplate from '../ContractTemplate';

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateLong = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const projectTypeConfig: Record<string, { label: string; icon: any; color: string; gradient: string }> = {
    novia: { label: 'Novia', icon: Heart, color: 'text-rose-600', gradient: 'from-rose-500 to-pink-500' },
    madrina: { label: 'Madrina', icon: Crown, color: 'text-violet-600', gradient: 'from-violet-500 to-purple-500' },
    graduacion: { label: 'Graduación', icon: GraduationCap, color: 'text-sky-600', gradient: 'from-sky-500 to-blue-500' },
};

const serviceTypeLabel: Record<string, string> = {
    modificacion_tienda: 'Modificación de vestido de tienda',
    vestido_propio: 'Ajuste de vestido propio',
    bespoke: 'Confección a medida (Bespoke)',
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    consulta: { label: 'Consulta', color: 'text-gray-700', bg: 'bg-gray-100' },
    contrato_pendiente: { label: 'Contrato Pendiente', color: 'text-amber-700', bg: 'bg-amber-50 border border-amber-200' },
    en_proceso: { label: 'En Proceso', color: 'text-blue-700', bg: 'bg-blue-50 border border-blue-200' },
    prueba_1: { label: 'Prueba 1', color: 'text-indigo-700', bg: 'bg-indigo-50' },
    prueba_2: { label: 'Prueba 2', color: 'text-indigo-700', bg: 'bg-indigo-50' },
    prueba_final: { label: 'Prueba Final', color: 'text-purple-700', bg: 'bg-purple-50' },
    entregado: { label: 'Entregado ✓', color: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-200' },
    cancelado: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50' },
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'timeline' | 'payments' | 'measurements' | 'contract' | 'notes'>('timeline');
    const [showMeasurementForm, setShowMeasurementForm] = useState(false);
    const [showContractPrint, setShowContractPrint] = useState(false);
    const [saving, setSaving] = useState(false);
    const [projectId, setProjectId] = useState('');
    const contractRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        params.then(p => {
            setProjectId(p.id);
            loadProject(p.id);
        });
    }, [params]);

    async function loadProject(id: string) {
        setLoading(true);
        const data = await getBridalProjectById(id);
        setProject(data);
        setLoading(false);
    }

    async function handleRegisterPayment(paymentNum: 1 | 2 | 3) {
        const method = prompt(`¿Confirmar registro de Cuota ${paymentNum}? Ingrese el método de pago (ej: Transferencia, Efectivo, Tarjeta):`, "Transferencia");
        if (method === null) return;
        setSaving(true);
        await registerPayment(projectId, paymentNum, method);
        await loadProject(projectId);
        setSaving(false);
    }

    async function handleCompleteMilestone(milestoneId: string) {
        if (!confirm('¿Marcar este hito como completado?')) return;
        setSaving(true);
        await completeMilestone(milestoneId, projectId);
        await loadProject(projectId);
        setSaving(false);
    }

    async function handleAcceptContract() {
        if (!confirm('¿Marcar el contrato como aceptado por la clienta?')) return;
        setSaving(true);
        await acceptContract(projectId);
        await loadProject(projectId);
        setSaving(false);
    }

    async function handleSaveMeasurements(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData(e.currentTarget);
        formData.set('project_id', projectId);
        await saveMeasurements(formData);
        await loadProject(projectId);
        setShowMeasurementForm(false);
        setSaving(false);
    }

    async function handleSaveNotes() {
        setSaving(true);
        const formData = new FormData();
        formData.set('internal_notes', project.internal_notes || '');
        formData.set('materials_notes', project.materials_notes || '');
        await updateBridalProject(projectId, formData);
        await loadProject(projectId);
        setSaving(false);
    }

    async function handleCancel() {
        if (!confirm('¿Estás segura de cancelar este proyecto? Esta acción no se puede deshacer.')) return;
        setSaving(true);
        await cancelProject(projectId);
        router.push('/admin/novias');
    }

    async function handleDelete() {
        if (!confirm('¿Estás segura de ELIMINAR COMPLETAMENTE este proyecto? Esta acción borrará el proyecto de la base de datos y NO se puede deshacer.')) return;
        setSaving(true);
        const res = await deleteBridalProjectAction(projectId);
        if (!res.success) {
            alert('Error al eliminar: ' + res.error);
            setSaving(false);
        } else {
            router.push('/admin/novias');
        }
    }

    async function handleSendWelcomeEmail() {
        if (!confirm('¿Enviar correo de bienvenida a la clienta para que complete sus datos?')) return;
        setSaving(true);
        const res = await sendBridalWelcomeEmailAction(projectId);
        if (!res.success) {
            alert('Error al enviar correo: ' + res.error);
        } else {
            alert('Correo enviado exitosamente.');
        }
        await loadProject(projectId);
        setSaving(false);
    }

    function handlePrintContract() {
        setShowContractPrint(true);
        setTimeout(() => {
            window.print();
        }, 500);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50/30 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-zinc-50/30 flex items-center justify-center flex-col gap-4">
                <p className="text-zinc-500">Proyecto no encontrado</p>
                <Link href="/admin/novias" className="text-rose-500 hover:underline text-sm">Volver</Link>
            </div>
        );
    }

    const typeConfig = projectTypeConfig[project.project_type] || projectTypeConfig.novia;
    const status = statusConfig[project.status] || statusConfig.consulta;
    const TypeIcon = typeConfig.icon;
    const paidCount = [project.payment_1_status, project.payment_2_status, project.payment_3_status].filter(s => s === 'paid').length;
    const paidAmount = (project.payment_1_status === 'paid' ? project.payment_1_amount : 0) +
                       (project.payment_2_status === 'paid' ? project.payment_2_amount : 0) +
                       (project.payment_3_status === 'paid' ? project.payment_3_amount : 0);

    const daysUntilEvent = project.event_date
        ? Math.ceil((new Date(project.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    const contractData = {
        customerName: project.customers?.full_name || '',
        customerRut: project.customers?.rut || '',
        customerPhone: project.customers?.phone || '',
        customerEmail: project.customers?.email || '',
        projectType: project.project_type,
        serviceType: project.service_type,
        description: project.description || '',
        eventDate: project.event_date || '',
        eventVenue: project.event_venue || '',
        totalAmount: project.total_amount,
        payment1: project.payment_1_amount,
        payment2: project.payment_2_amount,
        payment3: project.payment_3_amount,
        milestones: (project.milestones || []).map((m: any) => ({ title: m.title, scheduledDate: m.scheduled_date })),
        contractNotes: project.contract_notes || '',
        materialsNotes: project.materials_notes || '',
    };

    const measurementLabels: Record<string, string> = {
        bust: 'Busto', waist: 'Cintura', hips: 'Cadera', full_length: 'Largo Total',
        shoulder_width: 'Hombros', arm_circumference: 'Contorno Brazo', sleeve_length: 'Largo Manga',
        back_length: 'Largo Espalda', neckline_depth: 'Prof. Escote'
    };

    return (
        <>
            {/* Print-only contract view */}
            {showContractPrint && (
                <div className="fixed inset-0 bg-white z-50 overflow-auto print:static print:z-auto p-8">
                    <button onClick={() => setShowContractPrint(false)} className="print:hidden fixed top-4 right-4 bg-zinc-800 text-white p-2 rounded-full z-50">
                        <X className="w-5 h-5" />
                    </button>
                    <div ref={contractRef}>
                        <ContractTemplate data={contractData} />
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-zinc-50/30 font-sans text-zinc-800 print:hidden">
                <main className="max-w-6xl mx-auto px-6 md:px-8 py-8 space-y-8">

                    {/* Header */}
                    <div>
                        <Link href="/admin/novias" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 font-bold hover:text-zinc-700 transition-colors mb-4">
                            <ArrowLeft className="w-3 h-3" /> Proyectos Especiales
                        </Link>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${typeConfig.gradient} flex items-center justify-center shadow-lg`}>
                                    <TypeIcon className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="font-serif text-3xl text-zinc-900">{project.customers?.full_name || 'Sin asignar'}</h1>
                                        <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${status.bg} ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <p className="text-zinc-500 text-sm">{serviceTypeLabel[project.service_type]} · {typeConfig.label}</p>
                                    {project.description && <p className="text-zinc-400 text-xs mt-1 italic">"{project.description}"</p>}
                                    <button
                                        onClick={handleSendWelcomeEmail}
                                        disabled={saving}
                                        className="mt-3 text-[10px] uppercase tracking-widest font-bold bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-zinc-300"
                                    >
                                        Enviar Formulario de Bienvenida
                                    </button>
                                </div>
                            </div>

                            {/* Event countdown */}
                            {daysUntilEvent !== null && daysUntilEvent >= 0 && (
                                <div className="text-right">
                                    <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Días para el evento</p>
                                    <p className={`text-3xl font-serif ${daysUntilEvent <= 7 ? 'text-red-600' : daysUntilEvent <= 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {daysUntilEvent}
                                    </p>
                                    <p className="text-xs text-zinc-500">{formatDateLong(project.event_date)}</p>
                                    {project.event_venue && <p className="text-[10px] text-zinc-400">📍 {project.event_venue}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-zinc-200/80 p-4 rounded-xl">
                            <p className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold">Pagado</p>
                            <p className="text-xl font-semibold text-zinc-800 mt-1">{formatCurrency(paidAmount)}</p>
                            <p className="text-[10px] text-zinc-400">de {formatCurrency(project.total_amount)}</p>
                        </div>
                        <div className="bg-white border border-zinc-200/80 p-4 rounded-xl">
                            <p className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold">Cuotas</p>
                            <p className="text-xl font-semibold text-zinc-800 mt-1">{paidCount} / 3</p>
                            <div className="flex gap-1 mt-1">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`h-1.5 rounded-full flex-1 ${(project as any)[`payment_${i}_status`] === 'paid' ? 'bg-emerald-400' : 'bg-zinc-200'}`} />
                                ))}
                            </div>
                        </div>
                        <div className="bg-white border border-zinc-200/80 p-4 rounded-xl">
                            <p className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold">Pruebas</p>
                            <p className="text-xl font-semibold text-zinc-800 mt-1">
                                {(project.milestones || []).filter((m: any) => m.status === 'completed').length} / {(project.milestones || []).length}
                            </p>
                        </div>
                        <div className="bg-white border border-zinc-200/80 p-4 rounded-xl">
                            <p className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold">Contrato</p>
                            <p className={`text-xl font-semibold mt-1 ${project.contract_accepted ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {project.contract_accepted ? '✓ Aceptado' : 'Pendiente'}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-zinc-200 gap-1 overflow-x-auto">
                        {[
                            { id: 'timeline', label: 'Cronograma', icon: Calendar },
                            { id: 'payments', label: 'Pagos', icon: DollarSign },
                            { id: 'measurements', label: 'Medidas', icon: Ruler },
                            { id: 'contract', label: 'Contrato', icon: FileText },
                            { id: 'notes', label: 'Notas', icon: StickyNote },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`pb-3 px-4 text-xs uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === tab.id ? 'border-rose-400 text-zinc-800' : 'border-transparent text-zinc-400 hover:text-zinc-700'
                                }`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* TAB: Timeline */}
                    {activeTab === 'timeline' && (
                        <div className="space-y-4">
                            {(project.milestones || []).map((milestone: any, idx: number) => {
                                const isCompleted = milestone.status === 'completed';
                                const isPast = milestone.scheduled_date && new Date(milestone.scheduled_date) < new Date() && !isCompleted;
                                const isNext = !isCompleted && !(project.milestones || []).slice(0, idx).some((m: any) => m.status !== 'completed');

                                return (
                                    <div
                                        key={milestone.id}
                                        className={`flex items-start gap-4 p-5 rounded-xl border transition-all ${
                                            isCompleted ? 'bg-emerald-50/50 border-emerald-200' :
                                            isPast ? 'bg-red-50/50 border-red-200' :
                                            isNext ? 'bg-white border-zinc-300 shadow-sm ring-1 ring-rose-200' :
                                            'bg-white border-zinc-200'
                                        }`}
                                    >
                                        {/* Status circle */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                            isCompleted ? 'bg-emerald-500 text-white' :
                                            isPast ? 'bg-red-500 text-white' :
                                            isNext ? 'bg-rose-100 text-rose-600 border-2 border-rose-300' :
                                            'bg-zinc-100 text-zinc-400'
                                        }`}>
                                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                                             isPast ? <AlertCircle className="w-5 h-5" /> :
                                             <span className="text-sm font-bold">{idx + 1}</span>}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`font-bold text-sm ${isCompleted ? 'text-emerald-700 line-through' : isPast ? 'text-red-700' : 'text-zinc-800'}`}>
                                                        {milestone.title}
                                                    </h3>
                                                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDateLong(milestone.scheduled_date)}
                                                        {isPast && <span className="text-red-500 font-bold ml-2">• Atrasado</span>}
                                                    </p>
                                                    {isCompleted && milestone.completed_date && (
                                                        <p className="text-[10px] text-emerald-600 mt-1">Completado el {formatDate(milestone.completed_date)}</p>
                                                    )}
                                                </div>
                                                {!isCompleted && project.status !== 'cancelado' && project.status !== 'entregado' && (
                                                    <button
                                                        onClick={() => handleCompleteMilestone(milestone.id)}
                                                        disabled={saving}
                                                        className="text-[10px] uppercase tracking-widest font-bold bg-zinc-900 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-zinc-300"
                                                    >
                                                        Completar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* TAB: Payments */}
                    {activeTab === 'payments' && (
                        <div className="space-y-4">
                            {[
                                { num: 1 as const, label: 'Cuota 1 — Abono Inicial', pct: '50%', amount: project.payment_1_amount, status: project.payment_1_status, date: project.payment_1_date },
                                { num: 2 as const, label: 'Cuota 2 — Prueba Intermedia', pct: '25%', amount: project.payment_2_amount, status: project.payment_2_status, date: project.payment_2_date },
                                { num: 3 as const, label: 'Cuota 3 — Contra Entrega', pct: '25%', amount: project.payment_3_amount, status: project.payment_3_status, date: project.payment_3_date },
                            ].map(payment => (
                                <div key={payment.num} className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-xl border ${
                                    payment.status === 'paid' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-zinc-200'
                                }`}>
                                    <div>
                                        <h3 className="font-bold text-sm text-zinc-800">{payment.label}</h3>
                                        <p className="text-xs text-zinc-400 mt-1">{payment.pct} del total</p>
                                        {payment.status === 'paid' && payment.date && (
                                            <p className="text-[10px] text-emerald-600 mt-1">Pagado el {formatDate(payment.date)}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl font-serif font-bold text-zinc-800">{formatCurrency(payment.amount)}</span>
                                        {payment.status === 'paid' ? (
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Pagado
                                            </span>
                                        ) : project.status !== 'cancelado' ? (
                                            <button
                                                onClick={() => handleRegisterPayment(payment.num)}
                                                disabled={saving}
                                                className="text-[10px] uppercase tracking-widest font-bold bg-zinc-900 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-zinc-300"
                                            >
                                                Registrar Pago
                                            </button>
                                        ) : (
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Cancelado</span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Summary */}
                            <div className="bg-zinc-900 text-white p-6 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Saldo Pendiente</p>
                                    <p className="text-2xl font-serif mt-1">{formatCurrency(project.total_amount - paidAmount)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Total Pagado</p>
                                    <p className="text-2xl font-serif mt-1 text-emerald-400">{formatCurrency(paidAmount)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: Measurements */}
                    {activeTab === 'measurements' && (
                        <div className="space-y-6">
                            {/* Existing measurements */}
                            {(project.measurements || []).length > 0 ? (
                                <div className="space-y-4">
                                    {project.measurements.map((m: any, idx: number) => (
                                        <div key={m.id} className="bg-white border border-zinc-200 rounded-xl p-5">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-sm text-zinc-800">Medición #{idx + 1}</h3>
                                                <span className="text-[10px] text-zinc-400">{formatDate(m.created_at)}</span>
                                            </div>
                                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                                {Object.entries(measurementLabels).map(([key, label]) => (
                                                    m[key] != null && (
                                                        <div key={key} className="bg-zinc-50 p-3 rounded-lg text-center">
                                                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">{label}</p>
                                                            <p className="text-lg font-bold text-zinc-800 mt-1">{m[key]}</p>
                                                            <p className="text-[9px] text-zinc-400">cm</p>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                            {m.notes && <p className="text-xs text-zinc-500 mt-3 italic bg-zinc-50 p-3 rounded-lg">📝 {m.notes}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-zinc-100 border-dashed">
                                    <Ruler className="w-10 h-10 mx-auto text-zinc-300 mb-3" />
                                    <p className="text-zinc-500 text-sm">No hay medidas registradas aún.</p>
                                </div>
                            )}

                            {/* Add measurement form */}
                            {!showMeasurementForm ? (
                                <button
                                    onClick={() => setShowMeasurementForm(true)}
                                    className="w-full border-2 border-dashed border-zinc-300 rounded-xl p-4 text-zinc-400 hover:text-rose-500 hover:border-rose-300 transition-colors text-sm font-bold uppercase tracking-widest"
                                >
                                    + Registrar Nueva Medición
                                </button>
                            ) : (
                                <form onSubmit={handleSaveMeasurements} className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-sm text-zinc-800">Nueva Medición</h3>
                                        <button type="button" onClick={() => setShowMeasurementForm(false)} className="text-zinc-400 hover:text-zinc-700">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Asociar a Prueba (opcional)</label>
                                        <select name="milestone_id" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm">
                                            <option value="">— Sin asociar —</option>
                                            {(project.milestones || []).map((m: any) => (
                                                <option key={m.id} value={m.id}>{m.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                        {Object.entries(measurementLabels).map(([key, label]) => (
                                            <div key={key}>
                                                <label className="block text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1">{label}</label>
                                                <input
                                                    type="number"
                                                    name={key}
                                                    step="0.1"
                                                    placeholder="cm"
                                                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-center focus:ring-1 focus:ring-rose-300 outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1">Notas</label>
                                        <textarea name="notes" rows={2} placeholder="Observaciones de la medición..." className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm resize-none focus:ring-1 focus:ring-rose-300 outline-none" />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => setShowMeasurementForm(false)} className="px-4 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50">Cancelar</button>
                                        <button type="submit" disabled={saving} className="bg-zinc-900 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:bg-zinc-300">
                                            <Save className="w-3.5 h-3.5" /> Guardar
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* TAB: Contract */}
                    {activeTab === 'contract' && (
                        <div className="space-y-6">
                            {/* Contract status */}
                            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-xl border ${
                                project.contract_accepted ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                            }`}>
                                <div>
                                    <h3 className="font-bold text-sm">
                                        {project.contract_accepted ? '✓ Contrato Aceptado' : '⏳ Contrato Pendiente de Aceptación'}
                                    </h3>
                                    {project.contract_accepted && project.contract_accepted_at && (
                                        <p className="text-xs text-emerald-600 mt-1">Aceptado el {formatDate(project.contract_accepted_at)}</p>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    {!project.contract_accepted && project.status !== 'cancelado' && (
                                        <button onClick={handleAcceptContract} disabled={saving} className="text-[10px] uppercase tracking-widest font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-zinc-300">
                                            Marcar como Aceptado
                                        </button>
                                    )}
                                    <button onClick={handlePrintContract} className="text-[10px] uppercase tracking-widest font-bold bg-zinc-900 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                                        <Printer className="w-3.5 h-3.5" /> Imprimir Contrato
                                    </button>
                                </div>
                            </div>

                            {/* Contract preview */}
                            <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
                                <ContractTemplate data={contractData} />
                            </div>
                        </div>
                    )}

                    {/* TAB: Notes */}
                    {activeTab === 'notes' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-zinc-200 rounded-xl p-6">
                                <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-3">Notas Internas del Taller</h3>
                                <textarea
                                    value={project.internal_notes || ''}
                                    onChange={(e) => setProject({ ...project, internal_notes: e.target.value })}
                                    rows={5}
                                    placeholder="Notas privadas del equipo sobre este proyecto..."
                                    className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm resize-none focus:ring-1 focus:ring-rose-300 outline-none"
                                />
                            </div>
                            <div className="bg-white border border-zinc-200 rounded-xl p-6">
                                <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-3">Materiales Comprometidos</h3>
                                {(() => {
                                    const rawNotes = project.materials_notes || '';
                                    const regex = /!\[Referencia(?: \d+)?\]\((data:image\/[^;]+;base64,[^\)]+)\)/g;
                                    const refImages = Array.from(rawNotes.matchAll(regex)).map((m: any) => m[1]);
                                    const cleanNotes = rawNotes.replace(regex, '').trim();

                                    return (
                                        <>
                                            {refImages.length > 0 && (
                                                <div className="mb-4">
                                                    <label className="block text-[10px] text-zinc-500 mb-2 uppercase tracking-widest font-bold">Fotos de Referencia adjuntas</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {refImages.map((img, idx) => (
                                                            <div key={idx} className="relative w-16 h-16 border border-zinc-200 rounded-lg overflow-hidden group bg-zinc-50">
                                                                <img src={img} className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(img, '_blank')} alt="Referencia" />
                                                                <button type="button" onClick={() => {
                                                                    const newImages = refImages.filter((_, i) => i !== idx);
                                                                    let newNotes = cleanNotes;
                                                                    newImages.forEach((imgBase64, i) => {
                                                                        newNotes += `\n\n![Referencia ${i + 1}](${imgBase64})`;
                                                                    });
                                                                    setProject({ ...project, materials_notes: newNotes });
                                                                }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <textarea
                                                value={cleanNotes}
                                                onChange={(e) => {
                                                    let newNotes = e.target.value;
                                                    if (refImages.length > 0) {
                                                        refImages.forEach((img, idx) => {
                                                            newNotes += `\n\n![Referencia ${idx + 1}](${img})`;
                                                        });
                                                    }
                                                    setProject({ ...project, materials_notes: newNotes });
                                                }}
                                                rows={3}
                                                placeholder="Telas, encajes, pedrería y materiales reservados para este vestido..."
                                                className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm resize-none focus:ring-1 focus:ring-rose-300 outline-none"
                                            />
                                        </>
                                    );
                                })()}
                            </div>
                            <div className="flex justify-between">
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="text-[10px] uppercase tracking-widest font-bold text-amber-600 hover:text-amber-800 px-4 py-2 border border-amber-200 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <X className="w-3.5 h-3.5" /> Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-700 px-4 py-2 border border-red-200 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Eliminar Definitivamente
                                    </button>
                                </div>
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={saving}
                                    className="bg-zinc-900 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center gap-2 disabled:bg-zinc-300"
                                >
                                    <Save className="w-3.5 h-3.5" /> Guardar Notas
                                </button>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </>
    );
}
