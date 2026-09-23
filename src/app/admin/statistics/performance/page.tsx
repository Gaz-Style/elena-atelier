'use client';

import React, { useState, useEffect } from 'react';
import { getPerformanceData } from './actions';
import { 
  TrendingUp, Users, AlertTriangle, CheckCircle2, DollarSign,
  Activity, ArrowRight, BarChart3, Clock, PieChart, ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, Info } from 'lucide-react';

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

  // Generar recomendaciones dinámicas
  const generateInsights = () => {
    let insights = [];
    let recommendations = [];

    // Análisis de capacidad
    if (capacity.utilizationPercent > 85) {
      insights.push(`El taller está operando a un nivel de saturación crítica (${capacity.utilizationPercent.toFixed(1)}%). Existe un alto riesgo de incumplir plazos de entrega.`);
      recommendations.push("Considerar la contratación temporal de una costurera adicional o aprobar el pago de horas extras de inmediato.");
      recommendations.push("Pausar temporalmente o aumentar los tiempos de entrega prometidos para nuevos pedidos en el Punto de Venta.");
    } else if (capacity.utilizationPercent < 50 && capacity.totalCapacityHours > 0) {
      insights.push(`El taller está subutilizado (${capacity.utilizationPercent.toFixed(1)}%). Se está perdiendo capacidad productiva por la cual ya se están pagando costos fijos.`);
      recommendations.push("Activar estrategias de marketing agresivas o descuentos para atraer nuevos pedidos rápidamente y llenar la capacidad ociosa.");
    } else {
      insights.push(`El taller opera a un nivel saludable (${capacity.utilizationPercent.toFixed(1)}%). El flujo de trabajo está equilibrado.`);
      recommendations.push("Mantener el ritmo de ventas actual y monitorear proactivamente la entrada de nuevos pedidos de Alta Costura.");
    }

    // Análisis de operarias
    const overworked = ranking.filter((r: any) => r.utilization > 95);
    const underworked = ranking.filter((r: any) => r.utilization > 0 && r.utilization < 50);

    if (overworked.length > 0) {
      insights.push(`Las siguientes operarias presentan riesgo de sobrecarga o agotamiento (burnout): ${overworked.map((o: any) => o.name).join(', ')}.`);
      recommendations.push("Reasignar tareas urgentes a operarias con mayor holgura o compensar con bonos de productividad.");
    }
    if (underworked.length > 0) {
      insights.push(`Se detectó baja productividad o falta de asignación en: ${underworked.map((o: any) => o.name).join(', ')} (menos del 50% de utilización).`);
      recommendations.push("Revisar el desempeño de estas operarias, asegurar que estén reportando correctamente sus tiempos, o considerar ajustes de personal si es una tendencia.");
    }

    // Análisis financiero
    insights.push(`El ingreso promedio actual por hora trabajada se estima en ${formatCurrency(projections.avgRevPerHour)}.`);
    
    return { insights, recommendations };
  };

  const report = generateInsights();

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
                      className={`absolute top-0 left-0 h-full ${capacityColor} transition-all duration-1000`} 
                      style={{ width: `${Math.min(capacity.utilizationPercent, 100)}%` }} 
                    />
                  </div>
                  <p className={`text-xs font-bold mt-2 text-right ${capacity.utilizationPercent > 90 ? 'text-rose-600' : 'text-gray-500'}`}>
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
                            className={`h-full rounded-full ${op.utilization > 80 ? 'bg-emerald-500' : op.utilization > 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                            style={{ width: `${Math.min(op.utilization, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${op.utilization > 80 ? 'text-emerald-600' : op.utilization > 50 ? 'text-amber-600' : 'text-rose-600'}`}>
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

        {/* MÓDULO 5: INFORME Y RECOMENDACIONES */}
        <Card className="rounded-xl shadow-sm border-emerald-200 overflow-hidden bg-emerald-50/30">
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 p-6 flex flex-row items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg"><Lightbulb className="w-5 h-5 text-emerald-700" /></div>
            <div>
              <CardTitle className="text-lg font-bold text-emerald-900">Informe Ejecutivo y Recomendaciones</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-emerald-600 mt-1">Análisis Inteligente basado en Datos del Taller</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Observaciones */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <Info className="w-4 h-4 text-gray-400" /> Observaciones Clave
                </h3>
                <ul className="space-y-3">
                  {report.insights.map((insight, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                      <span className="text-gray-300 mt-0.5">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Recomendaciones */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Plan de Acción Recomendado
                </h3>
                <ul className="space-y-3">
                  {report.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-emerald-800 leading-relaxed bg-emerald-100/50 p-3 rounded-lg border border-emerald-100">
                      <span className="font-bold mt-0.5">{idx + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
