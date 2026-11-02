import React from 'react';
import POSWizardClient from './components/POSWizardClient';
import { getCurrentCashRegisterAction } from '@/app/admin/caja/actions';
import { getAtelierConfigAction, getBudgetAction, getSaleToPayAction } from './actions';

export default async function POSPage({
  searchParams,
}: {
  searchParams?: Promise<{ budgetId?: string; saleId?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const budgetId = resolvedParams?.budgetId;
  const saleId = resolvedParams?.saleId;

  const [cajaRes, configRes, budgetRes, saleRes] = await Promise.all([
    getCurrentCashRegisterAction(),
    getAtelierConfigAction(),
    budgetId ? getBudgetAction(budgetId) : Promise.resolve(null),
    saleId ? getSaleToPayAction(saleId) : Promise.resolve(null),
  ]);

  const isCajaOpen = !!cajaRes.register;
  const config = configRes || {};
  const initialBudget = budgetRes?.success && budgetRes.data ? { id: budgetId, ...budgetRes.data } : null;
  const initialPendingSale = saleRes || null;

  return (
    <POSWizardClient 
      initialConfig={config} 
      initialCajaOpen={isCajaOpen} 
      initialBudget={initialBudget} 
      initialPendingSale={initialPendingSale}
    />
  );
}
