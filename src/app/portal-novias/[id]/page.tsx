'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Crown, GraduationCap, Loader2, ChevronRight, User, Phone, FileText, Calendar, MapPin, DollarSign, CheckCircle2, AlertCircle, Sparkles, Clock, LogOut } from 'lucide-react';
import ContractTemplate from '@/app/admin/novias/ContractTemplate';
import InspirationMoodboard from '../components/InspirationMoodboard';

const projectTypeConfig: Record<string, { label: string; icon: any; eventLabel: string }> = {
    novia: { label: 'Vestido de Novia', icon: Heart, eventLabel: 'matrimonio' },
    madrina: { label: 'Vestido de Madrina', icon: Crown, eventLabel: 'evento' },
    graduacion: { label: 'Vestido de Graduación', icon: GraduationCap, eventLabel: 'evento de graduación' },
};

// --- Formatting helpers ---
function formatRut(value: string): string {
    let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length === 0) return '';
    let body = clean.slice(0, -1);
    let dv = clean.slice(-1);
    if (clean.length === 1) return clean;
    
    let formatted = '';
    let count = 0;
    for (let i = body.length - 1; i >= 0; i--) {
        formatted = body[i] + formatted;
        count++;
        if (count % 3 === 0 && i > 0) {
            formatted = '.' + formatted;
        }
    }
    return formatted + '-' + dv;
}

