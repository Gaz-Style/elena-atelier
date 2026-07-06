'use client';

import React, { useState } from 'react';

export default function PreviewPage() {
    const [tab, setTab] = useState<'confirmation' | 'budget' | 'card'>('confirmation');

    const customerName = "María González";
    const orderId = 1204;
    const items = [
        { 
            name: "Basta Vestido con Cola", 
            price: 35000, 
            category: "Bastas", 
            notes: "Ajuste fino de ruedo y encaje" 
        },
        {
            name: "Ajuste de Hombros y Sisa",
            price: 22000,
            category: "Arreglos",
            notes: "Subir hombros y ajustar sisa en seda"
        }
    ];
    const total = 57000;
    const paymentMethod: string = "transfer";
    const date = "20/5/2026";
    const deliveryDateFormatted = "Jueves, 21 de Mayo de 2026";
    const deliveryTimeFormatted = "10:00";
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
    };
    const paymentLabel = paymentMethod === 'card' ? 'Mercado Pago' : 'Efectivo / Transferencia';

    const budgetLink = "https://elenalacosturera.cl/presupuestos/1204";

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

    const confirmationHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Ingreso — ELENA LA COSTURERA</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F0EDE8; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border: 1px solid #EDE8DF; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); }
    .header { background-color: #1A1A1A; padding: 36px 40px; text-align: center; }
    .body { padding: 44px 40px; }
    .greeting { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #1A1A1A; margin-top: 0; margin-bottom: 14px; font-weight: 400; }
    .lead-text { font-size: 13px; color: #4A4A4A; line-height: 1.8; margin-bottom: 24px; font-weight: 300; }
    .info-box { background-color: #FAFAF7; border: 1px solid #EDE8DF; padding: 20px; margin-bottom: 30px; }
    .info-line { font-size: 12px; color: #4A4A4A; margin: 6px 0; font-weight: 300; }
    .info-line strong { font-weight: 600; color: #1A1A1A; }
    .table-container { margin-bottom: 30px; }
    .footer { background-color: #FAFAF7; border-top: 1px solid #EDE8DF; padding: 36px 40px; text-align: center; }
    .footer-text { font-size: 11px; color: #8A857D; line-height: 1.75; margin: 0 0 4px 0; font-weight: 300; }
    .signature { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-style: italic; color: #C17F5F; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
        <!-- LOGO ELENA LA COSTURERA -->
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
        </table>
    </div>
    
    <div class="body">
        <h2 class="greeting">Hola ${customerName},</h2>
        <p class="lead-text">
            Confirmamos el ingreso de tu prenda al atelier para dar inicio a tu servicio de entalle y costura. A continuación, te enviamos el comprobante y detalle de los servicios contratados:
        </p>
        
        <div class="info-box">
            <div class="info-line"><strong>Número de Orden:</strong> #${orderId}</div>
            <div class="info-line"><strong>Fecha de Ingreso:</strong> ${date}</div>
            <div class="info-line"><strong>Método de Pago:</strong> ${paymentLabel}</div>
            <div class="info-line"><strong>Entrega Estimada:</strong> ${deliveryDateFormatted} a las ${deliveryTimeFormatted} hrs</div>
        </div>

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
                        <td style="padding: 16px 8px; text-align: left; font-size: 13px; color: #1A1A1A; font-family:'Inter', sans-serif;">Total Pagado</td>
                        <td style="padding: 16px 8px; text-align: right; font-size: 16px; color: #C17F5F; font-family: 'Playfair Display', Georgia, serif;">${formatCurrency(total)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <p class="lead-text" style="margin-bottom: 0;">
            Te notificaremos en cuanto tus prendas estén listas para la prueba o retiro final. Con el fin de respetar los tiempos dedicados a cada cliente, te agradecemos asistir puntualmente a tu cita agendada.
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

    const budgetHtml = `<!DOCTYPE html>
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
        <!-- LOGO ELENA LA COSTURERA -->
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
        </table>
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
            Para revisar el detalle del servicio, dejar comentarios o **aprobar y agendar tu cita**, haz clic en el siguiente enlace:
        </p>

        <div class="button-container">
            <a href="${budgetLink}" class="btn" style="color: #FFFFFF;" target="_blank">Revisar y Agendar Cita</a>
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

    const virtualCardHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Elena La Costurera — Luxury Pass</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@200;300;400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F0EDE8; margin: 0; padding: 24px; -webkit-font-smoothing: antialiased; }
    .card { 
      max-width: 360px; 
      margin: 0 auto; 
      background-color: #1A1A1A; 
      background-image: linear-gradient(to bottom, rgba(26, 26, 26, 0.25) 0%, rgba(26, 26, 26, 0.85) 60%, #1A1A1A 100%), url('/trabajos/model_desnuda_bw.png');
      background-size: cover;
      background-position: center;
      border-radius: 24px; 
      box-shadow: 0 25px 50px rgba(0,0,0,0.2); 
      border: 1px solid rgba(245, 242, 235, 0.15); 
      overflow: hidden; 
      position: relative; 
      color: #F5F5F0;
    }
    
    /* Clothing Tag Hole */
    .tag-hole { width: 12px; height: 12px; background-color: #F0EDE8; border-radius: 50%; margin: 28px auto 0 auto; opacity: 0.9; }
    
    .header { text-align: center; padding: 28px 20px 24px 20px; }
    
    .ticket-divider { border-top: 1px dashed rgba(245, 242, 235, 0.12); margin: 0; position: relative; }
    .notch-left, .notch-right { width: 16px; height: 16px; background-color: #F0EDE8; border-radius: 50%; position: absolute; top: -8px; }
    .notch-left { left: -9px; }
    .notch-right { right: -9px; }

    .body { padding: 36px 30px 40px 30px; text-align: center; }
    
    .pass-type { font-size: 8px; font-weight: 600; color: #C17F5F; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 4px 0; }
    .order-number { font-family: 'Playfair Display', Georgia, serif; font-size: 56px; font-weight: 300; color: #FFFFFF; margin: 0 0 28px 0; line-height: 1; letter-spacing: -2px; }
    
    .client-name { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-style: italic; font-weight: 400; color: #F5F5F0; margin: 0 0 36px 0; letter-spacing: 0.5px; }
    
    .details-section { margin-bottom: 40px; }
    
    .garment-line { font-size: 11px; font-weight: 400; color: #FFFFFF; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 4px 0; }
    .garment-cat { font-size: 8px; font-weight: 500; color: #8A857D; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 24px 0; }
    
    .price-value { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 300; color: #C17F5F; margin: 0 0 32px 0; }
    
    .delivery-info { border: 1px solid rgba(245, 242, 235, 0.1); border-radius: 2px; display: inline-block; padding: 12px 24px; background-color: rgba(255, 255, 255, 0.02); }
    .delivery-label { font-size: 7.5px; font-weight: 600; color: #8A857D; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 4px 0; }
    .delivery-val { font-size: 11px; font-weight: 400; color: #F5F5F0; letter-spacing: 1px; }

    .barcode-container { margin: 36px 0 12px 0; text-align: center; opacity: 0.7; }
    .barcode-line { display: inline-block; width: 1px; height: 24px; background-color: #F5F5F0; margin: 0 1px; }
    .barcode-text { font-size: 7.5px; color: #8A857D; letter-spacing: 4px; margin-top: 6px; text-transform: uppercase; }
    
    .coordinates { font-size: 8px; color: #8A857D; letter-spacing: 2.5px; margin-top: 28px; font-weight: 400; }
  </style>
</head>
<body>
  <div class="card">
    <div class="tag-hole"></div>
    
    <div class="header">
      <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; width: 130px; border-collapse: collapse;">
        <!-- ELENA Row -->
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
        <!-- Spacer -->
        <tr>
          <td style="padding-top: 8px; line-height: 1; font-size: 1px;">&nbsp;</td>
        </tr>
        <!-- LA COSTURERA Row -->
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
    
    <div class="ticket-divider">
      <div class="notch-left"></div>
      <div class="notch-right"></div>
    </div>
    
    <div class="body">
      <p class="pass-type">Ingreso Atelier</p>
      <h2 class="order-number">#${orderId}</h2>
      
      <p class="client-name">${customerName}</p>
      
      <div class="details-section">
        ${garmentsSectionHtml}
        
        <div class="delivery-info">
          <p class="delivery-label">Prueba / Retiro</p>
          <p class="delivery-val">${deliveryDateFormatted.split(',')[1] || deliveryDateFormatted} — ${deliveryTimeFormatted} hrs</p>
        </div>
      </div>
      
      <div class="barcode-container">
        <span class="barcode-line" style="width: 1px; height: 28px;"></span>
        <span class="barcode-line" style="width: 2px; height: 28px;"></span>
        <span class="barcode-line" style="width: 1px; height: 28px;"></span>
        <span class="barcode-line" style="width: 3px; height: 28px;"></span>
        <span class="barcode-line" style="width: 1px; height: 28px;"></span>
        <span class="barcode-line" style="width: 2px; height: 28px;"></span>
        <span class="barcode-line" style="width: 1px; height: 28px;"></span>
        <span class="barcode-line" style="width: 4px; height: 28px;"></span>
        <span class="barcode-line" style="width: 1.5px; height: 28px;"></span>
        <span class="barcode-line" style="width: 1px; height: 28px;"></span>
        <div class="barcode-text">ELENA*${orderId}*LA*COSTURERA</div>
      </div>
      
      <p class="coordinates">Av. Tabancura 1091 · Vitacura</p>
    </div>
  </div>
</body>
</html>`;

    return (
        <div style={{ backgroundColor: '#1A1A1A', minHeight: '100vh', color: 'white', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button 
                    onClick={() => setTab('confirmation')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: tab === 'confirmation' ? '#C17F5F' : '#333333',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '11px',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Confirmación de Pedido
                </button>
                <button 
                    onClick={() => setTab('budget')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: tab === 'budget' ? '#C17F5F' : '#333333',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '11px',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Presupuesto Formal
                </button>
                <button 
                    onClick={() => setTab('card')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: tab === 'card' ? '#C17F5F' : '#333333',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '11px',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Tarjeta Virtual
                </button>
            </div>
            
            <iframe
                srcDoc={tab === 'confirmation' ? confirmationHtml : tab === 'budget' ? budgetHtml : virtualCardHtml}
                title="Email Preview"
                style={{
                    width: '100%',
                    height: '800px',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    backgroundColor: 'white'
                }}
            />
        </div>
    );
}
