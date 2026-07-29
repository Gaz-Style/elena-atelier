'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Mail, Send, Copy, ExternalLink, Check, RefreshCw, AlertCircle, 
    FileText, Calendar, Wallet, CheckCircle, Clock, FileCheck 
} from 'lucide-react';
import { sendTemplatedEmailAction, getNotificationLogsAction } from '../../actions';

interface Customer {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
}

interface Log {
    id: string;
    type: string;
    template: string;
    status: string;
    sent_at: string;
}

interface TemplateVariable {
    key: string;
    label: string;
    default: string;
    type?: string;
}

interface Template {
    id: string;
    name: string;
    description: string;
    defaultSubject: string;
    variables: TemplateVariable[];
}

const TEMPLATES: Template[] = [
    {
        id: 'welcome',
        name: 'Bienvenida al Atelier',
        description: 'Carta de bienvenida y manifiesto de autor para nuevas clientas.',
        defaultSubject: 'Bienvenida a Elena La Costurera ✨',
        variables: []
    },
    {
        id: 'appointment',
        name: 'Confirmación de Cita',
        description: 'Notificación de cita de diseño, prueba de calce o asesoría confirmada.',
        defaultSubject: 'Tu cita está confirmada - Elena Atelier',
        variables: [
            { key: 'SERVICE', label: 'Servicio / Tipo de Cita', default: 'Prueba de calce' },
            { key: 'DATE', label: 'Fecha (Ej: Jueves 15 de Octubre)', default: 'Hoy' },
            { key: 'TIME', label: 'Hora (Ej: 16:30 hrs)', default: '16:00' }
        ]
    },
    {
        id: 'budget',
        name: 'Recordatorio de Presupuesto',
        description: 'Envío o recordatorio de propuesta de diseño y presupuesto a medida.',
        defaultSubject: 'Tu diseño a medida te está esperando - Elena Atelier',
        variables: [
            { key: 'LINK', label: 'Enlace del Presupuesto', default: 'https://elenalacosturera.cl/quotes/propuesta' }
        ]
    },
    {
        id: 'payment',
        name: 'Confirmación de Pago',
        description: 'Recibo digital y confirmación de abono o pago total del servicio.',
        defaultSubject: 'Confirmación de Pago - Elena Atelier',
        variables: [
            { key: 'SERVICE', label: 'Detalle del Servicio', default: 'Vestido a medida' },
            { key: 'AMOUNT', label: 'Monto Recibido', default: '$150.000 CLP' },
            { key: 'METHOD', label: 'Método de Pago', default: 'Transferencia Bancaria' }
        ]
    },
    {
        id: 'order_ready',
        name: 'Prenda Lista para Retiro',
        description: 'Informa que la prenda está confeccionada y lista para retiro o prueba final.',
        defaultSubject: 'Tu prenda está lista para retiro ✨ - Elena Atelier',
        variables: [
            { key: 'ITEM', label: 'Prenda / Artículo', default: 'Vestido de Novia' },
            { key: 'HOURS', label: 'Horario del Taller', default: 'Lunes a Viernes de 10:00 a 19:00 hrs' }
        ]
    },
    {
        id: 'custom',
        name: 'Contacto General (Mensaje Libre)',
        description: 'Plantilla de comunicación oficial con texto y asunto completamente libre.',
        defaultSubject: 'Actualización sobre tu prenda - Elena Atelier',
        variables: [
            { key: 'MESSAGE', label: 'Mensaje del Correo', type: 'textarea', default: 'Te escribimos del taller para coordinar los siguientes pasos de tu diseño...' }
        ]
    },
    {
        id: 'luxury_pass',
        name: 'Invitación Luxury Pass',
        description: 'Pase exclusivo digital y tarjeta de reserva o fitting VIP.',
        defaultSubject: 'Tu Luxury Pass Exclusivo ✨ - Elena Atelier',
        variables: [
            { key: 'TITLE', label: 'Título del Pase', default: 'LUXURY PASS' },
            { key: 'DETAILS', label: 'Mensaje de Invitación', type: 'textarea', default: 'Nos emociona recibirte. Tu cita para Premium Custom Upcycling & Alta Costura ha sido confirmada en nuestro sistema.' },
            { key: 'SUBTITLE', label: 'Subtítulo de Tarjeta', default: 'LUXURY PASS & RESERVA' },
            { key: 'FIELD1_LABEL', label: 'Etiqueta Campo 1', default: 'Fecha de Visita' },
            { key: 'FIELD1_VALUE', label: 'Valor Campo 1', default: 'Jueves 15 de Octubre' },
            { key: 'FIELD2_LABEL', label: 'Etiqueta Campo 2', default: 'Horario Exclusivo' },
            { key: 'FIELD2_VALUE', label: 'Valor Campo 2', default: '17:00 hrs' },
            { key: 'BARCODE_TEXT', label: 'Texto Código de Barras', default: 'ELENA*VIP*PASS' }
        ]
    }
];

