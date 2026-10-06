import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, ChevronRight, Scissors } from 'lucide-react';
import { getOperatorInfo, getOperatorDayTasks, getTallerDayAppointments } from '@/app/taller/actions';

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-zinc-100 text-zinc-500',
    cutting: 'bg-blue-50 text-blue-600',
    sewing: 'bg-purple-50 text-purple-600',
    finishing: 'bg-orange-50 text-orange-600',
    ready: 'bg-green-50 text-green-600',
    delivered: 'bg-zinc-800 text-zinc-200'
};

export default async function TallerDayViewPage({
    params
}: {
    params: Promise<{ operatorId: string, dateStr: string }>
}) {
    const resolvedParams = await params;
    const { operatorId, dateStr } = resolvedParams;

    const operator = await getOperatorInfo(operatorId);
    if (!operator) return notFound();

    const [tasks, appointments] = await Promise.all([
        getOperatorDayTasks(operatorId, dateStr),
        getTallerDayAppointments(dateStr)
    ]);

    // Format Date string
    const dateObj = new Date(`${dateStr}T12:00:00`);
    const formattedDate = dateObj.toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }).toUpperCase();

    const isToday = dateStr === new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });

    return (
        <div className="min-h-screen bg-[#FDFCF8] font-sans pb-24">
            {/* Cabecera / Top Bar */}
            <header className="bg-white border-b border-[#F5F5F0] sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href={`/taller/${operatorId}`} className="p-2 -ml-2 rounded-full hover:bg-[#F5F5F0] transition-colors">
                        <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
                    </Link>
                    <div className="text-center">
                        <h1 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#737373] flex items-center justify-center gap-2">
                            <Scissors className="w-3 h-3" /> PORTAL TALLER
                        </h1>
                        <p className="text-sm font-serif font-bold text-[#1A1A1A] mt-0.5">{operator.name}</p>
                    </div>
                    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F5F0] font-serif font-bold text-[#C17F5F]">
                        {operator.name.charAt(0)}
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto p-4 space-y-8 mt-2 animate-in fade-in duration-500">
                
                {/* Título del Día */}
                <div className="text-center">
                    {isToday && (
                        <span className="inline-block bg-[#C17F5F] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                            Hoy
                        </span>
                    )}
                    <h2 className="text-xl font-serif text-[#1A1A1A] font-bold leading-tight">
                        {formattedDate}
                    </h2>
                </div>

                {/* Sección: Citas y Entregas */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-4 bg-black rounded-full" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">Citas y Entregas del Taller</h3>
                        <span className="text-[10px] bg-[#F5F5F0] px-2 py-0.5 rounded-full font-bold ml-auto">{appointments.length}</span>
                    </div>

                    {appointments.length === 0 ? (
                        <div className="bg-white border border-dashed border-[#E5E5E5] rounded-2xl p-6 text-center">
                            <Clock className="w-6 h-6 mx-auto text-[#D4D4D4] mb-2" />
                            <p className="text-xs text-[#737373]">No hay citas programadas para este día.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {appointments.map((app: any) => (
                                <div key={app.id} className={`p-4 rounded-xl border ${app.tipo_evento === 'retiro_encargo' ? 'bg-[#FDFCF8] border-[#C17F5F]/20' : 'bg-white border-[#E5E5E5]'} flex gap-3 shadow-sm`}>
                                    <div className="flex flex-col items-center justify-center bg-[#F5F5F0] rounded-lg p-2 min-w-[60px] shrink-0">
                                        <Clock className="w-4 h-4 text-[#C17F5F] mb-1" />
                                        <span className="font-bold text-[11px] text-[#1A1A1A]">
                                            {new Date(app.fecha_hora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' })}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${
                                                app.tipo_evento === 'retiro_encargo' 
                                                    ? 'bg-[#C17F5F] text-white' 
                                                    : app.tipo_evento === 'tarea_interna'
                                                        ? 'bg-[#E5E5E5] text-[#4A4A4A]'
                                                        : 'bg-black text-white'
                                            }`}>
                                                {app.tipo_evento === 'retiro_encargo' ? 'Entrega' : app.tipo_evento === 'tarea_interna' ? 'Bloqueo' : 'Cita'}
                                            </span>
                                        </div>
                                        <p className="font-bold text-sm text-[#1A1A1A] truncate">
                                            {app.tipo_evento === 'tarea_interna' ? app.notas : `${app.nombre} ${app.apellido || ''}`}
                                        </p>
                                        <p className="text-xs text-[#737373] mt-0.5 line-clamp-2 leading-snug">
                                            {app.tipo_evento === 'tarea_interna' ? 'Bloqueo en Agenda' : app.notas}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Sección: Trabajos a Realizar */}
                <section>
                    <div className="flex items-center gap-2 mb-4 mt-8">
                        <div className="w-1.5 h-4 bg-[#C17F5F] rounded-full" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">Trabajos a Realizar</h3>
                        <span className="text-[10px] bg-[#F5F5F0] px-2 py-0.5 rounded-full font-bold ml-auto">{tasks.length}</span>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="bg-white border border-dashed border-[#E5E5E5] rounded-2xl p-6 text-center">
                            <Scissors className="w-6 h-6 mx-auto text-[#D4D4D4] mb-2" />
                            <p className="text-xs text-[#737373]">No tienes trabajos asignados para este día.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tasks.map((task: any, i: number) => {
                                const hasOrder = !!task.order_id;
                                
                                const content = (
                                    <div className="flex items-center gap-3 w-full">
                                        <span className="text-xs font-mono text-[#C17F5F] font-bold shrink-0 w-10">
                                            {task.time_label || `${String(task.start_hour || 9).padStart(2, '0')}:00`}
                                        </span>
                                        
                                        <div className="min-w-0 flex-1 py-1">
                                            <p className="text-sm text-[#1A1A1A] font-medium leading-tight line-clamp-2 pr-2">
                                                {task.description || task.order?.description || 'Tarea'}
                                            </p>
                                            {task.order && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <p className="text-[10px] text-[#737373] truncate bg-[#F5F5F0] px-2 py-0.5 rounded-sm">
                                                        {task.order.customerName}
                                                    </p>
                                                    {task.order.status && (
                                                        <span className={`text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm shrink-0 ${STATUS_COLORS[task.order.status] || 'bg-zinc-100 text-zinc-500'}`}>
                                                            {task.order.status}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] border border-[#E5E5E5] text-[#4A4A4A] px-2 py-1 rounded-md font-bold uppercase tracking-widest bg-white">
                                                {task.duration_hours}h
                                            </span>
                                            {hasOrder && (
                                                <ChevronRight className="w-4 h-4 text-[#C17F5F]" />
                                            )}
                                        </div>
                                    </div>
                                );

                                if (hasOrder) {
                                    return (
                                        <Link 
                                            key={task.id || i}
                                            href={`/taller/${operatorId}/orden/${task.order_id}`} 
                                            className="block p-4 bg-white border border-[#E5E5E5] rounded-xl hover:border-[#C17F5F] hover:shadow-md transition-all active:scale-[0.98]"
                                        >
                                            {content}
                                        </Link>
                                    );
                                }

                                return (
                                    <div key={task.id || i} className="p-4 bg-white border border-[#E5E5E5] rounded-xl opacity-80">
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
