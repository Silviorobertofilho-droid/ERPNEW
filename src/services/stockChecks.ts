import { supabase } from '@/database/client';
import type { StockCheck, StockCheckWithWarehouse, StockCheckItem, StockCheckFormData } from '@/types';

export async function fetchStockChecks(): Promise<StockCheckWithWarehouse[]> {
  const { data, error } = await supabase
    .from('stock_checks')
    .select('*, warehouse:warehouses(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchStockCheckItems(stockCheckId: string): Promise<StockCheckItem[]> {
  const { data, error } = await supabase
    .from('stock_check_items')
    .select('*')
    .eq('stock_check_id', stockCheckId);
  if (error) throw error;
  return data ?? [];
}

export async function createStockCheck(payload: StockCheckFormData): Promise<StockCheck | null> {
  const { count } = await supabase
    .from('stock_checks')
    .select('id', { count: 'exact', head: true });
  const number = `CONF-${String((count ?? 0) + 1).padStart(5, '0')}`;

  const { data, error } = await supabase
    .from('stock_checks')
    .insert({
      number,
      warehouse_id: payload.warehouse_id,
      auditor: payload.auditor,
      notes: payload.notes,
      status: 'em_andamento',
    })
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function calculateStockCheckStats(checks: StockCheckWithWarehouse[]) {
  const inProgress = checks.filter((c) => c.status === 'em_andamento').length;
  const completed = checks.filter((c) => c.status === 'concluido').length;
  return { total: checks.length, inProgress, completed };
}
