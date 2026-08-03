import { supabase } from '@/database/client';
import type { Order, OrderWithRelations, OrderItem } from '@/types';

export async function fetchOrders(): Promise<OrderWithRelations[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, marketplace:marketplaces(*), customer:customers(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchRecentOrders(limit = 6): Promise<OrderWithRelations[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, marketplace:marketplaces(*)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);
  if (error) throw error;
  return data ?? [];
}

export async function fetchTopProducts(limit = 50): Promise<
  { product_name: string; quantity: number; total: number }[]
> {
  const { data, error } = await supabase
    .from('order_items')
    .select('product_name, quantity, total')
    .order('quantity', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as { product_name: string; quantity: number; total: number }[];
}

export function aggregateTopProducts(
  items: { product_name: string; quantity: number; total: number }[],
  limit = 5,
): { name: string; quantity: number; total: number }[] {
  const productMap = new Map<string, { name: string; quantity: number; total: number }>();
  items.forEach((item) => {
    const existing = productMap.get(item.product_name) ?? {
      name: item.product_name,
      quantity: 0,
      total: 0,
    };
    existing.quantity += item.quantity;
    existing.total += Number(item.total);
    productMap.set(item.product_name, existing);
  });
  return Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export function calculateOrderStats(orders: OrderWithRelations[]) {
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((s, o) => s + Number(o.total), 0);
  const pending = orders.filter((o) => o.status === 'pendente').length;
  const delivered = orders.filter((o) => o.status === 'entregue').length;
  return { totalRevenue, pending, delivered };
}
