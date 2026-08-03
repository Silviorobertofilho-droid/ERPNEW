import { supabase } from '@/database/client';
import type { Category } from '@/types';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(name: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name })
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}
