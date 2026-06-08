import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Assuming gmail based on SMTP_USER ending in @gmail.com or Google Workspace
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function consultar_disponibilidad(fecha_inicial: string) {
    try {
        const slotsEncontrados = [];
        const maxDiasBusqueda = 7;
        let fechaActual = new Date(`${fecha_inicial}T12:00:00-04:00`);

        const { data: configs } = await supabase.from('configuracion_horarios').select('*').eq('activo', true);
        if (!configs || configs.length === 0) return "El taller no tiene horarios configurados.";

        const startOfSearch = new Date(`${fecha_inicial}T00:00:00-04:00`);
        const endOfSearch = new Date(startOfSearch);
        endOfSearch.setDate(endOfSearch.getDate() + maxDiasBusqueda);

        const { data: eventos, error } = await supabase
            .from('agendamientos')
            .select('fecha_hora')
            .gte('fecha_hora', startOfSearch.toISOString())
            .lte('fecha_hora', endOfSearch.toISOString())
            .neq('estado', 'cancelado');
            
        if (error) throw error;
        const horasOcupadas = eventos ? eventos.map((e) => new Date(e.fecha_hora).toISOString()) : [];

        for (let i = 0; i < maxDiasBusqueda; i++) {
            if (slotsEncontrados.length >= 3) break;

            const dayOfWeek = fechaActual.getDay();
            const configDia = configs.find(c => c.dia_semana === dayOfWeek);

            if (configDia) {
                const fechaStr = fechaActual.toISOString().split('T')[0];
                const startHour = parseInt(configDia.hora_inicio.split(':')[0]);
                const endHour = parseInt(configDia.hora_fin.split(':')[0]);

                for (let h = startHour; h < endHour; h++) {
                    const horaStr = h.toString().padStart(2, '0');
                    const bloqueISO = `${fechaStr}T${horaStr}:00:00-04:00`;
                    
                    const bloqueDate = new Date(bloqueISO);
                    if (bloqueDate > new Date()) {
                        if (!horasOcupadas.includes(bloqueDate.toISOString())) {
                            slotsEncontrados.push({
                                fecha: fechaStr,
                                diaLegible: fechaActual.toLocaleDateString('es-CL', { weekday: 'long', timeZone: 'America/Santiago' }),
                                hora: `${horaStr}:00`
                            });
                        }
                    }
                }
            }
            
            fechaActual.setDate(fechaActual.getDate() + 1);
        }

        if (slotsEncontrados.length === 0) {
            return `No hay horas disponibles en los próximos días empezando desde ${fecha_inicial}.`;
        }

        const opciones = slotsEncontrados.slice(0, 3).map((s, idx) => `Opción ${idx + 1}: ${s.diaLegible} ${s.fecha} a las ${s.hora}`);
        return `Opciones de horarios disponibles:\n${opciones.join('\n')}`;

    } catch (err: any) {
        console.error('Error consultar_disponibilidad:', err);
        return `Hubo un error al consultar la disponibilidad.`;
    }
}

