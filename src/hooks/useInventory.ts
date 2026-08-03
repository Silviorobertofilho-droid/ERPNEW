import { useEffect, useState } from 'react';
import type { Inventory, Warehouse, InventoryAggregate } from '@/types';
import { fetchInventory, aggregateInventoryByProduct, calculateInventoryStats } from '@/services/inventory';
import { fetchWarehouses } from '@/services/warehouses';

export function useInventory() {
  const [inventory, setInventory] = useState<(Inventory & { product?: { name: string; sku: string }; warehouse?: Warehouse })[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([fetchInventory(), fetchWarehouses()])
      .then(([inv, whs]) => {
        if (!active) return;
        setInventory(inv);
        setWarehouses(whs);
        setLoading(false);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Erro ao carregar estoque');
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const aggregated: InventoryAggregate[] = aggregateInventoryByProduct(inventory);
  const stats = calculateInventoryStats(inventory);

  return { inventory, warehouses, aggregated, stats, loading, error };
}
