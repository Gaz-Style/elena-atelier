const fs = require('fs');
const path = require('path');

const actionsCode = `'use server';

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
  const totalCapacityHours = activeOperators.reduce((sum, op) => sum + ((op.daily_hours_capacity || 8) * (op.working_days || 20)), 0);

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
    const monthlyExpected = (op.daily_hours_capacity || 8) * (op.working_days || 20);
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
`;

fs.writeFileSync(path.join(__dirname, 'src/app/admin/statistics/performance/actions.ts'), actionsCode);

const pageCode = `'use client';

import React, { useState, useEffect } from 'react';
import { getPerformanceData } from './actions';
import { 
  TrendingUp, Users, AlertTriangle, CheckCircle2, DollarSign,
  Activity, ArrowRight, BarChart3, Clock, PieChart, ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function PerformanceDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPerformanceData().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <Activity className="w-10 h-10 text-primary mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Calculando Rendimiento...</p>
        </div>
      </div>
    );
  }

  const { capacity, ranking, projections } = data;
  
  const formatCurrency = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);
  
  const capacityColor = capacity.utilizationPercent > 90 ? 'bg-rose-500' 
                      : capacity.utilizationPercent > 70 ? 'bg-amber-500' 
                      : 'bg-emerald-500';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-gray-900 leading-none">Rendimiento y Capacidad</h1>
          <p className="text-gray-500 mt-2 font-serif text-lg italic">"Análisis de capacidad productiva, rentabilidad y cuellos de botella"</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MÓDULO 1: TERMÓMETRO DE CAPACIDAD */}
          <Card className="rounded-xl shadow-sm border-gray-200 overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg"><BarChart3 className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Termómetro de Capacidad</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-widest font-bold text-gray-400 mt-1">Horas Hombre Mensuales</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-gray-700">Demanda (Pendiente)</span>
                  <span className="text-2xl font-serif text-gray-900">{capacity.totalDemandHours.toFixed(1)} <span className="text-sm text-gray-400">hrs</span></span>
                </div>
                <div className="flex justify-between items-end mb-4">
                  <span className="text-sm font-bold text-gray-700">Capacidad Instalada</span>
                  <span className="text-2xl font-serif text-gray-900">{capacity.totalCapacityHours.toFixed(1)} <span className="text-sm text-gray-400">hrs</span></span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>0%</span>
                    <span>100% Capacidad Máx</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                    <div 
                      className={\`absolute top-0 left-0 h-full \${capacityColor} transition-all duration-1000\`} 
                      style={{ width: \`\${Math.min(capacity.utilizationPercent, 100)}%\` }} 
                    />
                  </div>
                  <p className={\`text-xs font-bold mt-2 text-right \${capacity.utilizationPercent > 90 ? 'text-rose-600' : 'text-gray-500'}\`}>
                    {capacity.utilizationPercent.toFixed(1)}% Saturación
                  </p>
                </div>
              </div>

              {capacity.utilizationPercent > 85 ? (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex gap-3 items-start">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">Alerta de Cuello de Botella</h4>
                    <p className="text-xs text-rose-700 mt-1">La demanda actual supera el umbral seguro. Se recomienda pagar horas extras o contratar nueva costurera pronto.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Capacidad Saludable</h4>
                    <p className="text-xs text-emerald-700 mt-1">El taller tiene holgura suficiente para recibir y procesar nuevos pedidos sin estrés.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* MÓDULO 3: PROYECCIÓN DE VENTAS */}
          <Card className="rounded-xl shadow-sm border-gray-200 overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Proyección y Techo de Ventas</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-widest font-bold text-gray-400 mt-1">Ingresos Potenciales vs Reales</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Ingreso en Pipeline</p>
                  <p className="text-2xl font-serif text-gray-900">{formatCurrency(projections.totalPipelineRevenue)}</p>
                  <p className="text-xs text-gray-400 mt-1 italic">Total en trabajos pendientes</p>
                </div>
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <p className="text-[10px] uppercase font-bold text-primary tracking-widest mb-1">Techo Máximo Mensual</p>
                  <p className="text-2xl font-serif text-primary">{formatCurrency(projections.maxTheoreticalRevenue)}</p>
                  <p className="text-xs text-primary/60 mt-1 italic">Al 100% de capacidad</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Valor Promedio Hora</h4>
                  <p className="text-xs text-blue-700 mt-0.5">Basado en últimas ventas entregadas</p>
                </div>
                <span className="text-xl font-serif font-bold text-blue-700">{formatCurrency(projections.avgRevPerHour)}<span className="text-sm">/hr</span></span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MÓDULO 2 & 4: RANKING DE COSTURERAS Y ROI */}
        <Card className="rounded-xl shadow-sm border-gray-200 overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 p-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-2 rounded-lg"><Users className="w-5 h-5 text-purple-600" /></div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Ranking de Utilización (Últimos 30 días)</CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold text-gray-400 mt-1">Horas Planificadas vs Capacidad Base</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-white">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-[10px] uppercase tracking-widest text-gray-500">
                  <th className="px-6 py-4 font-bold">Costurera</th>
                  <th className="px-6 py-4 font-bold">Horas Logueadas</th>
                  <th className="px-6 py-4 font-bold">Capacidad Mensual</th>
                  <th className="px-6 py-4 font-bold">Utilización</th>
                  <th className="px-6 py-4 font-bold text-right">Costo Fijo (Sueldo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ranking.map((op: any, i: number) => (
                  <tr key={op.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-serif font-bold text-gray-600 text-xs">
                          {i + 1}
                        </div>
                        <span className="font-bold text-sm text-gray-900">{op.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-serif text-lg text-gray-900">{op.hoursLogged.toFixed(1)} <span className="text-xs text-gray-400">hrs</span></span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-500">{op.monthlyExpected} hrs</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={\`h-full rounded-full \${op.utilization > 80 ? 'bg-emerald-500' : op.utilization > 50 ? 'bg-amber-400' : 'bg-rose-400'}\`}
                            style={{ width: \`\${Math.min(op.utilization, 100)}%\` }}
                          />
                        </div>
                        <span className={\`text-xs font-bold \${op.utilization > 80 ? 'text-emerald-600' : op.utilization > 50 ? 'text-amber-600' : 'text-rose-600'}\`}>
                          {op.utilization.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(op.baseSalary)}</span>
                    </td>
                  </tr>
                ))}
                {ranking.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No hay operarias activas registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src/app/admin/statistics/performance/page.tsx'), pageCode);

console.log("Created Dashboard Files");
