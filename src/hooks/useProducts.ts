import { useEffect, useState, useCallback } from 'react';
import type { ProductWithCategory, Category, ProductFormData } from '@/types';
import { fetchProducts, createProduct, updateProduct } from '@/services/products';
import { fetchCategories } from '@/services/categories';

export function useProducts() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveProduct = useCallback(
    async (product: ProductWithCategory | null, formData: ProductFormData) => {
      if (product) {
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }
      await load();
    },
    [load],
  );

  return { products, categories, loading, error, reload: load, saveProduct };
}
