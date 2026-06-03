'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ERP Mapping Helper
async function createAutomatedJournalEntry(supabase: any, label: string, amount: number, date: string, type: 'expense' | 'fixed') {
  try {
    const mapping: { [key: string]: string } = {
      'Arriendo': '5.2.1.01.01.000',
      'Gasto Común': '5.2.1.01.03.000',
      'Luz': '5.2.1.02.02.000',
      'Agua': '5.2.1.02.01.000',
      'Gas': '5.2.1.02.03.000',
      'Internet / Telefonía': '5.2.1.02.04.000',
      'Sueldos': '5.2.1.04.01.000',
      'Marketing Digital': '5.2.2.01.01.000',
      'Telas': '5.1.1.01.02.000',
      'Insumos': '5.1.1.01.02.000'
    };
    const accountCode = mapping[label] || '5.2.1.05.01.000';
    const { data: account } = await supabase.from('chart_of_accounts').select('id').eq('code', accountCode).maybeSingle();
    const { data: cashAccount } = await supabase.from('chart_of_accounts').select('id').eq('code', '1.1.1.02.01.000').maybeSingle();
    if (!account || !cashAccount) return;
    
    const { data: entry } = await supabase.from('journal_entries').insert({
      date,
      description: `[V2] ${type === 'fixed' ? 'Costo Fijo' : 'Gasto Var'}: ${label}`,
      state: 'posted'
    }).select().maybeSingle();
    
    if (!entry) return;
    await supabase.from('journal_items').insert([
      { entry_id: entry.id, account_id: account.id, debit: amount, credit: 0 },
      { entry_id: entry.id, account_id: cashAccount.id, debit: 0, credit: amount }
    ]);
  } catch (e) {
    console.error('Accounting sync failed');
  }
}

export async function getCostSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from('company_settings').select('value').eq('key', 'cost_structure').maybeSingle();
  return data?.value || { labor_hourly_rate: 25000, operational_fixed_cost: 0, default_margin_percentage: 15 };
}

export async function saveCostSettings(formData: FormData) {
  const labor_hourly_rate = Number(formData.get('labor_hourly_rate'));
  const operational_fixed_cost = Number(formData.get('operational_fixed_cost'));
  const default_margin_percentage = Number(formData.get('default_margin_percentage'));
  const supabase = await createClient();
  
  // Explicitly target 'key' for upsert conflict resolution
  const { error } = await supabase.from('company_settings')
    .upsert(
      { key: 'cost_structure', value: { labor_hourly_rate, operational_fixed_cost, default_margin_percentage } },
      { onConflict: 'key' }
    );
  
  if (error) return { error: error.message };
  
  revalidatePath('/admin/finance');
  return { success: true };
}

// PROVIDERS
export async function getProviders() {
  const supabase = await createClient();
  const { data } = await supabase.from('providers').select('*').order('business_name', { ascending: true });
  return data || [];
}

// EXPENSES (V2 BRIDGE)
export async function getExpenses(month: number, year: number) {
  const supabase = await createClient();
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0).toISOString();
  const { data } = await supabase.from('expenses').select('*').gte('date', startDate).lte('date', endDate).order('date', { ascending: false });
  return data || [];
}

export async function addExpense(formData: FormData) {
  const category = formData.get('category') as string;
  const amount = Number(formData.get('amount'));
  const description = formData.get('description') as string;
  const date = formData.get('date') as string;
  const supabase = await createClient();
  const { error } = await supabase.from('expenses').insert([{ category, amount, description, date }]);
  if (error) return { error: error.message };
  createAutomatedJournalEntry(supabase, category, amount, date, 'expense');
  revalidatePath('/admin/finance');
  revalidatePath('/admin/finance/expenses');
  return { success: true };
}

