'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, CreditCard, Store, Calendar as CalendarIcon, MapPin, Check, Clock, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createWebpayTransaction } from '@/lib/transbank';
import { createPaymentPreference } from '@/lib/payments';
import { getBudgetAction, createPOSOrdersAction, updateBudgetStatusAction, getMonthAvailabilityAction, confirmPresencialBookingAction } from '../admin/pos/actions';

function BudgetContent() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<any>(null);
    const [status, setStatus] = useState<'viewing' | 'accepted' | 'scheduling' | 'paying'>('viewing');
    const [paymentMethod, setPaymentMethod] = useState<'transbank' | 'mercadopago' | 'presencial' | null>(null);

    // Scheduling state
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [monthData, setMonthData] = useState<any[]>([]);
    const [isLoadingMonth, setIsLoadingMonth] = useState(false);
    
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedDayData, setSelectedDayData] = useState<any>(null);
    const [selectedTime, setSelectedTime] = useState<string>('');
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
        if (status === 'scheduling') {
            const fetchMonth = async () => {
                setIsLoadingMonth(true);
                const res = await getMonthAvailabilityAction(currentYear, currentMonth);
                if (res.success && res.availability) {
                    setMonthData(res.availability);
                } else {
                    setMonthData([]);
                }
                setIsLoadingMonth(false);
            };
            fetchMonth();
        }
    }, [currentYear, currentMonth, status]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
        setSelectedDate('');
        setSelectedDayData(null);
        setSelectedTime('');
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
        setSelectedDate('');
        setSelectedDayData(null);
        setSelectedTime('');
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // 0 = Lunes, 6 = Domingo
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

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

    if (data.status === 'accepted' || data.status === 'paid') {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-brand-charcoal text-white font-sans">
                <div className="text-center space-y-6 max-w-md bg-white/5 p-12 border border-white/10 rounded-sm">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                    <h1 className="font-serif text-3xl text-brand-sand">Presupuesto Confirmado</h1>
                    <p className="text-white/60 text-sm leading-relaxed">Este proyecto ya fue agendado y/o pagado exitosamente. No es necesario realizar más acciones.</p>
                    <Link href="/" className="inline-block mt-4 px-8 py-3 bg-brand-sand text-black text-xs uppercase tracking-widest font-bold hover:bg-white transition-all">Volver al sitio</Link>
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
                        <p className="text-white/60 text-sm leading-relaxed">Tu cita exclusiva ha sido agendada. Te esperamos en nuestro Atelier para dar inicio a tu proyecto.</p>
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

    // Generate Calendar Grid
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const calendarGrid = [];
    for (let i = 0; i < firstDay; i++) {
        calendarGrid.push(null); // Empty slots for offset
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarGrid.push(i);
    }

    const processPayment = async (method: 'transbank' | 'mercadopago' | 'presencial') => {
        if (method === 'presencial') {
            setIsConfirmingBooking(true);
        } else {
            setPaymentMethod(method);
            setStatus('paying');
        }
        try {
            const budgetId = searchParams.get('id') || '';
            const orderId = Date.now().toString();
            // If it's a presencial payment, we generate a new order ID. If it's online, we use the budget ID so we can convert it AFTER payment.
            const buyOrder = method === 'presencial' ? `order_${orderId}` : `budget_${budgetId}`;
            
            const orderPayload = {
                customerId: data.customerId || 'unassigned',
                posOrderId: buyOrder,
                paymentMethod: method === 'presencial' ? 'local' : method,
                paymentStatus: 'pending',
                status: 'scheduled',
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
            // budgetId already declared above
            const res = await confirmPresencialBookingAction({
                budgetId,
                dateStr: selectedDate,
                timeStr: selectedTime,
                customerName: data.customerName || 'Cliente',
                customerEmail: data.customerEmail || '',
                customerPhone: data.customerPhone || '',
                orderPayload
            });

            if (!res.success) {
                throw new Error(res.error || 'Error al confirmar la cita');
            }

            if (method === 'presencial') {
                setPaymentMethod('presencial');
                setStatus('paying');
            } else if (method === 'transbank') {
                const sessionId = `session_web_${orderId}`;
                const callbackUrl = `${window.location.origin}/presupuesto/pago-exitoso`;
                
                const tbkRes = await createWebpayTransaction(buyOrder, sessionId, data.total, callbackUrl);
                
                if (tbkRes.success && tbkRes.url && tbkRes.token) {
                    window.location.href = `${tbkRes.url}?token_ws=${tbkRes.token}`;
                } else {
                    throw new Error(tbkRes.error || 'Error al inicializar Transbank');
                }
            } else if (method === 'mercadopago') {
                const mpRes = await createPaymentPreference(data.cart, buyOrder, window.location.origin);
                if (mpRes && mpRes.init_point) {
                    window.location.href = mpRes.init_point;
                } else {
                    throw new Error('Error al inicializar Mercado Pago');
                }
            }
        } catch (err: any) {
            console.error('Error confirming booking:', err);
            alert(err.message || 'Ocurrió un error al procesar el pago. Por favor reintente.');
            if (method !== 'presencial') {
                setStatus('accepted');
            }
        } finally {
            setIsConfirmingBooking(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-charcoal text-white pb-32 font-sans overflow-x-hidden">
            {/* Header / Brand */}
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
                {status !== 'scheduling' ? (
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
                                                <td className="py-6 pr-8 md:pr-12 align-top">
                                                    <p className="font-serif text-lg text-white">{item.name}</p>
                                                    <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-bold">{item.category}</p>
                                                    {item.notes && (
                                                        <p className="text-xs text-white/70 mt-2 whitespace-pre-line border-l border-brand-sand/30 pl-3 italic">
                                                            {item.notes}
                                                        </p>
                                                    )}
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
                                                <td className="py-6 text-right font-serif text-xl font-medium text-white align-top whitespace-nowrap w-28 md:w-36">
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
                        </div>
                    </div>
                ) : (
                    // PREMIUM SCHEDULING UI
                    <div className="bg-[#1a1a1a] border border-white/10 shadow-2xl rounded-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="p-8 md:p-16">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/10 pb-8">
                                <div>
                                    <h2 className="font-serif text-3xl text-white">Agenda tu Cita</h2>
                                    <p className="text-xs text-brand-sand mt-2 uppercase tracking-widest font-bold">Selección de Fecha y Hora</p>
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest italic max-w-xs">
                                        * Debido a la alta demanda de la diseñadora, los cupos para visitas presenciales son estrictamente limitados.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                {/* Calendar Section */}
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center bg-white/5 p-4 border border-white/10">
                                        <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 text-brand-sand transition-colors">
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <h3 className="font-serif text-xl text-white uppercase tracking-widest">
                                            {monthNames[currentMonth]} <span className="text-brand-sand">{currentYear}</span>
                                        </h3>
                                        <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 text-brand-sand transition-colors">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {isLoadingMonth ? (
                                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-brand-sand">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                            <p className="text-xs uppercase tracking-widest">Verificando agenda de la diseñadora...</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="grid grid-cols-7 gap-2 mb-4 text-center text-[10px] uppercase tracking-widest font-bold text-white/40">
                                                <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
                                            </div>
                                            <div className="grid grid-cols-7 gap-2">
                                                {calendarGrid.map((day, idx) => {
                                                    if (!day) return <div key={`empty-${idx}`} className="h-12" />;
                                                    
                                                    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                                                    const dayData = monthData.find(d => d.date === dateStr);
                                                    
                                                    const isSelected = selectedDate === dateStr;
                                                    const isClosed = !dayData || !dayData.isOpen;
                                                    const isFull = dayData && dayData.isOpen && dayData.isFull;
                                                    const isAvailable = dayData && dayData.isOpen && !dayData.isFull;

                                                    return (
                                                        <button
                                                            key={dateStr}
                                                            disabled={!isAvailable}
                                                            onClick={() => {
                                                                setSelectedDate(dateStr);
                                                                setSelectedDayData(dayData);
                                                                setSelectedTime('');
                                                            }}
                                                            className={`
                                                                relative h-14 border flex flex-col items-center justify-center transition-all duration-300
                                                                ${isSelected ? 'border-brand-sand bg-brand-sand/10 text-brand-sand' : ''}
                                                                ${isAvailable && !isSelected ? 'border-white/10 hover:border-brand-sand/50 text-white hover:bg-white/5 cursor-pointer' : ''}
                                                                ${(isClosed || isFull) ? 'border-transparent text-white/20 cursor-not-allowed bg-black/40' : ''}
                                                            `}
                                                        >
                                                            <span className={`font-serif text-lg ${(isClosed || isFull) ? 'line-through decoration-white/20 text-white/20' : ''}`}>
                                                                {day}
                                                            </span>
                                                            {isFull && <span className="absolute bottom-1 text-[8px] uppercase tracking-tighter text-red-900 font-bold bg-red-900/20 px-1">Lleno</span>}
                                                            {isAvailable && <span className="absolute bottom-2 w-1 h-1 bg-brand-sand rounded-full"></span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Time Selection Section */}
                                <div className="space-y-8 lg:border-l lg:border-white/10 lg:pl-16">
                                    <div className="space-y-2">
                                        <h3 className="font-serif text-2xl text-white">
                                            {selectedDate 
                                                ? new Date(`${selectedDate}T12:00:00-04:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) 
                                                : 'Seleccione un día'}
                                        </h3>
                                        <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Horas Disponibles</p>
                                    </div>

                                    {!selectedDate ? (
                                        <div className="h-48 flex items-center justify-center border border-white/5 bg-white/[0.02]">
                                            <p className="text-sm text-white/30 italic font-serif">Por favor, seleccione un día disponible en el calendario.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 animate-in fade-in duration-500">
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Available Slots */}
                                                {selectedDayData.availableSlots.map((time: string) => (
                                                    <button
                                                        key={`avail-${time}`}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`
                                                            py-4 border text-sm font-bold uppercase tracking-widest transition-all duration-300
                                                            ${selectedTime === time 
                                                                ? 'border-brand-sand bg-brand-sand text-[#121212]' 
                                                                : 'border-white/20 bg-transparent text-white hover:border-brand-sand hover:text-brand-sand'}
                                                        `}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}

                                                {/* Booked Slots (Scarcity explicitly shown) */}
                                                {selectedDayData.bookedSlots.map((time: string) => (
                                                    <div
                                                        key={`booked-${time}`}
                                                        className="py-4 border border-white/5 bg-transparent flex flex-col items-center justify-center transition-all duration-300"
                                                    >
                                                        <span className="text-sm font-bold text-white/20 line-through decoration-white/10">{time}</span>
                                                        <span className="text-[11px] font-serif italic text-brand-sand/50 mt-1 tracking-wider">Reservado</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="pt-8 border-t border-white/10">
                                                <button 
                                                    disabled={!selectedTime || isConfirmingBooking}
                                                    onClick={() => processPayment('presencial')}
                                                    className={`
                                                        w-full flex items-center justify-center gap-3 py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500
                                                        ${(!selectedTime || isConfirmingBooking)
                                                            ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                                                            : 'bg-brand-sand text-[#121212] hover:bg-white hover:text-black shadow-[0_0_30px_rgba(193,127,95,0.4)] cursor-pointer'
                                                        }
                                                    `}
                                                >
                                                    {isConfirmingBooking ? (
                                                        <><Loader2 className="w-5 h-5 animate-spin" /> Confirmando Cita...</>
                                                    ) : (
                                                        <><CheckCircle className="w-5 h-5" /> Confirmar Cita</>
                                                    )}
                                                </button>
                                                <button 
                                                    onClick={() => setStatus('viewing')} 
                                                    className="w-full mt-6 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white cursor-pointer transition-colors"
                                                >
                                                    Cancelar y volver
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Interaction Bar (Stick to bottom on mobile) - Only show when NOT scheduling */}
            {status !== 'scheduling' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                        {status === 'viewing' ? (
                            <>
                                <div className="text-center md:text-left">
                                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">¿Deseas confirmar este presupuesto?</p>
                                    <p className="text-sm text-white/80 mt-1">Agenda una cita con Elena para revisar los detalles y confirmar tu proyecto.</p>
                                </div>
                                <button 
                                    onClick={() => setStatus('scheduling')}
                                    className="w-full md:w-auto glass-btn group relative inline-flex items-center justify-center gap-3 px-10 py-4 border-[0.5px] border-white/20 border-t-white/40 border-l-white/40 border-b-white/10 border-r-white/10 text-white font-sans text-xs uppercase tracking-[0.25em] font-semibold bg-white/[0.08] backdrop-blur-[10px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#f5f2eb]/90 hover:border-[#f5f2eb] hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[1px] cursor-pointer"
                                >
                                    <span className="glass-text relative z-10 flex items-center justify-center gap-3 text-white group-hover:text-[#121212] transition-colors duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                                        Agendar Cita
                                    </span>
                                </button>
                            </>
                        ) : status === 'accepted' ? (
                            <div className="w-full space-y-6 animate-in slide-in-from-bottom duration-500">
                                <div className="text-center">
                                    <h4 className="font-serif text-2xl text-white">Selecciona tu método de pago</h4>
                                    <p className="text-xs text-brand-sand mt-1 uppercase tracking-widest font-bold">Confirmación de Orden</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button 
                                        onClick={() => processPayment('transbank')}
                                        className="flex flex-col items-center gap-4 p-8 border border-white/10 bg-white/5 hover:border-brand-sand rounded-sm text-white transition-all group cursor-pointer"
                                    >
                                        <div className="bg-white/5 p-4 rounded-full group-hover:scale-110 transition-transform">
                                            <CreditCard className="w-8 h-8 text-brand-sand" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold uppercase tracking-widest text-white">Transbank Webpay</p>
                                            <p className="text-[10px] text-white/50 mt-1">Tarjetas de Crédito / Débito</p>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => processPayment('mercadopago')}
                                        className="flex flex-col items-center gap-4 p-8 border border-white/10 bg-white/5 hover:border-brand-sand rounded-sm text-white transition-all group cursor-pointer"
                                    >
                                        <div className="bg-white/5 p-4 rounded-full group-hover:scale-110 transition-transform">
                                            <CreditCard className="w-8 h-8 text-[#009EE3]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold uppercase tracking-widest text-white">Mercado Pago</p>
                                            <p className="text-[10px] text-white/50 mt-1">Saldo en Cuenta / Tarjetas</p>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => processPayment('presencial')}
                                        className="flex flex-col items-center gap-4 p-8 border border-brand-sand/50 bg-brand-sand/5 hover:bg-brand-sand/10 hover:border-brand-sand rounded-sm text-white transition-all group cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 bg-brand-sand text-black text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-sm">
                                            Experiencia Exclusiva
                                        </div>
                                        <div className="bg-brand-sand/20 p-4 rounded-full group-hover:scale-110 transition-transform mt-2">
                                            <Store className="w-8 h-8 text-brand-sand" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold uppercase tracking-widest text-white">Pagar en Atelier</p>
                                            <p className="text-[10px] text-white/50 mt-1">Agendar cita y pagar presencialmente</p>
                                        </div>
                                    </button>
                                </div>
                                <button 
                                    onClick={() => setStatus('scheduling')} 
                                    className="w-full text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-brand-sand cursor-pointer transition-colors"
                                >
                                    Volver al detalle
                                </button>
                            </div>
                        ) : (
                            <div className="w-full text-center py-4 space-y-4">
                                <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 text-brand-sand rounded-full text-sm font-bold animate-pulse">
                                    <span className="w-4 h-4 rounded-full border-2 border-brand-sand border-t-transparent animate-spin" /> Procesando pago seguro...
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
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
