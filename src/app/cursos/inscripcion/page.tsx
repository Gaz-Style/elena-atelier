'use client';

import React, { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Loader2, Send, CheckCircle2, User, Sparkles, Phone, ShieldCheck, MessageCircle, X } from 'lucide-react';

const COURSES = [
    { id: 'iniciacion', name: 'Iniciación a la Costura', price: 52500, originalPrice: 70000, level: 'Principiante' },
    { id: 'confeccion', name: 'Costura & Confección', price: 75000, originalPrice: 90000, level: 'Intermedio' },
    { id: 'arreglos', name: 'Arreglos & Sastrería', price: 65000, originalPrice: 80000, level: 'Intermedio' },
    { id: 'patronaje', name: 'Patronaje & Diseño', price: 120000, originalPrice: null, level: 'Avanzado' },
    { id: 'pack', name: 'Pack Formación Completa', price: 699999, originalPrice: 1146000, level: 'Todos los niveles' },
];

const LEVELS = [
    { value: 'none', label: 'Nunca he cosido' },
    { value: 'basic', label: 'Tengo nociones básicas' },
    { value: 'intermediate', label: 'Costura intermedia' },
    { value: 'advanced', label: 'Nivel avanzado' },
];

type Message = { role: 'user' | 'assistant'; content: string };

