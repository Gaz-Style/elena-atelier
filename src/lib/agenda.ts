import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Assuming gmail based on SMTP_USER ending in @gmail.com or Google Workspace
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function consultar_disponibilidad(fecha: string) {
    try {
        // Asumimos horario base: 10:00 a 18:00 (bloques de 1 hora)
        // Buscamos eventos en esa fecha
        const startOfDay = new Date(`${fecha}T00:00:00-04:00`); // Santiago timezone
        const endOfDay = new Date(`${fecha}T23:59:59-04:00`);

        const { data: eventos, error } = await supabase
            .from('agendamientos')
            .select('fecha_hora')
            .gte('fecha_hora', startOfDay.toISOString())
            .lte('fecha_hora', endOfDay.toISOString())
            .neq('estado', 'cancelado');

        if (error) throw error;

        // Construir bloques base (10:00 a 18:00)
        const bloquesDisponibles = [];
        for (let i = 10; i <= 18; i++) {
            const horaStr = i.toString().padStart(2, '0');
            const bloque = `${fecha}T${horaStr}:00:00-04:00`;
            bloquesDisponibles.push(bloque);
        }

        // Filtrar bloques ocupados
        const horasOcupadas = eventos.map((e) => new Date(e.fecha_hora).toISOString());
        
        const disponiblesReales = bloquesDisponibles.filter((bloque) => {
            const dateStr = new Date(bloque).toISOString();
            return !horasOcupadas.includes(dateStr);
        });

        if (disponiblesReales.length === 0) {
            return `No hay horas disponibles para la fecha ${fecha}. Por favor intenta otro día.`;
        }

        const horasLegibles = disponiblesReales.map(b => new Date(b).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' }));
        return `Las horas disponibles para el ${fecha} son: ${horasLegibles.join(', ')}.`;

    } catch (err: any) {
        console.error('Error consultar_disponibilidad:', err);
        return `Hubo un error al consultar la disponibilidad.`;
    }
}

export async function agendar_visita(nombre: string, apellido: string, celular: string, correo: string, fecha_hora: string) {
    try {
        // Redondear a la hora más cercana o forzar que termine en :00 para evitar desajustes
        const dateObj = new Date(fecha_hora);
        dateObj.setMinutes(0, 0, 0); // Forzar inicio de hora
        const fechaAjustada = dateObj.toISOString();

        // Verificar de nuevo que no esté ocupada
        const { data: existente } = await supabase
            .from('agendamientos')
            .select('id')
            .eq('fecha_hora', fechaAjustada)
            .neq('estado', 'cancelado');

        if (existente && existente.length > 0) {
            return `Lo siento, el bloque de las ${dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' })} acaba de ser ocupado. Por favor, elige otra hora.`;
        }

        // Insertar en Supabase
        const { data, error } = await supabase
            .from('agendamientos')
            .insert([{
                nombre,
                apellido,
                celular,
                correo,
                fecha_hora: fechaAjustada,
                origen: 'whatsapp',
                tipo_evento: 'cita_cliente',
                estado: 'confirmado'
            }])
            .select();

        if (error) throw error;

        // Enviar Correo Electrónico
        const horaLegible = dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' });
        const fechaLegible = dateObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Santiago' });

        try {
            await transporter.sendMail({
                from: `"Atelier Elena" <${process.env.SMTP_USER}>`,
                to: correo,
                subject: 'Tu cita en Elena La Costurera ha sido confirmada ✨',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #111;">¡Hola ${nombre}!</h2>
                        <p>Nos emociona recibirte en nuestro Atelier. Tu cita ha sido agendada exitosamente.</p>
                        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #333; margin: 20px 0;">
                            <p><strong>Fecha:</strong> ${fechaLegible}</p>
                            <p><strong>Hora:</strong> ${horaLegible}</p>
                        </div>
                        <p>Recuerda traer tus prendas si se trata de Upcycling Fit & Repair.</p>
                        <p>¡Nos vemos pronto!</p>
                        <p><strong>Atelier Elena: Sastrería de Autor y Evolución Textil</strong></p>
                    </div>
                `
            });
            
            // Notificación interna a Elena
            await transporter.sendMail({
                from: `"Atelier Bot" <${process.env.SMTP_USER}>`,
                to: process.env.SMTP_USER, // Se la envía a ella misma
                subject: `NUEVA CITA: ${nombre} ${apellido} - ${fechaLegible} ${horaLegible}`,
                text: `Se ha agendado una nueva cita vía IA:\nNombre: ${nombre} ${apellido}\nCelular: ${celular}\nCorreo: ${correo}\nFecha: ${fechaLegible} a las ${horaLegible}`
            });
        } catch (mailError) {
            console.error('Error enviando correos:', mailError);
            // No bloqueamos el flujo si el correo falla, la cita ya está en Supabase
        }

        return `¡Reserva confirmada con éxito! Quedaste agendad@ para el ${fechaLegible} a las ${horaLegible}. Te hemos enviado un correo de respaldo a ${correo}.`;

    } catch (err: any) {
        console.error('Error agendar_visita:', err);
        return `Hubo un error interno al intentar guardar tu cita. Por favor, inténtalo más tarde.`;
    }
}
