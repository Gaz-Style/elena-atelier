require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

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

async function sendTestPOSReceipt() {
    const customerEmail = "mcruz1232@gmail.com";
    const customerName = "Prueba Usuario";
    const orderId = "BP-10025";
    const paymentMethod = "card";
    const total = 500000;
    const items = [
        { name: "Vestido de Novia", category: "Alta Costura", price: 500000, notes: "Diseño exclusivo" }
    ];
    
    // Mimic the exact generation in sendOrderConfirmationEmailAction
    const dbPaidAmount = 150000;
    const dbBalance = 350000;
    const originalTotal = total;

    const formatCurrency = (val) => {
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
              <td style="padding: 4px 0; text-align: left; font-size: 8px; font-weight: 600; color: #8A857D; letter-spacing: 2px; text-transform: uppercase; font-family: 'Inter', sans-serif;">Total Presupuestado</td>
              <td style="padding: 4px 0; text-align: right; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 300; color: #C17F5F;">
                ${formatCurrency(originalTotal)}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; text-align: left; font-size: 8px; font-weight: 600; color: #8A857D; letter-spacing: 2px; text-transform: uppercase; font-family: 'Inter', sans-serif;">Monto Abonado Hoy</td>
              <td style="padding: 4px 0; text-align: right; font-family: 'Playfair Display', Georgia, serif; font-size: 14px; font-weight: bold; color: #E5E0D8;">
                ${formatCurrency(dbPaidAmount)}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; text-align: left; font-size: 8px; font-weight: 600; color: #8A857D; letter-spacing: 2px; text-transform: uppercase; font-family: 'Inter', sans-serif;">Total Pagado Proyecto</td>
              <td style="padding: 4px 0; text-align: right; font-family: 'Playfair Display', Georgia, serif; font-size: 14px; font-weight: bold; color: #E5E0D8;">
                ${formatCurrency(dbPaidAmount)}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; text-align: left; font-size: 8px; font-weight: 600; color: #C17F5F; letter-spacing: 2px; text-transform: uppercase; font-family: 'Inter', sans-serif;">Saldo Pendiente</td>
              <td style="padding: 4px 0; text-align: right; font-family: 'Playfair Display', Georgia, serif; font-size: 14px; font-weight: bold; color: #C17F5F;">
                ${formatCurrency(dbBalance)}
              </td>
            </tr>
          </table>
        </div>
    `;

    const ticketHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
    <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F0EDE8; margin: 0; padding: 24px;">
      <div style="max-width: 380px; margin: 0 auto; background-color: #1A1A1A; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); border: 1px solid rgba(245, 242, 235, 0.1);">
        <div style="background-image: url('${cardBgUrl}'); background-size: cover; background-position: center; padding: 40px 24px; position: relative;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, rgba(26,26,26,0.3) 0%, rgba(26,26,26,0.95) 100%);"></div>
          <div style="position: relative; z-index: 2; text-align: center;">
            <p style="font-size: 8px; font-weight: 700; color: #C17F5F; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 12px 0;">Elena Atelier</p>
            <h2 style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 400; color: #FFFFFF; margin: 0; line-height: 1.2;">Ticket de Compra</h2>
          </div>
        </div>
        <div style="padding: 24px; background-color: #1A1A1A;">
          <div style="text-align: center; margin-bottom: 24px;">
            <p style="font-size: 10px; color: #8A857D; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Folio / Orden</p>
            <p style="font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 500; color: #F5F2EB; margin: 0; letter-spacing: 2px;">#${orderId}</p>
          </div>
          ${garmentsSectionHtml}
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px dashed rgba(245, 242, 235, 0.15);">
            <p style="font-size: 8px; color: #8A857D; letter-spacing: 2px; font-weight: 400;">Av. Tabancura 1091, Oficina 319 · Vitacura</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    const transporter = getTransporter();
    try {
        await transporter.sendMail({
            from: '"Pagos - Elena Atelier" <contacto@elenalacosturera.cl>',
            to: customerEmail,
            subject: 'Ticket de Compra - Elena Atelier',
            html: ticketHtml,
            attachments: attachments
        });
        console.log("Comprobante enviado exitosamente.");
    } catch (e) {
        console.error("Error enviando comprobante:", e);
    }
}

sendTestPOSReceipt();
