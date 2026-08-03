import { useEffect, useState } from 'react';
import type { TransactionWithMarketplace, FinanceSummary, FinanceChartData, ExpenseCategory } from '@/types';
import {
  fetchTransactions,
  calculateFinanceSummary,
  buildFinanceChartData,
  calculateExpenseCategories,
} from '@/services/finance';

export function useFinance() {
  const [transactions, setTransactions] = useState<TransactionWithMarketplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchTransactions()
      .then((data) => {
        if (!active) return;
        setTransactions(data);
        setLoading(false);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Erro ao carregar lançamentos');
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const summary: FinanceSummary = calculateFinanceSummary(transactions);
  const chartData: FinanceChartData[] = buildFinanceChartData(transactions);
  const expenseCategories: ExpenseCategory[] = calculateExpenseCategories(transactions);

  return { transactions, summary, chartData, expenseCategories, loading, error };
}
