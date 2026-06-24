'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Crown, GraduationCap, Calendar, DollarSign, FileText, Loader2, CheckCircle2, Sparkles, User } from 'lucide-react';
import { createBridalProject } from '../actions';
import { getCustomers } from '../../crm/actions';

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

export default function NuevoProyectoPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [customerId, setCustomerId] = useState('');
    const [projectType, setProjectType] = useState('novia');
    const [serviceType, setServiceType] = useState('modificacion_tienda');
    const [eventDate, setEventDate] = useState('');
    const [eventVenue, setEventVenue] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [description, setDescription] = useState('');
    const [materialsNotes, setMaterialsNotes] = useState('');
    const [contractNotes, setContractNotes] = useState('');

    // Derived
    const payment1 = Math.round(totalAmount * 0.5);
    const payment2 = Math.round(totalAmount * 0.25);
    const payment3 = totalAmount - payment1 - payment2;

    // Calculate milestone dates
    const milestones = eventDate ? [
        { title: 'Prueba 1 — Toma de Medidas y Diseño', weeks: 12 },
        { title: 'Prueba 2 — Estructura y Calce Base', weeks: 8 },
        { title: 'Prueba 3 — Ajustes y Detalles', weeks: 5 },
        { title: 'Prueba 4 — Prueba Final (Milimétrica)', weeks: 3 },
        { title: 'Entrega Final', weeks: 1 },
    ].map(m => {
        const date = new Date(`${eventDate}T12:00:00`);
        date.setDate(date.getDate() - (m.weeks * 7));
        return { ...m, date };
    }) : [];

    useEffect(() => {
        async function load() {
            const data = await getCustomers();
            setCustomers(data || []);
            setLoading(false);
        }
        load();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError('');

        const formData = new FormData();
        formData.set('customer_id', customerId);
        formData.set('project_type', projectType);
        formData.set('service_type', serviceType);
        formData.set('event_date', eventDate);
        formData.set('event_venue', eventVenue);
        formData.set('total_amount', String(totalAmount));
        formData.set('description', description);
        formData.set('materials_notes', materialsNotes);
        formData.set('contract_notes', contractNotes);

        const result = await createBridalProject(formData);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push(`/admin/novias/${result.projectId}`);
            }, 1500);
        } else {
            setError(result.error || 'Error al crear el proyecto');
        }
        setSaving(false);
    }

    const selectedCustomer = customers.find(c => c.id === customerId);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50/30 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50/30 font-sans text-zinc-800">
            <main className="max-w-4xl mx-auto px-6 md:px-8 py-8">

                {/* Header */}
                <div className="mb-8">
                    <Link href="/admin/novias" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 font-bold hover:text-zinc-700 transition-colors mb-4">
                        <ArrowLeft className="w-3 h-3" /> Volver a Proyectos
                    </Link>
                    <h1 className="font-serif text-3xl text-zinc-900">Nuevo Proyecto Especial</h1>
                    <p className="text-zinc-500 text-sm mt-1">Completa los datos para crear un nuevo proyecto de novia, madrina o graduación.</p>
                </div>

                {success ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-emerald-200 shadow-sm">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h2 className="font-serif text-2xl text-zinc-900 mb-2">¡Proyecto Creado!</h2>
                        <p className="text-zinc-500">Redirigiendo a la ficha del proyecto...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Step 1: Client Selection */}
                        <section className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" /> 1. Seleccionar Clienta
                            </h2>
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                required
                                className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-rose-300 outline-none bg-white"
                            >
                                <option value="">— Selecciona una clienta del CRM —</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.full_name} {c.phone ? `(${c.phone})` : ''}</option>
                                ))}
                            </select>
                            {selectedCustomer && (
                                <div className="mt-3 bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-sm">
                                    <div className="flex gap-4 text-zinc-500">
                                        <span>📧 {selectedCustomer.email || 'Sin correo'}</span>
                                        <span>📱 {selectedCustomer.phone || 'Sin teléfono'}</span>
                                        {selectedCustomer.rut && <span>🪪 {selectedCustomer.rut}</span>}
                                    </div>
                                </div>
                            )}
                            <p className="text-[10px] text-zinc-400 mt-2">
                                ¿No está registrada? <Link href="/admin/crm/nueva" className="text-rose-500 hover:underline" target="_blank">Crear nueva clienta</Link>
                            </p>
                        </section>

                        {/* Step 2: Project Type */}
                        <section className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> 2. Tipo de Proyecto
                            </h2>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: 'novia', label: 'Novia', icon: Heart, desc: 'Vestido de novia', gradient: 'from-rose-50 to-pink-50', border: 'border-rose-300', text: 'text-rose-600' },
                                    { value: 'madrina', label: 'Madrina', icon: Crown, desc: 'Vestido de madrina / ceremonia', gradient: 'from-violet-50 to-purple-50', border: 'border-violet-300', text: 'text-violet-600' },
                                    { value: 'graduacion', label: 'Graduación', icon: GraduationCap, desc: 'Vestido de graduación', gradient: 'from-sky-50 to-blue-50', border: 'border-sky-300', text: 'text-sky-600' },
                                ].map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setProjectType(type.value)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                            projectType === type.value
                                                ? `bg-gradient-to-br ${type.gradient} ${type.border} shadow-sm`
                                                : 'border-zinc-200 hover:border-zinc-300 bg-white'
                                        }`}
                                    >
                                        <type.icon className={`w-6 h-6 mb-2 ${projectType === type.value ? type.text : 'text-zinc-400'}`} />
                                        <p className={`font-bold text-sm ${projectType === type.value ? type.text : 'text-zinc-700'}`}>{type.label}</p>
                                        <p className="text-[10px] text-zinc-400 mt-1">{type.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Step 3: Service Type */}
                        <section className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> 3. Tipo de Servicio
                            </h2>
                            <div className="space-y-2">
                                {[
                                    { value: 'modificacion_tienda', label: 'Modificación de vestido de la tienda', desc: 'La clienta adquiere un vestido del inventario de ELENA y se adapta a sus medidas.' },
                                    { value: 'vestido_propio', label: 'Ajuste de vestido propio', desc: 'La clienta trae su propio vestido (comprado en otro lugar o heredado) para modificar.' },
                                    { value: 'bespoke', label: 'Confección desde cero (Bespoke)', desc: 'Creación total del vestido a medida desde diseño y patronaje.' },
                                ].map(svc => (
                                    <label
                                        key={svc.value}
                                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            serviceType === svc.value
                                                ? 'border-zinc-800 bg-zinc-50'
                                                : 'border-zinc-200 hover:border-zinc-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="service_type"
                                            value={svc.value}
                                            checked={serviceType === svc.value}
                                            onChange={() => setServiceType(svc.value)}
                                            className="mt-1 accent-zinc-800"
                                        />
                                        <div>
                                            <p className="font-bold text-sm text-zinc-800">{svc.label}</p>
                                            <p className="text-xs text-zinc-500 mt-1">{svc.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {serviceType === 'vestido_propio' && (
                                <div className="mt-4 bg-amber-50 border border-amber-200 p-4 rounded-lg text-xs text-amber-800">
                                    <strong>⚠ Nota:</strong> El contrato incluirá automáticamente la cláusula de exención de responsabilidad sobre la tela original.
                                </div>
                            )}
                        </section>

                        {/* Step 4: Event & Pricing */}
                        <section className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> 4. Evento y Precio
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 font-medium">Fecha del Evento *</label>
                                    <input
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        required
                                        className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-rose-300 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 font-medium">Lugar del Evento</label>
                                    <input
                                        type="text"
                                        value={eventVenue}
                                        onChange={(e) => setEventVenue(e.target.value)}
                                        placeholder="Ej: Viña Santa Rita, Santiago"
                                        className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-rose-300 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 font-medium">Monto Total del Proyecto (CLP) *</label>
                                    <input
                                        type="number"
                                        value={totalAmount || ''}
                                        onChange={(e) => setTotalAmount(parseInt(e.target.value) || 0)}
                                        required
                                        min={0}
                                        placeholder="500000"
                                        className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-rose-300 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 font-medium">Descripción del Vestido</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Ej: Vestido sirena con encaje francés"
                                        className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-rose-300 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Payment Preview */}
                            {totalAmount > 0 && (
                                <div className="mt-6 bg-gradient-to-r from-zinc-50 to-rose-50/30 border border-zinc-200 rounded-xl p-5">
                                    <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-3 flex items-center gap-2">
                                        <DollarSign className="w-3.5 h-3.5" /> Desglose de Pagos
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-600">Cuota 1 — Abono Inicial (50%)</span>
                                            <span className="font-bold text-zinc-800">{formatCurrency(payment1)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-600">Cuota 2 — Prueba Intermedia (25%)</span>
                                            <span className="font-bold text-zinc-800">{formatCurrency(payment2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-600">Cuota 3 — Contra Entrega (25%)</span>
                                            <span className="font-bold text-zinc-800">{formatCurrency(payment3)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm pt-3 mt-2 border-t border-zinc-300 font-bold">
                                            <span>Total</span>
                                            <span className="text-lg">{formatCurrency(totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Step 5: Timeline Preview */}
                        {milestones.length > 0 && (
                            <section className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                                <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> 5. Cronograma Automático de Pruebas
                                </h2>
                                <div className="space-y-3">
                                    {milestones.map((m, i) => (
                                        <div key={i} className="flex items-center gap-4 bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-lg">
                                            <span className="w-7 h-7 rounded-full bg-zinc-800 text-white text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm text-zinc-800">{m.title}</p>
                                                <p className="text-xs text-zinc-500">{m.weeks} semanas antes del evento</p>
                                            </div>
                                            <span className="text-sm text-zinc-600 font-medium">
                                                {m.date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-zinc-400 mt-3 italic">
                                    * Las fechas se calculan automáticamente desde la fecha del evento. Se podrán ajustar manualmente después.
                                </p>
                            </section>
                        )}

                        {/* Step 6: Additional Notes */}
                        <section className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 mb-4">6. Notas Adicionales (Opcional)</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 font-medium">Materiales Comprometidos</label>
                                    <textarea
                                        value={materialsNotes}
                                        onChange={(e) => setMaterialsNotes(e.target.value)}
                                        placeholder="Ej: 3m encaje francés color ivory, 5m tul de seda, 200 perlas..."
                                        rows={2}
                                        className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-rose-300 outline-none resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1 font-medium">Cláusulas Adicionales al Contrato</label>
                                    <textarea
                                        value={contractNotes}
                                        onChange={(e) => setContractNotes(e.target.value)}
                                        placeholder="Notas especiales que se incluirán en el contrato..."
                                        rows={2}
                                        className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-rose-300 outline-none resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex justify-end gap-4 pt-4">
                            <Link href="/admin/novias" className="px-6 py-3 border border-zinc-200 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={saving || !customerId || !eventDate || totalAmount <= 0}
                                className="bg-zinc-900 hover:bg-rose-700 disabled:bg-zinc-300 text-white px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Crear Proyecto
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
