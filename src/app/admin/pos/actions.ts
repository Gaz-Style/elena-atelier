'use server';

import nodemailer from 'nodemailer';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

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
    try {
        const { customerEmail, customerName, items, total, budgetLink } = payload;
        
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

        const itemsRowsHtml = items.map((item) => `
            <tr style="border-bottom: 1px solid rgba(245, 242, 235, 0.08);">
                <td style="padding: 10px 0; text-align: left; vertical-align: top; font-family: 'Inter', sans-serif;">
                    <p style="margin: 0; font-size: 11px; font-weight: 500; color: #FFFFFF; line-height: 1.3; letter-spacing: 0.5px;">${item.name}</p>
                    <span style="font-size: 8px; text-transform: uppercase; color: #8A857D; font-weight: 500; letter-spacing: 1.5px; display: inline-block; margin-top: 2px;">${item.category}</span>
                    ${item.notes ? `<p style="margin: 4px 0 0 0; font-size: 9px; color: #8A857D; font-style: italic; font-weight: 300;">"${item.notes}"</p>` : ''}
                </td>
                <td style="padding: 10px 0; text-align: right; vertical-align: top; font-family: 'Playfair Display', Georgia, serif; font-size: 12px; font-weight: bold; color: #C17F5F;">
                    ${formatCurrency(item.price)}
                </td>
            </tr>
        `).join('');

        const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Elena La Costurera — Presupuesto</title>
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
      <p style="font-size: 8px; font-weight: 600; color: #C17F5F; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 4px 0; font-family: 'Inter', sans-serif;">Propuesta Atelier</p>
      
      <p style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-style: italic; font-weight: 400; color: #F5F5F0; margin: 0 0 36px 0; letter-spacing: 0.5px;">¡Hola ${customerName}!</p>
      
      <div style="margin-bottom: 30px;">
        <p style="color: #F5F5F0; font-size: 13px; line-height: 1.6; font-weight: 300; margin-bottom: 30px; opacity: 0.9;">
          Adjuntamos la propuesta formal y presupuesto para el servicio de costura solicitado en nuestro atelier.
        </p>

        <div style="margin-bottom: 24px; text-align: left;">
            <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                ${itemsRowsHtml}
            </table>
            <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <tr>
                    <td style="padding: 4px 0; text-align: left; font-size: 8px; font-weight: 600; color: #8A857D; letter-spacing: 2px; text-transform: uppercase; font-family: 'Inter', sans-serif;">Total Presupuestado</td>
                    <td style="padding: 4px 0; text-align: right; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 300; color: #C17F5F;">
                        ${formatCurrency(total)}
                    </td>
                </tr>
            </table>
        </div>
        
        <!-- Botón de Pago -->
        <div style="margin: 30px 0 20px 0; text-align: center;">
          <a href="${budgetLink}" target="_blank" style="display: block; background-color: #C17F5F; color: #FFFFFF !important; text-decoration: none; padding: 15px 24px; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 2.5px; border-radius: 2px; border: 1px solid #C17F5F; font-family: 'Inter', sans-serif; box-shadow: 0 4px 12px rgba(193, 127, 95, 0.25);">
            REVISAR Y PAGAR EN LÍNEA
          </a>
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
        <div style="font-size: 7.5px; color: #8A857D; letter-spacing: 4px; margin-top: 6px; text-transform: uppercase; font-family: 'Inter', sans-serif;">ELENA*PRESUPUESTO*LA*COSTURERA</div>
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
            subject: 'Presupuesto Formal - ELENA La Costurera',
            html: htmlContent,
            attachments: attachments,
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
    status?: string;
    items: {
        name: string;
        price: number;
        category: string;
        notes?: string;
        isCustom?: boolean;
        hours?: number;
        assignedOperatorId?: string;
        bomItems?: { itemId: string; estimatedQty: number; notes: string }[];
    }[];
    deadline?: string | null;
    productionStartDate?: string | null;
    productionEndDate?: string | null;
    finalDeliveryDate?: string | null;
}) {
    const { customerId, posOrderId, paymentMethod, paymentStatus, status, items, deadline, productionStartDate, productionEndDate, finalDeliveryDate } = payload;
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
    const insertPromises = items.map(async item => {
        const orderType = item.isCustom ? 'bespoke' : 'b2b_batch';
        const { data: pOrder, error: pError } = await supabase
            .from('production_orders')
            .insert([{
                sale_id: saleId,
                customer_id: finalCustomerId,
                description: item.name,
                order_type: orderType,
                status: status || 'draft',
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
            }])
            .select('id')
            .single();

        if (pError) return { error: pError };

        // If there are BOM items, insert them into erp_order_bom
        if (item.bomItems && item.bomItems.length > 0 && pOrder) {
            const bomInserts = item.bomItems.map((b: any) => ({
                order_id: pOrder.id,
                item_id: b.itemId,
                estimated_qty: b.estimatedQty,
                notes: b.notes || ''
            }));
            const { error: bomError } = await supabase.from('erp_order_bom').insert(bomInserts);
            if (bomError) console.error('Error inserting BOM:', bomError);
        }

        return { success: true, data: pOrder };
    });

    const results = await Promise.all(insertPromises);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
        console.error('Errors inserting POS production orders:', errors.map(e => e.error?.message));
        return { success: false, error: errors[0].error?.message };
    }

    // 3. Si hay finalDeliveryDate, sincronizar con la Agenda como "Retiro de Prenda"
    if (finalDeliveryDate && finalCustomerId) {
        try {
            // Obtener datos del cliente para la agenda
            const { data: customerData } = await supabase
                .from('customers')
                .select('full_name, phone, email')
                .eq('id', finalCustomerId)
                .single();

            if (customerData) {
                const nombre = customerData.full_name.split(' ')[0] || 'Cliente';
                const apellido = customerData.full_name.split(' ').slice(1).join(' ') || '';
                
                await supabase.from('agendamientos').insert([{
                    nombre,
                    apellido,
                    celular: customerData.phone || '',
                    correo: customerData.email || '',
                    fecha_hora: finalDeliveryDate,
                    origen: 'pos',
                    tipo_evento: 'retiro_encargo',
                    estado: 'confirmado',
                    notas: `Retiro de Orden ${internalId}`
                }]);
            }
        } catch (syncError) {
            console.error('Error sincronizando retiro con la agenda:', syncError);
        }
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


export async function getEstimatedDatesAction(newHours: number, assignedOperatorId?: string, scheduledStartDate?: string) {
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
    const now = scheduledStartDate ? new Date(scheduledStartDate) : new Date();
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
    
    // 6. Execute scheduling math
    // Si se agendó un inicio específico, asumimos que no hace cola tras el backlog actual
    const totalHoursToComplete = scheduledStartDate ? newHours : backlogHours + newHours;
    
    // We start from nowInChile to find when production finishes
    const productionStartDate = scheduledStartDate ? new Date(scheduledStartDate) : nowInChile;
    const productionEndDate = addWorkHours(productionStartDate, totalHoursToComplete, CD);
    
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
        operatorWorkloadPercentage: usingOperator ? Math.round((backlogHours / laborCapacity) * 100) : null,
        operatorWorkloadDays: usingOperator ? (backlogHours / laborCapacity).toFixed(1) : null,
        operatorName: usingOperator ? operatorName : null,
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
        .insert([{ 
            id: shortId, 
            payload,
            status: 'pending',
            customer_name: payload.customerName || null,
            customer_email: payload.customerEmail || null,
            total_amount: payload.total || 0,
        }]);
        
    if (error) {
        console.error('Error saving budget:', error);
        return { success: false, error: error.message };
    }
    
    return { success: true, id: shortId };
}

export async function updateBudgetStatusAction(id: string, status: 'pending' | 'accepted' | 'expired') {
    const supabase = getAdminClient();
    const { error } = await supabase
        .from('budgets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/quotes');
    return { success: true };
}

export async function getAllBudgetsAction() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('budgets')
        .select('id, status, customer_name, customer_email, total_amount, created_at, updated_at, payload')
        .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
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
    
    // Intercept budgets and convert them to real orders BEFORE updating
    if (posOrderId.startsWith('budget_')) {
        const budgetId = posOrderId.replace('budget_', '');
        const { data: budget } = await supabase.from('budgets').select('payload').eq('id', budgetId).single();
        
        if (budget && budget.payload) {
            const { data: existing } = await supabase.from('sales_ledger').select('id').eq('internal_id', posOrderId).single();
            if (!existing) {
                const payload = budget.payload;
                const orderPayload = {
                    customerId: payload.customerId || 'unassigned',
                    posOrderId: posOrderId,
                    paymentMethod: 'online', // Initial generic method, the webhook will update this shortly
                    paymentStatus: 'paid',
                    status: 'scheduled',
                    items: payload.cart.map((item: any) => ({
                        name: item.name,
                        price: item.price,
                        category: item.category,
                        notes: item.notes || '',
                        isCustom: !!item.isCustom,
                        hours: item.details?.hours || 0,
                        assignedOperatorId: item.assignedOperatorId || 'unassigned'
                    })),
                    deadline: null,
                    productionStartDate: payload.adjustedDates?.productionStartDate || null,
                    productionEndDate: payload.adjustedDates?.productionEndDate || null,
                    finalDeliveryDate: null
                };
                
                const res = await createPOSOrdersAction(orderPayload);
                if (!res.success) {
                    console.error('Failed to convert budget to order', res.error);
                } else {
                    await updateBudgetStatusAction(budgetId, 'accepted');
                }
            }
        }
    }

    // El buyOrder de Transbank viene con el formato "order_123" o "budget_123"
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
    
    // --- WhatsApp Confirmation ---
    try {
        const { data: orderInfo } = await supabase.from('production_orders').select('customer_id').eq('pos_order_id', posOrderId).single();
        if (orderInfo && orderInfo.customer_id && orderInfo.customer_id !== 'unassigned') {
            const { data: custInfo } = await supabase.from('crm_customers').select('phone, full_name').eq('id', orderInfo.customer_id).single();
            if (custInfo && custInfo.phone) {
                const WHATSAPP_API_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN || process.env.WHATSAPP_API_TOKEN;
                const PHONE_NUMBER_ID = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
                if (WHATSAPP_API_TOKEN && PHONE_NUMBER_ID) {
                    const cleanPhone = custInfo.phone.replace(/\D/g, '');
                    const finalPhone = cleanPhone.startsWith('56') ? cleanPhone : `56${cleanPhone}`;
                    
                    const wpRes = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messaging_product: 'whatsapp',
                            to: finalPhone,
                            type: 'template',
                            template: {
                                name: 'confirmacion_pago_cliente',
                                language: { code: 'es_CL' },
                                components: [{
                                    type: 'body',
                                    parameters: [{ type: 'text', text: custInfo.full_name }]
                                }]
                            }
                        })
                    });
                    
                    if (wpRes.ok) {
                        // Log to Live Chat
                        const { data: chatSession } = await supabase.from('crm_chat_sessions').select('id').eq('customer_phone', finalPhone).single();
                        let sessionId = chatSession?.id;
                        if (!sessionId) {
                            const { data: newSession } = await supabase.from('crm_chat_sessions').insert([{
                                customer_phone: finalPhone,
                                customer_name: custInfo.full_name,
                                unread_count: 0,
                                last_message_at: new Date().toISOString()
                            }]).select('id').single();
                            sessionId = newSession?.id;
                        }
                        if (sessionId) {
                            await supabase.from('crm_whatsapp_messages').insert([{
                                session_id: sessionId,
                                sender: 'system',
                                content: `[Sistema] Transbank Webpay Plus: Se envió la plantilla confirmacion_pago_cliente automáticamente.`,
                                status: 'sent'
                            }]);
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.error('Error enviando WhatsApp de confirmación de pago Webpay:', e);
    }
    // ----------------------------
    
    revalidatePath('/admin/production-board');
    return { success: true };
}

export async function wakeUpMercadoPagoTerminalAction(amount: number, description: string, posOrderId: string) {
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) {
        return { success: false, error: 'Token de MP no configurado' };
    }

    try {
        // 1. Obtener la lista de terminales para encontrar el ID correcto
        const terminalsResponse = await fetch('https://api.mercadopago.com/terminals/v1/list', {
            headers: { 'Authorization': `Bearer ${mpToken}` }
        });

        if (!terminalsResponse.ok) {
            console.error('Error al obtener terminales:', await terminalsResponse.text());
            return { success: false, error: 'No se pudo validar el terminal físico.' };
        }

        const terminalsData = await terminalsResponse.json();
        const devices = terminalsData?.data?.terminals || [];
        
        // Buscar el terminal que contenga el SN proporcionado, o usar el primero
        let terminalId = '';
        const targetSN = 'NCC804183989';
        const foundDevice = devices.find((d: any) => d.id.includes(targetSN));
        
        if (foundDevice) {
            terminalId = foundDevice.id;
        } else if (devices.length > 0) {
            terminalId = devices[0].id;
        } else {
            return { success: false, error: 'No hay maquinitas Mercado Pago Point vinculadas a esta cuenta.' };
        }

        // 2. Crear la orden de cobro en el terminal usando la nueva API
        const { randomUUID } = require('crypto');
        const payload = {
            type: "point",
            external_reference: posOrderId,
            transactions: {
                payments: [
                    { amount: amount.toString() }
                ]
            },
            config: {
                point: {
                    terminal_id: terminalId
                }
            }
        };

        const response = await fetch(`https://api.mercadopago.com/v1/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${mpToken}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': randomUUID()
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error('Error despertando terminal MP:', errData);
            return { success: false, error: `Error MP Orders API: ${response.status} - ${errData}` };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (err: unknown) {
        console.error('Error llamando a MP Point API:', err);
        return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
}

export async function requestDiscountAuthorizationAction(payload: {
    sellerName: string;
    itemName: string;
    originalPrice: number;
    suggestedPrice: number;
    discountPct: number;
}) {
    const { sellerName, itemName, originalPrice, suggestedPrice, discountPct } = payload;
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPassword = process.env.SMTP_PASSWORD || '';

    if (!smtpUser || !smtpPassword) {
        console.error('Faltan variables SMTP_USER o SMTP_PASSWORD.');
        return { success: false, error: 'Credenciales de correo no configuradas.' };
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

    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px;">
        <h2>⚠️ Autorización de Descuento Requerida</h2>
        <p>Se está intentando aplicar un descuento mayor al 20% en el POS.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr><td style="padding: 5px; border-bottom: 1px solid #ccc;"><b>Vendedora:</b></td><td style="padding: 5px; border-bottom: 1px solid #ccc;">${sellerName || 'Caja Principal'}</td></tr>
            <tr><td style="padding: 5px; border-bottom: 1px solid #ccc;"><b>Prenda/Servicio:</b></td><td style="padding: 5px; border-bottom: 1px solid #ccc;">${itemName}</td></tr>
            <tr><td style="padding: 5px; border-bottom: 1px solid #ccc;"><b>Precio Calculado:</b></td><td style="padding: 5px; border-bottom: 1px solid #ccc;">${formatCurrency(suggestedPrice)}</td></tr>
            <tr><td style="padding: 5px; border-bottom: 1px solid #ccc;"><b>Precio a Cobrar:</b></td><td style="padding: 5px; border-bottom: 1px solid #ccc; color: #d9534f; font-weight: bold;">${formatCurrency(originalPrice)}</td></tr>
            <tr><td style="padding: 5px; border-bottom: 1px solid #ccc;"><b>Descuento:</b></td><td style="padding: 5px; border-bottom: 1px solid #ccc; color: #d9534f; font-weight: bold;">${discountPct}%</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: #f8d7da; color: #721c24; border-radius: 5px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">Si apruebas este descuento, dicta el siguiente PIN a la vendedora:</p>
            <h1 style="margin: 10px 0 0 0; font-size: 36px; letter-spacing: 5px;">${pin}</h1>
        </div>
    </div>
    `;

    // 1. Send Email (non-blocking)
    try {
        const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;
        const toAddress = smtpUser; // Send to admin

        await transporter.sendMail({
            from: `"ELENA POS Alertas" <${fromAddress}>`,
            to: toAddress,
            subject: `[URGENTE] Autorización de Descuento - ${discountPct}% en ${itemName}`,
            html: htmlContent,
        });
    } catch (emailErr) {
        console.error('Error enviando email de autorización (se procederá con WhatsApp):', emailErr);
    }

    // 2. Send WhatsApp Notification
    try {
        const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
        if (WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_API_TOKEN) {
            const numerosEncargados = ['56984021940', '56937667709'];
            for (const numeroEncargado of numerosEncargados) {
                try {
                    const wRes = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            messaging_product: 'whatsapp',
                            to: numeroEncargado,
                            type: 'template',
                            template: {
                                name: 'alerta_pos',
                                language: {
                                    code: 'es_CL'
                                },
                                components: [
                                    {
                                        type: 'body',
                                        parameters: [
                                            { type: 'text', text: sellerName || 'Caja Principal' },
                                            { type: 'text', text: itemName },
                                            { type: 'text', text: `${discountPct}%` },
                                            { type: 'text', text: formatCurrency(originalPrice) },
                                            { type: 'text', text: `${pin} Ingresar` }
                                        ]
                                    }
                                ]
                            }
                        })
                    });
                    const wData = await wRes.json();
                    console.log(`Respuesta Meta POS (${numeroEncargado}):`, wData);
                } catch (wspErr) {
                    console.error(`Error enviando WhatsApp POS a ${numeroEncargado}:`, wspErr);
                }
            }
        }
    } catch (wspOuterErr) {
        console.error('Error general en el envío de WhatsApp de autorización:', wspOuterErr);
    }

    return { success: true, pin };
}

