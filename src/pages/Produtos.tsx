import { useState } from 'react';
import { Plus, Search, Package, Edit2, Trash2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/utils/format';
import { calculateMargin } from '@/services/products';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { LoadingScreen, EmptyState } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import type { ProductWithCategory, Category, ProductFormData } from '@/types';

export function Produtos() {
  const { products, categories, loading, saveProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Gerencie seu catálogo de produtos"
        actions={
          <button className="btn-primary" onClick={() => { setEditingProduct(null); setShowModal(true); }}>
            <Plus size={16} /> Novo Produto
          </button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              className="input-base pl-9 w-full"
              placeholder="Buscar por nome ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input-base"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Package size={32} />} title="Nenhum produto encontrado" description="Ajuste os filtros ou cadastre um novo produto" />
        ) : (
          <Table headers={['Produto', 'SKU', 'Categoria', 'Custo', 'Venda', 'Margem', 'Status', '']}>
            {filtered.map((p) => {
              const margin = calculateMargin(p);
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-4 flex items-center justify-center shrink-0">
                        <Package size={16} className="text-zinc-500" />
                      </div>
                      <span className="font-medium text-white">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-zinc-400">{p.sku}</TableCell>
                  <TableCell>{p.category?.name ?? '—'}</TableCell>
                  <TableCell>{formatCurrency(p.cost_price)}</TableCell>
                  <TableCell className="font-medium text-white">{formatCurrency(p.sale_price)}</TableCell>
                  <TableCell>
                    <Badge color={margin >= 50 ? 'green' : margin >= 30 ? 'blue' : 'amber'}>
                      {margin.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                        onClick={() => { setEditingProduct(p); setShowModal(true); }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        )}
      </Card>

      <ProductModal
        open={showModal}
        onClose={() => setShowModal(false)}
        product={editingProduct}
        categories={categories}
        onSave={saveProduct}
      />
    </div>
  );
}

function ProductModal({
  open,
  onClose,
  product,
  categories,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  product: ProductWithCategory | null;
  categories: Category[];
  onSave: (product: ProductWithCategory | null, formData: ProductFormData) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductFormData>({
    sku: '',
    name: '',
    description: '',
    category_id: '',
    cost_price: 0,
    sale_price: 0,
    status: 'ativo',
  });
  const [saving, setSaving] = useState(false);

  useState(() => {
    if (product) {
      setForm({
        sku: product.sku,
        name: product.name,
        description: product.description ?? '',
        category_id: product.category_id ?? '',
        cost_price: product.cost_price,
        sale_price: product.sale_price,
        status: product.status,
      });
    }
  });

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(product, {
        ...form,
        description: form.description || null,
        category_id: form.category_id || null,
        cost_price: Number(form.cost_price) || 0,
        sale_price: Number(form.sale_price) || 0,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? 'Editar Produto' : 'Novo Produto'}
      subtitle="Preencha os dados do produto"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving || !form.name || !form.sku}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">SKU</label>
            <input className="input-base w-full" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="EL-001" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Status</label>
            <select className="input-base w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Nome</label>
          <input className="input-base w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do produto" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Descrição</label>
          <textarea className="input-base w-full" rows={3} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição do produto" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Categoria</label>
          <select className="input-base w-full" value={form.category_id ?? ''} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">Sem categoria</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Preço de Custo (R$)</label>
            <input type="number" step="0.01" className="input-base w-full" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })} placeholder="0,00" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Preço de Venda (R$)</label>
            <input type="number" step="0.01" className="input-base w-full" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: parseFloat(e.target.value) || 0 })} placeholder="0,00" />
          </div>
        </div>
      </div>
    </Modal>
  );
}
