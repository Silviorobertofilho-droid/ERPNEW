import { type ReactNode } from 'react';
import { STATUS_CONFIG } from '@/constants/status';

export type BadgeColor = 'gray' | 'green' | 'blue' | 'amber' | 'red' | 'teal';

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorMap: Record<BadgeColor, string> = {
  gray: 'bg-white/[0.06] text-zinc-400 border-white/[0.08]',
  green: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  blue: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

export function Badge({ children, color = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${colorMap[color]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'gray' as const };
  return <Badge color={config.color}>{config.label}</Badge>;
}
