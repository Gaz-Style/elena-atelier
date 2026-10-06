const fs = require('fs');
const path = require('path');

const actionsCode = `'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function categorizeOrder(order: any) {
  const desc = (order.description || '').toLowerCase();
  if (desc.includes('arreglo') || desc.includes('basta') || desc.includes('pinza') || desc.includes('compostura') || desc.includes('ajuste') || desc.includes('reparaci')) {
    return 'Arreglos';
  }
  if (order.order_type === 'b2b_batch') {
    return 'Mayorista';
  }
  return 'Alta Costura';
}

export async function getIntakeData() {
  // We fetch orders from the last 6 months to build the trend
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: allOrders } = await supabase.from('production_orders')
    .select('id, created_at, price, description, order_type')
    .gte('created_at', sixMonthsAgo.toISOString());

  const orders = allOrders || [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1)); // Lunes
  weekStart.setHours(0,0,0,0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // KPIs
  const kpis = {
    today: { count: 0, amount: 0 },
    thisWeek: { count: 0, amount: 0 },
    thisMonth: { count: 0, amount: 0 },
  };

  const categories = {
    'Alta Costura': { count: 0, amount: 0 },
    'Arreglos': { count: 0, amount: 0 },
    'Mayorista': { count: 0, amount: 0 },
  };

  // Trend mapping
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const trendsMap = new Map();
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = \`\${monthNames[d.getMonth()]} \${d.getFullYear().toString().substring(2)}\`;
    trendsMap.set(key, { count: 0, amount: 0, key });
  }

  orders.forEach((o: any) => {
    const d = new Date(o.created_at);
    const p = Number(o.price || 0);
    const cat = categorizeOrder(o);

    // Timeline filtering
    if (d >= todayStart) {
      kpis.today.count++;
      kpis.today.amount += p;
    }
    if (d >= weekStart) {
      kpis.thisWeek.count++;
      kpis.thisWeek.amount += p;
    }
    if (d >= monthStart) {
      kpis.thisMonth.count++;
      kpis.thisMonth.amount += p;

      // Populate current month categories
      if (categories[cat as keyof typeof categories]) {
        categories[cat as keyof typeof categories].count++;
        categories[cat as keyof typeof categories].amount += p;
      }
    }

    // Trend
    const trendKey = \`\${monthNames[d.getMonth()]} \${d.getFullYear().toString().substring(2)}\`;
    if (trendsMap.has(trendKey)) {
      const t = trendsMap.get(trendKey);
      t.count++;
      t.amount += p;
    }
  });

  return {
    kpis,
    categories,
    trend: Array.from(trendsMap.values())
  };
}
`;

fs.writeFileSync(path.join(__dirname, 'src/app/admin/statistics/intake/actions.ts'), actionsCode);

