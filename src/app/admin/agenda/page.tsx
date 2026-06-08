import { createClient } from '@/lib/supabase/server';
import { agendar_visita } from '@/lib/agenda';
import { getCustomers } from '../crm/actions';
import { ArrowLeft, CalendarDays, LayoutGrid, List, ChevronLeft, ChevronRight, Clock, MapPin, Trash2, Calendar as CalendarIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import AgendaForm from './AgendaForm';

export default async function AgendaPage({
    searchParams
}: {
    searchParams: Promise<{ date?: string, view?: string }>
}) {
    const supabase = await createClient();
    const resolvedSearchParams = await searchParams;
    const customers = await getCustomers();
    
    // Configurar la fecha seleccionada o el día actual
    const today = new Date();
    const selectedDateStr = resolvedSearchParams.date || today.toISOString().split('T')[0];
    const selectedDate = new Date(`${selectedDateStr}T12:00:00`);
    
    // Vista seleccionada (por defecto 'month')
    const view = resolvedSearchParams.view || 'month';

    // --- CÁLCULOS PARA AÑO ---
    const currentYear = selectedDate.getFullYear();

    // --- CÁLCULOS PARA MES ---
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const startGridMonth = new Date(firstDayOfMonth);
    const dayOfWeekMonth = startGridMonth.getDay(); // 0 = Dom, 1 = Lun
    const diffMonth = startGridMonth.getDate() - dayOfWeekMonth + (dayOfWeekMonth === 0 ? -6 : 1);
    startGridMonth.setDate(diffMonth);

    // --- CÁLCULOS PARA SEMANA ---
    const startGridWeek = new Date(selectedDate);
    const dayOfWeekWeek = startGridWeek.getDay();
    const diffWeek = startGridWeek.getDate() - dayOfWeekWeek + (dayOfWeekWeek === 0 ? -6 : 1);
    startGridWeek.setDate(diffWeek);

    // --- DETERMINAR RANGO DE FECHAS SEGÚN VISTA ---
    let startQuery, endQuery;
    
    if (view === 'year') {
        startQuery = new Date(currentYear, 0, 1, 0, 0, 0); // 1 Enero
        endQuery = new Date(currentYear, 11, 31, 23, 59, 59); // 31 Diciembre
    } else if (view === 'month') {
        startQuery = new Date(startGridMonth.getFullYear(), startGridMonth.getMonth(), startGridMonth.getDate(), 0, 0, 0);
        const endGridMonth = new Date(startGridMonth);
        endGridMonth.setDate(endGridMonth.getDate() + 41); // 6 semanas
        endQuery = new Date(endGridMonth.getFullYear(), endGridMonth.getMonth(), endGridMonth.getDate(), 23, 59, 59);
    } else if (view === 'week') {
        startQuery = new Date(startGridWeek.getFullYear(), startGridWeek.getMonth(), startGridWeek.getDate(), 0, 0, 0);
        const endGridWeek = new Date(startGridWeek);
        endGridWeek.setDate(endGridWeek.getDate() + 6); // 1 semana
        endQuery = new Date(endGridWeek.getFullYear(), endGridWeek.getMonth(), endGridWeek.getDate(), 23, 59, 59);
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

    const dayOfWeek = selectedDate.getDay();
    const { data: dbDayConfig, error: configError } = await supabase
        .from('configuracion_horarios')
        .select('*')
        .eq('dia_semana', dayOfWeek)
        .maybeSingle(); // Usar maybeSingle para evitar error si no existe

    const defaultHorarios = [
        { dia_semana: 0, nombre: 'Domingo', activo: false, hora_inicio: '10:00:00', hora_fin: '14:00:00' },
        { dia_semana: 1, nombre: 'Lunes', activo: true, hora_inicio: '10:00:00', hora_fin: '18:00:00' },
        { dia_semana: 2, nombre: 'Martes', activo: true, hora_inicio: '10:00:00', hora_fin: '18:00:00' },
        { dia_semana: 3, nombre: 'Miércoles', activo: true, hora_inicio: '10:00:00', hora_fin: '18:00:00' },
        { dia_semana: 4, nombre: 'Jueves', activo: true, hora_inicio: '10:00:00', hora_fin: '18:00:00' },
        { dia_semana: 5, nombre: 'Viernes', activo: true, hora_inicio: '10:00:00', hora_fin: '18:00:00' },
        { dia_semana: 6, nombre: 'Sábado', activo: false, hora_inicio: '10:00:00', hora_fin: '14:00:00' },
    ];

    const currentDayConfig = dbDayConfig || defaultHorarios.find(h => h.dia_semana === dayOfWeek);

    // Server Actions
    async function addEventoManual(formData: FormData) {
        'use server';
        
        try {
            const supabaseServer = await createClient(); // Utiliza las cookies de admin
            
            const tipo = formData.get('tipo') as string;
            const horaStr = formData.get('hora') as string;
            const dateStr = formData.get('date') as string;
            const fechaHoraIso = new Date(`${dateStr}T${horaStr}:00-04:00`).toISOString();
            
            if (tipo === 'cliente') {
                const nombre = formData.get('nombre') as string;
                const apellido = formData.get('apellido') as string;
                const celular = formData.get('celular') as string || '';
                const correo = formData.get('correo') as string || '';
                
                // 1. Insertar con el cliente autenticado para evitar RLS
                const { error: insertError } = await supabaseServer.from('agendamientos').insert([{
                    nombre,
                    apellido,
                    celular,
                    correo,
                    fecha_hora: fechaHoraIso,
                    origen: 'admin',
                    tipo_evento: 'cita_cliente',
                    estado: 'confirmado'
                }]);
                
                if (insertError) {
                    return { success: false, error: 'Error RLS Cliente: ' + insertError.message };
                }
                
                // 2. Enviar correo de confirmación
                const { enviar_correo_confirmacion } = await import('@/lib/agenda');
                await enviar_correo_confirmacion(nombre, apellido, celular, correo, fechaHoraIso);
            } else {
                const notas = formData.get('notas') as string;
                
                const { error } = await supabaseServer.from('agendamientos').insert([{
                    nombre: 'Tarea Interna',
                    apellido: '',
                    celular: 'N/A',
                    correo: 'interno@taller.cl',
                    fecha_hora: fechaHoraIso,
                    origen: 'admin',
                    tipo_evento: 'tarea_interna',
                    estado: 'confirmado',
                    notas: notas || 'Bloqueo manual'
                }]);

                if (error) {
                    return { success: false, error: 'Error RLS Tarea: ' + error.message };
                }
            }
            
            revalidatePath('/admin/agenda');
            return { success: true };
        } catch (e: any) {
            console.error('Exception in addEventoManual:', e);
            return { success: false, error: 'Excepción: ' + e.message };
        }
    }

    async function cancelarEvento(formData: FormData) {
        'use server';
        const supabase = await createClient();
        const id = formData.get('id') as string;
        
        await supabase.from('agendamientos').update({ estado: 'cancelado' }).eq('id', id);
        revalidatePath('/admin/agenda');
    }

    // --- NAVEGACIÓN ---
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const prevWeek = new Date(selectedDate);
    prevWeek.setDate(prevWeek.getDate() - 7);
    const nextWeek = new Date(selectedDate);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const prevMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
    const nextMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);

    const prevYear = new Date(selectedDate.getFullYear() - 1, 0, 1);
    const nextYear = new Date(selectedDate.getFullYear() + 1, 0, 1);

    // --- GENERAR ARREGLOS DE DÍAS Y MESES ---
    const monthDays = [];
    let iterMonth = new Date(startGridMonth);
    for (let i = 0; i < 42; i++) {
        monthDays.push(new Date(iterMonth));
        iterMonth.setDate(iterMonth.getDate() + 1);
    }

    const weekDays = [];
    let iterWeek = new Date(startGridWeek);
    for (let i = 0; i < 7; i++) {
        weekDays.push(new Date(iterWeek));
        iterWeek.setDate(iterWeek.getDate() + 1);
    }

    const yearMonths = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1));

    const mesNombre = selectedDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase();
    const semanaRangoStr = `${weekDays[0].getDate()} ${weekDays[0].toLocaleDateString('es-CL', { month: 'short' })} - ${weekDays[6].getDate()} ${weekDays[6].toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })}`;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
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
                    <Link href="/admin/horarios" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-black transition-colors text-sm font-medium">
                        Horarios
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8">
                        <div>
                            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-2 md:hidden">
                                <ArrowLeft className="w-3 h-3" />
                                Volver
                            </Link>
                            <h1 className="text-2xl font-serif">Agenda del Taller</h1>
                        </div>
                        
                        <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
                            <Link 
                                href={`/admin/agenda?view=year&date=${selectedDateStr}`}
                                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${view === 'year' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                            >
                                <CalendarDays className="w-4 h-4" /> Anual
                            </Link>
                            <Link 
                                href={`/admin/agenda?view=month&date=${selectedDateStr}`}
                                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${view === 'month' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                            >
                                <LayoutGrid className="w-4 h-4" /> Mensual
                            </Link>
                            <Link 
                                href={`/admin/agenda?view=week&date=${selectedDateStr}`}
                                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${view === 'week' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                            >
                                <CalendarIcon className="w-4 h-4" /> Semanal
                            </Link>
                            <Link 
                                href={`/admin/agenda?view=day&date=${selectedDateStr}`}
                                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${view === 'day' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                            >
                                <List className="w-4 h-4" /> Diaria
                            </Link>
                        </div>
                    </div>

                    {/* VISTA ANUAL */}
                    {view === 'year' && (
                        <>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
                                <Link href={`/admin/agenda?view=year&date=${prevYear.toISOString().split('T')[0]}`} className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600">
                                    <ChevronLeft className="w-5 h-5" />
                                </Link>
                                <div className="flex items-center gap-2 font-medium text-lg">
                                    <CalendarDays className="w-5 h-5 text-gray-400" />
                                    AÑO {currentYear}
                                </div>
                                <Link href={`/admin/agenda?view=year&date=${nextYear.toISOString().split('T')[0]}`} className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600">
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {yearMonths.map((monthDate, idx) => {
                                    const monthIndex = monthDate.getMonth();
                                    const isCurrentMonth = monthIndex === today.getMonth() && currentYear === today.getFullYear();
                                    const monthName = monthDate.toLocaleDateString('es-CL', { month: 'long' });
                                    
                                    // Filtrar eventos de este mes
                                    const monthEvents = eventos?.filter(e => {
                                        const eventDate = new Date(e.fecha_hora);
                                        return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === currentYear;
                                    }) || [];

                                    const citasCount = monthEvents.filter(e => e.tipo_evento === 'cita_cliente').length;
                                    const bloqueosCount = monthEvents.filter(e => e.tipo_evento === 'tarea_interna').length;

                                    // Generar pequeña grilla (solo representativa o números)
                                    // Para simplificar, mostraremos un resumen del mes
                                    return (
                                        <Link 
                                            key={idx}
                                            href={`/admin/agenda?view=month&date=${monthDate.toISOString().split('T')[0]}`}
                                            className={`bg-white rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md hover:border-brand-terracotta flex flex-col ${isCurrentMonth ? 'border-brand-charcoal' : 'border-gray-100'}`}
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className={`font-serif text-xl capitalize ${isCurrentMonth ? 'text-brand-terracotta font-bold' : 'text-brand-charcoal'}`}>
                                                    {monthName}
                                                </h3>
                                            </div>
                                            
                                            <div className="flex-1 space-y-3">
                                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Citas</span>
                                                    <span className="font-serif text-lg">{citasCount}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Bloqueos</span>
                                                    <span className="font-serif text-lg text-gray-400">{bloqueosCount}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 text-[10px] text-gray-400 text-center uppercase tracking-widest flex items-center justify-center gap-1 group-hover:text-brand-terracotta transition-colors">
                                                Ver Detalles <ChevronRight className="w-3 h-3" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* VISTA MENSUAL */}
                    {view === 'month' && (
                        <>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
                                <Link href={`/admin/agenda?view=month&date=${prevMonth.toISOString().split('T')[0]}`} className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600">
                                    <ChevronLeft className="w-5 h-5" />
                                </Link>
                                <div className="flex items-center gap-2 font-medium text-lg">
                                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                                    {mesNombre}
                                </div>
                                <Link href={`/admin/agenda?view=month&date=${nextMonth.toISOString().split('T')[0]}`} className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600">
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                                        <div key={d} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest border-r border-gray-100 last:border-r-0">
                                            {d}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7">
                                    {monthDays.map((day, idx) => {
                                        const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                                        const dateStr = day.toISOString().split('T')[0];
                                        const isToday = dateStr === today.toISOString().split('T')[0];
                                        
                                        const dayEvents = eventos?.filter(e => e.fecha_hora.startsWith(dateStr)) || [];
                                        
                                        return (
                                            <Link 
                                                key={idx}
                                                href={`/admin/agenda?view=day&date=${dateStr}`}
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
                    )}

                    {/* VISTA SEMANAL */}
                    {view === 'week' && (
                        <>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
                                <Link href={`/admin/agenda?view=week&date=${prevWeek.toISOString().split('T')[0]}`} className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600">
                                    <ChevronLeft className="w-5 h-5" />
                                </Link>
                                <div className="flex items-center gap-2 font-medium text-lg">
                                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                                    Semana: {semanaRangoStr}
                                </div>
                                <Link href={`/admin/agenda?view=week&date=${nextWeek.toISOString().split('T')[0]}`} className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600">
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                                {weekDays.map((day, idx) => {
                                    const dateStr = day.toISOString().split('T')[0];
                                    const isToday = dateStr === today.toISOString().split('T')[0];
                                    const dayName = day.toLocaleDateString('es-CL', { weekday: 'short' });
                                    
                                    const dayEvents = eventos?.filter(e => e.fecha_hora.startsWith(dateStr)) || [];

                                    return (
                                        <div key={idx} className="flex-1 border-b md:border-b-0 md:border-r border-gray-100 last:border-0 md:min-h-[500px]">
                                            <div className="p-3 text-center border-b border-gray-100 bg-gray-50 flex flex-row md:flex-col justify-between md:justify-center items-center">
                                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold md:mb-1">{dayName}</p>
                                                <p className={`text-lg font-serif ${isToday ? 'text-brand-terracotta' : 'text-brand-charcoal'}`}>{day.getDate()}</p>
                                            </div>
                                            <div className="p-2 space-y-2 h-[200px] md:h-[450px] overflow-y-auto">
                                                {/* Enlace para ir a la vista diaria */}
                                                <Link href={`/admin/agenda?view=day&date=${dateStr}`} className="block text-center text-[10px] text-gray-400 hover:text-black mb-3 pb-2 border-b border-gray-50 transition-colors">
                                                    Añadir/Detalle +
                                                </Link>
                                                
                                                {dayEvents.map((e) => (
                                                    <div key={e.id} className={`p-2 rounded-lg text-xs border ${e.tipo_evento === 'tarea_interna' ? 'bg-gray-50 border-gray-200' : 'bg-brand-sand/30 border-brand-sand text-brand-charcoal'}`}>
                                                        <div className="font-bold mb-1">
                                                            {new Date(e.fecha_hora).toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}
                                                        </div>
                                                        <div className="truncate">
                                                            {e.tipo_evento === 'tarea_interna' ? e.notas : `${e.nombre} ${e.apellido}`}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* VISTA DIARIA */}
                    {view === 'day' && (
                        <>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
                                <Link href={`/admin/agenda?view=day&date=${prevDay.toISOString().split('T')[0]}`} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                                    ← Anterior
                                </Link>
                                <div className="flex items-center gap-2 font-medium">
                                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                                    {selectedDate.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                                </div>
                                <Link href={`/admin/agenda?view=day&date=${nextDay.toISOString().split('T')[0]}`} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
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
                                            <div key={evento.id} className={`p-4 rounded-xl border flex items-start gap-4 ${evento.tipo_evento === 'tarea_interna' ? 'bg-gray-50 border-gray-200' : evento.tipo_evento === 'retiro_encargo' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-200 shadow-sm'}`}>
                                                <div className="flex flex-col items-center justify-center p-3 bg-gray-100 rounded-lg min-w-[80px]">
                                                    <Clock className="w-4 h-4 text-gray-500 mb-1" />
                                                    <span className="font-bold text-sm">
                                                        {new Date(evento.fecha_hora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' })}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${evento.tipo_evento === 'tarea_interna' ? 'bg-gray-200 text-gray-700' : evento.tipo_evento === 'retiro_encargo' ? 'bg-blue-600 text-white' : 'bg-black text-white'}`}>
                                                                {evento.tipo_evento === 'tarea_interna' ? 'Bloqueo' : evento.tipo_evento === 'retiro_encargo' ? 'Retiro de Prenda' : 'Cita Cliente'}
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
                                                            {evento.tipo_evento === 'retiro_encargo' && evento.notas && (
                                                                <div className="text-sm text-blue-700 mt-1 italic">
                                                                    {evento.notas}
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

                                {/* Bloqueador / Agendador Rápido */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
                                        <h2 className="font-serif text-lg mb-4">Agendamiento Manual</h2>
                                        <p className="text-sm text-gray-500 mb-6">Agenda clientes para notificarles por correo o bloquea tu tiempo con tareas internas.</p>
                                        
                                        <AgendaForm 
                                            selectedDateStr={selectedDateStr} 
                                            addEventoManual={addEventoManual}
                                            customers={customers || []}
                                            currentDayConfig={currentDayConfig}
                                        />
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