export async function updateExpense(id: string, amount: number) {
  const supabase = await createClient();
  const { data: original } = await supabase.from('expenses').select('*').eq('id', id).maybeSingle();
  await supabase.from('expenses').update({ amount }).eq('id', id);
  if (original) createAutomatedJournalEntry(supabase, original.category, amount, original.date, 'expense');
  revalidatePath('/admin/finance');
  revalidatePath('/admin/finance/expenses');
  return { success: true };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  await supabase.from('expenses').delete().eq('id', id);
  revalidatePath('/admin/finance');
  revalidatePath('/admin/finance/expenses');
  return { success: true };
}

export async function deleteExpensesBulk(ids: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.from('expenses').delete().in('id', ids);
  if (error) return { error: error.message };
  revalidatePath('/admin/finance');
  revalidatePath('/admin/finance/expenses');
  return { success: true };
}

export async function clearMonthlyExpenses(month: number, year: number) {
  const supabase = await createClient();
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0).toISOString();
  await supabase.from('expenses').delete().gte('date', startDate).lte('date', endDate);
  revalidatePath('/admin/finance');
  revalidatePath('/admin/finance/expenses');
  return { success: true };
}

export async function getFixedCosts(month: number, year: number) {
  const supabase = await createClient();
  const { data } = await supabase.from('fixed_costs').select('*').eq('month', month).eq('year', year).order('label', { ascending: true });
  return data || [];
}

export async function addFixedCost(formData: FormData) {
  const label = formData.get('label') as string;
  const amount = Number(formData.get('amount'));
  const month = Number(formData.get('month'));
  const year = Number(formData.get('year'));
  const supabase = await createClient();
  const { error } = await supabase.from('fixed_costs').insert([{ label, amount, month, year }]);
  if (error) return { error: error.message };
  const date = new Date(year, month - 1, 15).toISOString();
  createAutomatedJournalEntry(supabase, label, amount, date, 'fixed');
  revalidatePath('/admin/finance');
  revalidatePath('/admin/finance/fixed-costs');
  return { success: true };
}

export async function updateFixedCost(id: string, amount: number) {
  const supabase = await createClient();
  const { data: original } = await supabase.from('fixed_costs').select('*').eq('id', id).maybeSingle();
  await supabase.from('fixed_costs').update({ amount }).eq('id', id);
  if (original) {
    const date = new Date(original.year, original.month - 1, 15).toISOString();
    createAutomatedJournalEntry(supabase, original.label, amount, date, 'fixed');
  }
  revalidatePath('/admin/finance');
  revalidatePath('/admin/finance/fixed-costs');
  return { success: true };
}

export async function deleteFixedCost(id: string) {
  const supabase = await createClient();
  await supabase.from('fixed_costs').delete().eq('id', id);
  revalidatePath('/admin/finance');
  revalidatePath('/admin/finance/fixed-costs');
  return { success: true };
}

export async function deleteFixedCostsBulk(ids: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.from('fixed_costs').delete().in('id', ids);
  if (error) return { error: error.message };
  revalidatePath('/admin/finance');
  revalidatePath('/admin/finance/fixed-costs');
  return { success: true };
}

export async function clearMonthlyFixedCosts(month: number, year: number) {
  const supabase = await createClient();
  await supabase.from('fixed_costs').delete().eq('month', month).eq('year', year);
  revalidatePath('/admin/finance');
  revalidatePath('/admin/finance/fixed-costs');
  return { success: true };
}

export async function initializeMonthlyCosts(month: number, year: number, type: 'fixed' | 'variable') {
  const fixedDefaults = ['Arriendo', 'Gasto Común', 'Luz', 'Agua', 'Gas', 'Internet / Telefonía', 'Sueldos', 'Marketing Digital'];
  const varDefaults = ['Telas', 'Hilos / Agujas', 'Reparaciones', 'Insumos Taller', 'Otros'];
  const defaults = type === 'fixed' ? fixedDefaults : varDefaults;
  const table = type === 'fixed' ? 'fixed_costs' : 'expenses';
  const supabase = await createClient();
  const inserts = defaults.map(label => {
    if (type === 'fixed') return { label, amount: 0, month, year };
    return { category: label, amount: 0, description: 'Carga inicial', date: new Date(year, month - 1, 1).toISOString() };
  });
  const { error } = await supabase.from(table).insert(inserts);
  if (error) return { error: error.message };
  revalidatePath('/admin/finance');
  revalidatePath(`/admin/finance/${type === 'fixed' ? 'fixed-costs' : 'expenses'}`);
  return { success: true };
}