export async function getOperatorsDailyLoadAction() {
    const supabase = await createClient();
    const todayStr = new Date().toDateString();

    const { data: activeOrders } = await supabase
        .from('production_orders')
        .select('assigned_operator_id, estimated_hours, status, production_start_date, deadline')
        .not('assigned_operator_id', 'is', null)
        .in('status', ['draft', 'cutting', 'sewing', 'finishing']);

    const { data: operators } = await supabase
        .from('atelier_operators')
        .select('id, name, daily_hours_capacity, status')
        .eq('status', 'active');

    if (!operators) return [];

    return operators.map(op => {
        let backlog = 0;
        if (activeOrders) {
            activeOrders.forEach(o => {
                if (o.assigned_operator_id === op.id) {
                    const targetDateStr = o.production_start_date || o.deadline;
                    if (!targetDateStr) {
                        backlog += Number(o.estimated_hours || 0);
                    } else {
                        if (new Date(targetDateStr).toDateString() === todayStr) {
                            backlog += Number(o.estimated_hours || 0);
                        }
                    }
                }
            });
        }
        return {
            id: op.id,
            name: op.name,
            dailyCapacity: op.daily_hours_capacity || 7,
            backlog,
            workloadPercentage: Math.round((backlog / (op.daily_hours_capacity || 7)) * 100),
            loadDays: (backlog / (op.daily_hours_capacity || 7)).toFixed(1)
        };
    }).sort((a, b) => a.workloadPercentage - b.workloadPercentage);
}

