'use server';

import { agendar_visita } from '@/lib/agenda';
import { revalidatePath } from 'next/cache';

export async function guardarCitaCliente(data: {
    nombre: string;
    apellido?: string;
    celular: string;
    correo: string;
    fecha_hora: string;
    motivo?: string;
}) {
    try {
        const firstName = data.nombre.trim();
        const lastName = data.apellido ? data.apellido.trim() : '';

        // Guardar Cita únicamente en la tabla `agendamientos` respetando el esquema original
        const res = await agendar_visita(
            firstName,
            lastName,
            data.celular,
            data.correo,
            data.fecha_hora,
            'web'
        );

        revalidatePath('/admin/agenda');
        return { success: true, message: res };
    } catch (error: any) {
        console.error('Error al guardar cita pública:', error);
        return { success: false, error: error.message || 'Error al procesar la reserva' };
    }
}