// Embed base templates in client for live high-fidelity previews
const PREVIEW_TEMPLATES: Record<string, string> = {
    welcome: `
<!DOCTYPE html>
<html lang="es">
<head>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@200;300;400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #F0EDE8; margin: 0; padding: 20px; }
    .card { max-width: 420px; margin: 0 auto; background-color: #1A1A1A; border-radius: 20px; border: 1px solid rgba(245, 242, 235, 0.15); overflow: hidden; color: #F5F5F0; padding: 30px; text-align: center; }
    .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: 12px; text-transform: uppercase; margin-bottom: 8px; text-align: center; padding-left: 12px; }
    .divider { border-bottom: 1px dashed rgba(255,255,255,0.15); margin: 20px 0; }
    .badge { font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 700; color: #FFFFFF; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; text-align: center; padding-left: 4px; }
    .quote { font-style: italic; font-size: 20px; color: #FFF; margin: 15px 0; }
    .text { color: #CECAC2; font-size: 13px; line-height: 1.6; text-align: justify; }
    .btn { display: inline-block; background-color: #C17F5F; color: #FFF !important; text-decoration: none; padding: 12px 20px; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">ELENA</div>
    <div class="badge">LA COSTURERA</div>
    <div class="divider"></div>
    <div class="badge">Manifiesto de Autor</div>
    <div class="quote">"Pierde el miedo, sé tú misma"</div>
    <p class="text">¡Hola! Qué gusto saludarte. Soy Elena.</p>
    <p class="text">En un mundo lleno de moldes y costuras en serie, fundé este taller para devolverle a la ropa su verdadero propósito: <strong>ser una extensión de tu identidad y adaptarse a tu cuerpo</strong>, no al revés.</p>
    <p class="text">Cada prenda que trabajemos juntas quedará registrada aquí, con la atención y el cuidado que cada pieza merece.</p>
    <a href="https://elenalacosturera.cl" class="btn">AGENDAR ASESORÍA EN EL TALLER</a>
  </div>
</body>
</html>
`,
    appointment: `
<!DOCTYPE html>
<html lang="es">
<head>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@200;300;400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #F0EDE8; margin: 0; padding: 20px; }
    .card { max-width: 420px; margin: 0 auto; background-color: #1A1A1A; border-radius: 20px; overflow: hidden; color: #F5F5F0; padding: 30px; text-align: center; }
    .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: 12px; text-transform: uppercase; margin-bottom: 8px; text-align: center; padding-left: 12px; }
    .divider { border-bottom: 1px dashed rgba(255,255,255,0.15); margin: 20px 0; }
    .badge { font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 700; color: #FFFFFF; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; text-align: center; padding-left: 4px; }
    .quote { font-style: italic; font-size: 20px; color: #FFF; margin: 15px 0; }
    .text { color: #CECAC2; font-size: 13px; line-height: 1.6; text-align: justify; }
    .highlight { border: 1px solid rgba(245, 242, 235, 0.15); padding: 15px; background: rgba(255,255,255,0.02); text-align: left; margin: 20px 0; font-size: 13px; }
    .btn { display: inline-block; background-color: #C17F5F; color: #FFF !important; text-decoration: none; padding: 12px 20px; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">ELENA</div>
    <div class="badge">LA COSTURERA</div>
    <div class="divider"></div>
    <div class="badge">CONFIRMACIÓN DE CITA</div>
    <div class="quote">Tu cita está agendada</div>
    <p class="text">Hola {{NAME}}, te confirmamos que tu cita para <strong>{{SERVICE}}</strong> ha sido agendada con éxito.</p>
    <div class="highlight">
      <span style="color:#C17F5F; font-size: 10px; font-weight:bold;">DETALLE</span><br/>
      <strong>Fecha:</strong> {{DATE}}<br/>
      <strong>Hora:</strong> {{TIME}}<br/>
      <strong>Dirección:</strong> Av. Tabancura 1091, Of 319, Vitacura
    </div>
    <a href="https://elenalacosturera.cl" class="btn">GESTIONAR MI CITA</a>
  </div>
</body>
</html>
`,
    budget: `
<!DOCTYPE html>
<html lang="es">
<head>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@200;300;400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #F0EDE8; margin: 0; padding: 20px; }
    .card { max-width: 420px; margin: 0 auto; background-color: #1A1A1A; border-radius: 20px; overflow: hidden; color: #F5F5F0; padding: 30px; text-align: center; }
    .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: 12px; text-transform: uppercase; margin-bottom: 8px; text-align: center; padding-left: 12px; }
    .divider { border-bottom: 1px dashed rgba(255,255,255,0.15); margin: 20px 0; }
    .badge { font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 700; color: #FFFFFF; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; text-align: center; padding-left: 4px; }
    .quote { font-style: italic; font-size: 20px; color: #FFF; margin: 15px 0; }
    .text { color: #CECAC2; font-size: 13px; line-height: 1.6; text-align: justify; }
    .btn { display: inline-block; background-color: #C17F5F; color: #FFF !important; text-decoration: none; padding: 12px 20px; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">ELENA</div>
    <div class="badge">LA COSTURERA</div>
    <div class="divider"></div>
    <div class="badge">PROPUESTA DE DISEÑO</div>
    <div class="quote">Tu boceto exclusivo está listo</div>
    <p class="text">Hola {{NAME}}, hemos terminado de digitalizar tu propuesta de diseño y cotización detallada de materiales.</p>
    <p class="text">Puedes revisar las especificaciones de telas, calce y financiamiento haciendo clic en el enlace a continuación:</p>
    <a href="{{LINK}}" class="btn" style="background-color: #C17F5F;">REVISAR PRESUPUESTO</a>
  </div>
</body>
</html>
`,
    payment: `
<!DOCTYPE html>
<html lang="es">
<head>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@200;300;400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #F0EDE8; margin: 0; padding: 20px; }
    .card { max-width: 420px; margin: 0 auto; background-color: #1A1A1A; border-radius: 20px; overflow: hidden; color: #F5F5F0; padding: 30px; text-align: center; }
    .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: 12px; text-transform: uppercase; margin-bottom: 8px; text-align: center; padding-left: 12px; }
    .divider { border-bottom: 1px dashed rgba(255,255,255,0.15); margin: 20px 0; }
    .badge { font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 700; color: #FFFFFF; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; text-align: center; padding-left: 4px; }
    .quote { font-style: italic; font-size: 20px; color: #FFF; margin: 15px 0; }
    .text { color: #CECAC2; font-size: 13px; line-height: 1.6; text-align: justify; }
    .highlight { border: 1px solid rgba(245, 242, 235, 0.15); padding: 15px; background: rgba(255,255,255,0.02); text-align: left; margin: 20px 0; font-size: 13px; }
    .btn { display: inline-block; background-color: #C17F5F; color: #FFF !important; text-decoration: none; padding: 12px 20px; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">ELENA</div>
    <div class="badge">LA COSTURERA</div>
    <div class="divider"></div>
    <div class="badge">RECIBO DIGITAL</div>
    <div class="quote">Pago recibido con éxito</div>
    <p class="text">Estimada {{NAME}}, confirmamos que hemos recibido tu pago por <strong>{{SERVICE}}</strong>.</p>
    <div class="highlight">
      <span style="color:#C17F5F; font-size: 10px; font-weight:bold;">DETALLE DEL PAGO</span><br/>
      <strong>Monto:</strong> {{AMOUNT}}<br/>
      <strong>Método:</strong> {{METHOD}}<br/>
      <strong>Estado:</strong> Aprobado e Integrado
    </div>
    <a href="https://elenalacosturera.cl" class="btn">VER EN MI CUENTA</a>
  </div>
</body>
</html>
`,
    order_ready: `
<!DOCTYPE html>
<html lang="es">
<head>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@200;300;400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #F0EDE8; margin: 0; padding: 20px; }
    .card { max-width: 420px; margin: 0 auto; background-color: #1A1A1A; border-radius: 20px; overflow: hidden; color: #F5F5F0; padding: 30px; text-align: center; }
    .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: 12px; text-transform: uppercase; margin-bottom: 8px; text-align: center; padding-left: 12px; }
    .divider { border-bottom: 1px dashed rgba(255,255,255,0.15); margin: 20px 0; }
    .badge { font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 700; color: #FFFFFF; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; text-align: center; padding-left: 4px; }
    .quote { font-style: italic; font-size: 20px; color: #FFF; margin: 15px 0; }
    .text { color: #CECAC2; font-size: 13px; line-height: 1.6; text-align: justify; }
    .highlight { border: 1px solid rgba(245, 242, 235, 0.15); padding: 15px; background: rgba(255,255,255,0.02); text-align: left; margin: 20px 0; font-size: 13px; }
    .btn { display: inline-block; background-color: #C17F5F; color: #FFF !important; text-decoration: none; padding: 12px 20px; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">ELENA</div>
    <div class="badge">LA COSTURERA</div>
    <div class="divider"></div>
    <div class="badge">CONFECCIÓN FINALIZADA</div>
    <div class="quote">Tu prenda está lista</div>
    <p class="text">Hola {{NAME}}, tu prenda <strong>{{ITEM}}</strong> ya pasó el control de calidad final del taller y está lista para retiro.</p>
    <div class="highlight">
      <span style="color:#C17F5F; font-size: 10px; font-weight:bold;">HORARIOS DE ATENCIÓN</span><br/>
      {{HOURS}}<br/>
      Dirección: Av. Tabancura 1091, Oficina 319, Vitacura.
    </div>
    <a href="https://elenalacosturera.cl" class="btn">AGENDAR PRUEBA DE RETIRO</a>
  </div>
</body>
</html>
`,
    custom: `
<!DOCTYPE html>
<html lang="es">
<head>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@200;300;400;500;600&family=Pinyon+Script&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #F0EDE8; margin: 0; padding: 20px; }
    .card { max-width: 420px; margin: 0 auto; background-color: #1A1A1A; border-radius: 20px; overflow: hidden; color: #F5F5F0; padding: 30px; text-align: center; }
    .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: 12px; text-transform: uppercase; margin-bottom: 8px; text-align: center; padding-left: 12px; }
    .divider { border-bottom: 1px dashed rgba(255,255,255,0.15); margin: 20px 0; }
    .badge { font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 700; color: #FFFFFF; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; text-align: center; padding-left: 4px; }
    .quote { font-style: italic; font-size: 20px; color: #FFF; margin: 15px 0; }
    .text { color: #CECAC2; font-size: 13px; line-height: 1.6; text-align: justify; white-space: pre-line; }
    .btn { display: inline-block; background-color: #C17F5F; color: #FFF !important; text-decoration: none; padding: 12px 20px; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="card">
    <a href="https://elenalacosturera.cl" style="text-decoration: none; display: block; color: inherit;">
      <div class="logo">ELENA</div>
      <div class="badge">LA COSTURERA</div>
    </a>
    <div class="divider"></div>
    <p style="font-size: 9px; font-weight: 600; color: #C17F5F; letter-spacing: 4px; text-transform: uppercase; margin: 0 auto 20px auto; font-family: 'Inter', sans-serif; text-align: center;">Mensaje del Atelier</p>
    <div class="quote">{{SUBJECT}}</div>
    <p class="text" style="text-align: left;">Estimada {{NAME}},</p>
    <p class="text" style="text-align: left;">{{MESSAGE}}</p>
    <div style="margin-top: 30px; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 20px; text-align: center;">
      <p style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #C17F5F; margin: 0 0 10px 0;">Agradecemos tu preferencia</p>
      <p style="font-style: italic; font-size: 14px; color: #E5E0D8; margin: 0 0 4px 0;">Con cariño,</p>
      <p style="font-family: 'Pinyon Script', cursive; font-size: 38px; color: #FFFFFF; margin: 0 0 4px 0; font-weight: normal;">Elena R.</p>
      <p style="font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #8A857D; margin: 0;">ELENA La Costurera</p>
    </div>
    <p style="font-size: 8px; color: #8A857D; letter-spacing: 2.5px; margin-top: 36px; font-weight: 400; font-family: 'Inter', sans-serif;">Av. Tabancura 1091, Oficina 319 · Vitacura</p>
  </div>
</body>
</html>
`,
    luxury_pass: `
<!DOCTYPE html>
<html lang="es">
<head>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@200;300;400;500;600&family=Pinyon+Script&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #F0EDE8; margin: 0; padding: 20px; }
    .card { max-width: 360px; margin: 0 auto; background-color: #1A1A1A; border-radius: 24px; border: 1px solid rgba(245, 242, 235, 0.15); overflow: hidden; color: #F5F5F0; padding: 30px; text-align: center; }
    .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: 12px; text-transform: uppercase; margin-bottom: 8px; text-align: center; padding-left: 12px; }
    .divider { border-bottom: 1px dashed rgba(255,255,255,0.15); margin: 20px 0; }
    .badge { font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 700; color: #FFFFFF; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; text-align: center; padding-left: 4px; }
    .quote { font-style: italic; font-size: 20px; color: #FFF; margin: 15px 0; }
    .text { color: #CECAC2; font-size: 13px; line-height: 1.6; text-align: justify; }
    .highlight { border: 1px solid rgba(245, 242, 235, 0.15); padding: 15px; background: rgba(255,255,255,0.02); text-align: center; margin: 20px 0; font-size: 13px; }
    .btn { display: inline-block; background-color: #C17F5F; color: #FFF !important; text-decoration: none; padding: 12px 20px; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div style="width: 12px; height: 12px; background-color: #F0EDE8; border-radius: 50%; margin: 0 auto 10px auto; opacity: 0.9;"></div>
    <div class="logo">ELENA</div>
    <div class="badge">LA COSTURERA</div>
    
    <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin: 15px 0; border-collapse: collapse;">
      <tr>
        <td style="width: 8px; height: 16px; background-color: #F0EDE8; border-radius: 0 8px 8px 0;"></td>
        <td style="border-bottom: 1px dashed rgba(245, 242, 235, 0.12); vertical-align: middle; height: 8px; line-height: 1px; font-size: 1px;">&nbsp;</td>
        <td style="width: 8px; height: 16px; background-color: #F0EDE8; border-radius: 8px 0 0 8px;"></td>
      </tr>
    </table>

    <p style="font-size: 8px; font-weight: 600; color: #C17F5F; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 4px 0; font-family: 'Inter', sans-serif;">{{TITLE}}</p>
    <p style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-style: italic; font-weight: 400; color: #F5F5F0; margin: 0 0 20px 0; letter-spacing: 0.5px;">¡Hola {{NAME}}!</p>
    
    <p class="text">{{DETAILS}}</p>
    
    <div class="highlight" style="text-align: center; margin: 20px auto; width: 85%;">
      <span style="font-size: 8px; text-transform: uppercase; color: #C17F5F; letter-spacing: 2px; font-weight: bold;">{{SUBTITLE}}</span>
      <hr style="border: 0; border-top: 1px solid rgba(245, 242, 235, 0.1); margin: 8px 0 12px 0;">
      
      <span style="font-size: 8px; text-transform: uppercase; color: #8A857D; letter-spacing: 1px;">{{FIELD1_LABEL}}</span><br>
      <strong style="font-size: 14px; color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif; display: inline-block; margin-top: 4px; margin-bottom: 12px;">{{FIELD1_VALUE}}</strong><br>
      
      <span style="font-size: 8px; text-transform: uppercase; color: #8A857D; letter-spacing: 1px;">{{FIELD2_LABEL}}</span><br>
      <strong style="font-size: 12px; color: #C17F5F; font-family: 'Inter', sans-serif; display: inline-block; margin-top: 4px;">{{FIELD2_VALUE}}</strong>
    </div>

    <!-- Barcode -->
    <div style="margin: 25px 0 12px 0; text-align: center; opacity: 0.7;">
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
      <div style="font-size: 7.5px; color: #8A857D; letter-spacing: 4px; margin-top: 6px; text-transform: uppercase; font-family: 'Inter', sans-serif;">{{BARCODE_TEXT}}</div>
    </div>

    <!-- Firma de Elena y Agradecimiento -->
    <div style="margin-top: 30px; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 20px; text-align: center;">
      <p style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #C17F5F; margin: 0 0 10px 0;">Agradecemos tu preferencia</p>
      <p style="font-style: italic; font-size: 14px; color: #E5E0D8; margin: 0 0 4px 0;">Con cariño,</p>
      <p style="font-family: 'Pinyon Script', cursive; font-size: 38px; color: #FFFFFF; margin: 0 0 4px 0; font-weight: normal;">Elena R.</p>
      <p style="font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #8A857D; margin: 0;">ELENA La Costurera</p>
    </div>
  </div>
</body>
</html>
`
};

