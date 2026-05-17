'use server';

import nodemailer from 'nodemailer';

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
        <tr style="border-bottom: 1px solid #F3F4F6;">
            <td style="padding: 12px 8px; text-align: left; vertical-align: top;">
                <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1E293B;">${item.name}</p>
                <span style="font-size: 9px; text-transform: uppercase; color: #C36B53; font-weight: bold; letter-spacing: 1px;">${item.category}</span>
                ${item.notes ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #64748B; font-style: italic;">"${item.notes}"</p>` : ''}
            </td>
            <td style="padding: 12px 8px; text-align: right; vertical-align: top; font-size: 13px; font-weight: bold; color: #1E293B;">
                ${formatCurrency(item.price)}
            </td>
        </tr>
    `).join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Presupuesto Formal - Elena Atelier</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FBFBFA; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 4px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); }
            .header { background-color: #1A1A1A; padding: 40px; text-align: center; }
            .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: #F0E6DF; letter-spacing: 4px; margin: 0; font-weight: 300; text-transform: uppercase; }
            .subtitle { font-size: 9px; color: #C36B53; letter-spacing: 2px; text-transform: uppercase; margin: 6px 0 0 0; font-weight: 700; }
            .body { padding: 40px; }
            .greeting { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; color: #1A1A1A; margin-top: 0; margin-bottom: 12px; }
            .lead-text { font-size: 13px; color: #4A4A4A; line-height: 1.6; margin-bottom: 24px; }
            .table-container { margin-bottom: 30px; }
            .button-container { text-align: center; margin: 35px 0; }
            .btn { display: inline-block; background-color: #C36B53; color: #FFFFFF !important; text-decoration: none; padding: 16px 32px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; }
            .footer { background-color: #FBFBFA; padding: 30px 40px; text-align: center; border-top: 1px solid #EAEAEA; }
            .footer-text { font-size: 11px; color: #8A8A8A; line-height: 1.5; margin: 0; }
            .footer-signature { font-family: Georgia, serif; font-style: italic; color: #C36B53; font-size: 14px; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="logo">Elena Atelier</h1>
                <p class="subtitle">Alta Costura & Confección</p>
            </div>
            <div class="body">
                <h2 class="greeting">Estimada ${customerName},</h2>
                <p class="lead-text">
                    Es un placer saludarte. Hemos preparado el presupuesto formal detallado para tu próximo proyecto de vestuario y alta costura. 
                    A continuación encontrarás el desglose de los servicios solicitados:
                </p>
                
                <div class="table-container">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid #1A1A1A;">
                                <th style="padding: 12px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #4A4A4A;">Detalle del Servicio</th>
                                <th style="padding: 12px 8px; text-align: right; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #4A4A4A;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRowsHtml}
                            <tr style="background-color: #FBFBFA; font-weight: bold;">
                                <td style="padding: 16px 8px; text-align: left; font-size: 13px; color: #1A1A1A;">Total Estimado</td>
                                <td style="padding: 16px 8px; text-align: right; font-size: 16px; color: #C36B53;">${formatCurrency(total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p class="lead-text" style="margin-bottom: 10px;">
                    Para ver los detalles completos del diseño, registrar tus observaciones o <strong>aprobar y pagar este presupuesto de forma 100% digital</strong>, haz clic en el siguiente botón:
                </p>

                <div class="button-container">
                    <a href="${budgetLink}" class="btn" style="color: #FFFFFF;" target="_blank">Ver Presupuesto Interactivo</a>
                </div>

                <p style="font-size: 11px; color: #8A8A8A; text-align: center; margin-top: 10px;">
                    Si no puedes abrir el botón, copia y pega este enlace en tu navegador: <br>
                    <a href="${budgetLink}" style="color: #C36B53; text-decoration: underline;">${budgetLink}</a>
                </p>
            </div>
            
            <div class="footer">
                <p class="footer-text">Av. Tabancura 1091, Vitacura</p>
                <p class="footer-text" style="margin-top: 4px;">${smtpUser}</p>
                <p class="footer-signature">Elena Rojas</p>
            </div>
        </div>
    </body>
    </html>
    `;

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
    } catch (err: any) {
        console.error('Error al enviar correo por SMTP de Google:', err);
        return { success: false, error: err.message };
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
}) {
    const { customerEmail, customerName, orderId, items, total, paymentMethod, date } = payload;

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

    const itemsRowsHtml = items.map((item) => `
        <tr style="border-bottom: 1px solid #F3F4F6;">
            <td style="padding: 12px 8px; text-align: left; vertical-align: top;">
                <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1E293B;">${item.name}</p>
                <span style="font-size: 9px; text-transform: uppercase; color: #C36B53; font-weight: bold; letter-spacing: 1px;">${item.category}</span>
                ${item.notes ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #64748B; font-style: italic;">"${item.notes}"</p>` : ''}
                
                ${item.images && item.images.length > 0 ? `
                    <div style="margin-top: 15px; border-top: 1px dashed #E5E7EB; padding-top: 10px;">
                        <p style="margin: 0 0 8px 0; font-size: 9px; text-transform: uppercase; font-weight: bold; color: #C36B53; letter-spacing: 0.5px;">Registro Fotográfico (${item.images.length})</p>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td>
                                    ${item.images.map((img) => `
                                        <div style="display: inline-block; vertical-align: top; margin-right: 12px; margin-bottom: 12px; background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: 6px; border-radius: 2px; width: 100px; text-align: center;">
                                            <div style="width: 100px; height: 100px; overflow: hidden; background-color: #F8FAFC; text-align: center; line-height: 100px; border-radius: 1px;">
                                                <img src="${img.url}" style="max-width: 100px; max-height: 100px; vertical-align: middle; display: inline-block;" alt="Registro" />
                                            </div>
                                            ${img.notes ? `<p style="margin: 5px 0 0 0; font-size: 8px; color: #64748B; font-style: italic; line-height: 1.2; word-break: break-word;">"${img.notes}"</p>` : ''}
                                        </div>
                                    `).join('')}
                                </td>
                            </tr>
                        </table>
                    </div>
                ` : ''}
            </td>
            <td style="padding: 12px 8px; text-align: right; vertical-align: top; font-size: 13px; font-weight: bold; color: #1E293B;">
                ${formatCurrency(item.price)}
            </td>
        </tr>
    `).join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Confirmación de Orden de Trabajo - Elena Atelier</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FBFBFA; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 4px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); }
            .header { background-color: #1A1A1A; padding: 40px; text-align: center; }
            .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: #F0E6DF; letter-spacing: 4px; margin: 0; font-weight: 300; text-transform: uppercase; }
            .subtitle { font-size: 9px; color: #C36B53; letter-spacing: 2px; text-transform: uppercase; margin: 6px 0 0 0; font-weight: 700; }
            .body { padding: 40px; }
            .greeting { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; color: #1A1A1A; margin-top: 0; margin-bottom: 12px; }
            .lead-text { font-size: 13px; color: #4A4A4A; line-height: 1.6; margin-bottom: 24px; }
            .table-container { margin-bottom: 30px; }
            .footer { background-color: #FBFBFA; padding: 30px 40px; text-align: center; border-top: 1px solid #EAEAEA; }
            .footer-text { font-size: 11px; color: #8A8A8A; line-height: 1.5; margin: 0; }
            .footer-signature { font-family: Georgia, serif; font-style: italic; color: #C36B53; font-size: 14px; margin-top: 15px; }
            .meta-box { background-color: #FBFBFA; border: 1px solid #EAEAEA; padding: 15px; margin-bottom: 25px; border-radius: 2px; }
            .meta-item { font-size: 12px; color: #4A4A4A; margin-bottom: 6px; }
            .meta-item strong { color: #1A1A1A; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="logo">Elena Atelier</h1>
                <p class="subtitle">Alta Costura & Confección</p>
            </div>
            <div class="body">
                <h2 class="greeting">Estimada ${customerName},</h2>
                <p class="lead-text">
                    ¡Tu orden de trabajo ha sido ingresada con éxito a nuestro atelier! Ya se encuentra en manos de nuestras artesanas expertas.
                    A continuación te enviamos el comprobante y detalle de los servicios contratados:
                </p>
                
                <div class="meta-box">
                    <div class="meta-item"><strong>Número de Orden:</strong> #${orderId}</div>
                    <div class="meta-item"><strong>Fecha de Ingreso:</strong> ${date}</div>
                    <div class="meta-item"><strong>Método de Pago:</strong> ${paymentMethod === 'card' ? 'Mercado Pago' : 'Efectivo / Transferencia'}</div>
                </div>

                <div class="table-container">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid #1A1A1A;">
                                <th style="padding: 12px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #4A4A4A;">Detalle del Servicio</th>
                                <th style="padding: 12px 8px; text-align: right; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #4A4A4A;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsRowsHtml}
                            <tr style="background-color: #FBFBFA; font-weight: bold;">
                                <td style="padding: 16px 8px; text-align: left; font-size: 13px; color: #1A1A1A;">Total Pagado</td>
                                <td style="padding: 16px 8px; text-align: right; font-size: 16px; color: #C36B53;">${formatCurrency(total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p class="lead-text">
                    Te notificaremos de inmediato en cuanto tu prenda esté lista y pase nuestro control de calidad artesanal para que puedas retirarla o coordinar el despacho.
                </p>
            </div>
            
            <div class="footer">
                <p class="footer-text">Av. Tabancura 1091, Vitacura</p>
                <p class="footer-text" style="margin-top: 4px;">contacto@elenalacosturera.cl</p>
                <p class="footer-signature">Elena Rojas</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;
        const info = await transporter.sendMail({
            from: `"Elena Atelier" <${fromAddress}>`,
            to: customerEmail,
            subject: `Confirmación de Orden #${orderId} - Elena Atelier 👗`,
            html: htmlContent,
        });

        console.log('Correo de confirmación enviado:', info.messageId);
        return { success: true };
    } catch (err: any) {
        console.error('Error al enviar correo por SMTP de Google:', err);
        return { success: false, error: err.message };
    }
}
