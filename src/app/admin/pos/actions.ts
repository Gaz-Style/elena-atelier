'use server';

import nodemailer from 'nodemailer';
import { createClient } from '@/lib/supabase/server';

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
    try {
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

        const allImages = items.reduce((acc, item) => {
            if (item.images && item.images.length > 0) {
                item.images.forEach(img => {
                    acc.push({ url: img.url, notes: img.notes || '', itemName: item.name });
                });
            }
            return acc;
        }, [] as { url: string; notes: string; itemName: string }[]);

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Confirmación de Orden de Trabajo - ELENA La Costurera</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FBFBFA; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
            <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 4px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);">
                
                <!-- HEADER -->
                <div class="email-header" style="background-color: #1A1A1A; padding: 40px; text-align: center; border-bottom: 3px solid #C36B53;">
                    <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; color: #F0E6DF; letter-spacing: 4px; margin: 0; font-weight: 300; text-transform: uppercase;">ELENA La Costurera</h1>
                    <p style="font-size: 9px; color: #C36B53; letter-spacing: 2px; text-transform: uppercase; margin: 6px 0 0 0; font-weight: 700;">Alta Costura & Confección a Medida</p>
                </div>

                <!-- MENSAJE -->
                <section class="email-intro" style="padding: 40px 40px 20px 40px;">
                    <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; color: #1A1A1A; margin-top: 0; margin-bottom: 15px; font-weight: normal; text-align: left;">Estimada ${customerName},</h2>
                    <p style="font-size: 13px; color: #4A4A4A; line-height: 1.6; margin: 0; text-align: left;">
                        Tu prenda ya forma parte del atelier.
                        Hemos registrado correctamente tu ingreso y a continuación encontrarás
                        el resumen del trabajo solicitado y el comprobante asociado.
                    </p>
                </section>

                <!-- INFORMACIÓN -->
                <section class="order-box" style="padding: 0 40px 25px 40px;">
                    <table style="width: 100%; border-collapse: collapse; background-color: #FBFBFA; border: 1px solid #EAEAEA; border-radius: 2px;">
                        <tr>
                            <td style="padding: 15px; border-right: 1px solid #EAEAEA; text-align: center; width: 33.33%;">
                                <span style="display: block; font-size: 8px; text-transform: uppercase; letter-spacing: 1px; color: #8A8A8A; margin-bottom: 4px;">Número de Orden</span>
                                <strong style="font-size: 14px; color: #1A1A1A; font-family: Georgia, serif;">#${orderId}</strong>
                            </td>
                            <td style="padding: 15px; border-right: 1px solid #EAEAEA; text-align: center; width: 33.33%;">
                                <span style="display: block; font-size: 8px; text-transform: uppercase; letter-spacing: 1px; color: #8A8A8A; margin-bottom: 4px;">Fecha de Ingreso</span>
                                <strong style="font-size: 13px; color: #1A1A1A; font-family: Georgia, serif;">${date}</strong>
                            </td>
                            <td style="padding: 15px; text-align: center; width: 33.33%;">
                                <span style="display: block; font-size: 8px; text-transform: uppercase; letter-spacing: 1px; color: #8A8A8A; margin-bottom: 4px;">Forma de Pago</span>
                                <strong style="font-size: 11px; color: #1A1A1A; text-transform: capitalize;">${paymentMethod === 'card' ? 'Mercado Pago' : 'Efectivo / Transferencia'}</strong>
                            </td>
                        </tr>
                    </table>
                </section>

                <!-- SERVICIO -->
                <section class="service-section" style="padding: 0 40px 25px 40px;">
                    <h3 style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #C36B53; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #EAEAEA; padding-bottom: 6px; font-weight: bold; text-align: left;">Trabajo Encomendado</h3>
                    ${items.map((item) => `
                        <div class="service-card" style="background-color: #FBFBFA; border: 1px solid #EAEAEA; padding: 15px; border-radius: 2px; margin-bottom: 12px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="vertical-align: top; text-align: left;">
                                        <strong style="font-family: Georgia, serif; font-size: 14px; color: #1A1A1A; font-weight: bold; display: block;">${item.name}</strong>
                                        <span style="display: inline-block; font-size: 8px; color: #C36B53; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; margin-top: 4px;">${item.category}</span>
                                        ${item.notes ? `<p style="margin: 8px 0 0 0; font-size: 11px; color: #64748B; font-style: italic; line-height: 1.4;">"${item.notes}"</p>` : ''}
                                    </td>
                                    <td style="text-align: right; vertical-align: top; width: 100px; font-weight: bold; color: #1A1A1A; font-size: 13px; font-family: Georgia, serif; padding-left: 10px;">
                                        ${formatCurrency(item.price)}
                                    </td>
                                </tr>
                            </table>
                        </div>
                    `).join('')}
                </section>

                <!-- REGISTRO -->
                ${allImages.length > 0 ? `
                <section class="atelier-log" style="padding: 0 40px 25px 40px;">
                    <h3 style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #C36B53; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #EAEAEA; padding-bottom: 6px; font-weight: bold; text-align: left;">Bitácora del Atelier</h3>
                    <div style="background-color: #FBFBFA; border: 1px solid #EAEAEA; padding: 15px 15px 3px 15px; border-radius: 2px; text-align: left;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="text-align: left; padding: 0;">
                                    ${allImages.map((img) => `
                                        <div style="display: inline-block; vertical-align: top; margin-right: 12px; margin-bottom: 12px; background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: 6px; border-radius: 2px; width: 130px; text-align: center;">
                                            <div style="width: 130px; height: 130px; overflow: hidden; background-color: #F8FAFC; text-align: center; border-radius: 1px; margin-bottom: 6px;">
                                                <img src="${img.url}" style="width: 100%; height: 100%; object-fit: cover;" alt="Registro de ingreso atelier" />
                                            </div>
                                            <p style="margin: 0; font-size: 8px; text-transform: uppercase; color: #8A8A8A; font-weight: bold; letter-spacing: 0.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${img.itemName}</p>
                                            ${img.notes ? `<p style="margin: 4px 0 0 0; font-size: 9px; color: #64748B; font-style: italic; line-height: 1.2; word-break: break-word;">"${img.notes}"</p>` : ''}
                                        </div>
                                    `).join('')}
                                </td>
                            </tr>
                        </table>
                    </div>
                </section>
                ` : ''}

                <!-- TOTAL -->
                <section class="payment-total" style="padding: 0 40px 25px 40px;">
                    <table style="width: 100%; border-collapse: collapse; background-color: #FBFBFA; border: 1px solid #C36B53; border-radius: 2px;">
                        <tr>
                            <td style="padding: 15px; text-align: left;">
                                <span style="font-size: 8px; text-transform: uppercase; color: #8A8A8A; display: block; letter-spacing: 1px; margin-bottom: 2px;">Total Registrado</span>
                                <strong style="font-family: Georgia, serif; font-size: 14px; font-weight: bold; color: #1A1A1A;">Total del Servicio</strong>
                            </td>
                            <td style="padding: 15px; text-align: right; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #C36B53; font-weight: bold;">
                                ${formatCurrency(total)}
                            </td>
                        </tr>
                    </table>
                </section>

                <!-- CIERRE + GOOGLE REVIEWS -->
                <section class="closing-message" style="padding: 0 40px 25px 40px; text-align: center;">
                    <p style="font-size: 12px; color: #4A4A4A; line-height: 1.6; margin: 0 0 30px 0; font-style: italic;">
                        Te contactaremos personalmente cuando tu prenda esté lista para prueba,
                        retiro o siguientes ajustes dentro del proceso.
                    </p>

                    <!-- GOOGLE REVIEW CARD -->
                    <div style="padding: 25px; background-color: #FBFBFA; border: 1px dashed #C36B53; border-radius: 2px; text-align: center;">
                        <p style="margin: 0 0 8px 0; font-family: Georgia, serif; font-size: 15px; color: #1A1A1A; font-style: italic; font-weight: 500;">Tu opinión es nuestro mayor orgullo</p>
                        <p style="margin: 0 0 15px 0; font-size: 11px; color: #64748B; line-height: 1.5;">Te invitamos a ver nuestra ubicación y conocer la experiencia de otras clientas en Google. Al retirar tu prenda, tu opinión será de gran valor para mantener nuestra tradición de excelencia.</p>
                        <a href="https://g.page/r/Cfv2lRZLdYUuEBM/review" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #1A1A1A; color: #F0E6DF; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; border-radius: 2px;">Ver Ficha y Opiniones en Google</a>
                    </div>
                </section>

                <!-- FOOTER -->
                <footer class="email-footer" style="background-color: #1A1A1A; padding: 40px; text-align: center; border-top: 1px solid #EAEAEA;">
                    <strong style="font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: #F0E6DF; letter-spacing: 2px; text-transform: uppercase; font-weight: normal; display: block; margin-bottom: 5px;">ELENA La Costurera</strong>
                    <p style="font-size: 11px; color: #8A8A8A; margin: 0 0 4px 0;">Av. Tabancura 1091 · Vitacura</p>
                    <a href="mailto:contacto@elenalacosturera.cl" style="font-size: 11px; color: #C36B53; text-decoration: none; display: block; margin-bottom: 10px;">contacto@elenalacosturera.cl</a>
                    <span style="font-size: 8px; text-transform: uppercase; letter-spacing: 1px; color: #8A8A8A; display: block;">Atelier de Alta Costura & Oficio Textil</span>
                </footer>

            </div>
        </body>
        </html>
        `;

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
        return { success: false, error: err.message || String(err) };
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
