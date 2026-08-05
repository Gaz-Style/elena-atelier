const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

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

const smtpUser = process.env.SMTP_USER || '';
const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;

async function testSendDarkPaymentReceipt() {
    console.log("=== ENVIANDO COMPROBANTE DE PAGO PREMIUM OSCURO (payment_received.html) ===");
    
    const customerEmail = "mcruz1232@gmail.com";
    const customerName = "Antonia Castro";
    const amount = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(190000);
    const method = "Webpay Plus";
    const service = "Vestido de Novia (Abono Inicial)";

    // Cargar plantilla payment_received.html
    const templatePath = path.join(process.cwd(), 'src', 'lib', 'templates', 'emails', 'payment_received.html');
    if (!fs.existsSync(templatePath)) {
        console.error("No se encontró la plantilla HTML");
        return;
    }
    
    let html = fs.readFileSync(templatePath, 'utf-8');
    
    // Remplazar placeholders
    html = html.replace(/{{NAME}}/g, customerName);
    html = html.replace(/{{AMOUNT}}/g, amount);
    html = html.replace(/{{METHOD}}/g, method);
    html = html.replace(/{{SERVICE}}/g, service);

    const transporter = getTransporter();
    try {
        await transporter.sendMail({
            from: `"Pagos - Elena Atelier" <${fromAddress}>`,
            to: customerEmail,
            subject: 'Confirmación de Pago - Elena Atelier',
            html: html
        });
        console.log("✓ Comprobante premium oscuro enviado exitosamente a mcruz1232@gmail.com");
    } catch (e) {
        console.error("Fallo al enviar comprobante oscuro:", e);
    }
}

testSendDarkPaymentReceipt();
