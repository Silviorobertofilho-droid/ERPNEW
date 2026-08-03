import {
  DollarSign,
  ShoppingCart,
  Receipt,
  TrendingUp,
  AlertTriangle,
  Package,
  Store,
  ArrowUpRight,
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { formatCurrency } from '@/utils/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { LoadingScreen } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { RevenueChart, DonutChart, SimpleBarChart } from '@/components/charts/Charts';

export function Dashboard() {
  const { data, loading } = useDashboardData();

  if (loading || !data) return <LoadingScreen />;

  const faturamentoTrend = data.faturamentoOntem > 0
    ? ((data.faturamentoHoje - data.faturamentoOntem) / data.faturamentoOntem) * 100
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do desempenho do seu e-commerce em tempo real"
        actions={
          <>
            <button className="btn-secondary">
              <Store size={16} /> Todos os Marketplaces
            </button>
            <button className="btn-primary">
              <ArrowUpRight size={16} /> Exportar Relatório
            </button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Faturamento Hoje"
          value={formatCurrency(data.faturamentoHoje)}
          icon={<DollarSign size={18} />}
          trend={faturamentoTrend}
          trendLabel="vs. ontem"
          accentColor="#10b981"
        />
        <StatCard
          label="Faturamento Mensal"
          value={formatCurrency(data.faturamentoMensal)}
          icon={<TrendingUp size={18} />}
          trendLabel="Mês atual"
          accentColor="#3b82f6"
        />
        <StatCard
          label="Lucro Mensal"
          value={formatCurrency(data.lucroMensal)}
          icon={<Receipt size={18} />}
          trendLabel="Receitas - Despesas"
          accentColor={data.lucroMensal >= 0 ? '#10b981' : '#ef4444'}
        />
        <StatCard
          label="Ticket Médio"
          value={formatCurrency(data.ticketMedio)}
          icon={<ShoppingCart size={18} />}
          trendLabel={`${data.totalPedidos} pedidos no mês`}
          accentColor="#f59e0b"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-400 flex items-center justify-center">
              <ShoppingCart size={18} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Pedidos Hoje</p>
              <p className="text-xl font-bold text-white">{data.pedidosHoje}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Estoque Baixo</p>
              <p className="text-xl font-bold text-white">{data.estoqueBaixo.length} produtos</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
              <Package size={18} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Faturamento Ontem</p>
              <p className="text-xl font-bold text-white">{formatCurrency(data.faturamentoOntem)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Faturamento vs. Despesas" subtitle="Últimos 14 dias" />
          <RevenueChart data={data.revenueChart} />
        </Card>
        <Card>
          <CardHeader title="Marketplace Performance" subtitle="Participação no faturamento" />
          <DonutChart data={data.marketplaceData} />
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top products */}
        <Card className="lg:col-span-1">
          <CardHeader title="Produtos Mais Vendidos" subtitle="Por quantidade" />
          <div className="space-y-3">
            {data.topProdutos.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-surface-4 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.quantity} unidades · {formatCurrency(p.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Estoque baixo */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Estoque Baixo"
            subtitle="Produtos abaixo do mínimo"
            action={<Badge color="amber">{data.estoqueBaixo.length} itens</Badge>}
          />
          <div className="space-y-3">
            {data.estoqueBaixo.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.product?.name ?? '—'}</p>
                  <p className="text-xs text-zinc-500">SKU: {item.product?.sku ?? '—'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-red-400">{item.quantity}</p>
                  <p className="text-xs text-zinc-600">mín: {item.min_quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent orders */}
        <Card className="lg:col-span-1">
          <CardHeader title="Pedidos Recentes" subtitle="Últimas movimentações" />
          <div className="space-y-2">
            {data.recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-2 py-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-zinc-400">{order.number}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-medium text-white">{formatCurrency(Number(order.total))}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Marketplace bar chart */}
      <Card>
        <CardHeader title="Faturamento por Marketplace" subtitle="Total acumulado" />
        <SimpleBarChart data={data.marketplaceBarData} />
      </Card>
    </div>
  );
}
