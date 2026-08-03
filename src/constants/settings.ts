import type { LucideIcon } from 'lucide-react';
import { Building2, Bell, Plug } from 'lucide-react';

export interface SettingCategoryConfig {
  title: string;
  icon: LucideIcon;
  description: string;
}

export const SETTING_CATEGORY_CONFIG: Record<string, SettingCategoryConfig> = {
  geral: { title: 'Dados da Empresa', icon: Building2, description: 'Informações gerais da empresa' },
  notificacoes: { title: 'Notificações', icon: Bell, description: 'Configurações de alertas e notificações' },
  integracoes: { title: 'Integrações', icon: Plug, description: 'Marketplaces e ERPs conectados' },
};

export const SETTING_CATEGORY_DEFAULT: SettingCategoryConfig = {
  title: 'Geral',
  icon: Building2,
  description: '',
};
