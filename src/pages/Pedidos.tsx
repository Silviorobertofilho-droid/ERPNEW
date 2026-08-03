import { useState } from 'react';
import { ShoppingCart, Search, Eye } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { STATUS_LABELS, ORDER_STATUS_KEYS } from '@/constants/status';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { LoadingScreen, EmptyState } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import type { OrderWithRelations, OrderItem } from '@/types';

export function Pedidos() {
  const { orders, loading, stats, selectedItems, openOrder } = useOrders();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.number.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleOpenOrder(order: OrderWithRelations) {
    setSelectedOrder(order);
    openOrder(order.id);
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <PageHeader title="Pedidos" description="Gerencie todos os pedidos dos seus marketplaces" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Faturamento Total" value={formatCurrency(stats.totalRevenue)} icon={<ShoppingCart size={18} />} accentColor="#10b981" />
        <StatCard label="Pendentes" value={`${stats.pending} pedidos`} icon={<ShoppingCart size={18} />} accentColor="#f59e0b" />
        <StatCard label="Entregues" value={`${stats.delivered} pedidos`} icon={<ShoppingCart size={18} />} accentColor="#3b82f6" />
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input className="input-base pl-9 w-full" placeholder="Buscar por número ou cliente..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-base" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todos os status</option>
            {ORDER_STATUS_KEYS.map((k) => (
              <option key={k} value={k}>{STATUS_LABELS[k]}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<ShoppingCart size={32} />} title="Nenhum pedido encontrado" />
        ) : (
          <Table headers={['Número', 'Cliente', 'Marketplace', 'Itens', 'Total', 'Status', 'Data', '']}>
            {filtered.map((order) => (
              <TableRow key={order.id} onClick={() => handleOpenOrder(order)}>
                <TableCell className="font-mono text-zinc-400">{order.number}</TableCell>
                <TableCell className="text-white">{order.customer?.name ?? '—'}</TableCell>
                <TableCell>
                  {order.marketplace ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: order.marketplace.color }} />
                      {order.marketplace.name}
                    </span>
                  ) : '—'}
                </TableCell>
                <TableCell>{order.items_count}</TableCell>
                <TableCell className="font-medium text-white">{formatCurrency(Number(order.total))}</TableCell>
                <TableCell><StatusBadge status={order.status} /></TableCell>
                <TableCell className="text-zinc-500">{formatDateTime(order.created_at)}</TableCell>
                <TableCell>
                  <button className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors">
                    <Eye size={15} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>

      {/* Detail modal */}
      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Pedido ${selectedOrder?.number ?? ''}`}
        subtitle={selectedOrder ? formatDateTime(selectedOrder.created_at) : ''}
        maxWidth="max-w-2xl"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Cliente</p>
                <p className="text-sm text-white">{selectedOrder.customer?.name ?? '—'}</p>
                <p className="text-xs text-zinc-500">{selectedOrder.customer?.email ?? ''}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Marketplace</p>
                <p className="text-sm text-white">{selectedOrder.marketplace?.name ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">Status:</span>
              <StatusBadge status={selectedOrder.status} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-medium mb-2">Itens do Pedido</p>
              <OrderItemsTable items={selectedItems} />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/[0.06]">
              <span className="text-sm text-zinc-400">Total do Pedido</span>
              <span className="text-lg font-bold text-white">{formatCurrency(Number(selectedOrder.total))}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function OrderItemsTable({ items }: { items: OrderItem[] }) {
  if (items.length === 0) return <EmptyState title="Nenhum item" />;
  return (
    <Table headers={['Produto', 'Qtd', 'Preço Unit.', 'Total']}>
      {items.map((item) => (
        <TableRow key={item.id}>
          <TableCell className="text-white">{item.product_name}</TableCell>
          <TableCell>{item.quantity}</TableCell>
          <TableCell>{formatCurrency(Number(item.unit_price))}</TableCell>
          <TableCell className="font-medium text-white">{formatCurrency(Number(item.total))}</TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
