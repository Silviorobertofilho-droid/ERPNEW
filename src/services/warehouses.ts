import { supabase } from '@/database/client';
import type { Warehouse } from '@/types';

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const { data, error } = await supabase.from('warehouses').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}
