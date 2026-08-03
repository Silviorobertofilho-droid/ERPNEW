import { useEffect, useState } from 'react';
import type { RelatoriosData } from '@/types';
import { fetchRelatoriosData } from '@/services/relatorios';

export function useRelatorios() {
  const [data, setData] = useState<RelatoriosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchRelatoriosData()
      .then((d) => { if (active) { setData(d); setLoading(false); } })
      .catch((e) => { if (active) { setError(e instanceof Error ? e.message : 'Erro'); setLoading(false); } });
    return () => { active = false; };
  }, []);

  return { data, loading, error };
}