import { enviar_correo_confirmacion } from '@/lib/agenda';

function parseChileDateString(isoString: string) {
    const d = new Date(isoString);
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    });
    const parts = formatter.formatToParts(d);
    const p: Record<string, string> = {};
    parts.forEach(part => { p[part.type] = part.value; });
    return {
        dateStr: `${p.year}-${p.month}-${p.day}`,
        horaStr: `${p.hour}:00`
    };
}

export async function getAvailableSlotsAction(dateStr: string) {
    try {
        const slots: string[] = [];
        const dateParts = dateStr.split('-'); // YYYY-MM-DD
        const targetDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]), 12, 0, 0);
        
        const dayOfWeek = targetDate.getDay();
        
        const supabase = getAdminClient();
        const { data: configs } = await supabase.from('configuracion_horarios').select('*').eq('activo', true);
        if (!configs || configs.length === 0) return { success: true, slots: [] };
        
        const configDia = configs.find((c: any) => c.dia_semana === dayOfWeek);
        if (!configDia) return { success: true, slots: [] }; // Closed this day

        // Fetch booked events
        const startOfSearch = new Date(targetDate);
        startOfSearch.setHours(0, 0, 0, 0);
        const endOfSearch = new Date(targetDate);
        endOfSearch.setHours(23, 59, 59, 999);

        const { data: eventos } = await supabase
            .from('agendamientos')
            .select('fecha_hora')
            .gte('fecha_hora', startOfSearch.toISOString())
            .lte('fecha_hora', endOfSearch.toISOString())
            .neq('estado', 'cancelado');
            
        const horasOcupadas = eventos ? eventos.map((e: any) => {
            const { horaStr } = parseChileDateString(e.fecha_hora);
            return horaStr;
        }) : [];

        const startHour = parseInt(configDia.hora_inicio.split(':')[0]);
        const endHour = parseInt(configDia.hora_fin.split(':')[0]);

        for (let h = startHour; h < endHour; h++) {
            const horaStr = h.toString().padStart(2, '0') + ':00';
            const bloqueISO = `${dateStr}T${h.toString().padStart(2, '0')}:00:00-04:00`;
            const bloqueDate = new Date(bloqueISO);
            
            if (bloqueDate > new Date() && !horasOcupadas.includes(horaStr)) {
                slots.push(horaStr);
            }
        }

        return { success: true, slots };
    } catch (err: any) {
        console.error('Error fetching available slots:', err);
        return { success: false, error: err.message };
    }
}

