'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, CreditCard, Store, Calendar as CalendarIcon, MapPin, Check, Clock, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createWebpayTransaction } from '@/lib/transbank';
import { getBudgetAction, createPOSOrdersAction, updateBudgetStatusAction, getAvailableSlotsAction, confirmPresencialBookingAction } from '../admin/pos/actions';

function BudgetContent() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<any>(null);
    const [status, setStatus] = useState<'viewing' | 'accepted' | 'scheduling' | 'paying'>('viewing');
    const [paymentMethod, setPaymentMethod] = useState<'web' | 'presencial' | null>(null);

    // Scheduling state
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);

    useEffect(() => {
        const loadBudget = async () => {
            const shortId = searchParams.get('id');
            const encodedData = searchParams.get('d');
            
            if (shortId) {
                try {
                    const result = await getBudgetAction(shortId);
                    if (result.success && result.data) {
                        setData(result.data);
                    }
                } catch (e) {
                    console.error("Error fetching budget from DB", e);
                }
            } else if (encodedData) {
                // Backward compatibility for old base64 links
                try {
                    const decoded = JSON.parse(decodeURIComponent(escape(atob(encodedData))));
                    setData(decoded);
                } catch (e) {
                    console.error("Error decoding old budget data", e);
                }
            }
        };
        
        loadBudget();
    }, [searchParams]);

    useEffect(() => {
        if (selectedDate) {
            const fetchSlots = async () => {
                setIsLoadingSlots(true);
                setSelectedTime('');
                const res = await getAvailableSlotsAction(selectedDate);
                if (res.success && res.slots) {
                    setAvailableSlots(res.slots);
                } else {
                    setAvailableSlots([]);
                }
                setIsLoadingSlots(false);
            };
            fetchSlots();
        }
    }, [selectedDate]);

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
                        <h1 className="font-serif text-3xl text-brand-sand">¡Cita Confirmada!</h1>
                        <p className="text-white/60 text-sm leading-relaxed">Hemos recibido tu confirmación y hemos agendado tu visita. Te esperamos en nuestro Atelier para dar inicio a tu proyecto.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-sm text-left space-y-4">
                        <div className="flex items-start gap-4 text-sm">
                            <MapPin className="w-5 h-5 text-brand-sand shrink-0" />
                            <p className="text-white/80">Tabancura 1091, Of. 319 · Vitacura<br/>Santiago, Chile</p>
                        </div>
                        <div className="flex items-start gap-4 text-sm">
                            <CalendarIcon className="w-5 h-5 text-brand-sand shrink-0" />
                            <p className="text-white/80">
                                {new Date(`${selectedDate}T${selectedTime}`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })} a las {selectedTime} hrs
                            </p>
                        </div>
                    </div>
                    <Link 
                        href="/" 
                        className="w-full glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] cursor-pointer"
                    >
                        <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                            Volver al Inicio
                        </span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-charcoal text-white pb-32 font-sans overflow-x-hidden">
            {/* Header / Brand with Luxury Image */}
            <header className="relative p-8 md:p-16 border-b border-white/10 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop" 
                        alt="Luxury Atelier" 
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/30 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal/90 via-brand-charcoal/20 to-transparent"></div>
                </div>
                
                <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-end gap-8 mt-12">
                    <div className="text-center md:text-left flex flex-col items-center md:items-start">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-brand-sand mb-6 font-bold">Propuesta Comercial</p>
                        <div className="flex flex-col items-stretch justify-center w-max mx-auto md:mx-0 scale-125 md:scale-150 origin-center md:origin-left my-4">
                            <div className="flex justify-between w-full font-serif text-2xl md:text-3xl font-black uppercase text-white leading-none drop-shadow-sm">
                                <span>E</span><span>L</span><span>E</span><span>N</span><span>A</span>
                            </div>
                            <div 
                                className="font-sans text-[0.65rem] md:text-[0.75rem] font-bold uppercase text-white/70 mt-1 text-center"
                                style={{ letterSpacing: '0.35em', marginRight: '-0.35em' }}
                            >
                                La Costurera
                            </div>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-sand mt-6 font-semibold">Alta Costura & Sastrería a Medida</p>
                    </div>
                    <div className="text-center md:text-right text-[10px] uppercase tracking-widest text-brand-sand/60 font-semibold space-y-1.5">
                        <p>Vitacura, Santiago Chile</p>
                        <p className="text-white/40">elenalacosturera.cl</p>
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
                                            const orderId = Date.now().toString();
                                            const buyOrder = `order_${orderId}`;
                                            
                                            // 1. Create order in DB
                                            const orderPayload = {
                                                customerId: data.customerId || 'unassigned',
                                                posOrderId: buyOrder,
                                                paymentMethod: 'transbank',
                                                paymentStatus: 'pending',
                                                items: data.cart.map((item: any) => ({
                                                    name: item.name,
                                                    price: item.price,
                                                    category: item.category,
                                                    notes: item.notes || '',
                                                    isCustom: !!item.isCustom,
                                                    hours: item.details?.hours || 0,
                                                    assignedOperatorId: item.assignedOperatorId || 'unassigned'
                                                })),
                                                deadline: null,
                                                productionStartDate: null,
                                                productionEndDate: null,
                                                finalDeliveryDate: null
                                            };
                                            
                                            const orderRes = await createPOSOrdersAction(orderPayload);
                                            if (!orderRes.success) {
                                                throw new Error(orderRes.error || 'No se pudo crear la orden');
                                            }
                                            
                                            // 2. Init Webpay
                                            const sessionId = `session_web_${orderId}`;
                                            const callbackUrl = `${window.location.origin}/presupuesto/pago-exitoso`;
                                            
                                            const tbkRes = await createWebpayTransaction(buyOrder, sessionId, data.total, callbackUrl);
                                            
                                            if (tbkRes.success && tbkRes.url && tbkRes.token) {
                                                window.location.href = `${tbkRes.url}?token_ws=${tbkRes.token}`;
                                            } else {
                                                throw new Error(tbkRes.error || 'Error al inicializar Transbank');
                                            }
                                        } catch (err) {
                                            console.error('Error redirecting to Webpay:', err);
                                            alert('Ocurrió un error al procesar el pago. Por favor reintente.');
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
                                        setStatus('scheduling');
                                    }}
                                    className="flex flex-col items-center gap-4 p-8 border border-white/10 bg-white/5 hover:border-brand-sand rounded-sm text-white transition-all group cursor-pointer"
                                >
                                    <div className="bg-white/5 p-4 rounded-full group-hover:scale-110 transition-transform">
                                        <Store className="w-8 h-8 text-brand-sand" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold uppercase tracking-widest text-white">Pagar en Atelier</p>
                                        <p className="text-[10px] text-white/50 mt-1">Agendar cita y pagar presencialmente</p>
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
                    ) : status === 'scheduling' ? (
                        <div className="w-full space-y-6 animate-in slide-in-from-bottom duration-500 bg-white/5 p-6 border border-white/10 rounded-sm backdrop-blur-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-serif text-2xl text-white">Agenda tu Visita</h4>
                                    <p className="text-xs text-brand-sand mt-1 uppercase tracking-widest font-bold">Selecciona fecha y hora</p>
                                </div>
                                <button onClick={() => setStatus('accepted')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                                    Volver
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4" /> 1. Elige una Fecha
                                    </label>
                                    <input 
                                        type="date" 
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-black/40 border border-white/20 text-white p-3 text-sm focus:border-brand-sand focus:outline-none rounded-sm font-sans"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] text-white/50 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> 2. Elige una Hora
                                    </label>
                                    
                                    {!selectedDate ? (
                                        <div className="h-[48px] flex items-center text-sm text-white/40 italic">
                                            Selecciona una fecha primero
                                        </div>
                                    ) : isLoadingSlots ? (
                                        <div className="h-[48px] flex items-center text-sm text-brand-sand gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Buscando disponibilidad...
                                        </div>
                                    ) : availableSlots.length === 0 ? (
                                        <div className="h-[48px] flex items-center text-sm text-red-400">
                                            No hay horas disponibles este día.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableSlots.map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`py-2 text-sm rounded-sm transition-all border ${
                                                        selectedTime === time 
                                                        ? 'bg-brand-sand text-black border-brand-sand font-bold' 
                                                        : 'bg-black/40 text-white/80 border-white/20 hover:border-brand-sand hover:text-brand-sand'
                                                    }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                disabled={!selectedDate || !selectedTime || isConfirmingBooking}
                                onClick={async () => {
                                    setIsConfirmingBooking(true);
                                    try {
                                        const orderId = Date.now().toString();
                                        const buyOrder = `order_${orderId}`;
                                        
                                        const orderPayload = {
                                            customerId: data.customerId || 'unassigned',
                                            posOrderId: buyOrder,
                                            paymentMethod: 'presencial',
                                            paymentStatus: 'pending',
                                            items: data.cart.map((item: any) => ({
                                                name: item.name,
                                                price: item.price,
                                                category: item.category,
                                                notes: item.notes || '',
                                                isCustom: !!item.isCustom,
                                                hours: item.details?.hours || 0,
                                                assignedOperatorId: item.assignedOperatorId || 'unassigned'
                                            })),
                                            deadline: null,
                                            productionStartDate: null,
                                            productionEndDate: null,
                                            finalDeliveryDate: null
                                        };
                                        
                                        const budgetId = searchParams.get('id') || '';
                                        
                                        const res = await confirmPresencialBookingAction({
                                            budgetId,
                                            dateStr: selectedDate,
                                            timeStr: selectedTime,
                                            customerName: data.customerName || 'Cliente',
                                            customerEmail: data.customerEmail || '',
                                            customerPhone: data.customerPhone || '',
                                            orderPayload
                                        });

                                        if (res.success) {
                                            setStatus('paying');
                                        } else {
                                            throw new Error(res.error || 'Error al confirmar la cita');
                                        }
                                    } catch (err: any) {
                                        console.error('Error confirming booking:', err);
                                        alert(err.message || 'Ocurrió un error al confirmar. Por favor reintente.');
                                    } finally {
                                        setIsConfirmingBooking(false);
                                    }
                                }}
                                className={`w-full mt-4 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                                    !selectedDate || !selectedTime || isConfirmingBooking
                                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                    : 'bg-brand-sand text-black hover:bg-brand-sand/90 shadow-[0_0_20px_rgba(193,127,95,0.3)] cursor-pointer'
                                }`}
                            >
                                {isConfirmingBooking ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Confirmando Cita...</>
                                ) : (
                                    <><CheckCircle className="w-4 h-4" /> Confirmar Cita y Finalizar</>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="w-full text-center py-4 space-y-4">
                            <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 text-brand-sand rounded-full text-sm font-bold animate-pulse">
                                <span className="w-4 h-4 rounded-full border-2 border-brand-sand border-t-transparent animate-spin" /> Redirigiendo...
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
