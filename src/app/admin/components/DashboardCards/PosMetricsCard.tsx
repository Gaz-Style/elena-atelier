'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowUpRight, Wallet, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PosMetricsCardProps {
  data?: {
    isOpen: boolean;
    openedAt: string | null;
    openedBy: string | null;
    openingAmount: number;
    expectedCash: number;
    salesCount: number;
  };
  isLoading?: boolean;
}

export default function PosMetricsCard({ data, isLoading }: PosMetricsCardProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(val);
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

  const isOpen = data?.isOpen ?? false;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="bg-white border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between overflow-hidden relative group">
        {/* Hover Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <CardContent className="p-6 relative z-10 flex-grow flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 group-hover:scale-110 transition-transform duration-300">
              <ShoppingBag className="w-5 h-5" />
            </div>

            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isOpen
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/40'
                : 'bg-amber-50 text-amber-700 border border-amber-200/40'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isOpen ? 'Caja Abierta' : 'Caja Cerrada'}
            </div>
          </div>

          <div className="mt-8 space-y-1">
            <span className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest block">Terminal POS & Caja</span>
            <h3 className="font-serif text-3xl text-zinc-900 font-semibold tracking-tight">
              {isOpen ? formatCurrency(data?.expectedCash || 0) : '$0'}
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              {isOpen 
                ? `${data?.salesCount} transacciones en el turno` 
                : 'Inicia el turno de venta showroom'}
            </p>
          </div>

          {isOpen && (
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-zinc-500" />
                <span>Apertura: <strong className="text-zinc-600">{formatCurrency(data?.openingAmount || 0)}</strong></span>
              </div>
              <div>
                <span>Por: <strong className="text-zinc-600">{data?.openedBy}</strong></span>
              </div>
            </div>
          )}

          {!isOpen && (
            <div className="mt-6 p-3 bg-amber-50/50 border border-amber-100/60 rounded-xl flex items-center gap-2 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>Se requiere apertura de caja para emitir boletas y registrar ventas.</span>
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t border-zinc-100 bg-zinc-50/40 flex items-center justify-between z-10 group-hover:bg-zinc-50 transition-colors">
          <Link 
            href={isOpen ? "/admin/pos" : "/admin/caja"} 
            className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5 w-full"
          >
            <span>{isOpen ? 'Ir al Punto de Venta' : 'Abrir Caja Diaria'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
