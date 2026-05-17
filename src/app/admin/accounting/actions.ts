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