export async function confirmPresencialBookingAction(payload: {
    budgetId: string;
    dateStr: string;
    timeStr: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    orderPayload: any;
}) {
    try {
        const { budgetId, dateStr, timeStr, customerName, customerEmail, customerPhone, orderPayload } = payload;
        
        const supabase = getAdminClient();
        const fechaHoraIso = `${dateStr}T${timeStr.padStart(5, '0')}:00-04:00`;

        // 1. Manage POS order (ONLY if payment method is local/presencial)
        if (orderPayload.paymentMethod === 'local') {
            if (orderPayload.posOrderId) {
                const { data: existingSale } = await supabase.from('sales_ledger').select('id').eq('internal_id', orderPayload.posOrderId).single();
                if (existingSale) {
                    // Update production_orders
                    await supabase.from('production_orders')
                        .update({ 
                            deadline: fechaHoraIso,
                            final_delivery_date: fechaHoraIso,
                            payment_method: orderPayload.paymentMethod,
                            payment_status: orderPayload.paymentStatus
                        })
                        .eq('pos_order_id', orderPayload.posOrderId);
                    
                    // Update sales_ledger
                    await supabase.from('sales_ledger')
                        .update({
                            payment_method: orderPayload.paymentMethod,
                            status: orderPayload.paymentStatus === 'completed' || orderPayload.paymentStatus === 'paid' ? 'completed' : 'pending'
                        })
                        .eq('internal_id', orderPayload.posOrderId);
                } else {
                    const orderRes = await createPOSOrdersAction(orderPayload);
                    if (!orderRes.success) throw new Error(orderRes.error || 'No se pudo crear la orden');
                }
            } else {
                const orderRes = await createPOSOrdersAction(orderPayload);
                if (!orderRes.success) throw new Error(orderRes.error || 'No se pudo crear la orden');
            }
        }
        
        // 2. Update budget status
        if (budgetId) {
            await updateBudgetStatusAction(budgetId, 'accepted');
        }

        // 3. Create appointment
        const supabaseEvent = getAdminClient();
        const { error: eventError } = await supabaseEvent.from('agendamientos').insert({
            nombre: customerName.split(' ')[0],
            apellido: customerName.split(' ').slice(1).join(' ') || '',
            celular: customerPhone || '',
            correo: customerEmail || '',
            fecha_hora: fechaHoraIso,
            estado: 'confirmado',
            tipo_evento: 'cita_cliente',
            origen: 'web',
            notas: `Ref Orden: ${orderPayload.posOrderId} - Pago: ${orderPayload.paymentMethod === 'transbank' ? 'Transbank (Pendiente)' : 'Local'}`
        });

        if (eventError) throw eventError;

        // 4. Send email
        await enviar_correo_confirmacion(customerName.split(' ')[0], customerName.split(' ')[1] || '', customerPhone || '', customerEmail, fechaHoraIso);

        return { success: true };
    } catch (err: any) {
        console.error('Error in presencial booking:', err);
        return { success: false, error: err.message || 'Error al agendar cita' };
    }
}

