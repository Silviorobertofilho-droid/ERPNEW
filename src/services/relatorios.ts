import { supabase } from '@/database/client';
import type { RelatoriosData, Product, Marketplace, Transaction, Inventory, Order } from '@/types';
import { toDateString, toShortLabel } from '@/utils/format';
import { calculateStockValue, fetchInventory } from './inventory';
import { fetchProducts } from './products';
import { fetchMarketplaces } from './marketplaces';

export async function fetchRelatoriosData(): Promise<RelatoriosData> {
  const [ord, prod, mp, tx, inv] = await Promise.all([
    supabase.from('orders').select('*').neq('status', 'cancelado'),
    fetchProducts(),
    fetchMarketplaces(),
    supabase.from('transactions').select('*'),
    fetchInventory(),
  ]);

  const orders = (ord.data ?? []) as Order[];
  const products = prod as Product[];
  const marketplaces = mp;
  const transactions = (tx.data ?? []) as Transaction[];
  const inventory = inv;

  const revenueByDay: { label: string; value: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = toDateString(d);
    const label = toShortLabel(d);
    const dayRev = transactions
      .filter((t) => t.date === dStr && t.type === 'receita')
      .reduce((s, t) => s + Number(t.amount), 0);
    revenueByDay.push({ label, value: dayRev });
  }

  const mpBarData = marketplaces.map((m) => ({
    label: m.name.split(' ')[0],
    value: orders.filter((o) => o.marketplace_id === m.id).reduce((s, o) => s + Number(o.total), 0),
  }));

  const totalRevenue = transactions.filter((t) => t.type === 'receita').reduce((s, t) => s + Number(t.amount), 0);
  const totalCost = transactions.filter((t) => t.type === 'despesa').reduce((s, t) => s + Number(t.amount), 0);
  const donutData = [
    { name: 'Receitas', value: totalRevenue, color: '#10b981' },
    { name: 'Despesas', value: totalCost, color: '#ef4444' },
  ];

  const productMargins = products
    .map((p) => ({
      name: p.name,
      margin: p.sale_price > 0 ? ((p.sale_price - p.cost_price) / p.sale_price) * 100 : 0,
    }))
    .sort((a, b) => b.margin - a.margin);

  const avgMargin = products.length > 0
    ? products.reduce((s, p) => s + (p.sale_price > 0 ? ((p.sale_price - p.cost_price) / p.sale_price) * 100 : 0), 0) / products.length
    : 0;

  const totalStockValue = calculateStockValue(inventory, products);

  return {
    totalRevenue,
    totalCost,
    avgMargin,
    totalStockValue,
    revenueByDay,
    mpBarData,
    donutData,
    productMargins,
  };
}
