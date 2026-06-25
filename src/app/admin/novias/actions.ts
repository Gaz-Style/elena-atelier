'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';
import { headers } from 'next/headers';
// ─── Types ───────────────────────────────────────────────────
type ProjectType = 'novia' | 'madrina' | 'graduacion';
type ServiceType = 'modificacion_tienda' | 'vestido_propio' | 'bespoke';
type ProjectStatus = 'consulta' | 'contrato_pendiente' | 'en_proceso' | 'prueba_1' | 'prueba_2' | 'prueba_final' | 'entregado' | 'cancelado';

// ─── Helpers ─────────────────────────────────────────────────

async function getSiteUrl() {
    if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
    try {
        const headersList = await headers();
        const host = headersList.get('x-forwarded-host') || headersList.get('host');
        if (host && !host.includes('localhost')) {
            const protocol = headersList.get('x-forwarded-proto') || 'https';
            return `${protocol}://${host}`;
        }
    } catch(e) {}
    // Force production URL when generating emails from localhost admin panel
    return 'https://elenalacosturera.cl';
}

function getAdminClient() {
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

/** Calculate milestone dates backwards from event date */
function calculateMilestoneDates(eventDate: Date): { type: string; title: string; weeksBeforeEvent: number; requiredPayment: number }[] {
    return [
        { type: 'toma_medidas', title: 'Prueba 1 — Toma de Medidas y Diseño', weeksBeforeEvent: 12, requiredPayment: 0 },
        { type: 'prueba_estructura', title: 'Prueba 2 — Estructura y Calce Base', weeksBeforeEvent: 8, requiredPayment: 0 },
        { type: 'prueba_ajustes', title: 'Prueba 3 — Ajustes y Detalles', weeksBeforeEvent: 5, requiredPayment: 0 },
        { type: 'prueba_final', title: 'Prueba 4 — Prueba Final (Milimétrica)', weeksBeforeEvent: 3, requiredPayment: 0 },
        { type: 'entrega', title: 'Entrega Final', weeksBeforeEvent: 1, requiredPayment: 0 },
    ];
}

// ─── CRUD Operations ─────────────────────────────────────────

export async function getBridalProjects(filters?: { status?: string; projectType?: string }) {
    const supabase = getAdminClient();
    
    let query = supabase
        .from('bridal_projects')
        .select('*, customers(id, full_name, email, phone)')
        .order('event_date', { ascending: true });
    
    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }
    if (filters?.projectType && filters.projectType !== 'all') {
        query = query.eq('project_type', filters.projectType);
    }
    
    const { data, error } = await query;
    
    if (error) {
        console.error('Error fetching bridal projects:', error);
        return [];
    }
    return data || [];
}

export async function getBridalProjectById(id: string) {
    const supabase = getAdminClient();
    
    const [projectRes, milestonesRes, measurementsRes] = await Promise.all([
        supabase
            .from('bridal_projects')
            .select('*, customers(id, full_name, email, phone, rut, measurements)')
            .eq('id', id)
            .single(),
        supabase
            .from('bridal_milestones')
            .select('*')
            .eq('project_id', id)
            .order('scheduled_date', { ascending: true }),
        supabase
            .from('bridal_measurements')
            .select('*')
            .eq('project_id', id)
            .order('created_at', { ascending: true }),
    ]);
    
    if (projectRes.error) {
        console.error('Error fetching bridal project:', projectRes.error);
        return null;
    }
    
    return {
        ...projectRes.data,
        milestones: milestonesRes.data || [],
        measurements: measurementsRes.data || [],
    };
}

