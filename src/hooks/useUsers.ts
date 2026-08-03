import { useEffect, useState, useCallback } from 'react';
import type { SystemUser, SystemUserFormData } from '@/types';
import { fetchUsers, createUser, updateUser, calculateUserStats } from '@/services/users';

export function useUsers() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveUser = useCallback(
    async (user: SystemUser | null, formData: SystemUserFormData) => {
      if (user) {
        await updateUser(user.id, formData);
      } else {
        await createUser(formData);
      }
      await load();
    },
    [load],
  );

  const stats = calculateUserStats(users);

  return { users, loading, error, stats, saveUser, reload: load };
}
