import type { BadgeColor } from '@/components/ui/Badge';

export interface StatusConfig {
  label: string;
  color: BadgeColor;
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  pendente: { label: 'Pendente', color: 'amber' },
  pago: { label: 'Pago', color: 'blue' },
  em_separacao: { label: 'Em Separação', color: 'teal' },
  enviado: { label: 'Enviado', color: 'blue' },
  entregue: { label: 'Entregue', color: 'green' },
  cancelado: { label: 'Cancelado', color: 'red' },
  em_transito: { label: 'Em Trânsito', color: 'blue' },
  recebido: { label: 'Recebido', color: 'green' },
  em_andamento: { label: 'Em Andamento', color: 'amber' },
  concluido: { label: 'Concluído', color: 'green' },
  ativo: { label: 'Ativo', color: 'green' },
  inativo: { label: 'Inativo', color: 'gray' },
};

export const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label]),
);

export const ORDER_STATUS_KEYS = [
  'pendente',
  'pago',
  'em_separacao',
  'enviado',
  'entregue',
  'cancelado',
];

export const PURCHASE_STATUS_KEYS = [
  'pendente',
  'em_transito',
  'recebido',
  'cancelado',
];
