'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// 1. Get all planner tasks for a date range
export async function getPlannerTasks(startDate: string, endDate: string) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('planner_tasks')
    .select('*')
    .gte('task_date', startDate)
    .lte('task_date', endDate);

  if (error) {
    console.error("Error fetching planner tasks:", error);
    return [];
  }
  return data || [];
}

// 2. Create or Update a task
export async function savePlannerTask(taskData: any) {
  const supabase = getAdminClient();
  
  // If it has an existing ID that matches our local format, we might need to do an upsert
  // But if it's a new task generated locally as 't123...', we remove the id to let Postgres auto-generate a UUID, 
  // or we use UUIDs from the start on the client. Let's assume the client sends valid data.
  const payload: any = {
    task_type: taskData.type,
    task_date: taskData.date,
    start_hour: taskData.startHour,
    duration_hours: taskData.durationHours,
    operator_id: taskData.operatorId,
    order_id: taskData.orderId || null,
    description: taskData.label,
    time_label: taskData.time
  };

  // Determine if it's an update
  if (taskData.id && taskData.id.includes('-')) {
    // Looks like a valid UUID, so update
    payload.id = taskData.id;
  }

  const { data, error } = await supabase
    .from('planner_tasks')
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error saving planner task:", error);
    return { success: false, error: error.message };
  }

  try {
    revalidatePath('/admin/planificador');
  } catch(e) {}
  
  return { success: true, data };
}

// 3. Delete a task
export async function deletePlannerTask(taskId: string) {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from('planner_tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    return { success: false, error: error.message };
  }

  try {
    revalidatePath('/admin/planificador');
  } catch(e) {}

  return { success: true };
}

// 4. Get timeline data for tracking active production
export async function getProductionTimeline() {
  const supabase = getAdminClient();
  
  // 1. Fetch active production orders (not delivered, not cancelled)
  const { data: orders, error: ordersErr } = await supabase
    .from('production_orders')
    .select(`
      id,
      description,
      status,
      estimated_hours,
      deadline,
      customer_id,
      pos_order_id,
      customers (
        full_name
      )
    `)
    .not('status', 'in', '("delivered","cancelled")')
    .order('deadline', { ascending: true, nullsFirst: false });

  if (ordersErr) {
    console.error("Error fetching production orders for timeline:", ordersErr);
    return [];
  }

  const orderIds = (orders || []).map(o => o.id);
  
  // Filter only valid UUIDs to prevent Supabase type syntax errors when querying UUID columns
  const projectIds = (orders || [])
    .map(o => o.pos_order_id)
    .filter((id): id is string => !!id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id));
  
  // 2. Fetch all planner tasks mapped to these active orders
  let tasks: any[] = [];
  if (orderIds.length > 0) {
    const { data: ptData, error: ptErr } = await supabase
      .from('planner_tasks')
      .select('id, task_date, duration_hours, order_id, operator_id')
      .in('order_id', orderIds);
      
    if (!ptErr && ptData) {
      tasks = ptData;
    }
  }

  // 3. Fetch bridal milestones (appointments/citas) associated with these projects
  let milestones: any[] = [];
  if (projectIds.length > 0) {
    const { data: mData, error: mErr } = await supabase
      .from('bridal_milestones')
      .select('id, project_id, title, scheduled_date, status, milestone_type')
      .in('project_id', projectIds);
      
    if (!mErr && mData) {
      milestones = mData;
    }
  }

  // 4. Process data
  const result = (orders || []).map((order: any) => {
    const orderTasks = tasks.filter(t => t.order_id === order.id);
    const orderMilestones = milestones.filter(m => m.project_id === order.pos_order_id);
    const scheduledHours = orderTasks.reduce((sum, t) => sum + (Number(t.duration_hours) || 0), 0);
    const estimatedHours = Number(order.estimated_hours) || 0;
    
    return {
      id: order.id,
      customerName: order.customers?.full_name || 'Sin Cliente',
      description: order.description || 'Sin Descripción',
      status: order.status,
      estimatedHours,
      scheduledHours,
      deadline: order.deadline,
      tasks: orderTasks,
      milestones: orderMilestones
    };
  });

  return result;
}
