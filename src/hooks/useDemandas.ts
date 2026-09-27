'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  DEMANDAS_MOCK,
  MAPA_PONTOS_MOCK,
  type Demanda,
} from '@/lib/data/mock';
import {
  LOCAL_PONTOS_EVENT,
  mergeWithLocal,
} from '@/lib/localPontos';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';

export function mapRow(row: Record<string, unknown>): Demanda {
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
    autor: row.autor_nome ? { nome: String(row.autor_nome) } : undefined,
    criadoEm: row.created_at ? String(row.created_at) : undefined,
  };
}

async function fetchDemandasFeed(): Promise<Demanda[]> {
  let base: Demanda[];
  if (!isSupabaseConfigured()) {
    base = DEMANDAS_MOCK.filter((d) => !d.heatOnly);
  } else {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pontos')
        .select('*')
        .order('urgencia', { ascending: false });
      if (error || !data?.length) {
        base = DEMANDAS_MOCK.filter((d) => !d.heatOnly);
      } else {
        base = data.map(mapRow);
      }
    } catch {
      base = DEMANDAS_MOCK.filter((d) => !d.heatOnly);
    }
  }
  return mergeWithLocal(base).filter((d) => !d.heatOnly);
}

async function fetchMapaPontos(): Promise<Demanda[]> {
  let base: Demanda[];
  if (!isSupabaseConfigured()) {
    base = MAPA_PONTOS_MOCK;
  } else {
    try {
      const feed = await fetchDemandasFeed();
      if (feed.length < 10) {
        base = [
          ...feed,
          ...MAPA_PONTOS_MOCK.filter((p) => p.heatOnly),
        ];
      } else {
        base = feed;
      }
    } catch {
      base = MAPA_PONTOS_MOCK;
    }
  }
  return mergeWithLocal(base);
}

function useInvalidateLocalPontos() {
  const qc = useQueryClient();
  useEffect(() => {
    function onLocal() {
      void qc.invalidateQueries({ queryKey: ['demandas'] });
      void qc.invalidateQueries({ queryKey: ['mapa-pontos'] });
    }
    window.addEventListener(LOCAL_PONTOS_EVENT, onLocal);
    window.addEventListener('storage', onLocal);
    return () => {
      window.removeEventListener(LOCAL_PONTOS_EVENT, onLocal);
      window.removeEventListener('storage', onLocal);
    };
  }, [qc]);
}

export function useDemandas() {
  useInvalidateLocalPontos();
  return useQuery({
    queryKey: ['demandas'],
    queryFn: fetchDemandasFeed,
    // sem localStorage no 1º render (igual ao servidor); o refetch no cliente junta os locais
    initialData: () => DEMANDAS_MOCK.filter((d) => !d.heatOnly),
    initialDataUpdatedAt: 0,
  });
}

export function useMapaPontos() {
  useInvalidateLocalPontos();
  return useQuery({
    queryKey: ['mapa-pontos'],
    queryFn: fetchMapaPontos,
    initialData: () => MAPA_PONTOS_MOCK,
    initialDataUpdatedAt: 0,
  });
}