export async function createBridalProject(formData: FormData) {
    const supabase = getAdminClient();
    
    const customerId = formData.get('customer_id') as string;
    const projectType = formData.get('project_type') as ProjectType;
    const serviceType = formData.get('service_type') as ServiceType;
    const eventDateStr = formData.get('event_date') as string;
    const eventVenue = formData.get('event_venue') as string;
    const totalAmount = parseInt(formData.get('total_amount') as string) || 0;
    const description = formData.get('description') as string;
    const materialsNotes = formData.get('materials_notes') as string;
    const contractNotes = formData.get('contract_notes') as string;
    
    // Calculate payment splits: 50% / 25% / 25%
    const payment1 = Math.round(totalAmount * 0.5);
    const payment2 = Math.round(totalAmount * 0.25);
    const payment3 = totalAmount - payment1 - payment2; // Remainder to avoid rounding issues
    
    const eventDate = eventDateStr ? new Date(`${eventDateStr}T12:00:00-04:00`) : null;
    
    // 1. Create the project
    const { data: project, error: projError } = await supabase
        .from('bridal_projects')
        .insert([{
            customer_id: customerId || null,
            project_type: projectType,
            service_type: serviceType,
            event_date: eventDate?.toISOString() || null,
            event_venue: eventVenue || null,
            total_amount: totalAmount,
            payment_1_amount: payment1,
            payment_2_amount: payment2,
            payment_3_amount: payment3,
            description: description || null,
            materials_notes: materialsNotes || null,
            contract_notes: contractNotes || null,
            status: 'contrato_pendiente',
        }])
        .select()
        .single();
    
    if (projError || !project) {
        console.error('Error creating bridal project:', projError);
        return { success: false, error: projError?.message || 'Error al crear el proyecto' };
    }
    
    // 2. Generate milestones from event date
    if (eventDate) {
        const milestoneTemplates = calculateMilestoneDates(eventDate);
        const milestoneInserts = milestoneTemplates.map(m => {
            const scheduledDate = new Date(eventDate);
            scheduledDate.setDate(scheduledDate.getDate() - (m.weeksBeforeEvent * 7));
            
            return {
                project_id: project.id,
                milestone_type: m.type,
                title: m.title,
                scheduled_date: scheduledDate.toISOString(),
                status: 'pending',
                required_payment: m.requiredPayment,
            };
        });
        
        const { error: milestoneError } = await supabase
            .from('bridal_milestones')
            .insert(milestoneInserts);
        
        if (milestoneError) {
            console.error('Error creating milestones:', milestoneError);
        }
    }
    
    revalidatePath('/admin/novias');
    return { success: true, projectId: project.id };
}

export async function updateBridalProject(id: string, formData: FormData) {
    const supabase = getAdminClient();
    
    const updates: Record<string, any> = {};
    
    const fields = ['description', 'materials_notes', 'internal_notes', 'contract_notes', 'event_venue', 'status'];
    fields.forEach(field => {
        const value = formData.get(field);
        if (value !== null) updates[field] = value || null;
    });
    
    const totalAmount = formData.get('total_amount');
    if (totalAmount !== null) {
        const total = parseInt(totalAmount as string) || 0;
        updates.total_amount = total;
        updates.payment_1_amount = Math.round(total * 0.5);
        updates.payment_2_amount = Math.round(total * 0.25);
        updates.payment_3_amount = total - updates.payment_1_amount - updates.payment_2_amount;
    }
    
    const eventDate = formData.get('event_date');
    if (eventDate !== null && eventDate !== '') {
        updates.event_date = new Date(`${eventDate}T12:00:00-04:00`).toISOString();
    }
    
    updates.updated_at = new Date().toISOString();
    
    const { error } = await supabase
        .from('bridal_projects')
        .update(updates)
        .eq('id', id);
    
    if (error) {
        console.error('Error updating bridal project:', error);
        return { success: false, error: error.message };
    }
    
    revalidatePath('/admin/novias');
    revalidatePath(`/admin/novias/${id}`);
    return { success: true };
}

