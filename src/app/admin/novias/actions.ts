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
function calculateMilestoneDates(eventDate: Date, projectType: string): { type: string; title: string; weeksBeforeEvent: number; requiredPayment: number }[] {
    if (projectType === 'madrina' || projectType === 'graduacion') {
        return [
            { type: 'toma_medidas', title: 'Prueba 1 — Toma de Medidas y Diseño', weeksBeforeEvent: 8, requiredPayment: 0 },
            { type: 'prueba_estructura', title: 'Prueba 2 — Estructura y Calce Base', weeksBeforeEvent: 4, requiredPayment: 0 },
            { type: 'entrega', title: 'Entrega Final', weeksBeforeEvent: 1, requiredPayment: 0 },
        ];
    }
    
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
    
    const [projectRes, milestonesRes, measurementsRes, workOrderRes] = await Promise.all([
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
        supabase
            .from('work_orders')
            .select('id, payment_plan, paid_amount, total_amount')
            .eq('legacy_bridal_project_id', id)
            .maybeSingle(),
    ]);
    
    if (projectRes.error) {
        console.error('Error fetching bridal project:', projectRes.error);
        return null;
    }
    
    return {
        ...projectRes.data,
        milestones: milestonesRes.data || [],
        measurements: measurementsRes.data || [],
        work_order: workOrderRes.data || null,
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
    const customMilestonesJson = formData.get('custom_milestones_json') as string;
    const paymentPlanJson = formData.get('payment_plan_json') as string;
    
    // Parse custom payment plan if provided, otherwise fallback to standard calculation
    let parsedPaymentPlan: any = null;
    let payment1 = 0, payment2 = 0, payment3 = 0;
    
    if (paymentPlanJson) {
        try {
            parsedPaymentPlan = JSON.parse(paymentPlanJson);
            // Assign legacy fields if available (for backward compatibility on old dashboards if used)
            if (parsedPaymentPlan && parsedPaymentPlan.cuotas) {
                payment1 = parsedPaymentPlan.cuotas[0]?.monto || 0;
                payment2 = parsedPaymentPlan.cuotas[1]?.monto || 0;
                payment3 = parsedPaymentPlan.cuotas[2]?.monto || 0;
            }
        } catch (e) {
            console.error("Error parsing custom payment plan", e);
        }
    }
    
    if (!parsedPaymentPlan) {
        // Calculate payment splits: Novias = 50/25/25, Madrinas/Graduación = 50/50
        const isNovia = projectType === 'novia';
        payment1 = Math.round(totalAmount * 0.5);
        payment2 = isNovia ? Math.round(totalAmount * 0.25) : totalAmount - payment1;
        payment3 = isNovia ? totalAmount - payment1 - payment2 : 0;
    }
    
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
    
    // 1.5 DUAL WRITE TO work_orders
    let woId = undefined;
    if (project) {
        let paymentPlanToSave = parsedPaymentPlan;
        
        if (!paymentPlanToSave) {
            paymentPlanToSave = { cuotas: [] as any[] };
            if (payment1 > 0) paymentPlanToSave.cuotas.push({ numero: 1, monto: payment1, status: 'pending' });
            if (payment2 > 0) paymentPlanToSave.cuotas.push({ numero: 2, monto: payment2, status: 'pending' });
            if (payment3 > 0) paymentPlanToSave.cuotas.push({ numero: 3, monto: payment3, status: 'pending' });
        }
        
        const { data: woData } = await supabase.from('work_orders').insert([{
            customer_id: customerId || null,
            order_type: projectType,
            order_category: 'alta_costura',
            status: 'contrato_pendiente',
            description: description || `Vestido de ${projectType}`,
            total_amount: totalAmount,
            paid_amount: 0,
            payment_status: 'pending',
            payment_plan: paymentPlanToSave,
            event_date: eventDate?.toISOString() || null,
            event_venue: eventVenue || null,
            project_type: projectType,
            service_type: serviceType,
            contract_notes: contractNotes || null,
            materials_notes: materialsNotes || null,
            legacy_bridal_project_id: project.id
        }]).select('id').single();
        if (woData) woId = woData.id;
    }
    
    // 2. Generate milestones from event date
    if (eventDate) {
        let milestoneInserts = [];
        
        if (customMilestonesJson) {
            try {
                const customDates = JSON.parse(customMilestonesJson);
                for (const m of customDates) {
                    const scheduledDate = new Date(m.date);
                    milestoneInserts.push({
                        project_id: project.id,
                        milestone_type: m.type,
                        title: m.title,
                        scheduled_date: scheduledDate.toISOString(),
                        status: 'pending',
                        required_payment: m.requiredPayment,
                        agenda_event_id: null
                    });
                }
            } catch (e) {
                console.error("Error parsing custom milestones", e);
            }
        }
        
        // Fallback to calculation if no custom JSON was provided or it failed
        if (milestoneInserts.length === 0) {
            const milestoneTemplates = calculateMilestoneDates(eventDate, projectType);
            for (const m of milestoneTemplates) {
                const scheduledDate = new Date(eventDate);
                scheduledDate.setDate(scheduledDate.getDate() - (m.weeksBeforeEvent * 7));
                
                milestoneInserts.push({
                    project_id: project.id,
                    milestone_type: m.type,
                    title: m.title,
                    scheduled_date: scheduledDate.toISOString(),
                    status: 'pending',
                    required_payment: m.requiredPayment,
                    agenda_event_id: null
                });
            }
        }
        
        const { error: milestoneError } = await supabase
            .from('bridal_milestones')
            .insert(milestoneInserts);
        
        if (milestoneError) {
            console.error('Error creating milestones:', milestoneError);
        }

        // Dual write milestones to work_order_milestones
        if (woId) {
            const woMilestoneInserts = milestoneInserts.map(m => ({
                work_order_id: woId,
                milestone_type: m.milestone_type,
                title: m.title,
                scheduled_date: m.scheduled_date,
                status: m.status,
                required_payment: m.required_payment
            }));
            await supabase.from('work_order_milestones').insert(woMilestoneInserts);
        }
    }
    
    // 3. TERCER DUAL WRITE: production_orders (Para que aparezca en el Tablero Kanban de Producción)
    if (project) {
        await supabase.from('production_orders').insert([{
            customer_id: customerId || null,
            description: description || `Alta Costura: ${projectType}`,
            order_type: 'bespoke',
            status: 'draft', // Empieza como 'draft' para que la jefa de taller sepa que ingresó
            notes: materialsNotes || '',
            deadline: eventDate?.toISOString() || null,
            estimated_hours: 10, // Horas base genéricas para Alta Costura (se ajustará luego)
            pos_order_id: project.id // Usamos esta columna para vincularla internamente si es necesario
        }]);
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
        
        // Fetch project to get project_type if not updating it
        const { data: projData } = await supabase.from('bridal_projects').select('project_type').eq('id', id).single();
        const pType = projData?.project_type || 'novia';
        const isNovia = pType === 'novia';

        updates.total_amount = total;
        updates.payment_1_amount = Math.round(total * 0.5);
        updates.payment_2_amount = isNovia ? Math.round(total * 0.25) : total - updates.payment_1_amount;
        updates.payment_3_amount = isNovia ? total - updates.payment_1_amount - updates.payment_2_amount : 0;
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
    
    // 1.5 DUAL WRITE TO work_orders
    const woUpdates: Record<string, any> = {};
    if (updates.description !== undefined) woUpdates.description = updates.description;
    if (updates.materials_notes !== undefined) woUpdates.materials_notes = updates.materials_notes;
    if (updates.internal_notes !== undefined) woUpdates.internal_notes = updates.internal_notes;
    if (updates.contract_notes !== undefined) woUpdates.contract_notes = updates.contract_notes;
    if (updates.event_venue !== undefined) woUpdates.event_venue = updates.event_venue;
    if (updates.status !== undefined) woUpdates.status = updates.status;
    if (updates.total_amount !== undefined) woUpdates.total_amount = updates.total_amount;
    if (updates.event_date !== undefined) woUpdates.event_date = updates.event_date;
    
    if (Object.keys(woUpdates).length > 0) {
        // Find existing work_order to update payment_plan if total_amount changed
        if (updates.total_amount !== undefined) {
            const { data: woData } = await supabase.from('work_orders').select('payment_plan, paid_amount').eq('legacy_bridal_project_id', id).maybeSingle();
            if (woData && woData.payment_plan && woData.payment_plan.cuotas) {
                const plan = woData.payment_plan;
                if (plan.cuotas[0]) plan.cuotas[0].monto = updates.payment_1_amount;
                if (plan.cuotas[1]) plan.cuotas[1].monto = updates.payment_2_amount;
                if (plan.cuotas[2]) plan.cuotas[2].monto = updates.payment_3_amount;
                woUpdates.payment_plan = plan;
                
                let paid = woData.paid_amount || 0;
                if (paid >= updates.total_amount && updates.total_amount > 0) woUpdates.payment_status = 'paid';
                else if (paid > 0) woUpdates.payment_status = 'partial';
                else woUpdates.payment_status = 'pending';
            }
        }
        await supabase.from('work_orders').update(woUpdates).eq('legacy_bridal_project_id', id);
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
    
    // 1.5 DUAL WRITE TO work_orders
    const { data: woData } = await supabase.from('work_orders').select('payment_plan, paid_amount, total_amount, status').eq('legacy_bridal_project_id', projectId).maybeSingle();
    
    if (woData && woData.payment_plan && woData.payment_plan.cuotas) {
        const plan = woData.payment_plan;
        let amountPaid = 0;
        if (plan.cuotas[paymentNumber - 1]) {
            plan.cuotas[paymentNumber - 1].status = 'paid';
            plan.cuotas[paymentNumber - 1].fecha = updates[`payment_${paymentNumber}_date`];
            amountPaid = plan.cuotas[paymentNumber - 1].monto;
        }
        
        let newPaidAmount = (woData.paid_amount || 0) + amountPaid;
        let newPaymentStatus = 'pending';
        if (newPaidAmount >= (woData.total_amount || 0) && (woData.total_amount || 0) > 0) newPaymentStatus = 'paid';
        else if (newPaidAmount > 0) newPaymentStatus = 'partial';
        
        const woUpdates: any = {
            payment_plan: plan,
            paid_amount: newPaidAmount,
            payment_status: newPaymentStatus,
            updated_at: new Date().toISOString()
        };
        
        if (paymentNumber === 1 && (woData.status === 'contrato_pendiente' || woData.status === 'consulta')) {
            woUpdates.status = 'draft';
        }
        
        await supabase.from('work_orders').update(woUpdates).eq('legacy_bridal_project_id', projectId);
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

        const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&display=swap');
</style>
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #ffffff; font-family: 'Inter', Helvetica, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; text-align: left; color: #333333;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-family:'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; letter-spacing: 8px; text-transform: uppercase; margin: 0; color: #000;">ELENA</h1>
      <p style="font-size: 8px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin: 5px 0 0 0; color: #666;">LA COSTURERA</p>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #444;">Estimada <strong>${customerName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #444;">Es un privilegio acompañarte en este proceso. Te invitamos a vivir la experiencia Elena Atelier.</p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${portalLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Acceder a tu Portal &rarr;</a>
    </div>

    <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
    <p style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; text-align: center;">ELENA ATELIER &middot; SANTIAGO DE CHILE</p>
  </div>
</body>
</html>`;

        const transporter = getTransporter();
        await transporter.sendMail({
            from: '"Elena Atelier" <contacto@elenalacosturera.cl>',
            to: customerEmail,
            subject: `Acceso a tu Portal de Novia - ${customerName}`,
            text: `Estimada ${customerName},\n\nEs un privilegio acompañarte en este proceso. Te invitamos a vivir la experiencia Elena Atelier.\n\nPuedes ingresar a tu portal privado en el siguiente enlace:\n${portalLink}\n\nAtentamente,\nElena Atelier`,
            html: htmlContent
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

        const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&display=swap');
</style>
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #ffffff; font-family: 'Inter', Helvetica, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; text-align: left; color: #333333;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-family:'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; letter-spacing: 8px; text-transform: uppercase; margin: 0; color: #000;">ELENA</h1>
      <p style="font-size: 8px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin: 5px 0 0 0; color: #666;">LA COSTURERA</p>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #444;">Estimada <strong>${customerName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #444;">Como parte del proceso de tu proyecto, hemos preparado un breve video donde Elena te explica personalmente los pasos que seguiremos.</p>
    <p style="font-size: 14px; line-height: 1.6; color: #444;">Te pedimos que lo revises antes de tu próxima cita para que puedas resolver cualquier duda que tengas durante la sesión.</p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${portalLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Ver Video Informativo &rarr;</a>
    </div>

    <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
    <p style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; text-align: center;">ELENA ATELIER &middot; SANTIAGO DE CHILE</p>
  </div>
</body>
</html>`;

        const transporter = getTransporter();
        await transporter.sendMail({
            from: '"Elena Atelier" <contacto@elenalacosturera.cl>',
            replyTo: 'contacto@elenalacosturera.cl',
            to: customerEmail,
            subject: `Información de tu proyecto - ${customerName}`,
            text: `Estimada ${customerName},\n\nComo parte del proceso de tu proyecto, hemos preparado un breve video explicativo.\nTe pedimos que lo revises antes de tu próxima cita para que puedas resolver cualquier duda.\n\nPuedes ver el video ingresando a tu portal privado en el siguiente enlace:\n${portalLink}\n\nAtentamente,\nElena Atelier`,
            html: htmlContent
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
<body style="margin: 0; padding: 40px 20px; background-color: #ffffff; font-family: 'Inter', Helvetica, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; text-align: left; color: #333333;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-family:'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; letter-spacing: 8px; text-transform: uppercase; margin: 0; color: #000;">ELENA</h1>
      <p style="font-size: 8px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin: 5px 0 0 0; color: #666;">LA COSTURERA</p>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #444;">Estimada <strong>${customerName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #444;">Hemos recibido exitosamente la aceptación de tu propuesta y la firma del contrato. Queremos agradecerte por confiar en Elena Atelier para confeccionar tu vestido soñado.</p>
    <p style="font-size: 14px; line-height: 1.6; color: #444;">Como último paso para consolidar tu reserva y bloquear tu cupo exclusivo de producción, te invitamos a revisar tu documento final y gestionar tu abono inicial.</p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${proposalLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Revisar Contrato y Pagar &rarr;</a>
    </div>

    <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
    <p style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; text-align: center;">ELENA ATELIER &middot; SANTIAGO DE CHILE</p>
  </div>
</body>
</html>`;

        const smtpUser = process.env.SMTP_USER || '';
        const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;

        const transporter = getTransporter();
        await transporter.sendMail({
            from: '"Elena Atelier" <contacto@elenalacosturera.cl>',
            to: customerEmail,
            subject: `Revisión de Contrato y Presupuesto - ${customerName}`,
            text: `Estimada ${customerName},\n\nTe hemos enviado tu contrato y presupuesto para revisión.\n\nPuedes ingresar a tu portal privado en el siguiente enlace:\n${portalLink}\n\nAtentamente,\nElena Atelier`,
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
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&display=swap');
</style>
</head>
<body style="margin: 0; padding: 40px 20px; background-color: #ffffff; font-family: 'Inter', Helvetica, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; text-align: left; color: #333333;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-family:'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; letter-spacing: 8px; text-transform: uppercase; margin: 0; color: #000;">ELENA</h1>
      <p style="font-size: 8px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin: 5px 0 0 0; color: #666;">LA COSTURERA</p>
    </div>

    <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #000; text-align: center; margin-bottom: 30px; font-weight: 400;">¡Gracias por Elegirnos!</h2>

    <p style="font-size: 14px; line-height: 1.6; color: #444;">Estimada <strong>${customerName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #444;">Hemos recibido exitosamente la firma de tu contrato y el abono inicial. Tu cupo de producción ya está oficialmente reservado en nuestro atelier.</p>
    <p style="font-size: 14px; line-height: 1.6; color: #444;">En los próximos días nos contactaremos contigo para agendar tu primera prueba. ¡Estamos muy emocionados de comenzar este proceso y confeccionar el vestido de tus sueños!</p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
    <p style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; text-align: center;">ELENA ATELIER &middot; SANTIAGO DE CHILE</p>
  </div>
</body>
</html>`;

        const smtpUser = process.env.SMTP_USER || '';
        const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;

        const transporter = getTransporter();
        await transporter.sendMail({
            from: '"Elena Atelier" <contacto@elenalacosturera.cl>',
            to: customerEmail,
            subject: '¡Reserva Confirmada! Gracias por elegir Elena Atelier',
            text: `Estimada ${customerName},\n\nHemos recibido exitosamente la firma de tu contrato y el abono inicial. Tu cupo de producción ya está oficialmente reservado en nuestro atelier.\n\nEn los próximos días nos contactaremos contigo para agendar tu primera prueba.\n\nAtentamente,\nElena Atelier`,
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
    newTimeStr: string = '12:00',
    notifyClient: boolean = false
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

        const timePart = newTimeStr || '12:00';
        let dateIso = new Date(`${newDateStr}T${timePart}:00-04:00`).toISOString();
        let agendaEventId = milestone.agenda_event_id;

        // 3. Sync with agendamientos (agenda)
        if (agendaEventId) {
            // Update existing agenda event
            let attempts = 0;
            let success = false;
            let updateDateIso = dateIso;
            
            while (attempts < 8 && !success) {
                const { error: updateError } = await supabase
                    .from('agendamientos')
                    .update({
                        fecha_hora: updateDateIso,
                        notas: `Prueba coordinada: ${milestone.title}`
                    })
                    .eq('id', agendaEventId);
                    
                if (!updateError) {
                    success = true;
                } else if (updateError.code === '23505') {
                    const d = new Date(updateDateIso);
                    d.setHours(d.getHours() + 1);
                    updateDateIso = d.toISOString();
                    attempts++;
                } else {
                    console.error('Error updating agenda event:', updateError);
                    break;
                }
            }
            if (success) {
                dateIso = updateDateIso;
            } else {
                throw new Error('No se pudo guardar en la agenda (conflicto de horario o error de conexión).');
            }
        } else {
            // Insert new agenda event
            const fullName = project.customers?.full_name || 'Novia';
            const nameParts = fullName.trim().split(/\s+/);
            const nombre = nameParts[0] || 'Novia';
            const apellido = nameParts.slice(1).join(' ') || '';

            let attempts = 0;
            let success = false;
            let updateDateIso = dateIso;

            while (attempts < 8 && !success) {
                const { data: newEvent, error: insertError } = await supabase
                    .from('agendamientos')
                    .insert([{
                        nombre,
                        apellido,
                        celular: project.customers?.phone || '',
                        correo: project.customers?.email || '',
                        fecha_hora: updateDateIso,
                        origen: 'admin',
                        tipo_evento: 'cita_cliente',
                        estado: 'confirmado',
                        notas: `Prueba coordinada: ${milestone.title}`
                    }])
                    .select()
                    .maybeSingle();

                if (!insertError && newEvent) {
                    agendaEventId = newEvent.id;
                    success = true;
                } else if (insertError?.code === '23505') {
                    const d = new Date(updateDateIso);
                    d.setHours(d.getHours() + 1);
                    updateDateIso = d.toISOString();
                    attempts++;
                } else {
                    console.error('Error inserting agenda event:', insertError);
                    break;
                }
            }
            if (success) {
                dateIso = updateDateIso;
            } else {
                throw new Error('No se pudo crear en la agenda (conflicto de horario o error de conexión).');
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

// ─── Moodboard / Inspirations Server Actions ───────────────────

export async function getBridalInspirations(projectId: string) {
    const supabase = getAdminClient();
    
    // Try primary table query
    const { data, error } = await supabase
        .from('bridal_inspirations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
    if (!error) {
        return data || [];
    }
    
    // Fallback: Parse from materials_notes in bridal_projects
    console.log('Falling back to materials_notes for inspirations...');
    const { data: project } = await supabase
        .from('bridal_projects')
        .select('materials_notes')
        .eq('id', projectId)
        .single();
        
    if (!project || !project.materials_notes) return [];
    
    const parts = project.materials_notes.split('--- INSPIRATION_MOODBOARD ---');
    if (parts.length < 2) return [];
    
    try {
        return JSON.parse(parts[1].trim()) || [];
    } catch (e) {
        console.error('Error parsing inspirations JSON fallback:', e);
        return [];
    }
}

export async function addBridalInspiration(projectId: string, imageUrl: string, category: string, notes: string = '') {
    const supabase = getAdminClient();
    
    // Try primary table insert
    const { data, error } = await supabase
        .from('bridal_inspirations')
        .insert([{
            project_id: projectId,
            image_url: imageUrl,
            category,
            notes
        }])
        .select();
        
    if (!error) {
        revalidatePath(`/portal-novias/${projectId}`);
        return { success: true, data };
    }
    
    // Fallback: append to materials_notes JSON list
    console.log('Insert failed, falling back to appending to materials_notes...', error.message);
    const { data: project } = await supabase
        .from('bridal_projects')
        .select('materials_notes')
        .eq('id', projectId)
        .single();
        
    let baseNotes = '';
    let inspirations = [];
    
    if (project && project.materials_notes) {
        const parts = project.materials_notes.split('--- INSPIRATION_MOODBOARD ---');
        baseNotes = parts[0];
        if (parts.length >= 2) {
            try {
                inspirations = JSON.parse(parts[1].trim()) || [];
            } catch (e) {
                console.error('Error parsing fallback list:', e);
            }
        }
    }
    
    const newItem = {
        id: Math.random().toString(36).substring(2, 11),
        project_id: projectId,
        image_url: imageUrl,
        category,
        notes,
        created_at: new Date().toISOString()
    };
    
    inspirations.unshift(newItem);
    
    const updatedNotes = `${baseNotes.trim()}\n\n--- INSPIRATION_MOODBOARD ---\n${JSON.stringify(inspirations, null, 2)}`;
    
    // Update bridal_projects
    await supabase
        .from('bridal_projects')
        .update({ materials_notes: updatedNotes })
        .eq('id', projectId);
        
    // Update work_orders to keep in sync
    await supabase
        .from('work_orders')
        .update({ materials_notes: updatedNotes })
        .eq('legacy_bridal_project_id', projectId);
        
    revalidatePath(`/portal-novias/${projectId}`);
    return { success: true, data: [newItem] };
}

export async function deleteBridalInspiration(projectId: string, inspirationId: string) {
    const supabase = getAdminClient();
    
    // Try primary table delete
    const { error } = await supabase
        .from('bridal_inspirations')
        .delete()
        .eq('id', inspirationId);
        
    if (!error) {
        revalidatePath(`/portal-novias/${projectId}`);
        return { success: true };
    }
    
    // Fallback: remove from materials_notes JSON list
    console.log('Delete failed, falling back to materials_notes update...', error.message);
    const { data: project } = await supabase
        .from('bridal_projects')
        .select('materials_notes')
        .eq('id', projectId)
        .single();
        
    if (!project || !project.materials_notes) return { success: false, error: 'Proyecto no encontrado' };
    
    const parts = project.materials_notes.split('--- INSPIRATION_MOODBOARD ---');
    if (parts.length < 2) return { success: false, error: 'Inspiración no encontrada' };
    
    let inspirations = [];
    try {
        inspirations = JSON.parse(parts[1].trim()) || [];
    } catch (e) {
        return { success: false, error: 'Error al parsear el moodboard' };
    }
    
    const filtered = inspirations.filter((item: any) => item.id !== inspirationId);
    const updatedNotes = `${parts[0].trim()}\n\n--- INSPIRATION_MOODBOARD ---\n${JSON.stringify(filtered, null, 2)}`;
    
    // Update bridal_projects
    await supabase
        .from('bridal_projects')
        .update({ materials_notes: updatedNotes })
        .eq('id', projectId);
        
    // Update work_orders
    await supabase
        .from('work_orders')
        .update({ materials_notes: updatedNotes })
        .eq('legacy_bridal_project_id', projectId);
        
    revalidatePath(`/portal-novias/${projectId}`);
    return { success: true };
}

export async function registerBridalInstallment(projectId: string, installmentIndex: number, paymentMethod: string = 'Efectivo/Transferencia') {
    const supabase = getAdminClient();
    
    // 1. Fetch work_order
    const { data: woData } = await supabase
        .from('work_orders')
        .select('*')
        .eq('legacy_bridal_project_id', projectId)
        .maybeSingle();
        
    if (!woData || !woData.payment_plan || !woData.payment_plan.cuotas) {
        return { success: false, error: 'Plan de pagos no encontrado' };
    }
    
    const plan = woData.payment_plan;
    const cuota = plan.cuotas[installmentIndex];
    if (!cuota) return { success: false, error: 'Cuota no encontrada' };
    
    cuota.status = 'paid';
    cuota.fecha = new Date().toISOString();
    
    // Recalculate total paid
    const newPaidAmount = plan.cuotas
        .filter((c: any) => c.status === 'paid')
        .reduce((acc: number, curr: any) => acc + (curr.amount || curr.monto || 0), 0);
        
    let newPaymentStatus = 'pending';
    if (newPaidAmount >= (woData.total_amount || 0) && (woData.total_amount || 0) > 0) newPaymentStatus = 'paid';
    else if (newPaidAmount > 0) newPaymentStatus = 'partial';
    
    // Update work_order
    const { error: woError } = await supabase
        .from('work_orders')
        .update({
            payment_plan: plan,
            paid_amount: newPaidAmount,
            payment_status: newPaymentStatus,
            updated_at: new Date().toISOString()
        })
        .eq('legacy_bridal_project_id', projectId);
        
    if (woError) return { success: false, error: woError.message };
    
    // 2. Dual write/update bridal_projects status
    const updates: Record<string, any> = {
        updated_at: new Date().toISOString()
    };
    
    // If it's the first installment, mark as en_proceso
    if (installmentIndex === 0) {
        updates.status = 'en_proceso';
    }
    
    // Sync payment_1, 2, 3 columns if they exist in standard positions
    if (installmentIndex === 0) {
        updates.payment_1_status = 'paid';
        updates.payment_1_date = cuota.fecha;
    } else if (installmentIndex === 1) {
        updates.payment_2_status = 'paid';
        updates.payment_2_date = cuota.fecha;
    } else if (installmentIndex === 2 && plan.cuotas.length === 3) {
        updates.payment_3_status = 'paid';
        updates.payment_3_date = cuota.fecha;
    }
    
    await supabase.from('bridal_projects').update(updates).eq('id', projectId);
    
    // 3. Register in sales_ledger
    const ledgerId = `bridal_${projectId}_custom_p${installmentIndex + 1}`;
    const amount = cuota.amount || cuota.monto || 0;
    
    const { data: existingLedger } = await supabase
        .from('sales_ledger')
        .select('id')
        .eq('internal_id', ledgerId)
        .maybeSingle();

    if (!existingLedger && amount > 0) {
        await supabase
            .from('sales_ledger')
            .insert([{
                internal_id: ledgerId,
                customer_id: woData.customer_id,
                total_amount: amount,
                paid_amount: amount,
                status: 'completed',
                payment_method: paymentMethod,
                branch: 'Alta Costura'
            }]);
    }
    
    revalidatePath(`/admin/novias/${projectId}`);
    return { success: true };
}

export async function updatePaymentPlanAction(projectId: string, paymentPlanJson: string) {
    const supabase = getAdminClient();
    
    try {
        const paymentPlan = JSON.parse(paymentPlanJson);
        
        // Find existing work_order
        const { data: woData, error: woError } = await supabase
            .from('work_orders')
            .select('id, paid_amount')
            .eq('legacy_bridal_project_id', projectId)
            .maybeSingle();
            
        if (woError || !woData) {
            return { success: false, error: 'Orden de trabajo no encontrada' };
        }
        
        // Ensure paid_amount is respected or handled (simplified assumption: update raw plan)
        await supabase
            .from('work_orders')
            .update({ 
                payment_plan: paymentPlan, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', woData.id);
            
        revalidatePath(`/admin/novias/${projectId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating payment plan:', error);
        return { success: false, error: error.message || 'Error al actualizar plan de pagos' };
    }
}