export async function getMonthAvailabilityAction(year: number, month: number) {
    try {
        const startDate = new Date(year, month, 1, 0, 0, 0);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        // Fetch schedule configuration
        const supabase = getAdminClient();
        const { data: configs } = await supabase.from('configuracion_horarios').select('*').eq('activo', true);
        const configsByDay = new Map();
        if (configs) {
            configs.forEach((c: any) => configsByDay.set(c.dia_semana, c));
        }

        // Fetch booked events for the month
        const { data: eventos } = await supabase
            .from('agendamientos')
            .select('fecha_hora')
            .gte('fecha_hora', startDate.toISOString())
            .lte('fecha_hora', endDate.toISOString())
            .neq('estado', 'cancelado');

        // Group booked events by date string (YYYY-MM-DD)
        const bookedByDate = new Map<string, string[]>();
        if (eventos) {
            eventos.forEach((e: any) => {
                const { dateStr, horaStr } = parseChileDateString(e.fecha_hora);
                if (!bookedByDate.has(dateStr)) bookedByDate.set(dateStr, []);
                bookedByDate.get(dateStr)!.push(horaStr);
            });
        }

        const daysInMonth = endDate.getDate();
        const availability = [];
        const now = new Date();

        for (let i = 1; i <= daysInMonth; i++) {
            const currentDate = new Date(year, month, i, 12, 0, 0);
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            const dayOfWeek = currentDate.getDay();
            const configDia = configsByDay.get(dayOfWeek);
            
            // Check if day is past
            const isPast = currentDate < new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

            if (!configDia || isPast) {
                availability.push({
                    date: dateStr,
                    isOpen: false,
                    availableSlots: [],
                    bookedSlots: []
                });
                continue;
            }

            const startHour = parseInt(configDia.hora_inicio.split(':')[0]);
            const endHour = parseInt(configDia.hora_fin.split(':')[0]);
            const bookedToday = bookedByDate.get(dateStr) || [];
            
            const availableSlots = [];
            const bookedSlots = [];

            for (let h = startHour; h < endHour; h++) {
                const horaStr = h.toString().padStart(2, '0') + ':00';
                
                // If checking today, don't allow past hours
                const bloqueISO = `${dateStr}T${horaStr}:00-04:00`;
                const bloqueDate = new Date(bloqueISO);
                
                if (bloqueDate < now) {
                    continue; // Skip past hours today
                }

                if (bookedToday.includes(horaStr)) {
                    bookedSlots.push(horaStr);
                } else {
                    availableSlots.push(horaStr);
                }
            }

            availability.push({
                date: dateStr,
                isOpen: true,
                availableSlots,
                bookedSlots,
                isFull: availableSlots.length === 0 && bookedSlots.length > 0
            });
        }

        return { success: true, availability };
    } catch (err: any) {
        console.error('Error fetching month availability:', err);
        return { success: false, error: err.message };
    }
}

