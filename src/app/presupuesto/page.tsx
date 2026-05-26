'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, CreditCard, Store, Calendar, MapPin, Check } from 'lucide-react';
import Link from 'next/link';
import { createPaymentPreference } from '@/lib/payments';

function BudgetContent() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<any>(null);
    const [status, setStatus] = useState<'viewing' | 'accepted' | 'paying'>('viewing');
    const [paymentMethod, setPaymentMethod] = useState<'web' | 'presencial' | null>(null);

    useEffect(() => {
        const encodedData = searchParams.get('d');
        if (encodedData) {
            try {
                const decoded = JSON.parse(decodeURIComponent(escape(atob(encodedData))));
                setData(decoded);
            } catch (e) {
                console.error("Error decoding budget data", e);
            }
        }
    }, [searchParams]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
    };

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-brand-charcoal text-white font-sans">
                <div className="text-center space-y-6">
                    <h1 className="font-serif text-3xl text-brand-sand">Presupuesto no encontrado</h1>
                    <p className="text-white/60 text-sm">El link parece ser inválido o ha expirado.</p>
                    <Link href="/" className="inline-block px-8 py-3 border border-white/20 hover:border-brand-sand text-white text-xs uppercase tracking-widest font-bold transition-all">Volver al sitio</Link>
                </div>
            </div>
        );
    }

    if (status === 'paying' && paymentMethod === 'presencial') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-brand-charcoal text-white font-sans">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-2xl p-12 text-center shadow-2xl border border-white/10 rounded-sm space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-10 h-10 text-green-400" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="font-serif text-3xl text-brand-sand">¡Presupuesto Aceptado!</h1>
                        <p className="text-white/60 text-sm leading-relaxed">Hemos recibido tu confirmación. Te esperamos en nuestro Atelier para dar inicio a tu proyecto.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-sm text-left space-y-4">
                        <div className="flex items-start gap-4 text-sm">
                            <MapPin className="w-5 h-5 text-brand-sand shrink-0" />
                            <p className="text-white/80">Tabancura 1091, Of. 319 · Vitacura<br/>Santiago, Chile</p>
                        </div>
                        <div className="flex items-start gap-4 text-sm">
                            <Calendar className="w-5 h-5 text-brand-sand shrink-0" />
                            <p className="text-white/80">Horario: Lun - Vie de 10:00 a 19:00</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => window.close()} 
                        className="w-full glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] cursor-pointer"
                    >
                        <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                            Cerrar Ventana
                        </span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-charcoal text-white pb-32 font-sans overflow-x-hidden">
            {/* Header / Brand */}
            <header className="bg-white/[0.02] border-b border-white/10 p-8 md:p-12">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="font-serif text-4xl md:text-5xl tracking-tighter text-white">ELENA ATELIER</h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-sand mt-2 font-semibold">Alta Costura & Sastrería a Medida</p>
                    </div>
                    <div className="hidden md:block text-right text-[10px] uppercase tracking-widest text-white/40 font-semibold">
                        <p>Santiago, Chile</p>
                        <p className="mt-1">elenalacosturera.com</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto mt-12 p-4 md:p-0">
                <div className="bg-white/[0.03] border border-white/10 shadow-2xl rounded-sm overflow-hidden">
                    {/* Document Info Bar */}
                    <div className="bg-white/5 border-b border-white/10 p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-brand-sand">
                        <div className="flex items-center gap-4">
                            <span className="opacity-50">Documento:</span>
                            <span>Presupuesto Formal de Trabajo</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="opacity-50">Fecha:</span>
                            <span>{new Date().toLocaleDateString('es-CL')}</span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 md:p-16 space-y-16">
                        <div className="space-y-4">
                            <h2 className="font-serif text-2xl border-b border-white/10 pb-4 text-white">Detalle de tu Proyecto</h2>
                            <p className="text-sm text-white/60">Estimada clienta, a continuación presentamos la propuesta formal para el trabajo solicitado en nuestro atelier.</p>
                        </div>

                        <div className="space-y-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-widest text-white/40">
                                        <th className="py-4">Servicio / Prenda</th>
                                        <th className="py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {data.cart.map((item: any, i: number) => (
                                        <tr key={i} className="group">
                                            <td className="py-6">
                                                <p className="font-serif text-lg text-white">{item.name}</p>
                                                <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-bold">{item.category}</p>
                                                {item.costBreakdown && (
                                                    <div className="mt-4 flex gap-2">
                                                        <span className="inline-flex items-center gap-1 bg-brand-sand/10 text-brand-sand px-2.5 py-1 rounded-sm text-[8px] font-bold uppercase tracking-tight border border-brand-sand/10">
                                                            <CheckCircle className="w-2.5 h-2.5" /> Alta Costura
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 bg-brand-sand/10 text-brand-sand px-2.5 py-1 rounded-sm text-[8px] font-bold uppercase tracking-tight border border-brand-sand/10">
                                                            Diseño Personalizado
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-6 text-right font-serif text-xl font-medium text-white">
                                                {formatCurrency(item.price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Section */}
                        <div className="flex justify-end pt-12 border-t border-white/10">
                            <div className="w-full md:w-80 space-y-6">
                                <div className="space-y-3 text-sm text-white/60">
                                    <div className="flex justify-between">
                                        <span>Subtotal Neto</span>
                                        <span>{formatCurrency(Math.round(data.total / 1.19))}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Impuestos (IVA 19%)</span>
                                        <span>{formatCurrency(Math.round(data.total - (data.total / 1.19)))}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end pt-6 border-t-2 border-brand-sand/40">
                                    <span className="font-serif text-xl font-bold uppercase tracking-tighter text-brand-sand">Total Presupuesto</span>
                                    <span className="font-serif text-4xl font-bold text-white">{formatCurrency(data.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Terms Section */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-sm space-y-4">
                            <h3 className="text-[10px] uppercase tracking-widest font-bold text-brand-sand flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-brand-sand" /> Términos y Condiciones
                            </h3>
                            <ul className="text-xs text-white/50 space-y-2 list-disc pl-4 leading-relaxed">
                                <li>Este presupuesto tiene una validez de 15 días a contar de hoy.</li>
                                <li>Para iniciar el trabajo de confección o ajuste, se requiere el pago del **50% del total** como abono.</li>
                                <li>Las fechas de fitting (prueba) se agendarán una vez confirmado el primer pago.</li>
                                <li>Precios expresados en pesos chilenos (CLP) con IVA incluido.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Interaction Bar (Stick to bottom on mobile) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-black/60 backdrop-blur-xl border-t border-white/10 z-50">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    {status === 'viewing' ? (
                        <>
                            <div className="text-center md:text-left">
                                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">¿Deseas confirmar este presupuesto?</p>
                                <p className="text-sm text-white/80 mt-1">Haz clic para aceptar y elegir tu método de pago.</p>
                            </div>
                            <button 
                                onClick={() => setStatus('accepted')}
                                className="w-full md:w-auto glass-btn group relative inline-flex items-center justify-center gap-3 px-10 py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] cursor-pointer"
                            >
                                <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                                    Aceptar Presupuesto
                                </span>
                            </button>
                        </>
                    ) : status === 'accepted' ? (
                        <div className="w-full space-y-6 animate-in slide-in-from-bottom duration-500">
                            <div className="text-center">
                                <h4 className="font-serif text-2xl text-white">Selecciona tu método de pago</h4>
                                <p className="text-xs text-brand-sand mt-1 uppercase tracking-widest font-bold">Confirmación de Orden</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button 
                                    onClick={async () => {
                                        setPaymentMethod('web');
                                        setStatus('paying');
                                        try {
                                            const res = await createPaymentPreference(data.cart);
                                            window.location.href = res.init_point;
                                        } catch (err) {
                                            console.error('Error redirecting to MP:', err);
                                            alert('Ocurrió un error al conectar con Mercado Pago. Por favor reintente.');
                                            setStatus('accepted');
                                            setPaymentMethod(null);
                                        }
                                    }}
                                    className="flex flex-col items-center gap-4 p-8 border border-white/10 bg-white/5 hover:border-brand-sand rounded-sm text-white transition-all group cursor-pointer"
                                >
                                    <div className="bg-white/5 p-4 rounded-full group-hover:scale-110 transition-transform">
                                        <CreditCard className="w-8 h-8 text-brand-sand" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold uppercase tracking-widest text-white">Pago Online Web</p>
                                        <p className="text-[10px] text-white/50 mt-1">Mercado Pago / Tarjetas / Transferencia</p>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => {
                                        setPaymentMethod('presencial');
                                        setStatus('paying');
                                    }}
                                    className="flex flex-col items-center gap-4 p-8 border border-white/10 bg-white/5 hover:border-brand-sand rounded-sm text-white transition-all group cursor-pointer"
                                >
                                    <div className="bg-white/5 p-4 rounded-full group-hover:scale-110 transition-transform">
                                        <Store className="w-8 h-8 text-brand-sand" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold uppercase tracking-widest text-white">Pagar en Atelier</p>
                                        <p className="text-[10px] text-white/50 mt-1">Confirmar ahora y pagar presencialmente</p>
                                    </div>
                                </button>
                            </div>
                            <button 
                                onClick={() => setStatus('viewing')} 
                                className="w-full text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-brand-sand cursor-pointer transition-colors"
                            >
                                Volver al detalle
                            </button>
                        </div>
                    ) : (
                        <div className="w-full text-center py-4 space-y-4">
                            <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 text-brand-sand rounded-full text-sm font-bold animate-pulse">
                                <span className="w-4 h-4 rounded-full border-2 border-brand-sand border-t-transparent animate-spin" /> Redirigiendo a pasarela Mercado Pago...
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function BudgetPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-brand-charcoal text-white flex items-center justify-center font-serif text-2xl">Cargando Presupuesto...</div>}>
            <BudgetContent />
        </Suspense>
    );
}
