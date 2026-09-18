'use client';

import React, { useState } from 'react';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    MapPin, 
    CheckCircle2, 
    ChevronDown, 
    Sparkles, 
    Scissors, 
    Heart, 
    Info, 
    Tag, 
    ArrowRight, 
    Phone,
    Star,
    X,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ShieldCheck,
    CreditCard
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AccordionItemProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}

function AccordionItem({ title, icon: Icon, children, isOpen, onToggle }: AccordionItemProps) {
    return (
        <div className="border border-white/10 rounded-sm bg-white/[0.02] overflow-hidden transition-all duration-300">
            <button
                type="button"
                onClick={onToggle}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.04] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-brand-sand shrink-0" />
                    <span className="text-xs uppercase tracking-widest font-semibold text-white/90">{title}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-sand' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 pt-0 text-xs text-white/70 space-y-2 border-t border-white/5 leading-relaxed font-light">
                    {children}
                </div>
            )}
        </div>
    );
}

export default function AtelierBookingExperience() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState<1 | 2>(1); // Step 1: Calendar & Time, Step 2: Customer Info
    const [selectedService, setSelectedService] = useState<'composturas' | 'novias' | 'sastreria'>('composturas');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [openAccordion, setOpenAccordion] = useState<string | null>('desc');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form data for step 2
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        rut: ''
    });

    const services = [
        { id: 'composturas', label: 'Composturas & Ajustes', icon: Scissors, desc: 'Ajustes a medida para prendas terminadas.' },
        { id: 'novias', label: 'Novias & Alta Costura', icon: Heart, desc: 'Reunión de diseño o entalle de vestido.' },
        { id: 'sastreria', label: 'Confección & Sastrería', icon: Sparkles, desc: 'Desarrollo de prendas de cero a medida.' }
    ] as const;

    // Generar fechas (Próximos 14 días)
    const availableDates = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        if (d.getDay() === 0 || d.getDay() === 6) return null; // Saltar fines de semana para este demo
        return d.toISOString().split('T')[0];
    }).filter(Boolean) as string[];

    // Generar horas
    const availableTimes = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

    const formatShortDate = (dateString: string) => {
        const date = new Date(dateString + 'T12:00:00');
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const dayName = days[date.getDay()];
        const dayNum = date.getDate();
        const monthNum = date.getMonth() + 1;
        return { dayName, dateText: `${dayNum}/${monthNum}` };
    };

    const handleToggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleConfirmBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simular llamada a API para crear la cita
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Redirigir a Webpay con un ID falso por ahora
        const fakeOrderId = `CITA-${Date.now().toString().slice(-6)}`;
        router.push(`/pagar/${fakeOrderId}`);
    };

    const openBookingModal = () => {
        setModalStep(1);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeBookingModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = 'unset';
    };

    return (
        <>
            <div className="grid lg:grid-cols-[1fr_450px] gap-8 lg:gap-12 items-start">
                
                {/* ━━━━━━━━━━ COLUMNA IZQUIERDA: MEDIA & EXPERIENCIA ━━━━━━━━━━ */}
                <div className="space-y-6">
                    <div className="relative aspect-[4/3] md:aspect-[16/10] rounded-sm overflow-hidden group border border-white/10 shadow-2xl">
                        <img 
                            src="/elena-taller.png" 
                            alt="Atención personalizada en Elena La Costurera" 
                            className="w-full h-full object-cover filter brightness-[0.85] contrast-105 saturate-[0.8] group-hover:scale-105 transition-transform duration-[1500ms]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Live Floating Badge */}
                        <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 border border-white/10 rounded-full">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-terracotta opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-terracotta"></span>
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-white/90 font-medium">Atención sin espera · Casa Matriz</span>
                        </div>

                        {/* Rating Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-4 h-4 fill-brand-sand text-brand-sand" />
                                    ))}
                                    <span className="text-white font-serif ml-2">4.9 / 5.0</span>
                                </div>
                                <p className="text-xs text-white/70 font-light">Basado en +120 experiencias en el Atelier</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/5 p-6 rounded-sm space-y-4">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-brand-sand shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">¿Prefieres no agendar?</h4>
                                <p className="text-xs text-white/60 leading-relaxed font-light">
                                    Recibimos prendas por orden de llegada durante nuestro horario de atención. 
                                    Sin embargo, <strong className="text-white/90 font-medium">recomendamos encarecidamente reservar tu hora</strong> si necesitas probarte 
                                    prendas o evaluar ajustes complejos, para garantizar que Elena o nuestro equipo puedan dedicarte el tiempo necesario.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ━━━━━━━━━━ COLUMNA DERECHA: FICHA INFORMATIVA & CTA ━━━━━━━━━━ */}
                <div className="bg-brand-charcoal/[0.7] backdrop-blur-xl border border-white/10 rounded-sm p-6 md:p-8 flex flex-col shadow-2xl relative sticky top-32">
                    
                    <div className="space-y-8 flex-1">
                        
                        {/* Cabecera de Ficha */}
                        <div className="space-y-4 border-b border-white/10 pb-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-widest text-brand-sand font-bold border border-brand-sand/30 px-3 py-1 bg-brand-sand/5 rounded-sm">
                                    RESERVA PRIORITARIA
                                </span>
                            </div>
                            <h3 className="font-serif text-2xl md:text-3xl text-white leading-tight">
                                Agenda Hora de Atención & Evaluación
                            </h3>
                            <div className="flex flex-wrap items-baseline gap-3">
                                <span className="text-2xl font-serif text-white">$5.000 <span className="text-sm font-sans font-light text-white/60">CLP</span></span>
                                <span className="text-xs text-brand-terracotta bg-brand-terracotta/10 px-2 py-1 rounded-sm uppercase tracking-wide font-medium flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> 100% Abonable a tu trabajo
                                </span>
                            </div>
                        </div>

                        {/* Selección Rápida de Categoría (Visual) */}
                        <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-widest text-white/50 block">1. Selecciona el Tipo de Servicio</label>
                            <div className="grid grid-cols-1 gap-2">
                                {services.map((service) => {
                                    const isSelected = selectedService === service.id;
                                    return (
                                        <button
                                            key={service.id}
                                            onClick={() => setSelectedService(service.id)}
                                            className={`flex items-center p-3 rounded-sm border transition-all duration-300 ${
                                                isSelected 
                                                ? 'bg-brand-sand/10 border-brand-sand/50 text-white' 
                                                : 'bg-white/[0.02] border-white/5 text-white/70 hover:bg-white/[0.05] hover:border-white/20'
                                            }`}
                                        >
                                            <service.icon className={`w-4 h-4 shrink-0 mr-3 ${isSelected ? 'text-brand-sand' : 'text-white/40'}`} />
                                            <div className="text-left">
                                                <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                                    {service.label}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="ml-auto w-2 h-2 rounded-full bg-brand-sand shadow-[0_0_8px_rgba(230,213,171,0.6)]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Acordeones de Información */}
                        <div className="space-y-2 pt-4 border-t border-white/5">
                            <AccordionItem 
                                title="¿En qué consiste esta cita?" 
                                icon={Info}
                                isOpen={openAccordion === 'desc'}
                                onToggle={() => handleToggleAccordion('desc')}
                            >
                                <p>Es una sesión de 30 a 45 minutos personalizada en nuestro atelier.</p>
                                <ul className="list-disc pl-4 space-y-1 mt-2 text-white/60">
                                    <li>Evaluación técnica de las prendas.</li>
                                    <li>Toma de medidas precisas.</li>
                                    <li>Prueba en probador (Fitting).</li>
                                    <li>Asesoría de estilo y factibilidad.</li>
                                </ul>
                            </AccordionItem>

                            <AccordionItem 
                                title="Condiciones & Descuento" 
                                icon={Tag}
                                isOpen={openAccordion === 'condiciones'}
                                onToggle={() => handleToggleAccordion('condiciones')}
                            >
                                <p>El valor de <strong>$5.000 CLP</strong> se abona para asegurar tu bloque de tiempo exclusivo.</p>
                                <p className="mt-2 text-brand-sand font-medium border-l-2 border-brand-sand pl-3 py-1 bg-brand-sand/5">
                                    Este valor será descontado íntegramente del total del servicio o presupuesto final que aceptes en la cita.
                                </p>
                            </AccordionItem>

                            <AccordionItem 
                                title="¿Qué debo traer?" 
                                icon={CheckCircle2}
                                isOpen={openAccordion === 'traer'}
                                onToggle={() => handleToggleAccordion('traer')}
                            >
                                <p>Para asegurar un ajuste perfecto, te solicitamos:</p>
                                <ul className="list-disc pl-4 space-y-1 mt-2 text-white/60">
                                    <li>Las prendas lavadas y limpias.</li>
                                    <li>El calzado que usarás con la prenda (vital para bastas).</li>
                                    <li>Ropa interior adecuada (especialmente para vestidos de fiesta/novia).</li>
                                </ul>
                            </AccordionItem>
                            
                            <AccordionItem 
                                title="Ubicación" 
                                icon={MapPin}
                                isOpen={openAccordion === 'ubicacion'}
                                onToggle={() => handleToggleAccordion('ubicacion')}
                            >
                                <p className="font-medium text-white/90">Casa Matriz Vitacura</p>
                                <p>Av. Tabancura 1091, Oficina 319.</p>
                                <p className="mt-2 text-[10px] uppercase tracking-wider text-white/50">Estacionamiento</p>
                                <p>Contamos con estacionamiento de visitas en el edificio sujeto a disponibilidad, además de calles aledañas.</p>
                            </AccordionItem>
                        </div>
                    </div>

                    {/* Botón de Apertura de Modal */}
                    <div className="pt-6 mt-6 border-t border-white/10">
                        <button
                            onClick={openBookingModal}
                            className="w-full glass-btn group relative inline-flex items-center justify-center gap-3 px-6 py-4 border-[0.5px] border-white/20 text-white font-sans text-xs uppercase tracking-[0.2em] font-bold bg-white/[0.08] backdrop-blur-[10px] transition-all hover:bg-brand-sand hover:text-black rounded-[1px] shadow-lg"
                        >
                            Elegir Fecha y Hora
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                </div>
            </div>

            {/* ━━━━━━━━━━ MODAL FLUJO DE AGENDAMIENTO ━━━━━━━━━━ */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 animate-fade-in">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                        onClick={closeBookingModal}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative w-full max-w-2xl bg-brand-charcoal border border-white/10 rounded-sm shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase tracking-widest text-brand-sand">Paso {modalStep} de 2</span>
                                <h2 className="text-xl font-serif text-white">
                                    {modalStep === 1 ? 'Selecciona tu Fecha' : 'Ingresa tus Datos'}
                                </h2>
                            </div>
                            <button 
                                onClick={closeBookingModal}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                            
                            {/* STEP 1: CALENDAR & TIME */}
                            {modalStep === 1 && (
                                <div className="space-y-8 animate-fade-in">
                                    {/* Fechas */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs uppercase tracking-widest text-white/60 font-semibold flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4" /> Días Disponibles
                                            </label>
                                            <div className="flex gap-2">
                                                <button className="p-1 border border-white/10 rounded-sm hover:bg-white/5 text-white/50"><ChevronLeft className="w-4 h-4" /></button>
                                                <button className="p-1 border border-white/10 rounded-sm hover:bg-white/5 text-white/50"><ChevronRight className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                                            {availableDates.slice(0, 14).map((date) => {
                                                const { dayName, dateText } = formatShortDate(date);
                                                const isSelected = selectedDate === date;
                                                return (
                                                    <button
                                                        key={date}
                                                        onClick={() => { setSelectedDate(date); setSelectedTime(''); }}
                                                        className={`flex flex-col items-center justify-center p-3 rounded-sm border transition-all ${
                                                            isSelected 
                                                            ? 'bg-brand-sand text-brand-charcoal border-brand-sand shadow-[0_0_15px_rgba(230,213,171,0.3)]' 
                                                            : 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/[0.08] hover:border-white/30'
                                                        }`}
                                                    >
                                                        <span className={`text-[10px] uppercase font-semibold tracking-wider ${isSelected ? 'text-brand-charcoal/70' : 'text-white/40'}`}>
                                                            {dayName}
                                                        </span>
                                                        <span className={`text-sm mt-1 font-serif ${isSelected ? 'font-bold' : ''}`}>
                                                            {dateText}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Horas */}
                                    <div className={`space-y-4 transition-opacity duration-300 ${selectedDate ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                                        <label className="text-xs uppercase tracking-widest text-white/60 font-semibold flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Horas Disponibles
                                        </label>
                                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                            {availableTimes.map((time) => {
                                                const isSelected = selectedTime === time;
                                                return (
                                                    <button
                                                        key={time}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`py-3 rounded-sm border transition-all text-sm font-medium ${
                                                            isSelected 
                                                            ? 'bg-brand-sand text-brand-charcoal border-brand-sand shadow-[0_0_15px_rgba(230,213,171,0.3)]' 
                                                            : 'bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/[0.08] hover:border-white/30'
                                                        }`}
                                                    >
                                                        {time}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: CUSTOMER FORM */}
                            {modalStep === 2 && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-brand-sand/5 border border-brand-sand/20 p-4 rounded-sm flex items-start gap-3">
                                        <ShieldCheck className="w-5 h-5 text-brand-sand shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-sm text-white/90 font-medium">Resumen de tu Reserva</p>
                                            <p className="text-xs text-white/60">
                                                {services.find(s => s.id === selectedService)?.label} <br/>
                                                {selectedDate && `${formatShortDate(selectedDate).dayName} ${formatShortDate(selectedDate).dateText}`} a las {selectedTime} hrs.
                                            </p>
                                        </div>
                                    </div>

                                    <form id="booking-form" onSubmit={handleConfirmBooking} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/60">Nombre Completo</label>
                                            <input 
                                                required
                                                type="text" 
                                                name="name"
                                                value={formData.name}
                                                onChange={handleFormChange}
                                                className="w-full bg-black/40 border border-white/10 rounded-sm p-3 text-white text-sm focus:border-brand-sand focus:ring-1 focus:ring-brand-sand outline-none transition-all"
                                                placeholder="Ej. María Elena Rojas"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-white/60">Teléfono (WhatsApp)</label>
                                                <input 
                                                    required
                                                    type="tel" 
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleFormChange}
                                                    className="w-full bg-black/40 border border-white/10 rounded-sm p-3 text-white text-sm focus:border-brand-sand focus:ring-1 focus:ring-brand-sand outline-none transition-all"
                                                    placeholder="+56 9 1234 5678"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase tracking-widest text-white/60">RUT</label>
                                                <input 
                                                    required
                                                    type="text" 
                                                    name="rut"
                                                    value={formData.rut}
                                                    onChange={handleFormChange}
                                                    className="w-full bg-black/40 border border-white/10 rounded-sm p-3 text-white text-sm focus:border-brand-sand focus:ring-1 focus:ring-brand-sand outline-none transition-all"
                                                    placeholder="12.345.678-9"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/60">Correo Electrónico</label>
                                            <input 
                                                required
                                                type="email" 
                                                name="email"
                                                value={formData.email}
                                                onChange={handleFormChange}
                                                className="w-full bg-black/40 border border-white/10 rounded-sm p-3 text-white text-sm focus:border-brand-sand focus:ring-1 focus:ring-brand-sand outline-none transition-all"
                                                placeholder="correo@ejemplo.com"
                                            />
                                        </div>
                                    </form>
                                </div>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-white/10 bg-black/40 flex items-center justify-between">
                            {modalStep === 1 ? (
                                <>
                                    <span className="text-xs text-white/40 font-light">Paso 1: Fecha y Hora</span>
                                    <button
                                        onClick={() => setModalStep(2)}
                                        disabled={!selectedDate || !selectedTime}
                                        className="glass-btn px-6 py-3 bg-brand-sand text-black text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d4c19a] transition-colors rounded-sm flex items-center gap-2"
                                    >
                                        Continuar <ArrowRight className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setModalStep(1)}
                                        className="px-4 py-3 text-xs text-white/60 hover:text-white uppercase tracking-widest font-medium transition-colors flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Volver
                                    </button>
                                    <button
                                        type="submit"
                                        form="booking-form"
                                        disabled={isSubmitting}
                                        className="glass-btn px-6 py-3 bg-brand-sand text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4c19a] transition-colors rounded-sm flex items-center gap-2 shadow-[0_0_20px_rgba(230,213,171,0.2)] disabled:opacity-70"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                                        ) : (
                                            <><CreditCard className="w-4 h-4" /> Ir a Pagar $5.000</>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
