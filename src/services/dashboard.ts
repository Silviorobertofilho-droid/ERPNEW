import { supabase } from '@/database/client';
import type { DashboardData, OrderWithRelations, Inventory } from '@/types';
import { fetchRecentOrders, fetchTopProducts, aggregateTopProducts } from './orders';
import { fetchLowStock } from './inventory';
import { fetchMarketplaces, buildMarketplaceData, buildMarketplaceBarData } from './marketplaces';
import { toDateString, toShortLabel } from '@/utils/format';

export async function fetchDashboardData(): Promise<DashboardData> {
  const today = new Date();
  const todayStr = toDateString(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartStr = toDateString(monthStart);

  const [
    ordersToday,
    ordersYesterday,
    ordersMonth,
    allOrders,
    transactions,
    marketplaces,
  ] = await Promise.all([
    supabase.from('orders').select('total, items_count').gte('created_at', todayStr).neq('status', 'cancelado'),
    supabase.from('orders').select('total').gte('created_at', yesterdayStr).lt('created_at', todayStr).neq('status', 'cancelado'),
    supabase.from('orders').select('total, items_count').gte('created_at', monthStartStr).neq('status', 'cancelado'),
    supabase.from('orders').select('total, items_count, marketplace_id, created_at, status').neq('status', 'cancelado'),
    supabase.from('transactions').select('type, amount, date, marketplace_id'),
    fetchMarketplaces(),
  ]);

  const [estoqueBaixo, topProductsRaw, recentOrders] = await Promise.all([
    fetchLowStock(10),
    fetchTopProducts(50),
    fetchRecentOrders(6),
  ]);

  const faturamentoHoje = (ordersToday.data ?? []).reduce((s, o) => s + Number(o.total), 0);
  const faturamentoOntem = (ordersYesterday.data ?? []).reduce((s, o) => s + Number(o.total), 0);
  const faturamentoMensal = (ordersMonth.data ?? []).reduce((s, o) => s + Number(o.total), 0);
  const totalPedidos = (ordersMonth.data ?? []).length;
  const pedidosHoje = (ordersToday.data ?? []).length;
  const ticketMedio = totalPedidos > 0 ? faturamentoMensal / totalPedidos : 0;

  const monthTransactions = (transactions.data ?? []).filter((t) => t.date >= monthStartStr);
  const receitas = monthTransactions.filter((t) => t.type === 'receita').reduce((s, t) => s + Number(t.amount), 0);
  const despesas = monthTransactions.filter((t) => t.type === 'despesa').reduce((s, t) => s + Number(t.amount), 0);
  const lucroMensal = receitas - despesas;

  const topProdutos = aggregateTopProducts(topProductsRaw, 5);
  const sortedLowStock = estoqueBaixo.sort((a, b) => a.quantity - b.quantity).slice(0, 5);

  const revenueChart: DashboardData['revenueChart'] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = toDateString(d);
    const label = toShortLabel(d);
    const dayReceita = (transactions.data ?? []).filter((t) => t.date === dStr && t.type === 'receita').reduce((s, t) => s + Number(t.amount), 0);
    const dayDespesa = (transactions.data ?? []).filter((t) => t.date === dStr && t.type === 'despesa').reduce((s, t) => s + Number(t.amount), 0);
    revenueChart.push({ date: dStr, label, receita: dayReceita, despesa: dayDespesa });
  }

  const mpMap = new Map<string, number>();
  (allOrders.data ?? []).forEach((o) => {
    if (o.marketplace_id) {
      mpMap.set(o.marketplace_id, (mpMap.get(o.marketplace_id) ?? 0) + Number(o.total));
    }
  });
  const marketplaceData = buildMarketplaceData(marketplaces, mpMap);
  const marketplaceBarData = buildMarketplaceBarData(marketplaceData);

  return {
    faturamentoHoje,
    faturamentoOntem,
    faturamentoMensal,
    lucroMensal,
    totalPedidos,
    ticketMedio,
    pedidosHoje,
    topProdutos,
    estoqueBaixo: sortedLowStock as Inventory[],
    revenueChart,
    marketplaceData,
    marketplaceBarData,
    recentOrders: recentOrders as OrderWithRelations[],
  };
}
