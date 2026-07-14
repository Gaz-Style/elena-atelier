'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from './POSContext';
import { getOperatorsAction, getOperatorsDailyLoadAction, getEstimatedDatesAction } from '@/app/admin/pos/actions';
import { Calendar as CalendarIcon, User, ArrowLeft, ArrowRight, Clock, Calculator, AlertCircle, Unlock, Activity, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Step3Production() {
  const { cart, updateCartItem, setCurrentStep, deadline, setDeadline, estimatedDates, setEstimatedDates } = usePOS();
  const [operators, setOperators] = useState<any[]>([]);
  const [operatorsLoad, setOperatorsLoad] = useState<any[]>([]);
  const [isLoadingOps, setIsLoadingOps] = useState(true);
  const [adminOverride, setAdminOverride] = useState(false);
  const [loadBalancerModal, setLoadBalancerModal] = useState<{ show: boolean, targetOpId: string, itemIndex: number, targetName: string, targetLoad: number, alternatives: any[] } | null>(null);
  const [isCalculatingDates, setIsCalculatingDates] = useState(false);

  useEffect(() => {
    if (!adminOverride && estimatedDates?.finalDeliveryDate) {
      setDeadline(estimatedDates.finalDeliveryDate);
    }
  }, [estimatedDates, adminOverride]);

  useEffect(() => {
    Promise.all([
      getOperatorsAction().catch(err => {
        console.error('Error fetching operators:', err);
        return [];
      }),
      getOperatorsDailyLoadAction().catch(err => {
        console.error('Error fetching daily load:', err);
        return [];
      })
    ]).then(([opsRes, loadRes]) => {
      if (Array.isArray(opsRes)) {
        setOperators(opsRes);
      }
      setOperatorsLoad(loadRes || []);
      setIsLoadingOps(false);
    }).catch(err => {
      console.error('Fatal error loading production assets:', err);
      setIsLoadingOps(false);
    });
  }, []);

  useEffect(() => {
    // Agrupar horas por costurera
    const groupMap: Record<string, { hours: number, opId: string, scheduledDate?: string }> = {};
    cart.forEach(item => {
      const opId = item.assignedOperatorId || 'unassigned';
      const scheduledDate = item.scheduledStartDate;
      const key = `${opId}_${scheduledDate || 'auto'}`;
      const hours = Number(item.details?.hours || 2);
      
      if (!groupMap[key]) {
        groupMap[key] = { hours: 0, opId, scheduledDate: scheduledDate || undefined };
      }
      groupMap[key].hours += hours;
    });

    const totalCartHours = Object.values(groupMap).reduce((sum, g) => sum + g.hours, 0);
    
    if (totalCartHours === 0) {
      setEstimatedDates(null);
      if (!adminOverride) setDeadline('');
      return;
    }

    setIsCalculatingDates(true);
    
    const promises = Object.values(groupMap).map(group => {
      return getEstimatedDatesAction(group.hours, group.opId, group.scheduledDate);
    });

    Promise.all(promises).then(results => {
      let latestResult = results[0];
      for (let i = 1; i < results.length; i++) {
        if (new Date(results[i].finalDeliveryDate) > new Date(latestResult.finalDeliveryDate)) {
          latestResult = results[i];
        }
      }
      setEstimatedDates(latestResult);
      if (!adminOverride) {
        setDeadline(latestResult.finalDeliveryDate);
      }
      setIsCalculatingDates(true);
    }).catch(console.error).finally(() => setIsCalculatingDates(false));

  }, [cart, adminOverride, setEstimatedDates, setDeadline]);

  const handleAssignOp = (itemIndex: number, opId: string) => {
    if (opId === 'unassigned') {
      updateCartItem(itemIndex, { assignedOperatorId: opId });
      return;
    }
    const targetOp = operatorsLoad.find(o => o.id === opId);
    if (targetOp && targetOp.workloadPercentage > 100) {
      const alternatives = operatorsLoad.filter(o => o.id !== opId && o.workloadPercentage < 100);
      setLoadBalancerModal({
        show: true,
        targetOpId: opId,
        itemIndex,
        targetName: targetOp.name,
        targetLoad: targetOp.workloadPercentage,
        alternatives
      });
    } else {
      updateCartItem(itemIndex, { assignedOperatorId: opId });
    }
  };

  const handleSetDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeadline(e.target.value);
  };

  const allAssigned = cart.every(item => item.assignedOperatorId && item.assignedOperatorId !== 'unassigned');

  if (isLoadingOps) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-in fade-in duration-500">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <h3 className="font-serif text-xl text-zinc-800">Calculando disponibilidad...</h3>
        <p className="text-zinc-500 text-sm">Consultando agendas de costureras y carga de taller</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="font-serif text-2xl text-zinc-900 mb-2">Gobernanza de Taller</h2>
        <p className="text-zinc-500 text-sm">Asigna costureras y define la fecha de entrega de la orden.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-4 md:p-6 space-y-6">
        
        {/* Asignación de Costureras */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            Asignación por Prenda
          </h3>
          <div className="space-y-3">
            {cart.map((item, idx) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-lg gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                  <p className="text-xs text-zinc-500">{item.category}</p>
                </div>
                <select
                  value={item.assignedOperatorId || 'unassigned'}
                  onChange={(e) => handleAssignOp(idx, e.target.value)}
                  className="bg-white border border-zinc-200 text-sm rounded-md px-3 py-1.5 min-w-[180px]"
                >
                  <option value="unassigned">Sin asignar</option>
                  {operators.map(op => {
                    const opLoad = operatorsLoad.find(o => o.id === op.id);
                    const loadText = opLoad ? ` (Carga: ${opLoad.workloadPercentage}%)` : '';
                    return (
                      <option key={op.id} value={op.id}>
                        {op.name}{loadText}
                      </option>
                    );
                  })}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Carga General del Taller */}
        {estimatedDates && (() => {
          const totalCartHours = cart.reduce((sum, item) => sum + Number(item.details?.hours || 2), 0);
          const capacity = estimatedDates.dailyCapacity || 24;
          const backlog = estimatedDates.backlogHours || 0;
          const combinedHours = backlog + totalCartHours;
          const workloadPct = Math.round((combinedHours / capacity) * 100);
          
          let barColor = 'bg-emerald-500';
          let textColor = 'text-emerald-700';
          let statusText = 'Capacidad Óptima: Espacio disponible en la jornada.';
          
          if (workloadPct > 70 && workloadPct <= 100) {
            barColor = 'bg-amber-500';
            textColor = 'text-amber-700';
            statusText = 'Capacidad Intermedia: Jornada con carga moderada.';
          } else if (workloadPct > 100) {
            barColor = 'bg-rose-500';
            textColor = 'text-rose-700';
            statusText = 'Capacidad Completa: Jornada sobre-asignada. Se sugiere re-agendar.';
          }

          return (
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <span>Carga del Taller</span>
                <span className="font-bold text-zinc-900">{combinedHours} / {capacity} horas ({workloadPct}%)</span>
              </div>
              <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.min(workloadPct, 100)}%` }}
                />
              </div>
              <p className={`text-xs font-medium ${textColor}`}>
                {statusText}
              </p>
            </div>
          );
        })()}

        <div className="border-t border-zinc-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              Fecha de Entrega Estimada
            </h3>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 text-xs ${adminOverride ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700' : 'text-zinc-500 hover:text-zinc-900'}`}
              onClick={() => setAdminOverride(!adminOverride)}
            >
              <Unlock className="w-3 h-3 mr-1.5" />
              {adminOverride ? 'Override Activo' : 'Forzar Fecha'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
               <div className="flex items-center gap-2 text-emerald-800 mb-2">
                 <Calculator className="w-4 h-4" />
                 <span className="text-xs font-bold uppercase tracking-widest">Cálculo del Sistema</span>
               </div>
               {isCalculatingDates ? (
                 <div className="flex items-center gap-2 text-sm text-emerald-600 animate-pulse">
                   Calculando en base a capacidad de taller...
                 </div>
               ) : estimatedDates ? (
                 <div className="space-y-1">
                   <p className="text-2xl font-bold text-emerald-900 capitalize">
                     {new Date(estimatedDates.finalDeliveryDate).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                   </p>
                   <p className="text-xs text-emerald-700">
                     Inicio estimado: {new Date(estimatedDates.productionStartDate).toLocaleDateString('es-CL')}
                   </p>
                 </div>
               ) : (
                 <p className="text-sm text-emerald-700">Agrega prendas para ver fecha sugerida.</p>
               )}
             </div>

             <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-lg border border-zinc-200 flex items-center justify-center flex-shrink-0 text-emerald-600">
                 <Clock className="w-5 h-5" />
               </div>
               <div className="flex-1">
                 <label className="block text-xs font-medium text-zinc-700 mb-1">
                   Fecha límite acordada {adminOverride && <span className="text-amber-600 font-bold">(Forzada)</span>}
                 </label>
                 <input 
                   type="datetime-local" 
                   value={deadline ? deadline.substring(0, 16) : ''}
                   onChange={handleSetDate}
                   disabled={!adminOverride}
                   className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-sm disabled:opacity-50 disabled:bg-zinc-100"
                 />
               </div>
             </div>
          </div>
          
          {estimatedDates?.isOverbooked && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>El taller presenta sobrecarga de trabajo para la fecha calculada. Sugiere mover la entrega a una fecha posterior si es posible.</p>
            </div>
          )}
        </div>

        {/* Resumen de Totales */}
        {cart.length > 0 && (() => {
          const total = cart.reduce((sum, item) => sum + item.price, 0);
          const subtotal = Math.round(total / 1.19);
          const iva = total - subtotal;
          return (
            <div className="border-t border-zinc-100 pt-4 space-y-1.5">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-400">
                <span>IVA (19%)</span>
                <span>${iva.toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-2xl font-serif pt-3 border-t border-zinc-100">
                <span>Total</span>
                <span>${total.toLocaleString('es-CL')}</span>
              </div>
            </div>
          );
        })()}

        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="px-4" onClick={() => setCurrentStep(2)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button 
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white" 
            onClick={() => setCurrentStep(4)}
            disabled={!allAssigned || !deadline}
          >
            Ir a Pago <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

      </div>

      {/* Load Balancer Modal */}
      {loadBalancerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-50 rounded-full">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold">Sobrecarga de Taller</h3>
            </div>
            
            <p className="text-sm text-zinc-600 mb-6">
              Estás intentando asignar más trabajo a <strong className="text-zinc-900">{loadBalancerModal.targetName}</strong>, 
              pero su carga proyectada para hoy ya está al <strong className="text-red-600">{loadBalancerModal.targetLoad}%</strong>.
            </p>

            {loadBalancerModal.alternatives.length > 0 && (
              <div className="mb-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Costureras Disponibles</p>
                {loadBalancerModal.alternatives.map(alt => (
                  <Button 
                    key={alt.id}
                    variant="outline" 
                    className="w-full justify-between hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                    onClick={() => {
                      updateCartItem(loadBalancerModal.itemIndex, { assignedOperatorId: alt.id });
                      setLoadBalancerModal(null);
                    }}
                  >
                    <span>Asignar a {alt.name}</span>
                    <span className="text-xs px-2 py-1 bg-zinc-100 rounded-full">Carga: {alt.workloadPercentage}%</span>
                  </Button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                className="flex-1"
                onClick={() => setLoadBalancerModal(null)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  updateCartItem(loadBalancerModal.itemIndex, { assignedOperatorId: loadBalancerModal.targetOpId });
                  setLoadBalancerModal(null);
                }}
              >
                Forzar Asignación
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
