import { useState } from 'react';
import { Plus, ClipboardCheck, CheckCircle2, Clock } from 'lucide-react';
import { useStockChecks } from '@/hooks/useStockChecks';
import { formatDateTime, formatDate } from '@/utils/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { LoadingScreen, EmptyState } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import type { StockCheckWithWarehouse, StockCheckItem } from '@/types';

export function Conferencia() {
  const { checks, warehouses, loading, stats, selectedItems, openCheck, addCheck } = useStockChecks();
  const [showModal, setShowModal] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<StockCheckWithWarehouse | null>(null);

  function handleOpenCheck(check: StockCheckWithWarehouse) {
    setSelectedCheck(check);
    openCheck(check.id);
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conferência de Estoque"
        description="Auditorias e contagens de estoque"
        actions={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Nova Conferência
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ClipboardCheck size={18} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total de Conferências</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Em Andamento</p>
              <p className="text-xl font-bold text-white">{stats.inProgress}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Concluídas</p>
              <p className="text-xl font-bold text-white">{stats.completed}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Histórico de Conferências" subtitle="Todas as auditorias de estoque" />
        {checks.length === 0 ? (
          <EmptyState icon={<ClipboardCheck size={32} />} title="Nenhuma conferência registrada" />
        ) : (
          <Table headers={['Número', 'Armazém', 'Auditor', 'Status', 'Itens', 'Criado em', 'Concluído em']}>
            {checks.map((check) => (
              <TableRow key={check.id} onClick={() => handleOpenCheck(check)}>
                <TableCell className="font-mono text-zinc-400">{check.number}</TableCell>
                <TableCell className="text-white">{check.warehouse?.name ?? '—'}</TableCell>
                <TableCell>{check.auditor}</TableCell>
                <TableCell><StatusBadge status={check.status} /></TableCell>
                <TableCell>{check.stock_check_items?.length ?? '—'}</TableCell>
                <TableCell>{formatDateTime(check.created_at)}</TableCell>
                <TableCell>{check.completed_at ? formatDate(check.completed_at) : '—'}</TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>

      {/* Detail modal */}
      <Modal
        open={!!selectedCheck}
        onClose={() => setSelectedCheck(null)}
        title={`Conferência ${selectedCheck?.number ?? ''}`}
        subtitle={selectedCheck?.warehouse?.name}
        maxWidth="max-w-3xl"
      >
        {selectedItems.length > 0 ? (
          <StockCheckItemsTable items={selectedItems} />
        ) : (
          <EmptyState title="Nenhum item conferido" />
        )}
      </Modal>

      {/* New check modal */}
      <NewCheckModal
        open={showModal}
        onClose={() => setShowModal(false)}
        warehouses={warehouses}
        onCreate={addCheck}
      />
    </div>
  );
}

function StockCheckItemsTable({ items }: { items: StockCheckItem[] }) {
  return (
    <Table headers={['Produto', 'Esperado', 'Contado', 'Diferença']}>
      {items.map((item) => (
        <TableRow key={item.id}>
          <TableCell className="text-white">{item.product_name}</TableCell>
          <TableCell>{item.expected_quantity}</TableCell>
          <TableCell>{item.counted_quantity ?? '—'}</TableCell>
          <TableCell>
            <Badge color={item.difference === 0 ? 'green' : item.difference > 0 ? 'blue' : 'red'}>
              {item.difference > 0 ? `+${item.difference}` : item.difference}
            </Badge>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}

function NewCheckModal({
  open,
  onClose,
  warehouses,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  warehouses: { id: string; name: string }[];
  onCreate: (formData: { warehouse_id: string; auditor: string; notes: string | null }) => Promise<void>;
}) {
  const [warehouseId, setWarehouseId] = useState('');
  const [auditor, setAuditor] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!warehouseId || !auditor) return;
    setSaving(true);
    try {
      await onCreate({ warehouse_id: warehouseId, auditor, notes: notes || null });
      setWarehouseId('');
      setAuditor('');
      setNotes('');
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova Conferência de Estoque"
      subtitle="Inicie uma auditoria de estoque"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving || !warehouseId || !auditor}>
            {saving ? 'Criando...' : 'Iniciar Conferência'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Armazém</label>
          <select className="input-base w-full" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
            <option value="">Selecione um armazém</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Auditor Responsável</label>
          <input className="input-base w-full" value={auditor} onChange={(e) => setAuditor(e.target.value)} placeholder="Nome do responsável" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Observações</label>
          <textarea className="input-base w-full" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações sobre a conferência" />
        </div>
      </div>
    </Modal>
  );
}
