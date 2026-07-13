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

export async function registerPayment(projectId: string, paymentNumber: 1 | 2 | 3, paymentMethod: string = 'Efectivo/Transferencia') {
    const supabase = getAdminClient();
    
    const { data: project, error: fetchError } = await supabase
        .from('bridal_projects')
        .select('*')
        .eq('id', projectId)
        .single();
        
    if (fetchError || !project) {
        console.error('Error fetching bridal project for payment:', fetchError);
        return { success: false, error: 'Proyecto no encontrado' };
    }

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

    // Registrar en sales_ledger
    const amount = paymentNumber === 1 ? project.payment_1_amount :
                   paymentNumber === 2 ? project.payment_2_amount :
                   project.payment_3_amount;
                   
    const ledgerId = `bridal_${projectId}_p${paymentNumber}`;
    
    // Evitar duplicados
    const { data: existingLedger } = await supabase
        .from('sales_ledger')
        .select('id')
        .eq('internal_id', ledgerId)
        .maybeSingle();

    if (!existingLedger && amount > 0) {
        const { error: ledgerError } = await supabase
            .from('sales_ledger')
            .insert([{
                internal_id: ledgerId,
                customer_id: project.customer_id,
                total_amount: amount,
                paid_amount: amount,
                status: 'completed',
                payment_method: paymentMethod,
                branch: 'Alta Costura'
            }]);
            
        if (ledgerError) {
            console.error('Error recording bridal payment in sales ledger:', ledgerError);
        }
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

    // Now trigger the contract and payment email
    await sendBridalContractEmailAction(projectId);
    
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

export async function deleteBridalProjectAction(projectId: string) {
    const supabase = getAdminClient();
    
    // Eliminar primero los registros del libro de ventas asociados a este proyecto
    await supabase
        .from('sales_ledger')
        .delete()
        .like('internal_id', `bridal_${projectId}_%`);

    const { error } = await supabase
        .from('bridal_projects')
        .delete()
        .eq('id', projectId);
    
    if (error) {
        return { success: false, error: error.message };
    }
    
    revalidatePath('/admin/novias');
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
        const portalLink = `${siteUrl}/portal-novias/${projectId}/induccion`;

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
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&display=swap');
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Inter', Helvetica, sans-serif;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="650" border="0" cellpadding="0" cellspacing="0" style="background-color: #0E0E0E; overflow: hidden;">
          <tr>
            <td background="${cardBgUrl}" bgcolor="#0E0E0E" style="background: linear-gradient(to right, #0E0E0E 0%, #0E0E0E 40%, rgba(14,14,14,0.5) 55%, rgba(14,14,14,0) 70%), url('${cardBgUrl}') right top no-repeat; background-image: linear-gradient(to right, #0E0E0E 0%, #0E0E0E 40%, rgba(14,14,14,0.5) 55%, rgba(14,14,14,0) 70%), url('${cardBgUrl}'); background-size: 100% 100%, auto 100%; background-position: 0 0, right top; padding: 50px 0; background-repeat: no-repeat;">
              
              <!-- Text Container (left aligned) -->
              <table width="380" border="0" cellpadding="0" cellspacing="0" align="left" style="padding-left: 45px;">
                <tr>
                  <td>
                    <!-- Logo -->
                    ${emailLogoHtml}
                    
                    <div style="margin-top: 50px;"></div>
                    
                    <p style="color: #C17F5F; font-size: 8px; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 30px 0; font-weight: 600;">
                      ACCESO PORTAL PRIVADO
                    </p>
                    
                    <p style="font-family: 'Inter', Helvetica, sans-serif; color: #A39E93; font-size: 9px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 5px 0; font-weight: 400;">
                      ESTIMADA
                    </p>
                    
                    <p style="font-family: 'Playfair Display', Georgia, serif; color: #FFFFFF; font-size: 28px; margin: 0 0 30px 0; font-style: italic; font-weight: 400;">
                      ${customerName}
                    </p>
                    
                    <!-- Gold divider line -->
                    <table width="40" border="0" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                      <tr><td style="border-top: 2px solid #C17F5F; font-size: 0; line-height: 0; height: 1px;">&nbsp;</td></tr>
                    </table>
                    
                    <p style="color: #9A958C; font-size: 12px; line-height: 1.9; margin: 0 0 30px 0; font-weight: 300; max-width: 280px;">
                      Es un privilegio acompañarte en este proceso. Te invitamos a vivir la experiencia Elena Atelier.
                    </p>
                    
                    <a href="${portalLink}" target="_blank" style="font-size: 10px; font-family: 'Inter', Helvetica, sans-serif; font-weight: 600; color: #FFFFFF; background-color: transparent; text-decoration: none; padding: 14px 30px; border: 1px solid rgba(255,255,255,0.35); display: inline-block; text-transform: uppercase; letter-spacing: 3px; margin-top: 20px;">
                      VER VIDEO E INGRESAR AL PORTAL &rarr;
                    </a>
                    
                    <div style="margin-top: 60px;"></div>
                    
                    <!-- Footer signature -->
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 25px;">
                      <tr>
                        <td>
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="border-left: 2px solid #C17F5F; padding-left: 12px;">
                                <p style="font-family: 'Inter', Helvetica, sans-serif; color: #FFFFFF; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 3px 0;">
                                  ELENA ATELIER
                                </p>
                                <p style="font-family: 'Inter', Helvetica, sans-serif; color: #6B6660; font-size: 8px; letter-spacing: 1.5px; text-transform: uppercase; margin: 0;">
                                  ATELIER &middot; SANTIAGO DE CHILE
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              <!-- Clearfix -->
              <div style="clear: both;"></div>
            </td>
          </tr>
          
          <!-- Copyright footer row -->
          <tr>
            <td style="background-color: #080808; padding: 15px 45px; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="font-family: 'Inter', Helvetica, sans-serif; color: #3D3A37; font-size: 7px; letter-spacing: 1.5px; text-transform: uppercase; margin: 0; text-align: center;">
                &copy; 2025 ELENA ATELIER &middot; TODOS LOS DERECHOS RESERVADOS
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

export async function sendBridalInductionEmailAction(projectId: string) {
    try {
        const supabase = getAdminClient();
        const { data: project } = await supabase.from('bridal_projects')
            .select('*, customers(email, full_name)')
            .eq('id', projectId).single();
            
        if (!project || !project.customers?.email) throw new Error('Proyecto o correo no encontrado');
        
        const customerEmail = project.customers.email;
        const customerName = project.customers.full_name || 'Futura Novia';
        const siteUrl = await getSiteUrl();
        const portalLink = `${siteUrl}/portal-novias/${projectId}/induccion`;

        // Luxury background image logic
        const attachments: any[] = [];
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
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&display=swap');
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Inter', Helvetica, sans-serif;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="650" border="0" cellpadding="0" cellspacing="0" style="background-color: #0E0E0E; overflow: hidden;">
          <tr>
            <td background="${cardBgUrl}" bgcolor="#0E0E0E" style="background: linear-gradient(to right, #0E0E0E 0%, #0E0E0E 40%, rgba(14,14,14,0.5) 55%, rgba(14,14,14,0) 70%), url('${cardBgUrl}') right top no-repeat; background-image: linear-gradient(to right, #0E0E0E 0%, #0E0E0E 40%, rgba(14,14,14,0.5) 55%, rgba(14,14,14,0) 70%), url('${cardBgUrl}'); background-size: 100% 100%, auto 100%; background-position: 0 0, right top; padding: 50px 0; background-repeat: no-repeat;">
              
              <!-- Text Container (left aligned) -->
              <table width="380" border="0" cellpadding="0" cellspacing="0" align="left" style="padding-left: 45px;">
                <tr>
                  <td>
                    <!-- Logo -->
                    ${emailLogoHtml}
                    
                    <div style="margin-top: 50px;"></div>
                    
                    <p style="color: #C17F5F; font-size: 8px; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 30px 0; font-weight: 600;">
                      INFORMACIÓN DE TU PROYECTO
                    </p>
                    
                    <p style="font-family: 'Inter', Helvetica, sans-serif; color: #A39E93; font-size: 9px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 5px 0; font-weight: 400;">
                      ESTIMADA
                    </p>
                    
                    <p style="font-family: 'Playfair Display', Georgia, serif; color: #FFFFFF; font-size: 28px; margin: 0 0 30px 0; font-style: italic; font-weight: 400;">
                      ${customerName}
                    </p>
                    
                    <!-- Gold divider line -->
                    <table width="40" border="0" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                      <tr><td style="border-top: 2px solid #C17F5F; font-size: 0; line-height: 0; height: 1px;">&nbsp;</td></tr>
                    </table>
                    
                    <p style="color: #9A958C; font-size: 12px; line-height: 1.9; margin: 0 0 15px 0; font-weight: 300; max-width: 320px;">
                      Como parte del proceso de tu proyecto, hemos preparado un breve video donde Elena te explica personalmente los pasos que seguiremos para la confección de tu vestido.
                    </p>

                    <p style="color: #9A958C; font-size: 12px; line-height: 1.9; margin: 0 0 40px 0; font-weight: 300; max-width: 320px;">
                      Te pedimos que lo revises antes de tu próxima cita para que puedas resolver cualquier duda que tengas durante la sesión.
                    </p>
                    
                    <a href="${portalLink}" target="_blank" style="font-size: 10px; font-family: 'Inter', Helvetica, sans-serif; font-weight: 600; color: #FFFFFF; background-color: transparent; text-decoration: none; padding: 14px 30px; border: 1px solid rgba(255,255,255,0.35); display: inline-block; text-transform: uppercase; letter-spacing: 3px;">
                      VER VIDEO INFORMATIVO &rarr;
                    </a>
                    
                    <div style="margin-top: 60px;"></div>
                    
                    <!-- Footer signature -->
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 25px;">
                      <tr>
                        <td>
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="border-left: 2px solid #C17F5F; padding-left: 12px;">
                                <p style="font-family: 'Inter', Helvetica, sans-serif; color: #FFFFFF; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 3px 0;">
                                  ELENA ATELIER
                                </p>
                                <p style="font-family: 'Inter', Helvetica, sans-serif; color: #6B6660; font-size: 8px; letter-spacing: 1.5px; text-transform: uppercase; margin: 0;">
                                  ATELIER &middot; SANTIAGO DE CHILE
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
              <!-- Clearfix -->
              <div style="clear: both;"></div>
            </td>
          </tr>
          
          <!-- Copyright footer row -->
          <tr>
            <td style="background-color: #080808; padding: 15px 45px; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="font-family: 'Inter', Helvetica, sans-serif; color: #3D3A37; font-size: 7px; letter-spacing: 1.5px; text-transform: uppercase; margin: 0; text-align: center;">
                &copy; 2025 ELENA ATELIER &middot; TODOS LOS DERECHOS RESERVADOS
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
            replyTo: 'contacto@elenalacosturera.cl',
            to: customerEmail,
            subject: `${customerName}, tu video informativo está listo`,
            html: htmlContent,
            attachments,
            headers: {
                'X-Priority': '1',
                'X-PM-Message-Stream': 'outbound',
                'Precedence': 'bulk'
            }
        });

        return { success: true };
    } catch (e: any) {
        console.error('Error sending induction email:', e);
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
        const proposalLink = `${siteUrl}/portal-novias/${projectId}/contrato`;

        const customerEmail = project.customers.email;
        const customerName = project.customers.full_name || 'Clienta';

        const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Inter', Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A; padding: 50px 20px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table width="580" border="0" cellpadding="0" cellspacing="0" style="background-color: #0E0E0E; border-top: 3px solid #C17F5F; border-radius: 4px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.5);">
          <!-- Main Content -->
          <tr>
            <td style="padding: 60px 40px; text-align: center;">
              <!-- Logo -->
              ${emailLogoHtml}
              
              <div style="margin-top: 40px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 25px;">
                <p style="color: #C17F5F; font-size: 8px; text-transform: uppercase; letter-spacing: 5px; margin: 0 0 12px 0; font-weight: 600;">
                  DOCUMENTO DE SERVICIO
                </p>
                <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #FFFFFF; font-size: 26px; font-weight: 400; margin: 0; font-style: italic; letter-spacing: 0.5px;">
                  Propuesta y Contrato Formal
                </h1>
              </div>

              <div style="margin-top: 35px; text-align: left;">
                <p style="color: #9A958C; font-size: 13px; line-height: 1.8; font-weight: 300; margin: 0 0 20px 0;">
                  Estimada <strong style="color: #FFFFFF; font-weight: 600;">${customerName}</strong>,
                </p>
                <p style="color: #9A958C; font-size: 13px; line-height: 1.8; font-weight: 300; margin: 0 0 30px 0;">
                  Hemos recibido exitosamente la aceptación de tu propuesta y la firma del contrato. Queremos agradecerte por confiar en Elena Atelier para confeccionar tu vestido soñado.
                </p>
                <p style="color: #9A958C; font-size: 13px; line-height: 1.8; font-weight: 300; margin: 0 0 35px 0;">
                  Como último paso para consolidar tu reserva y bloquear tu cupo exclusivo de producción, te invitamos a revisar tu documento final y gestionar tu abono inicial.
                </p>
              </div>

              <!-- Button -->
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 10px auto;">
                <tr>
                  <td align="center">
                    <a href="${proposalLink}" target="_blank" style="font-size: 10px; font-family: 'Inter', Helvetica, Arial, sans-serif; font-weight: 600; color: #FFFFFF; background-color: transparent; text-decoration: none; padding: 16px 35px; border: 1px solid #C17F5F; display: inline-block; text-transform: uppercase; letter-spacing: 3px; border-radius: 2px; transition: all 0.3s ease;">
                      REVISAR CONTRATO Y PROCESAR PAGO
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Signature/Address -->
          <tr>
            <td style="background-color: #090909; padding: 35px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.04);">
              <p style="font-family: 'Inter', Helvetica, Arial, sans-serif; color: #6B6660; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 10px 0;">
                ATELIER HORTENSIA SPA &middot; AV. TABANCURA 1091, OF 319, VITACURA
              </p>
              <p style="font-family: 'Inter', Helvetica, Arial, sans-serif; color: #4B4640; font-size: 8px; letter-spacing: 1.5px; text-transform: uppercase; margin: 0;">
                © ${new Date().getFullYear()} ELENA LA COSTURERA &middot; TODOS LOS DERECHOS RESERVADOS
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const smtpUser = process.env.SMTP_USER || '';
        const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;

        const transporter = getTransporter();
        await transporter.sendMail({
            from: '"ELENA La Costurera" <contacto@elenalacosturera.cl>',
            to: customerEmail,
            subject: 'Revisión de Contrato y Presupuesto - Elena Atelier',
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

        const smtpUser = process.env.SMTP_USER || '';
        const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;

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
            .select('*')
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

export async function updateMilestoneDateAction(
    milestoneId: string,
    projectId: string,
    newDateStr: string,
    notifyClient: boolean
) {
    try {
        const supabase = getAdminClient();
        
        // 1. Get milestone details
        const { data: milestone, error: milestoneErr } = await supabase
            .from('bridal_milestones')
            .select('*')
            .eq('id', milestoneId)
            .single();
            
        if (milestoneErr || !milestone) {
            throw new Error('Hito no encontrado');
        }

        // 2. Get project and customer details
        const { data: project, error: projectErr } = await supabase
            .from('bridal_projects')
            .select('*, customers(id, full_name, email, phone)')
            .eq('id', projectId)
            .single();

        if (projectErr || !project) {
            throw new Error('Proyecto no encontrado');
        }

        const dateIso = new Date(`${newDateStr}T12:00:00-04:00`).toISOString();
        let agendaEventId = milestone.agenda_event_id;

        // 3. Sync with agendamientos (agenda)
        if (agendaEventId) {
            // Update existing agenda event
            const { error: updateError } = await supabase
                .from('agendamientos')
                .update({
                    fecha_hora: dateIso,
                    notas: `Prueba coordinada: ${milestone.title}`
                })
                .eq('id', agendaEventId);
                
            if (updateError) {
                console.error('Error updating agenda event:', updateError);
            }
        } else {
            // Insert new agenda event
            const fullName = project.customers?.full_name || 'Novia';
            const nameParts = fullName.trim().split(/\s+/);
            const nombre = nameParts[0] || 'Novia';
            const apellido = nameParts.slice(1).join(' ') || '';

            const { data: newEvent, error: insertError } = await supabase
                .from('agendamientos')
                .insert([{
                    nombre,
                    apellido,
                    celular: project.customers?.phone || '',
                    correo: project.customers?.email || '',
                    fecha_hora: dateIso,
                    origen: 'admin',
                    tipo_evento: 'cita_cliente',
                    estado: 'confirmado',
                    notas: `Prueba coordinada: ${milestone.title}`
                }])
                .select()
                .single();

            if (insertError) {
                console.error('Error inserting agenda event:', insertError);
            } else if (newEvent) {
                agendaEventId = newEvent.id;
            }
        }

        // 4. Update the milestone record with new date and agenda_event_id
        const { error: milestoneUpdateErr } = await supabase
            .from('bridal_milestones')
            .update({
                scheduled_date: dateIso,
                agenda_event_id: agendaEventId
            })
            .eq('id', milestoneId);

        if (milestoneUpdateErr) {
            throw milestoneUpdateErr;
        }

        // 5. Send notifications if checked
        if (notifyClient && project.customers?.email) {
            try {
                const { enviar_correo_confirmacion } = await import('@/lib/agenda');
                const fullName = project.customers?.full_name || 'Novia';
                const nameParts = fullName.trim().split(/\s+/);
                const nombre = nameParts[0] || 'Novia';
                const apellido = nameParts.slice(1).join(' ') || '';

                await enviar_correo_confirmacion(
                    nombre,
                    apellido,
                    project.customers?.phone || '',
                    project.customers?.email || '',
                    dateIso
                );
            } catch (notifyErr) {
                console.error('Error sending confirmation email/whatsapp:', notifyErr);
            }
        }

        revalidatePath(`/admin/novias/${projectId}`);
        revalidatePath('/admin/agenda');
        return { success: true };
    } catch (e: any) {
        console.error('Error in updateMilestoneDateAction:', e);
        return { success: false, error: e.message || 'Error al actualizar la fecha' };
    }
}



