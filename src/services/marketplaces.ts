import { supabase } from '@/database/client';
import type { Marketplace } from '@/types';

export async function fetchMarketplaces(): Promise<Marketplace[]> {
  const { data, error } = await supabase.from('marketplaces').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export function buildMarketplaceData(
  marketplaces: Marketplace[],
  orderTotalsByMarketplace: Map<string, number>,
): { name: string; value: number; color: string }[] {
  return marketplaces.map((mp) => ({
    name: mp.name,
    value: orderTotalsByMarketplace.get(mp.id) ?? 0,
    color: mp.color,
  }));
}

export function buildMarketplaceBarData(
  marketplaceData: { name: string; value: number; color: string }[],
): { label: string; value: number }[] {
  return marketplaceData
    .filter((m) => m.value > 0)
    .map((m) => ({ label: m.name.split(' ')[0], value: m.value }));
}
