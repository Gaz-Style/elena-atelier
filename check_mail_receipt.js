const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

// Configuración SMTP de Gmail (Google Workspace)
const getTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

const emailLogoHtml = `
  <div style="text-align: center; margin-bottom: 20px;">
    <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: bold; color: #1A1A1A; letter-spacing: 2px;">ELENA</span>
    <div style="font-size: 9px; text-transform: uppercase; color: #A39E93; letter-spacing: 3px; margin-top: 5px; font-weight: 600;">ATELIER</div>
  </div>
`;

async function testSendMail() {
    console.log("=== ENVIANDO CORREO DE PRUEBA ===");
    
    const customerEmail = "mcruz1232@gmail.com";
    const customerName = "Marisol Rojas";
    const formattedAmount = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(100000);
    const cuotaName = "Abono Inicial (Reserva)";
    const paymentMethod = "Webpay Plus";

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F6F0; font-family: 'Inter', sans-serif;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8F6F0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #FCFAF7; border-radius: 4px; overflow: hidden; box-shadow: 0 20px 40px rgba(193,127,95,0.1); border: 1px solid #EAE6D7; border-top: 3px solid #C17F5F;">
          <tr>
            <td style="background-color: #FCFAF7; padding: 50px 40px; text-align: center;">
              ${emailLogoHtml}
              
              <div style="margin-top: 30px; margin-bottom: 25px; border-bottom: 1px solid rgba(193,127,95,0.15); padding-bottom: 20px;">
                <p style="color: #C17F5F; font-size: 8px; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 10px 0; font-weight: 600;">
                  RECIBO DE TRANSACCIÓN
                </p>
                <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #1A1A1A; font-size: 28px; font-weight: 400; margin: 0; letter-spacing: 0.5px; font-style: italic;">
                  Confirmación de Pago
                </h1>
              </div>

              <p style="color: #4A4A4A; font-size: 14px; line-height: 1.8; margin-bottom: 20px; font-weight: 300; max-width: 90%; margin-left: auto; margin-right: auto; text-align: left;">
                Estimada <strong style="color: #1A1A1A; font-weight: 600;">${customerName}</strong>,
              </p>
              
              <p style="color: #4A4A4A; font-size: 14px; line-height: 1.8; margin-bottom: 25px; font-weight: 300; max-width: 90%; margin-left: auto; margin-right: auto; text-align: left;">
                Hemos recibido exitosamente tu pago correspondiente a <strong>${cuotaName}</strong> por un monto de <strong>${formattedAmount}</strong> vía ${paymentMethod}.
              </p>

              <div style="background-color: #F5F5F0; padding: 20px; border-radius: 4px; max-width: 90%; margin: 0 auto 25px auto; text-align: left; border: 1px solid #EAE6D7;">
                <h4 style="margin: 0 0 10px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 14px; color: #1A1A1A; font-style: italic;">Detalles del Pago</h4>
                <table width="100%" style="font-size: 12px; color: #4A4A4A; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 4px 0; font-weight: bold;">Concepto:</td>
                    <td style="padding: 4px 0; text-align: right;">${cuotaName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-weight: bold;">Monto Recibido:</td>
                    <td style="padding: 4px 0; text-align: right; color: #C17F5F; font-weight: bold;">${formattedAmount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-weight: bold;">Medio de Pago:</td>
                    <td style="padding: 4px 0; text-align: right;">${paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-weight: bold;">Fecha:</td>
                    <td style="padding: 4px 0; text-align: right;">${new Date().toLocaleDateString('es-CL')}</td>
                  </tr>
                </table>
              </div>

              <p style="color: #4A4A4A; font-size: 13px; line-height: 1.8; margin-bottom: 20px; font-weight: 300; max-width: 90%; margin-left: auto; margin-right: auto; text-align: center;">
                Puedes revisar el estado actualizado de tu plan de pagos directamente en tu Portal Privado en cualquier momento.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #F5F5F0; padding: 30px 40px; text-align: center; border-top: 1px solid #EAE6D7;">
              <p style="color: #6B6660; font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0;">
                Vitacura, Santiago de Chile<br><br>
                © ${new Date().getFullYear()} ELENA LA COSTURERA | ATELIER
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const transporter = getTransporter();
    try {
        await transporter.sendMail({
            from: '"Elena Atelier" <contacto@elenalacosturera.cl>',
            to: customerEmail,
            subject: `Confirmación de Pago: ${cuotaName} - ${customerName}`,
            text: `Estimada ${customerName},\n\nHemos recibido exitosamente tu pago correspondiente a ${cuotaName} por un monto de ${formattedAmount} vía ${paymentMethod}.\n\nAtentamente,\nElena Atelier`,
            html: htmlContent
        });
        console.log("✓ Correo enviado exitosamente a mcruz1232@gmail.com via contacto@elenalacosturera.cl");
    } catch (e) {
        console.error("Fallo al enviar correo:", e);
    }
}

testSendMail();
