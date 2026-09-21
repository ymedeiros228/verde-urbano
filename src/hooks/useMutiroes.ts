'use client';

import { useQuery } from '@tanstack/react-query';
import { MUTIROES_MOCK, type Mutirao } from '@/lib/data/mock';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';

async function fetchMutiroes(): Promise<Mutirao[]> {
  if (!isSupabaseConfigured()) return MUTIROES_MOCK;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('mutiroes')
      .select('*')
      .order('data', { ascending: true });

    if (error || !data?.length) return MUTIROES_MOCK;

    return data.map((row) => ({
      id: row.id,
      titulo: row.titulo,
      local: row.local,
      bairro: row.bairro,
      data: row.data,
      horario: row.horario,
      voluntarios: row.voluntarios ?? 0,
      capacidade: row.capacidade ?? 40,
      ong: row.ong,
      tipo: row.tipo,
      demandaId: row.demanda_id,
    }));
  } catch {
    return MUTIROES_MOCK;
  }
}

export function useMutiroes() {
  return useQuery({
    queryKey: ['mutiroes'],
    queryFn: fetchMutiroes,
    initialData: MUTIROES_MOCK,
    initialDataUpdatedAt: 0,
  });
}