export async function enviar_correo_confirmacion(nombre: string, apellido: string, celular: string, correo: string, fechaAjustada: string) {
    if (!correo) return;
    
    const dateObj = new Date(fechaAjustada);
    const horaLegible = dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' });
    const fechaLegible = dateObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Santiago' });

    const smtpUser = process.env.SMTP_USER || '';
    const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;

    try {
        await transporter.sendMail({
            from: `"ELENA La Costurera" <${fromAddress}>`,
            to: correo,
            subject: 'Confirmación de Cita — ELENA La Costurera',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="utf-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Playfair+Display:ital,wght@0,300;0,400;0,600;1,400&display=swap');
            </style>
            </head>
            <body style="margin: 0; padding: 40px 20px; background-color: #f5f5f0; font-family: 'Inter', sans-serif;">
              <div style="max-width: 480px; margin: 0 auto; background-color: #111111; border-radius: 8px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">
                
                <!-- Header -->
                <div style="padding: 40px 30px; text-align: center; border-bottom: 1px dashed rgba(245, 242, 235, 0.15);">
                  <div style="font-size: 10px; color: #8A857D; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 12px;">Atelier</div>
                  <h1 style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 300; color: #FFFFFF; margin: 0; letter-spacing: 2px;">ELENA</h1>
                  <div style="font-size: 8px; color: #C17F5F; letter-spacing: 4px; text-transform: uppercase; margin-top: 8px;">La Costurera</div>
                </div>
                
                <!-- Body -->
                <div style="padding: 40px 30px; text-align: center;">
                  <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 300; color: #FFFFFF; margin: 0 0 24px 0; font-style: italic;">¡Hola ${nombre}!</h2>
                  
                  <p style="color: #F5F5F0; font-size: 13px; line-height: 1.6; font-weight: 300; margin-bottom: 30px; opacity: 0.9;">
                    Nos emociona recibirte. Tu cita para Premium Custom Upcycling & Alta Costura ha sido confirmada en nuestro sistema.
                  </p>
                  
                  <!-- Ticket Details -->
                  <div style="border: 1px solid rgba(193, 127, 95, 0.3); border-radius: 4px; padding: 24px; background-color: rgba(255,255,255,0.03); margin-bottom: 30px;">
                    <p style="font-size: 9px; font-weight: 600; color: #C17F5F; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 12px 0;">LUXURY PASS & RESERVA</p>
                    
                    <div style="margin-bottom: 16px;">
                      <span style="font-size: 9px; text-transform: uppercase; color: #8A857D; letter-spacing: 1px;">Fecha de Visita</span><br>
                      <strong style="font-size: 16px; color: #FFFFFF; font-family: 'Playfair Display', serif; display: inline-block; margin-top: 6px;">${fechaLegible}</strong>
                    </div>
                    
                    <div>
                      <span style="font-size: 9px; text-transform: uppercase; color: #8A857D; letter-spacing: 1px;">Horario Exclusivo</span><br>
                      <strong style="font-size: 14px; color: #C17F5F; font-family: 'Inter', sans-serif; display: inline-block; margin-top: 6px; font-weight: 400;">${horaLegible} hrs</strong>
                    </div>
                  </div>
                  
                  <p style="font-size: 11px; color: #8A857D; font-style: italic; line-height: 1.5; margin-bottom: 0;">
                    *Si asistes por Upcycling Fit & Repair, recuerda traer tus prendas. Te esperamos en Av. Tabancura 1091, Vitacura.
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #0A0A0A; padding: 24px; text-align: center;">
                  <span style="display: inline-block; width: 1px; height: 16px; background-color: #333; margin: 0 2px;"></span>
                  <span style="display: inline-block; width: 3px; height: 16px; background-color: #333; margin: 0 2px;"></span>
                  <span style="display: inline-block; width: 1px; height: 16px; background-color: #333; margin: 0 2px;"></span>
                  <div style="font-size: 8px; color: #555; letter-spacing: 3px; margin-top: 12px; text-transform: uppercase;">SASTRERÍA DE AUTOR</div>
                </div>
                
              </div>
            </body>
            </html>
            `
        });
        
        // Notificación interna a Elena
        await transporter.sendMail({
            from: `"Atelier Bot" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: `NUEVA CITA: ${nombre} ${apellido} - ${fechaLegible} ${horaLegible}`,
            text: `Se ha agendado una nueva cita:\nNombre: ${nombre} ${apellido}\nCelular: ${celular}\nCorreo: ${correo}\nFecha: ${fechaLegible} a las ${horaLegible}`
        });

        // Notificación por WhatsApp al encargado (984021940)
        const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
        if (WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_API_TOKEN) {
            const numeroEncargado = '56984021940';
            const mensajeWsp = `🔔 *Nueva Cita Agendada*\n\n*Cliente:* ${nombre} ${apellido}\n*Fecha:* ${fechaLegible}\n*Hora:* ${horaLegible}\n*Tel:* ${celular}`;
            
            const resp = await fetch(`https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: numeroEncargado,
                    type: 'text',
                    text: { body: mensajeWsp }
                })
            });
            const data = await resp.json();
            console.log('WhatsApp Encargado Response:', data);
        }
    } catch (mailError) {
        console.error('Error enviando correos:', mailError);
    }
}

export async function agendar_visita(nombre: string, apellido: string, celular: string, correo: string, fecha_hora: string, origen: string = 'whatsapp') {
    try {
        // Redondear a la hora más cercana o forzar que termine en :00 para evitar desajustes
        const dateObj = new Date(fecha_hora);
        dateObj.setMinutes(0, 0, 0); // Forzar inicio de hora
        const fechaAjustada = dateObj.toISOString();
        const dayOfWeek = dateObj.getDay();

        // 1. Validar horario
        const { data: config, error: configError } = await supabase
            .from('configuracion_horarios')
            .select('*')
            .eq('dia_semana', dayOfWeek)
            .single();

        if (configError || !config || !config.activo) {
            return `El taller no atiende los días ${dateObj.toLocaleDateString('es-CL', { weekday: 'long' })}.`;
        }

        const requestedHour = dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' });
        if (requestedHour < config.hora_inicio || requestedHour > config.hora_fin) {
            return `El horario de atención para los ${dateObj.toLocaleDateString('es-CL', { weekday: 'long' })} es de ${config.hora_inicio} a ${config.hora_fin}.`;
        }

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
                origen: origen,
                tipo_evento: 'cita_cliente',
                estado: 'confirmado'
            }])
            .select();

        if (error) throw error;

        // Enviar Correo Electrónico
        await enviar_correo_confirmacion(nombre, apellido, celular, correo, fechaAjustada);

        const horaLegible = dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' });
        const fechaLegible = dateObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Santiago' });
        return `¡Reserva confirmada con éxito! Quedaste agendad@ para el ${fechaLegible} a las ${horaLegible}. Te hemos enviado un correo de respaldo a ${correo}.`;

    } catch (err: any) {
        console.error('Error agendar_visita:', err);
        return `Hubo un error interno al intentar guardar tu cita. Por favor, inténtalo más tarde.`;
    }
}
