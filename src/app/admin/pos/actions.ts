'use server';

import nodemailer from 'nodemailer';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
const backgroundImgBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGUlEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAA8F8bGgABxZqVdgAAAABJRU5ErkJggg==';

// ── LOGO REUTILIZABLE (editar solo aquí) ──
const emailLogoHtml = `
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; width: 150px; text-align: center;">
      <tr>
        <td style="font-family:'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: 10px; text-transform: uppercase; text-align: center; line-height: 1; padding: 0 0 0 10px;">
          ELENA
        </td>
      </tr>
      <tr>
        <td style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 8px; font-weight: 700; color: #FFFFFF; letter-spacing: 4.2px; text-transform: uppercase; text-align: center; padding-top: 8px; line-height: 1; padding-left: 4.2px;">
          LA COSTURERA
        </td>
      </tr>
    </table>`;

export async function sendBudgetEmailAction(payload: {
    customerEmail: string;
    customerName: string;
    budgetLink: string;
    items: { name: string; price: number; category: string; notes?: string }[];
    total: number;
}) {
    const { customerEmail, customerName, budgetLink, items, total } = payload;

    const smtpUser = process.env.SMTP_USER || '';
    const smtpPassword = process.env.SMTP_PASSWORD || '';

    if (!smtpUser || !smtpPassword) {
        console.error('Faltan variables SMTP_USER o SMTP_PASSWORD en el entorno.');
        return { success: false, error: 'Credenciales de correo no configuradas en el servidor.' };
    }

    // 1. Create Nodemailer SMTP transporter using Gmail secure parameters
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // SSL secure port
        auth: {
            user: smtpUser,
            pass: smtpPassword, // 16-character Google App Password
        },
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
    };


    const itemsRowsHtml = items.map((item) => `
        <tr style="border-bottom: 1px solid #EDE8DF;">
            <td style="padding: 12px 8px; text-align: left; vertical-align: top; font-family:'Inter', sans-serif;">
                <p style="margin: 0; font-size: 13px; font-weight: 500; color: #1A1A1A;">${item.name}</p>
                <span style="font-size: 9px; text-transform: uppercase; color: #C17F5F; font-weight: 600; letter-spacing: 1px;">${item.category}</span>
                ${item.notes ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #7A7268; font-style: italic; font-weight: 300;">"${item.notes}"</p>` : ''}
            </td>
            <td style="padding: 12px 8px; text-align: right; vertical-align: top; font-family:'Playfair Display', Georgia, serif; font-size: 13px; font-weight: bold; color: #1A1A1A;">
                ${formatCurrency(item.price)}
            </td>
        </tr>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Presupuesto Formal — ELENA LA COSTURERA</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F0EDE8; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border: 1px solid #EDE8DF; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); }
        .header { background-color: #1A1A1A; padding: 36px 40px; text-align: center; }
        .body { padding: 44px 40px; }
        .greeting { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #1A1A1A; margin-top: 0; margin-bottom: 14px; font-weight: 400; }
        .lead-text { font-size: 13px; color: #4A4A4A; line-height: 1.8; margin-bottom: 24px; font-weight: 300; }
        .table-container { margin-bottom: 30px; }
        .button-container { text-align: center; margin: 35px 0; }
        .btn { display: inline-block; background-color: #1A1A1A; color: #FFFFFF !important; text-decoration: none; padding: 16px 32px; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; border-radius: 0; border: 1px solid #1A1A1A; }
        .footer { background-color: #FAFAF7; border-top: 1px solid #EDE8DF; padding: 36px 40px; text-align: center; }
        .footer-text { font-size: 11px; color: #8A857D; line-height: 1.75; margin: 0 0 4px 0; font-weight: 300; }
        .signature { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-style: italic; color: #C17F5F; margin-top: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
            ${emailLogoHtml}
        </div>
        
        <div class="body">
            <h2 class="greeting">Hola ${customerName},</h2>
            <p class="lead-text">
                Esperamos que te encuentres muy bien. Adjuntamos la propuesta y presupuesto para el servicio de costura solicitado en nuestro atelier. A continuación puedes revisar el detalle de las prendas e indicaciones:
            </p>
            
            <div class="table-container">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #1A1A1A;">
                            <th style="padding: 12px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8A857D; font-weight: 600; font-family:'Inter', sans-serif;">Detalle del Servicio</th>
                            <th style="padding: 12px 8px; text-align: right; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8A857D; font-weight: 600; font-family:'Inter', sans-serif;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRowsHtml}
                        <tr style="background-color: #FAFAF7; font-weight: bold;">
                            <td style="padding: 16px 8px; text-align: left; font-size: 13px; color: #1A1A1A; font-family:'Inter', sans-serif;">Total Estimado</td>
                            <td style="padding: 16px 8px; text-align: right; font-size: 16px; color: #C17F5F; font-family: 'Playfair Display', Georgia, serif;">${formatCurrency(total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p class="lead-text" style="margin-bottom: 10px;">
                Para revisar el detalle del servicio, dejar comentarios o **aprobar y pagar este presupuesto en línea**, haz clic en el siguiente enlace:
            </p>

            <div class="button-container">
                <a href="${budgetLink}" class="btn" style="color: #FFFFFF;" target="_blank">Revisar y Pagar Presupuesto</a>
            </div>

            <p style="font-size: 11px; color: #8A857D; text-align: center; margin-top: 10px; font-weight: 300;">
                Si no puedes abrir el botón, copia y pega este enlace en tu navegador: <br>
                <a href="${budgetLink}" style="color: #C17F5F; text-decoration: underline;">${budgetLink}</a>
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">Av. Tabancura 1091, Vitacura</p>
            <p class="footer-text"><a href="mailto:contacto@elenalacosturera.cl" style="color: #C17F5F; text-decoration: underline;">contacto@elenalacosturera.cl</a></p>
            <div class="signature">Elena Rojas</div>
        </div>
      </div>
    </body>
    </html>`;

    try {
        const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;
        const info = await transporter.sendMail({
            from: `"Elena Atelier" <${fromAddress}>`,
            to: customerEmail,
            subject: 'Presupuesto Formal - Elena Atelier 👗',
            html: htmlContent,
        });

        console.log('Correo enviado de forma exitosa:', info.messageId);
        return { success: true };
    } catch (err: unknown) {
        console.error('Error al enviar correo por SMTP de Google:', err);
        return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
}

export async function sendOrderConfirmationEmailAction(payload: {
    customerEmail: string;
    customerName: string;
    orderId: number;
    items: { 
        name: string; 
        price: number; 
        category: string; 
        notes?: string;
        images?: { url: string; notes?: string }[];
    }[];
    total: number;
    paymentMethod: string;
    date: string;
    deliveryDate: string;
    deliveryWindowStart?: string;
    deliveryWindowEnd?: string;
    paymentUrl?: string;
}) {
    try {
        const { customerEmail, customerName, orderId, items, total, paymentMethod, date, deliveryDate, deliveryWindowStart, deliveryWindowEnd, paymentUrl: providedPaymentUrl } = payload;

        // Format delivery date for display
        const deliveryDateObj = new Date(deliveryDate);
        const deliveryDateFormatted = deliveryDateObj.toLocaleDateString('es-CL', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const deliveryTimeFormatted = deliveryDateObj.toLocaleTimeString('es-CL', {
            hour: '2-digit', minute: '2-digit', hour12: false
        });

        const smtpUser = process.env.SMTP_USER || '';
        const smtpPassword = process.env.SMTP_PASSWORD || '';

        if (!smtpUser || !smtpPassword) {
            console.error('Faltan variables SMTP_USER o SMTP_PASSWORD en el entorno.');
            return { success: false, error: 'Credenciales de correo no configuradas en el servidor.' };
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: smtpUser,
                pass: smtpPassword,
            },
        });

        const formatCurrency = (val: number) => {
            return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
        };

        const firstName = customerName.split(' ')[0];
        const paymentLabel = paymentMethod === 'card' ? 'Mercado Pago' : 'Efectivo / Transferencia';

        // Usar link de pago si fue provisto (ej. Transbank)
        let paymentUrl = providedPaymentUrl || '';

        const itemsRowsHtml = items.map((item) => `
            <tr style="border-bottom: 1px solid #EDE8DF;">
                <td style="padding: 12px 8px; text-align: left; vertical-align: top; font-family:'Inter', sans-serif;">
                    <p style="margin: 0; font-size: 13px; font-weight: 500; color: #1A1A1A;">${item.name}</p>
                    <span style="font-size: 9px; text-transform: uppercase; color: #C17F5F; font-weight: 600; letter-spacing: 1px;">${item.category}</span>
                    ${item.notes ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #7A7268; font-style: italic; font-weight: 300;">"${item.notes}"</p>` : ''}
                </td>
                <td style="padding: 12px 8px; text-align: right; vertical-align: top; font-family:'Playfair Display', Georgia, serif; font-size: 13px; font-weight: bold; color: #1A1A1A;">
                    ${formatCurrency(item.price)}
                </td>
            </tr>
        `).join('');

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
            // Transparent 1x1 fallback so it doesn't break URL loading
            cardBgUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGUlEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAA8F8bGgABxZqVdgAAAABJRU5ErkJggg==';
        }

        const garmentsSectionHtml = `
            <div style="margin-bottom: 24px; text-align: left;">
              <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                ${items.map(item => `
                  <tr style="border-bottom: 1px solid rgba(245, 242, 235, 0.08);">
                    <td style="padding: 10px 0; text-align: left; vertical-align: top; font-family: 'Inter', sans-serif;">
                      <p style="margin: 0; font-size: 11px; font-weight: 500; color: #FFFFFF; line-height: 1.3; letter-spacing: 0.5px;">${item.name}</p>
                      <span style="font-size: 8px; text-transform: uppercase; color: #8A857D; font-weight: 500; letter-spacing: 1.5px; display: inline-block; margin-top: 2px;">${item.category}</span>
                    </td>
                    <td style="padding: 10px 0; text-align: right; vertical-align: top; font-family: 'Playfair Display', Georgia, serif; font-size: 12px; font-weight: bold; color: #C17F5F;">
                      ${formatCurrency(item.price)}
                    </td>
                  </tr>
                `).join('')}
              </table>
              <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 4px 0; text-align: left; font-size: 8px; font-weight: 600; color: #8A857D; letter-spacing: 2px; text-transform: uppercase; font-family: 'Inter', sans-serif;">Total Pagado</td>
                  <td style="padding: 4px 0; text-align: right; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 300; color: #C17F5F;">
                    ${formatCurrency(total)}
                  </td>
                </tr>
              </table>
            </div>
            `;

        // Simplified email HTML template
        const htmlContent = `<!DOCTYPE html>
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
      <p style="font-size: 8px; font-weight: 600; color: #C17F5F; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 4px 0; font-family: 'Inter', sans-serif;">Ingreso Atelier</p>
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 56px; font-weight: 300; color: #FFFFFF; margin: 0 0 28px 0; line-height: 1; letter-spacing: -2px;">#${orderId}</h2>
      
      <p style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-style: italic; font-weight: 400; color: #F5F5F0; margin: 0 0 36px 0; letter-spacing: 0.5px;">${customerName}</p>
      
      <div style="margin-bottom: 30px;">
        ${garmentsSectionHtml}
        
        <div style="border: 1px solid rgba(245, 242, 235, 0.15); border-radius: 4px; display: inline-block; padding: 16px 24px; background-color: rgba(255, 255, 255, 0.03); margin-bottom: 20px; text-align: center; width: 85%;">
          <p style="font-size: 8px; font-weight: 600; color: #C17F5F; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 6px 0; font-family: 'Inter', sans-serif;">LUXURY PASS & NOTA DE ENTREGA</p>
          <hr style="border: 0; border-top: 1px solid rgba(245, 242, 235, 0.1); margin: 8px 0 12px 0;">
          <span style="font-size: 8px; text-transform: uppercase; color: #8A857D; letter-spacing: 1px;">Fecha Programada de Retiro</span><br>
          <strong style="font-size: 14px; color: #FFFFFF; font-family: 'Playfair Display', Georgia, serif; display: inline-block; margin-top: 4px; margin-bottom: 12px;">${deliveryDateFormatted}</strong><br>
          <span style="font-size: 8px; text-transform: uppercase; color: #8A857D; letter-spacing: 1px;">Horario Exclusivo de Entrega</span><br>
          <strong style="font-size: 12px; color: #C17F5F; font-family: 'Inter', sans-serif; display: inline-block; margin-top: 4px;">${deliveryWindowStart || '15:00'} a ${deliveryWindowEnd || '18:00'} hrs</strong>
          <p style="font-size: 8px; color: #8A857D; font-style: italic; margin-top: 12px; line-height: 1.4; margin-bottom: 0;">
            *Por motivos de control de calidad y aforo en el taller, su prenda estará lista para retiro estrictamente en la fecha y bloque horario señalados.
          </p>
        </div>

        ${paymentUrl && paymentMethod === 'transbank' ? `
        <!-- Botón de Pago -->
        <div style="margin: 12px 0 20px 0; text-align: center;">
          <a href="${paymentUrl}" target="_blank" style="display: block; background-color: #C17F5F; color: #FFFFFF !important; text-decoration: none; padding: 15px 24px; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 2.5px; border-radius: 2px; border: 1px solid #C17F5F; font-family: 'Inter', sans-serif; box-shadow: 0 4px 12px rgba(193, 127, 95, 0.25);">
            PAGAR EN LÍNEA: ${formatCurrency(total)}
          </a>
          <p style="font-size: 8px; color: #8A857D; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Inter', sans-serif; margin-bottom: 0;">Pagar de forma segura con Webpay Plus</p>
        </div>
        ` : ''}
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
        <div style="font-size: 7.5px; color: #8A857D; letter-spacing: 4px; margin-top: 6px; text-transform: uppercase; font-family: 'Inter', sans-serif;">ELENA*${orderId}*LA*COSTURERA</div>
      </div>
      
      <p style="font-size: 8px; color: #8A857D; letter-spacing: 2.5px; margin-top: 28px; font-weight: 400; font-family: 'Inter', sans-serif;">Av. Tabancura 1091 · Vitacura</p>
    </div>
  </div>
</body>
</html>`;

        const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;
        const info = await transporter.sendMail({
            from: `"ELENA La Costurera" <${fromAddress}>`,
            to: customerEmail,
            subject: `Tu pieza ya ingresó al atelier — ELENA La Costurera`,
            html: htmlContent,
            attachments: attachments,
        });

        console.log('Correo de confirmación enviado:', info.messageId);
        return { success: true };
    } catch (err: unknown) {
        console.error('Error al enviar correo por SMTP de Google:', err);
        return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
}


export async function createPOSOrdersAction(payload: {
    customerId: string;
    posOrderId?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    items: {
        name: string;
        price: number;
        category: string;
        notes?: string;
        isCustom?: boolean;
        hours?: number;
        assignedOperatorId?: string;
    }[];
    deadline?: string | null;
    productionStartDate?: string | null;
    productionEndDate?: string | null;
    finalDeliveryDate?: string | null;
}) {
    const { customerId, posOrderId, paymentMethod, paymentStatus, items, deadline, productionStartDate, productionEndDate, finalDeliveryDate } = payload;
    const supabase = await createClient();

    const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
    const subtotal = Math.round(totalAmount / 1.19);
    const taxAmount = totalAmount - subtotal;
    const internalId = posOrderId || `ERP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const finalCustomerId = customerId === 'unassigned' ? null : customerId;

    // 1. Insert Sales Ledger record
    const { data: saleData, error: saleError } = await supabase
        .from('sales_ledger')
        .insert([{
            internal_id: internalId,
            customer_id: finalCustomerId,
            net_amount: subtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            status: paymentStatus === 'paid' || paymentStatus === 'completed' ? 'completed' : 'pending',
            payment_method: paymentMethod || null,
            external_transaction_id: null
        }])
        .select('id')
        .single();

    if (saleError) {
        console.error('Error creating sales ledger entry:', saleError);
        return { success: false, error: saleError.message };
    }

    const saleId = saleData.id;

    // 2. Insert Production Orders linked to Sales Ledger
    const insertPromises = items.map(item => {
        const orderType = item.isCustom ? 'bespoke' : 'b2b_batch';
        return supabase
            .from('production_orders')
            .insert([{
                sale_id: saleId,
                customer_id: finalCustomerId,
                description: item.name,
                order_type: orderType,
                status: 'draft',
                notes: item.notes || '',
                deadline: finalDeliveryDate || deadline || null,
                estimated_hours: item.hours || 0,
                production_start_date: productionStartDate || null,
                production_end_date: productionEndDate || null,
                final_delivery_date: finalDeliveryDate || null,
                assigned_operator_id: item.assignedOperatorId && item.assignedOperatorId !== 'unassigned' ? item.assignedOperatorId : null,
                pos_order_id: posOrderId || null,
                payment_method: paymentMethod || null,
                payment_status: paymentStatus || 'pending'
            }]);
    });

    const results = await Promise.all(insertPromises);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
        console.error('Errors inserting POS production orders:', errors.map(e => e.error?.message));
        return { success: false, error: errors[0].error?.message };
    }

    return { success: true };
}

export async function checkOrderStatusAction(posOrderId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('production_orders')
        .select('payment_status')
        .eq('pos_order_id', posOrderId)
        .limit(1)
        .single();
        
    if (error) {
        return { success: false, error: error.message };
    }
    
    return { success: true, status: data?.payment_status };
}

export async function getDailyWorkloadAction(dateStr: string) {
    const supabase = await createClient();
    
    // dateStr is like "2026-05-27T08:00" or an ISO string.
    const datePart = dateStr.split('T')[0];
    if (!datePart) {
        return { count: 0, totalHours: 0 };
    }
    
    // Fetch all active production orders
    const { data, error } = await supabase
        .from('production_orders')
        .select('estimated_hours, deadline, production_end_date')
        .neq('status', 'delivered');
        
    if (error) {
        console.error('Error fetching daily workload:', error);
        return { count: 0, totalHours: 0, error: error.message };
    }
    
    // Snapped to Chilean timezone calendar date matching
    const targetDate = new Date(datePart + 'T12:00:00');
    const targetDayStr = targetDate.toLocaleDateString('en-US'); // "M/D/YYYY" format
    
    const matchedOrders = (data || []).filter(order => {
        const dateToUse = order.production_end_date || order.deadline;
        if (!dateToUse) return false;
        
        // Parse dateToUse in Chilean timezone to ensure matching calendar day
        const localDate = new Date(new Date(dateToUse).toLocaleString("en-US", { timeZone: "America/Santiago" }));
        return localDate.toLocaleDateString('en-US') === targetDayStr;
    });
    
    const count = matchedOrders.length;
    const totalHours = matchedOrders.reduce((sum, order) => sum + Number(order.estimated_hours || 0), 0);
    
    return { count, totalHours };
}

export async function getAtelierConfigAction() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('atelier_config')
        .select('*')
        .limit(1);
        
    if (error) {
        console.error('Error fetching atelier config:', error);
        return null;
    }
    return data && data.length > 0 ? data[0] : null;
}


export async function getEstimatedDatesAction(newHours: number, assignedOperatorId?: string) {
    const supabase = await createClient();
    
    // 1. Fetch config with RLS disabled
    const { data: configData, error: configError } = await supabase
        .from('atelier_config')
        .select('*')
        .limit(1);
        
    let laborCapacity = 7;
    let activeOperators = 3;
    let bufferDays = 2;
    let windowStart = '15:00:00';
    let windowEnd = '18:00:00';
    let allowedDays = [2, 4]; // Martes (2), Jueves (4)
    let workshopWorkingDays = [1, 2, 3, 4, 5, 6]; // Lunes a Sábado por defecto (1-6)
    let workshopHourStart = '09:00:00';
    let workshopHourEnd = '18:00:00';
    
    if (!configError && configData && configData.length > 0) {
        const c = configData[0];
        laborCapacity = Number(c.labor_capacity_per_operator_daily ?? 7);
        activeOperators = Number(c.total_active_operators ?? 3);
        bufferDays = Number(c.logistic_buffer_days ?? 2);
        windowStart = c.delivery_window_start ?? '15:00:00';
        windowEnd = c.delivery_window_end ?? '18:00:00';
        allowedDays = c.delivery_allowed_days ?? [2, 4];
        workshopWorkingDays = c.workshop_working_days ?? [1, 2, 3, 4, 5, 6];
        workshopHourStart = c.workshop_working_hour_start ?? '09:00:00';
        workshopHourEnd = c.workshop_working_hour_end ?? '18:00:00';
    }

    let usingOperator = false;
    let operatorName = '';
    if (assignedOperatorId && assignedOperatorId !== 'unassigned') {
        const { data: opData } = await supabase
            .from('atelier_operators')
            .select('*')
            .eq('id', assignedOperatorId)
            .single();

        if (opData) {
            laborCapacity = Number(opData.daily_hours_capacity ?? 7);
            workshopWorkingDays = opData.working_days ?? [1, 2, 3, 4, 5, 6];
            activeOperators = 1; // Queue calculation for this operator
            operatorName = opData.name;
            usingOperator = true;
        }
    }
    
    const CD = laborCapacity * activeOperators; // Total daily capacity in hours
    
    // 2. Fetch active backlog (orders currently in-progress or in queue)
    let backlogQuery = supabase
        .from('production_orders')
        .select('estimated_hours')
        .in('status', ['draft', 'cutting', 'sewing', 'finishing']);

    if (usingOperator) {
        backlogQuery = backlogQuery.eq('assigned_operator_id', assignedOperatorId);
    }
        
    const { data: activeOrders } = await backlogQuery;
        
    const backlogHours = activeOrders?.reduce((sum, o) => sum + Number(o.estimated_hours || 0), 0) || 0;
    
    // 3. Timezone helper to get Chile Offset dynamically
    const now = new Date();
    const getChileOffsetString = (date: Date) => {
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Santiago",
            year: "numeric", month: "numeric", day: "numeric",
            hour: "numeric", minute: "numeric", second: "numeric",
            hour12: false
        });
        const parts = formatter.formatToParts(date);
        const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
        const chileUTC = Date.UTC(
            Number(map.year),
            Number(map.month) - 1,
            Number(map.day),
            Number(map.hour),
            Number(map.minute),
            Number(map.second)
        );
        const diffMs = chileUTC - date.getTime();
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const sign = diffHours >= 0 ? "+" : "-";
        const absHours = String(Math.abs(diffHours)).padStart(2, "0");
        return `${sign}${absHours}:00`;
    };

    const chileOffset = getChileOffsetString(now);

    const formatChileLocalToISO = (chileDate: Date): string => {
        const y = chileDate.getFullYear();
        const mo = String(chileDate.getMonth() + 1).padStart(2, '0');
        const d = String(chileDate.getDate()).padStart(2, '0');
        const h = String(chileDate.getHours()).padStart(2, '0');
        const mi = String(chileDate.getMinutes()).padStart(2, '0');
        return `${y}-${mo}-${d}T${h}:${mi}:00${chileOffset}`;
    };

    // Get current Chilean local time as a standard Date object
    const nowInChile = new Date(now.toLocaleString("en-US", { timeZone: "America/Santiago" }));

    // 4. Align start date to workshop working hours (09:00 - 18:00 or customized)
    function alignToWorkingHours(date: Date): Date {
        let res = new Date(date.getTime());
        const [startH, startM] = workshopHourStart.split(':').map(Number);
        const [endH, endM] = workshopHourEnd.split(':').map(Number);
        
        let safeguard = 0;
        while (safeguard < 30) {
            safeguard++;
            
            if (!workshopWorkingDays.includes(res.getDay())) {
                res.setDate(res.getDate() + 1);
                res.setHours(startH || 9, startM || 0, 0, 0);
                continue;
            }
            
            const currentH = res.getHours();
            const currentM = res.getMinutes();
            
            if (currentH < (startH || 9) || (currentH === (startH || 9) && currentM < (startM || 0))) {
                res.setHours(startH || 9, startM || 0, 0, 0);
                break;
            }
            
            if (currentH > (endH || 18) || (currentH === (endH || 18) && currentM > (endM || 0))) {
                res.setDate(res.getDate() + 1);
                res.setHours(startH || 9, startM || 0, 0, 0);
                continue;
            }
            
            break;
        }
        return res;
    }

    // 5. Calculate scheduling based on workload rate
    function addWorkHours(start: Date, hours: number, dailyCapacity: number): Date {
        let result = new Date(start.getTime());
        
        result = alignToWorkingHours(result);
        if (hours <= 0) return result;
        
        let remaining = hours;
        const [startH, startM] = workshopHourStart.split(':').map(Number);
        const [endH, endM] = workshopHourEnd.split(':').map(Number);
        
        const workingDayClockHours = (endH || 18) - (startH || 9) + ((endM || 0) - (startM || 0)) / 60;
        const W = workingDayClockHours > 0 ? workingDayClockHours : 9;
        
        const rate = dailyCapacity / W;
        
        let safeguard = 0;
        while (remaining > 0 && safeguard < 100) {
            safeguard++;
            
            result = alignToWorkingHours(result);
            
            const currentWorkDayEnd = new Date(result.getTime());
            currentWorkDayEnd.setHours(endH || 18, endM || 0, 0, 0);
            
            const clockHoursLeftToday = (currentWorkDayEnd.getTime() - result.getTime()) / (1000 * 60 * 60);
            const personHoursLeftToday = clockHoursLeftToday * rate;
            
            if (remaining <= personHoursLeftToday) {
                const clockHoursRequired = remaining / rate;
                result.setTime(result.getTime() + clockHoursRequired * 60 * 60 * 1000);
                remaining = 0;
            } else {
                result.setDate(result.getDate() + 1);
                result.setHours(startH || 9, startM || 0, 0, 0);
                remaining -= personHoursLeftToday;
            }
        }
        
        return alignToWorkingHours(result);
    }
    
    // 6. Logistic Buffer calculation
    function addBufferDays(date: Date, days: number): Date {
        let result = new Date(date.getTime());
        let remainingDays = days;
        while (remainingDays > 0) {
            result.setDate(result.getDate() + 1);
            if (workshopWorkingDays.includes(result.getDay())) {
                remainingDays--;
            }
        }
        return result;
    }
    
    // Perform scheduling calculations using Chilean local time
    const productionStartDate = addWorkHours(nowInChile, backlogHours, CD);
    const productionEndDate = addWorkHours(productionStartDate, newHours, CD);
    
    let finalDeliveryDate = addBufferDays(productionEndDate, bufferDays);
    
    let safeguard = 0;
    while (!allowedDays.includes(finalDeliveryDate.getDay()) && safeguard < 30) {
        finalDeliveryDate.setDate(finalDeliveryDate.getDate() + 1);
        safeguard++;
    }
    
    const [startH, startM] = windowStart.split(':').map(Number);
    finalDeliveryDate.setHours(startH || 15, startM || 0, 0, 0);
    
    return {
        productionStartDate: formatChileLocalToISO(productionStartDate),
        productionEndDate: formatChileLocalToISO(productionEndDate),
        finalDeliveryDate: formatChileLocalToISO(finalDeliveryDate),
        backlogHours,
        dailyCapacity: CD,
        config: {
            laborCapacity,
            activeOperators,
            bufferDays,
            windowStart,
            windowEnd,
            allowedDays,
            workshopWorkingDays,
            workshopHourStart,
            workshopHourEnd
        }
    };
}

export async function updateAtelierConfigAction(config: {
    laborCapacity: number;
    activeOperators: number;
    bufferDays: number;
    windowStart: string;
    windowEnd: string;
    allowedDays: number[];
    workingDays: number[];
    workshopHourStart?: string;
    workshopHourEnd?: string;
}) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from('atelier_config')
        .upsert([{
            id: 'c0ffee88-8888-8888-8888-888888888888',
            labor_capacity_per_operator_daily: config.laborCapacity,
            total_active_operators: config.activeOperators,
            logistic_buffer_days: config.bufferDays,
            delivery_window_start: config.windowStart,
            delivery_window_end: config.windowEnd,
            delivery_allowed_days: config.allowedDays,
            workshop_working_days: config.workingDays,
            workshop_working_hour_start: config.workshopHourStart || '09:00:00',
            workshop_working_hour_end: config.workshopHourEnd || '18:00:00',
            updated_at: new Date().toISOString()
        }]);
        
    if (error) {
        console.error('Error updating atelier config:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true };
}

export async function getOperatorsAction() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('atelier_operators')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching operators:', error);
        return [];
    }
    return data || [];
}

export async function updateOperatorAction(op: {
    id?: string;
    name: string;
    dailyCapacity: number;
    workingDays: number[];
    status: string;
}) {
    const supabase = await createClient();
    
    const payload: any = {
        name: op.name,
        daily_hours_capacity: op.dailyCapacity,
        working_days: op.workingDays,
        status: op.status
    };

    if (op.id) {
        payload.id = op.id;
    }

    const { data, error } = await supabase
        .from('atelier_operators')
        .upsert([payload])
        .select();

    if (error) {
        console.error('Error upserting operator:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/production-board');
    return { success: true, data };
}

export async function saveBudgetAction(payload: any) {
    const supabase = await createClient();
    
    // Generate a random 6-character short ID
    const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { error } = await supabase
        .from('budgets')
        .insert([{ id: shortId, payload }]);
        
    if (error) {
        console.error('Error saving budget:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, id: shortId };
}

export async function getBudgetAction(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('budgets')
        .select('payload')
        .eq('id', id)
        .single();
        
    if (error) {
        console.error('Error fetching budget:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, data: data.payload };
}

export async function updateOrderStatusToPaidAction(posOrderId: string) {
    const supabase = await createClient();
    
    // El buyOrder de Transbank viene con el formato "order_123"
    // Pero en production_orders el pos_order_id es "order_123" completo, así que actualizamos usando eso.
    const { error: prodError } = await supabase
        .from('production_orders')
        .update({ payment_status: 'paid', status: 'pending' }) // Pasamos status a pending ya que estaba en draft
        .eq('pos_order_id', posOrderId);
        
    if (prodError) {
        console.error('Error updating order to paid:', prodError);
        return { success: false, error: prodError.message };
    }
    
    // Actualizar Planilla de Ventas
    const internalId = posOrderId; // O si guardamos un ID distinto
    const { error: salesError } = await supabase
        .from('sales_ledger')
        .update({ status: 'completed' })
        .eq('internal_id', internalId);
        
    if (salesError) {
        console.error('Error updating sales ledger:', salesError);
        // No retornamos error fatal si ya se actualizó la producción, pero queda logueado.
    }
    
    revalidatePath('/admin/production-board');
    return { success: true };
}

export async function wakeUpMercadoPagoTerminalAction(amount: number, description: string, posOrderId: string) {
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) {
        return { success: false, error: 'Token de MP no configurado' };
    }

    // Using the SN provided by the user as Device ID
    const deviceId = 'NCC804183989'; 

    const payload = {
        amount: amount,
        description: description,
        payment: {
            installments: 1,
            type: "credit_card",
            installments_cost: "merchant"
        },
        additional_info: {
            external_reference: posOrderId,
            print_on_terminal: true
        }
    };

    try {
        const response = await fetch(`https://api.mercadopago.com/point/integration-api/devices/${deviceId}/payment-intents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${mpToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error('Error despertando terminal MP:', errData);
            return { success: false, error: `Error MP: ${response.status} - ${errData}` };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (err: unknown) {
        console.error('Error llamando a MP Point API:', err);
        return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
}
