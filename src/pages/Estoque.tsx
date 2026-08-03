import { useState } from 'react';
import { Warehouse, AlertTriangle, Boxes, TrendingDown } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { formatNumber } from '@/utils/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { LoadingScreen, EmptyState } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';

export function Estoque() {
  const { inventory, warehouses, aggregated, stats, loading } = useInventory();
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  if (loading) return <LoadingScreen />;

  const filtered = warehouseFilter === 'all'
    ? inventory
    : inventory.filter((i) => i.warehouse_id === warehouseFilter);

  const filteredAggregated = warehouseFilter === 'all'
    ? aggregated
    : aggregated.filter((a) => a.locations.some((l) => l.warehouse === warehouses.find((w) => w.id === warehouseFilter)?.name));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Controle de estoque por armazém e produto"
        actions={
          <select className="input-base" value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
            <option value="all">Todos os armazéns</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total em Estoque" value={formatNumber(stats.totalUnits)} icon={<Boxes size={18} />} accentColor="#3b82f6" />
        <StatCard label="Estoque Baixo" value={`${stats.lowStock} produtos`} icon={<AlertTriangle size={18} />} accentColor="#f59e0b" />
        <StatCard label="Sem Estoque" value={`${stats.outOfStock} produtos`} icon={<TrendingDown size={18} />} accentColor="#ef4444" />
      </div>

      <Card>
        <CardHeader title="Estoque por Produto" subtitle="Visão consolidada por armazém" />
        {filteredAggregated.length === 0 ? (
          <EmptyState icon={<Warehouse size={32} />} title="Nenhum item em estoque" />
        ) : (
          <Table headers={['Produto', 'SKU', 'Total', 'Localizações', 'Situação']}>
            {filteredAggregated.map(({ product, total, locations }) => {
              const minTotal = locations.reduce((s, l) => s + l.min, 0);
              const isLow = total < minTotal;
              const isOut = total === 0;
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <span className="font-medium text-white">{product.name}</span>
                  </TableCell>
                  <TableCell className="font-mono text-zinc-400">{product.sku}</TableCell>
                  <TableCell className="font-semibold text-white">{formatNumber(total)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {locations.map((l, i) => (
                        <span key={i} className="text-xs bg-surface-4 text-zinc-400 px-2 py-1 rounded-md">
                          {l.warehouse}: {l.qty}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isOut ? <Badge color="red">Sem Estoque</Badge>
                      : isLow ? <Badge color="amber">Estoque Baixo</Badge>
                      : <Badge color="green">Normal</Badge>}
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        )}
      </Card>
    </div>
  );
}
