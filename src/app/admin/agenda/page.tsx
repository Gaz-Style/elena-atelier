import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, Calendar as CalendarIcon, Plus, Clock, Trash2, User, ChevronLeft, ChevronRight, List } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function AgendaPage({
    searchParams
}: {
    searchParams: { date?: string, view?: string }
}) {
    const supabase = await createClient();
    
    // Configurar la fecha seleccionada o el día actual
    const today = new Date();
    // Ajuste a la zona horaria de Chile si es necesario
    const selectedDateStr = searchParams.date || today.toISOString().split('T')[0];
    const selectedDate = new Date(`${selectedDateStr}T12:00:00`);
    
    // Vista seleccionada (por defecto 'month')
    const view = searchParams.view || 'month';

    // Para la vista mensual
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    
    // Encontrar el lunes antes del primer día del mes (para la grilla)
    const startGrid = new Date(firstDayOfMonth);
    const dayOfWeek = startGrid.getDay(); // 0 = Dom, 1 = Lun
    const diff = startGrid.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startGrid.setDate(diff);

    // Fechas de inicio y fin para la base de datos dependiendo de la vista
    let startQuery, endQuery;
    
    if (view === 'month') {
        startQuery = new Date(startGrid.getFullYear(), startGrid.getMonth(), startGrid.getDate(), 0, 0, 0);
        // Hasta el fin del mes (o fin de la última semana visible)
        const endGrid = new Date(startGrid);
        endGrid.setDate(endGrid.getDate() + 41); // Mostrar 6 semanas
        endQuery = new Date(endGrid.getFullYear(), endGrid.getMonth(), endGrid.getDate(), 23, 59, 59);
    } else {
        startQuery = new Date(`${selectedDateStr}T00:00:00-04:00`);
        endQuery = new Date(`${selectedDateStr}T23:59:59-04:00`);
    }

    const { data: eventos, error } = await supabase
        .from('agendamientos')
        .select('*')
        .gte('fecha_hora', startQuery.toISOString())
        .lte('fecha_hora', endQuery.toISOString())
        .neq('estado', 'cancelado')
        .order('fecha_hora', { ascending: true });

    // Server Actions
    async function addBloqueo(formData: FormData) {
        'use server';
        const supabase = await createClient();
        const horaStr = formData.get('hora') as string;
        const notas = formData.get('notas') as string;
        
        const fechaHoraIso = new Date(`${selectedDateStr}T${horaStr}:00-04:00`).toISOString();
        
        await supabase.from('agendamientos').insert([{
            nombre: 'Tarea Interna',
            apellido: '',
            celular: '',
            correo: '',
            fecha_hora: fechaHoraIso,
            origen: 'admin',
            tipo_evento: 'tarea_interna',
            estado: 'confirmado',
            notas: notas || 'Bloqueo manual'
        }]);
        
        revalidatePath('/admin/agenda');
    }

    async function cancelarEvento(formData: FormData) {
        'use server';
        const supabase = await createClient();
        const id = formData.get('id') as string;
        
        await supabase.from('agendamientos').update({ estado: 'cancelado' }).eq('id', id);
        revalidatePath('/admin/agenda');
    }

    // Generar navegación de fechas para DÍA
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Generar navegación de fechas para MES
    const prevMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
    const nextMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);

    // Generar arreglo de días para el calendario
    const days = [];
    const currentIter = new Date(startGrid);
    for (let i = 0; i < 42; i++) {
        days.push(new Date(currentIter));
        currentIter.setDate(currentIter.getDate() + 1);
    }

    const mesNombre = selectedDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Simple */}
            <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col hidden md:flex">
                <div className="mb-10">
                    <h2 className="text-xl font-serif font-bold tracking-wider">ELENA ATELIER</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Admin Panel</p>
                </div>
                <nav className="flex-1 space-y-2">
                    <Link href="/admin/livechat" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-black transition-colors text-sm font-medium">
                        Live Chat
                    </Link>
                    <Link href="/admin/agenda" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black text-white text-sm font-medium">
                        Agenda
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-2 md:hidden">
                                <ArrowLeft className="w-3 h-3" />
                                Volver
                            </Link>
                            <h1 className="text-2xl font-serif">Agenda del Taller</h1>
                        </div>
                        
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <Link 
                                href={`?view=month&date=${selectedDateStr}`}
                                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${view === 'month' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                            >
                                <CalendarIcon className="w-4 h-4" /> Mensual
                            </Link>
                            <Link 
                                href={`?view=day&date=${selectedDateStr}`}
                                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${view === 'day' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                            >
                                <List className="w-4 h-4" /> Diaria
                            </Link>
                        </div>
                    </div>

                    {view === 'month' ? (
                        <>
                            {/* Controles de MES */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
                                <Link href={`?view=month&date=${prevMonth.toISOString().split('T')[0]}`} className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600">
                                    <ChevronLeft className="w-5 h-5" />
                                </Link>
                                <div className="flex items-center gap-2 font-medium text-lg">
                                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                                    {mesNombre}
                                </div>
                                <Link href={`?view=month&date=${nextMonth.toISOString().split('T')[0]}`} className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600">
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>

                            {/* Calendario Mensual */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                                        <div key={d} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest border-r border-gray-100 last:border-r-0">
                                            {d}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7">
                                    {days.map((day, idx) => {
                                        const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                                        const dateStr = day.toISOString().split('T')[0];
                                        const isToday = dateStr === today.toISOString().split('T')[0];
                                        
                                        // Buscar eventos para este día exacto
                                        const dayEvents = eventos?.filter(e => e.fecha_hora.startsWith(dateStr)) || [];
                                        
                                        return (
                                            <Link 
                                                key={idx}
                                                href={`?view=day&date=${dateStr}`}
                                                className={`min-h-[120px] p-3 border-r border-b border-gray-100 hover:bg-gray-50 transition-colors flex flex-col ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-charcoal text-white' : ''}`}>
                                                        {day.getDate()}
                                                    </span>
                                                    {dayEvents.length > 0 && (
                                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-bold">
                                                            {dayEvents.length}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-1 overflow-hidden">
                                                    {dayEvents.slice(0, 3).map((e) => (
                                                        <div key={e.id} className={`text-[10px] truncate px-1.5 py-0.5 rounded ${e.tipo_evento === 'tarea_interna' ? 'bg-gray-200 text-gray-700' : 'bg-brand-sand text-brand-charcoal'}`}>
                                                            {new Date(e.fecha_hora).toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})} - {e.tipo_evento === 'tarea_interna' ? 'Bloqueo' : e.nombre}
                                                        </div>
                                                    ))}
                                                    {dayEvents.length > 3 && (
                                                        <div className="text-[10px] text-gray-400 font-medium px-1">
                                                            +{dayEvents.length - 3} más
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Controles de DÍA */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
                                <Link href={`?view=day&date=${prevDay.toISOString().split('T')[0]}`} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                                    ← Anterior
                                </Link>
                                <div className="flex items-center gap-2 font-medium">
                                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                                    {selectedDate.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                                </div>
                                <Link href={`?view=day&date=${nextDay.toISOString().split('T')[0]}`} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                                    Siguiente →
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Eventos del Día */}
                                <div className="lg:col-span-2 space-y-4">
                                    <h2 className="font-serif text-lg mb-4">Citas y Tareas ({eventos?.length || 0})</h2>
                                    
                                    {eventos?.length === 0 ? (
                                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                                            <CalendarIcon className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                                            <p className="text-gray-500 text-sm">No hay eventos para este día.</p>
                                        </div>
                                    ) : (
                                        eventos?.map((evento) => (
                                            <div key={evento.id} className={`p-4 rounded-xl border flex items-start gap-4 ${evento.tipo_evento === 'tarea_interna' ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 shadow-sm'}`}>
                                                <div className="flex flex-col items-center justify-center p-3 bg-gray-100 rounded-lg min-w-[80px]">
                                                    <Clock className="w-4 h-4 text-gray-500 mb-1" />
                                                    <span className="font-bold text-sm">
                                                        {new Date(evento.fecha_hora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' })}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${evento.tipo_evento === 'tarea_interna' ? 'bg-gray-200 text-gray-700' : 'bg-black text-white'}`}>
                                                                {evento.tipo_evento === 'tarea_interna' ? 'Bloqueo' : 'Cita Cliente'}
                                                            </span>
                                                            <h3 className="font-bold text-lg mt-2">
                                                                {evento.tipo_evento === 'tarea_interna' ? evento.notas : `${evento.nombre} ${evento.apellido}`}
                                                            </h3>
                                                            {evento.tipo_evento === 'cita_cliente' && (
                                                                <div className="text-sm text-gray-600 mt-1 space-y-1">
                                                                    <p>📱 {evento.celular}</p>
                                                                    <p>✉️ {evento.correo}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <form action={cancelarEvento}>
                                                            <input type="hidden" name="id" value={evento.id} />
                                                            <button type="submit" className="text-red-500 hover:text-red-700 p-2" title="Cancelar Evento">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Bloqueador Rápido */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
                                        <h2 className="font-serif text-lg mb-4">Bloquear Horario</h2>
                                        <p className="text-sm text-gray-500 mb-6">Usa esta herramienta para agregar tus tareas internas o cerrar el taller. La IA no agendará citas en estos bloques.</p>
                                        
                                        <form action={addBloqueo} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Hora (00:00 - 23:00)</label>
                                                <select name="hora" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50" required>
                                                    {Array.from({length: 15}, (_, i) => i + 8).map(h => {
                                                        const hora = h.toString().padStart(2, '0') + ':00';
                                                        return <option key={hora} value={h.toString().padStart(2, '0')}>{hora}</option>
                                                    })}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Motivo / Tarea</label>
                                                <input type="text" name="notas" placeholder="Ej: Compra de telas..." className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50" required />
                                            </div>
                                            <button type="submit" className="w-full bg-black text-white p-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                                                <Plus className="w-4 h-4" />
                                                Bloquear Horario
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
