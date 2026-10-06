import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

async function getTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
}

async function main() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const projectId = '194f071a-61b6-4ee2-a8cb-1b6a799b1403';
    
    const { data: project } = await supabase.from('bridal_projects').select('*, customers(full_name)').eq('id', projectId).single();
    const { data: woData } = await supabase.from('work_orders').select('*').eq('legacy_bridal_project_id', projectId).single();

    const customerName = project.customers?.full_name || 'Clienta';
    const testEmail = 'mcruz1232@gmail.com';
    
    // THE REAL VALUES:
    const total = woData.total_amount || 0; // 120,000
    const paidSoFar = woData.paid_amount || 0; // 60,000
    const balance = Math.max(0, total - paidSoFar); // 60,000
    
    // REAL CURRENT PAYMENT
    const currentPaymentAmount = 60000;
    const formattedAmount = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(currentPaymentAmount);
    const paymentMethod = 'Webpay Plus';
    const cuotaName = 'Abono Inicial (50%)';

    const dateStr = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
    
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Elena La Costurera — Comprobante de Pago</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@200;300;400;500;600&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F0EDE8; margin: 0; padding: 24px;">
  <div style="max-width: 360px; margin: 0 auto; background-color: #1A1A1A; border-radius: 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.2); overflow: hidden; color: #F5F5F0; padding: 20px;">
    
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="font-family:'Playfair Display', serif; color: white; margin:0;">ELENA</h1>
      <p style="font-size: 10px; color: gray; letter-spacing: 2px;">LA COSTURERA</p>
    </div>

    <div style="text-align: center;">
      <p style="font-size: 8px; font-weight: 600; color: #C17F5F; letter-spacing: 3px; text-transform: uppercase;">Comprobante de Pago (Copia de Prueba)</p>
      <p style="font-size: 11px; color: #C17F5F;">Folio #${projectId.substring(0,8).toUpperCase()}</p>
      <h2 style="font-family: 'Playfair Display', serif; font-size: 26px; font-style: italic;">${customerName}</h2>
      
      <p style="font-size: 12px;">Vestido de Graduación (${cuotaName}) · <span style="color: #C17F5F;">${paymentMethod}</span></p>
      <h3 style="font-size: 18px; color: white;">${formattedAmount}</h3>

      <hr style="border-color: #333; margin: 20px 0;">

      <table width="100%" style="font-size: 11px; color: gray;">
        <tr><td align="left">Total Presupuestado</td><td align="right">$${total.toLocaleString('es-CL')}</td></tr>
        <tr><td align="left">Monto Abonado Hoy</td><td align="right">$${currentPaymentAmount.toLocaleString('es-CL')}</td></tr>
        <tr><td align="left">Total Pagado Proyecto</td><td align="right">$${paidSoFar.toLocaleString('es-CL')}</td></tr>
        <tr><td align="left" style="color: #C17F5F;">Saldo Pendiente</td><td align="right" style="color: #C17F5F;">$${balance.toLocaleString('es-CL')}</td></tr>
      </table>

      <p style="font-size: 9px; margin-top: 30px;">${dateStr}</p>
    </div>
  </div>
</body>
</html>`;

    const transporter = await getTransporter();
    await transporter.sendMail({
        from: '"Elena Atelier" <contacto@elenalacosturera.cl>',
        to: testEmail,
        subject: `[PRUEBA] Confirmación de Pago Recibido — ${customerName}`,
        text: `Esto es una prueba.`,
        html: htmlContent
    });
    
    console.log('Correo de prueba enviado a ' + testEmail);
}

main();