export async function getPOSOrderAmountAction(posOrderId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('production_orders')
        .select('total_price')
        .eq('pos_order_id', posOrderId)
        .limit(1);

    if (error || !data || data.length === 0) {
        console.error('Error fetching order amount:', error);
        return { success: false, amount: 0 };
    }
    return { success: true, amount: data[0].total_price || 0 };
}

export async function analyzeDesignWithGeminiAction(base64Image: string) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { success: false, error: 'Gemini API Key no configurada en el servidor.' };
        }

        let mimeType = 'image/jpeg';
        let cleanBase64 = base64Image;
        if (base64Image.includes(';base64,')) {
            const parts = base64Image.split(';base64,');
            mimeType = parts[0].replace('data:', '');
            cleanBase64 = parts[1];
        }

        const systemPrompt = `Actúa como una jefa de taller experta en Sastrería de Lujo y Alta Costura para el Atelier "Elena La Costurera".
Analiza la foto del vestido/diseño y responde estrictamente con un objeto JSON válido con los parámetros técnicos de confección más óptimos.
Campos JSON requeridos:
{
  "molderia": "existing" (para base existente), "custom" (desde cero), "draping" (modelado directo sobre maniquí),
  "pieces": número estimado de piezas en el patrón (entre 2 y 40),
  "tela": "easy" (telas fáciles/estables), "medium" (telas deslizantes o elásticas), "hard" (seda natural, terciopelo), "haute" (pedrería pesada, encajes complejos),
  "estructura": {
    "canvas": true si requiere entretela sastrera picada a mano, false en caso contrario,
    "lining": true si requiere forro completo, false en caso contrario,
    "cups": true si requiere copas integradas, false en caso contrario,
    "bones": true si requiere barbas/varillas de corsé, false en caso contrario,
    "pads": true si requiere hombreras a medida, false en caso contrario
  },
  "acabados": {
    "handHem": true si requiere basta invisible hecha a mano, false en caso contrario,
    "handButtonholes": número de ojales hechos a mano (entre 0 y 20),
    "handDraping": true si requiere drapeado artesanal localizado en la prenda, false en caso contrario,
    "handEmbroideryHours": estimación de horas dedicadas a bordar pedrería o aplicaciones (entre 0 y 100)
  },
  "pruebas": número estimado de sesiones de calce requeridas (de 1 a 4),
  "toile": true si es indispensable realizar un lienzo/borrador de prueba, false en caso contrario,
  "materiales": costo estimado de tejidos e insumos en pesos chilenos CLP (entre 20000 y 500000),
  "justificacion": "Explicación técnica en español de por qué elegiste estos parámetros (máx 3 líneas)."
}`;

        const payload = {
            contents: [
                {
                    parts: [
                        { text: "Analiza técnicamente el diseño de la imagen y determina sus parámetros de confección." },
                        {
                            inlineData: {
                                mimeType,
                                data: cleanBase64
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json"
            },
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            }
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en API de Gemini: ${errorText}`);
        }

        const resData = await response.json();
        const responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!responseText) {
            throw new Error('No se recibió respuesta estructurada del modelo.');
        }

        const parsed = JSON.parse(responseText);
        return { success: true, data: parsed };

    } catch (err: any) {
        console.error('Error in analyzeDesignWithGeminiAction:', err);
        return { success: false, error: err.message };
    }
}
export async function deleteBudgetAction(id: string) {
    const supabase = getAdminClient();
    const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/quotes');
    return { success: true };
}
