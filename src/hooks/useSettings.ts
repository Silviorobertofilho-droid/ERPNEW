import { useEffect, useState, useCallback } from 'react';
import type { Setting } from '@/types';
import {
  fetchSettings,
  updateSettings,
  groupSettingsByCategory,
  settingsToFormValues,
} from '@/services/settings';

export function useSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchSettings();
      setSettings(data);
      setFormValues(settingsToFormValues(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async () => {
    await updateSettings(formValues);
  }, [formValues]);

  const grouped = groupSettingsByCategory(settings);

  return {
    settings,
    grouped,
    formValues,
    setFormValues,
    loading,
    error,
    save,
    reload: load,
  };
}