function InscripcionContent() {
    const searchParams = useSearchParams();
    const defaultCourse = searchParams.get('curso') || '';

    const [step, setStep] = useState(1);
    const [leadId, setLeadId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Chat state
    const [showChat, setShowChat] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [inputMsg, setInputMsg] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [aiGreetingSent, setAiGreetingSent] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        course_id: defaultCourse,
        current_level: '',
        message: '',
    });

    const selectedCourse = COURSES.find(c => c.id === form.course_id);
    const formatCLP = (n: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chatLoading]);

    // Step 1 submit: save lead → go directly to payment (step 2)
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.full_name || !form.email || !form.phone || !form.course_id || !form.current_level) return;
        setSubmitting(true);

        try {
            const res = await fetch('/api/cursos/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, course_name: selectedCourse?.name }),
            });
            const data = await res.json();
            if (data.success) {
                setLeadId(data.leadId);
                setStep(2); // Go straight to payment
            } else {
                alert(data.error || 'Ocurrió un error inesperado al procesar tus datos.');
            }
        } catch (err: any) {
            console.error(err);
            alert('Error de conexión: No se pudo contactar al servidor.');
        } finally {
            setSubmitting(false);
        }
    };

    // AI Chat - only triggered when user opens the chat panel
    const sendAIGreeting = useCallback(async () => {
        if (aiGreetingSent) return;
        setAiGreetingSent(true);
        setChatLoading(true);
        try {
            const introMessage = `Hola, me llamo ${form.full_name} y me interesa el curso "${selectedCourse?.name}". Mi nivel actual es: ${LEVELS.find(l => l.value === form.current_level)?.label}.${form.message ? ` Mi consulta: ${form.message}` : ''}`;
            const res = await fetch('/api/cursos/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: introMessage }],
                    leadId,
                    leadName: form.full_name,
                    courseId: form.course_id,
                    courseName: selectedCourse?.name,
                    currentLevel: form.current_level,
                }),
            });
            const data = await res.json();
            if (data.reply) {
                setMessages([
                    { role: 'assistant', content: data.reply }
                ]);
            }
        } catch (err) {
            console.error(err);
            setMessages([{
                role: 'assistant',
                content: `¡Hola ${form.full_name.split(' ')[0]}! Bienvenida a Elena Atelier. Veo que te interesa nuestro curso "${selectedCourse?.name}". ¿En qué puedo ayudarte?`
            }]);
        } finally {
            setChatLoading(false);
        }
    }, [aiGreetingSent, form, selectedCourse, leadId]);

    // Trigger AI greeting when chat panel opens
    useEffect(() => {
        if (showChat && !aiGreetingSent) {
            sendAIGreeting();
        }
    }, [showChat, aiGreetingSent, sendAIGreeting]);

    const sendMessage = async () => {
        if (!inputMsg.trim() || chatLoading) return;
        const userMsg: Message = { role: 'user', content: inputMsg.trim() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInputMsg('');
        setChatLoading(true);

        try {
            const res = await fetch('/api/cursos/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages,
                    leadId,
                    leadName: form.full_name,
                    courseId: form.course_id,
                    courseName: selectedCourse?.name,
                    currentLevel: form.current_level,
                }),
            });
            const data = await res.json();
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, tuve un problema de conexión. ¿Puedes repetir tu pregunta?' }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handlePayment = () => {
        const text = encodeURIComponent(
            `¡Hola Elena! Soy ${form.full_name}.\n\nQuiero confirmar mi inscripción y realizar el pago del curso "${selectedCourse?.name}" por ${selectedCourse ? formatCLP(selectedCourse.price) : ''}.\n\nMi email: ${form.email}\nTeléfono: ${form.phone}\nNivel: ${LEVELS.find(l => l.value === form.current_level)?.label}\n\n¡Gracias!`
        );
        window.open(`https://wa.me/${process.env.NEXT_PUBLIC_ELENA_WHATSAPP || '56912345678'}?text=${text}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-brand-charcoal text-white font-sans">
            {/* Header */}
            <header className="border-b border-white/10 px-6 h-16 flex items-center justify-between sticky top-0 bg-brand-charcoal/95 backdrop-blur-sm z-10">
                <Link href="/cursos" className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-brand-sand transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Volver a Cursos
                </Link>
                <div className="flex flex-col items-stretch w-max">
                    <div className="flex justify-between font-serif text-lg font-black uppercase text-white leading-none tracking-widest">
                        <span>E</span><span>L</span><span>E</span><span>N</span><span>A</span>
                    </div>
                    <div className="font-sans text-[0.5rem] font-bold uppercase text-brand-sand/60 mt-0.5 text-center tracking-[0.35em]">
                        La Costurera
                    </div>
                </div>
                {/* Steps indicator */}
                <div className="flex items-center gap-2">
                    {[1, 2].map(n => (
                        <div key={n} className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold border transition-all ${
                            step > n ? 'bg-brand-sand text-brand-charcoal border-brand-sand' 
                            : step === n ? 'bg-brand-sand/20 text-brand-sand border-brand-sand/50' 
                            : 'bg-white/5 text-white/30 border-white/10'
                        }`}>
                            {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
                        </div>
                    ))}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-12">

                {/* ═══════════════════════════════════════════ */}
                {/* STEP 1: Lead Capture Form                  */}
                {/* ═══════════════════════════════════════════ */}
                {step === 1 && (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-sand font-bold">Paso 1 de 2</p>
                            <h1 className="font-serif text-4xl text-white">Cuéntanos sobre ti</h1>
                            <p className="text-white/50 text-sm">Completa tus datos para reservar tu lugar en el curso.</p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/50">Nombre Completo *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.full_name}
                                        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                        placeholder="María González"
                                        className="w-full bg-white/5 border border-white/10 focus:border-brand-sand rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/50">Correo Electrónico *</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        placeholder="tu@correo.com"
                                        className="w-full bg-white/5 border border-white/10 focus:border-brand-sand rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/50">Teléfono *</label>
                                <input
                                    type="tel"
                                    required
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="+56 9 1234 5678"
                                    className="w-full bg-white/5 border border-white/10 focus:border-brand-sand rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/50">Curso de Interés *</label>
                                <div className="relative">
                                    <select
                                        required
                                        value={form.course_id}
                                        onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 focus:border-brand-sand rounded-sm px-4 py-3 pr-10 text-sm text-white outline-none transition-colors appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-brand-charcoal text-white/40">-- Selecciona un curso --</option>
                                        {COURSES.map(c => (
                                            <option key={c.id} value={c.id} className="bg-brand-charcoal text-white">
                                                {c.name} — {formatCLP(c.price)}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/50">Tu Nivel de Costura Actual *</label>
                                <div className="relative">
                                    <select
                                        required
                                        value={form.current_level}
                                        onChange={e => setForm(f => ({ ...f, current_level: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 focus:border-brand-sand rounded-sm px-4 py-3 pr-10 text-sm text-white outline-none transition-colors appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-brand-charcoal text-white/40">-- Selecciona tu nivel --</option>
                                        {LEVELS.map(l => (
                                            <option key={l.value} value={l.value} className="bg-brand-charcoal text-white">
                                                {l.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/50">¿Alguna pregunta o comentario? (opcional)</label>
                                <textarea
                                    value={form.message}
                                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                    placeholder="Ej: ¿Puedo ir con mi propia máquina? ¿Hay estacionamiento en el edificio?"
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 focus:border-brand-sand rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors resize-none"
                                />
                            </div>

                             <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting || !form.full_name || !form.email || !form.phone || !form.course_id || !form.current_level}
                                    className="w-full py-4.5 bg-brand-sand text-brand-charcoal font-black text-xs uppercase tracking-widest rounded-sm hover:bg-white hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-sand/10 hover:shadow-white/10 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer border border-brand-sand hover:border-white"
                                    style={{ height: '56px' }}
                                >
                                    {submitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Continuar al Pago
                                            <ArrowRight className="w-4 h-4 shrink-0" />
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-center text-[10px] text-white/30">
                                Tus datos están seguros y no serán compartidos con terceros.
                            </p>
                        </form>
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* STEP 2: Digital Luxury Pass + Payment       */}
                {/* ═══════════════════════════════════════════ */}
                {step === 2 && (
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="text-center space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-sand font-bold">Paso 2 de 2</p>
                            <h1 className="font-serif text-3xl text-white">¡Tu Pase de Acceso, {form.full_name.split(' ')[0]}!</h1>
                            <p className="text-white/50 text-sm">Confirma el pago para activar tu matrícula y reservar tu lugar.</p>
                        </div>

                        {/* Luxury Digital Pass */}
                        <div className="relative border border-brand-sand/30 p-8 bg-black/40 rounded-sm shadow-2xl space-y-8 overflow-hidden">
                            {/* Watermark */}
                            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                                <Sparkles className="w-64 h-64 text-brand-sand" />
                            </div>

                            {/* Pass Header */}
                            <div className="flex justify-between items-start border-b border-white/10 pb-6">
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase tracking-[0.3em] text-brand-sand font-bold block">Digital Luxury Pass</span>
                                    <h2 className="font-serif text-2xl text-white">{selectedCourse?.name}</h2>
                                    <p className="text-[10px] font-mono text-white/40">ID: {(leadId || 'PENDING').substring(0, 8).toUpperCase()}</p>
                                </div>
                                <div className="px-3 py-1 bg-brand-sand/15 border border-brand-sand/30 rounded-sm text-[9px] uppercase tracking-widest text-brand-sand font-bold">
                                    Pendiente de Pago
                                </div>
                            </div>

                            {/* Pass Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase tracking-widest text-white/40 block">Titular del Pase</span>
                                    <p className="font-medium text-white">{form.full_name}</p>
                                    <p className="text-xs text-white/50">{form.email}</p>
                                    <p className="text-xs text-white/50">{form.phone}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] uppercase tracking-widest text-white/40 block">Nivel Asignado</span>
                                    <p className="font-medium text-white">
                                        {LEVELS.find(l => l.value === form.current_level)?.label}
                                    </p>
                                </div>
                            </div>

                            {/* Payment breakdown */}
                            <div className="border-t border-white/10 pt-6 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/50">Valor del Curso</span>
                                    <span className="text-white">{selectedCourse ? formatCLP(selectedCourse.originalPrice || selectedCourse.price) : ''}</span>
                                </div>
                                {selectedCourse?.originalPrice && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/50">Descuento Promocional</span>
                                        <span className="text-green-400 font-bold">
                                            -{formatCLP(selectedCourse.originalPrice - selectedCourse.price)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/50">Matrícula y Materiales</span>
                                    <span className="text-green-400 font-bold uppercase tracking-wider text-[10px]">¡Gratis! Incluido</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                    <span className="font-serif text-lg text-white">Total a Pagar</span>
                                    <span className="font-serif text-3xl text-brand-sand font-bold">
                                        {selectedCourse ? formatCLP(selectedCourse.price) : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="border-t border-white/5 pt-6 text-center">
                                <p className="text-[9px] uppercase tracking-widest text-white/30">Lugar de clases</p>
                                <p className="text-xs text-white/60">Tabancura 1091, Oficina 319, Vitacura, Santiago</p>
                            </div>
                        </div>

                        {/* CTA Actions */}
                        <div className="space-y-4 pt-2">
                            <button
                                onClick={handlePayment}
                                className="w-full py-4.5 bg-brand-sand text-brand-charcoal font-black text-xs uppercase tracking-widest rounded-sm hover:bg-white hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-sand/15 cursor-pointer border border-brand-sand"
                                style={{ height: '56px' }}
                            >
                                <ShieldCheck className="w-5 h-5" />
                                Confirmar y Pagar
                                <ArrowRight className="w-4 h-4 shrink-0" />
                            </button>

                            <div className="flex items-center justify-center gap-2 text-[10px] text-white/30">
                                <ShieldCheck className="w-3 h-3" />
                                Pago seguro · Te contactaremos para coordinar el método de pago
                            </div>

                            {/* Optional: Chat with AI */}
                            <button
                                onClick={() => setShowChat(!showChat)}
                                className="w-full py-3 bg-white/5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                {showChat ? 'Cerrar Chat' : '¿Tienes dudas? Pregúntale a nuestra asesora'}
                            </button>
                        </div>

                        {/* Collapsible AI Chat Panel */}
                        {showChat && (
                            <div className="border border-white/10 rounded-sm bg-black/30 overflow-hidden flex flex-col animate-in slide-in-from-top duration-300" style={{ height: '380px' }}>
                                {/* Chat Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-brand-sand/20 flex items-center justify-center">
                                            <Sparkles className="w-3 h-3 text-brand-sand" />
                                        </div>
                                        <span className="text-xs font-bold text-white/70">Elena IA · Asesora</span>
                                    </div>
                                    <button onClick={() => setShowChat(false)} className="text-white/30 hover:text-white transition-colors cursor-pointer">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.length === 0 && chatLoading && (
                                        <div className="flex items-center gap-3 text-white/40 text-sm">
                                            <div className="w-7 h-7 rounded-full bg-brand-sand/20 flex items-center justify-center shrink-0">
                                                <Sparkles className="w-3.5 h-3.5 text-brand-sand" />
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-brand-sand/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 rounded-full bg-brand-sand/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 rounded-full bg-brand-sand/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'assistant' && (
                                                <div className="w-7 h-7 rounded-full bg-brand-sand/20 flex items-center justify-center shrink-0 mt-1">
                                                    <Sparkles className="w-3.5 h-3.5 text-brand-sand" />
                                                </div>
                                            )}
                                            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-sm text-[13px] leading-relaxed ${
                                                msg.role === 'user'
                                                    ? 'bg-brand-sand/15 text-white border border-brand-sand/20'
                                                    : 'bg-white/5 text-white/90 border border-white/10'
                                            }`}>
                                                {msg.content}
                                            </div>
                                            {msg.role === 'user' && (
                                                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                                                    <User className="w-3.5 h-3.5 text-white/50" />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {chatLoading && messages.length > 0 && (
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-brand-sand/20 flex items-center justify-center shrink-0">
                                                <Sparkles className="w-3.5 h-3.5 text-brand-sand" />
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-brand-sand/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 rounded-full bg-brand-sand/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 rounded-full bg-brand-sand/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input */}
                                <div className="border-t border-white/10 p-3 flex gap-2 bg-white/5">
                                    <input
                                        type="text"
                                        value={inputMsg}
                                        onChange={e => setInputMsg(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Escribe tu pregunta..."
                                        className="flex-1 bg-white/5 border border-white/10 focus:border-brand-sand rounded-sm px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors"
                                        disabled={chatLoading}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!inputMsg.trim() || chatLoading}
                                        className="px-3.5 py-2.5 bg-brand-sand text-brand-charcoal rounded-sm hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function InscripcionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-brand-charcoal flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-sand animate-spin" />
            </div>
        }>
            <InscripcionContent />
        </Suspense>
    );
}
