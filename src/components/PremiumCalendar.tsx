'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle } from 'lucide-react';
import { getMonthAvailabilityAction } from '@/app/admin/pos/actions';

interface PremiumCalendarProps {
    onConfirm: (dateStr: string, timeStr: string) => void;
    isConfirming?: boolean;
}

export default function PremiumCalendar({ onConfirm, isConfirming = false }: PremiumCalendarProps) {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [monthData, setMonthData] = useState<any[]>([]);
    const [isLoadingMonth, setIsLoadingMonth] = useState(false);
    
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedDayData, setSelectedDayData] = useState<any>(null);
    const [selectedTime, setSelectedTime] = useState<string>('');

    useEffect(() => {
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
    }, [currentYear, currentMonth]);

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

    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const calendarGrid = [];
    for (let i = 0; i < firstDay; i++) {
        calendarGrid.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarGrid.push(i);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Calendar Section */}
            <div className="space-y-8">
                <div className="flex justify-between items-center bg-white/5 p-4 border border-white/10 rounded-sm">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 text-brand-sand transition-colors rounded-sm">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="font-serif text-xl text-white uppercase tracking-widest">
                        {monthNames[currentMonth]} <span className="text-brand-sand">{currentYear}</span>
                    </h3>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 text-brand-sand transition-colors rounded-sm">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {isLoadingMonth ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4 text-brand-sand">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="text-xs uppercase tracking-widest">Verificando agenda...</p>
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
                                            relative h-14 border flex flex-col items-center justify-center transition-all duration-300 rounded-sm
                                            ${isSelected ? 'border-brand-sand bg-brand-sand/10 text-brand-sand' : ''}
                                            ${isAvailable && !isSelected ? 'border-white/10 hover:border-brand-sand/50 text-white hover:bg-white/5 cursor-pointer' : ''}
                                            ${(isClosed || isFull) ? 'border-transparent text-white/20 cursor-not-allowed bg-black/40' : ''}
                                        `}
                                    >
                                        <span className={`font-serif text-lg ${(isClosed || isFull) ? 'line-through decoration-white/20 text-white/20' : ''}`}>
                                            {day}
                                        </span>
                                        {isFull && <span className="absolute bottom-1 text-[8px] uppercase tracking-tighter text-red-900 font-bold bg-red-900/20 px-1 rounded-sm">Lleno</span>}
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
                    <div className="h-48 flex items-center justify-center border border-white/5 bg-white/[0.02] rounded-sm">
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
                                        py-4 border text-sm font-bold uppercase tracking-widest transition-all duration-300 rounded-sm
                                        ${selectedTime === time 
                                            ? 'border-brand-sand bg-brand-sand text-[#121212]' 
                                            : 'border-white/20 bg-transparent text-white hover:border-brand-sand hover:text-brand-sand'}
                                    `}
                                >
                                    {time}
                                </button>
                            ))}

                            {/* Booked Slots */}
                            {selectedDayData.bookedSlots.map((time: string) => (
                                <div
                                    key={`booked-${time}`}
                                    className="py-4 border border-white/5 bg-transparent flex flex-col items-center justify-center transition-all duration-300 rounded-sm"
                                >
                                    <span className="text-sm font-bold text-white/20 line-through decoration-white/10">{time}</span>
                                    <span className="text-[11px] font-serif italic text-brand-sand/50 mt-1 tracking-wider">Reservado</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <button 
                                disabled={!selectedTime || isConfirming}
                                onClick={() => onConfirm(selectedDate, selectedTime)}
                                className={`
                                    w-full flex items-center justify-center gap-3 py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 rounded-sm
                                    ${(!selectedTime || isConfirming)
                                        ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                                        : 'bg-brand-sand text-[#121212] hover:bg-white hover:text-black shadow-[0_0_30px_rgba(193,127,95,0.4)] cursor-pointer'
                                    }
                                `}
                            >
                                {isConfirming ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />} 
                                {isConfirming ? 'Confirmando...' : 'Agendar Cita en Taller'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
