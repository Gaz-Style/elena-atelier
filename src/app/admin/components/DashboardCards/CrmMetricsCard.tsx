'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, ArrowUpRight, MessageSquare, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CrmMetricsCardProps {
  data?: {
    totalChats: number;
    pendingHandoffs: number;
    avgLeadScore: number;
  };
  isLoading?: boolean;
}

export default function CrmMetricsCard({ data, isLoading }: CrmMetricsCardProps) {
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

  const pendingHandoffs = data?.pendingHandoffs ?? 0;
  const leadScore = data?.avgLeadScore ?? 0;

  // Color determine for lead score
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-zinc-500';
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="bg-white border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between overflow-hidden relative group">
        {/* Hover Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <CardContent className="p-6 relative z-10 flex-grow flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100/80 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5" />
            </div>

            {pendingHandoffs > 0 ? (
              <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200/40 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>{pendingHandoffs} Atención Humana</span>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-zinc-100 text-zinc-500 border border-zinc-200">
                <span>Bot Operativo</span>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-1">
            <span className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest block">CRM & WhatsApp</span>
            <div className="flex items-baseline gap-2">
              <h3 className="font-serif text-3xl text-zinc-900 font-semibold tracking-tight">
                {data?.totalChats || 0}
              </h3>
              <span className="text-xs text-zinc-500 font-medium">Conversaciones</span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              Lead Score Promedio:{' '}
              <strong className={getScoreColor(leadScore)}>{leadScore}%</strong>
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 space-y-3">
            {/* Score Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                <span>Interés de Compra Promedio</span>
                <span>{leadScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${leadScore}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    leadScore >= 70 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                      : leadScore >= 40 
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                      : 'bg-zinc-400'
                  }`}
                />
              </div>
            </div>

            {pendingHandoffs > 0 && (
              <div className="text-[11px] text-rose-700 flex items-center gap-1.5 bg-rose-50/50 p-2 rounded-lg border border-rose-100/60">
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                <span>Hay clientas esperando respuesta de un humano.</span>
              </div>
            )}
          </div>
        </CardContent>

        <div className="p-4 border-t border-zinc-100 bg-zinc-50/40 flex items-center justify-between z-10 group-hover:bg-zinc-50 transition-colors">
          <Link 
            href="/admin/crm" 
            className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 group-hover:text-sky-700 transition-colors flex items-center gap-1.5 w-full"
          >
            <span>Bandeja de Entrada CRM</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
