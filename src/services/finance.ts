import { supabase } from '@/database/client';
import type {
  Transaction,
  TransactionWithMarketplace,
  FinanceSummary,
  FinanceChartData,
  ExpenseCategory,
} from '@/types';
import { toDateString, toShortLabel } from '@/utils/format';

export async function fetchTransactions(
  limit = 100,
): Promise<TransactionWithMarketplace[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, marketplace:marketplaces(*)')
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export function calculateFinanceSummary(
  transactions: Transaction[],
): FinanceSummary {
  const receitas = transactions
    .filter((t) => t.type === 'receita')
    .reduce((s, t) => s + Number(t.amount), 0);
  const despesas = transactions
    .filter((t) => t.type === 'despesa')
    .reduce((s, t) => s + Number(t.amount), 0);
  return { receitas, despesas, saldo: receitas - despesas };
}

export function buildFinanceChartData(
  transactions: Transaction[],
  days = 14,
): FinanceChartData[] {
  const chartData: FinanceChartData[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = toDateString(d);
    const label = toShortLabel(d);
    const receita = transactions
      .filter((t) => t.date === dStr && t.type === 'receita')
      .reduce((s, t) => s + Number(t.amount), 0);
    const despesa = transactions
      .filter((t) => t.date === dStr && t.type === 'despesa')
      .reduce((s, t) => s + Number(t.amount), 0);
    chartData.push({ date: dStr, label, receita, despesa });
  }
  return chartData;
}

export function calculateExpenseCategories(
  transactions: Transaction[],
  limit = 5,
): ExpenseCategory[] {
  const totalDespesas = transactions
    .filter((t) => t.type === 'despesa')
    .reduce((s, t) => s + Number(t.amount), 0);

  const categoryMap = new Map<string, number>();
  transactions
    .filter((t) => t.type === 'despesa')
    .forEach((t) => {
      categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + Number(t.amount));
    });

  return Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalDespesas > 0 ? (amount / totalDespesas) * 100 : 0,
    }));
}
