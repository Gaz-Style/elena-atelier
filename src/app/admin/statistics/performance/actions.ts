'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getPerformanceData() {
  const now = new Date();
  
  // 1. Get Operators
  const { data: operators } = await supabase.from('atelier_operators').select('*').eq('status', 'active');
  const activeOperators = operators || [];
  
  // Total Monthly Capacity
  const totalCapacityHours = activeOperators.reduce((sum, op) => {
    const daysPerWeek = Array.isArray(op.working_days) ? op.working_days.length : 5;
    return sum + ((op.daily_hours_capacity || 8) * (daysPerWeek * 4));
  }, 0);

  // 2. Get Pending Orders for demand
  const { data: pendingOrders } = await supabase.from('production_orders')
    .select('id, estimated_hours, price, status')
    .not('status', 'in', '("delivered","ready")');

  const totalDemandHours = (pendingOrders || []).reduce((sum, o) => sum + Number(o.estimated_hours || 0), 0);
  const totalPipelineRevenue = (pendingOrders || []).reduce((sum, o) => sum + Number(o.price || 0), 0);

  // 3. Get completed tasks in last 30 days for Utilization
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: tasks } = await supabase.from('planner_tasks')
    .select('duration_hours, operator_id')
    .gte('task_date', thirtyDaysAgo.toISOString().split('T')[0]);

  const tasksByOperator = (tasks || []).reduce((acc: any, t: any) => {
    acc[t.operator_id] = (acc[t.operator_id] || 0) + Number(t.duration_hours || 0);
    return acc;
  }, {});

  // 4. Calculate individual performance
  const ranking = activeOperators.map(op => {
    const hoursLogged = tasksByOperator[op.id] || 0;
    const daysPerWeek = Array.isArray(op.working_days) ? op.working_days.length : 5;
    const monthlyExpected = (op.daily_hours_capacity || 8) * (daysPerWeek * 4);
    const utilization = monthlyExpected > 0 ? (hoursLogged / monthlyExpected) * 100 : 0;
    
    return {
      id: op.id,
      name: op.name,
      hoursLogged,
      monthlyExpected,
      utilization,
      baseSalary: op.base_salary || 0,
    };
  }).sort((a, b) => b.utilization - a.utilization);

  // 5. Projections & ROI
  // Let's assume an average revenue per hour based on recent delivered orders
  const { data: deliveredOrders } = await supabase.from('production_orders')
    .select('price, estimated_hours')
    .in('status', ['delivered', 'ready'])
    .gte('created_at', thirtyDaysAgo.toISOString());

  let avgRevPerHour = 25000; // default assumption
  if (deliveredOrders && deliveredOrders.length > 0) {
    const totRev = deliveredOrders.reduce((sum, o) => sum + Number(o.price || 0), 0);
    const totHrs = deliveredOrders.reduce((sum, o) => sum + Number(o.estimated_hours || 1), 0);
    if (totHrs > 0) avgRevPerHour = totRev / totHrs;
  }

  const maxTheoreticalRevenue = totalCapacityHours * avgRevPerHour;

  return {
    capacity: {
      totalCapacityHours,
      totalDemandHours,
      utilizationPercent: totalCapacityHours > 0 ? (totalDemandHours / totalCapacityHours) * 100 : 0
    },
    ranking,
    projections: {
      totalPipelineRevenue,
      maxTheoreticalRevenue,
      avgRevPerHour
    }
  };
}
