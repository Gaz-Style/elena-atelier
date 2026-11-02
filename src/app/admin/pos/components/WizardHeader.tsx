'use client';

import React from 'react';
import { usePOS } from './POSContext';
import { User, ShoppingCart, Calendar, CreditCard, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WizardHeader() {
  const { currentStep, setCurrentStep, budgetId } = usePOS();

  const steps = [
    { num: 1, label: 'Cliente', icon: User },
    { num: 2, label: 'Servicio', icon: ShoppingCart },
    { num: 3, label: 'Producción', icon: Calendar },
    { num: 4, label: 'Pago', icon: CreditCard },
    { num: 5, label: 'Confirmar', icon: CheckCircle },
  ];

  return (
    <div className="w-full bg-white border-b border-zinc-200 sticky top-0 z-20 px-4 py-2.5">
      {budgetId && (
        <div className="max-w-3xl mx-auto mb-2 flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded">
          <span className="font-medium flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Presupuesto <strong className="font-mono">#{budgetId}</strong> precargado
          </span>
          <span className="text-[11px] text-emerald-600 hidden sm:inline">
            Revisa fecha de entrega y pasa al cobro
          </span>
        </div>
      )}
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {steps.map((step, i) => {
          const isClickable = step.num < currentStep || (budgetId && step.num <= 4 && currentStep !== 5);
          return (
            <React.Fragment key={step.num}>
              <div
                onClick={() => isClickable && setCurrentStep(step.num as any)}
                className={cn(
                  "flex flex-col items-center gap-1.5 relative select-none",
                  isClickable ? "cursor-pointer group" : "cursor-default"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors shadow-sm",
                    currentStep === step.num
                      ? "bg-zinc-900 text-white border-2 border-zinc-900"
                      : currentStep > step.num
                        ? "bg-zinc-100 text-zinc-900 border-2 border-zinc-900 group-hover:bg-zinc-200"
                        : "bg-zinc-50 text-zinc-400 border border-zinc-200"
                  )}
                >
                  <step.icon className="w-4 h-4" />
                </div>
                <span className={cn(
                  "text-[9px] uppercase tracking-wider font-bold hidden md:block transition-colors",
                  currentStep >= step.num ? "text-zinc-800" : "text-zinc-400",
                  isClickable && "group-hover:text-zinc-900"
                )}>
                  {step.label}
                </span>
              </div>

              {i < steps.length - 1 && (
                <div className="flex-1 h-px bg-zinc-200 mx-2 md:mx-4 relative">
                  <div
                    className="absolute left-0 top-0 h-full bg-zinc-900 transition-all duration-300"
                    style={{ width: currentStep > step.num ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
