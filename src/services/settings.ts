import { supabase } from '@/database/client';
import type { Setting } from '@/types';

export async function fetchSettings(): Promise<Setting[]> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('category, label');
  if (error) throw error;
  return data ?? [];
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);
  if (error) throw error;
}

export async function updateSettings(values: Record<string, string>): Promise<void> {
  const updates = Object.entries(values).map(([key, value]) => updateSetting(key, value));
  await Promise.all(updates);
}

export function groupSettingsByCategory(settings: Setting[]): Record<string, Setting[]> {
  const grouped: Record<string, Setting[]> = {};
  settings.forEach((s) => {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  });
  return grouped;
}

export function settingsToFormValues(settings: Setting[]): Record<string, string> {
  const values: Record<string, string> = {};
  settings.forEach((s) => {
    values[s.key] = s.value;
  });
  return values;
}
