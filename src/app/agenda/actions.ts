'use server';

import { agendar_visita } from '@/lib/agenda';
import { createCustomer } from '../admin/crm/actions';
import { revalidatePath } from 'next/cache';

export async function guardarCitaCliente(data: {
    nombre: string;
    apellido?: string;
    celular: string;
    correo: string;
    fecha_hora: string;
    motivo?: string;
    style_preference?: string;
    typical_occasion?: string;
}) {
    try {
        const fullName = data.apellido ? `${data.nombre} ${data.apellido}`.trim() : data.nombre.trim();
        const firstName = data.nombre.trim();
        const lastName = data.apellido ? data.apellido.trim() : '';

        // 1. Guardar o actualizar cliente en CRM con preferencias de estilo e historial
        const formDataCustomer = new FormData();
        formDataCustomer.append('full_name', fullName);
        formDataCustomer.append('phone', data.celular);
        formDataCustomer.append('email', data.correo);
        if (data.style_preference) formDataCustomer.append('style_preference', data.style_preference);
        if (data.typical_occasion) formDataCustomer.append('typical_occasion', data.typical_occasion);
        
        await createCustomer(formDataCustomer).catch(err => console.error('Error auto-creando cliente CRM:', err));

        // 2. Guardar Cita en tabla `agendamientos` + Enviar Correos y WhatsApp
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
