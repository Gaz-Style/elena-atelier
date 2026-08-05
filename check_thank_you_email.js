const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

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

async function testSendThankYouMail() {
    console.log("=== ENVIANDO COMPROBANTE DE NOVIA (AGRADECIMIENTO / RESERVA) ===");
    
    const customerEmail = "mcruz1232@gmail.com";
    const customerName = "Marisol Rojas";

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background-color: #F8F6F0; font-family: 'Inter', sans-serif;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8F6F0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #FCFAF7; border-radius: 4px; overflow: hidden; box-shadow: 0 20px 40px rgba(193,127,95,0.1); border: 1px solid #EAE6D7;">
          <!-- Content Body -->
          <tr>
            <td style="background-color: #FCFAF7; padding: 50px 40px; text-align: center;">
              ${emailLogoHtml}
              <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #1A1A1A; font-size: 28px; font-weight: 400; margin: 30px 0 20px 0; letter-spacing: 0.5px; font-style: italic;">
                ¡Gracias por Elegirnos!
              </h1>
              <p style="color: #4A4A4A; font-size: 14px; line-height: 1.8; margin-bottom: 20px; font-weight: 300; max-width: 90%; margin-left: auto; margin-right: auto;">
                Te damos la bienvenida, <i style="color: #1A1A1A;">${customerName}</i>, hemos recibido exitosamente la firma de tu contrato y el abono inicial. Tu cupo de producción ya está oficialmente reservado en nuestro atelier.
              </p>
              <p style="color: #4A4A4A; font-size: 14px; line-height: 1.8; margin-bottom: 20px; font-weight: 300; max-width: 90%; margin-left: auto; margin-right: auto;">
                En los próximos días nos contactaremos contigo para agendar tu primera prueba. ¡Estamos muy emocionados de comenzar este proceso y confeccionar el vestido de tus sueños!
              </p>
            </td>
          </tr>
          <!-- Footer -->
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
            from: '"Elena Atelier" <elenaatalier@gmail.com>',
            to: customerEmail,
            subject: `¡Reserva Confirmada! Gracias por elegir Elena Atelier`,
            text: `Te damos la bienvenida, ${customerName},\nHemos recibido exitosamente la firma de tu contrato y el abono inicial. Tu cupo de producción ya está oficialmente reservado en nuestro atelier.\n\nEn los próximos días nos contactaremos contigo para agendar tu primera prueba.\n\nAtentamente,\nElena Atelier`,
            html: htmlContent
        });
        console.log("✓ Comprobante de Agradecimiento/Reserva enviado exitosamente a mcruz1232@gmail.com via elenaatalier@gmail.com");
    } catch (e) {
        console.error("Fallo al enviar comprobante:", e);
    }
}

testSendThankYouMail();
