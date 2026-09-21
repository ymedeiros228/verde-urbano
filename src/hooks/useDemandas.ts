'use client';

import { useQuery } from '@tanstack/react-query';
import {
  DEMANDAS_MOCK,
  MAPA_PONTOS_MOCK,
  type Demanda,
} from '@/lib/data/mock';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';

function mapRow(row: Record<string, unknown>): Demanda {
  return {
    id: String(row.id),
    titulo: String(row.titulo),
    descricao: String(row.descricao || ''),
    local: String(row.local || row.titulo),
    bairro: String(row.bairro),
    tipo: row.tipo as Demanda['tipo'],
    status: row.status as Demanda['status'],
    step: (row.step as Demanda['step']) || 'mapeado',
    votos: Number(row.votos ?? 0),
    urgencia: Number(row.urgencia ?? 50),
    lng: Number(row.lng),
    lat: Number(row.lat),
    foto: row.foto_url ? String(row.foto_url) : undefined,
    badge: row.badge ? String(row.badge) : undefined,
    badgeTone: row.badge_tone as Demanda['badgeTone'],
    necessidades: (row.necessidades as string[]) || [],
    ongRecomendado: Boolean(row.ong_recomendado),
    mutiraoData: row.mutirao_data ? String(row.mutirao_data) : undefined,
  };
}

async function fetchDemandasFeed(): Promise<Demanda[]> {
  if (!isSupabaseConfigured()) {
    return DEMANDAS_MOCK.filter((d) => !d.heatOnly);
  }
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('pontos')
      .select('*')
      .order('urgencia', { ascending: false });
    if (error || !data?.length) return DEMANDAS_MOCK.filter((d) => !d.heatOnly);
    return data.map(mapRow);
  } catch {
    return DEMANDAS_MOCK.filter((d) => !d.heatOnly);
  }
}

async function fetchMapaPontos(): Promise<Demanda[]> {
  if (!isSupabaseConfigured()) return MAPA_PONTOS_MOCK;
  try {
    const feed = await fetchDemandasFeed();
    // densifica com extras locais se o banco ainda for pequeno
    if (feed.length < 10) {
      return [...feed, ...MAPA_PONTOS_MOCK.filter((p) => p.heatOnly)];
    }
    return feed;
  } catch {
    return MAPA_PONTOS_MOCK;
  }
}

export function useDemandas() {
  return useQuery({
    queryKey: ['demandas'],
    queryFn: fetchDemandasFeed,
    initialData: DEMANDAS_MOCK.filter((d) => !d.heatOnly),
    initialDataUpdatedAt: 0,
  });
}

export function useMapaPontos() {
  return useQuery({
    queryKey: ['mapa-pontos'],
    queryFn: fetchMapaPontos,
    initialData: MAPA_PONTOS_MOCK,
    initialDataUpdatedAt: 0,
  });
}
