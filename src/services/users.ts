import { supabase } from '@/database/client';
import type { SystemUser, SystemUserFormData } from '@/types';

export async function fetchUsers(): Promise<SystemUser[]> {
  const { data, error } = await supabase
    .from('system_users')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createUser(payload: SystemUserFormData): Promise<SystemUser | null> {
  const { data, error } = await supabase
    .from('system_users')
    .insert({ ...payload, last_access: null })
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateUser(
  id: string,
  payload: Partial<SystemUserFormData>,
): Promise<SystemUser | null> {
  const { data, error } = await supabase
    .from('system_users')
    .update(payload)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function calculateUserStats(users: SystemUser[]) {
  const active = users.filter((u) => u.status === 'ativo').length;
  const admins = users.filter((u) => u.role === 'administrador').length;
  return { total: users.length, active, admins };
}

export function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
}
