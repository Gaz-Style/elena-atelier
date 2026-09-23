'use server';

import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Vista 1: Operación Diaria (Vista Mensual) — agrupa por días
// ─────────────────────────────────────────────────────────────────────────────
export async function getMonitorDaysData(startDateStr: string, endDateStr: string) {
  const supabase = getAdminClient();

  const [
    { data: operators },
    { data: tasks },
    { data: agenda },
    { data: milestones },
    { data: deliveryOrders },
    { data: configData }
  ] = await Promise.all([
    // 1. Active operators
    supabase
      .from('atelier_operators')
      .select('id, name, status, daily_hours_capacity, working_days')
      .eq('status', 'active')
      .order('name'),

    // 2. Planner tasks for the date range
    supabase
      .from('planner_tasks')
      .select('*')
      .gte('task_date', startDateStr)
      .lte('task_date', endDateStr),

    // 3. Agenda events for the date range
    supabase
      .from('agendamientos')
      .select('*')
      .gte('fecha_hora', `${startDateStr}T00:00:00`)
      .lte('fecha_hora', `${endDateStr}T23:59:59`)
      .neq('estado', 'cancelado')
      .order('fecha_hora', { ascending: true }),

    // 4. Bridal milestones for the date range
    supabase
      .from('bridal_milestones')
      .select('*, bridal_projects(customers(full_name, phone, email))')
      .gte('scheduled_date', `${startDateStr}T00:00:00`)
      .lte('scheduled_date', `${endDateStr}T23:59:59`)
      .neq('status', 'completed'),

    // 5. Production orders with deadline in date range
    supabase
      .from('production_orders')
      .select('id, description, deadline, status, pos_order_id, customer_id, customers(full_name, phone, email)')
      .gte('deadline', `${startDateStr}T00:00:00`)
      .lte('deadline', `${endDateStr}T23:59:59`)
      .not('status', 'in', '("delivered", "cancelled", "cancelado")')
      .not('deadline', 'is', null),

    // 6. Workshop config
    supabase
      .from('atelier_config')
      .select('workshop_working_hour_start, workshop_working_hour_end')
      .limit(1)
  ]);

  const config = configData?.[0];
  const workshopStart = config?.workshop_working_hour_start?.slice(0, 5) || '09:00';
  const workshopEnd = config?.workshop_working_hour_end?.slice(0, 5) || '18:00';

  // We will build a map of dateStr -> { tasksByOperator, appointments, deliveries }
  const daysMap: Record<string, {
    dateStr: string;
    tasksByOperator: Record<string, any[]>;
    appointments: any[];
    deliveries: any[];
  }> = {};

  // Helper to ensure day exists
  const getDay = (d: string) => {
    if (!daysMap[d]) {
      const tbo: Record<string, any[]> = {};
      (operators || []).forEach((op: any) => { tbo[op.id] = []; });
      daysMap[d] = { dateStr: d, tasksByOperator: tbo, appointments: [], deliveries: [] };
    }
    return daysMap[d];
  };

  // Group tasks
  (tasks || []).forEach((t: any) => {
    const d = t.task_date;
    if (d) {
      const day = getDay(d);
      if (day.tasksByOperator[t.operator_id]) {
        day.tasksByOperator[t.operator_id].push(t);
      }
    }
  });

  // Sort tasks within each operator by start_hour
  Object.values(daysMap).forEach(day => {
    Object.values(day.tasksByOperator).forEach(tasksList => {
      tasksList.sort((a: any, b: any) => (a.start_hour || 9) - (b.start_hour || 9));
    });
  });

  // Process and group milestones
  (milestones || []).forEach((m: any) => {
    if (!m.scheduled_date) return;
    const d = m.scheduled_date.split('T')[0];
    const cust = Array.isArray(m.bridal_projects?.customers)
      ? m.bridal_projects.customers[0]
      : m.bridal_projects?.customers;
    
    getDay(d).appointments.push({
      id: `milestone-${m.id}`,
      fecha_hora: m.scheduled_date,
      nombre: cust?.full_name || 'Clienta',
      tipo: 'prueba',
      notas: m.title || 'Prueba Alta Costura',
      phone: cust?.phone || '',
    });
  });

  // Process and group agenda
  (agenda || []).filter((a: any) => a.tipo_evento !== 'tarea_interna').forEach((a: any) => {
    if (!a.fecha_hora) return;
    const d = a.fecha_hora.split('T')[0];
    getDay(d).appointments.push({
      id: `agenda-${a.id}`,
      fecha_hora: a.fecha_hora,
      nombre: `${a.nombre} ${a.apellido || ''}`.trim(),
      tipo: 'cita',
      notas: a.notas || 'Cita General',
      phone: a.celular || '',
    });
  });

  // Sort appointments in each day
  Object.values(daysMap).forEach(day => {
    day.appointments.sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
  });

  // Process and group deliveries
  const tempDeliveries: Record<string, Record<string, any>> = {}; // day -> { orderId -> delivery }
  (deliveryOrders || []).forEach((order: any) => {
    if (!order.deadline) return;
    const d = order.deadline.split('T')[0];
    if (!tempDeliveries[d]) tempDeliveries[d] = {};
    
    const key = order.pos_order_id || `single-${order.id}`;
    const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
    
    if (!tempDeliveries[d][key]) {
      tempDeliveries[d][key] = {
        id: key,
        deadline: order.deadline,
        customer_name: customer?.full_name || 'Cliente',
        customer_phone: customer?.phone || '',
        descriptions: [],
        statuses: [],
      };
    }
    if (order.description) tempDeliveries[d][key].descriptions.push(order.description);
    tempDeliveries[d][key].statuses.push(order.status);
  });

  Object.entries(tempDeliveries).forEach(([d, delivMap]) => {
    getDay(d).deliveries = Object.values(delivMap).sort(
      (a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  });

  // Build final array of days sorted chronologically
  const days = Object.values(daysMap).sort((a, b) => a.dateStr.localeCompare(b.dateStr));

  // Generate continuous list of dates from startDate to endDate
  const fullDays = [];
  let curr = new Date(`${startDateStr}T12:00:00`); // 12:00 to avoid timezone shifts
  const end = new Date(`${endDateStr}T12:00:00`);
  
  while (curr <= end) {
    const dStr = curr.toISOString().split('T')[0];
    const existing = daysMap[dStr];
    if (existing) {
      fullDays.push(existing);
    } else {
      const tbo: Record<string, any[]> = {};
      (operators || []).forEach((op: any) => { tbo[op.id] = []; });
      fullDays.push({ dateStr: dStr, tasksByOperator: tbo, appointments: [], deliveries: [] });
    }
    curr.setDate(curr.getDate() + 1);
  }

  return {
    operators: operators || [],
    days: fullDays,
    workshopStart,
    workshopEnd,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Vista 2: Matriz de Trabajos y Pagos
// ─────────────────────────────────────────────────────────────────────────────
export async function getMonitorWorkMatrix() {
  const supabase = getAdminClient();

  const { data: orders } = await supabase
    .from('production_orders')
    .select(`
      id,
      description,
      status,
      estimated_hours,
      deadline,
      customer_id,
      pos_order_id,
      payment_status,
      paid_amount,
      price,
      created_at,
      customers (
        full_name,
        phone
      )
    `)
    .in('status', ['draft', 'pending', 'scheduled', 'cutting', 'sewing', 'finishing', 'ready'])
    .order('deadline', { ascending: true, nullsFirst: false });

  // Fetch scheduled hours from planner_tasks
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

  const result = (orders || []).map((o: any) => {
    const customer = Array.isArray(o.customers) ? o.customers[0] : o.customers;
    const estimatedHours = Number(o.estimated_hours || 0);
    const scheduledHours = hoursMap[o.id] || 0;
    const progressPercent = estimatedHours > 0
      ? Math.min(100, Math.round((scheduledHours / estimatedHours) * 100))
      : 0;

    return {
      id: o.id,
      customerName: customer?.full_name || 'Sin Cliente',
      customerPhone: customer?.phone || '',
      description: o.description || 'Sin Descripción',
      status: o.status,
      estimatedHours,
      scheduledHours,
      progressPercent,
      deadline: o.deadline,
      paymentStatus: o.payment_status || 'pending',
      paidAmount: Number(o.paid_amount || 0),
      totalAmount: Number(o.price || 0),
      createdAt: o.created_at,
    };
  });

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Vista 3: Cronograma de Citas y Entregas por Cliente
// ─────────────────────────────────────────────────────────────────────────────
export async function getMonitorTimeline() {
  const supabase = getAdminClient();

  // 1. Active production orders
  const { data: orders } = await supabase
    .from('production_orders')
    .select(`
      id,
      description,
      status,
      estimated_hours,
      deadline,
      customer_id,
      pos_order_id,
      payment_status,
      customers (
        full_name,
        phone
      )
    `)
    .in('status', ['draft', 'pending', 'scheduled', 'cutting', 'sewing', 'finishing', 'ready'])
    .order('deadline', { ascending: true, nullsFirst: false });

  if (!orders || orders.length === 0) return [];

  const orderIds = orders.map(o => o.id);
  // Filter only valid UUIDs for bridal project lookup
  const posOrderIds = orders
    .map(o => o.pos_order_id)
    .filter((id): id is string => !!id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id));

  // 2. Fetch scheduled hours
  const { data: plannerTasks } = await supabase
    .from('planner_tasks')
    .select('order_id, duration_hours')
    .in('order_id', orderIds);

  const hoursMap: Record<string, number> = {};
  (plannerTasks || []).forEach((t: any) => {
    if (t.order_id) {
      hoursMap[t.order_id] = (hoursMap[t.order_id] || 0) + Number(t.duration_hours || 0);
    }
  });

  // 3. Fetch bridal milestones (all statuses so we can show completed ones with ✓)
  let allMilestones: any[] = [];
  if (posOrderIds.length > 0) {
    const { data: mData } = await supabase
      .from('bridal_milestones')
      .select('id, project_id, title, scheduled_date, status, milestone_type')
      .in('project_id', posOrderIds)
      .order('scheduled_date', { ascending: true });

    allMilestones = mData || [];
  }

  // 4. Fetch agenda events linked to these customers
  const customerIds = [...new Set(orders.map(o => o.customer_id).filter(Boolean))];
  let agendaEvents: any[] = [];
  if (customerIds.length > 0) {
    // We fetch by looking up customers' email addresses and matching to agendamientos
    const { data: customers } = await supabase
      .from('customers')
      .select('id, email, full_name')
      .in('id', customerIds);

    if (customers && customers.length > 0) {
      const emails = customers.map(c => c.email).filter(Boolean);
      if (emails.length > 0) {
        const { data: agData } = await supabase
          .from('agendamientos')
          .select('*')
          .in('correo', emails)
          .neq('estado', 'cancelado')
          .order('fecha_hora', { ascending: true });

        agendaEvents = (agData || []).map((ag: any) => {
          const matchedCust = customers.find(c => c.email === ag.correo);
          return { ...ag, matched_customer_id: matchedCust?.id };
        });
      }
    }
  }

  // 5. Build per-project timeline
  const result = orders.map((order: any) => {
    const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
    const estimatedHours = Number(order.estimated_hours || 0);
    const scheduledHours = hoursMap[order.id] || 0;

    // Milestones for this project
    const projectMilestones = allMilestones
      .filter(m => m.project_id === order.pos_order_id)
      .map(m => ({
        id: m.id,
        title: m.title,
        date: m.scheduled_date,
        status: m.status,
        type: 'prueba' as const,
      }));

    // Agenda events for this customer
    const customerAgenda = agendaEvents
      .filter(ag => ag.matched_customer_id === order.customer_id)
      .map(ag => ({
        id: ag.id,
        title: ag.tipo_evento === 'tarea_interna' ? (ag.notas || 'Bloqueo') : (ag.notas || 'Cita'),
        date: ag.fecha_hora,
        status: ag.estado === 'completado' ? 'completed' : 'scheduled',
        type: (ag.tipo_evento === 'retiro_encargo' ? 'entrega' : 'cita') as 'cita' | 'entrega',
      }));

    // Delivery event from deadline
    const deliveryEvent = order.deadline
      ? [{
          id: `delivery-${order.id}`,
          title: 'Entrega y Retiro',
          date: order.deadline,
          status: order.status === 'ready' ? 'ready' : 'pending',
          type: 'entrega' as const,
        }]
      : [];

    // Combine and sort all events chronologically
    const events = [...projectMilestones, ...customerAgenda, ...deliveryEvent]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Find next upcoming event
    const now = new Date();
    const nextEvent = events.find(e => new Date(e.date) >= now && e.status !== 'completed');

    return {
      id: order.id,
      customerName: customer?.full_name || 'Sin Cliente',
      customerPhone: customer?.phone || '',
      description: order.description || 'Sin Descripción',
      status: order.status,
      estimatedHours,
      scheduledHours,
      deadline: order.deadline,
      paymentStatus: order.payment_status || 'pending',
      events,
      nextEvent: nextEvent || null,
    };
  });

  // Sort: projects with sooner next events first
  result.sort((a, b) => {
    const dateA = a.nextEvent ? new Date(a.nextEvent.date).getTime() : Infinity;
    const dateB = b.nextEvent ? new Date(b.nextEvent.date).getTime() : Infinity;
    return dateA - dateB;
  });

  return result;
}
