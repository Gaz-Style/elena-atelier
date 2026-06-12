'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquare, ArrowRight, Loader2, Sparkles, Heart } from 'lucide-react';
import { submitPrivateFeedbackAction } from './actions';

export default function ReviewPage() {
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [step, setStep] = useState<'rating' | 'redirection' | 'feedback' | 'success'>('rating');
    
    // Feedback form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const googleReviewUrl = "https://g.page/r/Cfv2lRZLdYUuEBM/review";

    const handleRatingSelect = (selectedRating: number) => {
        setRating(selectedRating);
        if (selectedRating >= 4) {
            setStep('redirection');
        } else {
            setStep('feedback');
        }
    };

    const handleSubmitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await submitPrivateFeedbackAction({
                name,
                email,
                phone,
                rating,
                message
            });
            if (res.success) {
                setStep('success');
            } else {
                alert("Hubo un detalle al enviar tu comentario. Por favor, vuelve a intentarlo.");
            }
        } catch (err) {
            console.error(err);
            alert("Ocurrió un error inesperado.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className="min-h-screen text-white flex flex-col justify-between p-6 relative overflow-hidden font-sans bg-cover bg-center"
            style={{ backgroundImage: "linear-gradient(to bottom, rgba(26, 26, 26, 0.88), rgba(26, 26, 26, 0.82), rgba(26, 26, 26, 0.92)), url('/elena-taller.png')" }}
        >
            {/* Decorative organic shapes for background */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#C17F5F] mix-blend-screen filter blur-[150px] opacity-[0.06] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C17F5F] mix-blend-screen filter blur-[120px] opacity-[0.06]"></div>

            {/* Header / Brand Logo */}
            <header className="w-full max-w-md mx-auto pt-8 pb-4 text-center z-10">
                <table align="center" border={0} cellPadding={0} cellSpacing={0} className="margin: 0 auto; width: 180px; border-collapse: collapse;">
                    <tbody>
                        <tr>
                            <td>
                                <table border={0} cellPadding={0} cellSpacing={0} className="w-full border-collapse">
                                    <tbody>
                                        <tr>
                                            <td align="left" className="font-serif text-3xl font-black text-white leading-none tracking-[0.2em] uppercase">E</td>
                                            <td align="center" className="font-serif text-3xl font-black text-white leading-none tracking-[0.2em] uppercase">L</td>
                                            <td align="center" className="font-serif text-3xl font-black text-white leading-none tracking-[0.2em] uppercase">E</td>
                                            <td align="center" className="font-serif text-3xl font-black text-white leading-none tracking-[0.2em] uppercase">N</td>
                                            <td align="right" className="font-serif text-3xl font-black text-white leading-none tracking-[0.2em] uppercase">A</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td className="pt-2 font-sans text-[9px] font-bold text-[#C17F5F] tracking-[0.45em] uppercase text-center">
                                LA COSTURERA
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p className="text-[8px] uppercase tracking-[0.3em] text-white/40 mt-4">Alta Costura & Sastrería de Autor</p>
            </header>

            {/* Main Interactive Card */}
            <main className="flex-1 flex items-center justify-center max-w-md w-full mx-auto py-12 z-10">
                <div className="w-full bg-[#242424]/60 backdrop-blur-md border border-white/10 p-8 rounded-sm shadow-2xl relative overflow-hidden transition-all duration-300">
                    
                    {/* STEP 1: Select Rating */}
                    {step === 'rating' && (
                        <div className="space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="space-y-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C17F5F]/15 text-[#C17F5F] text-[9px] uppercase tracking-widest rounded-full font-bold">
                                    <Sparkles className="w-3 h-3" /> Tu Experiencia nos Importa
                                </span>
                                <h2 className="font-serif text-3xl text-white tracking-tight leading-tight">¿Cómo calificarías tu visita a nuestro atelier?</h2>
                                <p className="text-xs text-white/50 leading-relaxed px-4">
                                    Cada prenda y cada ajuste se realizan con dedicación artesanal. Queremos saber tu opinión para seguir mejorando.
                                </p>
                            </div>

                            {/* Stars Container */}
                            <div className="flex items-center justify-center gap-2.5 py-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => handleRatingSelect(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="transition-all active:scale-90 duration-150 p-1"
                                    >
                                        <Star
                                            className={`w-9 h-9 transition-all duration-300 ${
                                                star <= (hoveredRating || rating)
                                                    ? 'fill-[#C17F5F] text-[#C17F5F] drop-shadow-[0_0_8px_rgba(193,127,95,0.4)] scale-110'
                                                    : 'text-white/20'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <p className="text-[10px] text-white/30 uppercase tracking-widest">
                                Selecciona de 1 a 5 estrellas para continuar
                            </p>
                        </div>
                    )}

                    {/* STEP 2: Redirection to Google Maps (For 4-5 Stars) */}
                    {step === 'redirection' && (
                        <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-[#C17F5F]/15 rounded-full flex items-center justify-center mx-auto text-[#C17F5F]">
                                <Heart className="w-8 h-8 fill-[#C17F5F] text-[#C17F5F]" />
                            </div>
                            
                            <div className="space-y-3">
                                <h3 className="font-serif text-2xl text-white tracking-tight">¡Muchas gracias por valorarnos!</h3>
                                <p className="text-xs text-white/60 leading-relaxed">
                                    Nos alegra saber que tu experiencia fue excelente. Para un atelier independiente como el nuestro, las reseñas en Google son fundamentales. ¿Nos ayudarías a crecer dejándonos tu reseña pública?
                                </p>
                            </div>

                            <div className="pt-4 space-y-3">
                                <a
                                    href={googleReviewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 bg-[#C17F5F] hover:bg-[#b05c4b] text-white text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm shadow-lg shadow-[#C17F5F]/20 flex items-center justify-center gap-2 group"
                                >
                                    Escribir Reseña en Google <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </a>
                                
                                <button
                                    onClick={() => setStep('rating')}
                                    className="w-full py-3.5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm"
                                >
                                    Volver
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Private Feedback Form (For 1-3 Stars) */}
                    {step === 'feedback' && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="space-y-2 text-center">
                                <h3 className="font-serif text-2xl text-white tracking-tight">Tu feedback es vital</h3>
                                <p className="text-xs text-white/60 leading-relaxed">
                                    Lamentamos mucho que tu experiencia no haya sido perfecta. Por favor, cuéntanos en privado qué ocurrió para que Elena pueda revisar tu caso personalmente.
                                </p>
                            </div>

                            <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-2">
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-widest text-white/40 block">Nombre Completo</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ej. María González"
                                        className="w-full p-3 bg-white/5 border border-white/10 focus:border-[#C17F5F] text-white rounded-sm text-xs outline-none transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase tracking-widest text-white/40 block">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="maria@email.com"
                                            className="w-full p-3 bg-white/5 border border-white/10 focus:border-[#C17F5F] text-white rounded-sm text-xs outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase tracking-widest text-white/40 block">Celular (Opcional)</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+569..."
                                            className="w-full p-3 bg-white/5 border border-white/10 focus:border-[#C17F5F] text-white rounded-sm text-xs outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-widest text-white/40 block">¿Qué podemos mejorar?</label>
                                    <textarea
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Por favor, cuéntanos en detalle qué ocurrió con tu calce, plazos o atención..."
                                        rows={4}
                                        className="w-full p-3 bg-white/5 border border-white/10 focus:border-[#C17F5F] text-white rounded-sm text-xs outline-none resize-none transition-colors"
                                    />
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep('rating')}
                                        className="flex-1 py-3.5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm"
                                    >
                                        Atrás
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 py-3.5 bg-[#C17F5F] hover:bg-[#b05c4b] disabled:opacity-50 text-white text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando...
                                            </>
                                        ) : (
                                            <>
                                                Enviar Comentario <MessageSquare className="w-3.5 h-3.5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* STEP 4: Success Message (For negative reviews submitted privately) */}
                    {step === 'success' && (
                        <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            
                            <div className="space-y-3">
                                <h3 className="font-serif text-2xl text-white tracking-tight">Comentario Recibido</h3>
                                <p className="text-xs text-white/60 leading-relaxed">
                                    Agradecemos enormemente tu honestidad. Tu mensaje ha sido enviado directamente a la dirección del atelier. Elena se pondrá en contacto contigo a la brevedad para resolver cualquier inconveniente.
                                </p>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={() => {
                                        setRating(0);
                                        setName('');
                                        setEmail('');
                                        setPhone('');
                                        setMessage('');
                                        setStep('rating');
                                    }}
                                    className="px-8 py-3.5 border border-white/10 hover:border-white/20 text-white text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full text-center py-8 z-10">
                <p className="text-[8px] tracking-[0.2em] text-white/30 uppercase">© {new Date().getFullYear()} Elena Atelier · Av. Tabancura 1091, Vitacura</p>
            </footer>
        </div>
    );
}
