'use client';

import React, { useState, useEffect } from 'react';
import { getIntakeData } from './actions';
import { 
  BarChart4, Calendar, TrendingUp, DollarSign, Package, Scissors, Factory,
  Activity, Lightbulb, Info, CheckCircle2, ShoppingBag, Banknote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function IntakeDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIntakeData().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <Activity className="w-10 h-10 text-primary mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Analizando Tendencias...</p>
        </div>
      </div>
    );
  }

  const { kpis, categories, trend } = data;
  
  const formatCurrency = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(val);

  // Generate AI Insights
  const generateInsights = () => {
    let insights = [];
    let recommendations = [];

    const totalSales = kpis.thisMonth.sales;
    const totalRevenue = kpis.thisMonth.revenue;
    const totalMonthCount = kpis.thisMonth.count;
    
    const acPercent = totalSales > 0 ? (categories['Alta Costura']?.sales / totalSales) * 100 : 0;
    const arrPercent = totalSales > 0 ? (categories['Arreglos Especializados']?.sales / totalSales) * 100 : 0;

    const uncollectedPercent = totalSales > 0 ? ((totalSales - totalRevenue) / totalSales) * 100 : 0;

    if (totalMonthCount === 0) {
      insights.push("No se han registrado nuevas ventas ni ingresos este mes.");
      recommendations.push("Revisar si las vendedoras están ingresando las notas de venta al sistema correctamente.");
    } else {
      if (acPercent > 70) {
        insights.push(`El ${acPercent.toFixed(0)}% del volumen de ventas este mes corresponde a Alta Costura.`);
        recommendations.push("Asegurar inventario de telas premium y bloquear agenda para pruebas de novia y fiesta.");
      } else if (arrPercent > 50) {
        insights.push(`Se observa una concentración alta (${arrPercent.toFixed(0)}%) en Arreglos Especializados.`);
        recommendations.push("Los arreglos generan flujo de caja rápido. Sugerimos agrupar los arreglos en días específicos para no interrumpir la confección a medida.");
      } else {
        insights.push(`El mix de ventas está equilibrado (${acPercent.toFixed(0)}% Alta Costura, ${arrPercent.toFixed(0)}% Arreglos).`);
        recommendations.push("Mantener la estrategia actual de ventas cruzadas (ofrecer arreglos a clientas de Alta Costura y viceversa).");
      }

      if (uncollectedPercent > 60) {
        insights.push(`Atención: La diferencia entre Ventas (${formatCurrency(totalSales)}) y Flujo de Caja (${formatCurrency(totalRevenue)}) es alta (${uncollectedPercent.toFixed(0)}% pendiente).`);
        recommendations.push("Revisar políticas de cobro. Asegurar que los abonos iniciales del 50% se estén respetando rigurosamente para mantener la liquidez.");
      } else {
        insights.push("La recolección de pagos está en niveles saludables respecto al volumen de ventas del mes.");
      }
    }

    return { insights, recommendations };
  };

  const report = generateInsights();
  
  const maxTrendAmount = Math.max(...trend.map((t: any) => Math.max(t.sales, t.revenue)), 1);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-gray-900 leading-none">Tendencias de Ingreso</h1>
          <p className="text-gray-500 mt-2 font-serif text-lg italic">"Diferenciación de Volumen de Ventas vs. Flujo de Caja"</p>
        </header>

        {/* MÓDULO 1: KPIs DE VELOCIDAD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-xl shadow-sm border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-blue-600 flex items-center gap-2"><Calendar className="w-4 h-4"/> HOY</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><ShoppingBag className="w-3 h-3"/> Volumen de Ventas</p>
                  <p className="text-3xl font-serif text-blue-900">{formatCurrency(kpis.today.sales)}</p>
                </div>
                <div className="border-t border-blue-100 pt-3">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Banknote className="w-3 h-3"/> Flujo de Caja (Ingreso Real)</p>
                  <p className="text-lg font-bold text-emerald-700">{formatCurrency(kpis.today.revenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-purple-600 flex items-center gap-2"><Calendar className="w-4 h-4"/> ESTA SEMANA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-purple-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><ShoppingBag className="w-3 h-3"/> Volumen de Ventas</p>
                  <p className="text-3xl font-serif text-purple-900">{formatCurrency(kpis.thisWeek.sales)}</p>
                </div>
                <div className="border-t border-purple-100 pt-3">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Banknote className="w-3 h-3"/> Flujo de Caja (Ingreso Real)</p>
                  <p className="text-lg font-bold text-emerald-700">{formatCurrency(kpis.thisWeek.revenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border-emerald-200 bg-emerald-50/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <CardHeader className="pb-2 relative z-10">
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-emerald-700 flex items-center gap-2"><Calendar className="w-4 h-4"/> ESTE MES</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><ShoppingBag className="w-3 h-3"/> Volumen de Ventas Total</p>
                  <p className="text-4xl font-serif text-emerald-900">{formatCurrency(kpis.thisMonth.sales)}</p>
                  <p className="text-xs text-emerald-600/70 mt-1">{kpis.thisMonth.count} operaciones registradas</p>
                </div>
                <div className="border-t border-emerald-200/60 pt-3">
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Banknote className="w-3 h-3"/> Flujo de Caja (Recaudado)</p>
                  <p className="text-xl font-bold text-emerald-800">{formatCurrency(kpis.thisMonth.revenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MÓDULO 2: DESGLOSE POR CATEGORÍA */}
          <Card className="rounded-xl shadow-sm border-gray-200 lg:col-span-1">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-bold text-gray-900">Mix Comercial (Este Mes)</CardTitle>
              <CardDescription className="text-xs">Desglose de Ventas vs Flujo de Caja</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                <div className="p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-rose-50 rounded-lg"><Scissors className="w-4 h-4 text-rose-600" /></div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Alta Costura</p>
                      <p className="text-xs text-gray-500">{categories['Alta Costura']?.count || 0} proyectos</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm pl-11">
                    <span className="text-gray-500">Ventas:</span>
                    <span className="font-serif font-bold text-gray-900">{formatCurrency(categories['Alta Costura']?.sales || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pl-11 mt-1">
                    <span className="text-emerald-600">Flujo Caja:</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(categories['Alta Costura']?.revenue || 0)}</span>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-50 rounded-lg"><Package className="w-4 h-4 text-indigo-600" /></div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Confección a Medida</p>
                      <p className="text-xs text-gray-500">{categories['Confección a Medida']?.count || 0} prendas</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm pl-11">
                    <span className="text-gray-500">Ventas:</span>
                    <span className="font-serif font-bold text-gray-900">{formatCurrency(categories['Confección a Medida']?.sales || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pl-11 mt-1">
                    <span className="text-emerald-600">Flujo Caja:</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(categories['Confección a Medida']?.revenue || 0)}</span>
                  </div>
                </div>

                <div className="p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-50 rounded-lg"><Factory className="w-4 h-4 text-amber-600" /></div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Arreglos Especializados</p>
                      <p className="text-xs text-gray-500">{categories['Arreglos Especializados']?.count || 0} servicios</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm pl-11">
                    <span className="text-gray-500">Ventas:</span>
                    <span className="font-serif font-bold text-gray-900">{formatCurrency(categories['Arreglos Especializados']?.sales || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pl-11 mt-1">
                    <span className="text-emerald-600">Flujo Caja:</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(categories['Arreglos Especializados']?.revenue || 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MÓDULO 3: GRÁFICO DE TENDENCIA */}
          <Card className="rounded-xl shadow-sm border-gray-200 lg:col-span-2">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2"><BarChart4 className="w-5 h-5"/> Tendencia: Ventas vs Flujo de Caja</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-end gap-4 mb-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-200 rounded-sm"></div><span className="text-xs text-gray-600">Ventas</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div><span className="text-xs text-gray-600">Flujo de Caja</span></div>
              </div>
              <div className="h-64 flex items-end gap-4 md:gap-8 w-full pt-4">
                {trend.map((t: any) => {
                  const salesHeight = maxTrendAmount > 0 ? (t.sales / maxTrendAmount) * 100 : 0;
                  const revHeight = maxTrendAmount > 0 ? (t.revenue / maxTrendAmount) * 100 : 0;
                  return (
                    <div key={t.key} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-16 bg-gray-900 text-white text-[10px] px-3 py-2 rounded shadow-lg transition-opacity whitespace-nowrap z-10 text-left font-bold">
                        <span className="text-blue-300">Ventas:</span> {formatCurrency(t.sales)}<br/>
                        <span className="text-emerald-400">Flujo Caja:</span> {formatCurrency(t.revenue)}
                      </div>
                      <div className="flex w-full gap-1 items-end h-full">
                        <div 
                          className="flex-1 bg-blue-200 rounded-t-sm transition-all"
                          style={{ height: `${salesHeight}%`, minHeight: t.sales > 0 ? '5%' : '0%' }}
                        />
                        <div 
                          className="flex-1 bg-emerald-500 rounded-t-sm transition-all"
                          style={{ height: `${revHeight}%`, minHeight: t.revenue > 0 ? '5%' : '0%' }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-3 whitespace-nowrap">{t.key}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MÓDULO 4: INFORME Y RECOMENDACIONES */}
        <Card className="rounded-xl shadow-sm border-emerald-200 overflow-hidden bg-emerald-50/30 mt-8">
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 p-6 flex flex-row items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg"><Lightbulb className="w-5 h-5 text-emerald-700" /></div>
            <div>
              <CardTitle className="text-lg font-bold text-emerald-900">Análisis Financiero de Tendencias</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-emerald-600 mt-1">Sugerencias estratégicas automatizadas</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <Info className="w-4 h-4 text-gray-400" /> Observaciones de Mercado
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
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Acciones Estratégicas
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

// touch