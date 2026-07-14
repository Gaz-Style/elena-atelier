import React from 'react';
import POSWizardClient from './components/POSWizardClient';
import { getCurrentCashRegisterAction } from '@/app/admin/caja/actions';
import { getAtelierConfigAction } from './actions';

export default async function POSPage() {
  const [cajaRes, configRes] = await Promise.all([
    getCurrentCashRegisterAction(),
    getAtelierConfigAction()
  ]);

  const isCajaOpen = !!cajaRes.register;
  const config = configRes || {};

  return <POSWizardClient initialConfig={config} initialCajaOpen={isCajaOpen} />;
}
