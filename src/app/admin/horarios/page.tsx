import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Clock, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function HorariosPage() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch existing config
    const { data: horarios, error } = await supabaseAdmin
        .from('configuracion_horarios')
        .select('*')
        .order('dia_semana', { ascending: true });

    // Si no hay datos (porque la tabla está vacía tras crearla), mostramos un fallback para la UI
    // 0: Dom, 1: Lun, 2: Mar, 3: Mie, 4: Jue, 5: Vie, 6: Sab
    const defaultHorarios = [
        { dia_semana: 1, nombre: 'Lunes', activo: true, hora_inicio: '10:00:00', hora_fin: '18:00:00' },
        { dia_semana: 2, nombre: 'Martes', activo: true, hora_inicio: '10:00:00', hora_fin: '18:00:00' },
        { dia_semana: 3, nombre: 'Miércoles', activo: true, hora_inicio: '10:00:00', hora_fin: '18:00:00' },
        { dia_semana: 4, nombre: 'Jueves', activo: true, hora_inicio: '10:00:00', hora_fin: '18:00:00' },
        { dia_semana: 5, nombre: 'Viernes', activo: true, hora_inicio: '10:00:00', hora_fin: '18:00:00' },
        { dia_semana: 6, nombre: 'Sábado', activo: false, hora_inicio: '10:00:00', hora_fin: '14:00:00' },
        { dia_semana: 0, nombre: 'Domingo', activo: false, hora_inicio: '10:00:00', hora_fin: '14:00:00' },
    ];

    const currentHorarios = defaultHorarios.map(def => {
        const found = horarios?.find(h => h.dia_semana === def.dia_semana);
        if (found) {
            return { ...def, activo: found.activo, hora_inicio: found.hora_inicio, hora_fin: found.hora_fin };
        }
        return def;
    });

    async function saveHorarios(formData: FormData) {
        'use server';
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        for (let i = 0; i <= 6; i++) {
            const activo = formData.get(`activo_${i}`) === 'on';
            const hora_inicio = formData.get(`inicio_${i}`) as string;
            const hora_fin = formData.get(`fin_${i}`) as string;

            // Upsert configuration
            const { error } = await supabaseAdmin.from('configuracion_horarios').upsert({
                dia_semana: i,
                activo,
                hora_inicio: hora_inicio ? `${hora_inicio}:00` : null,
                hora_fin: hora_fin ? `${hora_fin}:00` : null
            }, { onConflict: 'dia_semana' });
            
            if (error) console.error("Error saving horario", i, ":", error);
        }

        revalidatePath('/admin/horarios');
        revalidatePath('/admin/agenda');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Simple */}
            <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col hidden md:flex shrink-0">
                <div className="mb-10">
                    <h2 className="text-xl font-serif font-bold tracking-wider">ELENA ATELIER</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Admin Panel</p>
                </div>
                <nav className="flex-1 space-y-2">
                    <Link href="/admin/livechat" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-black transition-colors text-sm font-medium">
                        Live Chat
                    </Link>
                    <Link href="/admin/agenda" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-black transition-colors text-sm font-medium">
                        Agenda
                    </Link>
                    <Link href="/admin/horarios" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black text-white text-sm font-medium">
                        Horarios
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-2 md:hidden">
                            <ArrowLeft className="w-3 h-3" />
                            Volver
                        </Link>
                        <h1 className="text-2xl font-serif">Configuración de Horarios</h1>
                        <p className="text-gray-500 mt-2">Define qué días y en qué horas atiende el taller. La IA de WhatsApp respetará estrictamente estas reglas.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 mb-8">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm">No se pudo cargar la configuración. Asegúrate de haber ejecutado el código SQL en Supabase para crear la tabla `configuracion_horarios`.</p>
                        </div>
                    )}

                    <form action={saveHorarios} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <h2 className="font-bold text-gray-700 uppercase tracking-widest text-sm">Días Laborales y Horas</h2>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {currentHorarios.map((dia) => (
                                <div key={dia.dia_semana} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl bg-gray-50 hover:bg-white transition-colors">
                                    <div className="flex items-center gap-3 w-48">
                                        <input 
                                            type="checkbox" 
                                            name={`activo_${dia.dia_semana}`} 
                                            defaultChecked={dia.activo}
                                            className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                                        />
                                        <label className="font-bold">{dia.nombre}</label>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="flex flex-col flex-1">
                                            <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Apertura</label>
                                            <input 
                                                type="time" 
                                                name={`inicio_${dia.dia_semana}`} 
                                                defaultValue={dia.hora_inicio?.substring(0, 5)}
                                                className="p-2 border rounded-lg w-full text-sm outline-none focus:border-black"
                                            />
                                        </div>
                                        <span className="text-gray-400 mt-5">-</span>
                                        <div className="flex flex-col flex-1">
                                            <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Cierre</label>
                                            <input 
                                                type="time" 
                                                name={`fin_${dia.dia_semana}`} 
                                                defaultValue={dia.hora_fin?.substring(0, 5)}
                                                className="p-2 border rounded-lg w-full text-sm outline-none focus:border-black"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button type="submit" className="bg-black text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
                                <Save className="w-4 h-4" />
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
