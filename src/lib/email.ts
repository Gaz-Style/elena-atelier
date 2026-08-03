import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Setup Nodemailer transporter using Google Workspace SMTP settings from .env.local
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const smtpUser = process.env.SMTP_USER || '';
const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;

/**
 * Helper to load an HTML template and replace variables
 */
const loadTemplate = (templateName: string, variables: Record<string, string> = {}) => {
  try {
    const templatePath = path.join(process.cwd(), 'src', 'lib', 'templates', 'emails', templateName);
    let html = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace all placeholders like {{NAME}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    });
    
    return html;
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    return '';
  }
};

/**
 * Sends the welcome manifesto email to a new subscriber or client.
 */
export const sendWelcomeEmail = async (to: string, name: string) => {
  const html = loadTemplate('welcome.html', { NAME: name });
  
  if (!html) throw new Error('Template not found');

  try {
    const info = await transporter.sendMail({
      from: `"Elena La Costurera" <${fromAddress}>`,
      to,
      subject: 'Bienvenida a Elena La Costurera',
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
};

/**
 * Sends an appointment confirmation email.
 */
export const sendAppointmentConfirmation = async (to: string, name: string, date: string, time: string, service: string) => {
  const html = loadTemplate('appointment_scheduled.html', {
    NAME: name,
    DATE: date,
    TIME: time,
    SERVICE: service
  });
  
  if (!html) throw new Error('Template not found');

  try {
    const info = await transporter.sendMail({
      from: `"Citas - Elena La Costurera" <${fromAddress}>`,
      to,
      subject: `Tu cita para ${service} está confirmada`,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending appointment email:', error);
    return { success: false, error };
  }
};

/**
 * Sends a budget reminder / follow up email.
 */
export const sendBudgetReminder = async (to: string, name: string, link: string) => {
  const html = loadTemplate('budget_reminder.html', {
    NAME: name,
    LINK: link
  });
  
  if (!html) throw new Error('Template not found');

  try {
    const info = await transporter.sendMail({
      from: `"Elena La Costurera" <${fromAddress}>`,
      to,
      subject: 'Tu diseño a medida te está esperando',
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending budget reminder email:', error);
    return { success: false, error };
  }
};

/**
 * Sends a payment confirmation email.
 */
export const sendPaymentReceivedEmail = async (to: string, name: string, amount: string, method: string, service: string) => {
  const html = loadTemplate('payment_received.html', {
    NAME: name,
    AMOUNT: amount,
    METHOD: method,
    SERVICE: service
  });
  
  if (!html) throw new Error('Template not found');

  try {
    const info = await transporter.sendMail({
      from: `"Pagos - Elena La Costurera" <${fromAddress}>`,
      to,
      subject: 'Confirmación de Pago - Elena Atelier',
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error };
  }
};

/**
 * Sends an order ready notification email.
 */
export const sendOrderReadyEmail = async (to: string, name: string, item: string, hours: string) => {
  const html = loadTemplate('order_ready.html', {
    NAME: name,
    ITEM: item,
    HOURS: hours
  });
  
  if (!html) throw new Error('Template not found');

  try {
    const info = await transporter.sendMail({
      from: `"Taller - Elena La Costurera" <${fromAddress}>`,
      to,
      subject: 'Tu prenda está lista para retiro ✨ - Elena Atelier',
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending order ready email:', error);
    return { success: false, error };
  }
};

/**
 * Sends a general contact notification email.
 */
export const sendGeneralContactEmail = async (
  to: string,
  name: string,
  subject: string,
  message: string,
  headers?: Record<string, string>
) => {
  const html = loadTemplate('general_contact.html', {
    NAME: name,
    SUBJECT: subject,
    MESSAGE: message
  });
  
  if (!html) throw new Error('Template not found');

  try {
    const info = await transporter.sendMail({
      from: `"Elena La Costurera" <${fromAddress}>`,
      to,
      subject: subject || 'Mensaje de Elena Atelier',
      html,
      headers
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending general contact email:', error);
    return { success: false, error };
  }
};

/**
 * Sends a general luxury contact notification email with a background image.
 */
export const sendLuxuryContactEmail = async (
  to: string,
  name: string,
  subject: string,
  message: string,
  headers?: Record<string, string>
) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const attachments: any[] = [];
  let cardBgUrl = '';
  
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(process.cwd(), 'public', 'fiesta_gala_opt.jpg');
  if (fs.existsSync(filePath)) {
    attachments.push({
      filename: 'fiesta_gala_opt.jpg',
      path: filePath,
      cid: 'luxuryPassBg'
    });
    cardBgUrl = 'cid:luxuryPassBg';
  } else {
    cardBgUrl = `${siteUrl}/fiesta_gala_opt.jpg`;
  }

  const html = loadTemplate('luxury_contact.html', {
    NAME: name,
    SUBJECT: subject,
    MESSAGE: message,
    BACKGROUND_URL: cardBgUrl
  });
  
  if (!html) throw new Error('Template not found');

  try {
    const info = await transporter.sendMail({
      from: `"Elena La Costurera" <${fromAddress}>`,
      to,
      subject: subject || 'Mensaje de Elena Atelier',
      html,
      attachments,
      headers
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending luxury contact email:', error);
    return { success: false, error };
  }
};

/**
 * Sends a raw email containing full custom HTML (e.g. from template compilation).
 */
export const sendRawCustomEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
  headers?: Record<string, string>
) => {
  try {
    const info = await transporter.sendMail({
      from: `"Elena La Costurera" <${fromAddress}>`,
      to,
      subject: subject || 'Notificación - Elena Atelier',
      html: htmlContent,
      headers
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending raw custom email:', error);
    return { success: false, error };
  }
};

/**
 * Sends a raw email to multiple recipients in bulk/batches.
 */
export const sendBulkEmail = async (
  recipients: string[],
  subject: string,
  htmlContent: string
) => {
  const results = await Promise.all(
    recipients.map(async (to) => {
      try {
        const info = await transporter.sendMail({
          from: `"Elena La Costurera" <${fromAddress}>`,
          to,
          subject,
          html: htmlContent,
        });
        return { to, success: true, messageId: info.messageId };
      } catch (error) {
        console.error(`Error sending bulk email to ${to}:`, error);
        return { to, success: false, error };
      }
    })
  );
  return results;
};

/**
 * Sends a custom Luxury Pass invitation email.
 */
export const sendLuxuryPassEmail = async (
  to: string,
  name: string,
  subject: string,
  title: string,
  subtitle: string,
  field1Label: string,
  field1Value: string,
  field2Label: string,
  field2Value: string,
  details: string,
  barcodeText: string
) => {
  const html = loadTemplate('luxury_pass.html', {
    NAME: name,
    SUBJECT: subject,
    TITLE: title,
    SUBTITLE: subtitle,
    FIELD1_LABEL: field1Label,
    FIELD1_VALUE: field1Value,
    FIELD2_LABEL: field2Label,
    FIELD2_VALUE: field2Value,
    DETAILS: details,
    BARCODE_TEXT: barcodeText
  });
  
  if (!html) throw new Error('Template not found');

  try {
    const info = await transporter.sendMail({
      from: `"Luxury Pass - Elena La Costurera" <${fromAddress}>`,
      to,
      subject: subject || 'Tu Luxury Pass Exclusivo - Elena Atelier',
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending luxury pass email:', error);
    return { success: false, error };
  }
};


