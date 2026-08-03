import { useEffect, useState, useCallback } from 'react';
import type { OrderWithRelations, OrderItem } from '@/types';
import { fetchOrders, fetchOrderItems, calculateOrderStats } from '@/services/orders';

export function useOrders() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openOrder = useCallback(async (orderId: string) => {
    const items = await fetchOrderItems(orderId);
    setSelectedItems(items);
  }, []);

  const stats = calculateOrderStats(orders);

  return { orders, loading, error, stats, selectedItems, openOrder, reload: load };
}
