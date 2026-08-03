import type { BadgeColor } from '@/components/ui/Badge';
import type { UserRole } from '@/types';

export { type UserRole };

export const ROLE_LABELS: Record<UserRole, string> = {
  administrador: 'Administrador',
  gerente: 'Gerente',
  operador: 'Operador',
  financeiro: 'Financeiro',
  visualizador: 'Visualizador',
};

export const ROLE_COLORS: Record<UserRole, BadgeColor> = {
  administrador: 'green',
  gerente: 'blue',
  operador: 'teal',
  financeiro: 'amber',
  visualizador: 'gray',
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  administrador: ['Acesso total ao sistema', 'Gerenciar usuários', 'Configurações do sistema'],
  gerente: ['Visualizar e editar todas as operações', 'Relatórios', 'Financeiro'],
  operador: ['Produtos', 'Estoque', 'Pedidos', 'Conferência'],
  financeiro: ['Financeiro', 'Relatórios', 'Compras'],
  visualizador: ['Visualizar relatórios', 'Dashboard'],
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value: value as UserRole,
  label,
}));
