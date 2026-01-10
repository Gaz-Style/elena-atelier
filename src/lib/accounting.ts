import { supabase } from './supabase';

export async function getFinancialSummary(month: string) {
    // P&L Calculation logic
    const { data: sales } = await supabase.from('sales_ledger').select('amount').gte('created_at', month);
    const { data: expenses } = await supabase.from('expenses').select('amount').gte('date', month);

    const totalSales = sales?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
    const totalExpenses = expenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    return {
        netProfit: totalSales - totalExpenses,
        totalSales,
        totalExpenses,
        taxLiability: totalSales * 0.19, // IVA Chile
    };
}
