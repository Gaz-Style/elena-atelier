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
