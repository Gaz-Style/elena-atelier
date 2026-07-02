'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getChartOfAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .order('code', { ascending: true });

  if (error) return [];
  return data;
}

export async function getAnalyticAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('analytic_accounts')
    .select('*')
    .order('name', { ascending: true });

  if (error) return [];
  return data;
}

export async function getJournalEntries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('journal_entries')
    .select(`
      *,
      journal_items (
        *,
        account:chart_of_accounts(name, code),
        analytic:analytic_accounts(name)
      )
    `)
    .order('date', { ascending: false });

  if (error) return [];
  return data;
}

export async function syncSalesLedgerToAccounting() {
  const supabase = await createClient();
  
  // 1. Get accounts
  const { data: accounts } = await supabase.from('chart_of_accounts').select('id, code');
  if (!accounts) return { success: false, error: 'Could not fetch chart of accounts' };
  
  const cashAccount = accounts.find(a => a.code === '1.1.1.02.01.000'); // Banco Local (CLP)
  const revenueAccount = accounts.find(a => a.code === '4.1.1.02.01.000'); // Servicios de Sastrería/Modista
  
  if (!cashAccount || !revenueAccount) {
    return { success: false, error: 'Missing cash or revenue account in chart of accounts' };
  }
  
  // 2. Delete existing Venta journal entries to prevent duplicates (idempotent sync)
  const { error: delErr } = await supabase
    .from('journal_entries')
    .delete()
    .like('description', '[Venta]%');
        
  if (delErr) {
    return { success: false, error: delErr.message };
  }
  
  // 3. Get all sales from sales_ledger
  const { data: allSales } = await supabase.from('sales_ledger').select('*').order('created_at', { ascending: true });
  if (!allSales || allSales.length === 0) {
    return { success: true, synced: 0 };
  }
  
  const mainSales = allSales.filter(s => !s.internal_id.includes('_balance_'));
  const balanceSales = allSales.filter(s => s.internal_id.includes('_balance_'));
  
  let entriesCount = 0;
  
  // 4. Sync Main Sales
  for (const mainSale of mainSales) {
    // Find balance rows for this main sale
    const relatedBalances = balanceSales.filter(b => b.internal_id.startsWith(`${mainSale.internal_id}_balance_`));
    const balancePaidSum = relatedBalances.reduce((sum, b) => sum + (Number(b.paid_amount) || 0), 0);
    
    const initialPaid = (Number(mainSale.paid_amount) || 0) - balancePaidSum;
    
    if (initialPaid > 0) {
      const dateStr = mainSale.created_at.split('T')[0];
      const { data: entry, error: entryErr } = await supabase
        .from('journal_entries')
        .insert({
          date: dateStr,
          description: `[Venta] Pago Inicial/Abono Orden: ${mainSale.internal_id}`,
          state: 'posted'
        })
        .select()
        .maybeSingle();
        
      if (entryErr || !entry) {
        console.error(`Error creating journal entry for ${mainSale.internal_id}:`, entryErr);
        continue;
      }
      
      await supabase.from('journal_items').insert([
        { entry_id: entry.id, account_id: cashAccount.id, debit: initialPaid, credit: 0 },
        { entry_id: entry.id, account_id: revenueAccount.id, debit: 0, credit: initialPaid }
      ]);
      entriesCount++;
    }
  }
  
  // 5. Sync Balance Sales
  for (const balSale of balanceSales) {
    const paidAmount = Number(balSale.paid_amount) || Number(balSale.total_amount) || 0;
    if (paidAmount > 0) {
      const dateStr = balSale.created_at.split('T')[0];
      const baseOrderId = balSale.internal_id.split('_balance_')[0];
      const { data: entry, error: entryErr } = await supabase
        .from('journal_entries')
        .insert({
          date: dateStr,
          description: `[Venta] Pago Saldo Orden: ${baseOrderId}`,
          state: 'posted'
        })
        .select()
        .maybeSingle();
        
      if (entryErr || !entry) {
        console.error(`Error creating journal entry for balance ${balSale.internal_id}:`, entryErr);
        continue;
      }
      
      await supabase.from('journal_items').insert([
        { entry_id: entry.id, account_id: cashAccount.id, debit: paidAmount, credit: 0 },
        { entry_id: entry.id, account_id: revenueAccount.id, debit: 0, credit: paidAmount }
      ]);
      entriesCount++;
    }
  }
  
  revalidatePath('/admin/accounting');
  revalidatePath('/admin/accounting/results');
  revalidatePath('/admin/finance');
  
  return { success: true, synced: entriesCount };
}