// PURCHASE LEDGER ACTIONS (V2)
export async function getRecentDocuments() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('purchase_ledger')
    .select('*, providers(business_name, rut)')
    .order('created_at', { ascending: false })
    .limit(10);
  return data || [];
}

export async function registerPurchaseDocument(formData: FormData) {
  const supabase = await createClient();
  
  const dateStr = formData.get('date') as string; // YYYY-MM-DD
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  const document_type = formData.get('document_type') as string;
  const document_number = formData.get('document_number') as string;
  const provider_rut = formData.get('provider_rut') as string;
  const provider_name = formData.get('provider_name') as string;
  const description = formData.get('description') as string;
  const total_amount = Number(formData.get('total_amount'));
  const category = formData.get('category') as string; // 'fixed' | 'variable'
  const expense_item = formData.get('expense_item') as string;

  // 1. Calculate Tax Breakdown (19% IVA)
  const net_amount = Math.round(total_amount / 1.19);
  const vat_amount = total_amount - net_amount;

  // 2. Ensure Provider Exists & Get ID
  let provider_id;
  const { data: existingProvider } = await supabase.from('providers').select('id').eq('rut', provider_rut).maybeSingle();
  
  if (existingProvider) {
    provider_id = existingProvider.id;
  } else {
    const { data: newProvider } = await supabase.from('providers').insert([{ 
      rut: provider_rut, 
      business_name: provider_name 
    }]).select().maybeSingle();
    provider_id = newProvider?.id;
  }

  if (!provider_id) return { error: "No se pudo identificar o crear al proveedor." };

  const purchaseItemsRaw = formData.get('purchase_items') as string;
  let purchaseItems: any[] = [];
  if (purchaseItemsRaw) {
    try {
      purchaseItems = JSON.parse(purchaseItemsRaw);
    } catch (e) {
      console.error("Failed to parse purchase items", e);
    }
  }

  // 3. Prevent Duplicates (Check if Provider + Doc Number already exists)
  const { data: duplicate } = await supabase.from('purchase_ledger')
    .select('id')
    .eq('provider_id', provider_id)
    .eq('document_type', document_type)
    .eq('document_number', document_number)
    .maybeSingle();

  if (duplicate) return { error: `El documento ${document_type} N°${document_number} ya está registrado para este proveedor.` };

  // 4. Save to Ledger V2
  const { data: doc, error: docError } = await supabase.from('purchase_ledger').insert([{
    date: dateStr, 
    provider_id,
    document_type, 
    document_number, 
    description, 
    net_amount,
    vat_amount,
    total_amount, 
    category, 
    expense_item
  }]).select().maybeSingle();

  if (docError || !doc) return { error: docError?.message || "No se pudo registrar el documento en el Ledger." };

  // 4b. Save item lines and increment inventory stock
  if (purchaseItems && purchaseItems.length > 0) {
    const linesToInsert = purchaseItems.map(item => ({
      purchase_id: doc.id,
      inventory_item_id: item.inventory_item_id,
      quantity: Number(item.quantity),
      price_unit: Number(item.price_unit),
      total: Number(item.quantity) * Number(item.price_unit)
    }));

    const { error: linesError } = await supabase.from('purchase_items').insert(linesToInsert);
    if (linesError) console.error("Error saving purchase items detail:", linesError);

    // Update inventory stocks in Supabase
    for (const item of purchaseItems) {
      if (!item.inventory_item_id) continue;
      
      const { data: invItem } = await supabase
        .from('fabric_inventory')
        .select('stock, category')
        .eq('id', item.inventory_item_id)
        .maybeSingle();
      
      if (invItem) {
        const addedQty = Number(item.quantity);
        const newStock = Number(invItem.stock || 0) + addedQty;
        
        const updates: any = { stock: newStock };
        if (invItem.category === 'telas') {
          updates.stock_meters = newStock;
        }

        await supabase
          .from('fabric_inventory')
          .update(updates)
          .eq('id', item.inventory_item_id);
      }
    }
  }

  // 5. Sync with Budget Tables
  if (category === 'variable') {
    await supabase.from('expenses').insert([{
      category: expense_item,
      amount: total_amount,
      description: `[DOC ${document_number}] ${description}`,
      date: dateStr
    }]);
  } else {
    const { data: existing } = await supabase.from('fixed_costs')
      .select('id, amount')
      .eq('label', expense_item)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (existing) {
      await supabase.from('fixed_costs').update({ amount: Number(existing.amount) + total_amount }).eq('id', existing.id);
    } else {
      await supabase.from('fixed_costs').insert([{ label: expense_item, amount: total_amount, month, year }]);
    }
  }

  // 6. Automated Accounting
  createAutomatedJournalEntry(supabase, expense_item, total_amount, dateStr, category as 'expense' | 'fixed');

  revalidatePath('/admin/finance');
  revalidatePath('/admin/finance/fixed-costs');
  revalidatePath('/admin/finance/expenses');
  
  return { success: true };
}