export async function registerPayment(projectId: string, paymentNumber: 1 | 2 | 3) {
    const supabase = getAdminClient();
    
    const updates: Record<string, any> = {
        [`payment_${paymentNumber}_status`]: 'paid',
        [`payment_${paymentNumber}_date`]: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    
    // Update project status based on payment
    if (paymentNumber === 1) {
        updates.status = 'en_proceso';
    }
    
    const { error } = await supabase
        .from('bridal_projects')
        .update(updates)
        .eq('id', projectId);
    
    if (error) {
        console.error('Error registering payment:', error);
        return { success: false, error: error.message };
    }
    
    revalidatePath('/admin/novias');
    revalidatePath(`/admin/novias/${projectId}`);
    return { success: true };
}

export async function acceptContract(projectId: string) {
    const supabase = getAdminClient();
    
    const { error } = await supabase
        .from('bridal_projects')
        .update({
            contract_accepted: true,
            contract_accepted_at: new Date().toISOString(),
            status: 'contrato_pendiente', // Stays until first payment
            updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);
    
    if (error) {
        return { success: false, error: error.message };
    }
    
    revalidatePath(`/admin/novias/${projectId}`);
    return { success: true };
}

export async function completeMilestone(milestoneId: string, projectId: string) {
    const supabase = getAdminClient();
    
    const { error } = await supabase
        .from('bridal_milestones')
        .update({
            status: 'completed',
            completed_date: new Date().toISOString(),
        })
        .eq('id', milestoneId);
    
    if (error) {
        return { success: false, error: error.message };
    }
    
    // Check if milestone is "entrega" to update project status
    const { data: milestone } = await supabase
        .from('bridal_milestones')
        .select('milestone_type')
        .eq('id', milestoneId)
        .single();
    
    if (milestone?.milestone_type === 'entrega') {
        await supabase
            .from('bridal_projects')
            .update({ status: 'entregado', updated_at: new Date().toISOString() })
            .eq('id', projectId);
    }
    
    revalidatePath(`/admin/novias/${projectId}`);
    return { success: true };
}

export async function saveMeasurements(formData: FormData) {
    const supabase = getAdminClient();
    
    const projectId = formData.get('project_id') as string;
    const milestoneId = formData.get('milestone_id') as string;
    
    const measurementFields = ['bust', 'waist', 'hips', 'full_length', 'shoulder_width', 'arm_circumference', 'sleeve_length', 'back_length', 'neckline_depth'];
    
    const measurements: Record<string, any> = {
        project_id: projectId,
        milestone_id: milestoneId || null,
        notes: formData.get('notes') as string || null,
    };
    
    measurementFields.forEach(field => {
        const val = formData.get(field) as string;
        measurements[field] = val ? parseFloat(val) : null;
    });
    
    const { error } = await supabase
        .from('bridal_measurements')
        .insert([measurements]);
    
    if (error) {
        console.error('Error saving measurements:', error);
        return { success: false, error: error.message };
    }
    
    revalidatePath(`/admin/novias/${projectId}`);
    return { success: true };
}

export async function cancelProject(projectId: string) {
    const supabase = getAdminClient();
    
    const { error } = await supabase
        .from('bridal_projects')
        .update({
            status: 'cancelado',
            updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);
    
    if (error) {
        return { success: false, error: error.message };
    }
    
    revalidatePath('/admin/novias');
    revalidatePath(`/admin/novias/${projectId}`);
    return { success: true };
}

// ─── Email & Automation Actions ──────────────────────────────

const getTransporter = () => {
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPassword = process.env.SMTP_PASSWORD || '';
    if (!smtpUser || !smtpPassword) throw new Error('SMTP credentials missing');
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: smtpUser, pass: smtpPassword },
    });
};

const emailLogoHtml = `
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; text-align: center;">
      <tr>
        <td style="font-family:'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 900; color: #FFFFFF; letter-spacing: 12px; text-transform: uppercase; text-align: center; line-height: 1; padding: 0 0 0 12px;">
          ELENA
        </td>
      </tr>
      <tr>
        <td style="font-family:'Inter', -apple-system, sans-serif; font-size: 8px; font-weight: 700; color: #FFFFFF; letter-spacing: 5.8px; text-transform: uppercase; text-align: center; padding-top: 8px; line-height: 1; padding-left: 5.8px; width: 100%;">
          LA COSTURERA
        </td>
      </tr>
    </table>`;

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

