import React from 'react';
import POSWizardClient from './components/POSWizardClient';
import { getCurrentCashRegisterAction } from '@/app/admin/caja/actions';
import { getAtelierConfigAction, getBudgetAction } from './actions';

export default async function POSPage({
  searchParams,
}: {
  searchParams?: Promise<{ budgetId?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const budgetId = resolvedParams?.budgetId;

  const [cajaRes, configRes, budgetRes] = await Promise.all([
    getCurrentCashRegisterAction(),
    getAtelierConfigAction(),
    budgetId ? getBudgetAction(budgetId) : Promise.resolve(null),
  ]);

  const isCajaOpen = !!cajaRes.register;
  const config = configRes || {};
  const initialBudget = budgetRes?.success && budgetRes.data ? { id: budgetId, ...budgetRes.data } : null;

  return (
    <POSWizardClient 
      initialConfig={config} 
      initialCajaOpen={isCajaOpen} 
      initialBudget={initialBudget} 
    />
  );
}
