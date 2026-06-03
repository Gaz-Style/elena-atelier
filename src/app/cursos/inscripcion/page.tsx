'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Loader2, Send, CheckCircle2, User, Sparkles, Phone } from 'lucide-react';

const COURSES = [
    { id: 'iniciacion', name: 'Iniciación a la Costura', price: 52500, level: 'Principiante' },
    { id: 'confeccion', name: 'Costura & Confección', price: 75000, level: 'Intermedio' },
    { id: 'arreglos', name: 'Arreglos & Sastrería', price: 65000, level: 'Intermedio' },
    { id: 'patronaje', name: 'Patronaje & Diseño', price: 120000, level: 'Avanzado' },
    { id: 'pack', name: 'Pack Formación Completa', price: 699999, level: 'Todos los niveles' },
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
    const [isHandoff, setIsHandoff] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [inputMsg, setInputMsg] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
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

    // Step 1 submit: save lead
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.full_name || !form.email || !form.course_id || !form.current_level) return;
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
                setStep(2);
                // Send initial AI greeting
                sendAIGreeting(data.leadId);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const sendAIGreeting = async (id: string) => {
        setChatLoading(true);
        try {
            const res = await fetch('/api/cursos/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: `Hola, me llamo ${form.full_name} y me interesa el curso "${selectedCourse?.name}". Mi nivel actual es: ${LEVELS.find(l => l.value === form.current_level)?.label}.${form.message ? ` Mi consulta: ${form.message}` : ''}`
                    }],
                    leadId: id,
                    leadName: form.full_name,
                    courseId: form.course_id,
                    courseName: selectedCourse?.name,
                    currentLevel: form.current_level,
                }),
            });
            const data = await res.json();
            if (data.reply) {
                setMessages([
                    { role: 'user', content: `Hola, me interesa el curso "${selectedCourse?.name}". Mi nivel: ${LEVELS.find(l => l.value === form.current_level)?.label}.${form.message ? ` ${form.message}` : ''}` },
                    { role: 'assistant', content: data.reply }
                ]);
                if (data.isHandoff) setIsHandoff(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setChatLoading(false);
        }
    };

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
                if (data.isHandoff) setIsHandoff(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setChatLoading(false);
        }
    };

    const whatsappHandoff = () => {
        const transcript = messages.map(m => `${m.role === 'user' ? form.full_name : 'Elena IA'}: ${m.content}`).join('\n');
        const text = encodeURIComponent(
            `Hola Elena, te contacta ${form.full_name} (${form.email}${form.phone ? ` / ${form.phone}` : ''}). Está interesada en el curso "${selectedCourse?.name}". Su nivel: ${LEVELS.find(l => l.value === form.current_level)?.label}.\n\nConversación con IA:\n${transcript}`
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
                            step >= n ? 'bg-brand-sand text-brand-charcoal border-brand-sand' : 'bg-white/5 text-white/30 border-white/10'
                        }`}>
                            {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
                        </div>
                    ))}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-12">

                {/* STEP 1: Lead Capture Form */}
                {step === 1 && (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-sand font-bold">Paso 1 de 2</p>
                            <h1 className="font-serif text-4xl text-white">Cuéntanos sobre ti</h1>
                            <p className="text-white/50 text-sm">Antes de conectarte con nuestra asistente, necesitamos algunos datos para personalizar tu experiencia.</p>
                        </div>

                        {selectedCourse && (
                            <div className="bg-white/5 border border-brand-sand/20 rounded-sm p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-brand-sand/60 font-bold mb-1">Curso seleccionado</p>
                                    <p className="font-serif text-lg text-white">{selectedCourse.name}</p>
                                    <p className="text-xs text-white/40">{selectedCourse.level}</p>
                                </div>
                                <p className="font-serif text-2xl text-brand-sand">{formatCLP(selectedCourse.price)}</p>
                            </div>
                        )}

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
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/50">Teléfono (opcional)</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="+56 9 1234 5678"
                                    className="w-full bg-white/5 border border-white/10 focus:border-brand-sand rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/50">Curso de Interés *</label>
                                <select
                                    required
                                    value={form.course_id}
                                    onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 focus:border-brand-sand rounded-sm px-4 py-3 text-sm text-white outline-none transition-colors appearance-none"
                                >
                                    <option value="" className="bg-brand-charcoal">-- Selecciona un curso --</option>
                                    {COURSES.map(c => (
                                        <option key={c.id} value={c.id} className="bg-brand-charcoal">{c.name} — {formatCLP(c.price)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-white/50">Tu Nivel de Costura Actual *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {LEVELS.map(l => (
                                        <button
                                            type="button"
                                            key={l.value}
                                            onClick={() => setForm(f => ({ ...f, current_level: l.value }))}
                                            className={`px-4 py-3 rounded-sm border text-sm font-medium text-left transition-all ${
                                                form.current_level === l.value
                                                    ? 'border-brand-sand bg-brand-sand/10 text-brand-sand'
                                                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
                                            }`}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
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

                            <button
                                type="submit"
                                disabled={submitting || !form.full_name || !form.email || !form.course_id || !form.current_level}
                                className="w-full py-4 bg-brand-sand text-brand-charcoal font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continuar al Chat <ArrowRight className="w-4 h-4" /></>}
                            </button>

                            <p className="text-center text-[10px] text-white/30">
                                Tus datos están seguros y no serán compartidos con terceros.
                            </p>
                        </form>
                    </div>
                )}

                {/* STEP 2: AI Chat */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-sand font-bold">Paso 2 de 2</p>
                            <h1 className="font-serif text-4xl text-white">Hola, {form.full_name.split(' ')[0]} 👋</h1>
                            <p className="text-white/50 text-sm">Nuestra asistente IA está lista para resolver todas tus dudas sobre el curso.</p>
                        </div>

                        {/* Course context chip */}
                        {selectedCourse && (
                            <div className="flex items-center justify-center gap-3 flex-wrap">
                                <span className="px-3 py-1.5 bg-brand-sand/10 border border-brand-sand/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-sand">
                                    {selectedCourse.name}
                                </span>
                                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/50">
                                    {formatCLP(selectedCourse.price)}
                                </span>
                            </div>
                        )}

                        {/* Chat window */}
                        <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden flex flex-col" style={{ minHeight: '420px', maxHeight: '500px' }}>
                            {/* Chat header */}
                            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
                                <div className="w-8 h-8 rounded-full bg-brand-sand/20 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-brand-sand" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Elena IA</p>
                                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">En línea</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {messages.length === 0 && chatLoading && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-full bg-brand-sand/20 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-3.5 h-3.5 text-brand-sand" />
                                        </div>
                                        <div className="bg-white/10 rounded-sm px-4 py-3">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-brand-sand/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-brand-sand/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-brand-sand/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                            msg.role === 'user' ? 'bg-white/10' : 'bg-brand-sand/20'
                                        }`}>
                                            {msg.role === 'user'
                                                ? <User className="w-3.5 h-3.5 text-white/60" />
                                                : <Sparkles className="w-3.5 h-3.5 text-brand-sand" />
                                            }
                                        </div>
                                        <div className={`max-w-[80%] rounded-sm px-4 py-3 text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-brand-sand/20 text-white/90'
                                                : 'bg-white/10 text-white/90'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}

                                {messages.length > 0 && chatLoading && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-full bg-brand-sand/20 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-3.5 h-3.5 text-brand-sand" />
                                        </div>
                                        <div className="bg-white/10 rounded-sm px-4 py-3">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-brand-sand/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-brand-sand/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-brand-sand/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input */}
                            {!isHandoff && (
                                <div className="border-t border-white/10 p-4 flex gap-3">
                                    <input
                                        type="text"
                                        value={inputMsg}
                                        onChange={e => setInputMsg(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                        placeholder="Escribe tu pregunta..."
                                        className="flex-1 bg-white/5 border border-white/10 focus:border-brand-sand rounded-sm px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-colors"
                                        disabled={chatLoading}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!inputMsg.trim() || chatLoading}
                                        className="px-4 py-2.5 bg-brand-sand text-brand-charcoal rounded-sm hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-3">
                            {isHandoff ? (
                                <>
                                    <div className="text-center p-4 bg-white/5 border border-brand-sand/20 rounded-sm">
                                        <p className="text-sm text-white/70">Elena estará encantada de atenderte personalmente 💛</p>
                                    </div>
                                    <button
                                        onClick={whatsappHandoff}
                                        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        <Phone className="w-4 h-4" /> Conectar con Elena por WhatsApp
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={whatsappHandoff}
                                    className="w-full py-3 bg-white/5 border border-white/10 hover:border-white/30 text-white/60 hover:text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <Phone className="w-3.5 h-3.5" /> Prefiero hablar directamente con Elena
                                </button>
                            )}
                        </div>
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
