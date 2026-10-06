'use server';

import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// ─── Obtener costureras activas para la pantalla de selección ───
export async function getActiveOperators() {
    const supabase = getAdminClient();
    const { data, error } = await supabase
        .from('atelier_operators')
        .select('id, name, status, daily_hours_capacity, working_days')
        .eq('status', 'active')
        .order('name');

    if (error) {
        console.error('Error fetching operators:', error);
        return [];
    }
    return data || [];
}

// ─── Verificar PIN de Costurera ───
export async function verifyOperatorPin(operatorId: string, pin: string) {
    const supabase = getAdminClient();
    
    try {
        const { data, error } = await supabase
            .from('atelier_operators')
            .select('pin')
            .eq('id', operatorId)
            .single();

        if (error) throw error;
        
        // Si no hay PIN configurado en la base de datos, usamos 1234 por defecto
        const correctPin = data?.pin || '1234';
        
        return correctPin === pin;
    } catch (err) {
        console.error('Error verificando PIN:', err);
        // Fallback al PIN maestro si la columna no existe aún
        return pin === '1234';
    }
}

// ─── Obtener tareas del día para una costurera ───
export async function getOperatorDayTasks(operatorId: string, dateStr: string) {
    const supabase = getAdminClient();

    // 1. Tareas del planificador para ese día
    const { data: tasks } = await supabase
        .from('planner_tasks')
        .select('*')
        .eq('operator_id', operatorId)
        .eq('task_date', dateStr)
        .order('start_hour', { ascending: true });

    // 2. Obtener detalles de las órdenes vinculadas
    const orderIds = [...new Set((tasks || []).map(t => t.order_id).filter(Boolean))];
    let ordersMap: Record<string, any> = {};

    if (orderIds.length > 0) {
        const { data: orders } = await supabase
            .from('production_orders')
            .select('id, description, status, deadline, estimated_hours, notes, customers(full_name)')
            .in('id', orderIds);

        if (orders) {
            orders.forEach((o: any) => {
                const customer = Array.isArray(o.customers) ? o.customers[0] : o.customers;
                ordersMap[o.id] = {
                    ...o,
                    customerName: customer?.full_name || 'Sin Cliente'
                };
            });
        }
    }

    // 3. Enriquecer tareas con datos de la orden
    const enrichedTasks = (tasks || []).map(t => ({
        ...t,
        order: t.order_id ? ordersMap[t.order_id] || null : null
    }));

    return enrichedTasks;
}

// ─── Obtener tareas de la semana para una costurera ───
export async function getOperatorWeekTasks(operatorId: string, startDate: string, endDate: string) {
    const supabase = getAdminClient();

    const { data: tasks } = await supabase
        .from('planner_tasks')
        .select('*')
        .eq('operator_id', operatorId)
        .gte('task_date', startDate)
        .lte('task_date', endDate)
        .order('task_date', { ascending: true })
        .order('start_hour', { ascending: true });

    // Obtener detalles de órdenes vinculadas
    const orderIds = [...new Set((tasks || []).map(t => t.order_id).filter(Boolean))];
    let ordersMap: Record<string, any> = {};

    if (orderIds.length > 0) {
        const { data: orders } = await supabase
            .from('production_orders')
            .select('id, description, status, deadline, estimated_hours, notes, customers(full_name)')
            .in('id', orderIds);

        if (orders) {
            orders.forEach((o: any) => {
                const customer = Array.isArray(o.customers) ? o.customers[0] : o.customers;
                ordersMap[o.id] = {
                    ...o,
                    customerName: customer?.full_name || 'Sin Cliente'
                };
            });
        }
    }

    const enrichedTasks = (tasks || []).map(t => ({
        ...t,
        order: t.order_id ? ordersMap[t.order_id] || null : null
    }));

    return enrichedTasks;
}

