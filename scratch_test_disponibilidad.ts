import { createClient } from '@supabase/supabase-js';
import { toSantiagoISO } from './src/lib/timezone';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function consultar_disponibilidad(fecha_inicial: string) {
    try {
        const slotsEncontrados = [];
        const maxDiasBusqueda = 4;
        let fechaActual = new Date(toSantiagoISO(fecha_inicial, '12:00:00'));

        const { data: configs } = await supabase.from('configuracion_horarios').select('*').eq('activo', true);
        if (!configs || configs.length === 0) return "El taller no tiene horarios configurados.";

        const startOfSearch = new Date(toSantiagoISO(fecha_inicial, '00:00:00'));
        const endOfSearch = new Date(startOfSearch);
        endOfSearch.setDate(endOfSearch.getDate() + maxDiasBusqueda);

        const { data: eventos, error } = await supabase
            .from('agendamientos')
            .select('fecha_hora')
            .gte('fecha_hora', startOfSearch.toISOString())
            .lte('fecha_hora', endOfSearch.toISOString())
            .neq('estado', 'cancelado');
            
        if (error) throw error;

        const { data: milestones } = await supabase
            .from('bridal_milestones')
            .select('scheduled_date')
            .gte('scheduled_date', startOfSearch.toISOString())
            .lte('scheduled_date', endOfSearch.toISOString())
            .neq('status', 'completed')
            .not('scheduled_date', 'is', null);

        const horasOcupadas = [
            ...(eventos ? eventos.map((e) => new Date(e.fecha_hora).toISOString()) : []),
            ...(milestones ? milestones.map((m) => new Date(m.scheduled_date).toISOString()) : [])
        ];

        let lineasDisponibilidad: string[] = [];

        for (let i = 0; i < maxDiasBusqueda; i++) {
            const dayOfWeek = fechaActual.getDay();
            const configDia = configs.find(c => c.dia_semana === dayOfWeek);

            const fechaStr = fechaActual.toISOString().split('T')[0];
            const diaLegible = fechaActual.toLocaleDateString('es-CL', { weekday: 'long', timeZone: 'America/Santiago' });

            if (configDia) {
                const startHour = parseInt(configDia.hora_inicio.split(':')[0]);
                const endHour = parseInt(configDia.hora_fin.split(':')[0]);
                const horasLibresDia: string[] = [];

                for (let h = startHour; h < endHour; h++) {
                    if (h === 13) continue; // Colación

                    const horaStr = h.toString().padStart(2, '0');
                    const bloqueISO = toSantiagoISO(fechaStr, `${horaStr}:00:00`);
                    const bloqueDate = new Date(bloqueISO);

                    if (bloqueDate > new Date()) {
                        if (!horasOcupadas.includes(bloqueDate.toISOString())) {
                            horasLibresDia.push(`${horaStr}:00`);
                            slotsEncontrados.push({ fecha: fechaStr, diaLegible, hora: `${horaStr}:00` });
                        }
                    }
                }

                if (horasLibresDia.length > 0) {
                    lineasDisponibilidad.push(`- ${diaLegible} ${fechaStr}: Horas disponibles -> ${horasLibresDia.join(', ')}`);
                } else {
                    lineasDisponibilidad.push(`- ${diaLegible} ${fechaStr}: Sin disponibilidad (Agenda llena).`);
                }
            } else {
                lineasDisponibilidad.push(`- ${diaLegible} ${fechaStr}: Taller cerrado.`);
            }
            
            fechaActual.setDate(fechaActual.getDate() + 1);
        }

        if (slotsEncontrados.length === 0) {
            return `No hay horas disponibles en la agenda para los próximos días a partir de ${fecha_inicial}.`;
        }

        return `Disponibilidad real de la agenda (Supabase):\n${lineasDisponibilidad.join('\n')}`;

    } catch (err: any) {
        console.error('Error consultar_disponibilidad:', err);
        return `Hubo un error al consultar la disponibilidad real de la agenda.`;
    }
}

async function test() {
    const res = await consultar_disponibilidad('2026-09-30');
    console.log(res);
}
test();
