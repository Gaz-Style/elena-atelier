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

import fs from 'fs';
import path from 'path';

export async function enviar_correo_confirmacion(nombre: string, apellido: string, celular: string, correo: string, fechaAjustada: string) {
    if (!correo) return;
    
    const dateObj = new Date(fechaAjustada);
    const horaLegible = dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' });
    const fechaLegible = dateObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Santiago' });

    const smtpUser = process.env.SMTP_USER || '';
    const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;

    const attachments = [];
    let cardBgUrl = '';

    const filePath = path.join(process.cwd(), 'public', 'trabajos', 'model_desnuda_bw.png');
    if (fs.existsSync(filePath)) {
        attachments.push({
            filename: 'model_desnuda_bw.png',
            path: filePath,
            cid: 'luxuryPassBg'
        });
        cardBgUrl = 'cid:luxuryPassBg';
    } else {
        cardBgUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGUlEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAA8F8bGgABxZqVdgAAAABJRU5ErkJggg==';
    }

    try {
        await transporter.sendMail({
            from: `"ELENA La Costurera" <${fromAddress}>`,
            to: correo,
            subject: 'Confirmación de Cita — ELENA La Costurera',
            attachments: attachments,
            html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Elena La Costurera — Luxury Pass</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@200;300;400;500;600&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F0EDE8; margin: 0; padding: 24px; -webkit-font-smoothing: antialiased;">
  <!-- Card Container -->
  <div style="max-width: 360px; margin: 0 auto; background-color: #1A1A1A; background-image: linear-gradient(to bottom, rgba(26, 26, 26, 0.25) 0%, rgba(26, 26, 26, 0.85) 60%, #1A1A1A 100%), url('${cardBgUrl}'); background-size: cover; background-position: center; border-radius: 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.2); border: 1px solid rgba(245, 242, 235, 0.15); overflow: hidden; color: #F5F5F0;">
    
    <!-- Tag Hole -->
    <div style="width: 12px; height: 12px; background-color: #F0EDE8; border-radius: 50%; margin: 28px auto 0 auto; opacity: 0.9;"></div>
    
    <!-- Header -->
    <div style="text-align: center; padding: 28px 20px 24px 20px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; width: 130px; border-collapse: collapse;">
        <tr>
          <td>
            <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="left" style="font-family:'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; line-height: 1; padding: 0;">E</td>
                <td align="center" style="font-family:'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; line-height: 1; padding: 0;">L</td>
                <td align="center" style="font-family:'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; line-height: 1; padding: 0;">E</td>
                <td align="center" style="font-family:'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; line-height: 1; padding: 0;">N</td>
                <td align="right" style="font-family:'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; line-height: 1; padding: 0;">A</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 8px; line-height: 1; font-size: 1px;">&nbsp;</td>
        </tr>
        <tr>
          <td>
            <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="left" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">L</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">A</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0; width: 6px;">&nbsp;</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">C</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">O</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">S</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">T</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">U</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">R</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">E</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">R</td>
                <td align="right" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">A</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Table-based Ticket Divider -->
    <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin: 0; border-collapse: collapse;">
      <tr>
        <td style="width: 8px; height: 16px; background-color: #F0EDE8; border-radius: 0 8px 8px 0;"></td>
        <td style="border-bottom: 1px dashed rgba(245, 242, 235, 0.12); vertical-align: middle; height: 8px; line-height: 1px; font-size: 1px;">&nbsp;</td>
        <td style="width: 8px; height: 16px; background-color: #F0EDE8; border-radius: 8px 0 0 8px;"></td>
      </tr>
    </table>
    
    <!-- Body -->
    <div style="padding: 36px 30px 40px 30px; text-align: center;">
      <p style="font-size: 8px; font-weight: 600; color: #C17F5F; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 4px 0; font-family: 'Inter', sans-serif;">Confirmación Cita</p>
      
      <p style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-style: italic; font-weight: 400; color: #F5F5F0; margin: 0 0 36px 0; letter-spacing: 0.5px;">¡Hola ${nombre}!</p>
      
      <div style="margin-bottom: 30px;">
        <p style="color: #F5F5F0; font-size: 13px; line-height: 1.6; font-weight: 300; margin-bottom: 30px; opacity: 0.9;">
          Nos emociona recibirte. Tu cita para Premium Custom Upcycling & Alta Costura ha sido confirmada en nuestro sistema.
        </p>
        
        <div style="border: 1px solid rgba(245, 242, 235, 0.15); border-radius: 4px; display: inline-block; padding: 16px 24px; background-color: rgba(255, 255, 255, 0.03); margin-bottom: 20px; text-align: center; width: 85%;">
          <p style="font-size: 8px; font-weight: 600; color: #C17F5F; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 6px 0; font-family: 'Inter', sans-serif;">LUXURY PASS & RESERVA</p>
          <hr style="border: 0; border-top: 1px solid rgba(245, 242, 235, 0.1); margin: 8px 0 12px 0;">
          <span style="font-size: 8px; text-transform: uppercase; color: #8A857D; letter-spacing: 1px;">Fecha de Visita</span><br>
          <strong style="font-size: 14px; color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif; display: inline-block; margin-top: 4px; margin-bottom: 12px;">${fechaLegible}</strong><br>
          <span style="font-size: 8px; text-transform: uppercase; color: #8A857D; letter-spacing: 1px;">Horario Exclusivo</span><br>
          <strong style="font-size: 12px; color: #C17F5F; font-family: 'Inter', sans-serif; display: inline-block; margin-top: 4px;">${horaLegible} hrs</strong>
          <p style="font-size: 8px; color: #8A857D; font-style: italic; margin-top: 12px; line-height: 1.4; margin-bottom: 0;">
            *Si asistes por Upcycling Fit & Repair, recuerda traer tus prendas. Te esperamos en Av. Tabancura 1091, Vitacura.
          </p>
        </div>
      </div>
      
      <!-- Barcode -->
      <div style="margin: 36px 0 12px 0; text-align: center; opacity: 0.7;">
        <span style="display: inline-block; width: 1px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 2px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 1px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 3px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 1px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 2px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 1px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 4px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 1.5px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 1px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <div style="font-size: 7.5px; color: #8A857D; letter-spacing: 4px; margin-top: 6px; text-transform: uppercase; font-family: 'Inter', sans-serif;">ELENA*CITA*LA*COSTURERA</div>
      </div>
      
      <p style="font-size: 8px; color: #8A857D; letter-spacing: 2.5px; margin-top: 28px; font-weight: 400; font-family: 'Inter', sans-serif;">Av. Tabancura 1091 · Vitacura</p>
    </div>
  </div>
</body>
</html>`
        });
        
        // Notificación interna a Elena
        await transporter.sendMail({
            from: `"Atelier Bot" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: `NUEVA CITA: ${nombre} ${apellido} - ${fechaLegible} ${horaLegible}`,
            text: `Se ha agendado una nueva cita:\nNombre: ${nombre} ${apellido}\nCelular: ${celular}\nCorreo: ${correo}\nFecha: ${fechaLegible} a las ${horaLegible}`
        });

        // Notificación por WhatsApp a encargados
        const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
        if (WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_API_TOKEN) {
            const numerosEncargados = ['56984021940', '56937667709'];
            const mensajeWsp = `🔔 *Nueva Cita Agendada*\n\n*Cliente:* ${nombre} ${apellido}\n*Fecha:* ${fechaLegible}\n*Hora:* ${horaLegible}\n*Tel:* ${celular}`;
            
            for (const numeroEncargado of numerosEncargados) {
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
                console.log(`WhatsApp Encargado (${numeroEncargado}):`, data);
            }
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
