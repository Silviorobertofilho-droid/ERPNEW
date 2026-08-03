import { useEffect, useState, useCallback } from 'react';
import type { PurchaseWithSupplier, PurchaseItem } from '@/types';
import { fetchPurchases, fetchPurchaseItems, calculatePurchaseStats } from '@/services/purchases';

export function usePurchases() {
  const [purchases, setPurchases] = useState<PurchaseWithSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<PurchaseItem[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPurchases();
      setPurchases(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar compras');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openPurchase = useCallback(async (purchaseId: string) => {
    const items = await fetchPurchaseItems(purchaseId);
    setSelectedItems(items);
  }, []);

  const stats = calculatePurchaseStats(purchases);

  return { purchases, loading, error, stats, selectedItems, openPurchase, reload: load };
}
