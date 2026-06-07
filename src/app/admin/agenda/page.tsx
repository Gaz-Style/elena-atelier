import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, Calendar, Plus, Clock, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function AgendaPage({
    searchParams
}: {
    searchParams: { date?: string }
}) {
    const supabase = await createClient();
    
    // Configurar la fecha seleccionada o el día actual
    const today = new Date();
    // Ajuste a la zona horaria de Chile si es necesario
    const selectedDateStr = searchParams.date || today.toISOString().split('T')[0];
    const selectedDate = new Date(`${selectedDateStr}T12:00:00`);

    // Obtener los eventos de ese día
    const startOfDay = new Date(`${selectedDateStr}T00:00:00-04:00`);
    const endOfDay = new Date(`${selectedDateStr}T23:59:59-04:00`);

    const { data: eventos, error } = await supabase
        .from('agendamientos')
        .select('*')
        .gte('fecha_hora', startOfDay.toISOString())
        .lte('fecha_hora', endOfDay.toISOString())
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

    // Generar navegación de fechas
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

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
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <Link href="/admin/livechat" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-2 md:hidden">
                                <ArrowLeft className="w-3 h-3" />
                                Volver
                            </Link>
                            <h1 className="text-2xl font-serif">Agenda del Taller</h1>
                        </div>
                    </div>

                    {/* Controles de Fecha */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8">
                        <Link href={`?date=${prevDate.toISOString().split('T')[0]}`} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                            ← Anterior
                        </Link>
                        <div className="flex items-center gap-2 font-medium">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {selectedDate.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                        </div>
                        <Link href={`?date=${nextDate.toISOString().split('T')[0]}`} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                            Siguiente →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Eventos del Día */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="font-serif text-lg mb-4">Citas y Tareas ({eventos?.length || 0})</h2>
                            
                            {eventos?.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                                    <Calendar className="w-8 h-8 mx-auto text-gray-300 mb-2" />
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
                </div>
            </main>
        </div>
    );
}