export async function deletePurchaseDocument(id: string) {
  const supabase = await createClient();
  
  // 1. Get doc details to revert changes
  const { data: doc } = await supabase.from('purchase_ledger').select('*').eq('id', id).maybeSingle();
  if (!doc) return { error: "Documento no encontrado" };

  // 2. Revert from Budget Tables
  if (doc.category === 'variable') {
    await supabase.from('expenses').delete().eq('description', `[DOC ${doc.document_number}] ${doc.description}`);
  } else {
    const [yearStr, monthStr, dayStr] = doc.date.split('-');
    const month = parseInt(monthStr);
    const year = parseInt(yearStr);
    
    const { data: existing } = await supabase.from('fixed_costs')
      .select('id, amount')
      .eq('label', doc.expense_item)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (existing) {
      const newAmount = Math.max(0, Number(existing.amount) - Number(doc.total_amount));
      await supabase.from('fixed_costs').update({ amount: newAmount }).eq('id', existing.id);
    }
  }

  // 3. Delete from Ledger
  await supabase.from('purchase_ledger').delete().eq('id', id);

  revalidatePath('/admin/finance');
  revalidatePath('/admin/finance/fixed-costs');
  revalidatePath('/admin/finance/expenses');
  return { success: true };
}

export async function calculateSuggestedRate(hoursPerMonth: number = 160) {
  const supabase = await createClient();
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();

  const { data } = await supabase.from('fixed_costs')
    .select('amount')
    .eq('month', m)
    .eq('year', y);
  
  const totalFixed = data?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
  
  if (totalFixed === 0 || hoursPerMonth === 0) return { rate: 0, totalFixed: 0 };
  
  const suggestedRate = Math.round(totalFixed / hoursPerMonth);
  return { suggestedRate, totalFixed };
}

export async function getSalesMetrics(month: number, year: number) {
  const supabase = await createClient();
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  // 1. Get Net Sales
  const { data: sales } = await supabase.from('sales_ledger')
    .select('total_amount, status')
    .gte('created_at', startDate)
    .lte('created_at', endDate);
    
  const totalGrossSales = sales?.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0) || 0;
  // Net Sales = Gross / 1.19
  const netSales = Math.round(totalGrossSales / 1.19);
  const ivaDebito = totalGrossSales - netSales;

  // 2. Get IVA Crédito from Purchase Ledger
  const { data: purchases } = await supabase.from('purchase_ledger')
    .select('vat_amount')
    .gte('date', startDate.split('T')[0])
    .lte('date', endDate.split('T')[0]);

  const ivaCredito = purchases?.reduce((sum, p) => sum + (Number(p.vat_amount) || 0), 0) || 0;

  // 3. Calculate F29 (Impuesto F29 = Debito - Credito)
  const f29 = Math.max(0, ivaDebito - ivaCredito);

  return { totalGrossSales, netSales, ivaDebito, ivaCredito, f29 };
}
