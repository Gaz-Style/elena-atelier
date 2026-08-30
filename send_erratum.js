const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const smtpUser = process.env.SMTP_USER || '';
const smtpPassword = process.env.SMTP_PASSWORD || '';

if (!smtpUser || !smtpPassword) {
    console.error('Faltan variables SMTP_USER o SMTP_PASSWORD.');
    process.exit(1);
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

const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;

const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Elena Atelier — Fe de Erratas</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@200;300;400;500;600&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F0EDE8; margin: 0; padding: 24px; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 420px; margin: 0 auto; background-color: #1A1A1A; border-radius: 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.2); border: 1px solid rgba(245, 242, 235, 0.15); overflow: hidden; color: #F5F5F0; padding: 40px 30px;">
    
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 30px;">
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

    <div style="border-bottom: 1px dashed rgba(255,255,255,0.15); margin: 20px 0;"></div>

    <p style="font-size: 8px; font-weight: 600; color: #C17F5F; letter-spacing: 5px; text-transform: uppercase; margin: 0 0 10px 0; font-family: 'Inter', sans-serif; text-align: center;">Comunicado Oficial</p>
    
    <p style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-style: italic; font-weight: 400; color: #F5F5F0; margin: 0 0 24px 0; text-align: center; letter-spacing: 0.5px;">Rectificación de Comprobante</p>

    <div style="font-size: 13px; line-height: 1.6; color: #CECAC2; text-align: justify; font-weight: 300;">
      <p>Estimado Felipe Ward,</p>
      <p>Le escribimos para realizar una fe de erratas respecto al correo enviado anteriormente de la orden <strong>#65504</strong>.</p>
      
      <p>Debido a una intermitencia temporal en la actualización de nuestro sistema de facturación en línea, se le despachó de forma automática un comprobante que indicaba erróneamente un saldo pendiente del 50%.</p>
      
      <p>Queremos rectificar y confirmar que su pago por el total de la venta de <strong>$129.500 CLP</strong> fue recibido y procesado correctamente hoy a las <strong>11:22 AM</strong>. Su cuenta y su orden de taller se encuentran <strong>completamente pagadas y sin ningún saldo pendiente respecto a esa orden de trabajo</strong>.</p>
      
      <p>Lamentamos cualquier molestia o confusión que este envío automático del sistema le haya podido causar.</p>
    </div>

    <div style="margin-top: 30px; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 20px; text-align: center;">
      <p style="font-style: italic; font-size: 14px; color: #E5E0D8; margin: 0 0 4px 0;">Con cariño,</p>
      <p style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #FFFFFF; margin: 0 0 4px 0; font-weight: normal; letter-spacing: 1px;">ELENA R.</p>
      <p style="font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #8A857D; margin: 0;">ELENA La Costurera</p>
    </div>

    <p style="font-size: 8px; color: #8A857D; letter-spacing: 2.5px; margin-top: 36px; font-weight: 400; font-family: 'Inter', sans-serif; text-align: center;">Av. Tabancura 1091 · Vitacura</p>
  </div>
</body>
</html>
`;

async function main() {
    console.log("Sending corrected erratum email to Felipeward1409@gmail.com with total amount...");
    try {
        const info = await transporter.sendMail({
            from: `"ELENA Atelier" <${fromAddress}>`,
            to: 'Felipeward1409@gmail.com',
            subject: 'Rectificación de Pago de Saldo (Fe de Erratas) - Orden #65504 - ELENA Atelier',
            html: htmlContent,
        });
        console.log('Email sent successfully! Message ID:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        process.exit(1);
    }
}

main();