// ─── Obtener entregas pendientes asignadas a la costurera ───
export async function getOperatorDeadlines(operatorId: string) {
    const supabase = getAdminClient();

    const { data: orders } = await supabase
        .from('production_orders')
        .select('id, description, status, deadline, estimated_hours, notes, pos_order_id, customers(full_name)')
        .eq('assigned_operator_id', operatorId)
        .in('status', ['draft', 'cutting', 'sewing', 'finishing', 'ready'])
        .not('deadline', 'is', null)
        .order('deadline', { ascending: true });

    // Obtener horas planificadas para cada orden
    const orderIds = (orders || []).map(o => o.id);
    let hoursMap: Record<string, number> = {};

    if (orderIds.length > 0) {
        const { data: plannerTasks } = await supabase
            .from('planner_tasks')
            .select('order_id, duration_hours')
            .in('order_id', orderIds);

        if (plannerTasks) {
            plannerTasks.forEach((t: any) => {
                if (t.order_id) {
                    hoursMap[t.order_id] = (hoursMap[t.order_id] || 0) + Number(t.duration_hours || 0);
                }
            });
        }
    }

    return (orders || []).map((o: any) => {
        const customer = Array.isArray(o.customers) ? o.customers[0] : o.customers;
        return {
            ...o,
            customerName: customer?.full_name || 'Sin Cliente',
            scheduledHours: hoursMap[o.id] || 0
        };
    });
}

// ─── Obtener ficha técnica completa de una orden ───
export async function getOrderTechSheet(orderId: string) {
    const supabase = getAdminClient();

    // 1. Datos de la orden de producción
    const { data: order, error } = await supabase
        .from('production_orders')
        .select('*, customers(full_name, measurements)')
        .eq('id', orderId)
        .single();

    if (error || !order) {
        console.error('Error fetching order:', error);
        return null;
    }

    const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;

    // 2. Horas planificadas
    const { data: plannerTasks } = await supabase
        .from('planner_tasks')
        .select('duration_hours')
        .eq('order_id', orderId);

    const scheduledHours = (plannerTasks || []).reduce((sum, t) => sum + Number(t.duration_hours || 0), 0);

    // 3. Obtener fotos de referencia del moodboard (si existe proyecto bridal)
    let referencePhotos: { url: string; category?: string; notes?: string }[] = [];

    // Buscar imágenes embebidas en las notas (markdown: ![Alt](url))
    let cleanNotes = order.notes || '';
    const markdownImageRegex = /!\[([^\]]*)\]\((.*?)\)/g;
    let match;
    while ((match = markdownImageRegex.exec(cleanNotes)) !== null) {
        referencePhotos.push({
            url: match[2],
            category: 'Referencia Técnica',
            notes: match[1] !== 'image' && match[1] !== 'Referencia' ? match[1] : ''
        });
    }
    // Remover las imágenes del texto de las notas
    cleanNotes = cleanNotes.replace(markdownImageRegex, '').trim();

    if (order.pos_order_id) {
        // Filtrar solo UUIDs válidos
        const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(order.pos_order_id);
        if (isUUID) {
            const { data: project } = await supabase
                .from('bridal_projects')
                .select('materials_notes')
                .eq('id', order.pos_order_id)
                .single();

            if (project?.materials_notes?.includes('--- INSPIRATION_MOODBOARD ---')) {
                try {
                    const parts = project.materials_notes.split('--- INSPIRATION_MOODBOARD ---');
                    const moodboardData = JSON.parse(parts[1]);
                    if (Array.isArray(moodboardData)) {
                        referencePhotos = moodboardData.map((item: any) => ({
                            url: item.url || item.image_url || '',
                            category: item.category || '',
                            notes: item.notes || ''
                        })).filter((p: any) => p.url);
                    }
                } catch (e) {
                    // Moodboard parse error, ignore
                }
            }
        }
    }

    // 4. Milestones / Citas de prueba
    let milestones: any[] = [];
    if (order.pos_order_id) {
        const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(order.pos_order_id);
        if (isUUID) {
            const { data: mData } = await supabase
                .from('bridal_milestones')
                .select('id, title, scheduled_date, status, milestone_type')
                .eq('project_id', order.pos_order_id)
                .order('scheduled_date', { ascending: true });

            milestones = mData || [];
        }
    }

    return {
        id: order.id,
        description: order.description || 'Sin Descripción',
        customerName: customer?.full_name || 'Sin Cliente',
        customerMeasurements: customer?.measurements || '',
        status: order.status,
        estimatedHours: Number(order.estimated_hours || 0),
        scheduledHours,
        deadline: order.deadline,
        notes: cleanNotes,
        orderType: order.order_type || '',
        referencePhotos,
        milestones
    };
}

