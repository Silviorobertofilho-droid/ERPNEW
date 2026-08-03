import { supabase } from '@/database/client';
import type { Product, ProductWithCategory, ProductFormData } from '@/types';

export async function fetchProducts(): Promise<ProductWithCategory[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProduct(payload: ProductFormData): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, payload: Partial<ProductFormData>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export function calculateMargin(product: Pick<Product, 'cost_price' | 'sale_price'>): number {
  if (product.sale_price <= 0) return 0;
  return ((product.sale_price - product.cost_price) / product.sale_price) * 100;
}