export async function sendBridalWelcomeEmailAction(projectId: string) {
    try {
        const supabase = getAdminClient();
        const { data: project } = await supabase.from('bridal_projects')
            .select('*, customers(email, full_name)')
            .eq('id', projectId).single();
            
        if (!project || !project.customers?.email) throw new Error('Proyecto o correo no encontrado');
        
        const customerEmail = project.customers.email;
        const customerName = project.customers.full_name || 'Futura Novia';
        const siteUrl = await getSiteUrl();
        const portalLink = `${siteUrl}/portal-novias/${projectId}`;

        // Luxury background image logic
        const attachments = [];
        let cardBgUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGUlEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAA8F8bGgABxZqVdgAAAABJRU5ErkJggg==';
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'public', 'trabajos', 'novia 2.jpeg');
        if (fs.existsSync(filePath)) {
            attachments.push({ filename: 'novia_2.jpeg', path: filePath, cid: 'luxuryPassBg' });
            cardBgUrl = 'cid:luxuryPassBg';
        }

        const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&display=swap');
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F6F0; font-family: 'Inter', Helvetica, sans-serif;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8F6F0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="650" border="0" cellpadding="0" cellspacing="0" style="background-color: #120F0D; border-radius: 4px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.4);">
          <tr>
            <td background="${cardBgUrl}" bgcolor="#120F0D" style="background: linear-gradient(to right, #120F0D 0%, #120F0D 40%, rgba(18,15,13,0.6) 60%, rgba(18,15,13,0) 100%), url('${cardBgUrl}') right center/cover; background-image: linear-gradient(to right, #120F0D 0%, #120F0D 40%, rgba(18,15,13,0.6) 60%, rgba(18,15,13,0) 100%), url('${cardBgUrl}'); background-size: cover; background-position: right center; position: relative; padding: 15px;">
              
              <!-- Inner border -->
              <div style="border: 1px solid rgba(193, 127, 95, 0.4); border-radius: 2px; padding: 40px 20px; position: relative; min-height: 700px;">
                
                <!-- Text Container (left aligned) -->
                <table width="360" border="0" cellpadding="0" cellspacing="0" align="left" style="text-align: center;">
                  <tr>
                    <td>
                      <!-- Logo -->
                      ${emailLogoHtml}
                      
                      <div style="margin-top: 30px; color: #C17F5F; font-size: 14px;">✦</div>
                      
                      <p style="color: #C17F5F; font-size: 8px; text-transform: uppercase; letter-spacing: 4px; margin: 15px 0 25px 0; font-weight: 600;">
                        INGRESO ATELIER
                      </p>
                      
                      <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #FFFFFF; font-size: 32px; font-weight: 400; margin: 0; line-height: 1.2;">
                        ¡Felicidades
                      </h1>
                      <h2 style="font-family: 'Playfair Display', Georgia, serif; color: #FFFFFF; font-size: 20px; font-weight: 400; margin: 5px 0 0 0; font-style: italic;">
                        por tu
                      </h2>
                      <h1 style="font-family: 'Great Vibes', 'Brush Script MT', 'Lucida Handwriting', cursive, Georgia, serif; color: #C17F5F; font-size: 44px; font-weight: 400; margin: 0 0 15px 0; font-style: italic;">
                        compromiso!
                      </h1>
                      
                      <div style="color: #C17F5F; font-size: 12px; margin-bottom: 10px;">♡</div>
                      
                      <p style="font-family: 'Great Vibes', 'Brush Script MT', 'Lucida Handwriting', cursive, Georgia, serif; color: #FFFFFF; font-size: 38px; margin: 0; line-height: 1.2; font-style: italic;">
                        ${customerName}
                      </p>
                      
                      <div style="color: #C17F5F; font-size: 10px; margin-top: 15px; margin-bottom: 30px;">♡</div>

                      <p style="color: #D4D0C5; font-size: 11px; line-height: 1.8; margin-bottom: 40px; font-weight: 300; max-width: 90%; margin-left: auto; margin-right: auto;">
                        Es un honor para nosotros acompañarte en este viaje tan especial. Hemos preparado un portal exclusivo para ti, donde comenzaremos a diseñar el vestido de tus sueños con todo el lujo que mereces.
                      </p>
                      
                      <div style="color: #C17F5F; font-size: 10px; margin-bottom: 25px;">⬩</div>

                      <a href="${portalLink}" target="_blank" style="font-size: 10px; font-family: 'Inter', Helvetica, sans-serif; font-weight: 600; color: #C17F5F; text-decoration: none; padding: 14px 28px; border: 1px solid rgba(193, 127, 95, 0.6); display: inline-block; text-transform: uppercase; letter-spacing: 2px; border-radius: 1px;">
                        INGRESAR A MI PORTAL &rarr;
                      </a>
                      
                      <div style="color: #C17F5F; font-size: 8px; margin-top: 25px; margin-bottom: 10px;">-</div>
                      
                      <p style="font-family: 'Great Vibes', 'Brush Script MT', cursive, Georgia, serif; color: #C17F5F; font-size: 22px; margin: 0 0 5px 0; font-style: italic;">
                        Con cariño,
                      </p>
                      <p style="color: #A39E93; font-size: 7px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">
                        ELENA LA COSTURERA<br>ATELIER
                      </p>
                    </td>
                  </tr>
                </table>
                <!-- Clearfix for align="left" -->
                <div style="clear: both;"></div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const transporter = getTransporter();
        await transporter.sendMail({
            from: '"ELENA La Costurera" <contacto@elenalacosturera.cl>',
            to: customerEmail,
            subject: '¡Felicidades! Ingresa a tu Portal de Novia - Elena Atelier',
            html: htmlContent,
            attachments
        });

        // Update project status to indicate email sent
        await supabase.from('bridal_projects').update({ status: 'consulta' }).eq('id', projectId);
        revalidatePath('/admin/novias');
        return { success: true };
    } catch (e: any) {
        console.error('Error sending welcome email:', e);
        return { success: false, error: e.message };
    }
}

