'use client';

import React, { useEffect } from 'react';
import { POSProvider, usePOS } from './POSContext';
import WizardHeader from './WizardHeader';
import Step1Customer from './Step1Customer';
import Step2Cart from './Step2Cart';
import Step3Production from './Step3Production';
import Step4Payment from './Step4Payment';
import Step5Confirmation from './Step5Confirmation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEstimatedDatesAction } from '@/app/admin/pos/actions';

function LiveSummaryBar() {
  const { selectedCustomer, cart, estimatedDates, currentStep, setCurrentStep, deadline } = usePOS();
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  if (cart.length === 0) return null;

  const showContinueButton = currentStep === 2 || currentStep === 3;
  const isStep3Disabled = currentStep === 3 && 
    (!cart.every(item => item.assignedOperatorId && item.assignedOperatorId !== 'unassigned') || !deadline);

  const handleContinue = () => {
    if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };
  const formatDeadline = (dateStr: string) => {
    try {
      // Create date and adjust for timezone offset to prevent off-by-one day errors
      const d = new Date(dateStr);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      const weekday = d.toLocaleDateString('es-CL', { weekday: 'long' });
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${weekday} ${day}-${month}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 text-white p-3 px-4 md:px-8 z-50 flex items-center justify-between text-xs md:text-sm animate-in slide-in-from-bottom-2 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col">
          <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Cliente</span>
          <span className="font-medium">{selectedCustomer ? selectedCustomer.full_name : 'No seleccionado'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Total</span>
          <span className="font-bold text-emerald-400">${total.toLocaleString('es-CL')}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-auto">
        {estimatedDates && !deadline && (
          <div className="hidden sm:flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">
            <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mr-2 hidden md:inline">Fecha Sugerida:</span>
            <span className="font-semibold text-white">{new Date(estimatedDates.finalDeliveryDate).toLocaleDateString('es-CL')}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${estimatedDates.isOverbooked ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {estimatedDates.capacityStatus}
            </span>
          </div>
        )}

        {deadline && (
          <div className="flex flex-col text-left">
            <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Entrega</span>
            <span className="font-medium text-zinc-100 capitalize">{formatDeadline(deadline)}</span>
          </div>
        )}

        {showContinueButton && (
          <Button 
            onClick={handleContinue}
            disabled={isStep3Disabled}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:opacity-100 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 text-xs md:text-sm transition-colors border border-emerald-500/20"
          >
            Continuar <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function WizardContent({ initialConfig, initialCajaOpen }: { initialConfig: any, initialCajaOpen: boolean }) {
  const { currentStep, setAtelierConfig, setIsCajaOpen } = usePOS();
  
  useEffect(() => {
    setAtelierConfig(initialConfig);
    setIsCajaOpen(initialCajaOpen);
  }, [initialConfig, initialCajaOpen]);

  const { cart } = usePOS();

  return (
    <div className={`flex flex-col bg-zinc-50/50 ${cart.length > 0 ? 'pb-24' : 'pb-6'}`}>
      <WizardHeader />
      <div className="p-4 md:p-8">
        {currentStep === 1 && <Step1Customer />}
        {currentStep === 2 && <Step2Cart />}
        {currentStep === 3 && <Step3Production />}
        {currentStep === 4 && <Step4Payment />}
        {currentStep === 5 && <Step5Confirmation />}
      </div>
      <LiveSummaryBar />
    </div>
  );
}

export default function POSWizardClient({ initialConfig, initialCajaOpen }: { initialConfig: any, initialCajaOpen: boolean }) {
  return (
    <POSProvider>
      <WizardContent initialConfig={initialConfig} initialCajaOpen={initialCajaOpen} />
    </POSProvider>
  );
}
