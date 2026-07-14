'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  DollarSign, Users, TrendingUp, ShoppingBag, Settings, Scissors,
  ArrowUpRight, ShieldCheck, Package, Receipt, Activity, FileText,
  Calendar, Wallet, Sparkles, RefreshCw
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardData, getDetailedDashboardData } from '@/app/admin/actions';

// Custom cards
import PosMetricsCard from '@/app/admin/components/DashboardCards/PosMetricsCard';
import CrmMetricsCard from '@/app/admin/components/DashboardCards/CrmMetricsCard';
import AiAgentStatusCard from '@/app/admin/components/DashboardCards/AiAgentStatusCard';

export default function DashboardClient({ 
  initialDetailedData, 
  initialGeneralData 
}: { 
  initialDetailedData: any; 
  initialGeneralData: any;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [detailedData, setDetailedData] = useState<any>(initialDetailedData);
  const [generalData, setGeneralData] = useState<any>(initialGeneralData);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [detailed, general] = await Promise.all([
        getDetailedDashboardData(),
        getDashboardData()
      ]);
      setDetailedData(detailed);
      setGeneralData(general);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Bento Modules
  const operationalModules = [
    { title: 'Agenda de Citas', desc: 'Bloqueos horarios e integración con citas por IA.', href: '/admin/agenda', icon: Calendar, size: 'col-span-1 md:col-span-1', accentColor: 'group-hover:text-emerald-600 group-hover:bg-emerald-50 group-hover:border-emerald-100/80' },
    { title: 'Novias & Eventos Especiales', desc: 'Proyectos de novia, madrina y graduación con contrato y cronograma.', href: '/admin/novias', icon: Sparkles, size: 'col-span-1 md:col-span-1', accentColor: 'group-hover:text-rose-600 group-hover:bg-rose-50 group-hover:border-rose-100/80' },
    { title: 'Gobernanza de Producción', desc: 'Kanban del taller, costuras y plazos.', href: '/admin/production', icon: Scissors, size: 'col-span-1 md:col-span-1', accentColor: 'group-hover:text-emerald-600 group-hover:bg-emerald-50 group-hover:border-emerald-100/80' },
    { title: 'Live Production Board', desc: 'Tiempos de costura para pantallas de taller.', href: '/admin/production-board', icon: Activity, size: 'col-span-1 md:col-span-1', accentColor: 'group-hover:text-emerald-600 group-hover:bg-emerald-50 group-hover:border-emerald-100/80' },
    { title: 'Planificador Semanal', desc: 'Carga de trabajo por costurera y bloqueos.', href: '/admin/planificador', icon: Calendar, size: 'col-span-1 md:col-span-2', accentColor: 'group-hover:text-emerald-600 group-hover:bg-emerald-50 group-hover:border-emerald-100/80' },
    { title: 'Catálogo de Servicios', desc: 'Gestión de productos y oferta comercial.', href: '/admin/catalog', icon: Package, size: 'col-span-1 md:col-span-1', accentColor: 'group-hover:text-emerald-600 group-hover:bg-emerald-50 group-hover:border-emerald-100/80' },
  ];

  const financialModules = [
    { title: 'Planilla de Ventas', desc: 'Libro Mayor de ingresos y caja histórica.', href: '/admin/sales', icon: DollarSign, size: 'col-span-1 md:col-span-1', accentColor: 'group-hover:text-sky-600 group-hover:bg-sky-50 group-hover:border-sky-100/80' },
    { title: 'Presupuestos & Cotizaciones', desc: 'Seguimiento de propuestas enviadas.', href: '/admin/quotes', icon: FileText, size: 'col-span-1 md:col-span-1', accentColor: 'group-hover:text-sky-600 group-hover:bg-sky-50 group-hover:border-sky-100/80' },
    { title: 'Finanzas & Contabilidad', desc: 'Impuestos SII, conciliación y balances P&L.', href: '/admin/finance', icon: DollarSign, size: 'col-span-1 md:col-span-2', accentColor: 'group-hover:text-sky-600 group-hover:bg-sky-50 group-hover:border-sky-100/80' },
    { title: 'Inventario de Taller', desc: 'Metraje de telas, hilos y suministros.', href: '/admin/inventory', icon: Package, size: 'col-span-1 md:col-span-1', accentColor: 'group-hover:text-sky-600 group-hover:bg-sky-50 group-hover:border-sky-100/80' },
    { title: 'Recursos Humanos', desc: 'Vacaciones, personal y nóminas (Buk).', href: '/admin/hr', icon: Users, size: 'col-span-1 md:col-span-1', accentColor: 'group-hover:text-sky-600 group-hover:bg-sky-50 group-hover:border-sky-100/80' },
  ];

  // Framer Motion Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } }
  };

  return (
    <div className="min-h-screen bg-zinc-50/30 font-sans text-zinc-800 selection:bg-zinc-200/60">
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-10">
        
        {/* Upper Dashboard Subheader */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-zinc-200/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-widest font-bold font-sans">Consola de Administración Central</span>
            </div>
            <h1 className="font-serif text-4xl text-zinc-900 tracking-tight font-semibold">Elena Atalier OS</h1>
            <p className="text-zinc-500 text-xs mt-1">
              Sistema Operativo de Gestión de Lujo · Vitacura, Chile
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950 transition-colors flex items-center justify-center gap-2 text-xs shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sincronizar</span>
            </button>
            <div className="text-right">
              <p className="text-[9px] uppercase text-zinc-400 font-bold tracking-widest">Estado de Conexión</p>
              <p className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span> 
                Online
              </p>
            </div>
          </div>
        </div>

        {/* Live KPIs Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              label: 'Ventas del Mes', 
              value: generalData?.kpis?.salesThisMonth ? formatCurrency(generalData.kpis.salesThisMonth) : '$0', 
              trend: 'Mes actual', 
              isTrendUp: true 
            },
            { 
              label: 'Órdenes Activas', 
              value: generalData?.kpis?.activeOrdersCount ?? '0', 
              trend: 'En taller', 
              isTrendUp: true 
            },
            { 
              label: 'Ticket Promedio', 
              value: generalData?.kpis?.avgTicket ? formatCurrency(generalData.kpis.avgTicket) : '$0', 
              trend: 'Showroom', 
              isTrendUp: true 
            },
            { 
              label: 'Interés CRM', 
              value: detailedData?.crm?.avgLeadScore ? `${detailedData.crm.avgLeadScore}%` : '0%', 
              trend: 'WhatsApp', 
              isTrendUp: detailedData?.crm?.avgLeadScore >= 50 
            },
          ].map((stat, i) => (
            <Card key={i} className="bg-white border border-zinc-200/80 p-4 rounded-xl relative overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                <>
                  <p className="text-[9px] uppercase text-zinc-400 tracking-widest font-bold">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <p className="text-xl font-semibold text-zinc-800">{stat.value}</p>
                    <span className="text-[9px] text-zinc-400 tracking-tight font-medium uppercase">{stat.trend}</span>
                  </div>
                </>
            </Card>
          ))}
        </section>

        {/* Real-Time Operational Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PosMetricsCard data={detailedData?.cashRegister} isLoading={false} />
          <CrmMetricsCard data={detailedData?.crm} isLoading={false} />
          <AiAgentStatusCard data={detailedData?.ai} isLoading={false} />
        </section>

        {/* Bento Grid: Categories & Modules */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-12"
        >
          {/* Section: Operación del Taller */}
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 font-sans flex items-center gap-2">
              <span className="w-1 h-3 bg-emerald-500 rounded-full" />
              Gobernanza y Operación del Taller
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {operationalModules.map((mod) => (
                <motion.div key={mod.href} variants={itemVariants} className={mod.size}>
                  <Link href={mod.href} className="block h-full">
                    <Card className="bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-all duration-300 rounded-xl h-full flex flex-col justify-between group cursor-pointer relative overflow-hidden">
                      <CardHeader className="p-5 pb-2">
                        <div className={`w-9 h-9 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-center text-zinc-500 transition-all ${mod.accentColor}`}>
                          <mod.icon className="w-4 h-4" />
                        </div>
                        <CardTitle className="text-sm font-semibold text-zinc-800 mt-4 group-hover:text-zinc-950 transition-colors">
                          {mod.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-zinc-500 mt-1.5 leading-relaxed font-sans font-light">
                          {mod.desc}
                        </CardDescription>
                      </CardHeader>
                      <div className="p-5 pt-0 mt-auto flex items-center justify-end text-[10px] text-zinc-400 font-bold uppercase tracking-wider group-hover:text-zinc-700 transition-colors gap-1">
                        <span>Entrar</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Section: Administración Contable y Financiera */}
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-400 font-sans flex items-center gap-2">
              <span className="w-1 h-3 bg-sky-500 rounded-full" />
              Estructura Financiera y Contable ERP
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {financialModules.map((mod) => (
                <motion.div key={mod.href} variants={itemVariants} className={mod.size}>
                  <Link href={mod.href} className="block h-full">
                    <Card className="bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-all duration-300 rounded-xl h-full flex flex-col justify-between group cursor-pointer relative overflow-hidden">
                      <CardHeader className="p-5 pb-2">
                        <div className={`w-9 h-9 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-center text-zinc-500 transition-all ${mod.accentColor}`}>
                          <mod.icon className="w-4 h-4" />
                        </div>
                        <CardTitle className="text-sm font-semibold text-zinc-800 mt-4 group-hover:text-zinc-950 transition-colors">
                          {mod.title}
                        </CardTitle>
                        <CardDescription className="text-xs text-zinc-500 mt-1.5 leading-relaxed font-sans font-light">
                          {mod.desc}
                        </CardDescription>
                      </CardHeader>
                      <div className="p-5 pt-0 mt-auto flex items-center justify-end text-[10px] text-zinc-400 font-bold uppercase tracking-wider group-hover:text-zinc-700 transition-colors gap-1">
                        <span>Entrar</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Section: Inteligencia & Gobernanza del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            
            {/* Top Products Insights Widget */}
            <motion.div variants={itemVariants} className="col-span-1">
              <Card className="bg-white border border-zinc-200/80 p-5 rounded-xl h-full flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                <div>
                  <h3 className="text-xs uppercase text-zinc-400 tracking-wider font-bold mb-4 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Top Confecciones
                  </h3>
                  {generalData?.topProducts && generalData.topProducts.length > 0 ? (
                    <div className="space-y-2.5">
                      {generalData.topProducts.map((prod: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-zinc-50 border border-zinc-200/50 px-3 py-2 rounded-lg text-xs">
                          <span className="text-zinc-700 truncate max-w-[150px] font-medium">{prod.name}</span>
                          <span className="text-[10px] font-semibold bg-white text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                            {prod.count} pedidos
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">No hay registros de pedidos disponibles.</p>
                  )}
                </div>
                <div className="pt-4 text-[10px] text-zinc-400 font-semibold tracking-wider font-sans uppercase">
                  Datos históricos del taller
                </div>
              </Card>
            </motion.div>

            {/* System Logs & Webhooks Card */}
            <motion.div variants={itemVariants} className="col-span-1">
              <Link href="/admin/logs" className="block h-full">
                <Card className="bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-all duration-300 p-5 rounded-xl h-full flex flex-col justify-between group cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-center text-zinc-500 group-hover:text-purple-600 group-hover:border-purple-100/80 group-hover:bg-purple-50 transition-all">
                      <Settings className="w-4 h-4 animate-[spin_20s_linear_infinite]" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-800 mt-4 group-hover:text-zinc-950 transition-colors">
                      Logs de Sistema & Webhooks
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed font-sans font-light">
                      Monitoreo en vivo de pasarelas de pago, webhooks e interacciones API de Mercado Pago.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-end text-[10px] text-zinc-400 font-bold uppercase tracking-wider group-hover:text-zinc-700 transition-colors gap-1">
                    <span>Ver Logs</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Card>
              </Link>
            </motion.div>

            {/* Crecimiento & Marketing */}
            <motion.div variants={itemVariants} className="col-span-1">
              <Link href="/admin/marketing" className="block h-full">
                <Card className="bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-all duration-300 p-5 rounded-xl h-full flex flex-col justify-between group cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-center text-zinc-500 group-hover:text-amber-600 group-hover:border-amber-100/80 group-hover:bg-amber-50 transition-all">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-800 mt-4 group-hover:text-zinc-950 transition-colors">
                      Crecimiento & Marketing
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed font-sans font-light">
                      Análisis de ROAS de campañas, SEO de autoridad local e influencia en redes sociales.
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-end text-[10px] text-zinc-400 font-bold uppercase tracking-wider group-hover:text-zinc-700 transition-colors gap-1">
                    <span>Analizar</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Card>
              </Link>
            </motion.div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
