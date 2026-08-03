import { BarChart3, Download } from 'lucide-react';
import { useRelatorios } from '@/hooks/useRelatorios';
import { formatCurrency } from '@/utils/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { SimpleBarChart, SimpleAreaChart, DonutChart } from '@/components/charts/Charts';

export function Relatorios() {
  const { data, loading } = useRelatorios();

  if (loading || !data) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Análises e indicadores de desempenho"
        actions={<button className="btn-secondary"><Download size={16} /> Exportar</button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Receita Total" value={formatCurrency(data.totalRevenue)} icon={<BarChart3 size={18} />} accentColor="#10b981" />
        <StatCard label="Despesa Total" value={formatCurrency(data.totalCost)} icon={<BarChart3 size={18} />} accentColor="#ef4444" />
        <StatCard label="Margem Média" value={`${data.avgMargin.toFixed(1)}%`} icon={<BarChart3 size={18} />} accentColor="#3b82f6" />
        <StatCard label="Valor em Estoque" value={formatCurrency(data.totalStockValue)} icon={<BarChart3 size={18} />} accentColor="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Faturamento Diário" subtitle="Últimos 30 dias" />
          <SimpleAreaChart data={data.revenueByDay} height={260} />
        </Card>
        <Card>
          <CardHeader title="Receitas vs. Despesas" subtitle="Distribuição financeira" />
          <DonutChart data={data.donutData} height={260} />
        </Card>
      </div>

      <Card>
        <CardHeader title="Faturamento por Marketplace" subtitle="Comparativo entre canais de venda" />
        <SimpleBarChart data={data.mpBarData} height={300} />
      </Card>

      <Card>
        <CardHeader title="Análise de Margem por Produto" subtitle="Produtos ordenados por margem de lucro" />
        <div className="space-y-2">
          {data.productMargins.map((p, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-sm text-zinc-300 w-48 truncate">{p.name}</span>
              <div className="flex-1 h-2 bg-surface-4 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${p.margin >= 50 ? 'bg-primary-500' : p.margin >= 30 ? 'bg-accent-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(p.margin, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-white w-12 text-right">{p.margin.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