const pageCode = `'use client';

import React, { useState, useEffect } from 'react';
import { getIntakeData } from './actions';
import { 
  BarChart4, Calendar, TrendingUp, DollarSign, Package, Scissors, Factory,
  Activity, Lightbulb, Info, CheckCircle2
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

    const totalMonthCount = kpis.thisMonth.count;
    const acPercent = totalMonthCount > 0 ? (categories['Alta Costura'].count / totalMonthCount) * 100 : 0;
    const arrPercent = totalMonthCount > 0 ? (categories['Arreglos'].count / totalMonthCount) * 100 : 0;

    if (totalMonthCount === 0) {
      insights.push("No se han registrado nuevos ingresos este mes.");
      recommendations.push("Revisar si las vendedoras están ingresando las notas de venta al sistema correctamente.");
    } else {
      if (acPercent > 70) {
        insights.push(\`El \${acPercent.toFixed(0)}% de los trabajos ingresados este mes corresponden a Alta Costura, mostrando un enfoque de alto margen.\`);
        recommendations.push("Asegurar inventario de telas premium y bloquear agenda para pruebas de novia y fiesta.");
      } else if (arrPercent > 50) {
        insights.push(\`Se observa una concentración inusualmente alta (\${arrPercent.toFixed(0)}%) en Arreglos Menores.\`);
        recommendations.push("Los arreglos generan flujo de caja rápido pero pueden saturar el taller. Sugerimos agrupar los arreglos en días específicos para no interrumpir la Alta Costura.");
      } else {
        insights.push(\`El mix de ventas está equilibrado (\${acPercent.toFixed(0)}% Alta Costura, \${arrPercent.toFixed(0)}% Arreglos).\`);
        recommendations.push("Mantener la estrategia actual de ventas cruzadas (ofrecer arreglos a clientas de Alta Costura y viceversa).");
      }

      if (trend.length >= 2) {
        const lastMonth = trend[trend.length - 2].amount;
        const thisMonth = trend[trend.length - 1].amount;
        if (thisMonth > lastMonth && lastMonth > 0) {
          insights.push(\`El ritmo de facturación actual proyecta un crecimiento respecto al mes anterior (Mes Pasado: \${formatCurrency(lastMonth)} vs Actual: \${formatCurrency(thisMonth)}).\`);
        } else if (thisMonth < lastMonth * 0.5 && new Date().getDate() > 15) {
          insights.push(\`Ritmo de ingresos lento: Se ha superado la quincena y los ingresos representan menos de la mitad del mes pasado.\`);
          recommendations.push("Activar campañas de remarketing o promociones flash para reactivar la entrada de pedidos.");
        }
      }
    }

    return { insights, recommendations };
  };

  const report = generateInsights();
  
  // Find max amount in trend for bar chart scaling
  const maxTrendAmount = Math.max(...trend.map((t: any) => t.amount), 1);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-gray-900 leading-none">Tendencias de Ingreso</h1>
          <p className="text-gray-500 mt-2 font-serif text-lg italic">"Monitoreo de flujo comercial y volumen de entrada"</p>
        </header>

        {/* MÓDULO 1: KPIs DE VELOCIDAD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-xl shadow-sm border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-blue-600 flex items-center gap-2"><Calendar className="w-4 h-4"/> INGRESOS HOY</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-serif text-blue-900">{kpis.today.count} <span className="text-sm text-blue-600/70">prendas</span></p>
                  <p className="text-sm font-bold text-blue-700 mt-1">{formatCurrency(kpis.today.amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-purple-600 flex items-center gap-2"><Calendar className="w-4 h-4"/> ESTA SEMANA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-serif text-purple-900">{kpis.thisWeek.count} <span className="text-sm text-purple-600/70">prendas</span></p>
                  <p className="text-sm font-bold text-purple-700 mt-1">{formatCurrency(kpis.thisWeek.amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border-emerald-200 bg-emerald-50/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-emerald-600 flex items-center gap-2"><Calendar className="w-4 h-4"/> ESTE MES</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-serif text-emerald-900">{kpis.thisMonth.count} <span className="text-sm text-emerald-600/70">prendas</span></p>
                  <p className="text-sm font-bold text-emerald-700 mt-1">{formatCurrency(kpis.thisMonth.amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MÓDULO 2: DESGLOSE POR CATEGORÍA */}
          <Card className="rounded-xl shadow-sm border-gray-200 lg:col-span-1">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-bold text-gray-900">Mix de Ventas (Este Mes)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                <div className="p-4 hover:bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-lg"><Scissors className="w-4 h-4 text-rose-600" /></div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Alta Costura</p>
                      <p className="text-xs text-gray-500">{categories['Alta Costura'].count} prendas ingresadas</p>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-rose-700">{formatCurrency(categories['Alta Costura'].amount)}</span>
                </div>
                
                <div className="p-4 hover:bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg"><Package className="w-4 h-4 text-amber-600" /></div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Arreglos & Ajustes</p>
                      <p className="text-xs text-gray-500">{categories['Arreglos'].count} prendas ingresadas</p>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-amber-700">{formatCurrency(categories['Arreglos'].amount)}</span>
                </div>

                <div className="p-4 hover:bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg"><Factory className="w-4 h-4 text-indigo-600" /></div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Mayorista / B2B</p>
                      <p className="text-xs text-gray-500">{categories['Mayorista'].count} lotes ingresados</p>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-indigo-700">{formatCurrency(categories['Mayorista'].amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MÓDULO 3: GRÁFICO DE TENDENCIA */}
          <Card className="rounded-xl shadow-sm border-gray-200 lg:col-span-2">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2"><BarChart4 className="w-5 h-5"/> Tendencia de Ingresos (6 Meses)</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 flex items-end gap-2 md:gap-6 w-full pt-4">
                {trend.map((t: any) => {
                  const heightPercent = maxTrendAmount > 0 ? (t.amount / maxTrendAmount) * 100 : 0;
                  return (
                    <div key={t.key} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-gray-900 text-white text-[10px] px-3 py-1 rounded shadow-lg transition-opacity whitespace-nowrap z-10 text-center font-bold">
                        {formatCurrency(t.amount)}<br/>
                        <span className="font-normal text-gray-300">{t.count} prendas</span>
                      </div>
                      <div 
                        className="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-sm"
                        style={{ height: \`\${heightPercent}%\`, minHeight: t.amount > 0 ? '10%' : '0%' }}
                      />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-3">{t.key}</span>
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
              <CardTitle className="text-lg font-bold text-emerald-900">Informe Analítico de Tendencias</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-emerald-600 mt-1">Sugerencias basadas en el flujo comercial</CardDescription>
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
`;

fs.writeFileSync(path.join(__dirname, 'src/app/admin/statistics/intake/page.tsx'), pageCode);

console.log("Created Intake Dashboard Files");
