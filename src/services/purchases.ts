import { supabase } from '@/database/client';
import type { Purchase, PurchaseWithSupplier, PurchaseItem } from '@/types';

export async function fetchPurchases(): Promise<PurchaseWithSupplier[]> {
  const { data, error } = await supabase
    .from('purchases')
    .select('*, supplier:suppliers(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPurchaseItems(purchaseId: string): Promise<PurchaseItem[]> {
  const { data, error } = await supabase
    .from('purchase_items')
    .select('*')
    .eq('purchase_id', purchaseId);
  if (error) throw error;
  return data ?? [];
}

export async function createPurchase(
  payload: {
    number: string;
    supplier_id: string;
    status: string;
    total: number;
    items_count: number;
    expected_date: string | null;
  },
): Promise<Purchase | null> {
  const { data, error } = await supabase
    .from('purchases')
    .insert(payload)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function calculatePurchaseStats(purchases: PurchaseWithSupplier[]) {
  const totalValue = purchases
    .filter((p) => p.status !== 'cancelado')
    .reduce((s, p) => s + Number(p.total), 0);
  const pending = purchases.filter((p) => p.status === 'pendente').length;
  const received = purchases.filter((p) => p.status === 'recebido').length;
  return { totalValue, pending, received };
}

export async function generatePurchaseNumber(): Promise<string> {
  const { count } = await supabase
    .from('purchases')
    .select('id', { count: 'exact', head: true });
  return `COMP-${String((count ?? 0) + 1).padStart(6, '0')}`;
}