export async function processBridalFormAction(projectId: string, formData: FormData) {
    try {
        const supabase = getAdminClient();
        
        // 1. Update Customer
        const customerData = {
            full_name: formData.get('fullName'),
            rut: formData.get('rut'),
            phone: formData.get('phone'),
        };
        
        const { data: project } = await supabase.from('bridal_projects').select('customer_id').eq('id', projectId).single();
        if (project?.customer_id) {
            await supabase.from('customers').update(customerData).eq('id', project.customer_id);
        }

        // 2. Update Project
        const projectData: any = {};
        if (formData.get('eventDate')) projectData.event_date = new Date(`${formData.get('eventDate')}T12:00:00-04:00`).toISOString();
        if (formData.get('eventVenue')) projectData.event_venue = formData.get('eventVenue');
        if (formData.get('notes')) projectData.description = formData.get('notes');
        
        await supabase.from('bridal_projects').update(projectData).eq('id', projectId);
        
        // 3. Trigger Contract Email
        const contractRes = await sendBridalContractEmailAction(projectId);
        if (!contractRes.success) throw new Error(contractRes.error);

        return { success: true };
    } catch (e: any) {
        console.error('Error processing form:', e);
        return { success: false, error: e.message };
    }
}

export async function sendBridalContractEmailAction(projectId: string) {
    try {
        const supabase = getAdminClient();
        const { data: project } = await supabase.from('bridal_projects')
            .select('*, customers(email, full_name)')
            .eq('id', projectId).single();
            
        if (!project || !project.customers?.email) throw new Error('Proyecto no encontrado');
        
        const siteUrl = await getSiteUrl();
        const paymentLink = `${siteUrl}/portal-novias/${projectId}/pagar`;

        const customerEmail = project.customers.email;
        const customerName = project.customers.full_name || 'Clienta';

        const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background-color: #F8F6F0; font-family: 'Inter', sans-serif;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8F6F0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 0px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border: 1px solid #EAE6D7;">
          <!-- Content Body -->
          <tr>
            <td style="background-color: #1A1A1A; padding: 50px 40px; text-align: center;">
              ${emailLogoHtml}
              <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #FFFFFF; font-size: 28px; font-weight: 400; margin: 30px 0 20px 0; letter-spacing: 0.5px;">
                Tu Contrato y Presupuesto
              </h1>
              <p style="color: #D4D0C5; font-size: 14px; line-height: 1.8; margin-bottom: 40px; font-weight: 300; max-width: 90%; margin-left: auto; margin-right: auto;">
                Hola <i style="color: #FFFFFF;">${customerName}</i>, hemos redactado tu contrato y presupuesto formal. Para dar inicio al proceso y reservar tu cupo de producción, por favor revisa el documento, firma aceptando el presupuesto y realiza el abono inicial (50%) de <strong>${formatCurrency(project.payment_1_amount)}</strong>.
              </p>
              <table align="center" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius: 2px;" bgcolor="#C17F5F">
                    <a href="${paymentLink}" target="_blank" style="font-size: 11px; font-family: 'Inter', sans-serif; font-weight: 600; color: #ffffff; text-decoration: none; padding: 18px 40px; border: 1px solid #C17F5F; display: inline-block; text-transform: uppercase; letter-spacing: 2px;">
                      ACEPTO EL PRESUPUESTO Y FIRMO EL CONTRATO
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 30px 40px; text-align: center; border-top: 1px solid #EAE6D7;">
              <p style="color: #A39E93; font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0;">
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
        await transporter.sendMail({
            from: '"ELENA La Costurera" <contacto@elenalacosturera.cl>',
            to: customerEmail,
            subject: 'Tu Presupuesto y Contrato - Elena Atelier',
            html: htmlContent
        });

        await supabase.from('bridal_projects').update({ status: 'contrato_pendiente' }).eq('id', projectId);
        return { success: true };
    } catch (e: any) {
        console.error('Error sending contract email:', e);
        return { success: false, error: e.message };
    }
}