// ─── Actualizar el estado de una orden ───
export async function updateOrderStatus(orderId: string, newStatus: string) {
    const supabase = getAdminClient();
    const { error } = await supabase
        .from('production_orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
    if (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

// ─── Info de la operaria (nombre y capacidad) ───
export async function getOperatorInfo(operatorId: string) {
    const supabase = getAdminClient();
    const { data, error } = await supabase
        .from('atelier_operators')
        .select('id, name, status, daily_hours_capacity, working_days')
        .eq('id', operatorId)
        .single();

    if (error || !data) return null;
    return data;
}

// ─── Obtener citas y entregas del taller para un día específico ───
export async function getTallerDayAppointments(dateStr: string) {
    const supabase = getAdminClient();
    
    // 1. Agendamientos estándar
    const { data: agData } = await supabase
        .from('agendamientos')
        .select('id, fecha_hora, nombre, apellido, tipo_evento, notas')
        .neq('estado', 'cancelado')
        .gte('fecha_hora', `${dateStr}T00:00:00-03:00`)
        .lte('fecha_hora', `${dateStr}T23:59:59-03:00`);

    // 2. Citas de Novias (Milestones)
    const { data: mData } = await supabase
        .from('bridal_milestones')
        .select('id, scheduled_date, title, project_id, bridal_projects(customers(full_name))')
        .neq('status', 'completed')
        .not('scheduled_date', 'is', null)
        .gte('scheduled_date', `${dateStr}T00:00:00-03:00`)
        .lte('scheduled_date', `${dateStr}T23:59:59-03:00`)
        .is('agenda_event_id', null);

    let mEvents: any[] = [];
    if (mData) {
        mEvents = mData.map((m: any) => {
            const cust = Array.isArray(m.bridal_projects?.customers) ? m.bridal_projects.customers[0] : m.bridal_projects?.customers;
            return {
                id: `milestone-${m.id}`,
                fecha_hora: m.scheduled_date,
                nombre: cust?.full_name || 'Clienta',
                apellido: '',
                tipo_evento: 'cita_cliente',
                notas: `Prueba: ${m.title}`
            };
        });
    }

    // 3. Entregas (Deadlines)
    const { data: pOrders } = await supabase
        .from('production_orders')
        .select('id, description, deadline, pos_order_id, customers(full_name)')
        .not('status', 'in', '("delivered", "cancelled", "cancelado")')
        .not('deadline', 'is', null)
        .gte('deadline', `${dateStr}T00:00:00-03:00`)
        .lte('deadline', `${dateStr}T23:59:59-03:00`);

    let deliveryEvents: any[] = [];
    if (pOrders) {
        deliveryEvents = pOrders.map((o: any) => {
            const c = Array.isArray(o.customers) ? o.customers[0] : o.customers;
            return {
                id: `delivery-${o.id}`,
                fecha_hora: o.deadline,
                nombre: c?.full_name || 'Clienta',
                apellido: '',
                tipo_evento: 'retiro_encargo',
                notas: `Retiro: ${o.description || 'Prenda'} (${o.pos_order_id || 'S/N'})`
            };
        });
    }

    const combined = [...(agData || []), ...mEvents, ...deliveryEvents]
        .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());

    return combined;
}
