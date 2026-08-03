import { supabase } from '@/database/client';
import type { Inventory, InventoryAggregate, Product, Warehouse } from '@/types';

type InventoryWithRelations = Inventory & { product?: Product; warehouse?: Warehouse };

export async function fetchInventory(): Promise<InventoryWithRelations[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, product:products(*), warehouse:warehouses(*)')
    .order('quantity');
  if (error) throw error;
  return data ?? [];
}

export async function fetchLowStock(threshold = 10): Promise<InventoryWithRelations[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, product:products(*)')
    .lt('quantity', threshold)
    .order('quantity');
  if (error) throw error;
  return data ?? [];
}

export function aggregateInventoryByProduct(
  inventory: InventoryWithRelations[],
): InventoryAggregate[] {
  const productMap = new Map<string, InventoryAggregate>();
  inventory.forEach((item) => {
    if (!item.product) return;
    const existing = productMap.get(item.product.id) ?? {
      product: item.product,
      total: 0,
      locations: [],
    };
    existing.total += item.quantity;
    existing.locations.push({
      warehouse: item.warehouse?.name ?? '—',
      qty: item.quantity,
      min: item.min_quantity,
    });
    productMap.set(item.product.id, existing);
  });
  return Array.from(productMap.values()).sort((a, b) => b.total - a.total);
}

export function calculateInventoryStats(inventory: InventoryWithRelations[]) {
  const totalUnits = inventory.reduce((s, i) => s + i.quantity, 0);
  const lowStock = inventory.filter((i) => i.quantity < i.min_quantity).length;
  const outOfStock = inventory.filter((i) => i.quantity === 0).length;
  return { totalUnits, lowStock, outOfStock };
}

export function calculateStockValue(
  inventory: InventoryWithRelations[],
  products: Product[],
): number {
  return inventory.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.product_id);
    return sum + (product ? product.cost_price * item.quantity : 0);
  }, 0);
}