export async function sendBridalThankYouEmailAction(projectId: string) {
    try {
        const supabase = getAdminClient();
        const { data: project } = await supabase.from('bridal_projects')
            .select('*, customers(email, full_name)')
            .eq('id', projectId).single();
            
        if (!project || !project.customers?.email) throw new Error('Proyecto no encontrado');
        
        const customerEmail = project.customers.email;
        const customerName = project.customers.full_name || 'Clienta';

        const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background-color: #F8F6F0; font-family: 'Inter', sans-serif;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8F6F0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 0px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border: 1px solid #EAE6D7;">
          <!-- Content Body -->
          <tr>
            <td style="background-color: #1A1A1A; padding: 50px 40px; text-align: center;">
              ${emailLogoHtml}
              <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #FFFFFF; font-size: 28px; font-weight: 400; margin: 30px 0 20px 0; letter-spacing: 0.5px;">
                ¡Gracias por Elegirnos!
              </h1>
              <p style="color: #D4D0C5; font-size: 14px; line-height: 1.8; margin-bottom: 20px; font-weight: 300; max-width: 90%; margin-left: auto; margin-right: auto;">
                Estimada <i style="color: #FFFFFF;">${customerName}</i>, hemos recibido exitosamente la firma de tu contrato y el abono inicial. Tu cupo de producción ya está oficialmente reservado en nuestro atelier.
              </p>
              <p style="color: #D4D0C5; font-size: 14px; line-height: 1.8; margin-bottom: 20px; font-weight: 300; max-width: 90%; margin-left: auto; margin-right: auto;">
                En los próximos días nos contactaremos contigo para agendar tu primera prueba. ¡Estamos muy emocionados de comenzar este proceso y confeccionar el vestido de tus sueños!
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 30px 40px; text-align: center; border-top: 1px solid #EAE6D7;">
              <p style="color: #A39E93; font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0;">
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
        await transporter.sendMail({
            from: '"ELENA La Costurera" <contacto@elenalacosturera.cl>',
            to: customerEmail,
            subject: '¡Reserva Confirmada! Gracias por elegir Elena Atelier',
            html: htmlContent
        });

        return { success: true };
    } catch (e: any) {
        console.error('Error sending thank you email:', e);
        return { success: false, error: e.message };
    }
}

export async function generateBridalPaymentLinksAction(projectId: string) {
    try {
        const supabase = getAdminClient();
        const { data: project } = await supabase.from('bridal_projects')
            .eq('id', projectId).single();
            
        if (!project) throw new Error('Proyecto no encontrado');

        const amount = project.payment_1_amount;
        const externalRef = `bridal_project_${projectId}_50pct`;
        const siteUrl = await getSiteUrl();

        let mpLink = null;
        let tbkLink = null;
        let tbkToken = null;

        // 1. Generate MP Link
        if (process.env.MP_ACCESS_TOKEN) {
            const mpPayload = {
                items: [{
                    title: `Reserva 50% - ${project.project_type === 'novia' ? 'Vestido de Novia' : 'Vestido'}`,
                    quantity: 1,
                    unit_price: amount,
                    currency_id: 'CLP'
                }],
                external_reference: externalRef,
                back_urls: {
                    success: `${siteUrl}/portal-novias/${projectId}/pago-exitoso`,
                    pending: `${siteUrl}/portal-novias/${projectId}/pagar`,
                    failure: `${siteUrl}/portal-novias/${projectId}/pagar`
                },
                auto_return: "approved"
            };

            const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mpPayload)
            });
            const mpData = await mpRes.json();
            if (mpData.init_point) mpLink = mpData.init_point;
        }

        // 2. Generate Transbank Link
        try {
            const { createWebpayTransaction } = await import('@/lib/transbank');
            const shortId = projectId.split('-')[0];
            const buyOrder = `BRDL_${shortId}_50`;
            const sessionId = `sess_${shortId}`;
            const returnUrl = `${siteUrl}/portal-novias/${projectId}/webpay-callback`;

            const tbkRes = await createWebpayTransaction(buyOrder, sessionId, amount, returnUrl);
            if (tbkRes.success) {
                tbkLink = tbkRes.url;
                tbkToken = tbkRes.token;
            }
        } catch (e) {
            console.error('Error generating transbank link for bride:', e);
        }

        return { success: true, mpLink, tbkLink, tbkToken, amount };
    } catch (e: any) {
        console.error('Error generating payment links:', e);
        return { success: false, error: e.message };
    }
}