function formatPhoneDigits(value: string): string {
    let digits = value.replace(/[^0-9]/g, '').slice(0, 9);
    if (digits.length <= 1) return digits;
    if (digits.length <= 5) return digits.slice(0, 1) + ' ' + digits.slice(1);
    return digits.slice(0, 1) + ' ' + digits.slice(1, 5) + ' ' + digits.slice(5);
}

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return null;
    const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = cleanStr.split(/[-/]/);
    if (parts.length === 3) {
        let year, month, day;
        if (parts[0].length === 4) {
            year = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1;
            day = parseInt(parts[2]);
        } else {
            day = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1;
            year = parseInt(parts[2]);
        }
        return new Date(year, month, day, 12, 0, 0);
    }
    return new Date(dateStr);
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const dateObj = parseLocalDate(dateStr);
    if (!dateObj || isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateLong = (dateStr: string) => {
    if (!dateStr) return '—';
    const dateObj = parseLocalDate(dateStr);
    if (!dateObj || isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export default function PortalNoviasPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'payments' | 'moodboard' | 'contract'>('dashboard');
    
    // Controlled fields for onboarding
    const [rutValue, setRutValue] = useState('');
    const [phoneValue, setPhoneValue] = useState('');

    const projectId = params?.id as string;

    useEffect(() => {
        if (projectId) {
            loadProject(projectId);
        }
    }, [projectId]);

    async function loadProject(id: string) {
        try {
            const { getBridalProjectById } = await import('@/app/admin/novias/actions');
            const data = await getBridalProjectById(id);
            if (data) {
                setProject(data);
                if (data.customers?.rut) setRutValue(formatRut(data.customers.rut));
                if (data.customers?.phone) {
                    const rawPhone = data.customers.phone.replace(/^\+?56\s*/, '');
                    setPhoneValue(formatPhoneDigits(rawPhone));
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleOnboardingSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');
        try {
            const formData = new FormData(e.currentTarget);
            formData.set('phone', '+56 ' + phoneValue.replace(/\s/g, ''));
            const { processBridalFormAction } = await import('@/app/admin/novias/actions');
            const res = await processBridalFormAction(projectId, formData);
            if (res.success) {
                router.push(`/portal-novias/${projectId}/contrato`);
            } else {
                setErrorMsg(res.error || 'Ocurrió un error al procesar el formulario.');
            }
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#C17F5F]" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="font-serif text-3xl text-[#1A1A1A] mb-2">Proyecto no encontrado</h1>
                <p className="text-gray-600">El enlace al que intentas acceder no es válido o ha expirado.</p>
            </div>
        );
    }

    const config = projectTypeConfig[project.project_type] || projectTypeConfig.novia;
    const HeaderIcon = config.icon;

    const isContractAccepted = project.contract_accepted;

    if (!isContractAccepted) {
        // RENDER: Formulario de bienvenida (Onboarding)
        return (
            <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans flex items-center justify-center py-12 px-4 relative overflow-hidden" style={{ backgroundImage: "radial-gradient(circle at center, #FFFFFF 0%, #F5F5F0 100%)" }}>
                <div className="w-full max-w-2xl relative z-10">
                    <div className="text-center mb-12">
                        <div className="flex flex-col items-stretch justify-center w-max mx-auto">
                            <div className="flex justify-between w-full font-serif text-2xl md:text-3xl font-black uppercase text-[#1A1A1A] leading-none drop-shadow-sm">
                                <span>E</span><span>L</span><span>E</span><span>N</span><span>A</span>
                            </div>
                            <div
                                className="font-sans text-[0.65rem] md:text-[0.75rem] font-bold uppercase text-[#1A1A1A]/70 mt-1 text-center"
                                style={{ letterSpacing: '0.35em', marginRight: '-0.35em' }}
                            >
                                La Costurera
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl p-8 md:p-12 border border-[#C17F5F]/20 relative">
                        <div className="text-center mb-10">
                            <div className="text-[#C17F5F] mb-4 text-xs tracking-widest uppercase font-bold">✦ Ingreso Atelier ✦</div>
                            <h2 className="font-serif text-3xl text-[#1A1A1A] mb-4 italic">Bienvenida a tu Portal</h2>
                            <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto font-light">
                                Estamos felices de diseñar el vestido de tus sueños. 
                                Por favor completa los siguientes datos para formalizar tu reserva.
                            </p>
                        </div>

                        {errorMsg && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded text-xs text-center">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleOnboardingSubmit} className="space-y-10">
                            <div>
                                <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#C17F5F] border-b border-[#C17F5F]/10 pb-3 mb-6 flex items-center gap-2 font-bold">
                                    <User className="w-3.5 h-3.5" /> 1. Datos Personales
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-1 relative group">
                                        <label className="text-[9px] text-gray-500 uppercase tracking-widest absolute -top-4 left-0 transition-colors group-focus-within:text-[#C17F5F] font-bold">Nombre Completo</label>
                                        <input 
                                            type="text" 
                                            name="fullName" 
                                            required 
                                            defaultValue={project.customers?.full_name || ''}
                                            className="w-full bg-transparent border-b border-gray-200 focus:border-[#C17F5F] py-2 text-sm text-[#1A1A1A] outline-none transition-colors placeholder-gray-300" 
                                            placeholder="Tu nombre y apellido"
                                        />
                                    </div>
                                    <div className="space-y-1 relative group">
                                        <label className="text-[9px] text-gray-500 uppercase tracking-widest absolute -top-4 left-0 transition-colors group-focus-within:text-[#C17F5F] font-bold">RUT</label>
                                        <input 
                                            type="text" 
                                            name="rut" 
                                            required 
                                            value={rutValue}
                                            onChange={handleRutChange}
                                            maxLength={12}
                                            className="w-full bg-transparent border-b border-gray-200 focus:border-[#C17F5F] py-2 text-sm text-[#1A1A1A] outline-none transition-colors placeholder-gray-300" 
                                            placeholder="12.345.678-9"
                                        />
                                    </div>
                                    <div className="space-y-1 relative group md:col-span-2">
                                        <label className="text-[9px] text-gray-500 uppercase tracking-widest absolute -top-4 left-0 transition-colors group-focus-within:text-[#C17F5F] font-bold">Teléfono WhatsApp</label>
                                        <div className="flex items-center border-b border-gray-200 focus-within:border-[#C17F5F] transition-colors">
                                            <span className="text-sm text-gray-500 pr-2 select-none font-medium">+56</span>
                                            <input 
                                                type="tel" 
                                                name="phone" 
                                                required 
                                                value={phoneValue}
                                                onChange={handlePhoneChange}
                                                maxLength={11}
                                                className="w-full bg-transparent py-2 text-sm text-[#1A1A1A] outline-none placeholder-gray-300" 
                                                placeholder="9 1234 5678"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#C17F5F] border-b border-[#C17F5F]/10 pb-3 mb-6 flex items-center gap-2 font-bold">
                                    <Calendar className="w-3.5 h-3.5" /> 2. Detalles del Evento
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-1 relative group">
                                        <label className="text-[9px] text-gray-500 uppercase tracking-widest absolute -top-4 left-0 transition-colors group-focus-within:text-[#C17F5F] font-bold">Fecha del Evento</label>
                                        <input 
                                            type="date" 
                                            name="eventDate" 
                                            required 
                                            defaultValue={project.event_date ? project.event_date.split('T')[0] : ''}
                                            className="w-full bg-transparent border-b border-gray-200 focus:border-[#C17F5F] py-2 text-sm text-[#1A1A1A] outline-none transition-colors [color-scheme:light]" 
                                        />
                                    </div>
                                    <div className="space-y-1 relative group">
                                        <label className="text-[9px] text-gray-500 uppercase tracking-widest absolute -top-4 left-0 transition-colors group-focus-within:text-[#C17F5F] font-bold">Lugar del Evento</label>
                                        <input 
                                            type="text" 
                                            name="eventVenue" 
                                            required 
                                            defaultValue={project.event_venue || ''}
                                            className="w-full bg-transparent border-b border-gray-200 focus:border-[#C17F5F] py-2 text-sm text-[#1A1A1A] outline-none transition-colors placeholder-gray-300" 
                                            placeholder="Ej: Centro de Eventos..."
                                        />
                                    </div>
                                    <div className="space-y-1 relative group md:col-span-2">
                                        <label className="text-[9px] text-gray-500 uppercase tracking-widest absolute -top-4 left-0 transition-colors group-focus-within:text-[#C17F5F] font-bold">Notas Adicionales (Opcional)</label>
                                        <textarea 
                                            name="notes" 
                                            rows={2}
                                            defaultValue={project.description || ''}
                                            className="w-full bg-transparent border-b border-gray-200 focus:border-[#C17F5F] py-2 text-sm text-[#1A1A1A] outline-none transition-colors resize-none placeholder-gray-300" 
                                            placeholder="Detalles importantes sobre tu vestido..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 text-center">
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="w-full bg-[#C17F5F] border border-[#C17F5F] text-[#1A1A1A] hover:bg-[#a96e51] hover:border-[#a96e51] py-4 rounded text-xs font-bold uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {submitting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin text-[#1A1A1A]" /> Procesando...</>
                                    ) : (
                                        <>
                                            Generar Propuesta 
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                <p className="text-[9px] text-gray-400 mt-4 uppercase tracking-widest">
                                    Al continuar, se generará tu propuesta y presupuesto.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }



    // CALCULATE: Remaining days and design freeze date (4 months before event)
    const daysUntilEvent = project.event_date
        ? Math.ceil((new Date(project.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    let designFreezeDate: Date | null = null;
    let daysUntilFreeze: number | null = null;
    if (project.event_date) {
        designFreezeDate = new Date(project.event_date);
        designFreezeDate.setMonth(designFreezeDate.getMonth() - 4); // 4 months before event
        daysUntilFreeze = Math.ceil((designFreezeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }

    // READ: Payments from work_order's payment_plan or fallback fields
    let cuotasList: any[] = [];
    let totalPaid = 0;
    let totalValue = project.total_amount;

    if (project.work_order && project.work_order.payment_plan && project.work_order.payment_plan.cuotas) {
        cuotasList = project.work_order.payment_plan.cuotas.map((c: any, index: number) => ({
            name: c.name || `Cuota ${index + 1}`,
            amount: c.monto || c.amount || 0,
            status: c.status || 'pending',
            date: c.fecha || c.date || null
        }));
        totalPaid = project.work_order.paid_amount || 0;
        totalValue = project.work_order.total_amount || project.total_amount;
    } else {
        // Fallback to the 3 standard database columns
        cuotasList = [
            { name: 'Cuota 1 — Abono Inicial', amount: project.payment_1_amount, status: project.payment_1_status, date: project.payment_1_date },
            { name: 'Cuota 2 — Prueba Intermedia', amount: project.payment_2_amount, status: project.payment_2_status, date: project.payment_2_date },
            { name: 'Cuota 3 — Contra Entrega', amount: project.payment_3_amount, status: project.payment_3_status, date: project.payment_3_date },
        ].filter(c => c.amount > 0);
        
        totalPaid = cuotasList.filter(c => c.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    }

    const pendingBalance = totalValue - totalPaid;
    const paidCount = cuotasList.filter(c => c.status === 'paid').length;

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
        totalAmount: totalValue,
        payment1: project.payment_1_amount,
        payment2: project.payment_2_amount,
        payment3: project.payment_3_amount,
        milestones: (project.milestones || []).map((m: any) => ({ title: m.title, scheduledDate: m.scheduled_date })),
        contractNotes: project.contract_notes || '',
        materialsNotes: project.materials_notes || '',
    };

    function handleRutChange(e: React.ChangeEvent<HTMLInputElement>) {
        setRutValue(formatRut(e.target.value));
    }
    
    function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPhoneValue(formatPhoneDigits(e.target.value));
    }

    // RENDER: Dashboard principal de la novia
    return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans flex flex-col justify-between" style={{ backgroundImage: "radial-gradient(circle at top, #FFFFFF 0%, #F5F5F0 100%)" }}>
            
            {/* Top Navigation / Title */}
            <header className="border-b border-[#C17F5F]/10 bg-white/90 backdrop-blur-md sticky top-0 z-40 py-5 px-6">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <HeaderIcon className="w-5 h-5 text-[#C17F5F] animate-pulse" />
                        <div>
                            <span className="font-serif text-xl tracking-[0.2em] font-black text-[#1A1A1A]">ELENA</span>
                            <span className="text-[8px] uppercase tracking-[0.4em] text-gray-500 block">Portal Privado</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="hidden md:inline text-[10px] uppercase tracking-widest text-gray-600 font-light">
                            Hola, {project.customers?.full_name?.split(' ')[0] || 'Cliente'}
                        </span>
                        <Link href="/" className="text-gray-500 hover:text-[#C17F5F] transition-colors flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                            <LogOut className="w-3.5 h-3.5" /> Salir
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-5xl w-full mx-auto px-6 py-10 flex-1 space-y-10">
                
                {/* Contract Pending Warning Popup/Banner */}
                {!isContractAccepted && (
                    <div className="bg-[#FFF9F2] border border-[#C17F5F]/30 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_20px_60px_rgba(193,127,95,0.08)] shadow-[#C17F5F]/5">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#C17F5F]/20 p-3 rounded-full">
                                <AlertCircle className="w-6 h-6 text-[#C17F5F]" />
                            </div>
                            <div>
                                <h3 className="font-serif italic text-xl text-[#C17F5F]">Contrato y Abono Pendiente</h3>
                                <p className="text-xs text-gray-600 mt-1 max-w-md">
                                    Aún no has formalizado tu reserva. Para bloquear tu cupo de producción y habilitar todas las funciones del portal, por favor revisa y acepta tu propuesta.
                                </p>
                            </div>
                        </div>
                        <Link 
                            href={`/portal-novias/${projectId}/contrato`}
                            className="w-full md:w-auto text-center px-6 py-3 bg-[#C17F5F] text-[#1A1A1A] text-xs font-bold uppercase tracking-widest rounded hover:bg-[#A86F53] transition-colors whitespace-nowrap"
                        >
                            Completar Ahora
                        </Link>
                    </div>
                )}
                
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/90/40 border border-[#C17F5F]/10 p-6 rounded-lg backdrop-blur-sm">
                    <div>
                        <div className="text-[#C17F5F] text-[10px] tracking-widest uppercase font-bold mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" /> Tu Experiencia de Alta Costura
                        </div>
                        <h1 className="font-serif text-3xl md:text-4xl italic text-[#1A1A1A] font-light">
                            {config.label} de {project.customers?.full_name?.split(' ')[0] || 'Cliente'}
                        </h1>
                        <p className="text-xs text-gray-600 mt-2 font-light">
                            {formatDateLong(project.event_date)} · {project.event_venue || 'Santiago'}
                        </p>
                    </div>

                    {daysUntilEvent !== null && (
                        <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-[#C17F5F]/20 pt-4 md:pt-0 md:pl-8 shrink-0">
                            <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Días para el gran día</p>
                            <p className="text-5xl font-serif text-[#C17F5F] mt-1 font-light">{daysUntilEvent}</p>
                        </div>
                    )}
                </div>

                {/* Design Freeze Alert */}
                {designFreezeDate && daysUntilFreeze !== null && (
                    <div className={`p-5 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md ${
                        daysUntilFreeze <= 30 
                            ? 'bg-red-950/20 border-red-500/30 text-red-700' 
                            : 'bg-amber-950/10 border-amber-500/20 text-amber-900'
                    }`}>
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-xs uppercase tracking-widest">Congelación de Diseño</h3>
                                <p className="text-xs mt-1 font-light leading-relaxed">
                                    Quedan **{daysUntilFreeze} días** ({formatDate(designFreezeDate.toISOString())}) para definir la idea final del diseño de tu {config.label.toLowerCase()}. A partir de esa fecha no se podrán realizar cambios de diseño o silueta para garantizar el cumplimiento de los tiempos del taller.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dashboard Tabs Bar */}
                <div className="flex border-b border-[#C17F5F]/10 gap-1 overflow-x-auto">
                    {[
                        { id: 'dashboard', label: 'Mi Vestido', icon: Calendar },
                        { id: 'payments', label: 'Pagos y Estado', icon: DollarSign },
                        { id: 'moodboard', label: 'Inspiración', icon: Heart },
                        { id: 'contract', label: 'Contrato', icon: FileText },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-3 px-5 text-xs uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                                activeTab === tab.id ? 'border-[#C17F5F] text-[#1A1A1A]' : 'border-transparent text-gray-500 hover:text-[#4A4A4A]'
                            }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB: Dashboard / Cronograma */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="bg-white/90/80 border border-[#C17F5F]/20 p-6 md:p-8 rounded-lg backdrop-blur-md">
                            <h2 className="font-serif text-xl text-[#1A1A1A] italic mb-6">Planificación de Pruebas</h2>
                            {project.milestones && project.milestones.length > 0 ? (
                                <div className="space-y-4">
                                    {project.milestones.map((milestone: any, idx: number) => {
                                        const isCompleted = milestone.status === 'completed';
                                        return (
                                            <div key={milestone.id} className={`flex items-start gap-4 p-4 rounded border ${
                                                isCompleted ? 'bg-emerald-50/80 border-emerald-200' : 'bg-[#FCFAF7]/95 border-[#C17F5F]/15'
                                            }`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                    isCompleted ? 'bg-emerald-600 text-white' : 'bg-[#C17F5F]/10 text-[#C17F5F] font-bold'
                                                }`}>
                                                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold text-xs uppercase tracking-widest ${isCompleted ? 'line-through text-emerald-700/60' : 'text-[#1A1A1A]'}`}>
                                                        {milestone.title}
                                                    </h3>
                                                    <p className={`text-xs mt-1 font-light flex items-center gap-1.5 ${isCompleted ? 'text-emerald-700/50' : 'text-gray-600'}`}>
                                                        <Clock className="w-3.5 h-3.5 text-[#C17F5F]" />
                                                        {milestone.scheduled_date ? formatDateLong(milestone.scheduled_date) : 'Por programar'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 font-light">Tu cronograma se está planificando. Nos comunicaremos contigo para agendar tus primeras pruebas.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: Payments */}
                {activeTab === 'payments' && (
                    <div className="space-y-6">
                        <div className="bg-white/90/80 border border-[#C17F5F]/20 p-6 md:p-8 rounded-lg backdrop-blur-md space-y-6">
                            
                            {/* Visual balance card */}
                            <div className="bg-[#FCFAF7]/90 border border-[#C17F5F]/20 p-6 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Valor Total del Vestido</p>
                                    <p className="text-2xl font-serif mt-1 text-[#1A1A1A] font-light">{formatCurrency(totalValue)}</p>
                                </div>
                                <div className="sm:text-center">
                                    <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Total Pagado</p>
                                    <p className="text-2xl font-serif mt-1 text-emerald-600 font-light">{formatCurrency(totalPaid)}</p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Saldo Pendiente</p>
                                    <p className={`text-2xl font-serif mt-1 font-light ${pendingBalance > 0 ? 'text-[#C17F5F]' : 'text-gray-500'}`}>
                                        {formatCurrency(pendingBalance)}
                                    </p>
                                </div>
                            </div>

                            {/* Installments checklist */}
                            <div className="space-y-4">
                                <h3 className="text-xs uppercase tracking-widest font-bold text-gray-600 border-b border-[#C17F5F]/10 pb-2">Plan de Vencimientos</h3>
                                {cuotasList.map((cuota, idx) => (
                                    <div key={idx} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded border ${
                                        cuota.status === 'paid' ? 'bg-emerald-50/80 border-emerald-200' : 'bg-[#FCFAF7]/95 border-[#C17F5F]/15'
                                    }`}>
                                        <div>
                                            <h4 className="font-bold text-xs uppercase tracking-widest text-[#1A1A1A]">{cuota.name}</h4>
                                            {cuota.status === 'paid' && cuota.date && (
                                                <p className="text-[10px] text-emerald-600 mt-1 font-light">Confirmado el {formatDate(cuota.date)}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 self-end sm:self-auto">
                                            <span className="text-sm font-bold text-[#1A1A1A]">{formatCurrency(cuota.amount)}</span>
                                            {cuota.status === 'paid' ? (
                                                <span className="text-[8px] uppercase tracking-widest font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                                    Pagado ✓
                                                </span>
                                            ) : (
                                                <a 
                                                    href={`/portal-novias/${projectId}/pagar`}
                                                    className="text-[9px] uppercase tracking-widest font-bold border border-[#C17F5F] text-[#C17F5F] hover:bg-[#C17F5F] hover:text-white px-3.5 py-1.5 rounded transition-all"
                                                >
                                                    Pagar
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: Moodboard */}
                {activeTab === 'moodboard' && (
                    <InspirationMoodboard projectId={projectId} />
                )}

                {/* TAB: Contract */}
                {activeTab === 'contract' && (
                    <div className="space-y-6">
                        <div className="bg-white/90/80 border border-[#C17F5F]/20 p-6 md:p-8 rounded-lg backdrop-blur-md">
                            <div className="flex justify-between items-center mb-6 border-b border-[#C17F5F]/10 pb-4">
                                <h2 className="font-serif text-xl text-[#1A1A1A] italic">Copia de tu Contrato</h2>
                                <button 
                                    onClick={() => window.print()} 
                                    className="text-[9px] uppercase tracking-widest font-bold border border-[#C17F5F]/30 hover:border-white text-[#4A4A4A] hover:text-[#C17F5F] px-4 py-2 rounded transition-all"
                                >
                                    Imprimir / Descargar PDF
                                </button>
                            </div>
                            <div className="bg-white text-gray-900 p-6 sm:p-10 rounded shadow-inner overflow-x-auto">
                                <ContractTemplate data={contractData} />
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* Premium Footer */}
            <footer className="border-t border-[#C17F5F]/10 py-8 bg-[#0C0C0C] text-center text-[10px] text-gray-600 uppercase tracking-[0.2em] font-light">
                Elena Atelier &copy; {new Date().getFullYear()} · Alta Costura a Medida · Vitacura, Chile
            </footer>
        </div>
    );
}
