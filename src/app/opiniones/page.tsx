'use client';
 
import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquare, ArrowRight, Loader2, Sparkles, Heart } from 'lucide-react';
import { submitPrivateFeedbackAction, submitPositiveFeedbackKpiAction } from './actions';
 
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

    // Negative feedback KPI states (for 1-3 stars)
    const [negKpiFit, setNegKpiFit] = useState(false);
    const [negKpiTime, setNegKpiTime] = useState(false);
    const [negKpiService, setNegKpiService] = useState(false);
    const [negKpiPrice, setNegKpiPrice] = useState(false);

    // KPI & Private suggestion states (for 4-5 stars)
    const [kpiQuality, setKpiQuality] = useState(false);
    const [kpiService, setKpiService] = useState(false);
    const [kpiProfessionalism, setKpiProfessionalism] = useState(false);
    const [improvementMessage, setImprovementMessage] = useState('');
    const [isSubmittingKpi, setIsSubmittingKpi] = useState(false);
 
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

        const selectedAspects: string[] = [];
        if (negKpiFit) selectedAspects.push("Calce o ajuste de la prenda");
        if (negKpiTime) selectedAspects.push("Tiempos de entrega o plazos");
        if (negKpiService) selectedAspects.push("Atención o comunicación");
        if (negKpiPrice) selectedAspects.push("Claridad en precios o presupuestos");

        let finalMessage = "";
        if (selectedAspects.length > 0) {
            finalMessage += `Aspectos a mejorar: ${selectedAspects.join(', ')}.\n`;
        }
        if (message.trim()) {
            finalMessage += `Comentarios: ${message}`;
        } else if (selectedAspects.length === 0) {
            alert("Por favor, selecciona al menos una opción o escribe tu sugerencia.");
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await submitPrivateFeedbackAction({
                name: "Anónimo",
                email: "anonimo@elena-atelier.com",
                phone: "",
                rating,
                message: finalMessage
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

    const handleKpiSubmitAndRedirect = async () => {
        setIsSubmittingKpi(true);
        try {
            await submitPositiveFeedbackKpiAction({
                rating,
                kpiQuality,
                kpiService,
                kpiProfessionalism,
                message: improvementMessage
            });
            window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
            setStep('success');
        } catch (err) {
            console.error(err);
            window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
            setStep('success');
        } finally {
            setIsSubmittingKpi(false);
        }
    };
 
    return (
        <div 
            className="min-h-screen text-white flex flex-col justify-between p-6 relative overflow-hidden font-sans bg-cover bg-center"
            style={{ backgroundImage: "linear-gradient(to bottom, rgba(26, 26, 26, 0.94), rgba(26, 26, 26, 0.90), rgba(26, 26, 26, 0.96)), url('/elena-taller.png')" }}
        >

            {/* Header / Brand Logo */}
            <header className="w-full max-w-[560px] mx-auto pt-8 pb-4 text-center z-10 flex flex-col items-center">
                <img src="/logotipo.png" alt="Elena La Costurera Logo" className="h-16 w-auto object-contain invert" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-4">Alta Costura & Sastrería de Autor</p>
            </header>

            {/* Main Interactive Card */}
            <main className="flex-1 flex items-center justify-center max-w-[560px] w-full mx-auto py-10 z-10">
                <div className="w-full bg-[#242424]/60 backdrop-blur-md border border-white/10 p-10 rounded-sm shadow-2xl relative overflow-hidden transition-all duration-300">
                    
                    {/* STEP 1: Select Rating */}
                    {step === 'rating' && (
                        <div className="space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="space-y-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C17F5F]/15 text-[#C17F5F] text-[10px] uppercase tracking-widest rounded-full font-bold">
                                    <Sparkles className="w-3.5 h-3.5" /> Tu Experiencia nos Importa
                                </span>
                                <h2 className="font-serif text-3xl md:text-4xl text-white tracking-tight leading-tight px-2">¿Cómo calificarías tu visita a nuestro atelier?</h2>
                            </div>

                            {/* Stars Container */}
                            <div className="flex items-center justify-center gap-3 py-4">
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
                                                    ? 'fill-[#C17F5F] text-[#C17F5F] drop-shadow-[0_0_10px_rgba(193,127,95,0.4)] scale-110'
                                                    : 'text-white/20'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <p className="text-xs text-white/30 uppercase tracking-widest">
                                Selecciona de 1 a 5 estrellas para continuar
                            </p>
                        </div>
                    )}

                    {/* STEP 2: Redirection to Google Maps (For 4-5 Stars) */}
                    {step === 'redirection' && (
                        <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-14 h-14 bg-[#C17F5F]/15 rounded-full flex items-center justify-center mx-auto text-[#C17F5F]">
                                <Heart className="w-7 h-7 fill-[#C17F5F] text-[#C17F5F]" />
                            </div>
                            
                            <div className="space-y-3">
                                <h3 className="font-serif text-2xl md:text-3xl text-white tracking-tight">¡Muchas gracias por valorarnos!</h3>
                                <p className="text-[14px] text-white/70 leading-relaxed max-w-[90%] mx-auto">
                                    Nos alegra saber que tu experiencia fue excelente.
                                </p>
                            </div>

                            {/* KPI Selection Section */}
                            <div className="space-y-4 text-left pt-2">
                                <span className="text-[11px] uppercase tracking-widest text-[#C17F5F] font-bold block mb-1">¿Qué fue lo que más te gustó del servicio?</span>
                                
                                <div className="space-y-3.5">
                                    <label className="flex items-start gap-3.5 cursor-pointer text-[14px] text-white/80 hover:text-white select-none py-1.5 px-2.5 rounded-sm hover:bg-white/5 transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={kpiQuality}
                                            onChange={(e) => setKpiQuality(e.target.checked)}
                                            className="mt-0.5 w-4.5 h-4.5 accent-[#C17F5F] cursor-pointer"
                                        />
                                        <span className="leading-tight">✨ La calidad y el resultado final de mi prenda.</span>
                                    </label>
                                    
                                    <label className="flex items-start gap-3.5 cursor-pointer text-[14px] text-white/80 hover:text-white select-none py-1.5 px-2.5 rounded-sm hover:bg-white/5 transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={kpiService}
                                            onChange={(e) => setKpiService(e.target.checked)}
                                            className="mt-0.5 w-4.5 h-4.5 accent-[#C17F5F] cursor-pointer"
                                        />
                                        <span className="leading-tight">❤️ La atención personalizada y el cariño durante todo el proceso.</span>
                                    </label>
                                    
                                    <label className="flex items-start gap-3.5 cursor-pointer text-[14px] text-white/80 hover:text-white select-none py-1.5 px-2.5 rounded-sm hover:bg-white/5 transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={kpiProfessionalism}
                                            onChange={(e) => setKpiProfessionalism(e.target.checked)}
                                            className="mt-0.5 w-4.5 h-4.5 accent-[#C17F5F] cursor-pointer"
                                        />
                                        <span className="leading-tight">🤝 El profesionalismo, la puntualidad y la confianza que me transmitieron.</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                <button
                                    onClick={handleKpiSubmitAndRedirect}
                                    disabled={isSubmittingKpi}
                                    className="w-full py-4 bg-[#C17F5F] hover:bg-[#b05c4b] disabled:opacity-50 text-white text-[12px] font-bold uppercase tracking-widest transition-all rounded-sm shadow-lg shadow-[#C17F5F]/20 flex items-center justify-center gap-2 group cursor-pointer"
                                >
                                    {isSubmittingKpi ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                                        </>
                                    ) : (
                                        <>
                                            Continuar a Google Review <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    onClick={() => setStep('rating')}
                                    className="w-full py-3 border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm cursor-pointer"
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
                                <h3 className="font-serif text-2xl md:text-3xl text-white tracking-tight">Queremos escucharte y mejorar</h3>
                                <p className="text-sm text-white/60 leading-relaxed">
                                    Cuéntanos qué podemos mejorar en tu experiencia en nuestro taller.
                                </p>
                            </div>

                            <form onSubmit={handleSubmitFeedback} className="space-y-5 pt-2">
                                {/* KPI Options to Improve */}
                                <div className="space-y-3 text-left">
                                    <span className="text-[11px] uppercase tracking-widest text-[#C17F5F] font-bold block mb-1">¿Qué aspectos consideras que debemos mejorar?</span>
                                    
                                    <div className="space-y-3">
                                        <label className="flex items-start gap-3.5 cursor-pointer text-[14px] text-white/80 hover:text-white select-none py-1 px-2.5 rounded-sm hover:bg-white/5 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={negKpiFit}
                                                onChange={(e) => setNegKpiFit(e.target.checked)}
                                                className="mt-0.5 w-4.5 h-4.5 accent-[#C17F5F] cursor-pointer"
                                            />
                                            <span className="leading-tight">📏 El calce o ajuste de la prenda.</span>
                                        </label>
                                        
                                        <label className="flex items-start gap-3.5 cursor-pointer text-[14px] text-white/80 hover:text-white select-none py-1 px-2.5 rounded-sm hover:bg-white/5 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={negKpiTime}
                                                onChange={(e) => setNegKpiTime(e.target.checked)}
                                                className="mt-0.5 w-4.5 h-4.5 accent-[#C17F5F] cursor-pointer"
                                            />
                                            <span className="leading-tight">⏱️ Los tiempos de entrega o plazos.</span>
                                        </label>
                                        
                                        <label className="flex items-start gap-3.5 cursor-pointer text-[14px] text-white/80 hover:text-white select-none py-1 px-2.5 rounded-sm hover:bg-white/5 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={negKpiService}
                                                onChange={(e) => setNegKpiService(e.target.checked)}
                                                className="mt-0.5 w-4.5 h-4.5 accent-[#C17F5F] cursor-pointer"
                                            />
                                            <span className="leading-tight">💬 La atención o comunicación.</span>
                                        </label>
                                        
                                        <label className="flex items-start gap-3.5 cursor-pointer text-[14px] text-white/80 hover:text-white select-none py-1 px-2.5 rounded-sm hover:bg-white/5 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={negKpiPrice}
                                                onChange={(e) => setNegKpiPrice(e.target.checked)}
                                                className="mt-0.5 w-4.5 h-4.5 accent-[#C17F5F] cursor-pointer"
                                            />
                                            <span className="leading-tight">💰 La claridad en precios o presupuestos.</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 block font-bold">¿Tienes algún comentario o sugerencia adicional?</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Por favor, cuéntanos aquí qué ocurrió o qué podemos hacer para mejorar..."
                                        rows={4}
                                        className="w-full p-3.5 bg-white/5 border border-white/10 focus:border-[#C17F5F] text-white rounded-sm text-sm outline-none resize-none transition-colors"
                                    />
                                </div>

                                <div className="pt-2 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep('rating')}
                                        className="flex-1 py-4 border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm cursor-pointer"
                                    >
                                        Atrás
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 py-4 bg-[#C17F5F] hover:bg-[#b05c4b] disabled:opacity-50 text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                                            </>
                                        ) : (
                                            <>
                                                Enviar Sugerencia <MessageSquare className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* STEP 4: Success Message */}
                    {step === 'success' && (
                        <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            
                            <div className="space-y-3">
                                <h3 className="font-serif text-2xl md:text-3xl text-white tracking-tight">Comentario Recibido</h3>
                                <p className="text-sm text-white/60 leading-relaxed px-2">
                                    Agradecemos enormemente tu honestidad. Tu mensaje ha sido enviado directamente a la dirección del atelier. Elena se pondrá en contacto contigo a la brevedad para resolver cualquier inconveniente.
                                </p>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={() => {
                                        window.close();
                                        setTimeout(() => {
                                            window.location.href = "https://elenalacosturera.cl";
                                        }, 100);
                                    }}
                                    className="px-10 py-4 border border-white/10 hover:border-white/20 text-white text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm cursor-pointer"
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
                <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase">© {new Date().getFullYear()} Elena Atelier · Av. Tabancura 1091, Vitacura</p>
            </footer>
        </div>
    );
}
