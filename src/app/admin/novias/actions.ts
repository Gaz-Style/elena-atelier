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
    
    let payment1 = 0;
    let payment2 = 0;
    let payment3 = 0;
    let parsedPaymentPlan = null;

    if (paymentPlanJson) {
        try {
            parsedPaymentPlan = JSON.parse(paymentPlanJson);
            if (parsedPaymentPlan && parsedPaymentPlan.cuotas && parsedPaymentPlan.cuotas.length > 0) {
                // Ensure all items in cuotas have amount / monto synced
                parsedPaymentPlan.cuotas = parsedPaymentPlan.cuotas.map((c: any) => ({
                    ...c,
                    amount: c.amount !== undefined ? c.amount : c.monto,
                    monto: c.monto !== undefined ? c.monto : c.amount
                }));

                const cuotas = parsedPaymentPlan.cuotas;
                payment1 = cuotas[0] ? (cuotas[0].amount || cuotas[0].monto || 0) : 0;
                payment2 = cuotas[1] ? (cuotas[1].amount || cuotas[1].monto || 0) : 0;
                if (cuotas.length > 2) {
                    payment3 = cuotas.slice(2).reduce((sum: number, c: any) => sum + (c.amount || c.monto || 0), 0);
                }
            }
        } catch (e) {
            console.error('Error parsing custom payment plan:', e);
        }
    }

    // Fallback if no custom payment plan was provided or parsed successfully
    if (!parsedPaymentPlan || !parsedPaymentPlan.cuotas || parsedPaymentPlan.cuotas.length === 0) {
        const isNovia = projectType === 'novia';
        payment1 = Math.round(totalAmount * 0.5);
        payment2 = isNovia ? Math.round(totalAmount * 0.25) : totalAmount - payment1;
        payment3 = isNovia ? totalAmount - payment1 - payment2 : 0;

        const defaultCuotas = [];
        if (payment1 > 0) defaultCuotas.push({ numero: 1, name: 'Abono Inicial', monto: payment1, amount: payment1, status: 'pending', date: new Date().toISOString().split('T')[0] });
        if (payment2 > 0) defaultCuotas.push({ numero: 2, name: isNovia ? 'Prueba Intermedia' : 'Contra Entrega', monto: payment2, amount: payment2, status: 'pending', date: null });
        if (payment3 > 0) defaultCuotas.push({ numero: 3, name: 'Contra Entrega', monto: payment3, amount: payment3, status: 'pending', date: null });
        
        parsedPaymentPlan = { cuotas: defaultCuotas };
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
        const { data: woData } = await supabase.from('work_orders').insert([{
            customer_id: customerId || null,
            order_type: projectType,
            order_category: 'alta_costura',
            status: 'contrato_pendiente',
            description: description || `Vestido de ${projectType}`,
            total_amount: totalAmount,
            paid_amount: 0,
            payment_status: 'pending',
            payment_plan: parsedPaymentPlan,
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
    if (updates.status !== undefined) {
        woUpdates.status = updates.status;
        
        let prodStatus = undefined;
        if (updates.status === 'entregado') prodStatus = 'delivered';
        else if (updates.status === 'cancelado') prodStatus = 'cancelled';
        
        if (prodStatus) {
            await supabase
                .from('production_orders')
                .update({ status: prodStatus })
                .eq('pos_order_id', id);
        }
    }
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
    
    // Trigger email payment confirmation receipt
    try {
        await sendBridalPaymentConfirmationEmailAction(projectId, paymentNumber - 1, amount, paymentMethod);
    } catch (mailErr) {
        console.error('Error automatically sending payment confirmation email in registerPayment:', mailErr);
    }

    return { success: true };
}

export async function acceptContract(projectId: string) {
    const supabase = getAdminClient();
    
    const { error } = await supabase
        .from('bridal_projects')
        .update({
            contract_accepted: true,
            contract_accepted_at: new Date().toISOString(),
            status: 'esperando_pago', // Updated from contrato_pendiente to reflect acceptance but pending payment
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

        await supabase
            .from('production_orders')
            .update({ status: 'delivered' })
            .eq('pos_order_id', projectId);
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

export async function updateTimelineAction(projectId: string, milestonesData: any[]) {
    try {
        const supabase = getAdminClient();
        
        // 1. Get project and customer details
        const { data: project, error: projectErr } = await supabase
            .from('bridal_projects')
            .select('*, customers(id, full_name, email, phone)')
            .eq('id', projectId)
            .single();

        if (projectErr || !project) {
            throw new Error('Proyecto no encontrado');
        }

        // 2. Get corresponding work_order
        const { data: woData } = await supabase
            .from('work_orders')
            .select('id')
            .eq('legacy_bridal_project_id', projectId)
            .maybeSingle();

        // 3. Get current milestones in database
        const { data: currentMilestones, error: fetchErr } = await supabase
            .from('bridal_milestones')
            .select('id, agenda_event_id, milestone_type')
            .eq('project_id', projectId);
            
        if (fetchErr) {
            throw new Error('Error al obtener hitos actuales: ' + fetchErr.message);
        }
            
        const currentIds: string[] = (currentMilestones || []).map((m: any) => m.id as string);
        const newIds: string[] = milestonesData.filter((m: any) => m.id).map((m: any) => m.id as string);
        
        // 4. Handle Deletions
        const idsToDelete = currentIds.filter((id: string) => !newIds.includes(id));
        if (idsToDelete.length > 0) {
            const milestonesToDelete = (currentMilestones || []).filter((m: any) => idsToDelete.includes(m.id));
            
            // Delete corresponding agenda events
            const agendaIdsToDelete = milestonesToDelete.map((m: any) => m.agenda_event_id).filter(Boolean);
            if (agendaIdsToDelete.length > 0) {
                const { error: deleteAgendaErr } = await supabase
                    .from('agendamientos')
                    .update({ estado: 'cancelado' })
                    .in('id', agendaIdsToDelete);
                if (deleteAgendaErr) {
                    console.error('Error al cancelar eventos de agenda:', deleteAgendaErr);
                }
            }

            // Delete from work_order_milestones
            if (woData) {
                const typesToDelete = milestonesToDelete.map((m: any) => m.milestone_type);
                const { error: deleteWoMilestonesErr } = await supabase
                    .from('work_order_milestones')
                    .delete()
                    .eq('work_order_id', woData.id)
                    .in('milestone_type', typesToDelete);
                if (deleteWoMilestonesErr) {
                    console.error('Error al eliminar hitos de work_orders:', deleteWoMilestonesErr);
                }
            }

            // Delete from bridal_milestones
            const { error: deleteMilestonesErr } = await supabase
                .from('bridal_milestones')
                .delete()
                .in('id', idsToDelete);
            if (deleteMilestonesErr) {
                throw new Error('Error al eliminar hitos: ' + deleteMilestonesErr.message);
            }
        }
        
        // 5. Handle Updates and Inserts
        for (const m of milestonesData) {
            let agendaEventId = m.agenda_event_id || null;
            
            // Sync with agendamientos table
            if (m.scheduled_date) {
                if (agendaEventId) {
                    // Update existing appointment
                    const { error: updateAgendaErr } = await supabase
                        .from('agendamientos')
                        .update({
                            fecha_hora: m.scheduled_date,
                            notas: `Prueba coordinada: ${m.title}`
                        })
                        .eq('id', agendaEventId);
                        
                    if (updateAgendaErr) {
                        if (updateAgendaErr.code === '23505') {
                            throw new Error(`El horario del hito "${m.title}" ya está ocupado por otra cita.`);
                        }
                        throw new Error(`Error al actualizar agenda para "${m.title}": ` + updateAgendaErr.message);
                    }
                } else {
                    // Create new appointment
                    const fullName = project.customers?.full_name || 'Novia';
                    const nameParts = fullName.trim().split(/\s+/);
                    const nombre = nameParts[0] || 'Novia';
                    const apellido = nameParts.slice(1).join(' ') || '';

                    const { data: newEvent, error: insertAgendaErr } = await supabase
                        .from('agendamientos')
                        .insert([{
                            nombre,
                            apellido,
                            celular: project.customers?.phone || '',
                            correo: project.customers?.email || '',
                            fecha_hora: m.scheduled_date,
                            origen: 'admin',
                            tipo_evento: 'cita_cliente',
                            estado: 'confirmado',
                            notas: `Prueba coordinada: ${m.title}`
                        }])
                        .select()
                        .maybeSingle();

                    if (insertAgendaErr) {
                        if (insertAgendaErr.code === '23505') {
                            throw new Error(`El horario del hito "${m.title}" ya está ocupado por otra cita.`);
                        }
                        throw new Error(`Error al crear agenda para "${m.title}": ` + insertAgendaErr.message);
                    }
                    if (newEvent) {
                        agendaEventId = newEvent.id;
                    }
                }
            } else {
                // If scheduled_date was cleared, cancel the appointment
                if (agendaEventId) {
                    await supabase.from('agendamientos').update({ estado: 'cancelado' }).eq('id', agendaEventId);
                    agendaEventId = null;
                }
            }

            const payload = {
                project_id: projectId,
                title: m.title,
                scheduled_date: m.scheduled_date || null,
                milestone_type: m.milestone_type || 'custom',
                status: m.status || 'pending',
                agenda_event_id: agendaEventId
            };

            if (m.id) {
                // Update bridal_milestones
                const { error: updateMilestoneErr } = await supabase
                    .from('bridal_milestones')
                    .update(payload)
                    .eq('id', m.id);
                if (updateMilestoneErr) {
                    throw new Error(`Error al actualizar hito "${m.title}": ` + updateMilestoneErr.message);
                }

                // Update work_order_milestones
                if (woData) {
                    const { error: updateWoMilestoneErr } = await supabase
                        .from('work_order_milestones')
                        .update({
                            title: m.title,
                            scheduled_date: m.scheduled_date || null,
                            status: m.status || 'pending',
                            agenda_event_id: agendaEventId
                        })
                        .eq('work_order_id', woData.id)
                        .eq('milestone_type', m.milestone_type || 'custom');
                    if (updateWoMilestoneErr) {
                        console.error('Error al actualizar hito de work_orders:', updateWoMilestoneErr);
                    }
                }
            } else {
                // Insert bridal_milestones
                const { data: newMilestone, error: insertMilestoneErr } = await supabase
                    .from('bridal_milestones')
                    .insert([payload])
                    .select()
                    .single();
                if (insertMilestoneErr) {
                    throw new Error(`Error al insertar hito "${m.title}": ` + insertMilestoneErr.message);
                }

                // Insert work_order_milestones
                if (woData && newMilestone) {
                    const { error: insertWoMilestoneErr } = await supabase
                        .from('work_order_milestones')
                        .insert([{
                            work_order_id: woData.id,
                            milestone_type: m.milestone_type || 'custom',
                            title: m.title,
                            scheduled_date: m.scheduled_date || null,
                            status: m.status || 'pending',
                            agenda_event_id: agendaEventId
                        }]);
                    if (insertWoMilestoneErr) {
                        console.error('Error al insertar hito de work_orders:', insertWoMilestoneErr);
                    }
                }
            }
        }
        
        revalidatePath(`/admin/novias/${projectId}`);
        revalidatePath(`/admin/agenda`);
        revalidatePath(`/admin/planificador`);
        return { success: true };
    } catch (e: any) {
        console.error('Error in updateTimelineAction:', e);
        return { success: false, error: e.message || 'Error al actualizar el cronograma' };
    }
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

    await supabase
        .from('production_orders')
        .update({ status: 'cancelled' })
        .eq('pos_order_id', projectId);
    
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
        <td style="font-family:'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 900; color: #1A1A1A; letter-spacing: 12px; text-transform: uppercase; text-align: center; line-height: 1; padding: 0 0 0 12px;">
          ELENA
        </td>
      </tr>
      <tr>
        <td style="font-family:'Inter', -apple-system, sans-serif; font-size: 8px; font-weight: 700; color: #1A1A1A; letter-spacing: 5.8px; text-transform: uppercase; text-align: center; padding-top: 8px; line-height: 1; padding-left: 5.8px; width: 100%;">
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
        const customerName = project.customers.full_name || 'Futura Clienta';
        const siteUrl = await getSiteUrl();
        const isFiesta = project.project_type === 'madrina' || project.project_type === 'graduacion';
        const portalBase = isFiesta ? 'portal-fiesta' : 'portal-novias';
        const portalLink = `${siteUrl}/${portalBase}/${projectId}/induccion`;

        // Luxury background image logic
        const attachments: any[] = [];
        // Gmail y clientes móviles bloquean imágenes de fondo cid:, por lo que usamos la URL pública absoluta
        const cardBgUrl = `${siteUrl}/novia/novia_base.jpg`;

        const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&display=swap');
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #FCFAF7; font-family: 'Inter', Helvetica, sans-serif;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #FCFAF7; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Advanced Inset Border Container -->
        <table width="380" border="0" cellpadding="0" cellspacing="0" style="box-shadow: 0 25px 50px rgba(0,0,0,0.08);">
          
          <!-- TOP SECTION (Background Image + Gradient) -->
          <tr>
            <td background="${cardBgUrl}" bgcolor="#F5F5F0" style="background: linear-gradient(rgba(252, 250, 247, 0.50), rgba(252, 250, 247, 0.50)), url('${cardBgUrl}') left top no-repeat; background-image: linear-gradient(rgba(252, 250, 247, 0.50), rgba(252, 250, 247, 0.50)), url('${cardBgUrl}'); background-size: 100% 100%; background-position: left top; background-repeat: no-repeat;">
              
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <!-- Top inset margin -->
                <tr><td height="15" colspan="3"></td></tr>
                
                <!-- Main content row with side insets -->
                <tr>
                  <td width="15"></td>
                  <!-- Softer inset border -->
                  <td style="border-top: 1px solid rgba(193,127,95,0.3); border-left: 1px solid rgba(193,127,95,0.3); border-right: 1px solid rgba(193,127,95,0.3); padding: 40px 10px;">
                    
                    <!-- Text Container (center aligned within left column) -->
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center">
                      <tr>
                        <td align="center" style="text-align: center;">
                          <!-- Logo -->
                          ${emailLogoHtml}
                          
                          <!-- Subtle logo divider -->
                          <table width="60" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 20px auto 20px auto;">
                            <tr>
                              <td width="22" valign="middle" style="vertical-align: middle; line-height: 0; font-size: 0;"><div style="height: 1px; background: rgba(193,127,95,0.4); background: linear-gradient(to left, rgba(193,127,95,0.4) 0%, transparent 100%); font-size: 0; line-height: 0; width: 100%;"></div></td>
                              <td width="16" align="center" valign="middle" style="font-size: 10px; color: rgba(193,127,95,0.7); padding: 0 4px; line-height: 1; vertical-align: middle;">&#x2726;</td>
                              <td width="22" valign="middle" style="vertical-align: middle; line-height: 0; font-size: 0;"><div style="height: 1px; background: rgba(193,127,95,0.4); background: linear-gradient(to right, rgba(193,127,95,0.4) 0%, transparent 100%); font-size: 0; line-height: 0; width: 100%;"></div></td>
                            </tr>
                          </table>
                          
                          <p style="color: #C17F5F; font-size: 8px; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 25px 0; font-weight: 600;">
                            ACCESO PORTAL PRIVADO
                          </p>
                          
                          <p style="font-family: 'Inter', Helvetica, sans-serif; color: #6B6660; font-size: 9px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 5px 0; font-weight: 400;">
                            BIENVENIDA
                          </p>
                          
                          <p style="font-family: 'Playfair Display', Georgia, serif; color: #1A1A1A; font-size: 32px; margin: 0 0 15px 0; font-style: italic; font-weight: 400;">
                            ${customerName}
                          </p>
                          
                          <!-- Gold divider line with subtle center shape and softer lines -->
                          <table width="160" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 25px auto;">
                            <tr>
                              <td width="70" valign="middle" style="vertical-align: middle; line-height: 0; font-size: 0;"><div style="height: 1px; background: rgba(193,127,95,0.4); background: linear-gradient(to left, rgba(193,127,95,0.4) 0%, transparent 100%); font-size: 0; line-height: 0; width: 100%;"></div></td>
                              <td width="20" align="center" valign="middle" style="font-size: 10px; color: rgba(193,127,95,0.7); padding: 0 4px; line-height: 1; vertical-align: middle;">&#x2726;</td>
                              <td width="70" valign="middle" style="vertical-align: middle; line-height: 0; font-size: 0;"><div style="height: 1px; background: rgba(193,127,95,0.4); background: linear-gradient(to right, rgba(193,127,95,0.4) 0%, transparent 100%); font-size: 0; line-height: 0; width: 100%;"></div></td>
                            </tr>
                          </table>
                          
                          <p style="color: #4A4A4A; font-size: 11px; line-height: 1.8; margin: 0 auto 25px auto; font-weight: 300; max-width: 260px;">
                            Es un privilegio acompañarte en este proceso.<br>Te invitamos a vivir la experiencia<br>Elena Atelier.
                          </p>
                          
                          <!-- Centered Button -->
                          <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                            <tr>
                              <td align="center">
                                <a href="${portalLink}" target="_blank" style="font-size: 11px; font-family: 'Inter', Helvetica, sans-serif; font-weight: 600; color: #C17F5F; background-color: #F5ECE3; text-decoration: none; padding: 12px 30px; border: 1px solid rgba(193,127,95,0.4); display: inline-block; text-transform: uppercase; letter-spacing: 3px;">
                                  INGRESAR AL PORTAL
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <div style="margin-top: 45px;"></div>
                          
                          <!-- Footer signature -->
                          <table width="240" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 20px;">
                            <tr>
                              <td align="right" style="padding-right: 15px; border-right: 1px solid rgba(193,127,95,0.25); vertical-align: middle;">
                                <span style="font-family:'Playfair Display', Georgia, serif; font-size: 26px; color: #C17F5F; letter-spacing: 1px;">E</span>
                              </td>
                              <td align="left" style="padding-left: 15px; vertical-align: middle;">
                                <p style="font-family: 'Inter', Helvetica, sans-serif; color: #1A1A1A; font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 3px 0;">
                                  ELENA ATELIER
                                </p>
                                <p style="font-family: 'Inter', Helvetica, sans-serif; color: #8B8680; font-size: 7px; letter-spacing: 1px; text-transform: uppercase; margin: 0;">
                                  ATELIER &middot; SANTIAGO DE CHILE
                                </p>
                              </td>
                            </tr>
                          </table>
                          
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                  <td width="15"></td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- BOTTOM SECTION (Black Footer) -->
          <tr>
            <td bgcolor="#1A1A1A">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="15"></td>
                  <!-- The Frame Container -->
                  <td style="padding: 0;">
                    
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <!-- 1. Vertical borders continuing into the black area -->
                      <tr>
                        <td style="border-left: 1px solid rgba(193,127,95,0.4); border-right: 1px solid rgba(193,127,95,0.4);">
                           <table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td height="12" style="font-size:0; line-height:0;">&nbsp;</td></tr></table>
                        </td>
                      </tr>
                      
                      <!-- 2. The broken bottom border, perfect corners, and floating content in the gap -->
                      <tr>
                        <td style="padding: 0;">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <!-- Left corner and left segment of main bottom line (Fading out to the center) -->
                              <td valign="bottom" style="border-left: 1px solid rgba(193,127,95,0.4); font-size: 0; line-height: 0; padding: 0;">
                                <div style="height: 1px; background: rgba(193,127,95,0.4); background: linear-gradient(to right, rgba(193,127,95,0.4) 0%, transparent 100%); width: 100%;"></div>
                              </td>
                              
                              <!-- MASSIVE GAP (290px) containing the text and the independent floating heart divider -->
                              <td width="290" align="center" valign="bottom" style="padding-bottom: 0px;">
                                 
                                 <!-- Independent Floating Heart Divider (Above the text, with needle point fading lines extended to text width) -->
                                 <table width="240" border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 12px;">
                                   <tr>
                                     <td width="105" valign="middle"><div style="height: 1px; background: rgba(193,127,95,0.3); background: linear-gradient(to left, rgba(193,127,95,0.3) 0%, transparent 100%); font-size: 0; line-height: 0; width: 100%;"></div></td>
                                     <td width="30" align="center" valign="middle" style="font-size: 11px; color: rgba(193,127,95,0.8); line-height: 1;">&#9825;</td>
                                     <td width="105" valign="middle"><div style="height: 1px; background: rgba(193,127,95,0.3); background: linear-gradient(to right, rgba(193,127,95,0.3) 0%, transparent 100%); font-size: 0; line-height: 0; width: 100%;"></div></td>
                                   </tr>
                                 </table>
                                 
                                 <!-- Text perfectly aligned with the main bottom line break -->
                                 <div style="position: relative; top: 3px;">
                                   <p style="font-family: 'Inter', Helvetica, sans-serif; color: #8B8680; font-size: 7px; letter-spacing: 2px; text-transform: uppercase; margin: 0; line-height: 1;">
                                     &copy; ${new Date().getFullYear()} ELENA ATELIER - DERECHOS RESERVADOS
                                   </p>
                                 </div>
                                 
                              </td>
                              
                              <!-- Right corner and right segment of main bottom line (Fading out to the center) -->
                              <td valign="bottom" style="border-right: 1px solid rgba(193,127,95,0.4); font-size: 0; line-height: 0; padding: 0;">
                                <div style="height: 1px; background: rgba(193,127,95,0.4); background: linear-gradient(to left, rgba(193,127,95,0.4) 0%, transparent 100%); width: 100%;"></div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                  <td width="15"></td>
                </tr>
                <!-- Spacer below the frame to keep proportions -->
                <tr><td height="25" colspan="3"></td></tr>
              </table>
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
            from: '"Elena Atelier" <contacto@elenalacosturera.cl>',
            to: customerEmail,
            subject: `Acceso a tu Portal - ${customerName}`,
            text: `Te damos la bienvenida, ${customerName},\n\nEs un privilegio acompañarte en este proceso. Te invitamos a vivir la experiencia Elena Atelier.\n\nPuedes ingresar a tu portal privado en el siguiente enlace:\n${portalLink}\n\nAtentamente,\nElena Atelier`,
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
                      BIENVENIDA
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
            from: '"Elena Atelier" <contacto@elenalacosturera.cl>',
            replyTo: 'contacto@elenalacosturera.cl',
            to: customerEmail,
            subject: `Información de tu proyecto - ${customerName}`,
            text: `Te damos la bienvenida, ${customerName},\n\nComo parte del proceso de tu proyecto, hemos preparado un breve video explicativo.\nTe pedimos que lo revises antes de tu próxima cita para que puedas resolver cualquier duda.\n\nPuedes ver el video ingresando a tu portal privado en el siguiente enlace:\n${portalLink}\n\nAtentamente,\nElena Atelier`,
            html: htmlContent,
            attachments
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
        const isFiesta = project.project_type === 'madrina' || project.project_type === 'graduacion';
        const portalBase = isFiesta ? 'portal-fiesta' : 'portal-novias';
        const paymentLink = `${siteUrl}/${portalBase}/${projectId}/pagar`;
        const proposalLink = `${siteUrl}/${portalBase}/${projectId}/contrato`;

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
<body style="margin: 0; padding: 0; background-color: #F5F5F0; font-family: 'Inter', Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F5F5F0; padding: 50px 20px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table width="580" border="0" cellpadding="0" cellspacing="0" style="background-color: #FCFAF7; border-top: 3px solid #C17F5F; border-radius: 4px; overflow: hidden; box-shadow: 0 20px 50px rgba(193,127,95,0.1); border: 1px solid #EAE6D7;">
          <!-- Main Content -->
          <tr>
            <td style="padding: 60px 40px; text-align: center;">
              <!-- Logo -->
              ${emailLogoHtml}
              
              <div style="margin-top: 40px; border-bottom: 1px solid rgba(193,127,95,0.15); padding-bottom: 25px;">
                <p style="color: #C17F5F; font-size: 8px; text-transform: uppercase; letter-spacing: 5px; margin: 0 0 12px 0; font-weight: 600;">
                  DOCUMENTO DE SERVICIO
                </p>
                <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #1A1A1A; font-size: 26px; font-weight: 400; margin: 0; font-style: italic; letter-spacing: 0.5px;">
                  Propuesta y Contrato Formal
                </h1>
              </div>

              <div style="margin-top: 35px; text-align: left;">
                <p style="color: #4A4A4A; font-size: 13px; line-height: 1.8; font-weight: 300; margin: 0 0 20px 0;">
                  Te damos la bienvenida, <strong style="color: #1A1A1A; font-weight: 600;">${customerName}</strong>,
                </p>
                <p style="color: #4A4A4A; font-size: 13px; line-height: 1.8; font-weight: 300; margin: 0 0 30px 0;">
                  Hemos recibido exitosamente la aceptación de tu propuesta y la firma del contrato. Queremos agradecerte por confiar en Elena Atelier para confeccionar tu vestido soñado.
                </p>
                <p style="color: #4A4A4A; font-size: 13px; line-height: 1.8; font-weight: 300; margin: 0 0 35px 0;">
                  Como último paso para consolidar tu reserva y bloquear tu cupo exclusivo de producción, te invitamos a revisar tu documento final y gestionar tu abono inicial.
                </p>
              </div>

              <!-- Button -->
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 10px auto;">
                <tr>
                  <td align="center">
                    <a href="${proposalLink}" target="_blank" style="font-size: 10px; font-family: 'Inter', Helvetica, Arial, sans-serif; font-weight: 600; color: #FCFAF7; background-color: #C17F5F; text-decoration: none; padding: 16px 35px; border: 1px solid #C17F5F; display: inline-block; text-transform: uppercase; letter-spacing: 3px; border-radius: 2px; transition: all 0.3s ease;">
                      REVISAR CONTRATO Y PROCESAR PAGO
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Signature/Address -->
          <tr>
            <td style="background-color: #F5F5F0; padding: 35px 40px; text-align: center; border-top: 1px solid rgba(193,127,95,0.15);">
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
            from: '"Elena Atelier" <contacto@elenalacosturera.cl>',
            to: customerEmail,
            subject: `Revisión de Contrato y Presupuesto - ${customerName}`,
            text: `Te damos la bienvenida, ${customerName},\n\nTe hemos enviado tu contrato y presupuesto para revisión.\n\nPuedes ingresar a tu portal privado en el siguiente enlace:\n${proposalLink}\n\nAtentamente,\nElena Atelier`,
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

        const smtpUser = process.env.SMTP_USER || '';
        const fromAddress = smtpUser.includes('gmail.com') ? 'contacto@elenalacosturera.cl' : smtpUser;

        const transporter = getTransporter();
        await transporter.sendMail({
            from: '"Elena Atelier" <contacto@elenalacosturera.cl>',
            to: customerEmail,
            subject: `¡Reserva Confirmada! Gracias por elegir Elena Atelier`,
            text: `Te damos la bienvenida, ${customerName},\n\nHemos recibido exitosamente la firma de tu contrato y el abono inicial. Tu cupo de producción ya está oficialmente reservado en nuestro atelier.\n\nEn los próximos días nos contactaremos contigo para agendar tu primera prueba.\n\nAtentamente,\nElena Atelier`,
            html: htmlContent
        });

        return { success: true };
    } catch (e: any) {
        console.error('Error sending thank you email:', e);
        return { success: false, error: e.message };
    }
}

export async function sendBridalPaymentConfirmationEmailAction(projectId: string, cuotaIndex: number, amount: number, paymentMethod: string = 'Webpay') {
    try {
        const supabase = getAdminClient();
        const { data: project } = await supabase.from('bridal_projects')
            .select('*, customers(email, full_name)')
            .eq('id', projectId).single();
            
        if (!project || !project.customers?.email) throw new Error('Proyecto no encontrado');
        
        const customerEmail = project.customers.email;
        const customerName = project.customers.full_name || 'Clienta';
        const formattedAmount = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
        const cuotaName = cuotaIndex > 0 ? `Cuota ${cuotaIndex + 1}` : 'Abono Inicial';

        // Fetch work order to get total budget, total paid, and balance
        let total = project.total_amount || 0;
        let paidSoFar = amount;
        let balance = Math.max(0, total - paidSoFar);
        
        const { data: woData } = await supabase
            .from('work_orders')
            .select('total_amount, paid_amount')
            .eq('legacy_bridal_project_id', projectId)
            .maybeSingle();
            
        if (woData) {
            total = woData.total_amount || total;
            paidSoFar = woData.paid_amount || paidSoFar;
            balance = Math.max(0, total - paidSoFar);
        }

        const dateStr = new Date().toLocaleDateString('es-CL', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).toUpperCase();

        const siteUrl = await getSiteUrl();
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

        const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Elena La Costurera — Comprobante de Pago</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300&family=Inter:wght@200;300;400;500;600&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #F0EDE8; margin: 0; padding: 24px; -webkit-font-smoothing: antialiased;">
  <!-- Card Container -->
  <div style="max-width: 360px; margin: 0 auto; background-color: #1A1A1A; background-image: linear-gradient(to bottom, rgba(26, 26, 26, 0.4) 0%, rgba(26, 26, 26, 0.85) 75%, #1A1A1A 100%), url('${cardBgUrl}'); background-size: cover; background-position: center; border-radius: 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.2); border: 1px solid rgba(245, 242, 235, 0.15); overflow: hidden; color: #F5F5F0;">
    
    <!-- Tag Hole -->
    <div style="width: 12px; height: 12px; background-color: #F0EDE8; border-radius: 50%; margin: 28px auto 0 auto; opacity: 0.9;"></div>
    
    <!-- Header -->
    <div style="text-align: center; padding: 28px 20px 24px 20px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; width: 130px; border-collapse: collapse;">
        <tr>
          <td>
            <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="left" style="font-family:'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; line-height: 1; padding: 0;">E</td>
                <td align="center" style="font-family:'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; line-height: 1; padding: 0;">L</td>
                <td align="center" style="font-family:'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; line-height: 1; padding: 0;">E</td>
                <td align="center" style="font-family:'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; line-height: 1; padding: 0;">N</td>
                <td align="right" style="font-family:'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 900; color: #FFFFFF; line-height: 1; padding: 0;">A</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 8px; line-height: 1; font-size: 1px;">&nbsp;</td>
        </tr>
        <tr>
          <td>
            <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="left" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">L</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">A</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0; width: 6px;">&nbsp;</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">C</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">O</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">S</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">T</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">U</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">R</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">E</td>
                <td align="center" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">R</td>
                <td align="right" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 7.5px; font-weight: 700; color: #FFFFFF; line-height: 1; padding: 0;">A</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Table-based Ticket Divider -->
    <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin: 0; border-collapse: collapse;">
      <tr>
        <td style="width: 8px; height: 16px; background-color: #F0EDE8; border-radius: 0 8px 8px 0;"></td>
        <td style="border-bottom: 1px dashed rgba(245, 242, 235, 0.12); vertical-align: middle; height: 8px; line-height: 1px; font-size: 1px;">&nbsp;</td>
        <td style="width: 8px; height: 16px; background-color: #F0EDE8; border-radius: 8px 0 0 8px;"></td>
      </tr>
    </table>
    
    <!-- Body -->
    <div style="padding: 30px 30px 40px 30px; text-align: center;">
      <p style="font-size: 8px; font-weight: 600; color: #C17F5F; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 4px 0; font-family: 'Inter', sans-serif;">Comprobante de Pago</p>
      
      <!-- ID del Proyecto Elegante y Limpio -->
      <p style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 300; color: #C17F5F; letter-spacing: 2px; margin: 0 0 10px 0; text-transform: uppercase;">
        Folio #${projectId.substring(0,8).toUpperCase()}
      </p>
      
      <!-- Nombre de Clienta como Protagonista -->
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-style: italic; font-weight: 400; color: #FFFFFF; margin: 0 0 24px 0; letter-spacing: 0.5px;">
        ${customerName}
      </h2>
      
      <div style="margin-bottom: 20px;">
        <div style="margin-bottom: 24px; text-align: left;">
          <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr style="border-bottom: 1px solid rgba(245, 242, 235, 0.08);">
              <td style="padding: 10px 0; text-align: left; vertical-align: top; font-family: 'Inter', sans-serif;">
                <!-- Descripcion con Medio de Pago -->
                <p style="margin: 0; font-size: 11px; font-weight: 500; color: #FFFFFF; line-height: 1.3; letter-spacing: 0.5px;">
                  Vestido de Novia (${cuotaName}) · <span style="color: #C17F5F; font-size: 10px; font-weight: 400;">${paymentMethod}</span>
                </p>
                <span style="font-size: 8px; text-transform: uppercase; color: #8A857D; font-weight: 500; letter-spacing: 1.5px; display: inline-block; margin-top: 2px;">Alta Costura</span>
              </td>
              <!-- PRECIO DE ARRIBA -->
              <td style="padding: 10px 0; text-align: right; vertical-align: top; font-family: 'Playfair Display', Georgia, serif; font-size: 13px; font-weight: bold; color: #FFFFFF;">
                ${formattedAmount}
              </td>
            </tr>
          </table>
          
          <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr>
              <td style="padding: 5px 0; text-align: left; font-size: 8px; font-weight: 600; color: #8A857D; letter-spacing: 2px; text-transform: uppercase; font-family: 'Inter', sans-serif;">Total Presupuestado</td>
              <td style="padding: 5px 0; text-align: right; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 300; color: #8A857D; letter-spacing: 1.5px;">
                ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(total)}
              </td>
            </tr>
            <tr>
              <td style="padding: 5px 0; text-align: left; font-size: 8px; font-weight: 600; color: #8A857D; letter-spacing: 2px; text-transform: uppercase; font-family: 'Inter', sans-serif;">Monto Abonado Hoy</td>
              <td style="padding: 5px 0; text-align: right; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 300; color: #8A857D; letter-spacing: 1.5px;">
                ${formattedAmount}
              </td>
            </tr>
            <tr>
              <td style="padding: 5px 0; text-align: left; font-size: 8px; font-weight: 600; color: #8A857D; letter-spacing: 2px; text-transform: uppercase; font-family: 'Inter', sans-serif;">Total Pagado Proyecto</td>
              <td style="padding: 5px 0; text-align: right; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 300; color: #8A857D; letter-spacing: 1.5px;">
                ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(paidSoFar)}
              </td>
            </tr>
            <tr>
              <td style="padding: 5px 0; text-align: left; font-size: 8px; font-weight: 600; color: #C17F5F; letter-spacing: 2px; text-transform: uppercase; font-family: 'Inter', sans-serif;">Saldo Pendiente</td>
              <td style="padding: 5px 0; text-align: right; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 300; color: #C17F5F; letter-spacing: 1.5px;">
                ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(balance)}
              </td>
            </tr>
          </table>
        </div>
      </div>
      
      <!-- FECHA PUESTA ABAJO -->
      <p style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 300; color: #8A857D; letter-spacing: 2.5px; text-transform: uppercase; margin: 28px 0 0 0; text-align: center;">
        ${dateStr}
      </p>
      
      <!-- Barcode -->
      <div style="margin: 24px 0 12px 0; text-align: center; opacity: 0.7;">
        <span style="display: inline-block; width: 1px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 2px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 1px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 3px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 1px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 2px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 1px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 4px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 1.5px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <span style="display: inline-block; width: 1px; height: 24px; background-color: #F5F5F0; margin: 0 1px;"></span>
        <div style="font-size: 7.5px; color: #8A857D; letter-spacing: 4px; margin-top: 6px; text-transform: uppercase; font-family: 'Inter', sans-serif;">ELENA*ALTA*COSTURA</div>
      </div>
      
      <p style="font-size: 8px; color: #8A857D; letter-spacing: 2.5px; margin-top: 28px; font-weight: 400; font-family: 'Inter', sans-serif;">Av. Tabancura 1091 · Vitacura</p>
    </div>
  </div>
</body>
</html>`;

        const transporter = getTransporter();
        await transporter.sendMail({
            from: '"Elena Atelier" <contacto@elenalacosturera.cl>',
            to: customerEmail,
            cc: 'pagos@elenalacosturera.cl',
            subject: `Confirmación de Pago Recibido — ${customerName}`,
            text: `Estimada ${customerName},\n\nHemos recibido exitosamente tu pago correspondiente a ${cuotaName} por un monto de ${formattedAmount} vía ${paymentMethod}.\n\nAtentamente,\nElena Atelier`,
            html: htmlContent,
            attachments
        });

        // Notificación de WhatsApp a Dueñas (Portal Novias)
        try {
            const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
            const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
            if (WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_API_TOKEN) {
                const prenda = project.project_type || 'Vestido';
                for (const ownerNum of ['56984021940', '56937667709']) {
                    await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            messaging_product: 'whatsapp',
                            to: ownerNum,
                            type: 'template',
                            template: {
                                name: 'alerta_pago_recibido',
                                language: { code: 'en' },
                                components: [{
                                    type: 'body',
                                    parameters: [
                                        { type: 'text', text: customerName },
                                        { type: 'text', text: `${prenda} (${cuotaName})` },
                                        { type: 'text', text: formattedAmount },
                                        { type: 'text', text: projectId.substring(0,8) },
                                        { type: 'text', text: paymentMethod }
                                    ]
                                }]
                            }
                        })
                    });
                }
            }
        } catch (wspErr) {
            console.error('Error enviando WhatsApp de pago a dueños (Webpay Novias):', wspErr);
        }

        return { success: true };
    } catch (e: any) {
        console.error('Error sending payment confirmation email:', e);
        return { success: false, error: e.message };
    }
}

export async function generateBridalPaymentLinksAction(projectId: string, cuotaIndex: number = 0) {
    try {
        const supabase = getAdminClient();
        const { data: project } = await supabase.from('bridal_projects')
            .select('*')
            .eq('id', projectId).single();
            
        if (!project) throw new Error('Proyecto no encontrado');

        const { data: woData } = await supabase.from('work_orders')
            .select('payment_plan')
            .eq('legacy_bridal_project_id', projectId)
            .maybeSingle();

        let cuotas = [];
        if (woData && woData.payment_plan && woData.payment_plan.cuotas) {
            cuotas = woData.payment_plan.cuotas;
        }

        let amount = 0;
        let cuotaName = '';
        if (cuotas && cuotas.length > cuotaIndex) {
            amount = cuotas[cuotaIndex].amount || cuotas[cuotaIndex].monto || 0;
            cuotaName = cuotas[cuotaIndex].name || `Cuota ${cuotaIndex + 1}`;
        } else {
            amount = cuotaIndex === 0 ? project.payment_1_amount : cuotaIndex === 1 ? project.payment_2_amount : project.payment_3_amount;
            cuotaName = cuotaIndex === 0 ? 'Reserva 50%' : `Cuota ${cuotaIndex + 1}`;
        }

        const externalRef = `bridal_project_${projectId}_cuota_${cuotaIndex}`;
        const siteUrl = await getSiteUrl();

        let mpLink = null;
        let tbkLink = null;
        let tbkToken = null;

        // 1. Generate MP Link
        if (process.env.MP_ACCESS_TOKEN) {
            const mpPayload = {
                items: [{
                    title: `${cuotaName} - ${project.project_type === 'novia' ? 'Vestido de Novia' : 'Vestido'}`,
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
            const buyOrder = `BRDL_${shortId}_C${cuotaIndex}`;
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
            const { error: updateError } = await supabase
                .from('agendamientos')
                .update({
                    fecha_hora: dateIso,
                    notas: `Prueba coordinada: ${milestone.title}`
                })
                .eq('id', agendaEventId);
                
            if (updateError) {
                if (updateError.code === '23505') {
                    throw new Error('El horario seleccionado ya está ocupado. Por favor, selecciona otro horario.');
                }
                console.error('Error updating agenda event:', updateError);
                throw new Error('No se pudo guardar en la agenda: ' + updateError.message);
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
                .maybeSingle();

            if (insertError) {
                if (insertError.code === '23505') {
                    throw new Error('El horario seleccionado ya está ocupado. Por favor, selecciona otro horario.');
                }
                console.error('Error inserting agenda event:', insertError);
                throw new Error('No se pudo crear en la agenda: ' + insertError.message);
            }
            if (newEvent) {
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

        // 4.5. Update work_order_milestones
        const { data: woData } = await supabase
            .from('work_orders')
            .select('id')
            .eq('legacy_bridal_project_id', projectId)
            .maybeSingle();

        if (woData) {
            await supabase
                .from('work_order_milestones')
                .update({
                    scheduled_date: dateIso,
                    agenda_event_id: agendaEventId
                })
                .eq('work_order_id', woData.id)
                .eq('milestone_type', milestone.milestone_type);
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

export async function registerBridalInstallment(projectId: string, installmentIndex: number, paymentMethod: string = 'Efectivo/Transferencia', shouldNotify: boolean = true) {
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
    
    // Trigger email payment confirmation receipt
    if (shouldNotify) {
        try {
            await sendBridalPaymentConfirmationEmailAction(projectId, installmentIndex, amount, paymentMethod);
        } catch (mailErr) {
            console.error('Error automatically sending payment confirmation email in registerBridalInstallment:', mailErr);
        }
    }

    return { success: true };
}

export async function updatePaymentPlanAction(projectId: string, paymentPlanJson: string) {
    const supabase = getAdminClient();
    
    try {
        const paymentPlan = JSON.parse(paymentPlanJson);
        
        // Find existing work_order
        const { data: woData, error: woError } = await supabase
            .from('work_orders')
            .select('*')
            .eq('legacy_bridal_project_id', projectId)
            .maybeSingle();
            
        if (woError || !woData) {
            return { success: false, error: 'Orden de trabajo no encontrada' };
        }

        // Ensure all cuotas have consistent key names (monto/amount)
        if (paymentPlan && Array.isArray(paymentPlan.cuotas)) {
            paymentPlan.cuotas = paymentPlan.cuotas.map((c: any) => ({
                ...c,
                amount: c.amount !== undefined ? c.amount : c.monto,
                monto: c.monto !== undefined ? c.monto : c.amount
            }));
        }

        // Recalculate total paid from the edited installments that are marked as 'paid'
        const newPaidAmount = (paymentPlan.cuotas || [])
            .filter((c: any) => c.status === 'paid')
            .reduce((acc: number, curr: any) => acc + (curr.amount || curr.monto || 0), 0);

        let newPaymentStatus = 'pending';
        const totalAmount = woData.total_amount || 0;
        if (newPaidAmount >= totalAmount && totalAmount > 0) newPaymentStatus = 'paid';
        else if (newPaidAmount > 0) newPaymentStatus = 'partial';
        
        // Update work_order with the new plan and the recalculated paid amount
        await supabase
            .from('work_orders')
            .update({ 
                payment_plan: paymentPlan,
                paid_amount: newPaidAmount,
                payment_status: newPaymentStatus,
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
