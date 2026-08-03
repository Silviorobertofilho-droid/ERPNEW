import { useEffect, useState, useCallback } from 'react';
import type { StockCheckWithWarehouse, StockCheckItem, Warehouse, StockCheckFormData } from '@/types';
import {
  fetchStockChecks,
  fetchStockCheckItems,
  createStockCheck,
  calculateStockCheckStats,
} from '@/services/stockChecks';
import { fetchWarehouses } from '@/services/warehouses';

export function useStockChecks() {
  const [checks, setChecks] = useState<StockCheckWithWarehouse[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<StockCheckItem[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [cks, whs] = await Promise.all([fetchStockChecks(), fetchWarehouses()]);
      setChecks(cks);
      setWarehouses(whs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar conferências');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCheck = useCallback(async (checkId: string) => {
    const items = await fetchStockCheckItems(checkId);
    setSelectedItems(items);
  }, []);

  const addCheck = useCallback(
    async (formData: StockCheckFormData) => {
      await createStockCheck(formData);
      await load();
    },
    [load],
  );

  const stats = calculateStockCheckStats(checks);

  return { checks, warehouses, loading, error, stats, selectedItems, openCheck, addCheck, reload: load };
}
