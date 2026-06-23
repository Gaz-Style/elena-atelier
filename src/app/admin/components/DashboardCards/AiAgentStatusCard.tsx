'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BrainCircuit, ArrowUpRight, Cpu, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AiAgentStatusCardProps {
  data?: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    totalTokens: number;
    activeAgentsCount: number;
  };
  isLoading?: boolean;
}

export default function AiAgentStatusCard({ data, isLoading }: AiAgentStatusCardProps) {
  const formatTokens = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return String(num);
  };

  if (isLoading) {
    return (
      <Card className="bg-white border border-zinc-200/80 shadow-sm h-full flex flex-col justify-between overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 bg-zinc-100 rounded-xl animate-pulse" />
            <div className="h-6 w-20 bg-zinc-100 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-1/3 bg-zinc-100 rounded animate-pulse" />
            <div className="h-8 w-2/3 bg-zinc-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="p-6 border-t border-zinc-100 h-14 bg-zinc-50/50" />
      </Card>
    );
  }

  const failedCount = data?.failed ?? 0;
  const isHealthy = failedCount === 0;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="bg-white border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between overflow-hidden relative group">
        {/* Hover Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <CardContent className="p-6 relative z-10 flex-grow flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/80 group-hover:scale-110 transition-transform duration-300">
              <BrainCircuit className="w-5 h-5" />
            </div>

            {failedCount > 0 ? (
              <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200/40 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{failedCount} Fallos Críticos</span>
              </div>
            ) : data?.processing && data.processing > 0 ? (
              <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200/40">
                <Activity className="w-3.5 h-3.5 animate-spin text-purple-500" />
                <span>Procesando</span>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-zinc-100 text-zinc-500 border border-zinc-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Agentes Saludables</span>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-1">
            <span className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest block">Orquestación de IA</span>
            <div className="flex items-baseline gap-2">
              <h3 className="font-serif text-3xl text-zinc-900 font-semibold tracking-tight">
                {formatTokens(data?.totalTokens || 0)}
              </h3>
              <span className="text-xs text-zinc-500 font-medium">Tokens consumidos</span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              {data?.activeAgentsCount || 0} Agentes Autónomos en ejecución
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 grid grid-cols-2 gap-4 text-xs text-zinc-500">
            <div className="bg-zinc-50/60 p-2 rounded-lg border border-zinc-100 flex flex-col">
              <span className="text-[9px] uppercase text-zinc-400 font-semibold">Procesadas con éxito</span>
              <span className="text-sm font-bold text-zinc-700 mt-1">{data?.completed || 0}</span>
            </div>
            <div className="bg-zinc-50/60 p-2 rounded-lg border border-zinc-100 flex flex-col">
              <span className="text-[9px] uppercase text-zinc-400 font-semibold">Tareas en Cola</span>
              <span className="text-sm font-bold text-zinc-700 mt-1">{(data?.pending || 0) + (data?.processing || 0)}</span>
            </div>
          </div>
        </CardContent>

        <div className="p-4 border-t border-zinc-100 bg-zinc-50/40 flex items-center justify-between z-10 group-hover:bg-zinc-50 transition-colors">
          <Link 
            href="/admin/ai-agents" 
            className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 group-hover:text-purple-700 transition-colors flex items-center gap-1.5 w-full"
          >
            <span>Monitorear Orquestador</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
