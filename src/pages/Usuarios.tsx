import { useState } from 'react';
import { Plus, Edit2, Mail, Clock, Users as UsersIcon } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { formatRelativeTime } from '@/utils/format';
import { ROLE_LABELS, ROLE_COLORS, ROLE_PERMISSIONS, ROLE_OPTIONS } from '@/constants/roles';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { LoadingScreen, EmptyState } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { getUserInitials } from '@/services/users';
import type { SystemUser, SystemUserFormData, UserRole } from '@/types';

export function Usuarios() {
  const { users, loading, stats, saveUser } = useUsers();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description="Gerencie usuários e permissões do sistema"
        actions={
          <button className="btn-primary" onClick={() => { setEditingUser(null); setShowModal(true); }}>
            <Plus size={16} /> Novo Usuário
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total de Usuários" value={`${stats.total}`} icon={<UsersIcon size={18} />} accentColor="#3b82f6" />
        <StatCard label="Usuários Ativos" value={`${stats.active}`} icon={<UsersIcon size={18} />} accentColor="#10b981" />
        <StatCard label="Administradores" value={`${stats.admins}`} icon={<UsersIcon size={18} />} accentColor="#f59e0b" />
      </div>

      <Card>
        {users.length === 0 ? (
          <EmptyState icon={<UsersIcon size={32} />} title="Nenhum usuário cadastrado" />
        ) : (
          <Table headers={['Usuário', 'E-mail', 'Função', 'Permissões', 'Status', 'Último Acesso', '']}>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {getUserInitials(user.name)}
                    </div>
                    <span className="font-medium text-white">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-zinc-400">
                    <Mail size={13} /> {user.email}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge color={ROLE_COLORS[user.role as UserRole]}>{ROLE_LABELS[user.role as UserRole] ?? user.role}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-zinc-500">{ROLE_PERMISSIONS[user.role as UserRole]?.length ?? 0} permissões</span>
                </TableCell>
                <TableCell><StatusBadge status={user.status} /></TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-zinc-500">
                    <Clock size={13} /> {user.last_access ? formatRelativeTime(user.last_access) : 'Nunca'}
                  </span>
                </TableCell>
                <TableCell>
                  <button
                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                    onClick={() => { setEditingUser(user); setShowModal(true); }}
                  >
                    <Edit2 size={15} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>

      {/* Permissions reference */}
      <Card>
        <h3 className="text-sm font-semibold text-white mb-4">Permissões por Função</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.entries(ROLE_PERMISSIONS) as [UserRole, string[]][]).map(([role, perms]) => (
            <div key={role} className="bg-surface-3 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge color={ROLE_COLORS[role]}>{ROLE_LABELS[role]}</Badge>
              </div>
              <ul className="space-y-1.5">
                {perms.map((p, i) => (
                  <li key={i} className="text-xs text-zinc-400 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-600" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <UserModal
        open={showModal}
        onClose={() => setShowModal(false)}
        user={editingUser}
        onSave={saveUser}
      />
    </div>
  );
}

function UserModal({
  open,
  onClose,
  user,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  user: SystemUser | null;
  onSave: (user: SystemUser | null, formData: SystemUserFormData) => Promise<void>;
}) {
  const [form, setForm] = useState<SystemUserFormData>({ name: '', email: '', role: 'operador', status: 'ativo' });
  const [saving, setSaving] = useState(false);

  useState(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    }
  });

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(user, form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? 'Editar Usuário' : 'Novo Usuário'}
      subtitle="Defina dados e permissões"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving || !form.name || !form.email}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Nome</label>
          <input className="input-base w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1.5 block">E-mail</label>
          <input className="input-base w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@empresa.com" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Função</label>
            <select className="input-base w-full" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLE_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-medium mb-1.5 block">Status</label>
            <select className="input-base w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
