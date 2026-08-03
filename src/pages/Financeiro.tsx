import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useFinance } from '@/hooks/useFinance';
import { formatCurrency, formatDate } from '@/utils/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { LoadingScreen, EmptyState } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { RevenueChart } from '@/components/charts/Charts';

export function Financeiro() {
  const { transactions, summary, chartData, expenseCategories, loading } = useFinance();
  const [typeFilter, setTypeFilter] = useState('all');

  if (loading) return <LoadingScreen />;

  const filtered = typeFilter === 'all' ? transactions : transactions.filter((t) => t.type === typeFilter);

  return (
    <div className="space-y-6">
      <PageHeader title="Financeiro" description="Fluxo de caixa e lançamentos financeiros" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Receitas" value={formatCurrency(summary.receitas)} icon={<TrendingUp size={18} />} accentColor="#10b981" />
        <StatCard label="Despesas" value={formatCurrency(summary.despesas)} icon={<TrendingDown size={18} />} accentColor="#ef4444" />
        <StatCard label="Saldo" value={formatCurrency(summary.saldo)} icon={<DollarSign size={18} />} accentColor={summary.saldo >= 0 ? '#10b981' : '#ef4444'} />
      </div>

      <Card>
        <CardHeader title="Fluxo de Caixa" subtitle="Receitas vs. Despesas — últimos 14 dias" />
        <RevenueChart data={chartData} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Lançamentos Recentes</h3>
            <select className="input-base" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          </div>
          {filtered.length === 0 ? (
            <EmptyState icon={<Wallet size={32} />} title="Nenhum lançamento encontrado" />
          ) : (
            <Table headers={['Descrição', 'Categoria', 'Tipo', 'Valor', 'Data']}>
              {filtered.slice(0, 15).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-white">{t.description}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell>
                    <Badge color={t.type === 'receita' ? 'green' : 'red'}>
                      {t.type === 'receita' ? 'Receita' : 'Despesa'}
                    </Badge>
                  </TableCell>
                  <TableCell className={t.type === 'receita' ? 'text-primary-400 font-medium' : 'text-red-400 font-medium'}>
                    {t.type === 'receita' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                  </TableCell>
                  <TableCell className="text-zinc-500">{formatDate(t.date)}</TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="Despesas por Categoria" subtitle="Top 5 categorias" />
          <div className="space-y-3">
            {expenseCategories.map(({ category, amount, percentage }, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-zinc-300">{category}</span>
                  <span className="text-sm font-medium text-white">{formatCurrency(amount)}</span>
                </div>
                <div className="h-2 bg-surface-4 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
                <p className="text-xs text-zinc-600 mt-1">{percentage.toFixed(1)}% do total</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
