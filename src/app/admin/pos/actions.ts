'use server';

import nodemailer from 'nodemailer';
import { createClient } from '@/lib/supabase/server';
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
}) {
    try {
        const { customerEmail, customerName, orderId, items, total, paymentMethod, date, deliveryDate } = payload;

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

        // Crear preferencia de pago en Mercado Pago para la confirmación de la orden
        let paymentUrl = '';
        const mpAccessToken = process.env.MP_ACCESS_TOKEN || '';
        if (mpAccessToken) {
            try {
                const mpItems = items.map(item => ({
                    title: item.name,
                    quantity: 1,
                    unit_price: Math.round(item.price),
                    currency_id: 'CLP'
                }));
                
                const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${mpAccessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        items: mpItems,
                        back_urls: {
                            success: 'https://elenalacosturera.com/pago-exitoso',
                            failure: 'https://elenalacosturera.com/pago-fallido',
                            pending: 'https://elenalacosturera.com/pago-pendiente'
                        },
                        auto_return: 'approved',
                        external_reference: `order_${orderId}`
                    })
                });
                
                if (mpResponse.ok) {
                    const mpData = await mpResponse.json();
                    paymentUrl = mpData.init_point;
                } else {
                    console.error('Failed to create MP preference for order:', await mpResponse.text());
                }
            } catch (err) {
                console.error('Error creating MP preference for order email:', err);
            }
        }
        
        if (!paymentUrl) {
            paymentUrl = `https://www.mercadopago.cl/checkout/v1/redirect?pref_id=order_${orderId}`;
        }

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
        
        <div style="border: 1px solid rgba(245, 242, 235, 0.1); border-radius: 2px; display: inline-block; padding: 12px 24px; background-color: rgba(255, 255, 255, 0.02); margin-bottom: 20px;">
          <p style="font-size: 7.5px; font-weight: 600; color: #8A857D; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 4px 0; font-family: 'Inter', sans-serif;">Prueba / Retiro</p>
          <p style="font-size: 11px; font-weight: 400; color: #F5F5F0; letter-spacing: 1px; font-family: 'Inter', sans-serif;">${deliveryDateFormatted.split(',')[1] || deliveryDateFormatted} — ${deliveryTimeFormatted} hrs</p>
        </div>

        <!-- Botón de Pago Mercado Pago -->
        <div style="margin: 12px 0 20px 0; text-align: center;">
          <a href="${paymentUrl}" target="_blank" style="display: block; background-color: #C17F5F; color: #FFFFFF !important; text-decoration: none; padding: 15px 24px; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 2.5px; border-radius: 2px; border: 1px solid #C17F5F; font-family: 'Inter', sans-serif; box-shadow: 0 4px 12px rgba(193, 127, 95, 0.25);">
            PAGAR EN LÍNEA: ${formatCurrency(total)}
          </a>
          <p style="font-size: 8px; color: #8A857D; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; font-family: 'Inter', sans-serif; margin-bottom: 0;">Pagar de forma segura con Mercado Pago</p>
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
    items: {
        name: string;
        price: number;
        category: string;
        notes?: string;
        isCustom?: boolean;
    }[];
    deadline?: string | null;
}) {
    const { customerId, items, deadline } = payload;
    const supabase = await createClient();

    const insertPromises = items.map(item => {
        const orderType = item.isCustom ? 'bespoke' : 'b2b_batch';
        return supabase
            .from('production_orders')
            .insert([{
                customer_id: customerId,
                description: item.name,
                order_type: orderType,
                status: 'draft',
                notes: item.notes || '',
                deadline: deadline || null
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

export async function getDailyWorkloadAction(dateStr: string) {
    const supabase = await createClient();
    
    const selectedDate = new Date(dateStr);
    if (isNaN(selectedDate.getTime())) {
        return { count: 0, totalHours: 0 };
    }
    
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const { data, error } = await supabase
        .from('production_orders')
        .select('estimated_hours')
        .gte('deadline', startOfDay.toISOString())
        .lte('deadline', endOfDay.toISOString());
        
    if (error) {
        console.error('Error fetching daily workload:', error);
        return { count: 0, totalHours: 0, error: error.message };
    }
    
    const count = data?.length || 0;
    const totalHours = data?.reduce((sum, order) => sum + Number(order.estimated_hours || 0), 0) || 0;
    
    return { count, totalHours };
}
