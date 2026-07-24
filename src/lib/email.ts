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
      from: `"Elena La Costurera" <${process.env.SMTP_USER}>`,
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
      from: `"Citas - Elena La Costurera" <${process.env.SMTP_USER}>`,
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
      from: `"Elena La Costurera" <${process.env.SMTP_USER}>`,
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