export default function EmailComposerClient({ customer, initialLogs }: { customer: Customer, initialLogs: Log[] }) {
    const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0].id);
    const [subject, setSubject] = useState(TEMPLATES[0].defaultSubject);
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [previewMode, setPreviewMode] = useState<'visual' | 'code'>('visual');
    
    // Status states
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    // Live notification history state
    const [logs, setLogs] = useState<Log[]>(initialLogs);

    const activeTemplate = useMemo(() => {
        return TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];
    }, [selectedTemplateId]);

    // Reset subject & variables on template change
    useEffect(() => {
        setSubject(activeTemplate.defaultSubject);
        const newVars: Record<string, string> = {};
        activeTemplate.variables.forEach(v => {
            newVars[v.key] = v.default;
        });
        setVariables(newVars);
        setSuccessMessage(null);
        setErrorMessage(null);
    }, [activeTemplate]);

    const handleVariableChange = (key: string, val: string) => {
        setVariables(prev => ({
            ...prev,
            [key]: val
        }));
    };

    // Calculate dynamic HTML payload
    const compiledHtml = useMemo(() => {
        const rawTemplate = PREVIEW_TEMPLATES[selectedTemplateId] || '';
        let compiled = rawTemplate
            .replace(/{{NAME}}/g, customer.full_name)
            .replace(/{{SUBJECT}}/g, subject);

        Object.entries(variables).forEach(([k, v]) => {
            compiled = compiled.replace(new RegExp(`{{${k}}}`, 'g'), v);
        });

        return compiled;
    }, [selectedTemplateId, variables, customer.full_name, subject]);

    const compiledPlaintext = useMemo(() => {
        // Simple plain text conversion for clipboard / mailto fallback
        let text = `Estimada ${customer.full_name},\n\n`;
        if (selectedTemplateId === 'welcome') {
            text += `Te damos la bienvenida oficial al atelier de Elena La Costurera.\nTu ficha de clienta y historial han sido creados.\nAv. Tabancura 1091, Vitacura.`;
        } else if (selectedTemplateId === 'appointment') {
            text += `Confirmamos tu cita para ${variables.SERVICE || ''} el día ${variables.DATE || ''} a las ${variables.TIME || ''}.\nDirección: Av. Tabancura 1091, Oficina 319, Vitacura.`;
        } else if (selectedTemplateId === 'budget') {
            text += `Tu presupuesto de diseño a medida está listo. Puedes revisarlo en el siguiente enlace:\n${variables.LINK || ''}`;
        } else if (selectedTemplateId === 'payment') {
            text += `Confirmamos el pago exitoso de ${variables.AMOUNT || ''} mediante ${variables.METHOD || ''} para el servicio de ${variables.SERVICE || ''}.`;
        } else if (selectedTemplateId === 'order_ready') {
            text += `Tu prenda ${variables.ITEM || ''} ya está terminada y lista para retiro en nuestro taller.\nHorario sugerido: ${variables.HOURS || ''}`;
        } else {
            text += variables.MESSAGE || '';
        }
        text += `\n\nCon cariño,\nElena Rojas\nELENA La Costurera`;
        return text;
    }, [selectedTemplateId, variables, customer.full_name]);

    const handleSendEmail = async () => {
        if (!customer.email) {
            setErrorMessage('El cliente no cuenta con un correo electrónico válido registrado.');
            return;
        }
        setLoading(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        // Include Compiled HTML for raw custom option inside variables if custom editor is previewed
        const variablesWithHtml = { ...variables, HTML_CONTENT: compiledHtml };

        try {
            const res = await sendTemplatedEmailAction(customer.id, selectedTemplateId, subject, variablesWithHtml);
            if (res.success) {
                setSuccessMessage('¡Correo enviado con éxito!');
                // Reload logs
                const updatedLogs = await getNotificationLogsAction(customer.id);
                setLogs(updatedLogs);
            } else {
                setErrorMessage(res.error || 'No se pudo enviar el correo.');
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Error de red al procesar el envío.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyContent = () => {
        navigator.clipboard.writeText(compiledHtml);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const mailtoUrl = useMemo(() => {
        const body = encodeURIComponent(compiledPlaintext);
        const subj = encodeURIComponent(subject);
        return `mailto:${customer.email}?subject=${subj}&body=${body}`;
    }, [customer.email, subject, compiledPlaintext]);

    const getTemplateIcon = (tmpl: string) => {
        switch (tmpl) {
            case 'welcome': return <FileCheck className="w-4 h-4 text-rose-500" />;
            case 'appointment': return <Calendar className="w-4 h-4 text-blue-500" />;
            case 'budget': return <FileText className="w-4 h-4 text-purple-500" />;
            case 'payment': return <Wallet className="w-4 h-4 text-emerald-500" />;
            case 'order_ready': return <CheckCircle className="w-4 h-4 text-yellow-500" />;
            default: return <Mail className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left column - Composer Control */}
            <div className="lg:col-span-5 space-y-6">
                
                {/* Template Selection */}
                <section className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 space-y-4">
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100 pb-2">1. Seleccionar Plantilla Base</h2>
                    <div className="space-y-2.5">
                        {TEMPLATES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTemplateId(t.id)}
                                className={`w-full text-left p-3.5 border rounded-sm transition-all flex items-start gap-3 hover:bg-gray-50 ${
                                    selectedTemplateId === t.id 
                                        ? 'border-brand-terracotta bg-brand-sand/10 shadow-sm' 
                                        : 'border-gray-200 bg-white'
                                }`}
                            >
                                <span className="mt-0.5 shrink-0">{getTemplateIcon(t.id)}</span>
                                <div>
                                    <div className="font-serif text-sm font-semibold text-brand-charcoal">{t.name}</div>
                                    <div className="text-[11px] text-gray-400 mt-1 leading-relaxed">{t.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Variables Form */}
                <section className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 space-y-4">
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100 pb-2">2. Personalizar Contenido</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block mb-1">Asunto del Correo</label>
                            <input 
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full p-3 bg-white border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-brand-terracotta outline-none text-brand-charcoal"
                            />
                        </div>

                        {activeTemplate.variables.map(v => (
                            <div key={v.key}>
                                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block mb-1">{v.label}</label>
                                {v.type === 'textarea' ? (
                                    <textarea
                                        value={variables[v.key] || ''}
                                        onChange={(e) => handleVariableChange(v.key, e.target.value)}
                                        rows={4}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-brand-terracotta outline-none resize-none text-gray-700"
                                    />
                                ) : (
                                    <input 
                                        type="text"
                                        value={variables[v.key] || ''}
                                        onChange={(e) => handleVariableChange(v.key, e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-brand-terracotta outline-none text-brand-charcoal"
                                    />
                                )}
                            </div>
                        ))}
                        
                        {activeTemplate.variables.length === 0 && (
                            <p className="text-xs text-gray-400 italic py-2">Esta plantilla no tiene variables adicionales. El saludo de bienvenida se genera automáticamente.</p>
                        )}
                    </div>
                </section>

                {/* Send/Output Panel */}
                <section className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 space-y-4">
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100 pb-2">3. Acciones de Envío</h2>

                    {successMessage && (
                        <div className="bg-emerald-50 text-emerald-700 p-4 border border-emerald-200 rounded-sm text-xs flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-500 stroke-[3px]" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="bg-red-50 text-red-600 p-4 border border-red-200 rounded-sm text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={handleSendEmail}
                            disabled={loading}
                            className="w-full bg-brand-terracotta hover:bg-brand-charcoal disabled:bg-gray-200 disabled:text-gray-400 text-white p-3.5 rounded-sm uppercase tracking-widest text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" /> Procesando Envío...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" /> Enviar por Email (Nodemailer)
                                </>
                            )}
                        </button>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleCopyContent}
                                className="border border-gray-200 hover:bg-gray-50 text-gray-600 p-3 rounded-sm uppercase tracking-widest text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3px]" /> Copiado
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" /> Copiar HTML
                                    </>
                                )}
                            </button>
                            
                            <a
                                href={mailtoUrl}
                                className="border border-gray-200 hover:bg-gray-50 text-gray-600 p-3 rounded-sm uppercase tracking-widest text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors text-center"
                            >
                                <ExternalLink className="w-3.5 h-3.5" /> Abrir Cliente
                            </a>
                        </div>
                    </div>
                </section>

            </div>

            {/* Right column - Live Preview and History Logs */}
            <div className="lg:col-span-7 space-y-6">
                
                {/* Visual Viewport Preview */}
                <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden flex flex-col h-[520px]">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <span className="text-xs text-gray-400 font-mono ml-2 truncate">Previsualización de Correo</span>
                        </div>
                        <div className="flex bg-white border border-gray-200 rounded-sm p-0.5 text-xs">
                            <button 
                                onClick={() => setPreviewMode('visual')}
                                className={`px-3 py-1 rounded-sm ${previewMode === 'visual' ? 'bg-brand-charcoal text-white font-bold' : 'text-gray-400 hover:text-brand-charcoal'}`}
                            >
                                Diseño
                            </button>
                            <button 
                                onClick={() => setPreviewMode('code')}
                                className={`px-3 py-1 rounded-sm ${previewMode === 'code' ? 'bg-brand-charcoal text-white font-bold' : 'text-gray-400 hover:text-brand-charcoal'}`}
                            >
                                Código HTML
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 bg-brand-sand/15 overflow-auto p-4 flex items-center justify-center">
                        {previewMode === 'visual' ? (
                            <iframe 
                                title="Email Preview"
                                srcDoc={compiledHtml}
                                className="w-full h-full border border-gray-200/50 bg-white rounded-md shadow-inner"
                                sandbox="allow-same-origin"
                            />
                        ) : (
                            <pre className="w-full h-full p-4 bg-gray-900 text-emerald-400 text-xs font-mono rounded-md overflow-auto whitespace-pre-wrap select-all">
                                {compiledHtml}
                            </pre>
                        )}
                    </div>
                </div>

                {/* Notification History Logs */}
                <section className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 space-y-4">
                    <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100 pb-2">Historial de Notificaciones Enviadas</h2>
                    
                    <div className="overflow-x-auto">
                        {logs.length === 0 ? (
                            <p className="text-xs text-gray-400 italic py-4 text-center">No se registran notificaciones enviadas a esta clienta.</p>
                        ) : (
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-widest font-bold font-mono">
                                        <th className="py-2.5 px-3">Fecha</th>
                                        <th className="py-2.5 px-3">Tipo</th>
                                        <th className="py-2.5 px-3">Plantilla / Canal</th>
                                        <th className="py-2.5 px-3 text-right">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 px-3 text-gray-600">
                                                {new Date(log.sent_at).toLocaleString('es-CL', {
                                                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="py-3 px-3 uppercase tracking-wider font-semibold text-[10px]">
                                                {log.type}
                                            </td>
                                            <td className="py-3 px-3 text-gray-500 font-mono">
                                                {log.template}
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                {log.status === 'sent' ? (
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                                        <CheckCircle className="w-2.5 h-2.5" /> Enviado
                                                    </span>
                                                ) : log.status === 'failed' ? (
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                                        <AlertCircle className="w-2.5 h-2.5" /> Fallido
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                                        <Clock className="w-2.5 h-2.5 animate-pulse" /> Pendiente
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

            </div>

        </div>
    );
}
